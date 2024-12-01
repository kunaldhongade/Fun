import { Capacitor } from '@capacitor/core';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CiMedal } from 'react-icons/ci';
import { IoDiamondOutline } from 'react-icons/io5';
import { RiVipCrownLine } from 'react-icons/ri';

import Account from '@/components/account/Account';
import Menu from '@/components/menu/Menu';
import Tab from '@/components/tabs/Tab';
import TabGroup from '@/components/tabs/TabGroup';
import TabPanel from '@/components/tabs/TabPanel';
import TabPanels from '@/components/tabs/TabPanels';
import Tabs from '@/components/tabs/Tabs';

import Currency from '@/features/Game/components/currency/Currency';
import NFTS from '@/features/Game/components/leader-board/NFTS';
import NFTPreview from '@/features/Game/components/NFTpreview/NFTPreview';
import LeaderBoardTable from '@/features/Game/components/Quiz/leader-board-table/LeaderBoardTable';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import TextField from '@/components/inputs/TextField';
import StoryBar from '@/components/story/StoryBar';
import { categories } from '@/features/Game/constants/categories';
import { storyData } from '@/constants/mocks/storiesMock';

const LeaderBoard = () => {
  const [showNFTPreview, setShowNFTPreview] = useState(false);
  const [NFTFlowId, setNFTFlowId] = useState<string | undefined>();

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
          <ConnectButton />

          <div className='mx-auto w-[85vw] mobile-demo:w-[450px]'>
            <TextField
              startAdornment='search'
              placeHolder='Search by player or team'
            />
          </div>
        </div>

        {/* StoryBar below the search bar */}
        <StoryBar stories={storyData} />

        {/* Tab List */}
        <Tab className='!mt-5 flex max-w-[450px] flex-col items-center gap-4 overflow-hidden mobile-m:flex-row'>
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
        </Tab>
        {Capacitor.getPlatform() === 'ios' ? (
          <div
            className='sticky top-0 z-[999] flex w-full bg-dark pb-4'
            style={{
              paddingTop: 'calc(2px + env(safe-area-inset-top))',
            }}
          >
            <div className='w-[85vw] mobile-demo:w-[450px]'>
              <div className='flex w-full items-center justify-center gap-1'>
                <div className='flex w-full items-center justify-center gap-2'>
                  <span className='text-2xl text-primary-500'>
                    <CiMedal />
                  </span>
                  <span className='text-gradient-primary font-primary text-lg font-bold'>
                    REWARDS
                  </span>
                </div>
                <Currency />
              </div>
            </div>
          </div>
        ) : (
          <div className='flex items-center justify-center gap-1'>
            <div className='flex w-full items-center justify-center gap-2'>
              <span className='text-2xl text-primary-500'>
                <CiMedal />
              </span>
              <span className='text-gradient-primary font-primary text-lg font-bold'>
                REWARDS
              </span>
            </div>
            <Currency />
          </div>
        )}

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
