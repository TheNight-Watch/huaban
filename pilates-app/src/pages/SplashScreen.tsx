import React from 'react';
import logoSplash from '../assets/images/logo-splash.png';
import groundPicture from '../assets/images/groundpicture.svg';

const SplashScreen: React.FC = () => {

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 底图背景 */}
      <img 
        src={groundPicture}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      

      {/* 装饰性散点 - 左侧 */}
      <div className="absolute top-72 -left-24 w-80 h-80">
        {/* 这里可以添加装饰性的圆点图案 */}
        <div className="relative w-full h-full">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 rounded-full bg-orange-100 opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `scale(${0.3 + Math.random() * 0.7})`
              }}
            />
          ))}
        </div>
      </div>

      {/* 装饰性散点 - 右侧 */}
      <div className="absolute top-0 right-0 w-96 h-80">
        <div className="relative w-full h-full">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-orange-200 opacity-40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `scale(${0.4 + Math.random() * 0.6})`
              }}
            />
          ))}
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-8">
        {/* Logo 容器 */}
        <div className="mb-8">
          <div 
            className="w-32 h-32 rounded-3xl shadow-lg flex items-center justify-center"
            style={{ backgroundColor: '#F9F7F3' }}
          >
            {/* Logo 图像区域 */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-200 to-orange-300">
              <img
                src={logoSplash}
                alt="app logo"
                className="w-full h-full object-contain"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </div>

        {/* 应用名称 */}
        <h1 
          className="text-black font-medium text-center mb-4"
          style={{ 
            fontFamily: 'Source Han Sans CN',
            fontSize: '16px',
            fontWeight: 500,
            letterSpacing: '0.25em'
          }}
        >
          画伴
        </h1>

        {/* 应用描述 */}
        <p 
          className="text-black text-center leading-relaxed max-w-xs"
          style={{
            fontFamily: 'Source Han Serif SC',
            fontSize: '15px',
            fontWeight: 400,
            lineHeight: '1.44',
            letterSpacing: '-0.02em'
          }}
        >
          让孩子画笔下的故事"活"起来，
          <br />
          让记录变成亲子关系的一部分。
        </p>
      </div>

      {/* 底部Home指示器 */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2">
        <div className="w-32 h-1 bg-black rounded-full"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
