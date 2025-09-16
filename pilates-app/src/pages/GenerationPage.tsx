import React, { useEffect, useState } from 'react';
import generationPreview1 from '../assets/images/generation-preview-1-15692c.png';
import generationPreview2 from '../assets/images/generation-preview-2-58407a.png';

interface GenerationPageProps {
  jobId?: string | null;
  onCaptured?: (out: { key: string; url: string }) => void;
  onComplete?: () => void; // backward compatibility for callers not using capture flow
}

const GenerationPage: React.FC<GenerationPageProps> = ({ jobId, onCaptured, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('pending');
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  // Fixed schedule: 10 attempts, every 15s. Optionally wait 15s before the first attempt (auto mode).
  async function captureWithSchedule(jid: string, opts?: { initialDelayFirstAttempt?: boolean }) {
    const { captureJob } = await import('../services/api');
    const attempts = 10;
    const interval = 15000; // 15s
    let lastErr: any = null;
    for (let i = 0; i < attempts; i++) {
      if (i === 0 && opts?.initialDelayFirstAttempt) {
        await new Promise(r => setTimeout(r, interval));
      } else if (i > 0) {
        await new Promise(r => setTimeout(r, interval));
      }
      try {
        const out = await captureJob(jid);
        return out;
      } catch (e: any) {
        lastErr = e;
      }
    }
    throw lastErr || new Error('capture retries exhausted');
  }

  // Poll real job status if jobId is present; otherwise keep simulated progress
  useEffect(() => {
    if (!jobId) {
      const id = window.setInterval(() => {
        setProgress(p => Math.min(100, p + Math.ceil(Math.random() * 8)));
      }, 700);
      return () => window.clearInterval(id);
    }
    let stop = false;
    async function poll() {
      try {
        const { getJob } = await import('../services/api');
        const jid = jobId as string; // non-null in this branch
        while (!stop) {
          const j = await getJob(jid);
          const s = (j.status || '').toLowerCase();
          setStatus(s || 'unknown');
          const pg = typeof j.progress === 'number' ? j.progress : undefined;
          if (typeof pg === 'number') setProgress(Math.max(10, Math.min(98, Math.round(pg))));
          if (s.includes('succeed') || s.includes('complete') || s === 'success' || s === 'finished' || s === 'done') {
            setProgress(100);
            // Capture
            try {
              setIsCapturing(true);
              setCaptureError(null);
              const out = await captureWithSchedule(jid, { initialDelayFirstAttempt: false });
              onCaptured && onCaptured(out);
              if (!onCaptured && onComplete) onComplete();
            } catch (e: any) {
              setError('捕获成片失败');
              setCaptureError(e?.message || '捕获失败');
            }
            setIsCapturing(false);
            return;
          }
          if (s.includes('fail') || s.includes('error') || s.includes('cancel')) {
            setError('生成失败');
            return;
          }
          await new Promise(r => setTimeout(r, 2000));
        }
      } catch (e: any) {
        setError('获取任务状态失败');
      }
    }
    poll();
    return () => { stop = true; };
  }, [jobId, onCaptured]);

  // For simulated branch (no jobId), fire onComplete when reaching 100%
  useEffect(() => {
    if (!jobId && progress >= 100 && onComplete) {
      const t = setTimeout(() => onComplete(), 600);
      return () => clearTimeout(t);
    }
  }, [progress, jobId, onComplete]);
  return (
    <div className="w-full h-screen bg-gradient-to-b from-[#F9F7F3] via-[#FCF2E2] to-[#FFEDD3] relative overflow-hidden">
      {/* Header */}
      <div className="relative w-full h-20 bg-[rgba(249,247,243,0.8)] shadow-[0px_4px_10px_0px_rgba(187,187,187,0.25)]">
        <div className="absolute inset-0 flex items-end justify-center pb-4">
          <h1 className="text-[15px] font-medium text-black leading-[1.6] text-center">
            生成画面
          </h1>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="absolute top-24 left-[29px] w-80 h-[54px]">
        {/* Progress Track */}
        <div className="absolute top-2 left-4 w-[286px] h-[7px] bg-[#D9D9D9] rounded-[11px]"></div>
        <div className="absolute top-2 left-4 h-[7px] bg-[#FF99C1] rounded-[11px]" style={{ width: `${Math.max(10, Math.min(100, progress)) * 2.77}px` }}></div>
        
        {/* Steps */}
        <div className="flex justify-between w-full">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center mb-3">
              <div className="w-5 h-5 bg-[#FF99C1] rounded-full flex items-center justify-center mt-0.5">
                <span className="text-[10px] text-black font-normal leading-[2.4]">1</span>
              </div>
            </div>
            <span className="text-[8px] text-black font-normal leading-[1.5] text-center">
              扫描画面
            </span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center mb-3">
              <div className="w-5 h-5 bg-[#FF99C1] rounded-full flex items-center justify-center mt-0.5">
                <span className="text-[10px] text-black font-normal leading-[2.4]">2</span>
              </div>
            </div>
            <span className="text-[8px] text-black font-normal leading-[3] text-center">
              描述画面内容
            </span>
          </div>

          {/* Step 3 - Active */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center mb-3">
              <div className="w-5 h-5 bg-[#D9D9D9] rounded-full flex items-center justify-center mt-0.5">
                <span className="text-[10px] text-black font-normal leading-[2.4]">3</span>
              </div>
            </div>
            <span className="text-[8px] text-black font-normal leading-[3] text-center">
              生成动态画面
            </span>
          </div>
        </div>
      </div>

      {/* Click to Play Text */}
      <div className="absolute top-[248px] left-[110px] w-[154px] h-6">
        <span className="text-[14px] text-[#ABABAB] font-normal leading-[1.714] text-center">
          点击屏幕任意位置开始玩
        </span>
      </div>

      {/* Preview Images */}
      <div className="absolute top-[313px] left-[45px]">
        <img 
          src={generationPreview1} 
          alt="Generation Preview 1" 
          className="w-[39px] h-[83px] object-cover"
        />
      </div>
      
      <div className="absolute top-[396px] left-[45px]">
        <img 
          src={generationPreview2} 
          alt="Generation Preview 2" 
          className="w-[286px] h-[17px] object-cover"
        />
      </div>

      {/* Progress Circle and Text */}
      <div className="absolute top-[536px] left-[153px] w-[72px] h-[72px]">
        {/* Progress Circle (enlarged) */}
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          className="absolute inset-0 transform -rotate-90"
        >
          <circle
            cx="36"
            cy="36"
            r="30"
            stroke="#2489FF"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 30 * (Math.max(0, Math.min(100, progress)) / 100)} ${2 * Math.PI * 30}`}
            strokeLinecap="round"
          />
        </svg>

        {/* Progress Text (centered) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[14px] text-[#464646] font-bold leading-none">
            {Math.max(0, Math.min(100, progress))}%
          </span>
        </div>
      </div>

      {/* Status Text */}
      <div className="absolute top-[620px] left-[119px] w-[139px] h-6">
        <span className="text-[14px] text-[#464646] font-normal leading-[1.714] text-center">
          {error ? error : (progress >= 100 ? '生成完成，准备入库...' : `动态图片生成中...${Math.max(0, Math.min(100, progress))}%`)}
        </span>
      </div>

  {/* Warning Text */}
  <div className="absolute top-[644px] left-[118px] w-[140px] h-6">
    <span className="text-[14px] text-[#464646] font-bold leading-[1.714] text-center">
      生成期间请勿退出APP
    </span>
  </div>

  {/* Manual Capture Button */}
  {jobId && (
    <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2">
      <button
        onClick={async () => {
          if (!jobId) return;
          try {
            setIsCapturing(true);
            setCaptureError(null);
            const out = await captureWithSchedule(jobId, { initialDelayFirstAttempt: false });
            onCaptured && onCaptured(out);
            if (!onCaptured && onComplete) onComplete();
          } catch (e: any) {
            setCaptureError(e?.message || '捕获失败');
          } finally {
            setIsCapturing(false);
          }
        }}
        disabled={isCapturing}
        className={`px-4 py-2 rounded-md border border-black ${isCapturing ? 'bg-gray-300 opacity-70' : 'bg-[#D9D9D9]'}`}
      >
        CAPTURE
      </button>
      {captureError && (
        <span className="text-xs text-red-500">{captureError}</span>
      )}
    </div>
  )}

      {/* 底部 TabBar 由全局 AppShell 提供，页面内不再重复渲染 */}
    </div>
  );
};

export default GenerationPage;
