import { aptosClient } from '@/utils/aptosClient';
import {
  InputGenerateTransactionPayloadData,
  InputSubmitTransactionData,
} from '@aptos-labs/ts-sdk';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import React, { ReactNode, useContext, useEffect, useState } from 'react';

import { MODULE_ADDRESS } from '@/constants';

// Types
interface PreQuestions {
  NFTFlowId: string;
  players: Array<{
    profileImage: string;
    handle: string;
    points: number;
    countryImage: string;
  }>;
  categoryImage: React.ReactNode;
  requiredBet: string;
}

interface Question {
  // Add your question interface here
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface PostQuestions {
  // Add your post questions interface here
  results: {
    correct: number;
    total: number;
  };
}

interface NFTInfo {
  NFTId: string;
  NFTName: string;
  NFTDescription: string;
  NFTTotalPrice: string;
  NFTVideoSrc: string;
  maxBet: string;
  version: string;
}

interface DepositFundsParams {
  amount: string;
  poolId: number;
}

interface WithdrawFundsParams {
  amount: string;
  poolId: number;
}

type QuizContext = {
  activeQuiz: boolean;
  setActiveQuiz: React.Dispatch<React.SetStateAction<boolean>>;
  activeStep: 'pre-questions' | 'questions' | 'post-questions';
  setActiveStep: React.Dispatch<
    React.SetStateAction<'pre-questions' | 'questions' | 'post-questions'>
  >;
  preQuestions: PreQuestions;
  setPreQuestions: React.Dispatch<React.SetStateAction<PreQuestions>>;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  postQuestions: PostQuestions;
  setPostQuestions: React.Dispatch<React.SetStateAction<PostQuestions>>;
  NFTInfo: NFTInfo;
  setNFTInfo: React.Dispatch<React.SetStateAction<NFTInfo>>;
  reset: () => void;
  depositFunds: (params: DepositFundsParams) => Promise<string | undefined>;
  userTokenBalance: string;
  userDepositedBalance: string;
  poolBalance: string;
  makeReferral: () => Promise<string | undefined>;
  withdrawFunds: (params: WithdrawFundsParams) => Promise<string | undefined>;
};

export const QuizContext = React.createContext<QuizContext>({} as QuizContext);

export const useQuizContext = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuizContext must be used within a QuizContextProvider');
  }
  return context;
};

const QuizContextProvider = ({ children }: { children: ReactNode }) => {
  const { account, signAndSubmitTransaction } = useWallet();

  // States
  const [userTokenBalance, setUserTokenBalance] = useState<string>('0');
  const [userDepositedBalance, setUserDepositedBalance] = useState<string>('0');
  const [poolBalance, setPoolBalance] = useState<string>('0');
  const [activeQuiz, setActiveQuiz] = useState(false);
  const [activeStep, setActiveStep] = useState<
    'pre-questions' | 'questions' | 'post-questions'
  >('pre-questions');
  const [preQuestions, setPreQuestions] = useState<PreQuestions>({
    NFTFlowId: '',
    players: [{ profileImage: '', handle: '', points: 0, countryImage: '' }],
    categoryImage: <></>,
    requiredBet: '',
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [postQuestions, setPostQuestions] = useState<PostQuestions>({
    results: { correct: 0, total: 0 },
  });
  const [NFTInfo, setNFTInfo] = useState<NFTInfo>({
    NFTId: '',
    NFTName: '',
    NFTDescription: '',
    NFTTotalPrice: '',
    NFTVideoSrc: '',
    maxBet: '',
    version: '',
  });

  // Fetch balances
  useEffect(() => {
    if (!account?.address) return;

    const fetchBalances = async () => {
      try {
        // Replace these with your actual view functions from your module
        const tokenBalance = await aptosClient().view({
          payload: {
            function: `${MODULE_ADDRESS}::quiz::get_token_balance`,
            functionArguments: [account.address],
          },
        });

        const depositedBalance = await aptosClient().view({
          payload: {
            function: `${MODULE_ADDRESS}::quiz::get_user_deposited_balance`,
            functionArguments: [account.address],
          },
        });

        const poolBalanceResult = await aptosClient().view({
          payload: {
            function: `${MODULE_ADDRESS}::quiz::get_pool_balance`,
            functionArguments: [1], // poolId
          },
        });

        setUserTokenBalance(tokenBalance[0]?.toString() || '0');
        setUserDepositedBalance(depositedBalance[0]?.toString() || '0');
        setPoolBalance(poolBalanceResult[0]?.toString() || '0');
      } catch (error) {
        console.error('Error fetching balances:', error);
      }
    };

    fetchBalances();
  }, [account?.address]);

  const makeReferral = async () => {
    if (!account?.address) return;

    try {
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${MODULE_ADDRESS}::quiz::create_user`,
          functionArguments: [],
        } as InputGenerateTransactionPayloadData,
      });

      await aptosClient().waitForTransaction({
        transactionHash: response.hash,
      });
      return response.hash;
    } catch (error) {
      console.error('Error creating referral:', error);
    }
  };

  const depositFunds = async ({ amount, poolId }: DepositFundsParams) => {
    if (!account?.address) return;

    try {
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${MODULE_ADDRESS}::quiz::deposit`,
          functionArguments: [amount, poolId],
        } as InputGenerateTransactionPayloadData,
      });

      await aptosClient().waitForTransaction({
        transactionHash: response.hash,
      });
      return response.hash;
    } catch (error) {
      console.error('Error depositing funds:', error);
    }
  };

  const withdrawFunds = async ({ amount, poolId }: WithdrawFundsParams) => {
    if (!account?.address) return;

    try {
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${MODULE_ADDRESS}::quiz::withdraw`,
          functionArguments: [amount, poolId],
        } as InputGenerateTransactionPayloadData,
      });

      await aptosClient().waitForTransaction({
        transactionHash: response.hash,
      });
      return response.hash;
    } catch (error) {
      console.error('Error withdrawing funds:', error);
    }
  };

  const reset = () => {
    setNFTInfo({
      NFTId: '',
      NFTName: '',
      NFTDescription: '',
      NFTTotalPrice: '',
      NFTVideoSrc: '',
      maxBet: '',
      version: '',
    });
    setPreQuestions({
      NFTFlowId: '',
      players: [{ profileImage: '', handle: '', points: 0, countryImage: '' }],
      categoryImage: <></>,
      requiredBet: '',
    });
    setActiveQuiz(false);
    setActiveStep('pre-questions');
    setQuestions([]);
    setPostQuestions({ results: { correct: 0, total: 0 } });
  };

  return (
    <QuizContext.Provider
      value={{
        activeQuiz,
        setActiveQuiz,
        activeStep,
        setActiveStep,
        preQuestions,
        setPreQuestions,
        questions,
        setQuestions,
        postQuestions,
        setPostQuestions,
        NFTInfo,
        setNFTInfo,
        reset,
        depositFunds,
        userTokenBalance,
        userDepositedBalance,
        poolBalance,
        makeReferral,
        withdrawFunds,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export default QuizContextProvider;
