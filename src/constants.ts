import type { Network } from '@aptos-labs/wallet-adapter-react';

export const NETWORK: Network =
  (process.env.NEXT_PUBLIC_APP_NETWORK as Network) ?? 'testnet';

export const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
export const APTOS_API_KEY = process.env.NEXT_PUBLIC_APTOS_API_KEY;

export const PINATA_API_KEYS = process.env.NEXT_PUBLIC_PINATA_API_KEYS;

export const PINATA_API_SECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET;

export const MODULE_NAME = process.env.NEXT_PUBLIC_MODULE_NAME;
