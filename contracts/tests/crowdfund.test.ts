import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("crowdfund", () => {
  it("initializes with 0 campaigns", () => {
    const { result } = simnet.callReadOnlyFn("crowdfund", "get-campaign-count", [], deployer);
    expect(result).toBeOk(Cl.uint(0));
  });

  it("can create a new campaign", () => {
    // target: 100 STX (100,000,000 micro-STX), duration: 50 blocks
    const target = Cl.uint(100000000);
    const duration = Cl.uint(50);
    const { result } = simnet.callPublicFn("crowdfund", "create-campaign", [target, duration], deployer);
    expect(result).toBeOk(Cl.uint(1));

    // Verify campaign count is now 1
    const countRes = simnet.callReadOnlyFn("crowdfund", "get-campaign-count", [], deployer);
    expect(countRes.result).toBeOk(Cl.uint(1));

    // Verify campaign details
    const campaignRes = simnet.callReadOnlyFn("crowdfund", "get-campaign", [Cl.uint(1)], deployer);
    expect(campaignRes.result).toBeSome(
      Cl.tuple({
        creator: Cl.principal(deployer),
        "target-stx": target,
        "raised-stx": Cl.uint(0),
        "end-block": Cl.uint(simnet.blockHeight + 50),
        claimed: Cl.bool(false),
      })
    );
  });

  it("rejects campaign with 0 target or 0 duration", () => {
    const zeroTarget = simnet.callPublicFn("crowdfund", "create-campaign", [Cl.uint(0), Cl.uint(50)], deployer);
    expect(zeroTarget.result).toBeErr(Cl.uint(106));

    const zeroDuration = simnet.callPublicFn("crowdfund", "create-campaign", [Cl.uint(100000000), Cl.uint(0)], deployer);
    expect(zeroDuration.result).toBeErr(Cl.uint(106));
  });

  it("allows contributors to fund a campaign", () => {
    // Create campaign 1
    simnet.callPublicFn("crowdfund", "create-campaign", [Cl.uint(10000000), Cl.uint(100)], deployer);

    // Wallet 1 funds 5 STX (5,000,000 uSTX)
    const fund1 = simnet.callPublicFn("crowdfund", "fund-campaign", [Cl.uint(1), Cl.uint(5000000)], wallet1);
    expect(fund1.result).toBeOk(Cl.bool(true));

    // Check contribution
    const contrib = simnet.callReadOnlyFn("crowdfund", "get-contribution", [Cl.uint(1), Cl.principal(wallet1)], wallet1);
    expect(contrib.result).toBeOk(Cl.uint(5000000));

    // Wallet 2 funds 5 STX (5,000,000 uSTX) -> goal reached
    const fund2 = simnet.callPublicFn("crowdfund", "fund-campaign", [Cl.uint(1), Cl.uint(5000000)], wallet2);
    expect(fund2.result).toBeOk(Cl.bool(true));

    // Check total raised
    const campaignRes = simnet.callReadOnlyFn("crowdfund", "get-campaign", [Cl.uint(1)], deployer);
    expect(campaignRes.result).toBeSome(
      Cl.tuple({
        creator: Cl.principal(deployer),
        "target-stx": Cl.uint(10000000),
        "raised-stx": Cl.uint(10000000),
        "end-block": Cl.uint(102),
        claimed: Cl.bool(false),
      })
    );
  });

  it("creator can claim funds when goal met and expired", () => {
    // Create campaign with short duration (5 blocks)
    simnet.callPublicFn("crowdfund", "create-campaign", [Cl.uint(10000000), Cl.uint(5)], deployer);

    // Fund to target
    simnet.callPublicFn("crowdfund", "fund-campaign", [Cl.uint(1), Cl.uint(10000000)], wallet1);

    // Cannot claim while still active
    const earlyClaim = simnet.callPublicFn("crowdfund", "claim-funds", [Cl.uint(1)], deployer);
    expect(earlyClaim.result).toBeErr(Cl.uint(102)); // ERR_CAMPAIGN_STILL_ACTIVE

    // Advance blocks past end-block
    simnet.mineEmptyBlocks(6);

    // Non-creator cannot claim
    const impostorClaim = simnet.callPublicFn("crowdfund", "claim-funds", [Cl.uint(1)], wallet2);
    expect(impostorClaim.result).toBeErr(Cl.uint(100)); // ERR_NOT_CREATOR

    // Creator claims successfully
    const claimRes = simnet.callPublicFn("crowdfund", "claim-funds", [Cl.uint(1)], deployer);
    expect(claimRes.result).toBeOk(Cl.bool(true));

    // Cannot claim twice
    const doubleClaim = simnet.callPublicFn("crowdfund", "claim-funds", [Cl.uint(1)], deployer);
    expect(doubleClaim.result).toBeErr(Cl.uint(107)); // ERR_ALREADY_CLAIMED
  });

  it("contributor can claim refund if goal missed and campaign expired", () => {
    // Create campaign with target 20 STX, duration 5 blocks
    simnet.callPublicFn("crowdfund", "create-campaign", [Cl.uint(20000000), Cl.uint(5)], deployer);

    // Wallet 1 funds 8 STX (less than target)
    simnet.callPublicFn("crowdfund", "fund-campaign", [Cl.uint(1), Cl.uint(8000000)], wallet1);

    // Advance blocks past end-block
    simnet.mineEmptyBlocks(6);

    // Wallet 2 (no contribution) tries to claim refund -> fails
    const zeroRefund = simnet.callPublicFn("crowdfund", "claim-refund", [Cl.uint(1)], wallet2);
    expect(zeroRefund.result).toBeErr(Cl.uint(105)); // ERR_NO_CONTRIBUTION_FOUND

    // Wallet 1 claims refund -> succeeds
    const refundRes = simnet.callPublicFn("crowdfund", "claim-refund", [Cl.uint(1)], wallet1);
    expect(refundRes.result).toBeOk(Cl.bool(true));

    // Wallet 1 tries to claim refund again -> fails
    const doubleRefund = simnet.callPublicFn("crowdfund", "claim-refund", [Cl.uint(1)], wallet1);
    expect(doubleRefund.result).toBeErr(Cl.uint(105)); // ERR_NO_CONTRIBUTION_FOUND
  });
});
