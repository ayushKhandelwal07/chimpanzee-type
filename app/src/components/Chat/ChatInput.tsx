import { useRouter } from 'next/router';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { useChatContext } from '@/context/Chat/ChatContext';
import { useRoomContext } from '@/context/Room/RoomContext';

interface ChatForm {
  chat: string;
}

export default function ChatInput({ isPublic, roomId }: { isPublic: boolean; roomId: string | null }) {
  const { room } = useRoomContext();
  const { dispatch } = useChatContext();
  const [error, setError] = React.useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<ChatForm>();

  React.useEffect(() => {
    const socket = room.socket;
    if (!socket) return;

    socket.on('chat error', (data: { message: string }) => {
      setError(data.message);
      setTimeout(() => setError(null), 3000);
    });

    return () => {
      socket.off('chat error');
    };
  }, [room.socket]);

  const onSubmit = handleSubmit(({ chat }) => {
    setError(null);
    if (!chat.trim()) return;
    
    const socket = room.socket;
    if (!socket) {
      setError('Not connected to chat server');
      return;
    }

    if (!socket.connected) {
      setError('Connection lost. Reconnecting...');
      socket.connect();
      return;
    }

    try {
      const message = {
        username: room.user.username || 'You',
        id: socket.id,
        value: chat.trim(),
        roomId: isPublic ? 'public' : roomId || 'public',
        type: 'message' as const,
      };

      console.log('Sending chat message:', message);
      socket.emit('send chat', message);
      
      // Remove local dispatch since we'll receive the message back from the server
      reset();
    } catch (error) {
      console.error('Error sending chat message:', error);
      setError('Failed to send message');
    }
  });

  return (
    <div className="flex flex-col w-full">
      {error && (
        <div className="text-red-500 text-sm mb-2 px-2">{error}</div>
      )}
      <form
        onSubmit={onSubmit}
        className='mt-2 flex w-full items-center gap-2 rounded-lg bg-bg/30 p-2'
      >
        <input
          {...register('chat')}
          type='text'
          placeholder='Type a message...'
          className='w-full rounded-lg bg-bg/30 p-2 text-sm text-fg outline-none ring-1 ring-fg/60 transition-all duration-200 focus:ring-2 focus:ring-fg'
        />
        <button
          type='submit'
          disabled={!room.socket?.connected}
          className='rounded-lg bg-fg px-4 py-2 text-sm text-bg transition-colors duration-200 hover:bg-fg/90 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Send
        </button>
      </form>
    </div>
  );
}
