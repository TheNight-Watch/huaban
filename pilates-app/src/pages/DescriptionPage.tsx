import React, { useEffect, useRef, useState } from 'react';
import { Mic } from 'lucide-react';

interface DescriptionPageProps {
  onNavigateToGallery?: () => void;
  onNavigateToProfile?: () => void;
  onNext?: () => void;
  artworkImage?: string;
  artworkId?: string;
}

const DescriptionPage: React.FC<DescriptionPageProps> = ({
  onNavigateToGallery,
  onNavigateToProfile,
  onNext,
  artworkImage,
  artworkId
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);

  const hasBackend = Boolean((process.env.REACT_APP_API_BASE || '').trim());

  async function startRecording() {
    try {
      // Prefer webm; Safari may use mp4/m4a
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeCandidates = ['audio/webm', 'audio/mp4'];
      let mimeType: string | undefined = undefined;
      for (const mt of mimeCandidates) {
        if ((window as any).MediaRecorder && (MediaRecorder as any).isTypeSupported && (MediaRecorder as any).isTypeSupported(mt)) {
          mimeType = mt;
          break;
        }
      }
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const type = mimeType || (chunksRef.current[0] as any)?.type || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        setAudioBlob(blob);
        // release stream
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        recorderRef.current = null;
      };
      rec.start();
      recorderRef.current = rec;
      setSeconds(0);
      setIsRecording(true);
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (e) {
      console.warn('startRecording failed', e);
      alert('无法访问麦克风，请检查权限');
    }
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setIsRecording(false);
  }

  // 录音按钮
  const handleRecordingClick = () => {
    if (!isRecording) {
      console.log('开始录音');
      startRecording();
    } else {
      console.log('停止录音');
      stopRecording();
    }
  };

  // 处理下一步
  const handleNext = async () => {
    if (seconds < 5) {
      alert('请至少录音 5 秒再继续');
      return;
    }
    // 如果还在录音，先停止
    if (isRecording) stopRecording();

    // 可选：上传音频
    if (hasBackend && artworkId && audioBlob) {
      try {
        setUploading(true);
        const ct = (audioBlob.type || 'audio/webm').split(';')[0];
        const up = await import('../services/api').then(m => m.presignAudio(artworkId, ct));
        await fetch(up.put.url, { method: 'PUT', headers: { 'Content-Type': ct }, body: audioBlob });
        await import('../services/api').then(m => m.commitAudio(artworkId, up.key));
        console.log('音频已上传并提交', { key: up.key, ct });
      } catch (e) {
        console.warn('上传音频失败（忽略继续流程）', e);
      } finally {
        setUploading(false);
      }
    }

    console.log('点击下一步');
    onNext && onNext();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
        recorderRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen relative" style={{
      background: 'linear-gradient(180deg, rgba(249, 247, 243, 1) 0%, rgba(252, 242, 226, 1) 90%, rgba(255, 237, 211, 1) 100%)'
    }}>
      {/* 顶部标题栏 */}
      <div className="relative z-20 bg-[rgba(249,247,243,0.8)] shadow-md mx-0 h-20 flex items-center justify-center"
           style={{ boxShadow: '0px 4px 10px 0px rgba(187, 187, 187, 0.25)' }}>
        <h1 className="text-black font-medium text-sm leading-6"
            style={{ fontFamily: 'Source Han Sans CN', fontSize: '15px' }}>
          描述画面
        </h1>
      </div>

      {/* 步骤指示器 */}
      <div className="px-7 pt-6">
        <div className="relative bg-[#D9D9D9] h-2 rounded-lg">
          {/* 进度条背景 */}
          <div className="absolute top-0 left-4 w-72 h-2 bg-[#D9D9D9] rounded-lg"></div>
          {/* 进度条填充 */}
          <div className="absolute top-0 left-4 w-36 h-2 bg-[#FF99C1] rounded-lg"></div>
          
          {/* 步骤圆点和文字 */}
          <div className="absolute -top-2 left-1 flex justify-between w-80">
            {/* 步骤1 - 已完成 */}
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 bg-[#FF99C1] rounded-full flex items-center justify-center">
                <span className="text-black text-xs font-normal"
                      style={{ fontFamily: 'Source Han Sans CN', fontSize: '10px', lineHeight: '2.4em' }}>
                  1
                </span>
              </div>
              <span className="text-black text-xs mt-1"
                    style={{ fontFamily: 'Source Han Sans CN', fontSize: '8px', lineHeight: '1.5em' }}>
                扫描画面
              </span>
            </div>

            {/* 步骤2 - 当前步骤 */}
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 bg-[#D9D9D9] rounded-full flex items-center justify-center">
                <span className="text-black text-xs font-normal"
                      style={{ fontFamily: 'Source Han Sans CN', fontSize: '10px', lineHeight: '2.4em' }}>
                  2
                </span>
              </div>
              <span className="text-black text-xs mt-1 font-normal"
                    style={{ fontFamily: 'Source Han Sans CN', fontSize: '8px', lineHeight: '3em' }}>
                描述画面内容
              </span>
            </div>

            {/* 步骤3 - 未完成 */}
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 bg-[#D9D9D9] rounded-full flex items-center justify-center">
                <span className="text-black text-xs font-normal"
                      style={{ fontFamily: 'Source Han Sans CN', fontSize: '10px', lineHeight: '2.4em' }}>
                  3
                </span>
              </div>
              <span className="text-black text-xs mt-1"
                    style={{ fontFamily: 'Source Han Sans CN', fontSize: '8px', lineHeight: '3em' }}>
                生成动态画面
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 主标题 */}
      <div className="px-8 pt-12">
        <h2 className="text-black font-bold text-center"
            style={{ 
              fontFamily: 'Source Han Sans CN', 
              fontSize: '16px',
              lineHeight: '1.25em'
            }}>
          描述一下自己的故事吧！
        </h2>
      </div>

      {/* 画作图片 */}
      <div className="px-12 pt-8">
        <div className="w-full aspect-square bg-gray-200 rounded-lg overflow-hidden">
          <img 
            src={artworkImage || require('../assets/images/description-background-11e2ba.png')}
            alt="画作"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 录音按钮区域 */}
      <div className="flex flex-col items-center pt-12">
        {/* 录音按钮 */}
        <button
          onClick={handleRecordingClick}
          className={`relative w-17 h-17 rounded-full transition-all duration-300 ${
            isRecording ? 'animate-pulse' : ''
          }`}
          style={{ width: '68px', height: '68px' }}
          >
          {/* 外圈 */}
          <div className="absolute inset-0 bg-[#E2EAF2] rounded-full"></div>
          {/* 内圈 */}
          <div className="absolute inset-2 bg-[#BDD7EE] rounded-full flex items-center justify-center">
            <Mic className={`w-5.5 h-5.5 ${isRecording ? 'text-red-500' : 'text-[#2489FF]'}`} />
          </div>
        </button>

        {/* 提示文字 */}
        <p className="text-[#464646] text-sm text-center mt-4"
           style={{ 
             fontFamily: 'Source Han Sans CN',
             fontSize: '14px',
             lineHeight: '1.71em'
           }}>
          {isRecording ? `正在录音中... ${seconds}s` : uploading ? '正在保存录音...' : '点击开始语音识别（至少 5 秒）'}
        </p>
      </div>

      {/* 下一步按钮 */}
      <div className="absolute bottom-28 left-7 right-7">
        <button
          onClick={handleNext}
          disabled={seconds < 5}
          className={`w-full h-14 rounded-2xl border-2 border-black flex items-center justify-center ${seconds < 5 ? 'bg-gray-300 opacity-60' : 'bg-[#D9D9D9]'}`}
        >
          <span className="text-black font-bold text-base"
                style={{ fontFamily: 'Inter', fontSize: '16px', lineHeight: '1.25em' }}>
            下一步
          </span>
        </button>
      </div>

      {/* 全局底部栏由 AppShell 提供，此处移除页面内实现 */}
    </div>
  );
};

export default DescriptionPage;
