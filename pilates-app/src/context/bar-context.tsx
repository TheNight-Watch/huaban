import React, { createContext, useContext, useMemo, useState } from 'react';

export type TabKey = 'gallery' | 'upload' | 'grow';

interface BarState {
  active: TabKey;
  visible: boolean;
}

interface BarContextValue extends BarState {
  setActive: (tab: TabKey) => void;
  show: () => void;
  hide: () => void;
  setVisible: (v: boolean) => void;
}

const BarContext = createContext<BarContextValue | undefined>(undefined);

export const BarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [active, setActive] = useState<TabKey>('gallery');
  const [visible, setVisible] = useState<boolean>(true);

  const value = useMemo<BarContextValue>(
    () => ({
      active,
      visible,
      setActive,
      show: () => setVisible(true),
      hide: () => setVisible(false),
      setVisible,
    }),
    [active, visible]
  );

  return <BarContext.Provider value={value}>{children}</BarContext.Provider>;
};

export function useBar(): BarContextValue {
  const ctx = useContext(BarContext);
  if (!ctx) throw new Error('useBar must be used within BarProvider');
  return ctx;
}

