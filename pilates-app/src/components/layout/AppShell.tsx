import React from 'react';
import TabBar from '../TabBar';
import { useBar } from '../../context/bar-context';
import type { TabKey } from '../../context/bar-context';

interface AppShellProps {
  children: React.ReactNode;
  onTabChange: (key: TabKey) => void;
}

const AppShell: React.FC<AppShellProps> = ({ children, onTabChange }) => {
  const bar = useBar();

  return (
    <div
      className="relative min-h-screen"
      style={{
        background: 'linear-gradient(180deg, rgba(249, 247, 243, 1) 0%, rgba(252, 242, 226, 1) 90%, rgba(255, 237, 211, 1) 100%)'
      }}
    >
      {/* Content area with bottom padding to avoid TabBar overlap */}
      <div className="pb-28">{children}</div>

      {bar.visible && (
        <TabBar
          active={bar.active}
          onChange={(k) => {
            bar.setActive(k);
            onTabChange(k);
          }}
        />
      )}
    </div>
  );
};

export default AppShell;

