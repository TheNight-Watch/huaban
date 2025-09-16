import React from 'react';

// 图标组件
const UserIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
    <path d="M4.67 1.33C4.67 1.33 4.67 1.33 4.67 1.33C6.4 1.33 7.8 2.73 8 4.4C8.2 6.07 6.93 7.67 5.27 7.87C3.6 8.07 2 6.8 1.8 5.13C1.6 3.47 2.87 1.87 4.53 1.67C4.57 1.67 4.62 1.67 4.67 1.67V1.33Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.27 10C2.27 10 2.27 10 2.27 10C4.67 10 6.6 11.93 6.8 14.33C7 16.73 5.07 18.67 2.67 18.87C0.27 19.07 -1.67 17.13 -1.87 14.73C-2.07 12.33 -0.13 10.4 2.27 10.2C2.27 10.13 2.27 10.07 2.27 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PaymentIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="3.5" width="13" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1.5 6.05h13" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7.5 10.5h1" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10.5 10.5h2" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const PrivacyIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
    <path d="M2.5 5.5h11v8a1 1 0 01-1 1h-9a1 1 0 01-1-1v-8z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5.75 1v4.5h4.5V1a2.25 2.25 0 00-4.5 0z" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const NotificationIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
    <path d="M2.56 2C7.44 2 11.44 6 11.44 10.87C11.44 12.93 10.56 14.87 9.13 16.13L2.56 2Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 12h4v2.5H6z" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const AboutIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="8" cy="10.5" r="0.75" fill="currentColor"/>
    <path d="M6.25 5h3.5v4h-3.5z" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

// 底部导航图标
const GalleryIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <path d="M2.59 4.45h18.83v15.09H2.59z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

const PersonIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <path d="M4.25 3.75h15.5v16.48H4.25z" fill="currentColor"/>
  </svg>
);

const UploadIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <path d="M4.25 3.27h15.5v17.48H4.25z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon, title, onClick }) => (
  <div 
    className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
    onClick={onClick}
  >
    <div className="w-9 h-9 bg-[#62ABEF] bg-opacity-20 rounded-full flex items-center justify-center">
      <div className="text-[#62ABEF]">
        {icon}
      </div>
    </div>
    <span className="text-sm font-medium text-[#454545]">{title}</span>
  </div>
);

interface TabBarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const TabBarItem: React.FC<TabBarItemProps> = ({ icon, label, active = false, onClick }) => (
  <div 
    className="flex flex-col items-center gap-1 cursor-pointer"
    onClick={onClick}
  >
    <div className={active ? "text-[#2489FF]" : "text-black"}>
      {icon}
    </div>
    <span className={`text-xs ${active ? "font-bold text-black" : "font-normal text-black"}`}>
      {label}
    </span>
  </div>
);

interface ProfilePageProps {
  onNavigateToGallery?: () => void;
  onNavigateToUpload?: () => void;
  onNavigateToProfile?: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigateToGallery, onNavigateToUpload, onNavigateToProfile }) => {
  const handleSettingClick = (setting: string) => {
    console.log(`点击了${setting}设置`);
    // 这里可以添加导航逻辑
  };

  const handleTabClick = (tab: string) => {
    if (tab === '画廊') onNavigateToGallery && onNavigateToGallery();
    if (tab === '上传') onNavigateToUpload && onNavigateToUpload();
    if (tab === '个人') onNavigateToProfile && onNavigateToProfile();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9F7F3] via-[#FCF2E2] to-[#FFEDD3]">
      {/* 主要内容区域 */}
      <div className="px-7 pt-32 pb-24">
        {/* 用户信息区域 */}
        <div className="flex flex-col items-center mb-16">
          <div className="w-21 h-21 mb-1">
            <img 
              src="/src/assets/images/profile-avatar-34cbce.png" 
              alt="用户头像"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <h2 className="text-base font-bold text-[#454545] mb-1">小苹果</h2>
          <p className="text-sm font-medium text-[#62ABEF]">我是一颗小苹果</p>
        </div>

        {/* 设置卡片 */}
        <div className="bg-[#F9F7F3] rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-[#454545] mb-5">设置</h3>
          
          <div className="space-y-5">
            <SettingRow 
              icon={<UserIcon />}
              title="Account"
              onClick={() => handleSettingClick('Account')}
            />
            <SettingRow 
              icon={<PaymentIcon />}
              title="Payment"
              onClick={() => handleSettingClick('Payment')}
            />
            <SettingRow 
              icon={<PrivacyIcon />}
              title="Privacy & Security"
              onClick={() => handleSettingClick('Privacy & Security')}
            />
            <SettingRow 
              icon={<NotificationIcon />}
              title="Notifications"
              onClick={() => handleSettingClick('Notifications')}
            />
            <SettingRow 
              icon={<AboutIcon />}
              title="About"
              onClick={() => handleSettingClick('About')}
            />
          </div>
        </div>
      </div>

      {/* 全局底部栏由 AppShell 提供，此处移除页面内实现 */}
    </div>
  );
};

export default ProfilePage;
