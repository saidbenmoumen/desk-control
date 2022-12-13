import React from 'react';

export type State = {
  device: BluetoothDevice | null;
  server: any | null;
  service: BluetoothRemoteGATTService | null;
  currentPosition: number | null;
  isSaving: boolean;
  memos: {
    1: number | null;
    2: number | null;
    3: number | null;
    4: number | null;
  };
  move: {
    direction: 'up' | 'down';
    to: number;
    isDoing: boolean;
  } | null;
};

export const DeskContext = React.createContext<{
  state: State;
  callbacks: {
    onPair: () => Promise<void>;
    saveMemo: (memo: number) => void;
    setIsSaving: () => void;
    moveTo: (action: 'up' | 'down' | 'stop' | number | null) => void;
  };
}>({
  state: {
    device: null,
    server: null,
    service: null,
    currentPosition: null,
    move: null,
    isSaving: false,
    memos: {
      1: Number(localStorage.getItem('memo-1')),
      2: Number(localStorage.getItem('memo-2')),
      3: Number(localStorage.getItem('memo-3')),
      4: Number(localStorage.getItem('memo-4')),
    },
  },
  callbacks: {
    onPair: async () => console.warn('NOT LOADED!'),
    saveMemo: () => console.warn('NOT LOADED!'),
    setIsSaving: () => console.warn('NOT LOADED!'),
    moveTo: () => console.warn('NOT LOADED!'),
  },
});
