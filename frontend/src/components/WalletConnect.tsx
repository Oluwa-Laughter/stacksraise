"use client";
import { useState, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  connect,
  disconnect,
  isConnected,
  getLocalStorage,
  clearLocalStorage,
  clearSelectedProviderId,
} from '@stacks/connect';
import { addressAtom, isMountedAtom } from '../store/wallet';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { formatAddress, formatStx, fetchAddressStxBalance, getExplorerAddressUrl } from '../lib/stacks-utils';
import { scaffoldConfig } from '../scaffold.config';
import { motion, AnimatePresence } from 'framer-motion';

function getResponseStxAddress(addresses: any[]): string | null {
  if (!addresses || !Array.isArray(addresses)) return null;

  // 1. Explicit Stacks purpose or symbol
  const stxMatch = addresses.find(
    (entry) =>
      entry?.purpose === 'stacks' ||
      entry?.symbol?.toUpperCase() === 'STX' ||
      (typeof entry?.address === 'string' &&
        (entry.address.startsWith('ST') || entry.address.startsWith('SP')))
  );
  if (stxMatch?.address) return stxMatch.address;

  // 2. Any entry starting with ST (testnet) or SP (mainnet)
  const anyStacks = addresses.find(
    (entry) =>
      typeof entry?.address === 'string' &&
      (entry.address.startsWith('ST') || entry.address.startsWith('SP'))
  );
  if (anyStacks?.address) return anyStacks.address;

  // 3. Fallback
  const fallback = addresses.find(
    (entry) => typeof entry?.address === 'string' && entry.address.startsWith('S')
  );
  return fallback?.address || null;
}

function getStoredStxAddress(): string | null {
  try {
    const stored = getLocalStorage();
    if (!stored) return null;

    const addresses = (stored as any).addresses;
    if (!addresses) return null;

    if (Array.isArray(addresses)) {
      return getResponseStxAddress(addresses);
    }

    if (Array.isArray(addresses.stx)) {
      return getResponseStxAddress(addresses.stx);
    }

    for (const key of Object.keys(addresses)) {
      if (Array.isArray(addresses[key])) {
        const found = getResponseStxAddress(addresses[key]);
        if (found) return found;
      }
    }
  } catch (e) {
    console.warn('Error reading stored STX address:', e);
  }
  return null;
}

/** Syncs Leather/Xverse connection state into Jotai atoms for the app. */
export function WalletProvider({ children }: { children: ReactNode }) {
  const [, setAddress] = useAtom(addressAtom);
  const [, setMounted] = useAtom(isMountedAtom);

  useEffect(() => {
    const syncWalletState = () => {
      if (!isConnected()) {
        setAddress(null);
        return;
      }

      setAddress(getStoredStxAddress());
    };

    setMounted(true);
    syncWalletState();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncWalletState();
      }
    };

    window.addEventListener('focus', syncWalletState);
    window.addEventListener('storage', syncWalletState);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', syncWalletState);
      window.removeEventListener('storage', syncWalletState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setAddress, setMounted]);

  return <>{children}</>;
}

