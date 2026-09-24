"use client";
import React from 'react';
import { type CampaignData, formatStx } from '../lib/stacks-utils';

interface StatsBannerProps {
  campaigns: CampaignData[];
  currentBlock: number;
  onOpenCreate: () => void;
}

export function StatsBanner({ campaigns, currentBlock, onOpenCreate }: StatsBannerProps) {
  const totalCampaigns = campaigns.length;
  const totalVolumeRaised = campaigns.reduce((acc, c) => acc + c.raisedStx, 0n);
  const activeCampaigns = campaigns.filter((c) => currentBlock < c.endBlock && c.raisedStx < c.targetStx).length;
  const fundedCampaigns = campaigns.filter((c) => c.raisedStx >= c.targetStx).length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Headline */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#FF5500] border border-orange-200 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
            <span>Secured by Stacks & Bitcoin Consensus</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight font-instrument leading-tight">
            Decentralized Block-Height Crowdfunding
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Every campaign deadline is anchored strictly to live Bitcoin/Stacks block height. Zero custodians: funds release to the creator on target reached, or auto-refund to contributors on deadline miss.
          </p>
        </div>

        {/* Right CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={onOpenCreate}
            className="px-5 py-3 rounded-xl bg-[#FF5500] hover:bg-[#E04B00] text-white text-sm font-semibold tracking-wide transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Start a Campaign</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
          <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-mono">
            Total Campaigns
          </span>
          <span className="text-xl font-bold font-mono text-[#0F172A] mt-0.5 block">
            {totalCampaigns}
          </span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
          <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-mono">
            Total Volume Raised
          </span>
          <span className="text-xl font-bold font-mono text-[#FF5500] mt-0.5 block">
            {formatStx(totalVolumeRaised, 2)} <span className="text-xs font-normal text-slate-500">STX</span>
          </span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
          <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-mono">
            Active Campaigns
          </span>
          <span className="text-xl font-bold font-mono text-[#0F172A] mt-0.5 block">
            {activeCampaigns}
          </span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
          <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-mono">
            Funded / Target Met
          </span>
          <span className="text-xl font-bold font-mono text-emerald-600 mt-0.5 block">
            {fundedCampaigns}
          </span>
        </div>
      </div>
    </div>
  );
}
