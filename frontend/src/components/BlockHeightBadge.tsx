"use client";
import React, { useEffect, useState, useRef } from 'react';
import { fetchLiveChainTip } from '../lib/stacks-utils';
import { scaffoldConfig } from '../scaffold.config';

interface BlockHeightBadgeProps {
  onHeightUpdate?: (height: number) => void;
}

export function BlockHeightBadge({ onHeightUpdate }: BlockHeightBadgeProps) {
  const [tipHeight, setTipHeight] = useState<number | null>(null);
  const [burnHeight, setBurnHeight] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Keep a stable ref to prevent parent re-render loops
  const onHeightUpdateRef = useRef(onHeightUpdate);
  useEffect(() => {
    onHeightUpdateRef.current = onHeightUpdate;
  }, [onHeightUpdate]);

  const loadHeight = async (manual: boolean = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const tip = await fetchLiveChainTip(scaffoldConfig.nodeUrl);
      if (tip.stacksTip > 0) {
        setTipHeight(tip.stacksTip);
        setBurnHeight(tip.burnBlock);
        onHeightUpdateRef.current?.(tip.stacksTip);
      }
    } finally {
      if (manual) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  useEffect(() => {
    loadHeight();
    const interval = setInterval(() => {
      loadHeight(false);
    }, 25000); // 25s polling

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      onClick={() => loadHeight(true)}
      title={`Live Stacks Block: ${tipHeight ?? 'Syncing...'} | Bitcoin Burn Block: ${burnHeight ?? 'Syncing...'}. Click to refresh.`}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-mono text-slate-700 shadow-sm hover:border-[#FF5500] hover:text-[#0F172A] cursor-pointer transition-all select-none group"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5500] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5500]" />
      </span>
      <span className="font-semibold text-slate-500 group-hover:text-[#FF5500] transition-colors">
        BLOCK
      </span>
      <span className="font-bold text-[#0F172A]">
        {tipHeight ? (
          `#${tipHeight.toLocaleString()}`
        ) : (
          <span className="animate-pulse text-slate-400">Syncing...</span>
        )}
      </span>
      {isRefreshing && (
        <svg
          className="animate-spin h-3 w-3 text-[#FF5500]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
    </div>
  );
}
