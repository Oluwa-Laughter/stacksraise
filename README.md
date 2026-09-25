# <img src="frontend/public/favicon.svg" width="32" height="32" alt="StacksRaise Logo" valign="middle" /> StacksRaise

> **Decentralized block-height crowdfunding secured by Bitcoin on Stacks.**

[![Stacks Testnet](https://img.shields.io/badge/Network-Stacks%20Testnet-FF5500?style=flat-square)](https://explorer.hiro.so/txid/0xf175d11ad806e4a51474667a274f2151af9cab792cbbd7b9ceeaaca8051a3d27?chain=testnet)
[![Clarity 2](https://img.shields.io/badge/Clarity-Epoch%202.5-blue?style=flat-square)](https://docs.stacks.co/clarity)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5.18-black?style=flat-square)](https://nextjs.org/)
[![Scaffold Stacks](https://img.shields.io/badge/Built%20With-Scaffold%20Stacks-orange?style=flat-square)](https://scaffoldstacks.mintlify.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Testnet Deployment](#-live-testnet-deployment)
- [System Architecture](#-system-architecture)
- [On-Chain Project Registration (Zero LocalStorage)](#-on-chain-project-registration-zero-localstorage)
- [Project Directory Structure](#-project-directory-structure)
- [Smart Contract Specification](#-smart-contract-specification)
- [Frontend Experience & Lifecycle States](#-frontend-experience--lifecycle-states)
- [Developer Quickstart](#-developer-quickstart)
- [Test & Verification Results](#-test--verification-results)
- [Feedback — Scaffold Stacks Experience](#-feedback--scaffold-stacks-experience)
- [License](#-license)

---

## 🌟 Overview

**StacksRaise** is a trustless, decentralized crowdfunding protocol built on the Stacks blockchain and anchored to Bitcoin consensus.

Traditional crowdfunding platforms suffer from opaque escrow custody, third-party payment freezes, high processing fees, and arbitrarily extended campaign deadlines. StacksRaise eliminates counterparty risk by encoding campaign logic into immutable Clarity smart contracts where:
1. **Deadlines are governed strictly by Bitcoin tenure block heights** (Clarity `block-height`).
2. **Funds are locked in non-custodial smart contract escrow vaults**.
3. **Guaranteed 1-Click Refunds**: If a campaign falls short of its goal when the deadline arrives, contributors can immediately claim 100% of their STX back directly on-chain.
4. **100% On-Chain Project Registration**: Campaign titles and missions are stored directly in Clarity contract maps—**no browser local storage or centralized database**.
5. **Zero Mock Data**: All feed cards, balance metrics, and live block trackers read directly from Stacks Testnet nodes and smart contracts.

---

## 🔗 Live Testnet Deployment

| Parameter | Value |
| :--- | :--- |
| **Contract Name** | `crowdfund-v2` |
| **Contract Address** | `ST3E6N4PVNF8H0BJVQQR5A6KA9HMD9DDV5SW988C9.crowdfund-v2` |
| **Deployment Transaction** | [`0xf175d11ad806e4a51474667a274f2151af9cab792cbbd7b9ceeaaca8051a3d27`](https://explorer.hiro.so/txid/0xf175d11ad806e4a51474667a274f2151af9cab792cbbd7b9ceeaaca8051a3d27?chain=testnet) |
| **Status** | **SUCCESS (Confirmed On-Chain)** |
| **Key Features** | 100% On-Chain Metadata (`title`, `description`), Autonomous Escrow, Guaranteed Refunds |
| **Hiro Testnet Explorer** | [View Contract on Hiro Explorer ↗](https://explorer.hiro.so/txid/0xf175d11ad806e4a51474667a274f2151af9cab792cbbd7b9ceeaaca8051a3d27?chain=testnet) |

---

## 🏗 System Architecture

```mermaid
flowchart TD
    A([User: Backer or Creator]) -->|Connects Wallet| B[Stacks Multi-Wallet\nXverse / Leather / Stacks Connect v8]
    B -->|Signs & Authenticates| C[Next.js 15 Frontend Application\nLanding Page & Campaigns Dashboard]
    
    C -->|1. Register Project| D[Create Campaign Modal\nOn-Chain Title + Description + Goal]
    C -->|2. Back Campaign| E[Fund Campaign Modal\nSTX Contribution + Smart Escrow]
    C -->|3. Settle Milestone| F[Campaign Card Actions\nCreator Payout or 100% Backer Refund]
    
    D -->|Broadcast Signed Tx| G[Hiro Stacks Testnet RPC Node]
    E -->|Broadcast Signed Tx| G
    F -->|Broadcast Signed Tx| G
    
    C -.->|Server-side Node Proxies| H[Next.js Edge API Routes\n/api/stacks/info & /api/stacks/balance]
    H -.->|Poll Live Block Height & Balances| G
    
    G -->|Execute Contract Mutations & Reads| I[(crowdfund-v2.clar\nClarity Smart Contract Escrow)]
    I -->|Enforce Tenure Block Deadlines| J[(Bitcoin Consensus Layer 1\nProof of Transfer & Block Height Anchoring)]
```

### Architecture Highlights:
- **Clarity Smart Contract**: Epoch 2.5 compatible, enforces mathematical pre-conditions (`asserts!`), micro-STX precision, and zero-custody escrow.
- **Scaffold Stacks TypeScript SDK**: Auto-generated type-safe bindings (`frontend/src/generated/`) map Clarity functions directly to React hooks.
- **Server-Side API Proxies (`/api/stacks/*`)**: Route requests server-side through Next.js to bypass client adblockers (Brave Shields, uBlock) and browser CORS restrictions.
- **Jotai State Store**: Manages reactive wallet connection, balance fetching, and tenure chain tip updates.
- **Framer Motion Micro-Interactions**: Smooth view transitions, responsive spring modals, and animated progress bars.

---

## 🛡 On-Chain Project Registration

When a creator creates a crowdfunding campaign:
- **Project Title / Name** (`string-ascii 64`): Stored directly in the `Campaigns` Clarity data map.
- **Project Mission & Description** (`string-utf8 256`): Stored immutably on-chain so every contributor can read the project's exact purpose, roadmap, and delivery promise.
- **Validation**: Enforced at the consensus layer with `ERR_EMPTY_TITLE (u108)` and `ERR_EMPTY_DESCRIPTION (u109)`.

---

## 📁 Project Directory Structure

```text
stacks-raise/
├── contracts/                            # Smart Contract Layer
│   ├── Clarinet.toml                     # Clarinet project configuration
│   ├── contracts/
│   │   ├── crowdfund-v2.clar             # Active Clarity contract with on-chain project metadata
│   │   └── crowdfund.clar                # Base Clarity crowdfunding contract
│   ├── deployments/
│   │   ├── default.simnet-plan.yaml      # Clarinet simnet plan for in-memory unit tests
│   │   └── default.testnet-plan.yaml     # Live testnet deployment record
│   ├── settings/
│   │   ├── Devnet.toml                   # Devnet network config
│   │   ├── Testnet.toml.example          # Safe template for testnet deployment mnemonics
│   │   └── Testnet.toml                  # [GITIGNORED] Real testnet deployment secrets
│   └── tests/
│       └── crowdfund.test.ts             # 6 comprehensive Vitest unit tests (100% pass)
│
├── frontend/                             # Next.js App Router Web Application
│   ├── package.json                      # Next.js 15.5.18, React 18, @stacks/connect v8
│   ├── public/
│   │   ├── apple-touch-icon.png          # High-resolution Apple icon
│   │   ├── favicon.ico                   # Standard favicon
│   │   └── favicon.svg                   # Scalable vector favicon
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/stacks/
│   │   │   │   ├── balance/route.ts      # Server-side proxy for user STX balance
│   │   │   │   └── info/route.ts         # Server-side proxy for live chain tip
│   │   │   ├── dashboard/page.tsx        # dApp Crowdfunding Dashboard with Zone Routing
│   │   │   ├── globals.css               # Sharp borders, custom scrollbar stability
│   │   │   ├── layout.tsx                # Root layout, metadata & Footer
│   │   │   └── page.tsx                  # Landing page with escrow breakdown & FAQs
│   │   ├── components/
│   │   │   ├── BlockHeightBadge.tsx      # Real-time pulsing tenure block height indicator
│   │   │   ├── CampaignCard.tsx          # Dynamic campaign card displaying title, mission & progress
│   │   │   ├── CampaignFeed.tsx          # Dynamic feed fetching on-chain campaigns
│   │   │   ├── CreateCampaignModal.tsx   # Modal with title, mission, live block estimates & loading states
│   │   │   ├── Footer.tsx                # Responsive footer with mobile-safe layout & contract ID
│   │   │   ├── FundCampaignModal.tsx     # Modal displaying project mission, quick presets & signing states
│   │   │   ├── Header.tsx                # Responsive header with mobile hamburger drawer
│   │   │   ├── StatsBanner.tsx           # Aggregated real-time metrics
│   │   │   └── WalletConnect.tsx         # Multi-wallet connector with portaled centering
│   │   ├── generated/                    # Auto-generated by `stacksdapp generate`
│   │   │   ├── contracts.ts              # Clarity contract function wrappers
│   │   │   ├── deployments.json          # Deployment records & active contract IDs
│   │   │   └── hooks.ts                  # React hooks for read/write calls
│   │   ├── lib/
│   │   │   └── stacks-utils.ts           # Tenure height resolver, micro-STX converters
│   │   └── store/
│   │       └── wallet.ts                 # Jotai wallet atoms
│   └── scaffold.config.ts                # Network resolver (devnet / testnet / mainnet)
│
├── AGENTS.md                             # AI Agent guide & CLI instructions
├── README.md                             # Project documentation (this file)
└── stacksdapp.toml                       # Scaffold Stacks workspace configuration
```

---

## 📜 Smart Contract Specification

The smart contract [`contracts/contracts/crowdfund-v2.clar`](file:///home/laughter/Desktop/Hackathon/stacks-raise/contracts/contracts/crowdfund-v2.clar) implements the complete crowdfunding lifecycle in Clarity:

### Core Public Methods:

| Function | Parameters | Description |
| :--- | :--- | :--- |
| `create-campaign` | `title: (string-ascii 64)`, `description: (string-utf8 256)`, `target-stx: uint`, `duration-blocks: uint` | Registers a new project on-chain with title, mission, target micro-STX, and calculates immutable deadline `end-block = block-height + duration-blocks`. |
| `fund-campaign` | `campaign-id: uint`, `amount-stx: uint` | Verifies `block-height < end-block` and transfers STX from contributor into contract escrow. Updates contributor balances. Supports stretch goals. |
| `claim-funds` | `campaign-id: uint` | Allows creator to claim funds if `block-height >= end-block` and `raised >= target`. |
| `claim-refund` | `campaign-id: uint` | Allows contributors to reclaim 100% of their STX if `block-height >= end-block` and `raised < target`. |

### Read-Only Getters:
- `get-campaign (campaign-id uint)`: Returns campaign record (`creator`, `title`, `description`, `target-stx`, `raised-stx`, `end-block`, `claimed`).
- `get-campaign-count ()`: Returns total number of registered campaigns.
- `get-contribution (campaign-id uint, contributor principal)`: Returns a backer's individual contribution.
- `get-current-block-height ()`: Returns current tenure block height from Clarity runtime.

---

## 🎨 Frontend Experience & Lifecycle States

### Responsive Transaction Lifecycle:
- **Button Locking & Loading Animation**: Whenever a creator or backer submits a transaction:
  1. **Phase 1 (Signature)**: All form inputs and buttons are disabled; button shows *"Waiting for Wallet Signature..."* with an animated spinner.
  2. **Phase 2 (Mempool Confirmation)**: Button remains locked with *"Confirming on Stacks..."* while polling the Stacks node.
  3. **Phase 3 (State Settlement)**: Displays *"✓ Confirmed On-Chain!"* and automatically triggers a reactive data re-render.
- **Clean Responsive Mobile Design**:
  - Full mobile hamburger menu with clean links (`Home`, `Dashboard`).
  - Mobile footer truncates overflowing contract hashes to display a clean copyright notice on small screens, preserving full details on desktop viewports.
- **Consensus Tenure Block Accuracy**:
  - Distinguishes between Nakamoto fast streaming blocks (`530k+`) and Clarity consensus tenure blocks (`~19k`), ensuring active campaigns never prematurely show as expired.

---

## 💻 Developer Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v20+)
- [Clarinet](https://github.com/hirosystems/clarinet) (v2.x or v3.x)
- [Rust & Cargo](https://rustup.rs/) (for `stacksdapp` CLI)
- [stacksdapp CLI](https://scaffoldstacks.mintlify.app/)

### 1. Clone & Install
```bash
git clone https://github.com/Oluwa-Laughter/stacksraise.git
cd stacks-raise
stacksdapp doctor
```

### 2. Verify Smart Contract & Run Tests
```bash
# Type-check Clarity contract
stacksdapp check

# Run Vitest contract unit tests
npm test --prefix contracts
```

### 3. Generate TypeScript Bindings
```bash
stacksdapp generate
```

### 4. Run Frontend Locally
```bash
stacksdapp dev --network testnet
# or
cd frontend && npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Test & Verification Results

### Clarity Contract Type-Check (`stacksdapp check`):
```text
[check] Type-checking Clarity contracts...
✔ 1 contract checked
[check] All contracts passed type-checking.
```

### Smart Contract Unit Test Suite (`npm test --prefix contracts`):
```text
 ✓ tests/crowdfund.test.ts (6 tests)
   ✓ crowdfund
     ✓ initializes with 0 campaigns
     ✓ can create a new campaign with title and description
     ✓ rejects campaign with empty title, 0 target or 0 duration
     ✓ allows contributors to fund a campaign
     ✓ creator can claim funds when goal met and expired
     ✓ contributor can claim refund if goal missed and campaign expired

Test Files  1 passed (1)
Tests       6 passed (6)
All tests passed.
```

### Production Build (`npm run build` in `frontend`):
```text
✓ Compiled successfully in 5.4s
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (7/7)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)
┌ ○ /                                    (Landing Page)
├ ○ /_not-found                          (Not Found)
├ ƒ /api/stacks/balance                  (STX Balance Proxy)
├ ○ /api/stacks/info                     (Chain Tip Proxy)
└ ○ /dashboard                           (Crowdfunding Dashboard)
```

---

## 💬 Feedback — Scaffold Stacks Experience

Building **StacksRaise** with [Scaffold Stacks](https://scaffoldstacks.mintlify.app/) for the Test-Flight Bounty was an exceptionally productive and empowering developer experience. Below is our honest, detailed feedback covering the wins, developer velocity advantages, and constructive suggestions for future versions of the toolkit:

### 🌟 What Worked Incredibly Well:

1. **Instant Project Scaffolding & Simnet Harness:**
   - Setting up a full-stack Clarity 2.5 dApp was straightforward. The unified directory structure separating smart contracts and frontend while sharing configurations saved significant initial setup time.
   - Clarinet's in-memory simnet integration allowed us to write unit tests in Vitest (`contracts/tests/crowdfund.test.ts`) and verify math invariants, error codes, and block boundary conditions in milliseconds before deploying to testnet.

2. **Auto-Generated Type-Safe Hooks (`stacksdapp generate`):**
   - The TypeScript code generator is the single biggest developer velocity boost in the ecosystem.
   - Mapping Clarity contract functions directly to typed React hooks (`useCrowdfundV2CreateCampaign`, `useCrowdfundV2FundCampaign`, `useCrowdfundV2GetCampaign`) eliminated hundreds of lines of fragile manual tuple serialization, buffer encoding, and CV (Clarity Value) boilerplate.

3. **Multi-Wallet Compatibility via `@stacks/connect` v8:**
   - Out-of-the-box integration with Leather and Xverse worked reliably across modern Stacks standards.
   - Session restoration and reactive account changes integrated cleanly with our Jotai state atoms, making wallet connection management hassle-free.

---

### 💡 Constructive Suggestions & Opportunities for Improvement:

1. **Built-in Testnet Faucet CLI Command:**
   - **Context:** During rapid iteration cycles, testnet deployer addresses and contributor test accounts frequently hit gas constraints.
   - **Suggestion:** Adding a command like `stacksdapp faucet [address]` or a built-in proxy in the CLI to request testnet STX directly would save developers from constantly switching between web faucets and the terminal.

2. **First-Class Edge / SSR Node Proxies for Browser Resilience:**
   - **Context:** Modern privacy-focused browsers (Brave Shields, Firefox Enhanced Tracking, uBlock Origin) often flag or block direct client-side fetch requests to public RPC nodes like `https://api.testnet.hiro.so`.
   - **Our Solution:** We built Next.js server-side Edge API proxy routes (`/api/stacks/info` and `/api/stacks/balance`) to fetch live chain tips and account balances server-to-server.
   - **Suggestion:** Providing pre-configured server-side API proxy route templates out-of-the-box in the Scaffold Stacks frontend scaffold would ensure every developer's dApp works flawlessly across all user browser environments without manual proxy troubleshooting.

3. **Clarity Map Iteration / Feed Helper Patterns:**
   - **Context:** Clarity data maps are non-enumerable on-chain by design. Generating frontend feeds requires tracking an on-chain counter (`campaign-count`) and batching reads.
   - **Suggestion:** Adding recommended patterns or helper hooks in Scaffold Stacks documentation for batched map reads (e.g., `useBatchReadMap`) would help teams building feed-driven dApps (marketplaces, DAOs, crowdfunding) avoid common N+1 query pitfalls.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).

