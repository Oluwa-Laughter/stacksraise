"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cl } from '@stacks/transactions';
import { useAtomValue } from 'jotai';
import { addressAtom } from '../store/wallet';
import { useCrowdfund_CreateCampaign } from '../generated/hooks';
import {
  stxToMicroStx,
  blocksToTimeEstimate,
  getExplorerTxUrl,
  formatAddress,
} from '../lib/stacks-utils';
import { scaffoldConfig } from '../scaffold.config';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBlock: number;
  onSuccess?: () => void;
}

export function CreateCampaignModal({
  isOpen,
  onClose,
  currentBlock,
  onSuccess,
}: CreateCampaignModalProps) {
  const address = useAtomValue(addressAtom);
  const [titleInput, setTitleInput] = useState<string>('');
  const [descriptionInput, setDescriptionInput] = useState<string>('');
  const [targetStxInput, setTargetStxInput] = useState<string>('50');
  const [durationBlocksInput, setDurationBlocksInput] = useState<string>('144'); // ~24h default
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    call: callCreateCampaign,
    loading,
    txid,
    txStatus,
    txStatusError,
  } = useCrowdfund_CreateCampaign();

  const isProcessing = loading || txStatus === 'pending';

  // Automatically trigger feed refresh when transaction confirms
  useEffect(() => {
    if (txStatus === 'success') {
      onSuccess?.();
    }
  }, [txStatus, onSuccess]);

  const durationBlocks = parseInt(durationBlocksInput, 10) || 0;
  const estimatedEndBlock = currentBlock > 0 && durationBlocks > 0 ? currentBlock + durationBlocks : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!address) {
      setErrorMsg('Please connect your Stacks wallet first.');
      return;
    }

    const trimmedTitle = titleInput.trim();
    if (!trimmedTitle) {
      setErrorMsg('Please enter a Project Title (e.g. Bitcoin L2 Arcade).');
      return;
    }
    if (trimmedTitle.length > 64) {
      setErrorMsg('Project Title must be 64 characters or fewer.');
      return;
    }

    const trimmedDesc = descriptionInput.trim();
    if (!trimmedDesc) {
      setErrorMsg('Please enter a short project description for contributors.');
      return;
    }
    if (trimmedDesc.length > 256) {
      setErrorMsg('Description must be 256 characters or fewer.');
      return;
    }

    const microStx = stxToMicroStx(targetStxInput);
    if (microStx <= 0n) {
      setErrorMsg('Target STX must be greater than 0.');
      return;
    }

    if (durationBlocks <= 0) {
      setErrorMsg('Duration in blocks must be greater than 0.');
      return;
    }

    try {
      await callCreateCampaign([
        Cl.stringAscii(trimmedTitle),
        Cl.stringUtf8(trimmedDesc),
        Cl.uint(microStx),
        Cl.uint(durationBlocks),
      ]);
      onSuccess?.();
    } catch (err: any) {
      console.error('Failed to create campaign:', err);
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
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] font-instrument">
                    Register Campaign On-Chain
                  </h3>
                  <p className="text-xs text-slate-500">
                    Publish your project name, mission, target and deadline to Stacks
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Project Title / Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Project Title / Name
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {titleInput.length}/64
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={64}
                  required
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="e.g. Bitcoin L2 Arcade Studio"
                  disabled={isProcessing}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-colors disabled:opacity-60"
                />
              </div>

              {/* Project Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Project Mission & Description
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {descriptionInput.length}/256
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={256}
                  required
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  placeholder="Explain why you are raising funds and what milestones will be delivered..."
                  disabled={isProcessing}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-colors resize-none disabled:opacity-60"
                />
              </div>

              {/* Target Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Funding Target (STX)
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <input
                    type="number"
                    step="any"
                    min="0.000001"
                    required
                    value={targetStxInput}
                    onChange={(e) => setTargetStxInput(e.target.value)}
                    placeholder="e.g. 50"
                    disabled={isProcessing}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-colors pr-16 disabled:opacity-60"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xs font-mono font-bold text-[#FF5500]">
                    STX
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-1">
                  On-chain conversion:{' '}
                  {targetStxInput ? `${stxToMicroStx(targetStxInput).toLocaleString()} micro-STX` : '0 uSTX'}
                </p>
              </div>

              {/* Duration in Blocks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Campaign Duration (Blocks)
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <input
                    type="number"
                    min="1"
                    required
                    value={durationBlocksInput}
                    onChange={(e) => setDurationBlocksInput(e.target.value)}
                    placeholder="e.g. 144"
                    disabled={isProcessing}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-colors pr-20 disabled:opacity-60"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xs font-mono text-slate-500">
                    blocks
                  </div>
                </div>

                {/* Helper hint */}
                <div className="mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Estimated Duration:</span>
                  <span className="font-semibold text-slate-800">
                    {blocksToTimeEstimate(durationBlocks)}
                  </span>
                </div>
                {estimatedEndBlock > 0 && (
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    Current block #{currentBlock.toLocaleString()} → Target end block #{estimatedEndBlock.toLocaleString()}
                  </p>
                )}
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-mono">
                  {errorMsg}
                </div>
              )}

              {/* Tx Status feedback */}
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
                      Waiting for block confirmation on Stacks testnet...
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
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Published On-Chain!
                    </span>
                  ) : !address ? (
                    'Connect Wallet First'
                  ) : (
                    'Publish Campaign On-Chain'
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
