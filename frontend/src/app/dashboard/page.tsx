"use client";
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import { StatsBanner } from '../../components/StatsBanner';
import { CampaignFeed, type FilterTab } from '../../components/CampaignFeed';
import { CreateCampaignModal } from '../../components/CreateCampaignModal';
import { FundCampaignModal } from '../../components/FundCampaignModal';
import { type CampaignData, getCampaignStatus } from '../../lib/stacks-utils';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Route zone mapping: all | active | funded | ended
  const zoneParam = searchParams.get('zone') || 'all';

  const zoneMapToFilter: Record<string, FilterTab> = {
    all: 'ALL',
    active: 'ACTIVE',
    funded: 'TARGET_REACHED',
    ended: 'EXPIRED',
  };

  const filterMapToZone: Record<FilterTab, string> = {
    ALL: 'all',
    ACTIVE: 'active',
    TARGET_REACHED: 'funded',
    EXPIRED: 'ended',
  };

  const currentFilter: FilterTab = zoneMapToFilter[zoneParam] ?? 'ALL';

  const [currentBlock, setCurrentBlock] = useState<number>(0);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFundCampaign, setSelectedFundCampaign] = useState<CampaignData | null>(null);

  const handleZoneSelect = (filter: FilterTab) => {
    const slug = filterMapToZone[filter];
    router.replace(`/dashboard?zone=${slug}`, { scroll: false });
  };

  // Calculate live counts for each zone
  const allCount = campaigns.length;
  const activeCount = campaigns.filter((c) => getCampaignStatus(c, currentBlock) === 'ACTIVE').length;
  const fundedCount = campaigns.filter((c) => getCampaignStatus(c, currentBlock) === 'TARGET_REACHED').length;
  const endedCount = campaigns.filter((c) => getCampaignStatus(c, currentBlock) === 'EXPIRED').length;

  const zoneLabels: Record<FilterTab, string> = {
    ALL: 'All Campaigns',
    ACTIVE: 'Active',
    TARGET_REACHED: 'Target Reached',
    EXPIRED: 'Ended / Missed',
  };

  const zoneCounts: Record<FilterTab, number> = {
    ALL: allCount,
    ACTIVE: activeCount,
    TARGET_REACHED: fundedCount,
    EXPIRED: endedCount,
  };

  const zoneOptions: Array<{ key: FilterTab; label: string; count: number }> = [
    { key: 'ALL', label: 'All Campaigns', count: allCount },
    { key: 'ACTIVE', label: 'Active', count: activeCount },
    { key: 'TARGET_REACHED', label: 'Target Reached', count: fundedCount },
    { key: 'EXPIRED', label: 'Ended / Missed', count: endedCount },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#0F172A]">
      {/* Top Navbar */}
      <Header
        onOpenCreate={() => setIsCreateOpen(true)}
        onBlockUpdate={(height) => setCurrentBlock(height)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation Breadcrumb showing exact zone & route */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 flex-wrap">
            <Link
              href="/"
              className="hover:text-[#FF5500] transition-colors flex items-center gap-1 font-medium"
            >
              <span>← Back to Home</span>
            </Link>
            <span>/</span>
            <button
              onClick={() => handleZoneSelect('ALL')}
              className={`hover:text-[#FF5500] transition-colors ${
                currentFilter === 'ALL' ? 'text-[#0F172A] font-bold' : 'text-slate-600'
              }`}
            >
              Dashboard
            </button>
            {currentFilter !== 'ALL' && (
              <>
                <span>/</span>
                <span className="text-[#FF5500] font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  {zoneLabels[currentFilter]} ({zoneCounts[currentFilter]})
                </span>
              </>
            )}
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="sm:hidden self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>New Campaign</span>
          </button>
        </div>

        {/* Hero & Stats Overview */}
        <StatsBanner
          campaigns={campaigns}
          currentBlock={currentBlock}
          onOpenCreate={() => setIsCreateOpen(true)}
        />

        {/* Dedicated Zone Routing Bar */}
        <div className="mb-6">
          <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 border border-slate-200 rounded-2xl overflow-x-auto">
            {zoneOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleZoneSelect(opt.key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  currentFilter === opt.key
                    ? 'bg-white text-[#0F172A] shadow-sm font-bold border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                    currentFilter === opt.key
                      ? 'bg-orange-50 text-[#FF5500] border border-orange-200'
                      : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {opt.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Campaign Feed with synced Zone */}
        <div id="campaigns">
          <CampaignFeed
            currentBlock={currentBlock}
            onOpenCreate={() => setIsCreateOpen(true)}
            onSelectCampaignToFund={(c) => setSelectedFundCampaign(c)}
            onCampaignsLoaded={(loaded) => setCampaigns(loaded)}
            activeZone={currentFilter}
            onZoneChange={(newZone) => handleZoneSelect(newZone)}
          />
        </div>
      </main>

      {/* Modals */}
      <CreateCampaignModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        currentBlock={currentBlock}
        onSuccess={() => {
          setIsCreateOpen(false);
        }}
      />

      <FundCampaignModal
        campaign={selectedFundCampaign}
        isOpen={Boolean(selectedFundCampaign)}
        onClose={() => setSelectedFundCampaign(null)}
        onSuccess={() => {
          setSelectedFundCampaign(null);
        }}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-xs font-mono text-slate-400">Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
