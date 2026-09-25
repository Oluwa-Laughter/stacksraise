"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';
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

export type FilterTab = 'ALL' | 'ACTIVE' | 'TARGET_REACHED' | 'EXPIRED';

interface CampaignFeedProps {
  currentBlock: number;
  onOpenCreate: () => void;
  onSelectCampaignToFund: (campaign: CampaignData) => void;
  onCampaignsLoaded?: (campaigns: CampaignData[]) => void;
  activeZone?: FilterTab;
  onZoneChange?: (zone: FilterTab) => void;
  refreshTrigger?: number;
}

export function CampaignFeed({
  currentBlock,
  onOpenCreate,
  onSelectCampaignToFund,
  onCampaignsLoaded,
  activeZone,
  onZoneChange,
  refreshTrigger,
}: CampaignFeedProps) {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [localActiveTab, setLocalActiveTab] = useState<FilterTab>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeTab = activeZone ?? localActiveTab;
  const setActiveTab = (tab: FilterTab) => {
    setLocalActiveTab(tab);
    onZoneChange?.(tab);
  };

  const { call: fetchCount } = useCrowdfund_GetCampaignCount();

  // Stable callback ref to prevent infinite re-render loops
  const onCampaignsLoadedRef = useRef(onCampaignsLoaded);
  useEffect(() => {
    onCampaignsLoadedRef.current = onCampaignsLoaded;
  }, [onCampaignsLoaded]);

  const contractDeployed = Boolean(
    (deployments as any)?.contracts?.['crowdfund-v2']?.contract_id ||
    (deployments as any)?.contracts?.crowdfund?.contract_id
  );

  const loadAllCampaigns = useCallback(
    async (manual: boolean = false) => {
      if (manual) setIsRefreshing(true);
      setErrorMsg(null);

      try {
        // 1. Try server-side internal proxy first (adblocker-safe and single round-trip)
        try {
          const res = await fetch('/api/stacks/campaigns', { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (data?.campaigns && Array.isArray(data.campaigns)) {
              const parsed: CampaignData[] = data.campaigns.map((c: any) => ({
                ...c,
                targetStx: BigInt(c.targetStx),
                raisedStx: BigInt(c.raisedStx),
              }));
              setCampaigns(parsed);
              onCampaignsLoadedRef.current?.(parsed);
              return;
            }
          }
        } catch (proxyErr) {
          console.warn('API proxy fallback to direct node RPC:', proxyErr);
        }

        // 2. Direct client-side contract reads fallback
        const countRes = await fetchCount([]);
        const totalCountBig = extractClarityUint(countRes);
        const totalCount = totalCountBig !== null ? Number(totalCountBig) : 0;

        if (totalCount === 0) {
          setCampaigns([]);
          onCampaignsLoadedRef.current?.([]);
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
        onCampaignsLoadedRef.current?.(validCampaigns);
      } catch (err: any) {
        console.warn('Failed to fetch on-chain campaigns:', err);
        setErrorMsg(
          err?.message ||
            'Could not fetch on-chain campaigns. Verify your network connection and contract deployment.'
        );
      } finally {
        setInitialLoading(false);
        if (manual) {
          setTimeout(() => setIsRefreshing(false), 500);
        }
      }
    },
    [fetchCount]
  );

  // Load once on mount, then poll smoothly every 30s without flickering skeletons
  useEffect(() => {
    loadAllCampaigns(false);

    const interval = setInterval(() => {
      loadAllCampaigns(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadAllCampaigns]);

  // Refresh feed whenever modal reports an on-chain mutation
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      loadAllCampaigns(true);
    }
  }, [refreshTrigger, loadAllCampaigns]);

  // Filter campaigns according to active tab
  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab === 'ALL') return true;
    const status = getCampaignStatus(c, currentBlock);
    return status === activeTab;
  });

  return (
    <div>
      {/* Header controls & tabs */}
      {/* Header controls: Zone Status & Sync Button */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
            Showing Zone:
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-[#0F172A] shadow-xs">
            {activeTab === 'ALL' && `All Campaigns (${campaigns.length})`}
            {activeTab === 'ACTIVE' && `Active (${filteredCampaigns.length})`}
            {activeTab === 'TARGET_REACHED' && `Target Reached (${filteredCampaigns.length})`}
            {activeTab === 'EXPIRED' && `Ended / Missed (${filteredCampaigns.length})`}
          </span>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => loadAllCampaigns(true)}
          disabled={isRefreshing}
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

      {/* Initial Loading Skeletons — only shown on very first mount */}
      {initialLoading && campaigns.length === 0 && (
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
      {!initialLoading && campaigns.length === 0 && (
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

      {/* Filtered Empty State */}
      {!initialLoading && campaigns.length > 0 && filteredCampaigns.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
          No campaigns match the &quot;{activeTab}&quot; filter.
        </div>
      )}

      {/* Grid of Dynamic Campaigns */}
      {!initialLoading && filteredCampaigns.length > 0 && (
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
