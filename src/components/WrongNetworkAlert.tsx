'use client';

import { NETWORK } from '@/constants';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useEffect, useState } from 'react';

export function WrongNetworkAlert() {
  const { network, connected } = useWallet();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show modal only if connected and on wrong network
    setIsVisible(connected && network?.name !== NETWORK);
  }, [connected, network?.name]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm' />

      {/* Modal */}
      <div className='fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2'>
        <div className='rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800'>
          <div className='text-center'>
            <h2 className='mb-4 text-3xl font-semibold text-gray-900 dark:text-gray-100'>
              Wrong Network
            </h2>
            <p className='text-lg text-gray-700 dark:text-gray-300'>
              Your wallet is currently on{' '}
              <span className='font-bold'>{network?.name}</span>. Please switch
              to <span className='font-bold'>{NETWORK}</span> to continue using
              the app.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
