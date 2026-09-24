"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BlockHeightBadge } from '../components/BlockHeightBadge';
import { WalletConnect } from '../components/WalletConnect';
import { scaffoldConfig } from '../scaffold.config';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col selection:bg-orange-100 selection:text-[#FF5500]">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#FF5500] flex items-center justify-center shadow-sm group-hover:bg-[#E04B00] transition-colors">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-[#0F172A] font-instrument">
                Stacks<span className="text-[#FF5500]">Raise</span>
              </span>
            </Link>
            <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-orange-50 text-[#FF5500] border border-orange-200">
              {scaffoldConfig.network.toUpperCase()}
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-[#FF5500] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#FF5500] transition-colors">
              How It Works
            </a>
            <a href="#security" className="hover:text-[#FF5500] transition-colors">
              Security
            </a>
            <Link href="/dashboard" className="hover:text-[#FF5500] transition-colors">
              Explore Campaigns
            </Link>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <BlockHeightBadge />
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95"
            >
              <span>Launch App</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>

            <div className="hidden lg:block">
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-orange-100/40 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#FF5500] border border-orange-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
                <span>Secured by Bitcoin Block Height & Clarity Smart Contracts</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight font-instrument leading-[1.1]">
                Decentralized Crowdfunding{' '}
                <span className="text-[#FF5500] inline-block">Secured by Bitcoin</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                The trustless crowdfunding protocol where campaign deadlines are enforced strictly by Bitcoin block-height timestamps. 100% non-custodial Clarity escrow, automated refunds on missed goals, and zero middlemen.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/dashboard"
                  className="px-6 py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#E04B00] text-white text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 group"
                >
                  <span>Launch Dashboard</span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>

                <a
                  href="#how-it-works"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold tracking-wide transition-all border border-slate-200 shadow-sm flex items-center justify-center"
                >
                  How It Works
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-mono">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Zero Mock Data</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>100% Contributor Protection</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Micro-STX Precision</span>
                </div>
              </div>
            </motion.div>

            {/* Right Visual Card Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
              className="lg:col-span-5 relative"
            >
              {/* Decorative floating card */}
              <div className="relative mx-auto max-w-sm sm:max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-5">
                {/* Mock Campaign Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800">
                      #1 LIVE
                    </span>
                    <span className="text-xs font-mono text-slate-500">by ST1PQ...GZGM</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#FF5500] border border-orange-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
                    ACTIVE
                  </span>
                </div>

                {/* Amount */}
                <div>
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                    Total Raised
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-3xl font-extrabold font-mono text-[#0F172A]">
                      85.5000 <span className="text-sm font-normal text-slate-500">STX</span>
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Target: <strong>100.0 STX</strong>
                    </span>
                  </div>

                  {/* Progress Bar Animation */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 mt-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '85.5%' }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                      className="h-full bg-[#FF5500] rounded-full"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400 font-mono">
                    <span>85.5% funded</span>
                    <span className="text-[#FF5500] font-semibold">14.5 STX remaining</span>
                  </div>
                </div>

                {/* Block Height Meta */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono">
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400">Target Block</span>
                    <span className="font-semibold text-slate-800">#528,438</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400">Blocks Left</span>
                    <span className="font-semibold text-[#FF5500]">144 blocks (~24h)</span>
                  </div>
                </div>

                {/* Call to action inside card */}
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 px-4 rounded-lg bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Contribute Micro-STX</span>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Metrics Ribbon */}
      <section className="border-y border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <span className="block text-2xl sm:text-3xl font-bold font-mono text-[#0F172A]">
                100%
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                On-Chain Clarity Escrow
              </span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-bold font-mono text-[#FF5500]">
                ~10 Min
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                Bitcoin Block Settlement
              </span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-bold font-mono text-[#0F172A]">
                1 uSTX
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                Granular Contribution Precision
              </span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-bold font-mono text-emerald-600">
                0%
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                Custodial Middleman Risk
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#FF5500] font-mono">
            Architected for Bitcoin
          </span>
          <h2 className="text-3xl font-extrabold text-[#0F172A] font-instrument mt-2">
            Why Block-Height Crowdfunding Matters
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Traditional crowdfunding suffers from opaque escrow custody, chargebacks, and arbitrary platform freezes. StacksRaise solves this on Bitcoin Layer 2.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-[#FF5500] flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#0F172A] font-instrument">
              Bitcoin Block Timestamps
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Deadlines are pegged directly to Bitcoin consensus blocks. No server clock manipulation or time-zone confusion.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-[#FF5500] flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#0F172A] font-instrument">
              Zero-Custody Clarity Escrow
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Contributed funds are held in the autonomous contract principal. Not even contract deployers can withdraw funds unless conditions are satisfied.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#0F172A] font-instrument">
              Guaranteed Auto-Refunds
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              If a campaign expires without meeting 100% of its target STX, contributors can immediately claim back their full contribution on-chain.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-[#FF5500] flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#0F172A] font-instrument">
              Wallet-Native Experience
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Seamlessly sign calls with Leather or Xverse. Track transactions on Hiro Explorer with real-time mempool and block confirmations.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#FF5500] font-mono">
              Simple 3-Step Lifecycle
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] font-instrument mt-2">
              How StacksRaise Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
              <span className="text-3xl font-extrabold text-[#FF5500] font-mono block mb-2">01</span>
              <h4 className="text-lg font-bold text-[#0F172A] font-instrument">
                Create Campaign
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Connect your wallet and define your STX funding goal along with duration in blocks (e.g. 144 blocks ≈ 24 hours). The smart contract sets the immutable deadline block.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
              <span className="text-3xl font-extrabold text-[#FF5500] font-mono block mb-2">02</span>
              <h4 className="text-lg font-bold text-[#0F172A] font-instrument">
                Community Backs with STX
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Backers contribute STX directly to the campaign. Each contribution is tracked on-chain in micro-STX precision with live progress bars updating in real time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
              <span className="text-3xl font-extrabold text-[#FF5500] font-mono block mb-2">03</span>
              <h4 className="text-lg font-bold text-[#0F172A] font-instrument">
                Claim Funds or Instant Refund
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                If target is reached after deadline, the creator claims the funds. If the target is missed, contributors invoke `claim-refund` to reclaim their tokens immediately.
              </p>
            </div>
          </div>

          {/* Launch App Trigger */}
          <div className="text-center mt-12">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95"
            >
              <span>Explore Campaigns on Dashboard</span>
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Security & Clarity Smart Contract Section */}
      <section id="security" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#FF5500] font-mono">
              Clarity Smart Contract
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] font-instrument">
              Predictable, Decidable, and Auditable
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Unlike Solidity, Clarity is interpreted directly on-chain and is strictly decidable. There are no re-entrancy attacks or unchecked external calls. Every state mutation is deterministic and verified against Stacks consensus.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="text-xs font-mono font-semibold text-[#FF5500] hover:underline flex items-center gap-1"
              >
                <span>Try Contract Functions on the Dashboard ↗</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 font-mono text-xs shadow-lg overflow-x-auto">
            <div className="flex items-center gap-2 mb-4 text-slate-500 pb-3 border-b border-slate-800">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              <span className="ml-2 text-slate-400">crowdfund.clar</span>
            </div>
            <pre className="text-slate-300 leading-relaxed">
{`;; 1. Create a Campaign
(define-public (create-campaign (target-stx uint) (duration uint))
  (let ((end-block (+ block-height duration)))
    (asserts! (> target-stx u0) ERR_INVALID_AMOUNT)
    (map-insert Campaigns id { creator: tx-sender, ... })))

;; 2. Fund Campaign
(define-public (fund-campaign (campaign-id uint) (amount uint))
  (asserts! (< block-height (get end-block campaign)) ERR_EXPIRED)
  (try! (stx-transfer? amount tx-sender contract-address)))

;; 3. Claim Funds or Refund
(claim-funds (campaign-id uint))
(claim-refund (campaign-id uint))`}
            </pre>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-instrument">
            Ready to Crowdfund on Bitcoin?
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Connect your testnet wallet and launch your campaign with block-height security in under 60 seconds.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#E04B00] text-white text-sm font-semibold tracking-wide transition-all shadow-md active:scale-95"
            >
              <span>Launch StacksRaise App</span>
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