export function WalletConnect() {
  const address = useAtomValue(addressAtom);
  const isMounted = useAtomValue(isMountedAtom);
  const setAddress = useSetAtom(addressAtom);
  const [connecting, setConnecting] = useState(false);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    if (!address) {
      setBalance(null);
      return;
    }

    let active = true;
    setLoadingBalance(true);
    fetchAddressStxBalance(address, scaffoldConfig.nodeUrl)
      .then((b) => {
        if (active) setBalance(b);
      })
      .catch((err) => {
        console.warn('Failed to load balance', err);
      })
      .finally(() => {
        if (active) setLoadingBalance(false);
      });

    // Refresh balance periodically
    const interval = setInterval(() => {
      fetchAddressStxBalance(address, scaffoldConfig.nodeUrl).then((b) => {
        if (active) setBalance(b);
      });
    }, 20000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [address]);

  const executeConnect = async (preferredWallet?: 'xverse' | 'leather') => {
    setConnecting(true);
    setConnectError(null);
    try {
      try {
        clearSelectedProviderId();
      } catch {}

      let providerArg: any = undefined;
      let approvedProviderIds: string[] | undefined = undefined;

      if (typeof window !== 'undefined') {
        const win = window as any;
        if (preferredWallet === 'xverse') {
          providerArg =
            win.XverseProviders?.StacksProvider ||
            win.XverseProviders?.BitcoinProvider ||
            win.StacksProvider;
          approvedProviderIds = ['XverseProviders.BitcoinProvider'];
        } else if (preferredWallet === 'leather') {
          providerArg = win.LeatherProvider || win.StacksProvider;
          approvedProviderIds = ['LeatherProvider'];
        }
      }

      const options: any = {
        network: scaffoldConfig.targetNetwork,
        forceWalletSelect: !providerArg,
      };

      if (providerArg) {
        options.provider = providerArg;
      }
      if (approvedProviderIds) {
        options.approvedProviderIds = approvedProviderIds;
      }

      const response = await connect(options);
      const addr = getResponseStxAddress(response.addresses);

      if (addr) {
        setAddress(addr);
        setIsModalOpen(false);
      } else {
        setConnectError('Could not detect a valid Stacks address from wallet response.');
      }
    } catch (e: any) {
      console.error('[scaffold-stacks] connection failed:', e);
      if (!e?.message?.includes?.('User canceled') && !e?.message?.includes?.('closed')) {
        setConnectError(e?.message || 'Connection failed. Please unlock your wallet and retry.');
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    try {
      disconnect();
      clearSelectedProviderId();
      clearLocalStorage();
    } catch {}
    setAddress(null);
    setBalance(null);
    setIsDropdownOpen(false);
  };

  const copyToClipboard = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SSR skeleton
  if (!isMounted) return <div className="w-[120px] h-[36px] bg-slate-100 rounded-lg animate-pulse" />;

  // Disconnected state: clicking this button opens the wallet selection modal
  if (!address) {
    return (
      <>
        <button
          onClick={() => {
            setConnectError(null);
            setIsModalOpen(true);
          }}
          disabled={connecting}
          className="inline-flex items-center justify-center px-3.5 py-2 rounded-lg bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95 disabled:opacity-50 whitespace-nowrap"
        >
          {connecting ? (
            <span className="flex items-center gap-1.5">
              <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Connecting...</span>
            </span>
          ) : (
            'Connect Wallet'
          )}
        </button>

        {/* Wallet Selection Modal */}
        {isMounted &&
          createPortal(
            <AnimatePresence>
              {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => !connecting && setIsModalOpen(false)}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                  />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-xl z-10"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-base font-bold text-[#0F172A] font-instrument">
                          Connect Stacks Wallet
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Select your preferred wallet for Stacks Testnet
                        </p>
                      </div>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        disabled={connecting}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        ✕
                      </button>
                    </div>

                    {connectError && (
                      <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-mono">
                        {connectError}
                      </div>
                    )}

                    <div className="mt-4 space-y-2.5">
                      {/* Xverse Wallet Option */}
                      <button
                        onClick={() => executeConnect('xverse')}
                        disabled={connecting}
                        className="w-full p-3 rounded-xl border border-slate-200 hover:border-[#FF5500] hover:bg-orange-50/40 transition-all flex items-center justify-between group active:scale-[0.99] text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center p-1.5 shadow-sm">
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                              <path
                                d="M17.5 18H6.5C5.1 18 4 16.9 4 15.5V8.5C4 7.1 5.1 6 6.5 6H17.5C18.9 6 20 7.1 20 8.5V15.5C20 16.9 18.9 18 17.5 18Z"
                                fill="#171717"
                              />
                              <path
                                d="M15.5 8L8.5 16M8.5 8L15.5 16"
                                stroke="#EE7A30"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-[#0F172A] group-hover:text-[#FF5500] transition-colors">
                              Xverse Wallet
                            </span>
                            <span className="block text-[11px] text-slate-500">
                              Recommended for Bitcoin & Stacks
                            </span>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-slate-400 group-hover:text-[#FF5500] group-hover:translate-x-0.5 transition-all" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {/* Leather Wallet Option */}
                      <button
                        onClick={() => executeConnect('leather')}
                        disabled={connecting}
                        className="w-full p-3 rounded-xl border border-slate-200 hover:border-[#FF5500] hover:bg-orange-50/40 transition-all flex items-center justify-between group active:scale-[0.99] text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#12100F] flex items-center justify-center p-1.5 shadow-sm">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                              <circle cx="12" cy="12" r="8" fill="#F5F1ED" />
                              <circle cx="12" cy="12" r="4" fill="#12100F" />
                            </svg>
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-[#0F172A] group-hover:text-[#FF5500] transition-colors">
                              Leather Wallet
                            </span>
                            <span className="block text-[11px] text-slate-500">
                              Native Hiro extension
                            </span>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-slate-400 group-hover:text-[#FF5500] group-hover:translate-x-0.5 transition-all" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {/* All Providers Fallback */}
                      <button
                        onClick={() => executeConnect()}
                        disabled={connecting}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 transition-colors text-center block"
                      >
                        {connecting ? 'Waiting for signature...' : 'Other Wallets / Stacks Connect Modal ↗'}
                      </button>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                      <p className="text-[11px] text-slate-400">
                        Network: <strong className="text-slate-600 font-mono uppercase">{scaffoldConfig.network}</strong> (Hiro Testnet)
                      </p>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>,
            document.body
          )}
      </>
    );
  }

  // Connected state: Clicking THIS SAME button opens account details and allows 1-click disconnect!
  // No separate "X" button!
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-mono text-slate-800 shadow-sm transition-all active:scale-[0.99] whitespace-nowrap"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span className="font-semibold">{formatAddress(address, 5, 4)}</span>
        <span className="hidden sm:inline text-slate-300">|</span>
        <span className="hidden sm:inline font-bold text-[#FF5500]">
          {loadingBalance && balance === null ? (
            <span className="animate-pulse">...</span>
          ) : (
            `${formatStx(balance ?? 0n, 2)} STX`
          )}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Account Popover Menu for Disconnect & Info */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl p-4 shadow-xl z-50 text-left"
          >
            {/* Header info */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Connected Account
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Testnet
              </span>
            </div>

            {/* Address Display & Copy */}
            <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-700 truncate mr-2" title={address}>
                  {address}
                </span>
                <button
                  onClick={copyToClipboard}
                  title="Copy full address"
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                >
                  {copied ? (
                    <span className="text-[10px] font-bold text-emerald-600">Copied!</span>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Balance info */}
            <div className="mt-3 flex items-center justify-between p-2.5 bg-orange-50/50 border border-orange-200/60 rounded-lg text-xs font-mono">
              <span className="text-slate-600">STX Balance:</span>
              <span className="font-bold text-[#FF5500]">
                {loadingBalance && balance === null ? '...' : `${formatStx(balance ?? 0n, 4)} STX`}
              </span>
            </div>

            {/* Explorer Link */}
            <div className="mt-2.5 text-center">
              <a
                href={getExplorerAddressUrl(address, scaffoldConfig.network)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-slate-500 hover:text-[#FF5500] hover:underline"
              >
                View on Hiro Explorer ↗
              </a>
            </div>

            {/* Disconnect Button (Single-click from this unified button menu!) */}
            <div className="mt-3 pt-2.5 border-t border-slate-100">
              <button
                onClick={handleDisconnect}
                className="w-full py-2 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99]"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Disconnect Wallet</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
