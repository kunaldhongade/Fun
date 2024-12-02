import { useWallet } from '@aptos-labs/wallet-adapter-react';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

import WorldIdKit from '@/components/buttons/WorldIdKit';
import Carousel from '@/components/carousel/Carousel';
import Menu from '@/components/menu/Menu';
import Profile from '@/components/profiles/Profile';
import TabGroup from '@/components/tabs/TabGroup';
import TabPanel from '@/components/tabs/TabPanel';

import LeaderBoard from '@/features/Game/components/leader-board/LeaderBoard';
import Payment from '@/features/Game/components/payment/Payment';
import InviteFriends from '@/features/Game/components/Quiz/InviteFriends';
import PlayersInfiniteScroll from '@/features/Game/components/Quiz/PlayersInfiniteScroll';
import Quiz from '@/features/Game/components/Quiz/Quiz';
import QuizCard from '@/features/Game/components/Quiz/QuizCard';
import { NFTs } from '@/features/Game/constants/NFTs';
import { players } from '@/features/Game/constants/players';
import { questions } from '@/features/Game/constants/questions';
import {
  tierQuizzes,
  trendingQuizzes,
} from '@/features/Game/constants/quizzes';
import { useQuizContext } from '@/features/Game/contexts/QuizContext';
import { useTabsContext } from '@/features/Game/contexts/TabsContext';
import { Question } from '@/features/Game/types/Types';

const Game = () => {
  const { account } = useWallet(); // Replace wagmi's useAccount with Aptos wallet
  const {
    setActiveStep: setActiveQuizStep,
    setPreQuestions,
    setQuestions,
    setActiveQuiz,
    activeQuiz,
  } = useQuizContext();
  const [showInviteFriends, setShowInviteFriends] = useState(false);
  const { selectedTab } = useTabsContext();

  // Function to check wallet connection
  const isWalletConnected = () => {
    return !!account?.address;
  };

  const handleTrendingQuizClick = async (quizIdentifier: string) => {
    if (!isWalletConnected()) {
      // Handle wallet connection requirement
      alert('Please connect your wallet to participate in quizzes');
      return;
    }

    setActiveQuiz(true);
    setActiveQuizStep('pre-questions');

    const category = trendingQuizzes[quizIdentifier].category;
    const NFTInfo =
      NFTs[category.player?.name || category.team?.name || 'LeBron James'];
  };

  const handleTierQuizClick = async (quizIdentifier: string) => {
    if (!isWalletConnected()) {
      alert('Please connect your wallet to participate in quizzes');
      return;
    }

    setActiveQuiz(true);
    setActiveQuizStep('pre-questions');

    const category = tierQuizzes[quizIdentifier].category;
    const NFTInfo =
      NFTs[category.player?.name || category.team?.name || 'Lebron James'];
  };

  const home = () => {
    return (
      <>
        <section className='mb-3 max-w-[95vw] space-y-9 mobile-demo:w-[450px]'>
          <WorldIdKit />

          {/* Trending and Tier Quizzes */}
          <TabPanel className='space-y-9'>
            <div>
              <h2 className='mb-4 text-xl font-bold'>Trending Quiz Bets</h2>
              <Carousel
                indicators={false}
                className='left-2/4 w-screen -translate-x-2/4 items-center justify-center child:gap-2 mobile-demo:w-[500px]'
              >
                {Object.keys(trendingQuizzes).map((quizIdentifier, index) => (
                  <QuizCard
                    key={index}
                    players={trendingQuizzes[quizIdentifier].players}
                    title={trendingQuizzes[quizIdentifier].title}
                    image={trendingQuizzes[quizIdentifier].image}
                    onClick={() => handleTrendingQuizClick(quizIdentifier)}
                  />
                ))}
              </Carousel>
            </div>
            <div>
              <h2 className='mb-4 text-xl font-bold'>By Tier Quiz Bets</h2>
              <Carousel
                indicators={false}
                className='left-2/4 w-screen -translate-x-2/4 items-center justify-center child:gap-2 mobile-demo:w-[500px]'
              >
                {Object.keys(tierQuizzes).map((quizIdentifier, index) => (
                  <QuizCard
                    key={index}
                    players={tierQuizzes[quizIdentifier].players}
                    title={tierQuizzes[quizIdentifier].title}
                    type={tierQuizzes[quizIdentifier].type}
                    image={tierQuizzes[quizIdentifier].image}
                    onClick={() => handleTierQuizClick(quizIdentifier)}
                  />
                ))}
              </Carousel>
            </div>

            {/* Invite Friends Section */}
            <div>
              <div className='flex items-center justify-between gap-3'>
                <h2 className='text-lg font-bold text-primary-500'>
                  Invite Friends
                </h2>
                <button
                  onClick={() => setShowInviteFriends(true)}
                  className='text-gradient-primary text-sm font-bold'
                >
                  + Invite Friends
                </button>
              </div>
              <PlayersInfiniteScroll players={players} className='mt-6' />
            </div>
          </TabPanel>
        </section>

        {/* Modal for Invite Friends */}
        {showInviteFriends && <InviteFriends setOpen={setShowInviteFriends} />}

        {createPortal(<Menu />, document.body)}
      </>
    );
  };

  const renderGame = () => {
    // Add wallet connection check for protected routes
    const requiresWallet = ['payment', 'profile'].includes(selectedTab);
    if (requiresWallet && !isWalletConnected()) {
      return (
        <div className='flex flex-col items-center justify-center p-8'>
          <h2 className='mb-4 text-xl font-bold'>Connect Wallet</h2>
          <p className='mb-4 text-gray-600'>
            Please connect your wallet to access this feature
          </p>
          {/* Add your Aptos wallet connect button component here */}
        </div>
      );
    }

    if (activeQuiz) return <Quiz />;
    if (showInviteFriends)
      return <InviteFriends setOpen={setShowInviteFriends} />;
    if (selectedTab === 'home') return <LeaderBoard />;
    if (selectedTab === 'leader-board') return home();
    if (selectedTab === 'payment') return <Payment />;
    if (selectedTab === 'profile') return <Profile />;
    return null;
  };

  return <TabGroup>{renderGame()}</TabGroup>;
};

export default Game;
