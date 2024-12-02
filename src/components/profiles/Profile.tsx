import Menu from '@/components/menu/Menu';
import NextImage from '@/components/NextImage';
import {
  MODULE_ADDRESS,
  MODULE_NAME,
  PINATA_API_KEYS,
  PINATA_API_SECRET,
} from '@/constants';
import { aptosClient } from '@/utils/aptosClient';
import { WalletReadyState } from '@aptos-labs/wallet-adapter-core';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Capacitor } from '@capacitor/core';
import { Form, message, Tag, Typography } from 'antd';
import { Types } from 'aptos';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const AptosWalletButton = () => {
  const {
    connect,
    account,
    wallets,
    disconnect,
    connected,
    signAndSubmitTransaction,
  } = useWallet();
  const onConnect = () => {
    const wallet = wallets?.find(
      (wallet) => wallet.readyState === WalletReadyState.Installed
    );
    if (wallet) {
      connect(wallet.name);
    } else {
      alert('Please install an Aptos wallet');
    }
  };

  return (
    <button
      onClick={connected ? disconnect : onConnect}
      className='rounded-full bg-primary-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-primary-600'
    >
      {connected ? (
        <span>
          {account?.address?.slice(0, 6)}...{account?.address?.slice(-4)}
        </span>
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
};

const Profile = () => {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadedNFTs, setUploadedNFTs] = useState<
    Array<{
      videoURL: string;
      nftName: string;
      description: string;
      objectId?: string;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [startPrice, setStartPrice] = useState('');
  const [auctionDuration, setAuctionDuration] = useState('');

  useEffect(() => {
    if (account?.address) {
      loadUploadedNFTs();
    }
  }, [account?.address]);

  const loadUploadedNFTs = () => {
    const stored = localStorage.getItem(`nfts_${account?.address}`);
    if (stored) {
      setUploadedNFTs(JSON.parse(stored));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setVideoFile(file);
  };

  const createNFT = async (values: { ipfs_url: string }) => {
    try {
      const transaction = await signAndSubmitTransaction({
        sender: account?.address,
        data: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::create_nft`,
          functionArguments: [values.ipfs_url],
        },
      });

      await aptosClient().waitForTransaction({
        transactionHash: transaction.hash,
      });
      message.success('NFT Created Successfully!');
    } catch (error) {
      message.error('Failed to create NFT');
      console.error(error);
    }
  };

  const createNFTAndAuction = async (videoURL: string) => {
    try {
      // First create the NFT
      const nftTx = await signAndSubmitTransaction({
        sender: account!.address,
        data: {
          function: `${MODULE_ADDRESS}::betting_pool::create_nft`,
          functionArguments: [nftName, nftDescription, videoURL],
        },
      });

      // Wait for transaction to be confirmed
      const pendingResult = await nftTx.wait();

      // Extract object ID from transaction result
      const objectId = pendingResult.changes.find(
        (change: any) => change.type === 'create_object'
      )?.object_id;

      if (startPrice && auctionDuration) {
        // Create auction for the NFT
        await signAndSubmitTransaction({
          sender: account!.address,
          data: {
            function: `${MODULE_ADDRESS}::betting_pool::create_auction`,
            functionArguments: [
              objectId,
              parseInt(startPrice),
              parseInt(auctionDuration),
            ],
          },
        });
      }

      return objectId;
    } catch (error) {
      console.error('Error creating NFT:', error);
      throw error;
    }
  };

  const uploadToPinata = async () => {
    if (!videoFile || !account?.address) {
      alert('Please select a file and connect your wallet.');
      return;
    }

    // if (!nftName || !nftDescription) {
    //   alert('Please provide a name and description for your NFT.');
    //   return;
    // }

    try {
      setLoading(true);

      // Upload to IPFS
      const formData = new FormData();
      formData.append('file', videoFile);
      const metadata = JSON.stringify({
        name: nftName,
        description: nftDescription,
        creator: account.address,
      });
      formData.append('pinataMetadata', metadata);

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            pinata_api_key: PINATA_API_KEYS,
            pinata_secret_api_key: PINATA_API_SECRET,
          },
        }
      );

      console.log(response);

      const videoURL = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

      // Create NFT on Aptos
      const objectId = await createNFTAndAuction(videoURL);

      // Store NFT data
      const newNFT = {
        videoURL,
        nftName,
        description: nftDescription,
        objectId,
      };

      const updatedNFTs = [...uploadedNFTs, newNFT];
      setUploadedNFTs(updatedNFTs);
      localStorage.setItem(
        `nfts_${account.address}`,
        JSON.stringify(updatedNFTs)
      );

      // Reset form
      setNftName('');
      setNftDescription('');
      setStartPrice('');
      setAuctionDuration('');
      setVideoFile(null);

      alert('NFT created successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating NFT. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render component (keeping your existing render logic...)
  return (
    <div
      className='flex min-h-screen flex-col overflow-hidden text-white'
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Your existing rendering logic */}
      {Capacitor.getPlatform() === 'ios' ? (
        <div>iOS platform UI</div>
      ) : (
        <div className='flex flex-grow flex-col items-center gap-3 overflow-y-auto px-4'>
          <NextImage
            src='/images/demo-profile.png'
            alt='Image placeholder'
            className='relative h-32 w-32 rounded-full border-4 border-primary-500'
            imgClassName='object-cover rounded-full'
            fill={true}
          />
          <span className='block'>
            {account?.address
              ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
              : '.Dev'}
          </span>
          <AptosWalletButton />)
          {connected && (
            <div className='w-full max-w-lg space-y-6 px-6 py-8'>
              <div
                className='relative rounded bg-primary-500 py-5 pl-8 text-xl font-semibold uppercase tracking-wider text-white'
                // onClick={() => createNFT()}
              >
                Create NFT
              </div>
              <div className='flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-8'>
                <input
                  type='file'
                  onChange={handleFileUpload}
                  className='mb-4 cursor-pointer text-sm text-gray-500 file:mr-4 file:rounded-md file:border-none file:bg-blue-50 file:px-4 file:py-2 file:text-blue-600 hover:file:bg-blue-100'
                />
                <button
                  onClick={uploadToPinata}
                  className={`mt-4 w-full rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white transition-colors duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    loading ? 'cursor-not-allowed opacity-70' : ''
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Creating NFT...' : 'Create NFT'}
                </button>
              </div>
            </div>
          )}
          {/* Display Created NFTs */}
          {uploadedNFTs.length > 0 && (
            <div className='mx-auto my-10 overflow-hidden rounded-2xl sm:w-[26rem] sm:max-w-lg'>
              <div className='relative bg-primary-500 py-5 pl-8 text-center text-xl font-semibold uppercase tracking-wider text-white'>
                Your NFTs
              </div>
              <div className='mt-4 flex flex-col items-center gap-6'>
                {uploadedNFTs.map((nft: any, index: number) => (
                  <div key={index} className='w-full'>
                    <h3 className='mb-2 text-lg font-semibold'>
                      {nft.nftName}
                    </h3>
                    <p className='mb-2 text-sm'>{nft.description}</p>
                    {nft.objectId && (
                      <p className='mb-2 text-xs text-gray-400'>
                        ID: {nft.objectId}
                      </p>
                    )}
                    <video
                      controls
                      src={nft.videoURL}
                      className='w-full rounded-lg shadow-lg'
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {createPortal(<Menu />, document.body)}
    </div>
  );
};

export default Profile;
