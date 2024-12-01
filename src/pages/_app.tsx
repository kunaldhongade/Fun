import { AppProps } from 'next/app';

import '@/styles/globals.css';

import Layout from '@/components/layout/Layout';

import { WagmiConfig } from 'wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { wagmiConfig, chains } from '@/utils/wallet-utils';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Layout>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <Component {...pageProps} />
          </RainbowKitProvider>
        </WagmiConfig>
      </Layout>
    </>
  );
}

export default MyApp;
