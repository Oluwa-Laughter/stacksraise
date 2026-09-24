"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cl } from '@stacks/transactions';
import { useAtomValue } from 'jotai';
import { addressAtom } from '../store/wallet';
import { useCrowdfund_FundCampaign } from '../generated/hooks';
import {
  type CampaignData,
  stxToMicroStx,
  microStxToStx,
  formatStx,
  getExplorerTxUrl,
  formatAddress,
} from '../lib/stacks-utils';
import { scaffoldConfig } from '../scaffold.config';

interface FundCampaignModalProps {
  campaign: CampaignData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FundCampaignModal({
  campaign,
  isOpen,
  onClose,
  onSuccess,
}: FundCampaignModalProps) {
  const address = useAtomValue(addressAtom);
  const [amountInput, setAmountInput] = useState<string>('5');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    call: callFundCampaign,
    loading,
    txid,
    txStatus,
    txStatusError,
  } = useCrowdfund_FundCampaign();

  if (!campaign) return null;

  const remainingToGoal =
    campaign.targetStx > campaign.raisedStx
      ? campaign.targetStx - campaign.raisedStx
      : 0n;

  const handleQuickAdd = (stx: string) => {
    setAmountInput(stx);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!address) {
      setErrorMsg('Please connect your Stacks wallet first.');
      return;
    }

    const microStx = stxToMicroStx(amountInput);
    if (microStx <= 0n) {
      setErrorMsg('Contribution amount must be greater than 0 STX.');
      return;
    }

    try {
      await callFundCampaign([Cl.uint(campaign.id), Cl.uint(microStx)]);
      onSuccess?.();
    } catch (err: any) {
      console.error('Funding failed:', err);
      setErrorMsg(err?.message || 'Transaction failed or rejected by wallet.');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setErrorMsg(null);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Dialog Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-xl z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF5500]">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] font-instrument">
                    Contribute to Campaign #{campaign.id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Target: {formatStx(campaign.targetStx)} STX • Raised: {formatStx(campaign.raisedStx)} STX
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Contribution (STX)
                  </label>
                  {remainingToGoal > 0n && (
                    <span className="text-[11px] font-mono text-slate-500">
                      Remaining to goal: {formatStx(remainingToGoal)} STX
                    </span>
                  )}
                </div>

                <div className="relative rounded-lg shadow-sm">
                  <input
                    type="number"
                    step="any"
                    min="0.000001"
                    required
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="e.g. 10"
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-colors pr-16"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xs font-mono font-bold text-[#FF5500]">
                    STX
                  </div>
                </div>

                {/* Quick Selection Buttons */}
                <div className="flex items-center gap-2 mt-2">
                  {['1', '5', '10', '25'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickAdd(val)}
                      disabled={loading}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-mono text-slate-700 transition-colors"
                    >
                      +{val} STX
                    </button>
                  ))}
                  {remainingToGoal > 0n && (
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(microStxToStx(remainingToGoal))}
                      disabled={loading}
                      className="px-2.5 py-1 rounded bg-orange-50 hover:bg-orange-100 border border-orange-200 text-xs font-mono text-[#FF5500] transition-colors ml-auto"
                    >
                      Max Goal
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 font-mono mt-2">
                  Amount in micro-STX:{' '}
                  {amountInput ? `${stxToMicroStx(amountInput).toLocaleString()} uSTX` : '0 uSTX'}
                </p>
              </div>

              {/* Error Notice */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-mono">
                  {errorMsg}
                </div>
              )}

              {/* Tx Status Feedback */}
              {txid && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#FF5500]">Transaction Broadcast:</span>
                    <span className="capitalize px-1.5 py-0.5 rounded bg-white text-slate-700 border border-orange-200">
                      {txStatus ?? 'pending'}
                    </span>
                  </div>
                  <a
                    href={getExplorerTxUrl(txid, scaffoldConfig.network)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FF5500] hover:underline block truncate"
                  >
                    View on Hiro Explorer: {formatAddress(txid, 10, 8)} ↗
                  </a>
                  {txStatusError && (
                    <p className="text-red-500 mt-1">{txStatusError}</p>
                  )}
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="w-1/3 py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold tracking-wide transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !address}
                  className="w-2/3 py-2.5 px-4 rounded-lg bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Confirming in Wallet...
                    </span>
                  ) : !address ? (
                    'Connect Wallet First'
                  ) : (
                    `Confirm ${amountInput || '0'} STX Contribution`
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
