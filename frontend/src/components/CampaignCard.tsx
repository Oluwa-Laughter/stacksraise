"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cl } from '@stacks/transactions';
import { useAtomValue } from 'jotai';
import { addressAtom } from '../store/wallet';
import {
  type CampaignData,
  getCampaignStatus,
  formatStx,
  formatAddress,
  getExplorerAddressUrl,
  getExplorerTxUrl,
  blocksToTimeEstimate,
  extractClarityUint,
} from '../lib/stacks-utils';
import {
  useCrowdfund_GetContribution,
  useCrowdfund_ClaimFunds,
  useCrowdfund_ClaimRefund,
} from '../generated/hooks';
import { scaffoldConfig } from '../scaffold.config';

interface CampaignCardProps {
  campaign: CampaignData;
  currentBlock: number;
  onContributeClick: (campaign: CampaignData) => void;
  onRefresh?: () => void;
}

export function CampaignCard({
  campaign,
  currentBlock,
  onContributeClick,
  onRefresh,
}: CampaignCardProps) {
  const connectedAddress = useAtomValue(addressAtom);
  const status = getCampaignStatus(campaign, currentBlock);

  // User contribution lookup
  const { call: fetchContribution, data: rawContrib } = useCrowdfund_GetContribution();
  const [userContribution, setUserContribution] = useState<bigint>(0n);

  useEffect(() => {
    if (!connectedAddress) {
      setUserContribution(0n);
      return;
    }
    void fetchContribution([Cl.uint(campaign.id), Cl.principal(connectedAddress)])
      .then((res) => {
        const uintVal = extractClarityUint(res);
        if (uintVal !== null) {
          setUserContribution(uintVal);
        }
      })
      .catch((err) => {
        console.warn('Error fetching contribution:', err);
      });
  }, [connectedAddress, campaign.id, fetchContribution]);

  // Claim actions
  const {
    call: callClaimFunds,
    loading: claimingFunds,
    txid: claimFundsTxid,
    txStatus: claimFundsStatus,
  } = useCrowdfund_ClaimFunds();

  const {
    call: callClaimRefund,
    loading: claimingRefund,
    txid: claimRefundTxid,
    txStatus: claimRefundStatus,
  } = useCrowdfund_ClaimRefund();

  const handleClaimFunds = async () => {
    try {
      await callClaimFunds([Cl.uint(campaign.id)]);
      onRefresh?.();
    } catch (e) {
      console.error('Claim funds failed:', e);
    }
  };

  const handleClaimRefund = async () => {
    try {
      await callClaimRefund([Cl.uint(campaign.id)]);
      onRefresh?.();
    } catch (e) {
      console.error('Claim refund failed:', e);
    }
  };

  // Remaining blocks calculation
  const remainingBlocks = Math.max(0, campaign.endBlock - currentBlock);
  const isExpired = currentBlock >= campaign.endBlock;
  const isGoalMet = campaign.raisedStx >= campaign.targetStx;
  const isCreator =
    connectedAddress &&
    connectedAddress.toLowerCase() === campaign.creator.toLowerCase();

  // Progress percentage calculation
  const percentNumber =
    campaign.targetStx > 0n
      ? Math.min(100, Number((campaign.raisedStx * 100n) / campaign.targetStx))
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
    >
      <div>
        {/* Header: Campaign ID & Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800">
              #{campaign.id}
            </span>
            <a
              href={getExplorerAddressUrl(campaign.creator, scaffoldConfig.network)}
              target="_blank"
              rel="noopener noreferrer"
              title={`Creator: ${campaign.creator}`}
              className="text-xs font-mono text-slate-500 hover:text-[#FF5500] hover:underline transition-colors"
            >
              by {formatAddress(campaign.creator)}
            </a>
          </div>

          {/* Dynamic Badge */}
          {status === 'ACTIVE' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#FF5500] border border-orange-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
              ACTIVE
            </span>
          )}
          {status === 'TARGET_REACHED' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              TARGET REACHED
            </span>
          )}
          {status === 'EXPIRED' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              EXPIRED / MISSED
            </span>
          )}
        </div>

        {/* Financial Highlights */}
        <div className="mb-4">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-2xl font-bold font-mono text-[#0F172A] tracking-tight">
              {formatStx(campaign.raisedStx)} <span className="text-sm font-normal text-slate-500">STX</span>
            </span>
            <span className="text-xs font-mono text-slate-500">
              Goal: <strong className="text-slate-800">{formatStx(campaign.targetStx)} STX</strong>
            </span>
          </div>

          {/* Framer Motion Animated Progress Bar */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentNumber}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full transition-colors ${
                isGoalMet ? 'bg-emerald-500' : 'bg-[#FF5500]'
              }`}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-500 font-mono">
            <span>{percentNumber.toFixed(1)}% raised</span>
            {isGoalMet && <span className="text-emerald-600 font-medium">100% Guaranteed</span>}
          </div>
        </div>

        {/* Block Height & Deadline Metadata */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg mb-4 text-xs font-mono">
          <div className="min-w-0">
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 truncate">
              Deadline Block
            </span>
            <span className="font-semibold text-slate-700 truncate block">#{campaign.endBlock.toLocaleString()}</span>
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 truncate">
              Remaining
            </span>
            <span className={`font-semibold truncate block ${remainingBlocks === 0 ? 'text-slate-500' : 'text-[#FF5500]'}`}>
              {remainingBlocks > 0
                ? `${remainingBlocks.toLocaleString()} blks (${blocksToTimeEstimate(remainingBlocks)})`
                : 'Deadline reached'}
            </span>
          </div>
        </div>

        {/* User Contribution status if any */}
        {connectedAddress && userContribution > 0n && (
          <div className="mb-4 px-3 py-2 bg-orange-50/50 border border-orange-200/60 rounded-lg text-xs font-mono text-[#0F172A] flex items-center justify-between">
            <span className="text-slate-600">Your contribution:</span>
            <span className="font-bold text-[#FF5500]">{formatStx(userContribution)} STX</span>
          </div>
        )}

        {/* Claimed Status Notice */}
        {campaign.claimed && (
          <div className="mb-4 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono text-emerald-800 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Funds claimed by creator</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
        {/* Active: Contribute */}
        {status === 'ACTIVE' && (
          <button
            onClick={() => onContributeClick(campaign)}
            className="w-full py-2.5 px-4 rounded-lg bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>Contribute STX</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {/* Claim Funds Action (Creator only, deadline reached, goal met, not claimed) */}
        {isCreator && isExpired && isGoalMet && !campaign.claimed && (
          <div className="flex flex-col gap-1.5">
            <button
              onClick={handleClaimFunds}
              disabled={claimingFunds}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              {claimingFunds ? 'Claiming Funds...' : `Claim ${formatStx(campaign.raisedStx)} STX (Creator)`}
            </button>
            {claimFundsTxid && (
              <a
                href={getExplorerTxUrl(claimFundsTxid, scaffoldConfig.network)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-emerald-600 hover:underline text-center"
              >
                Tx: {formatAddress(claimFundsTxid)} ({claimFundsStatus ?? 'pending'})
              </a>
            )}
          </div>
        )}

        {/* Claim Refund Action (Contributor only, deadline reached, goal missed, contributed > 0) */}
        {isExpired && !isGoalMet && userContribution > 0n && (
          <div className="flex flex-col gap-1.5">
            <button
              onClick={handleClaimRefund}
              disabled={claimingRefund}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              {claimingRefund ? 'Processing Refund...' : `Claim Refund (${formatStx(userContribution)} STX)`}
            </button>
            {claimRefundTxid && (
              <a
                href={getExplorerTxUrl(claimRefundTxid, scaffoldConfig.network)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-slate-600 hover:underline text-center"
              >
                Tx: {formatAddress(claimRefundTxid)} ({claimRefundStatus ?? 'pending'})
              </a>
            )}
          </div>
        )}

        {/* Closed notice */}
        {isExpired && (!isCreator || campaign.claimed || !isGoalMet) && userContribution === 0n && (
          <div className="text-center py-2 text-xs font-mono text-slate-400">
            Campaign concluded
          </div>
        )}
      </div>
    </motion.div>
  );
}
