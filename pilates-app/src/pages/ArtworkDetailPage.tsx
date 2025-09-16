import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, Edit3, Volume2 } from 'lucide-react';
import * as api from '../services/api';

interface ArtworkDetailPageProps {
  onBack?: () => void;
  onEdit?: () => void;
  onEnterAnalysis?: () => void;
  title?: string;
  videoUrl?: string;
  videoKey?: string;
}

const ArtworkDetailPage: React.FC<ArtworkDetailPageProps> = ({ 
  onBack, 
  onEdit,
  onEnterAnalysis,
  title,
  videoUrl,
  videoKey
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [descriptionText, setDescriptionText] = useState<string | undefined>(undefined);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const [audioError, setAudioError] = useState<string | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchDeltaY = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioType = useMemo(() => {
    if (!audioUrl) return undefined;
    const u = audioUrl.split('?')[0].toLowerCase();
    if (u.endsWith('.mp3')) return 'audio/mpeg';
    if (u.endsWith('.m4a') || u.endsWith('.mp4')) return 'audio/mp4';
    if (u.endsWith('.wav')) return 'audio/wav';
    if (u.endsWith('.ogg')) return 'audio/ogg';
    return undefined;
  }, [audioUrl]);

  const hasBackend = useMemo(() => Boolean((process.env.REACT_APP_API_BASE || '').trim()), []);

  const handlePlayAudio = async () => {
    if (!audioRef.current) return;
    try {
      if (!isPlaying) {
        await audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  };

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      console.log('返回上一页');
      // 默认行为：返回画廊页面
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      console.log('编辑画作');
      // 默认行为：进入编辑模式
    }
  };

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchDeltaY.current = 0;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current == null) return;
      touchDeltaY.current = e.touches[0].clientY - touchStartY.current;
    };
    const handleTouchEnd = () => {
      if (touchDeltaY.current < -80) {
        onEnterAnalysis && onEnterAnalysis();
      }
      touchStartY.current = null;
      touchDeltaY.current = 0;
    };
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onEnterAnalysis]);

  // 加载详情文本与音频
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!hasBackend || !videoKey) return;
        const data = await api.getArtworkByVideoKey(videoKey);
        if (!mounted) return;
        setDescriptionText(data?.descriptionText || undefined);
        setAudioUrl(data?.audio?.url || undefined);
      } catch (e) {
        console.warn('Load artwork detail failed:', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [hasBackend, videoKey]);

  // 监听音频结束复位按钮态
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnded = () => setIsPlaying(false);
    const onPause = () => setIsPlaying(false);
    el.addEventListener('ended', onEnded);
    el.addEventListener('pause', onPause);
    return () => {
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('pause', onPause);
    };
  }, [audioRef.current]);

  return (
    <div className="min-h-screen relative" style={{
      background: 'linear-gradient(180deg, rgba(249, 247, 243, 1) 0%, rgba(252, 242, 226, 1) 90%, rgba(255, 237, 211, 1) 100%)'
    }}>
      {/* 顶部系统状态栏已移除 */}
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 顶部装饰图案 - 更密集的点阵 */}
        <div className="absolute -top-20 -left-28 w-96 h-96 opacity-80">
          <div className="relative w-full h-full">
            {Array.from({ length: 300 }).map((_, i) => (
              <div
                key={`top-${i}`}
                className="absolute w-4 h-4 border"
                style={{
                  left: `${(i % 20) * 18}px`,
                  top: `${Math.floor(i / 20) * 18}px`,
                  background: '#FFF5E5',
                  borderColor: '#FFF5E5'
                }}
              />
            ))}
          </div>
        </div>
        
        {/* 底部装饰图案 */}
        <div className="absolute -bottom-20 left-28 w-96 h-80 opacity-90">
          <div className="relative w-full h-full">
            {Array.from({ length: 240 }).map((_, i) => (
              <div
                key={`bottom-${i}`}
                className="absolute w-3 h-3 border"
                style={{
                  left: `${(i % 20) * 18}px`,
                  top: `${Math.floor(i / 20) * 18}px`,
                  background: '#F9ECD9',
                  borderColor: '#F9ECD9'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 顶部导航 */}
      <div className="relative z-10 flex justify-between items-center px-8 pt-8 pb-8">
        <button 
          onClick={handleGoBack}
          className="flex items-center justify-center w-6 h-6"
          aria-label="back"
        >
          <ChevronLeft className="w-6 h-6 text-black" strokeWidth={2} />
        </button>
        <button 
          onClick={handleEdit}
          className="flex items-center justify-center w-6 h-6"
          aria-label="edit"
        >
          <Edit3 className="w-6 h-6 text-black" strokeWidth={2} />
        </button>
      </div>

      {/* 主要内容区域 */}
      <div className="relative z-10 px-8">
        {/* 画作展示卡片 */}
        <div className="bg-[#F9F7F3] rounded-md shadow-lg p-3.5 mb-8 relative"
             style={{ 
               boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.25)',
               maxWidth: '317px',
               margin: '0 auto'
             }}>
          <div className="bg-white rounded-sm overflow-hidden mb-6" style={{ height: '268px' }}>
            {videoUrl ? (
              <video 
                src={videoUrl} 
                autoPlay
                muted
                loop
                playsInline
                controls={false}
                disablePictureInPicture
                controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
                className="w-full h-full object-cover bg-white"
              />
            ) : (
              <img 
                src={require('../assets/images/artwork-image-7d6e1b.png')}
                alt="作品"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <h2 className="text-xs font-medium text-[#464646] text-right leading-8"
              style={{ fontFamily: 'Source Han Sans CN' }}>
            {title || '我的自画像'}
          </h2>
        </div>

        {/* 描述文字 */}
        <div className="mb-16 max-w-80 mx-auto mt-6">
          <p className="text-[#464646] text-sm leading-6 text-left"
             style={{ 
               fontFamily: 'Source Han Sans CN',
               lineHeight: '1.71em'
             }}>
            {descriptionText ? (
              descriptionText
            ) : (
              '\u3000\u3000这是我的自画像，我正在边跳舞边听我喜欢的歌，穿着我最喜欢的绿色短袖，我画的是我最开心的一天。'
            )}
          </p>
        </div>

        {/* 录音播放按钮 */}
        {!!audioUrl && (
          <div className="flex flex-col items-center mb-8">
            <audio 
              ref={audioRef} 
              preload="auto"
              onCanPlay={() => setAudioError(null)}
              onError={() => setAudioError('音频加载失败，可能是链接无效或格式不被支持')}
            >
              {audioType ? (
                <source src={audioUrl} type={audioType} />
              ) : (
                <source src={audioUrl} />
              )}
            </audio>
            <button
              onClick={handlePlayAudio}
              className={`rounded-lg flex items-center justify-center transition-colors mb-1 ${
                isPlaying ? 'bg-[#2489FF]' : 'bg-[#2489FF]'
              }`}
              style={{ width: '56px', height: '56px' }}
              aria-label="volume"
            >
              <Volume2 className="w-5 h-5 text-white" />
            </button>
            {audioError && (
              <span className="text-xs text-red-500 mt-1" style={{ fontFamily: 'Source Han Sans CN' }}>
                {audioError}
              </span>
            )}
            <span className="text-xs text-[#8B8B8B] leading-8"
                  style={{ fontFamily: 'Source Han Sans CN' }}>
              点击听录音
            </span>
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="absolute bottom-24 left-0 right-0 flex justify-center">
        <span className="text-xs text-[#8B8B8B] leading-8"
              style={{ fontFamily: 'Source Han Sans CN' }}>
          上滑查看AI画面分析
        </span>
      </div>

      {/* 底部指示器 (Home Indicator) */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="w-32 h-1 bg-black rounded-full opacity-80"></div>
      </div>
    </div>
  );
};

export default ArtworkDetailPage;
