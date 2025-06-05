import * as React from 'react';
import { io, Socket } from 'socket.io-client';

import reducer from './reducer';
import { RoomContextValues, RoomState } from './types';

const initialState: RoomState = {
  user: {
    username: '',
    isOwner: false,
    roomId: null,
    id: '',
    status: {
      wpm: 0,
      progress: 0,
    },
    isReady: false,
  },
  mode: 'words',
  isFinished: false,
  isPlaying: false,
  isChatOpen: false,
  text: '',
  players: [],
  socket: null as unknown as Socket,
  winner: null,
};

const RoomContext = React.createContext<RoomContextValues | undefined>(undefined);

export default function RoomProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [room, dispatch] = React.useReducer(reducer, initialState);
  const [timeBeforeRestart, setTimeBeforeRestart] = React.useState(0);

  React.useEffect(() => {
    console.log('Initializing socket connection...');
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket.id);
      dispatch({ type: 'SET_USER_ID', payload: socket.id });    
      dispatch({ type: 'SET_SOCKET', payload: socket });
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    return () => {
      console.log('Cleaning up socket connection...');
      socket.close();
    };
  }, []);

  const resetTime = React.useCallback(
    (time: number) =>
      new Promise<void>((resolve) => {
        setTimeBeforeRestart(time);
        const interval = setInterval(() => {
          setTimeBeforeRestart((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              resolve();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }),
    []
  );

  const value = React.useMemo(
    () => ({
      room,
      dispatch,
      timeBeforeRestart,
      resetTime,
    }),
    [room, dispatch, timeBeforeRestart, resetTime]
  );

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRoomContext() {
  const context = React.useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoomContext must be used within a RoomProvider');
  }
  return context;
}
