"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockHeightBadge } from '../components/BlockHeightBadge';
import { WalletConnect } from '../components/WalletConnect';
import { scaffoldConfig } from '../scaffold.config';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'success' | 'refund'>('success');

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col selection:bg-orange-100 selection:text-[#FF5500] overflow-x-hidden">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo (Clickable) */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-[#FF5500] flex items-center justify-center shadow-sm group-hover:bg-[#E04B00] transition-colors shrink-0">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-[#0F172A] font-instrument">
                Stacks<span className="text-[#FF5500]">Raise</span>
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-orange-50 text-[#FF5500] border border-orange-200">
              {scaffoldConfig.network.toUpperCase()}
            </span>
          </div>

          {/* Navigation Anchor Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a
              href="#features"
              onClick={(e) => scrollToSection(e, 'features')}
              className="hover:text-[#FF5500] transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="hover:text-[#FF5500] transition-colors"
            >
              How It Works
            </a>
            <a
              href="#security"
              onClick={(e) => scrollToSection(e, 'security')}
              className="hover:text-[#FF5500] transition-colors"
            >
              Security & Escrow
            </a>
            <a
              href="#faq"
              onClick={(e) => scrollToSection(e, 'faq')}
              className="hover:text-[#FF5500] transition-colors"
            >
              FAQ
            </a>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden lg:block">
              <BlockHeightBadge />
            </div>

            {/* Only Launch App directs to /dashboard */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95 whitespace-nowrap"
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

            <div className="hidden sm:block">
              <WalletConnect />
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs text-slate-500 font-mono">Live Stacks Tip:</span>
                <BlockHeightBadge />
              </div>

              <div className="space-y-1 text-sm font-semibold text-slate-700">
                <a
                  href="#features"
                  onClick={(e) => scrollToSection(e, 'features')}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-[#FF5500] transition-colors"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  onClick={(e) => scrollToSection(e, 'how-it-works')}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-[#FF5500] transition-colors"
                >
                  How It Works
                </a>
                <a
                  href="#security"
                  onClick={(e) => scrollToSection(e, 'security')}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-[#FF5500] transition-colors"
                >
                  Security & Escrow Guarantee
                </a>
                <a
                  href="#faq"
                  onClick={(e) => scrollToSection(e, 'faq')}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-[#FF5500] transition-colors"
                >
                  Frequently Asked Questions
                </a>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <div className="sm:hidden">
                  <WalletConnect />
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Launch Dashboard App</span>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-20 sm:pb-24">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[650px] h-[350px] bg-orange-100/40 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-5 sm:space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#FF5500] border border-orange-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
                <span>Secured by Bitcoin Block Height & Clarity Smart Contracts</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight font-instrument leading-[1.15] break-words">
                Decentralized Crowdfunding{' '}
                <span className="text-[#FF5500] inline-block">Secured by Bitcoin</span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-2xl">
                The trustless crowdfunding protocol where campaign deadlines are enforced strictly by Bitcoin block-height timestamps. 100% non-custodial Clarity escrow, automated refunds on missed goals, and zero middlemen.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
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
                  onClick={(e) => scrollToSection(e, 'how-it-works')}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold tracking-wide transition-all border border-slate-200 shadow-sm flex items-center justify-center"
                >
                  How It Works
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-500 font-mono">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Zero Mock Data</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>100% Contributor Protection</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
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
              <div className="relative mx-auto max-w-sm sm:max-w-md bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
                {/* Mock Campaign Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800 shrink-0">
                      #1 LIVE
                    </span>
                    <span className="text-xs font-mono text-slate-500 truncate">by ST3E...88C9</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#FF5500] border border-orange-200 shrink-0">
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
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#0F172A]">
                      85.50 <span className="text-sm font-normal text-slate-500">STX</span>
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Goal: <strong>100.0 STX</strong>
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
                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase text-slate-400 truncate">Target Block</span>
                    <span className="font-semibold text-slate-800">#528,764</span>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase text-slate-400 truncate">Blocks Left</span>
                    <span className="font-semibold text-[#FF5500] truncate block">144 blocks (~24h)</span>
                  </div>
                </div>

                {/* Call to action inside card */}
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 px-4 rounded-lg bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Explore Campaigns on Dashboard</span>
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
            <motion.div whileHover={{ y: -2 }}>
              <span className="block text-2xl sm:text-3xl font-bold font-mono text-[#0F172A]">
                100%
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                On-Chain Clarity Escrow
              </span>
            </motion.div>
            <motion.div whileHover={{ y: -2 }}>
              <span className="block text-2xl sm:text-3xl font-bold font-mono text-[#FF5500]">
                ~10 Min
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                Bitcoin Block Settlement
              </span>
            </motion.div>
            <motion.div whileHover={{ y: -2 }}>
              <span className="block text-2xl sm:text-3xl font-bold font-mono text-[#0F172A]">
                1 uSTX
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                Granular Contribution Precision
              </span>
            </motion.div>
            <motion.div whileHover={{ y: -2 }}>
              <span className="block text-2xl sm:text-3xl font-bold font-mono text-emerald-600">
                0%
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                Custodial Middleman Risk
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#FF5500] font-mono">
            Architected for Bitcoin
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-instrument mt-2">
            Why Block-Height Crowdfunding Matters
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Traditional crowdfunding suffers from opaque escrow custody, chargebacks, and arbitrary platform freezes. StacksRaise solves this on Bitcoin Layer 2.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
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
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
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
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
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
          </motion.div>

          {/* Card 4 */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
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
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#FF5500] font-mono">
              Simple 3-Step Lifecycle
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-instrument mt-2">
              How StacksRaise Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Transparent, automated, and secure from campaign creation to final payout.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <motion.div
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative"
            >
              <span className="text-3xl font-extrabold text-[#FF5500] font-mono block mb-2">01</span>
              <h4 className="text-lg font-bold text-[#0F172A] font-instrument">
                Create Campaign
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Connect your wallet and define your STX funding goal along with duration in blocks (e.g. 144 blocks ≈ 24 hours). The smart contract sets the immutable deadline block.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative"
            >
              <span className="text-3xl font-extrabold text-[#FF5500] font-mono block mb-2">02</span>
              <h4 className="text-lg font-bold text-[#0F172A] font-instrument">
                Community Backs with STX
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Backers contribute STX directly to the campaign. Each contribution is tracked on-chain in micro-STX precision with live progress bars updating in real time.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative"
            >
              <span className="text-3xl font-extrabold text-[#FF5500] font-mono block mb-2">03</span>
              <h4 className="text-lg font-bold text-[#0F172A] font-instrument">
                Claim Funds or Instant Refund
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                If target is reached after deadline, the creator claims the funds. If the target is missed, contributors invoke claim-refund to reclaim their tokens immediately.
              </p>
            </motion.div>
          </div>

          {/* Launch App Trigger */}
          <div className="text-center mt-10 sm:mt-12">
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

      {/* Real-World User-Friendly Security & Escrow Guarantee Section */}
      <section id="security" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text Explanations */}
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Backer & Creator Protection</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] font-instrument leading-tight">
              Built-In Escrow Guarantee for Every Backer
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              On traditional crowdfunding platforms, your money sits in corporate bank accounts with risk of chargebacks, payment holds, and platform freezes. StacksRaise eliminates counterparty risk using autonomous smart contracts secured by Bitcoin consensus.
            </p>

            {/* Key Guarantees List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">Zero-Middleman Smart Escrow</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Funds are locked in the autonomous contract vault. Not even the platform developers can touch or redirect your contribution.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">Guaranteed 1-Click Refunds</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    If a campaign falls short of 100% when the deadline block arrives, contributors can immediately claim a full refund directly to their wallet. No customer support forms, no disputes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">Tamper-Proof Bitcoin Deadlines</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Deadlines are enforced by immutable Bitcoin blocks. Deadlines cannot be secretly extended or retroactively modified by creators.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Interactive Protection Flow Visualizer */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-slate-800">
                  How Escrow Settlement Works
                </span>
              </div>
              {/* Tab Selector */}
              <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('success')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === 'success'
                      ? 'bg-white text-emerald-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Goal Met
                </button>
                <button
                  onClick={() => setActiveTab('refund')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === 'refund'
                      ? 'bg-white text-[#FF5500] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Goal Missed
                </button>
              </div>
            </div>

            {/* Dynamic Interactive Flow State */}
            <div className="mt-5 space-y-4">
              {activeTab === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-800">
                        SCENARIO: TARGET REACHED (≥ 100%)
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        SUCCESSFUL CAMPAIGN
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      The campaign reached or exceeded its target STX before the deadline block.
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs font-mono">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-[10px]">1</span>
                      <span className="text-slate-700">Deadline block height reached on Bitcoin L2</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-[10px]">2</span>
                      <span className="text-slate-700">Creator clicks "Claim Funds"</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-semibold">
                      <span className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center font-bold text-emerald-800 text-[10px]">✓</span>
                      <span>Total raised STX transfers instantly from contract to creator</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#FF5500]">
                        SCENARIO: TARGET MISSED (&lt; 100%)
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-[#FF5500]">
                        REFUND GUARANTEED
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      The campaign deadline arrived, but the total raised was less than the target.
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs font-mono">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-[10px]">1</span>
                      <span className="text-slate-700">Deadline block reached on Bitcoin L2</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-[10px]">2</span>
                      <span className="text-slate-700">Contributor clicks "Claim Refund" button</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-900 font-semibold">
                      <span className="w-5 h-5 rounded-full bg-orange-200 flex items-center justify-center font-bold text-orange-900 text-[10px]">✓</span>
                      <span>100% of user's contribution returns to their wallet immediately</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Button to launch app */}
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Experience Live Campaigns on Dashboard</span>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Section */}
      <section id="faq" className="py-16 sm:py-20 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#FF5500] font-mono">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-instrument mt-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Everything you need to know about crowdfunding on Stacks and Bitcoin.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
              <h3 className="text-sm font-bold text-[#0F172A]">
                What happens if a campaign misses its funding target?
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                If the deadline block height passes and the campaign has not reached 100% of its target STX, contributors can click the "Claim Refund" button on the campaign card. The smart contract immediately sends 100% of their contribution back to their Stacks wallet.
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
              <h3 className="text-sm font-bold text-[#0F172A]">
                How are deadlines determined?
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Deadlines are measured in Bitcoin/Stacks block heights rather than calendar dates. Because blocks are produced roughly every 10 minutes by network miners, 144 blocks represent approximately 24 hours. Block timestamps cannot be forged or altered by creators.
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
              <h3 className="text-sm font-bold text-[#0F172A]">
                Which wallets can I use?
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                StacksRaise supports both Xverse and Leather wallets, as well as any Stacks-compatible wallet. Make sure your wallet is set to Stacks Testnet to interact with live testnet campaigns.
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
              <h3 className="text-sm font-bold text-[#0F172A]">
                Can platform owners or creators freeze my funds?
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                No. StacksRaise smart contracts are strictly non-custodial and open-source. The contract code alone dictates the movement of STX. Neither the creators nor the platform team possess any special administrative keys or backdoors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="bg-slate-50 border-t border-slate-200 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-instrument">
            Ready to Crowdfund on Bitcoin?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Connect your testnet wallet and launch your campaign with block-height security in under 60 seconds.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#E04B00] text-white text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg active:scale-95"
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
