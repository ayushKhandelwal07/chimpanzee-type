import * as React from 'react';
import reducer from './reducer';
import { ChatState, ChatContextValues, Action } from './types';

const initialState: ChatState = {
  publicChat: [],
  roomChat: [],
  onlineUsers: 0,
  showNotification: false,
};

const ChatContext = React.createContext<ChatContextValues | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chat, dispatch] = React.useReducer(reducer, initialState);

  const value = React.useMemo(
    () => ({
      chat,
      dispatch,
    }),
    [chat]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = React.useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
