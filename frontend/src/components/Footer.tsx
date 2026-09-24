"use client";
import React from 'react';
import Link from 'next/link';
import { scaffoldConfig } from '../scaffold.config';

export default function Footer() {
  const contractAddress = 'ST3E6N4PVNF8H0BJVQQR5A6KA9HMD9DDV5SW988C9.crowdfund-v2';
  const contractTxId = '0xf175d11ad806e4a51474667a274f2151af9cab792cbbd7b9ceeaaca8051a3d27';

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white pt-12 sm:pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-10 sm:pb-12 border-b border-slate-100">
          {/* Brand Column */}
          <div className="md:col-span-6 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-[#FF5500] flex items-center justify-center text-white shadow-sm group-hover:bg-[#E04B00] transition-colors shrink-0">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0F172A] font-instrument">
                Stacks<span className="text-[#FF5500]">Raise</span>
              </span>
            </Link>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md">
              Decentralized block-height crowdfunding secured by Bitcoin consensus. 100% non-custodial smart escrow with guaranteed automated refunds on Stacks Layer 2.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Stacks Testnet Live • Epoch 2.5 Consensus</span>
            </div>
          </div>

          {/* Links Column 1: Network & Protocol */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Network & Protocol
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <a
                  href={`https://explorer.hiro.so/?chain=${scaffoldConfig.network}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-[#FF5500] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Hiro Testnet Explorer</span>
                  <span className="text-xs text-slate-400">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://explorer.hiro.so/sandbox/faucet?chain=testnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-[#FF5500] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Get Testnet STX (Faucet)</span>
                  <span className="text-xs text-slate-400">↗</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://explorer.hiro.so/txid/${contractTxId}?chain=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-[#FF5500] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Clarity Contract on Explorer</span>
                  <span className="text-xs text-slate-400">↗</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Ecosystem & Standards */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Ecosystem & Docs
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <a
                  href="https://scaffoldstacks.mintlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-[#FF5500] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Scaffold Stacks Docs</span>
                  <span className="text-xs text-slate-400">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://docs.stacks.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-[#FF5500] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Stacks Blockchain Docs</span>
                  <span className="text-xs text-slate-400">↗</span>
                </a>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-slate-600 hover:text-[#FF5500] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Crowdfunding Dashboard</span>
                  <span className="text-xs text-[#FF5500]">→</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Contract ID */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-500">
          <div className="text-center sm:text-left">
            <p className="hidden sm:block">
              © 2026 StacksRaise. Built for the Scaffold Stacks Test-Flight Bounty.
            </p>
            <p className="sm:hidden font-medium text-slate-600">
              © 2026 StacksRaise
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-slate-400">
            <span>Contract:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {contractAddress}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}