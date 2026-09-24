"use client";
import React from 'react';
import Link from 'next/link';
import { scaffoldConfig } from '../scaffold.config';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-5 h-5 rounded bg-[#FF5500] flex items-center justify-center text-white text-[10px] font-bold group-hover:bg-[#E04B00] transition-colors shrink-0">
            SR
          </div>
          <span className="text-xs font-bold text-[#0F172A] font-instrument">
            StacksRaise
          </span>
          <span className="hidden md:inline text-xs text-slate-400">
            • Decentralized Block-Height Crowdfunding secured by Bitcoin
          </span>
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-mono text-slate-500">
          <a
            href={`https://explorer.hiro.so/?chain=${scaffoldConfig.network}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#FF5500] transition-colors"
          >
            Hiro Explorer ↗
          </a>
          <a
            href="https://explorer.hiro.so/sandbox/faucet?chain=testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#FF5500] transition-colors"
          >
            STX Faucet ↗
          </a>
          <a
            href="https://github.com/Oluwa-Laughter/stacksraise"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#FF5500] transition-colors"
          >
            GitHub ↗
          </a>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="text-slate-400">Scaffold Stacks Test-Flight</span>
        </div>
      </div>
    </footer>
  );
}