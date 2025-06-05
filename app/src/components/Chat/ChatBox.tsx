import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import * as React from 'react';
import { GiDiscussion } from 'react-icons/gi';

import { useChatContext } from '@/context/Chat/ChatContext';
import { useRoomContext } from '@/context/Room/RoomContext';

import Bubble from './Bubble';
import ChatInput from './ChatInput';

export default function ChatBox({
  className,
  label,
  isRoomChat,
}: {
  className: string;
  label: string;
  isRoomChat?: boolean;
}) {
  const {
    room: { socket, user: { roomId } }} = useRoomContext();
  const { chat, dispatch } = useChatContext();
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isPublic, setIsPublic] = React.useState(false);

  const { pathname } = useRouter();
  const divRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;

  React.useEffect(() => {
    if (socket) {
      socket.on('receive chat', (message) => {
        console.log('Received chat message:', message);
        
        // Add message to appropriate chat list
        if (message.roomId === 'public' || !message.roomId) {
          dispatch({ type: 'ADD_PUBLIC_CHAT', payload: message });
        } else {
          dispatch({ type: 'ADD_ROOM_CHAT', payload: message });
        }

        // Show notification if chat is closed
        if (!isChatOpen) {
          dispatch({ type: 'SET_SHOW_NOTIFICATION', payload: true });
        }
      });

      socket.on('online users', (users: number) => {
        dispatch({ type: 'SET_ONLINE_USERS', payload: users });
      });

      return () => {
        socket.off('receive chat');
        socket.off('online users');
      };
    }
  }, [socket, isChatOpen, dispatch]);

  React.useEffect(() => {
    if (divRef.current && isChatOpen) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
  }, [chat.publicChat, chat.roomChat, isChatOpen]);

  const displayMessages = isRoomChat 
    ? (isPublic ? chat.publicChat : chat.roomChat)
    : chat.publicChat;

  return (
    <span className='z-1 absolute flex w-full cursor-pointer items-center justify-end text-3xl font-bold text-bg'>
      <button
        onClick={() => {
          setIsChatOpen(!isChatOpen);
          dispatch({ type: 'SET_SHOW_NOTIFICATION', payload: false });
        }}
        className='active:text-fg/-80 flex flex-col items-center gap-1 text-3xl text-fg transition-colors duration-200 hover:text-fg/90'
      >
        <GiDiscussion />
        <span className='mr-2 text-sm'>{label}</span>
      </button>
      {chat.showNotification && (
        <div
          className={`absolute -right-2 -top-2 h-4 w-4 animate-bounce rounded-full bg-fg text-xs text-bg ${
            ['/multiplayer', '/'].includes(pathname) && 'right-2'
          }`}
        >
          !
        </div>
      )}
      <div
        onClick={() => isChatOpen && setIsChatOpen(false)}
        className={`fixed inset-0 flex cursor-default gap-4 rounded-lg bg-bg/90 opacity-0 transition-all duration-300 ${
          isChatOpen ? 'z-30 opacity-100' : 'pointer-events-none -z-10'
        } ${className}`}
      ></div>
      <AnimatePresence exitBeforeEnter>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            key='chat-box'
            className={`absolute -bottom-[26rem] -right-4 z-40 flex h-[24.5rem] cursor-auto justify-between gap-4 rounded-lg bg-bg/30 p-4 ring ring-fg/60 ring-offset-2 ring-offset-bg ${className}`}
          >
            <div className='flex h-full w-full flex-col justify-between'>
              <div className='flex justify-between'>
                <div className='mb-2 flex gap-2 text-sm'>
                  {isRoomChat && (
                    <button
                      onClick={() => setIsPublic(false)}
                      className={clsx(
                        'rounded-lg px-2 py-1 transition-colors duration-200',
                        [!isPublic ? 'bg-fg text-bg' : 'text-hl']
                      )}
                    >
                      room
                    </button>
                  )}
                  <button
                    onClick={() => setIsPublic(true)}
                    className={clsx(
                      'rounded-lg px-2 py-1 transition-colors duration-200',
                      [isPublic || !isRoomChat ? 'bg-fg text-bg' : 'text-hl']
                    )}
                  >
                    public
                  </button>
                </div>
                <span className='pr-4 text-sm text-fg xs:pr-6'>
                  {chat.onlineUsers} online
                </span>
              </div>
              <div
                ref={divRef}
                className='xs:scrollbar mx-auto flex h-full w-full flex-col overflow-y-auto break-words py-2 pr-4 xs:pr-2'
              >
                {displayMessages.map((chat, index) => (
                  <Bubble
                    key={index}
                    username={chat.username}
                    value={chat.value}
                    type={chat.type}
                  />
                ))}
              </div>
              <ChatInput isPublic={isPublic} roomId={roomId} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
