"use client";
import React from 'react';
import { scaffoldConfig } from '../scaffold.config';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#FF5500] flex items-center justify-center text-white text-[10px] font-bold">
            SR
          </div>
          <span className="text-xs font-semibold text-[#0F172A] font-instrument">
            StacksRaise
          </span>
          <span className="text-xs text-slate-400">
            • Decentralized Block-Height Crowdfunding secured by Bitcoin
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
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
          <span className="text-slate-300">|</span>
          <span className="text-slate-400">Scaffold Stacks Test-Flight</span>
        </div>
      </div>
    </footer>
  );
}