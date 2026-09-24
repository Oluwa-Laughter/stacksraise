"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import { StatsBanner } from '../../components/StatsBanner';
import { CampaignFeed } from '../../components/CampaignFeed';
import { CreateCampaignModal } from '../../components/CreateCampaignModal';
import { FundCampaignModal } from '../../components/FundCampaignModal';
import { type CampaignData } from '../../lib/stacks-utils';
import DebugContracts from '../../components/debug/DebugContracts';

export default function DashboardPage() {
  const [currentBlock, setCurrentBlock] = useState<number>(0);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFundCampaign, setSelectedFundCampaign] = useState<CampaignData | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#0F172A]">
      {/* Top Navbar */}
      <Header
        onOpenCreate={() => setIsCreateOpen(true)}
        onBlockUpdate={(height) => setCurrentBlock(height)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb / Return to Landing Page */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <Link href="/" className="hover:text-[#FF5500] transition-colors flex items-center gap-1">
              <span>← Back to Home</span>
            </Link>
            <span>/</span>
            <span className="text-[#0F172A] font-semibold">Dashboard</span>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Campaign</span>
          </button>
        </div>

        {/* Hero & Stats Overview */}
        <StatsBanner
          campaigns={campaigns}
          currentBlock={currentBlock}
          onOpenCreate={() => setIsCreateOpen(true)}
        />

        {/* Dynamic Campaign Feed */}
        <div id="campaigns">
          <CampaignFeed
            currentBlock={currentBlock}
            onOpenCreate={() => setIsCreateOpen(true)}
            onSelectCampaignToFund={(c) => setSelectedFundCampaign(c)}
            onCampaignsLoaded={(loaded) => setCampaigns(loaded)}
          />
        </div>

        {/* Developer Contract Inspector Toggle */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Developer Contract Inspector
              </h4>
              <p className="text-xs text-slate-400">
                Direct low-level Clarity contract function invocation via Scaffold Stacks bindings
              </p>
            </div>
            <button
              onClick={() => setShowDebug((prev) => !prev)}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-mono text-slate-600 transition-colors shadow-sm"
            >
              {showDebug ? 'Hide Contract Tools ▲' : 'Show Contract Tools ▼'}
            </button>
          </div>

          {showDebug && (
            <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <DebugContracts />
            </div>
          )}
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
