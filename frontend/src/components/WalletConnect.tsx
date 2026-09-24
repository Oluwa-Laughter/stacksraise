"use client";
import { useState, useEffect, type ReactNode } from 'react';
import { connect, disconnect, isConnected, getLocalStorage } from '@stacks/connect';
import { addressAtom, isMountedAtom } from '../store/wallet';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { formatAddress, formatStx, fetchAddressStxBalance } from '../lib/stacks-utils';
import { scaffoldConfig } from '../scaffold.config';

function getStoredStxAddress() {
  const stored = getLocalStorage();
  if (!stored) return null;

  return (
    stored.addresses?.stx?.find(entry => entry.address.startsWith('S'))?.address ??
    stored.addresses?.stx?.[0]?.address ??
    null
  );
}

function getResponseStxAddress(addresses: Array<{ address: string; symbol?: string }>) {
  return (
    addresses.find(entry => entry.symbol === 'STX')?.address ??
    addresses.find(entry => entry.address.startsWith('S'))?.address ??
    addresses[0]?.address ??
    null
  );
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

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const response = await connect();
      const addr = getResponseStxAddress(response.addresses);
      setAddress(addr);
    } catch (e) {
      console.error('[scaffold-stacks] connection failed:', e);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    disconnect();
    setAddress(null);
    setBalance(null);
  };

  // SSR skeleton
  if (!isMounted) return <div className="w-[140px] h-[38px] bg-slate-100 rounded-lg animate-pulse" />;

  // Disconnected state
  if (!address) {
    return (
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95 disabled:opacity-50"
      >
        {connecting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Connecting...
          </span>
        ) : (
          'Connect Wallet'
        )}
      </button>
    );
  }

  // Connected state
  return (
    <div className="flex items-center gap-2">
      {/* Live STX Balance */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-700">
        <span className="text-[#FF5500] font-bold">STX</span>
        <span>
          {loadingBalance && balance === null ? (
            <span className="animate-pulse">...</span>
          ) : (
            `${formatStx(balance ?? 0n, 2)}`
          )}
        </span>
      </div>

      {/* Truncated Address */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>{formatAddress(address)}</span>
      </div>

      {/* Disconnect Button */}
      <button
        onClick={handleDisconnect}
        title="Disconnect wallet"
        className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
      >
        ✕
      </button>
    </div>
  );
}
