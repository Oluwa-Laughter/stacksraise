"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { WalletConnect } from './WalletConnect';
import { BlockHeightBadge } from './BlockHeightBadge';
import { scaffoldConfig } from '../scaffold.config';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onOpenCreate?: () => void;
  onBlockUpdate?: (height: number) => void;
}

export default function Header({ onOpenCreate, onBlockUpdate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Identity (Clickable Link to Home) */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            title="StacksRaise Home"
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FF5500] flex items-center justify-center shadow-sm group-hover:bg-[#E04B00] transition-colors shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-[#0F172A] font-instrument">
                Stacks<span className="text-[#FF5500]">Raise</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-orange-50 text-[#FF5500] border border-orange-200">
                {scaffoldConfig.network.toUpperCase()}
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Live Chain Tip Badge (hidden on mobile, shown in menu) */}
        <div className="hidden md:flex items-center">
          <BlockHeightBadge onHeightUpdate={onBlockUpdate} />
        </div>

        {/* Right: Actions, Wallet & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onOpenCreate && (
            <button
              onClick={onOpenCreate}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Campaign</span>
            </button>
          )}

          <div className="shrink-0">
            <WalletConnect />
          </div>

          {/* Hamburger Menu Toggle (Mobile) */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 overflow-hidden shadow-lg"
          >
            {/* Mobile Block Height */}
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">Chain Tip:</span>
              <BlockHeightBadge onHeightUpdate={onBlockUpdate} />
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-1 text-sm font-semibold text-slate-700">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-[#FF5500] transition-colors"
              >
                Home Overview
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-[#FF5500] transition-colors"
              >
                Campaigns Dashboard
              </Link>
              <a
                href="https://github.com/Oluwa-Laughter/stacksraise"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-[#FF5500] transition-colors"
              >
                GitHub Source Code ↗
              </a>
            </div>

            {/* Mobile New Campaign Action */}
            {onOpenCreate && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCreate();
                  }}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Campaign</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}