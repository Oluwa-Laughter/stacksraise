"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { Cl } from '@stacks/transactions';
import { CampaignCard } from './CampaignCard';
import {
  type CampaignData,
  extractClarityUint,
  extractClarityCampaign,
  getCampaignStatus,
} from '../lib/stacks-utils';
import { crowdfund_getCampaign } from '../generated/contracts';
import { useCrowdfund_GetCampaignCount } from '../generated/hooks';
import deployments from '../generated/deployments.json';

interface CampaignFeedProps {
  currentBlock: number;
  onOpenCreate: () => void;
  onSelectCampaignToFund: (campaign: CampaignData) => void;
  onCampaignsLoaded?: (campaigns: CampaignData[]) => void;
}

type FilterTab = 'ALL' | 'ACTIVE' | 'TARGET_REACHED' | 'EXPIRED';

export function CampaignFeed({
  currentBlock,
  onOpenCreate,
  onSelectCampaignToFund,
  onCampaignsLoaded,
}: CampaignFeedProps) {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { call: fetchCount } = useCrowdfund_GetCampaignCount();

  const contractDeployed = Boolean((deployments as any)?.contracts?.crowdfund?.contract_id);

  const loadAllCampaigns = useCallback(async (manual: boolean = false) => {
    if (manual) setIsRefreshing(true);
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Fetch total count from on-chain getter
      const countRes = await fetchCount([]);
      const totalCountBig = extractClarityUint(countRes);
      const totalCount = totalCountBig !== null ? Number(totalCountBig) : 0;

      if (totalCount === 0) {
        setCampaigns([]);
        onCampaignsLoaded?.([]);
        return;
      }

      // 2. Fetch each campaign dynamically from ID 1 to totalCount
      const promises: Promise<CampaignData | null>[] = [];
      for (let id = 1; id <= totalCount; id++) {
        promises.push(
          crowdfund_getCampaign([Cl.uint(id)])
            .then((raw) => extractClarityCampaign(id, raw))
            .catch((err) => {
              console.warn(`Failed to fetch campaign #${id}:`, err);
              return null;
            })
        );
      }

      const results = await Promise.all(promises);
      const validCampaigns = results.filter((c): c is CampaignData => c !== null);
      
      // Sort newest campaign first
      validCampaigns.sort((a, b) => b.id - a.id);

      setCampaigns(validCampaigns);
      onCampaignsLoaded?.(validCampaigns);
    } catch (err: any) {
      console.warn('Failed to fetch on-chain campaigns:', err);
      // If contract is not yet deployed or RPC returned error, handle gracefully
      setErrorMsg(
        err?.message ||
          'Could not fetch on-chain campaigns. Verify your network connection and contract deployment.'
      );
      setCampaigns([]);
      onCampaignsLoaded?.([]);
    } finally {
      setLoading(false);
      if (manual) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, [fetchCount, onCampaignsLoaded]);

  useEffect(() => {
    loadAllCampaigns();
  }, [loadAllCampaigns]);

  // Filter campaigns according to active tab
  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab === 'ALL') return true;
    const status = getCampaignStatus(c, currentBlock);
    return status === activeTab;
  });

  return (
    <div>
      {/* Header controls & tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl overflow-x-auto">
          {(
            [
              { key: 'ALL', label: 'All Campaigns', count: campaigns.length },
              {
                key: 'ACTIVE',
                label: 'Active',
                count: campaigns.filter((c) => getCampaignStatus(c, currentBlock) === 'ACTIVE').length,
              },
              {
                key: 'TARGET_REACHED',
                label: 'Target Reached',
                count: campaigns.filter(
                  (c) => getCampaignStatus(c, currentBlock) === 'TARGET_REACHED'
                ).length,
              },
              {
                key: 'EXPIRED',
                label: 'Ended / Missed',
                count: campaigns.filter((c) => getCampaignStatus(c, currentBlock) === 'EXPIRED').length,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === tab.key ? 'bg-orange-50 text-[#FF5500]' : 'bg-slate-200/60 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Refresh button */}
        <button
          onClick={() => loadAllCampaigns(true)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-600 hover:text-[#0F172A] hover:border-slate-300 shadow-sm transition-colors self-start sm:self-auto"
        >
          <svg
            className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#FF5500]' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Sync State</span>
        </button>
      </div>

      {/* Contract not deployed notice */}
      {!contractDeployed && (
        <div className="p-4 mb-6 bg-orange-50 border border-orange-200 rounded-xl text-xs font-mono text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
            <span>
              <strong>Contract status:</strong> Ready to deploy to Stacks Testnet. Run{' '}
              <code className="bg-orange-100/80 px-1.5 py-0.5 rounded text-[#FF5500]">
                stacksdapp deploy --network testnet --yes
              </code>
            </span>
          </div>
          <button
            onClick={onOpenCreate}
            className="px-3 py-1.5 bg-[#FF5500] hover:bg-[#E04B00] text-white rounded-lg text-xs font-semibold whitespace-nowrap"
          >
            Create First Campaign
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && campaigns.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-20 bg-slate-200 rounded" />
                <div className="h-5 w-16 bg-slate-100 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-8 w-36 bg-slate-200 rounded" />
                <div className="h-2 w-full bg-slate-100 rounded-full" />
              </div>
              <div className="h-14 bg-slate-50 rounded-lg" />
              <div className="h-10 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State Card (Strict Rule: Zero mock data, prompt user to create first on-chain campaign) */}
      {!loading && campaigns.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-14 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-[#FF5500] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] font-instrument">
            No Live Campaigns Found On-Chain
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            Zero mock data is loaded. Be the first to initiate a Bitcoin block-height secured crowdfunding campaign on Stacks Testnet!
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenCreate}
              className="px-5 py-2.5 rounded-lg bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create First Campaign</span>
            </button>
            <button
              onClick={() => loadAllCampaigns(true)}
              className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Check Again
            </button>
          </div>
        </div>
      )}

      {/* Filtered Empty State (e.g., no active or no ended campaigns) */}
      {!loading && campaigns.length > 0 && filteredCampaigns.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
          No campaigns match the &quot;{activeTab}&quot; filter.
        </div>
      )}

      {/* Grid of Dynamic Campaigns */}
      {!loading && filteredCampaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              currentBlock={currentBlock}
              onContributeClick={onSelectCampaignToFund}
              onRefresh={() => loadAllCampaigns(false)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
