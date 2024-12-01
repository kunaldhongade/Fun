import React, { useState } from 'react';
import { BiBarcodeReader } from 'react-icons/bi';
import { BsArrowLeft } from 'react-icons/bs';
import { RiContactsLine } from 'react-icons/ri';
import Button from '@/components/buttons/Button';
import NextImage from '@/components/NextImage';
import QRCodeInvitation from '@/features/Game/components/qr-code-invitation/QRCodeInvitation';
import { friends as initialFriends } from '@/features/Game/constants/friends';
import { useQuizContext } from '@/features/Game/contexts/QuizContext';

type Friend = {
  imgSrc: string;
  name: string;
  phone: string;
  invited: boolean;
};

type Props = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const InviteFriends = ({ setOpen }: Props) => {
  const [showQrCodeInvitation, setShowQrCodeInvitation] = useState(false);
  const [friends, setFriends] = useState(initialFriends);
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const { makeRefferal } = useQuizContext();

  const handleInvite = async (friendIndex: number) => {
    // Set loading state for this specific friend
    setLoadingStates((prev) => ({ ...prev, [friendIndex]: true }));

    try {
      // Call the original makeRefferal
      await makeRefferal();

      // Simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Update the friend's invited status
      setFriends((prev) =>
        prev.map((friend, idx) =>
          idx === friendIndex ? { ...friend, invited: true } : friend
        )
      );
    } finally {
      // Clear loading state
      setLoadingStates((prev) => ({ ...prev, [friendIndex]: false }));
    }
  };

  const main = () => {
    return (
      <div>
        {friends.map((friend, index) => {
          const isLoading = loadingStates[index];

          return (
            <div
              key={index}
              className='mt-10 flex items-center justify-between gap-1'
            >
              <div className='flex items-center gap-4'>
                <NextImage
                  src={friend.imgSrc}
                  alt=''
                  className='relative aspect-square h-[60px] rounded-full'
                  imgClassName='object-cover rounded-full'
                  fill
                />
                <div>
                  <span className='block text-lg'>{friend.name}</span>
                  <span className='text-sm'>{friend.phone}</span>
                </div>
              </div>
              {friend.invited ? (
                <Button
                  size='base'
                  className='w-max bg-primary-500 text-white'
                  variant='outline'
                >
                  Invited
                </Button>
              ) : (
                <Button
                  onClick={() => handleInvite(index)}
                  disabled={isLoading}
                  size='base'
                  className='w-max'
                  variant='outline'
                >
                  {isLoading ? 'Inviting...' : 'Invite'}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderInviteFriends = () => {
    if (showQrCodeInvitation) {
      return <QRCodeInvitation />;
    }
    return main();
  };

  const handleBack = () => {
    if (showQrCodeInvitation) {
      setShowQrCodeInvitation(false);
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <div className='z-40 flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <span onClick={() => handleBack()} className='text-2xl'>
            <BsArrowLeft />
          </span>
          <span className='font-primary text-xl font-bold'>Invite Friends</span>
        </div>
      </div>
      {renderInviteFriends()}
    </>
  );
};

export default InviteFriends;
