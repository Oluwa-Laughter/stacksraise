"use client";
import React from 'react';
import { WalletConnect } from './WalletConnect';
import { BlockHeightBadge } from './BlockHeightBadge';
import { scaffoldConfig } from '../scaffold.config';

interface HeaderProps {
  onOpenCreate?: () => void;
  onBlockUpdate?: (height: number) => void;
}

export default function Header({ onOpenCreate, onBlockUpdate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF5500] flex items-center justify-center shadow-sm">
              {/* Bitcoin layer 2 pyramid/blocks icon */}
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-[#0F172A] font-instrument">
                  Stacks<span className="text-[#FF5500]">Raise</span>
                </span>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-orange-50 text-[#FF5500] border border-orange-200">
                  {scaffoldConfig.network.toUpperCase()}
                </span>
              </div>
              <p className="hidden lg:block text-[11px] text-slate-500 font-medium">
                Decentralized block-height crowdfunding secured by Bitcoin
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Chain Tip Badge */}
        <div className="flex items-center">
          <BlockHeightBadge onHeightUpdate={onBlockUpdate} />
        </div>

        {/* Right: Actions & Wallet */}
        <div className="flex items-center gap-3">
          {onOpenCreate && (
            <button
              onClick={onOpenCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Campaign</span>
            </button>
          )}

          <WalletConnect />
        </div>
      </div>
    </header>
  );
}