import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image } from 'lucide-react';

interface CameraPageProps {
  onNavigateToGallery?: () => void; // deprecated: global TabBar handles
  onNavigateToProfile?: () => void; // deprecated: global TabBar handles
  onPhotoTaken?: (imageData: string) => void;
  isActive?: boolean;
}

const CameraPage: React.FC<CameraPageProps> = ({
  onNavigateToGallery,
  onNavigateToProfile,
  onPhotoTaken,
  isActive = true
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string>('');
  const [, setDebugInfo] = useState<string>('初始化中...');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 请求摄像头权限
  const requestCameraPermission = async () => {
    try {
      setDebugInfo('正在请求摄像头权限...');
      console.log('正在请求摄像头权限...');
      // 按照约定参数请求后置摄像头
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      setDebugInfo(`摄像头权限获取成功，视频轨道数: ${mediaStream.getVideoTracks().length}`);
      console.log('摄像头权限获取成功', mediaStream);
      setStream(mediaStream);
      setHasPermission(true);
      setError('');
      
      // 将视频流连接到video元素
      if (videoRef.current) {
        setDebugInfo('正在连接视频流...');
        console.log('设置视频流到video元素');
        videoRef.current.srcObject = mediaStream;
        
        // 确保视频开始播放
        videoRef.current.onloadedmetadata = () => {
          setDebugInfo(`视频已连接 - 尺寸: ${videoRef.current?.videoWidth}x${videoRef.current?.videoHeight}`);
          console.log('视频元数据加载完成');
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              setDebugInfo('摄像头预览正在运行');
            }).catch(e => {
              setDebugInfo(`视频播放失败: ${e.message}`);
              console.error('视频播放失败:', e);
            });
          }
        };
      }
    } catch (err: any) {
      setDebugInfo(`摄像头权限失败: ${err.message}`);
      console.error('摄像头权限被拒绝:', err);
      setHasPermission(false);
      setError('无法访问摄像头，请检查权限设置或使用HTTPS访问');
    }
  };

  // 拍照功能
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      // 获取图片数据
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      if (onPhotoTaken) {
        onPhotoTaken(imageData);
      }
      
      console.log('照片已拍摄');
    }
    
    setTimeout(() => setIsCapturing(false), 300);
  };

  // 从相册选择图片
  const selectFromGallery = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = event.target?.result as string;
          if (onPhotoTaken) {
            onPhotoTaken(imageData);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // 切换摄像头（前置/后置）
  const switchCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    try {
      setDebugInfo('正在切换摄像头...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: stream ? 'user' : 'environment' // 切换前后摄像头
        },
        audio: false
      });
      
      setStream(mediaStream);
      setDebugInfo('摄像头切换成功');
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(e => {
          setDebugInfo(`切换后播放失败: ${e.message}`);
        });
      }
    } catch (err: any) {
      setDebugInfo(`切换摄像头失败: ${err.message}`);
      console.error('切换摄像头失败:', err);
    }
  };

  // 根据 isActive 管理媒体流
  useEffect(() => {
    if (!isActive) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    } else {
      if (!stream) {
        requestCameraPermission();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // 清理资源
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // 初始请求摄像头权限
  useEffect(() => {
    requestCameraPermission();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F7F3] relative overflow-hidden flex flex-col">
      {/* 顶部系统状态栏已移除 */}

      {/* 顶部标题栏 */}
      <div className="relative z-20 bg-[rgba(249,247,243,0.8)] shadow-md mx-0 h-20 flex items-center justify-center"
           style={{ boxShadow: '0px 4px 10px 0px rgba(187, 187, 187, 0.25)' }}>
        <h1 className="text-black font-medium text-sm leading-6"
            style={{ fontFamily: 'Source Han Sans CN', fontSize: '15px' }}>
          上传画作
        </h1>
      </div>

      {/* 摄像头预览区域 */}
      <div className="relative flex-1 overflow-hidden">
        {hasPermission === null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-10">
            <Camera className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg mb-4">正在请求摄像头权限...</p>
          </div>
        )}

        {hasPermission === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-10">
            <Camera className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg mb-4">摄像头权限被拒绝</p>
            <p className="text-sm mb-6 text-center px-8">{error}</p>
              <button
                onClick={requestCameraPermission}
                className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg text-white font-medium"
              >
                重新请求权限
              </button>
          </div>
        )}

        {hasPermission && (
          <>
            {/* 备用背景图（如果摄像头不可用） */}
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${require('../assets/images/camera-background-73a096.png')})`,
                zIndex: 0
              }}
            />
            
            {/* 真实摄像头预览 */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover z-10"
              style={{ 
                transform: 'scaleX(-1)',
                backgroundColor: 'transparent'
              }}
              onCanPlay={() => {
                console.log('视频可以播放');
              }}
              onError={(e) => {
                console.error('视频播放错误:', e);
              }}
            />

            {/* 拍照按钮覆盖层 */}
            <div className="absolute bottom-32 left-0 right-0 flex justify-center items-center space-x-8 z-20">
              {/* 相册按钮 */}
              <button
                onClick={selectFromGallery}
                className="w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center shadow-lg"
              >
                <Image className="w-6 h-6 text-gray-700" />
              </button>

              {/* 拍照按钮 */}
              <button
                onClick={capturePhoto}
                disabled={!hasPermission}
                aria-label="capture"
                className={`w-20 h-20 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center shadow-lg transition-all ${
                  isCapturing ? 'scale-95' : 'scale-100'
                } ${!hasPermission ? 'opacity-50' : 'hover:border-blue-400'}`}
              >
                <div className={`w-16 h-16 bg-white rounded-full border-2 border-gray-200 ${
                  isCapturing ? 'bg-gray-200' : ''
                }`} />
              </button>

              {/* 切换摄像头按钮 */}
              <button
                onClick={switchCamera}
                className="w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center shadow-lg"
              >
                <Camera className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* 底部指示器 */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="w-32 h-1 bg-black rounded-full opacity-80"></div>
      </div>

      {/* 隐藏的canvas用于拍照 */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraPage;
