import { useRouter } from 'next/router';
import * as React from 'react';
import { toast } from 'react-toastify';

import Kbd from '@/components/Kbd';
import AnimateFade from '@/components/Layout/AnimateFade';
import Multiplayer from '@/components/Multiplayer/Multiplayer';
import Seo from '@/components/Seo';

import { useChatContext } from '@/context/Chat/ChatContext';
import { useRoomContext } from '@/context/Room/RoomContext';
import { Player } from '@/context/Room/types';

export default function MultiplayerPage() {
  const {
    room: { socket, user },
    dispatch,
    resetTime,
  } = useRoomContext();

  const { dispatch: chatDispatch } = useChatContext();

  const router = useRouter();

  React.useEffect(() => {
    if (user.id && router?.query?.id) {
      console.log('Joining room:', router?.query?.id);
      socket.emit('join room', { roomId: router?.query?.id, user });
      dispatch({ type: 'SET_ROOM_ID', payload: router?.query?.id as string });
      chatDispatch({ type: 'CLEAR_ROOM_CHAT' });

      socket.off('room update').on('room update', (players: Player[]) => {
        console.log('Received room_update event with players:', players);
        dispatch({ type: 'SET_PLAYERS', payload: players });
      });

      socket.off('start game').on('start game', () => {
        console.log('Received start_game event in page component');
        dispatch({ type: 'SET_STATUS', payload: { progress: 0, wpm: 0 } });
        dispatch({ type: 'SET_IS_FINISHED', payload: false });
        dispatch({ type: 'SET_WINNER', payload: null });
        resetTime(5).then(() => {
          dispatch({ type: 'SET_IS_READY', payload: true });
        });
      });

      // Reset game state
      dispatch({ type: 'SET_STATUS', payload: { progress: 0, wpm: 0 } });
      dispatch({ type: 'SET_IS_READY', payload: false });
      dispatch({ type: 'SET_IS_PLAYING', payload: false });
      dispatch({ type: 'SET_IS_FINISHED', payload: false });
      dispatch({ type: 'SET_WINNER', payload: null });
      resetTime(0);

      socket.off('end game').on('end game', (playerId: string) => {
        console.log('Received end_game event for player:', playerId);
        dispatch({ type: 'SET_IS_PLAYING', payload: false });
        dispatch({ type: 'SET_WINNER', payload: playerId });
        dispatch({ type: 'SET_IS_READY', payload: false });
      });

      socket.off('room invalid').on('room invalid', () => {
        console.log('Received room_invalid event');
        toast.error("Room doesn't exist.", {
          position: toast.POSITION.TOP_CENTER,
          toastId: "Room doesn't exist.",
          autoClose: 3000,
        });
        router.push('/multiplayer');
      });

      socket.off('room in game').on('room in game', () => {
        console.log('Received room_in_game event');
        toast.error('Room is currently in game.', {
          position: toast.POSITION.TOP_CENTER,
          toastId: 'Room is currently in game.',
          autoClose: 3000,
        });
        router.push('/multiplayer');
      });

      socket.off('words generated').on('words generated', (text: string) => {
        console.log('Received words_generated event with text:', text);
        dispatch({ type: 'SET_TEXT', payload: text });
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query, user.id]);

  return (
    <AnimateFade>
      <Seo title='Multiplayer' />
      <main>
        <section>
          <div className='layout flex min-h-[80vh] flex-col items-center justify-center gap-8 pt-8'>
            <div className='relative flex h-8 w-full max-w-[800px] items-center justify-between'>
              <Kbd>tab</Kbd>
            </div>
            <Multiplayer />
          </div>
        </section>
      </main>
    </AnimateFade>
  );
}
