import { useWallet, WalletReadyState } from '@aptos-labs/wallet-adapter-react';
import { Capacitor } from '@capacitor/core';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CiMedal } from 'react-icons/ci';
import { IoDiamondOutline } from 'react-icons/io5';
import { RiVipCrownLine } from 'react-icons/ri';

import Account from '@/components/account/Account';
import TextField from '@/components/inputs/TextField';
import Menu from '@/components/menu/Menu';
import NextImage from '@/components/NextImage';
import StoryBar from '@/components/story/StoryBar';
import Tab from '@/components/tabs/Tab';
import TabGroup from '@/components/tabs/TabGroup';
import TabPanel from '@/components/tabs/TabPanel';
import TabPanels from '@/components/tabs/TabPanels';
import Tabs from '@/components/tabs/Tabs';

import { storyData } from '@/constants/mocks/storiesMock';
import NFTS from '@/features/Game/components/leader-board/NFTS';
import NFTPreview from '@/features/Game/components/NFTpreview/NFTPreview';
import NFTThumbnail from '@/features/Game/components/NFTThumbnail';
import LeaderBoardTable from '@/features/Game/components/Quiz/leader-board-table/LeaderBoardTable';
import { categories } from '@/features/Game/constants/categories';

// Aptos Wallet Button Component
const AptosWalletButton = () => {
  const { connect, account, wallets, disconnect } = useWallet();

  const onConnect = () => {
    // Get the first wallet with "Installed" status
    const wallet = wallets?.find(
      (wallet) => wallet.readyState === WalletReadyState.Installed
    );
    if (wallet) {
      connect(wallet.name);
    } else {
      // Handle case where no wallet is installed
      alert('Please install an Aptos wallet');
    }
  };

  if (account?.address) {
    return (
      <button
        onClick={disconnect}
        className='rounded-full bg-primary-500 px-4 py-2 font-bold text-white'
      >
        {account.address.slice(0, 6)}...{account.address.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={onConnect}
      className='rounded-full bg-primary-500 px-4 py-2 font-bold text-white'
    >
      Connect Wallet
    </button>
  );
};

const LeaderBoard = () => {
  const [showNFTPreview, setShowNFTPreview] = useState(false);
  const [NFTFlowId, setNFTFlowId] = useState<string | undefined>();
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const { account } = useWallet();

  useEffect(() => {
    // Load previously uploaded videos for this wallet from localStorage
    const storedVideos = JSON.parse(
      localStorage.getItem('uploadedVideos') || '{}'
    );
    if (account?.address && storedVideos[account.address]) {
      setUploadedVideos(storedVideos[account.address]);
    }
  }, [account?.address]);

  const main = () => {
    return (
      <div>
        <div
          className={
            Capacitor.isNativePlatform()
              ? 'sticky top-0 z-[999] flex flex-col bg-dark pb-4'
              : 'flex flex-col gap-4'
          }
        >
          <div className='flex items-center justify-between p-2'>
            {account?.address && (
              <NextImage
                src='/images/demo-profile.png'
                alt='Image placeholder'
                className='relative h-14 w-14 rounded-full border-2 border-primary-500'
                imgClassName='object-cover rounded-full'
                fill
              />
            )}

            <AptosWalletButton />
          </div>

          <div className='mx-auto w-[85vw] mobile-demo:w-[450px]'>
            <TextField
              startAdornment='search'
              placeHolder='Search by player or team'
            />
          </div>
        </div>

        <StoryBar stories={storyData} />

        <div className='!mt-5 flex flex-col items-center gap-4 overflow-hidden mobile-m:flex-row'>
          {categories.map((category, index) => (
            <Tab
              key={index}
              className='flex w-48 rounded-full border-2 border-primary-500 p-2 hover:bg-primary-500'
            >
              <div className='flex h-full w-full items-center justify-center'>
                {category.image}
              </div>
            </Tab>
          ))}
        </div>

        <TabGroup>
          {Capacitor.getPlatform() === 'ios' ? (
            <Tabs className='m-6 mx-auto w-full'>
              <Tab>
                <div className='flex justify-center gap-2'>
                  <span className='text-xl'>
                    <IoDiamondOutline />
                  </span>
                  <span className='font-bold'>NFTs</span>
                </div>
              </Tab>
              <Tab>
                <div className='flex justify-center gap-2'>
                  <span className='text-xl'>
                    <RiVipCrownLine />
                  </span>
                  <span className='font-bold'>Leaderboard</span>
                </div>
              </Tab>
            </Tabs>
          ) : (
            <Tabs className='m-10 mx-auto w-full'>
              <Tab>
                <div className='flex justify-center gap-2'>
                  <span className='text-xl'>
                    <IoDiamondOutline />
                  </span>
                  <span className='font-bold'>NFTs</span>
                </div>
              </Tab>
              <Tab>
                <div className='flex justify-center gap-2'>
                  <span className='text-xl'>
                    <RiVipCrownLine />
                  </span>
                  <span className='font-bold'>Leaderboard</span>
                </div>
              </Tab>
            </Tabs>
          )}
          <TabPanels>
            <TabPanel>
              <NFTS
                setShowNFTPreview={setShowNFTPreview}
                setNFTFlowId={setNFTFlowId}
              />

              {uploadedVideos.length > 0 && (
                <div className='mx-auto my-10 overflow-hidden rounded-2xl sm:w-[26rem] sm:max-w-lg'>
                  <div className='mt-4 flex flex-col items-center gap-6'>
                    {uploadedVideos.map((video, index) => (
                      <NFTThumbnail
                        key={index}
                        NFTFlowId='3208'
                        showPrice={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabPanel>
            <TabPanel>
              <Account />
              <LeaderBoardTable
                className='mt-8'
                figureClassName='border-transparent'
              />
            </TabPanel>
          </TabPanels>
        </TabGroup>
        {createPortal(<Menu />, document.body)}
      </div>
    );
  };

  const renderLeaderBoard = () => {
    if (showNFTPreview && NFTFlowId) {
      return (
        <NFTPreview
          setShowNFTPreview={setShowNFTPreview}
          NFTFlowId={NFTFlowId}
        />
      );
    }
    return main();
  };

  return renderLeaderBoard();
};

export default LeaderBoard;
