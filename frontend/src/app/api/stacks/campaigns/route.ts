import { NextResponse } from 'next/server';
import { fetchCallReadOnlyFunction, cvToValue, Cl } from '@stacks/transactions';
import { extractClarityCampaign, type CampaignData } from '@/lib/stacks-utils';
import deployments from '@/generated/deployments.json';

export const revalidate = 5; // Cache for 5 seconds

export async function GET() {
  try {
    const contractEntry = (deployments as any)?.contracts?.['crowdfund-v2'] || (deployments as any)?.contracts?.crowdfund;
    const contractId: string = contractEntry?.contract_id || 'ST3E6N4PVNF8H0BJVQQR5A6KA9HMD9DDV5SW988C9.crowdfund-v2';
    const dot = contractId.lastIndexOf('.');
    const contractAddress = contractId.slice(0, dot);
    const contractName = contractId.slice(dot + 1);

    // 1. Fetch total campaigns count
    const countRes = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-campaign-count',
      functionArgs: [],
      network: 'testnet',
      senderAddress: contractAddress,
    });

    const countVal = cvToValue(countRes);
    const totalCount = Number(countVal?.value ?? 0);

    if (totalCount <= 0) {
      return NextResponse.json({ campaigns: [], total: 0 });
    }

    // 2. Fetch all campaigns in parallel
    const promises: Promise<CampaignData | null>[] = [];
    for (let id = 1; id <= totalCount; id++) {
      promises.push(
        fetchCallReadOnlyFunction({
          contractAddress,
          contractName,
          functionName: 'get-campaign',
          functionArgs: [Cl.uint(id)],
          network: 'testnet',
          senderAddress: contractAddress,
        })
          .then((raw) => {
            const val = cvToValue(raw);
            return extractClarityCampaign(id, val);
          })
          .catch((err) => {
            console.warn(`Server proxy failed to fetch campaign #${id}:`, err);
            return null;
          })
      );
    }

    const results = await Promise.all(promises);
    const valid = results.filter((c): c is CampaignData => c !== null);
    
    // Sort newest first
    valid.sort((a, b) => b.id - a.id);

    // Convert bigints to strings for JSON serialization
    const serialized = valid.map((c) => ({
      ...c,
      targetStx: c.targetStx.toString(),
      raisedStx: c.raisedStx.toString(),
    }));

    return NextResponse.json({ campaigns: serialized, total: totalCount });
  } catch (err: any) {
    console.error('Failed to proxy campaigns:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
