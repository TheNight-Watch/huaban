import React from 'react';
import groundPicture from '../assets/images/groundpicture.svg';
import CircularGallery from '../components/CircularGallery';

// 儿童绘画作品数据
const artworks = [
  {
    image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&h=600&fit=crop&crop=face",
    text: "2024/10/3 我的自画像"
  },
  {
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop",
    text: "2024/9/27 点线面的构成"
  },
  {
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    text: "2024/9/25 我未来的家"
  },
  {
    image: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=800&h=600&fit=crop",
    text: "2024/9/24 小狮子"
  },
  {
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
    text: "2024/9/20 彩虹桥"
  },
  {
    image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&h=600&fit=crop",
    text: "2024/9/18 花园里的蝴蝶"
  }
];

interface GalleryPageProps {
  items?: { image: string; text: string }[];
  onSelectIndex?: (index: number) => void;
  onFilterClick?: () => void;
  onNavigateToUpload?: () => void;
  onNavigateToProfile?: () => void;
}

const GalleryPage: React.FC<GalleryPageProps> = ({
  items = artworks,
  onSelectIndex,
  onFilterClick,
  onNavigateToUpload,
  onNavigateToProfile
}) => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 底图背景 */}
      <img 
        src={groundPicture}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 顶部系统状态栏已移除 */}

      {/* 顶部栏 */}
      <div 
        className="relative z-40 mx-0 mb-4"
        style={{ 
          backgroundColor: 'rgba(249, 247, 243, 0.8)',
          boxShadow: '0px 4px 10px 0px rgba(187, 187, 187, 0.25)'
        }}
      >
        <div className="flex items-center justify-between px-5 py-4">
          {/* 左侧菜单图标 */}
          <button
            aria-label="filter"
            onClick={onFilterClick}
            className="w-6 h-6 flex flex-col justify-center items-center space-y-1 opacity-50"
            title="筛选（暂未开放）"
          >
            <div className="w-4 h-0.5 bg-black"></div>
            <div className="w-4 h-0.5 bg-black"></div>
            <div className="w-4 h-0.5 bg-black"></div>
          </button>
          
          {/* 中间标题 */}
          <h1 
            className="text-black font-medium text-center"
            style={{
              fontFamily: 'Source Han Sans CN',
              fontSize: '15px',
              fontWeight: 500,
              lineHeight: '1.6em'
            }}
          >
            画廊
          </h1>
          
          {/* 右侧占位 */}
          <div className="w-6 h-6"></div>
        </div>
      </div>

      {/* CircularGallery 3D展示区域 */}
      <div className="relative flex-1 pb-32 px-4">
        <div style={{ height: '600px', position: 'relative', width: '100%', maxWidth: '375px', margin: '0 auto' }}>
          <CircularGallery 
            items={items}
            bend={0}
            textColor="#464646"
            borderRadius={0.08}
            font="bold 12px Source Han Sans CN"
            scrollSpeed={1.2}
            scrollEase={0.08}
            onItemClick={(index: number) => onSelectIndex && onSelectIndex(index)}
          />
        </div>
        
        {/* 操作提示 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          <div className="flex flex-col items-center text-gray-600">
            <svg 
              className="w-6 h-6 mb-1 animate-pulse" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 9l4-4 4 4m0 6l-4 4-4-4" 
              />
            </svg>
            <p 
              className="text-xs"
              style={{
                fontFamily: 'Source Han Sans CN',
                fontSize: '10px',
                color: '#666666'
              }}
            >
              拖拽或滚动浏览作品
            </p>
          </div>
        </div>
      </div>

      {/* 全局底部栏由 AppShell 提供，此处移除页面内实现 */}
    </div>
  );
};

export default GalleryPage;
