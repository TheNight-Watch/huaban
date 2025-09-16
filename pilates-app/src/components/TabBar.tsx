import React from 'react';
import { Image, Upload, User } from 'lucide-react';

export type TabKey = 'gallery' | 'upload' | 'grow';

interface TabBarProps {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

const TabBar: React.FC<TabBarProps> = ({ active, onChange }) => {
  const Item: React.FC<{ k: TabKey; label: string; icon: React.ReactNode }> = ({ k, label, icon }) => (
    <button className="flex flex-col items-center" onClick={() => onChange(k)} aria-label={label}>
      <div className="w-6 h-6 mb-1">
        <div className={active === k ? 'text-[#2489FF]' : 'text-black'}>
          {icon}
        </div>
      </div>
      <span
        className={`text-xs ${active === k ? 'font-bold' : 'font-normal'}`}
        style={{ fontFamily: 'Source Han Sans CN', lineHeight: '2em' }}
      >
        {label}
      </span>
    </button>
  );

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-24 flex items-center justify-around px-8 pt-4 z-40"
      style={{
        backgroundColor: 'rgba(255, 251, 244, 0.8)',
        boxShadow: '0px -4px 10.9px 0px rgba(0, 0, 0, 0.05)',
        borderRadius: '16px 16px 0px 0px'
      }}
    >
      <Item k="gallery" label="画廊" icon={<Image className="w-6 h-6" />} />
      <Item k="upload" label="上传" icon={<Upload className="w-6 h-6" />} />
      <Item k="grow" label="成长" icon={<User className="w-6 h-6" />} />
    </div>
  );
};

export default TabBar;

