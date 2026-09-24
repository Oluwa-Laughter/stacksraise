export const MICROSTX_PER_STX = 1_000_000n;

export interface CampaignData {
  id: number;
  creator: string;
  targetStx: bigint;
  raisedStx: bigint;
  endBlock: number;
  claimed: boolean;
}

export type CampaignStatus = 'ACTIVE' | 'TARGET_REACHED' | 'EXPIRED';

/** Converts micro-STX (bigint) to STX decimal string */
export function microStxToStx(microStx: bigint | number | string): string {
  try {
    const rawBig = typeof microStx === 'bigint' ? microStx : BigInt(String(microStx));
    const whole = rawBig / MICROSTX_PER_STX;
    const fraction = rawBig % MICROSTX_PER_STX;
    if (fraction === 0n) return whole.toString();
    const fracStr = fraction.toString().padStart(6, '0').replace(/0+$/, '');
    return `${whole}.${fracStr}`;
  } catch {
    return '0';
  }
}

/** Converts STX float/string to micro-STX bigint */
export function stxToMicroStx(stx: number | string): bigint {
  const numStr = String(stx).trim();
  if (!numStr || isNaN(Number(numStr))) return 0n;
  const [whole, fraction = ''] = numStr.split('.');
  const wholeBig = BigInt(whole || '0') * MICROSTX_PER_STX;
  const paddedFraction = fraction.slice(0, 6).padEnd(6, '0');
  const fractionBig = BigInt(paddedFraction);
  return wholeBig + fractionBig;
}

/** Formats STX number with comma separation and up to 2-6 decimals */
export function formatStx(microStx: bigint | number | string, maxDecimals: number = 4): string {
  const stxStr = microStxToStx(microStx);
  const parts = stxStr.split('.');
  const withCommas = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (!parts[1]) return withCommas;
  const dec = parts[1].slice(0, maxDecimals);
  return dec.length > 0 ? `${withCommas}.${dec}` : withCommas;
}

/** Truncates a Stacks principal address (e.g., ST1PQ...GZGM) */
export function formatAddress(address: string, front: number = 6, back: number = 4): string {
  if (!address) return '';
  if (address.length <= front + back) return address;
  return `${address.slice(0, front)}…${address.slice(-back)}`;
}

/** Generates Hiro Explorer link for transaction */
export function getExplorerTxUrl(txid: string, chain: string = 'testnet'): string {
  const cleanTxId = txid.startsWith('0x') ? txid : `0x${txid}`;
  return `https://explorer.hiro.so/txid/${cleanTxId}?chain=${chain}`;
}

/** Generates Hiro Explorer link for an address */
export function getExplorerAddressUrl(address: string, chain: string = 'testnet'): string {
  return `https://explorer.hiro.so/address/${address}?chain=${chain}`;
}

