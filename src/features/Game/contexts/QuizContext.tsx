import React, { ReactNode, useContext, useState, useEffect } from 'react';

import {
  NFTInfo,
  PreQuestions,
  Question,
  Quiz,
} from '@/features/Game/types/Types';

import { PostQuestions } from '../types/Types';
import {
  tokenAddress,
  tokenAbi,
  mainContractABI,
  mainContractAddress,
} from '@/contract-constant';

import { useAccount, usePublicClient, useNetwork } from 'wagmi';
import { useEthersSigner } from '@/utils/signer';
import { ethers, BigNumber } from 'ethers';

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
  const { address } = useAccount();
  const { chains, chain } = useNetwork();
  const [activeChain, setActiveChainId] = useState(chain?.id);
  const [userTokenBalance, setUserTokenBalance] = useState<string>('0');
  const [userDepositedBalance, setUserDepositedBalance] = useState<string>('0');
  const [poolBalance, setPoolBalance] = useState<string>('0');
  useEffect(() => {
    setActiveChainId(chain?.id);
  }, [chain?.id]);
  const signer = useEthersSigner(activeChain);

  useEffect(() => {
    if (!signer) return;
    if (address) {
      const fetchBalance = async () => {
        const degoTokenContract = await getContractInstance(
          tokenAddress,
          tokenAbi
        );
        const balance = await degoTokenContract.balanceOf(address);
        console.log('balance', ethers.utils.formatEther(balance));
        setUserTokenBalance(ethers.utils.formatEther(balance));

        const contractInstance = await getContractInstance(
          mainContractAddress,
          mainContractABI
        );

        const depositedBalance = await contractInstance.userBalance(address);
        console.log(
          'depositedBalance',
          ethers.utils.formatEther(depositedBalance)
        );

        const poolBalance = await contractInstance.poolAmount(1);
        console.log('poolBalance', ethers.utils.formatEther(poolBalance));
        setPoolBalance(ethers.utils.formatEther(poolBalance));
        setUserDepositedBalance(ethers.utils.formatEther(depositedBalance));
      };
      fetchBalance();
    }
  }, [address, signer]);

  const makeRefferal = async () => {
    try {
      const contractInstance = await getContractInstance(
        mainContractAddress,
        mainContractABI
      );
      const tx = await contractInstance.createUser();
      await tx.wait();
      return tx;
    } catch (error) {
      console.log(error);
    }
  };
  const getContractInstance = async (contractAddress: string, contractAbi) => {
    try {
      let contractInstance = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );
      return contractInstance;
    } catch (error) {
      console.log('Error in deploying contract');
    }
  };

  const depositFunds = async (amount, poolId) => {
    try {
      const degoTokenContract = await getContractInstance(
        tokenAddress,
        tokenAbi
      );
      //make amount as per decimals
      amount = BigNumber.from(amount).mul(
        BigNumber.from(10).pow(await degoTokenContract.decimals())
      );
      const approvetx = await degoTokenContract.approve(
        mainContractAddress,
        amount,
        { from: address }
      );

      await approvetx.wait();

      const contractInstance = await getContractInstance(
        mainContractAddress,
        mainContractABI
      );

      const tx = await contractInstance.deposit(amount, poolId, {
        from: address,
      });
      await tx.wait();

      return tx;
    } catch (error) {
      console.log(error);
    }
  };

  const withdrawlFunds = async (amount, poolId) => {
    try {
      const contractInstance = await getContractInstance(
        mainContractAddress,
        mainContractABI
      );

      const tx = await contractInstance.withdraw(amount, poolId, {
        from: address,
      });
      await tx.wait();

      return tx;
    } catch (error) {
      console.log(error);
    }
  };

  const [activeQuiz, setActiveQuiz] = useState(false);
  const [activeStep, setActiveStep] =
    useState<Quiz['activeStep']>('pre-questions');
  const [preQuestions, setPreQuestions] = useState<PreQuestions>({
    NFTFlowId: '',
    players: [{ profileImage: '', handle: '', points: 0, countryImage: '' }],
    categoryImage: <></>,
    requiredBet: '',
  });
  const [questions, setQuestions] = useState<Question[]>({} as Question[]);
  const [postQuestions, setPostQuestions] = useState<PostQuestions>(
    {} as PostQuestions
  );
  const [NFTInfo, setNFTInfo] = useState<NFTInfo>({
    NFTId: '',
    NFTName: '',
    NFTDescription: '',
    NFTTotalPrice: '',
    NFTVideoSrc: '',
    maxBet: '',
    version: '',
  });

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
    setQuestions({} as Question[]);
    setPostQuestions({} as PostQuestions);
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
        makeRefferal,
        withdrawlFunds,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export default QuizContextProvider;
