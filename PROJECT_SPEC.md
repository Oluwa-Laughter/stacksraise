# StacksRaise Specification & Architecture

## Core Metadata
- Project: StacksRaise
- Monorepo Package: `stacks-raise`
- Contract: `contracts/contracts/crowdfund.clar`
- Target Network: Stacks Testnet
- Unit Conversion: All on-chain amounts are micro-STX (1 STX = 1,000,000 uSTX)

## Palette & Design System
- Backgrounds: `#FFFFFF` (primary cards/nav), `#F8FAFC` (page body), `#F1F5F9` (input backgrounds)
- Accent Orange: `#FF5500` (primary CTA, active status, progress indicator)
- Accent Orange Hover: `#E04B00`
- Border Color: `#E2E8F0`
- Typography: `#0F172A` (headings), `#475569` (body), `#94A3B8` (metadata/labels)
- Status Badges:
  - Active: Orange background (`bg-orange-50 text-orange-600 border-orange-200`)
  - Target Met: Emerald background (`bg-emerald-50 text-emerald-600 border-emerald-200`)
  - Expired/Failed: Slate background (`bg-slate-100 text-slate-600 border-slate-200`)

## Framer Motion Directives
- Campaign Cards: Entry animation `initial={{ opacity: 0, y: 16 }}` -> `animate={{ opacity: 1, y: 0 }}`.
- Progress Fill: `motion.div` animating `width` from `0%` to calculated percentage on mount.
- Modals: Backdrop blur fade with spring-scale modal dialog box.

## Contract Integration Guidelines
- Never hardcode mock campaigns.
- Use the generated hooks located in `frontend/src/generated/` created by `stacksdapp generate`.
- Fetch `get-campaign-count` on page load. Loop from `1` through count to populate state.
- If campaign count is 0, render an empty state card with a "Create First Campaign" trigger.
