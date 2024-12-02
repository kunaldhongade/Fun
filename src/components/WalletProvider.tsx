'use client';

// Internal components
// Internal constants
import { APTOS_API_KEY, NETWORK } from '@/constants';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import type { PropsWithChildren } from 'react';

export function WalletProvider({ children }: PropsWithChildren) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: NETWORK, aptosApiKey: APTOS_API_KEY }}
      optInWallets={[
        'Continue with Google',
        'Petra',
        'Nightly',
        'Pontem Wallet',
        'Mizu Wallet',
      ]}
      onError={(error) => {
        console.error('Wallet Provider error', error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
