"use client";
import React, { useState, useEffect } from 'react';
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

  const isProcessing = loading || txStatus === 'pending';

  // Automatically refresh feed when contribution confirms
  useEffect(() => {
    if (txStatus === 'success') {
      onSuccess?.();
    }
  }, [txStatus, onSuccess]);

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
    if (!isProcessing) {
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
            className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-xl z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
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
                    Contribute to {campaign.title || `Campaign #${campaign.id}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Target: {formatStx(campaign.targetStx)} STX • Raised: {formatStx(campaign.raisedStx)} STX
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 disabled:opacity-30"
              >
                ✕
              </button>
            </div>

            {/* Campaign Mission Snippet */}
            {campaign.description && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-600 leading-relaxed font-sans">
                <span className="font-semibold text-slate-800 block mb-0.5">Project Mission:</span>
                {campaign.description}
              </div>
            )}

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
                    disabled={isProcessing}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-colors pr-16 disabled:opacity-60"
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
                      disabled={isProcessing}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-mono text-slate-700 transition-colors disabled:opacity-40"
                    >
                      +{val} STX
                    </button>
                  ))}
                  {remainingToGoal > 0n && (
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(microStxToStx(remainingToGoal))}
                      disabled={isProcessing}
                      className="px-2.5 py-1 rounded bg-orange-50 hover:bg-orange-100 border border-orange-200 text-xs font-mono text-[#FF5500] transition-colors ml-auto disabled:opacity-40"
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
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs font-mono space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#FF5500]">Transaction Status:</span>
                    <span className={`capitalize px-2 py-0.5 rounded text-xs font-bold border ${
                      txStatus === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white text-slate-700 border-orange-200'
                    }`}>
                      {txStatus ?? 'pending'}
                    </span>
                  </div>
                  <a
                    href={getExplorerTxUrl(txid, scaffoldConfig.network)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FF5500] hover:underline block truncate font-medium"
                  >
                    View on Hiro Explorer: {formatAddress(txid, 10, 8)} ↗
                  </a>
                  {txStatus === 'pending' && (
                    <p className="text-slate-500 text-[11px] flex items-center gap-1.5 pt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-ping" />
                      Locking STX into smart escrow on Stacks testnet...
                    </p>
                  )}
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
                  disabled={isProcessing}
                  className="w-1/3 py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold tracking-wide transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !address}
                  className="w-2/3 py-2.5 px-4 rounded-lg bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Waiting for Wallet Signature...
                    </span>
                  ) : txStatus === 'pending' ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Confirming on Stacks...
                    </span>
                  ) : txStatus === 'success' ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 011.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      STX Contribution Confirmed!
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
