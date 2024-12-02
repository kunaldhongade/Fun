import { aptosClient } from '@/utils/aptosClient';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Tab } from '@headlessui/react';
import { Types } from 'aptos';
import React, { useEffect, useState } from 'react';
import { AiFillStar } from 'react-icons/ai';
import { BsCalendarCheck } from 'react-icons/bs';
import { RxCopy } from 'react-icons/rx';

import clsxm from '@/lib/clsxm';

import Button from '@/components/buttons/Button';
import Carousel from '@/components/carousel/Carousel';
import TextField from '@/components/inputs/TextField';
import NextImage from '@/components/NextImage';
import RadioGroup from '@/components/radio/RadioGroup';
import RadioOption from '@/components/radio/RadioOption';
import TabGroup from '@/components/tabs/TabGroup';
import TabPanel from '@/components/tabs/TabPanel';
import TabPanels from '@/components/tabs/TabPanels';
import Dialog from '@/dialog/Dialog';

import { paymentTypes } from '@/features/Game/constants/paymentTypes';

import { MODULE_ADDRESS } from '@/constants';
const RESOURCE_ACCOUNT = 'YOUR_RESOURCE_ACCOUNT';

const PaymentTypes = () => {
  const [selected, setSelected] = useState(0);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const { account, signAndSubmitTransaction } = useWallet();
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [totalInvested, setTotalInvested] = useState<string>('0');

  // Fetch the token balance
  const fetchTokenBalance = async () => {
    if (!account?.address) return;

    try {
      const resources = await aptosClient().getAccountResources({
        accountAddress: account.address,
      });

      // Find the token resource
      const tokenResource = resources.find(
        (r) => r.type === `${MODULE_ADDRESS}::token::TokenStore`
      );

      if (tokenResource) {
        const balance =
          (tokenResource.data as { balance: string }).balance || '0';
        setTokenBalance(balance);
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
    }
  };

  // Fetch total invested amount
  const fetchTotalInvested = async () => {
    if (!account?.address) return;

    try {
      const result = await aptosClient().view({
        payload: {
          function: `${MODULE_ADDRESS}::quiz::get_total_invested`,
          functionArguments: [account.address],
        },
      });

      setTotalInvested(result[0]?.toString() || '0');
    } catch (error) {
      console.error('Error fetching total invested:', error);
    }
  };

  useEffect(() => {
    if (account?.address) {
      fetchTokenBalance();
      fetchTotalInvested();
    }
  }, [account?.address]);

  const handleDeposit = async (amount: string) => {
    if (!account?.address) return;

    try {
      const payload: Types.TransactionPayload = {
        type: 'entry_function_payload',
        function:
          `${MODULE_ADDRESS}::quiz::deposit` as `${string}::${string}::${string}`,
        type_arguments: [],
        arguments: [amount],
      };

      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          ...payload,
          function: payload.function as `${string}::${string}::${string}`,
          functionArguments: payload.arguments,
          multisigAddress: account.address,
        },
      });

      await aptosClient().waitForTransaction({
        transactionHash: response.hash,
      });

      // Refresh balances after deposit
      fetchTokenBalance();
      fetchTotalInvested();
    } catch (error) {
      console.error('Error depositing tokens:', error);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => {
      setCopiedNotification(false);
    }, 900);
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <TabGroup>
        {/* Tab Headers */}
        <Tab.List>
          <Carousel
            className='left-[50%] w-screen -translate-x-2/4 mobile-demo:w-[500px]'
            itemWrapperClassName='w-max'
            scrollContainerClassName='snap-none pl-[25px]'
            slide={false}
            indicators={false}
          >
            {paymentTypes.map((paymentType, index) => (
              <Tab
                key={index}
                className='pr-4'
                onClick={() => setSelected(index)}
              >
                <div
                  className={clsxm([
                    'flex h-full min-h-[127px] w-full min-w-[135px] flex-col rounded-2xl p-4',
                    selected === index ? 'bg-gradient-primary' : 'bg-white',
                  ])}
                >
                  <div className='flex items-center justify-between gap-2'>
                    <NextImage
                      src={paymentType.imgSrc}
                      alt='paymentType'
                      fill
                      className='relative h-6 w-6'
                      imgClassName='object-contain'
                    />
                  </div>
                  <div className='mt-auto h-full text-black'>
                    <span className='block text-sm font-bold'>
                      {paymentType.name}
                    </span>
                    <span className='text-2xs'>
                      Commission {paymentType.commission}%
                    </span>
                  </div>
                </div>
              </Tab>
            ))}
          </Carousel>
        </Tab.List>

        {/* Tab Panels */}
        <TabPanels className='mt-8'>
          {/* Panel 1: Wallet and Balance Info */}
          <TabPanel>
            <div className='space-y-6'>
              <div className='grid grid-cols-2 items-center justify-between gap-2'>
                <span className='text-sm'>Aptos Address</span>
                <Button
                  variant='outline'
                  rightIcon={RxCopy}
                  rightIconClassName='text-primary-500 text-xl'
                  size='base'
                  className='w-full px-5 py-3 text-white'
                  onClick={() => handleCopy(account?.address || '')}
                >
                  <span className='mx-auto w-full'>
                    {formatAddress(account?.address || '')}
                  </span>
                </Button>
              </div>
              <div className='grid grid-cols-2 items-center justify-between gap-2'>
                <span className='text-sm'>Balance (FTO)</span>
                <Button
                  variant='outline'
                  rightIcon={RxCopy}
                  rightIconClassName='text-primary-500 text-xl'
                  size='base'
                  className='w-full px-5 py-3 text-white'
                  onClick={() => handleCopy(`${tokenBalance} FTO`)}
                >
                  <span className='mx-auto w-full'>{tokenBalance} FTO</span>
                </Button>
              </div>
              <h2 className='!h1'>Total Invested: {totalInvested} FTO</h2>
              <Button
                variant='outline'
                size='lg'
                className='!mt-2'
                onClick={() => handleDeposit('100')} // Example amount
              >
                Deposit
              </Button>
            </div>
          </TabPanel>

          {/* Panel 2: Deposit Form */}
          <TabPanel>
            <form
              className='space-y-6'
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleDeposit(formData.get('amount') as string);
              }}
            >
              <TextField
                required={true}
                name='amount'
                inputClassName='bg-transparent border-primary-500 rounded-full text-white placeholder:text-gray-300'
                placeholder='Amount'
                type='number'
              />
              <div className='flex items-center gap-4'>
                <RadioGroup>
                  <div className='flex items-center gap-4'>
                    <RadioOption
                      className='inline-block'
                      value='I agree to the terms of use'
                    />
                    <span className='text-2xs'>
                      I agree to the terms of use
                    </span>
                  </div>
                </RadioGroup>
              </div>
              <Button
                variant='outline'
                size='lg'
                className='!mt-12'
                type='submit'
              >
                Deposit
              </Button>
            </form>
          </TabPanel>

          {/* Panel 3: Coming Soon */}
          <TabPanel className='mt-20 flex w-full justify-center'>
            <span className='h2'>COMING SOON</span>
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* Copy Notification Dialog */}
      <Dialog
        isOpen={copiedNotification}
        onClose={() => setCopiedNotification(false)}
        childrenClassName='text-center h3'
      >
        <span>Copied</span>
      </Dialog>
    </>
  );
};

export default PaymentTypes;
