# StacksRaise — Submission Summary & Zero Authority DAO Feedback

## 1. Project Identity
- **Project Name:** StacksRaise
- **Repository / Monorepo Package:** `stacks-raise`
- **Tagline:** Decentralized block-height crowdfunding secured by Bitcoin
- **Bounty:** Scaffold Stacks Test-Flight Bounty (Zero Authority DAO)
- **Target Network:** Stacks Testnet
- **Visual Identity & Design System:**
  - Primary Surface: Pure crisp white (`#FFFFFF`) with subtle neutral backgrounds (`#F8FAFC`, `#F1F5F9`).
  - Brand Accents: Official Stacks Orange (`#FF5500` / `#FF6B00`) for primary CTAs, active status indicators, and animated progress bars.
  - Typography & Borders: Sharp 1px borders (`#E2E8F0`), dark slate text (`#0F172A`, `#334155`), and subtle elevations (`shadow-sm`, hover `shadow-md`).
  - Animations: Powered by Framer Motion with entry transitions (`initial={{ opacity: 0, y: 16 }}` -> `animate={{ opacity: 1, y: 0 }}`), spring-modal popups, and animated progress-bar fills.

---

## 2. Architecture & Engineering Overview

### A. Clarity Smart Contract (`contracts/contracts/crowdfund.clar`)
- **Unit Precision:** Micro-STX (1 STX = 1,000,000 uSTX) with automatic frontend conversion.
- **State Data Maps:**
  - `Campaigns`: Stores creator principal, target micro-STX, total raised micro-STX, deadline block height, and claimed boolean flag.
  - `Contributions`: Tracks individual contribution amounts keyed by `{ campaign-id, contributor }`.
- **Core Public Functions:**
  1. `create-campaign (target-stx uint, duration-blocks uint)`: Initializes campaign with target and duration, calculating deadline: `end-block = block-height + duration-blocks`.
  2. `fund-campaign (campaign-id uint, amount-stx uint)`: Verifies campaign is before `end-block`, transfers STX from contributor to contract principal, and updates campaign totals and contributor balances.
  3. `claim-funds (campaign-id uint)`: Enforces creator-only access after deadline expiration (`block-height >= end-block`), requiring `raised >= target` and preventing double-claims.
  4. `claim-refund (campaign-id uint)`: Allows contributors to reclaim their STX if the campaign misses its goal after deadline expiration (`block-height >= end-block` and `raised < target`).
- **Read-Only Getters:**
  - `get-campaign (campaign-id uint)`: Full campaign tuple.
  - `get-campaign-count ()`: Returns total number of registered campaigns.
  - `get-contribution (campaign-id uint, contributor principal)`: Returns specific contributor amount.
  - `get-current-block-height ()`: Returns current chain tip block height.

### B. Strict Guardrails: Zero Mock Data & Live Chain Awareness
- **Zero Mock or Prewritten Data:** Every campaign card, counter, balance, and status badge is loaded dynamically from on-chain contract state and connected wallet state.
- **Empty State UX:** When `get-campaign-count` returns `0`, the UI renders a clean empty state card prompting the user to create the first live testnet campaign.
- **Live Chain Tip Synchronization:** Polled directly from the live Stacks Testnet node (`https://api.testnet.hiro.so/v2/info`), tracking both Stacks tip height and Bitcoin burn block height with a pulsing indicator. Remaining blocks and estimated completion times (~10 min/block) update in real-time.
- **Wallet Integration:** Connected via `@stacks/connect` v8 and Jotai state, displaying live testnet STX balance fetched directly from Hiro node API alongside truncated principal address.

---

## 3. Scaffold Stacks Test-Flight Feedback Log

### Positive Highlights:
1. **Developer Velocity:** `stacksdapp new` and `stacksdapp generate` provide a streamlined developer experience for bridging Clarity smart contracts with Next.js App Router frontends.
2. **Type Safety & Codegen:** Automated generation of `contracts.ts` and `hooks.ts` removes manual ABI wiring and boilerplate for contract calls and read-only queries.
3. **Simnet Vitest Integration:** Running `stacksdapp test` executes rapid in-memory contract tests without requiring a heavy Docker daemon.

### Friction Points & Improvement Recommendations:
1. **Clarinet Version & Special Forms:**
   - In newer Clarinet releases, special forms like `as-contract` inside function arguments require let-bindings or specific Clarity epoch compatibility. Clarifying error messages or providing automated linter suggestions inside `stacksdapp check` would speed up troubleshooting.
2. **`stacksdapp new .` directory handling:**
   - The CLI rejects `.` or `..` as project names (`Error: Project name cannot be '.' or '..'`). Supporting `stacksdapp new .` or `stacksdapp init` in an existing folder without creating a nested directory would improve scaffolding workflows in pre-cloned repositories.
3. **Non-interactive testnet deployment:**
   - Support for `DEPLOYER_MNEMONIC` or `DEPLOYER_KEY` environment variables alongside `Testnet.toml` would enhance CI/CD deployment pipelines.

---

## 4. Verification and Test Results

### 1. Clarity Contract Type Check (`stacksdapp check`):
```bash
$ stacksdapp check
[check] Type-checking Clarity contracts...
✔ 1 contract checked
[check] All contracts passed type-checking.
```

### 2. Contract Unit Test Suite (`stacksdapp test`):
```bash
$ stacksdapp test
 ✓ tests/crowdfund.test.ts (6 tests) 321ms
   ✓ crowdfund (6)
     ✓ initializes with 0 campaigns
     ✓ can create a new campaign
     ✓ rejects campaign with 0 target or 0 duration
     ✓ allows contributors to fund a campaign
     ✓ creator can claim funds when goal met and expired
     ✓ contributor can claim refund if goal missed and campaign expired

Test Files  1 passed (1)
Tests       6 passed (6)
All tests passed.
```

### 3. Frontend Production Build (`npm run build`):
```bash
$ cd frontend && npm run build
✓ Compiled successfully in 31.4s
✓ Linting and checking validity of types
✓ Generating static pages (4/4)
Route (app)
┌ ○ /
└ ○ /_not-found
```

---

## 5. Quickstart Commands

```bash
# 1. Type-check smart contract
stacksdapp check

# 2. Regenerate TypeScript bindings & hooks
stacksdapp generate

# 3. Run unit tests
stacksdapp test

# 4. Deploy to Stacks Testnet
# (Add your testnet deployer mnemonic to contracts/settings/Testnet.toml)
stacksdapp deploy --network testnet --yes

# 5. Start development environment
stacksdapp dev --network testnet
```
