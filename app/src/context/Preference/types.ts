export type PreferenceState = {
  fontFamily: string;
  isOpen: boolean;
  zenMode: boolean;
  type: string;
  time: string;
};

export type Action =
  | { type: 'SET_FONT_FAMILY'; payload: string }
  | { type: 'SET_TYPE'; payload: string }
  | { type: 'SET_TIME'; payload: string }
  | { type: 'SET_ZEN_MODE'; payload: boolean };

export type ProviderState = {
  preferences: PreferenceState;
  dispatch: React.Dispatch<Action>;
};
