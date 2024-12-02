import Layout from '@/components/layout/Layout';
import { ReactQueryProvider } from '@/components/ReactQueryProvider';
// import { Toaster } from '@/components/Toaster';
import { WalletProvider } from '@/components/WalletProvider';
import { WrongNetworkAlert } from '@/components/WrongNetworkAlert';
import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Layout>
        <WalletProvider>
          <ReactQueryProvider>
            <Component {...pageProps} />
            <WrongNetworkAlert />
            {/* <Toaster /> */}
          </ReactQueryProvider>
        </WalletProvider>
      </Layout>
    </>
  );
}

export default MyApp;