/** Calculates human-readable time estimate based on ~10 min Stacks block time */
export function blocksToTimeEstimate(blocks: number): string {
  if (blocks <= 0) return 'Ended';
  const minutes = blocks * 10;
  if (minutes < 60) return `~${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (hours < 24) {
    return remainingMins > 0 ? `~${hours}h ${remainingMins}m` : `~${hours} hours`;
  }
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `~${days}d ${remHours}h` : `~${days} days`;
}

/** Determines campaign status */
export function getCampaignStatus(
  campaign: CampaignData,
  currentBlock: number
): CampaignStatus {
  const isGoalMet = campaign.raisedStx >= campaign.targetStx;
  const isExpired = currentBlock > 0 && currentBlock >= campaign.endBlock;

  if (isGoalMet) {
    return 'TARGET_REACHED';
  }
  if (isExpired) {
    return 'EXPIRED';
  }
  return 'ACTIVE';
}

/** Safely unpacks Clarity uint from cvToValue or JSON shapes */
export function extractClarityUint(raw: unknown): bigint | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'bigint') return raw;
  if (typeof raw === 'number' && Number.isFinite(raw)) return BigInt(Math.trunc(raw));
  if (typeof raw === 'string') {
    if (raw.startsWith('u')) return BigInt(raw.slice(1));
    if (/^\d+$/.test(raw)) return BigInt(raw);
  }
  if (typeof raw === 'object') {
    const obj = raw as Record<string, any>;
    if (obj.type === 'uint' || obj.type === 'int') {
      return BigInt(String(obj.value));
    }
    if ('value' in obj && obj.value !== null && obj.value !== undefined) {
      return extractClarityUint(obj.value);
    }
  }
  return null;
}

/** Safely unpacks Clarity boolean */
export function extractClarityBool(raw: unknown): boolean | null {
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, any>;
    if (obj.type === 'bool') return Boolean(obj.value);
    if ('value' in obj) return extractClarityBool(obj.value);
  }
  return null;
}

/** Safely unpacks Clarity principal */
export function extractClarityPrincipal(raw: unknown): string | null {
  if (typeof raw === 'string' && /^(ST|SP)[0-9A-HJ-NP-Z]{38,41}$/.test(raw)) {
    return raw;
  }
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, any>;
    if (obj.type === 'principal' || obj.type === 'standard-principal' || obj.type === 'contract-principal') {
      return String(obj.value);
    }
    if ('value' in obj) return extractClarityPrincipal(obj.value);
  }
  return null;
}

/** Unpacks a Campaign tuple from Clarity read-only result */
export function extractClarityCampaign(id: number, raw: unknown): CampaignData | null {
  if (!raw || typeof raw !== 'object') return null;

  const data = (raw as any)?.value?.data ?? (raw as any)?.value ?? (raw as any)?.data ?? raw;
  if (!data || typeof data !== 'object') return null;

  const creator = extractClarityPrincipal(data['creator'] ?? data.creator);
  const targetStx = extractClarityUint(data['target-stx'] ?? data.targetStx ?? data['target_stx']);
  const raisedStx = extractClarityUint(data['raised-stx'] ?? data.raisedStx ?? data['raised_stx']);
  const endBlock = extractClarityUint(data['end-block'] ?? data.endBlock ?? data['end_block']);
  const claimed = extractClarityBool(data['claimed'] ?? data.claimed) ?? false;

  if (!creator || targetStx === null || raisedStx === null || endBlock === null) {
    return null;
  }

  return {
    id,
    creator,
    targetStx,
    raisedStx,
    endBlock: Number(endBlock),
    claimed,
  };
}

/** Fetches live chain tip block height from internal proxy or Hiro node API */
export async function fetchLiveChainTip(nodeUrl: string = 'https://api.testnet.hiro.so'): Promise<{
  stacksTip: number;
  burnBlock: number;
  tenureHeight: number;
  contractBlock: number;
}> {
  // Try internal API proxy in browser first to bypass adblockers/CORS issues
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/stacks/info', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const tenureHeight = Number(json.tenure_height ?? 0);
        const burnHeight = Number(json.burn_block_height ?? 0);
        const stacksTip = Number(json.stacks_tip_height ?? 0);
        // In Clarity post-Nakamoto, block-height is the tenure block height
        const contractBlock = tenureHeight > 0 ? tenureHeight : (burnHeight > 0 ? burnHeight : stacksTip);
        return {
          stacksTip,
          burnBlock: burnHeight,
          tenureHeight,
          contractBlock,
        };
      }
    } catch {
      // Fallback to direct node URL
    }
  }

  try {
    const res = await fetch(`${nodeUrl}/v2/info`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const tenureHeight = Number(json.tenure_height ?? 0);
    const burnHeight = Number(json.burn_block_height ?? 0);
    const stacksTip = Number(json.stacks_tip_height ?? 0);
    const contractBlock = tenureHeight > 0 ? tenureHeight : (burnHeight > 0 ? burnHeight : stacksTip);
    return {
      stacksTip,
      burnBlock: burnHeight,
      tenureHeight,
      contractBlock,
    };
  } catch (e) {
    console.warn('Failed to fetch live chain tip:', e);
    return { stacksTip: 0, burnBlock: 0, tenureHeight: 0, contractBlock: 0 };
  }
}

/** Fetches live STX balance for an address from internal proxy or Hiro API */
export async function fetchAddressStxBalance(
  address: string,
  nodeUrl: string = 'https://api.testnet.hiro.so'
): Promise<bigint> {
  if (!address) return 0n;

  // Try internal API proxy in browser first
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/stacks/balance?address=${encodeURIComponent(address)}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        return BigInt(json?.stx?.balance ?? '0');
      }
    } catch {
      // Fallback to direct node URL
    }
  }

  try {
    const res = await fetch(`${nodeUrl}/extended/v1/address/${address}/balances`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return BigInt(json?.stx?.balance ?? '0');
  } catch (e) {
    console.warn('Failed to fetch STX balance:', e);
    return 0n;
  }
}
