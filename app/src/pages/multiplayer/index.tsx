import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { CgSpinner } from 'react-icons/cg';
import { FaArrowRight } from 'react-icons/fa';
import { RiTeamFill } from 'react-icons/ri';
import { toast } from 'react-toastify';
import * as yup from 'yup';

import { createRoom } from '@/lib/socket/roomHandler';

import Button from '@/components/Button/Button';
import ChatBox from '@/components/Chat/ChatBox';
import Input from '@/components/Input';
import AnimateFade from '@/components/Layout/AnimateFade';
import Seo from '@/components/Seo';

import { useRoomContext } from '@/context/Room/RoomContext';

const schema = yup.object().shape({
  code: yup
    .string()
    .required('code is required')
    .length(6, 'code must be 6 characters long'),
});

const ROOM_CREATION_TIMEOUT = 5000; // 5 seconds timeout

export default function MultiplayerPage() {
  const methods = useForm<{ code: string }>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  });
  const { handleSubmit } = methods;

  const {
    room: { socket, mode },
    dispatch,
    resetTime,
  } = useRoomContext();

  const router = useRouter();

  const [isCreatingRoom, setIsCreatingRoom] = React.useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = React.useState(false);

  React.useEffect(() => {
    if (!socket) return;

    socket.emit('hi', 'hello');

    // create another room id if already exist
    socket.off('room already exist').on('room already exist', () => {
      createRoom(socket, mode);
    });

    socket.off('end game').on('end game', () => {
      dispatch({ type: 'SET_STATUS', payload: { progress: 0, wpm: 0 } });
      dispatch({ type: 'SET_IS_READY', payload: false });
      dispatch({ type: 'SET_IS_PLAYING', payload: false });
      dispatch({ type: 'SET_IS_FINISHED', payload: false });
      dispatch({ type: 'SET_WINNER', payload: null });
      resetTime(0);
    });

    // on create room success, redirect to that room
    socket
      .off('create room success')
      .on('create room success', (roomId: string) => {
        toast.success('Room successfully created!', {
          position: toast.POSITION.TOP_CENTER,
          toastId: 'create-room',
          autoClose: 3000,
        });
        setIsCreatingRoom(false);
        dispatch({ type: 'SET_IS_OWNER', payload: true });
        router.push(`/multiplayer/${roomId}`);
      });

    return () => {
      socket.off('room already exist');
      socket.off('end game');
      socket.off('create room success');
    };
  }, [socket, mode, dispatch, resetTime, router]);

  const handleCreateRoom = React.useCallback(() => {
    if (!socket) return;
    
    setIsCreatingRoom(true);
    createRoom(socket, mode);

    // Set a timeout to handle room creation failure
    const timeoutId = setTimeout(() => {
      if (isCreatingRoom) {
        setIsCreatingRoom(false);
        toast.error('Failed to create room. Please try again.', {
          position: toast.POSITION.TOP_CENTER,
          toastId: 'create-room-error',
          autoClose: 3000,
        });
      }
    }, ROOM_CREATION_TIMEOUT);

    return () => clearTimeout(timeoutId);
  }, [socket, mode, isCreatingRoom]);

  const onSubmit = ({ code }: { code: string }) => {
    setIsJoiningRoom(true);
    router.push(`/multiplayer/${code}`);
  };

  return (
    <AnimateFade>
      <Seo title='Multiplayer' />

      <main>
        <section>
          <div className='layout flex min-h-[80vh] flex-col items-center justify-center gap-8 pt-8'>
            <div className='relative flex h-8 w-full max-w-[800px] items-center justify-between'>
              <ChatBox
                className='right-3 w-[calc(100%+2rem)] sm:right-2'
                label='public chat'
              />
            </div>

            <div className='flex w-full max-w-[800px] flex-col items-center gap-8'>
              <FormProvider {...methods}>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className='flex w-full flex-col items-center gap-4'
                >
                  <Input
                    placeholder='enter room code'
                    autoComplete='off'
                    name='code'
                    id='code'
                    maxLength={6}
                    className='text-center'
                  />
                  <Button
                    type='submit'
                    className='flex items-center'
                    disabled={isJoiningRoom}
                  >
                    {isJoiningRoom ? (
                      <CgSpinner className='animate-spin' />
                    ) : (
                      <>
                        <RiTeamFill className='mr-1' />
                        Join Room
                      </>
                    )}
                  </Button>
                </form>
              </FormProvider>

              <div className='flex items-center gap-4'>
                <Button
                  onClick={handleCreateRoom}
                  className='flex items-center'
                  disabled={isCreatingRoom}
                >
                  {isCreatingRoom ? (
                    <CgSpinner className='animate-spin' />
                  ) : (
                    <>
                      <FaArrowRight className='mr-1' />
                      Create Room
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </AnimateFade>
  );
}
