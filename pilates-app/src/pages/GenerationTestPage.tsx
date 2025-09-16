import React, { useCallback, useEffect, useRef, useState } from 'react';
import testImage from '../assets/images/artwork-image-7d6e1b.png';
import * as api from '../services/api';

type Log = { ts: string; msg: string };

const now = () => new Date().toISOString().slice(11, 23);

const GenerationTestPage: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>('idle');
  const [captureResp, setCaptureResp] = useState<any>(null);
  const [video, setVideo] = useState<{ key: string; url: string } | null>(null);
  const pollStop = useRef<boolean>(false);

  const log = useCallback((msg: string) => {
    setLogs((l) => [...l, { ts: now(), msg }]);
    // eslint-disable-next-line no-console
    console.log(msg);
  }, []);

  const reset = () => {
    setRunning(false);
    setLogs([]);
    setJobId(null);
    setUploadedKey(null);
    setProgress(0);
    setStatus('idle');
    setCaptureResp(null);
    setVideo(null);
  };

  const start = async () => {
    reset();
    setRunning(true);
    try {
      // 1) presign upload (png)
      log('presign upload...');
      const up = await api.presignUpload('image/png');
      setUploadedKey(up.key);
      log(`PUT ${up.put.url.slice(0, 60)}...`);
      // 2) fetch local asset as blob and upload
      const blob = await (await fetch(testImage)).blob();
      await fetch(up.put.url, { method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: blob });
      log(`uploaded key=${up.key}`);
      // 3) create Ark job from key (backend will add 720p etc.)
      log('create job...');
      const job = await api.createJobFromKey(up.key, '测试720p, 请生成5秒动画');
      setJobId(job.jobId);
      log(`jobId=${job.jobId}`);
      // 4) poll status
      pollStop.current = false;
      while (!pollStop.current) {
        const j = await api.getJob(job.jobId);
        const s = (j.status || '').toString();
        setStatus(s);
        if (typeof j.progress === 'number') setProgress(Math.max(0, Math.min(100, Math.round(j.progress))));
        log(`status=${s} progress=${j.progress ?? '-'} `);
        if (/succeed|complete|success|finished|done/i.test(s)) break;
        if (/fail|error|cancel/i.test(s)) throw new Error(`job failed: ${s}`);
        await new Promise((r) => setTimeout(r, 2000));
      }
      setProgress(100);
      // 5) fixed schedule capture attempts (every 15s, 10 tries)
      log('start capture schedule: every 15s, up to 10 times');
      let out: { key: string; url: string } | null = null;
      for (let i = 0; i < 10; i++) {
        if (i > 0) await new Promise((r) => setTimeout(r, 15000));
        try {
          const resp = await api.captureJob(job.jobId);
          setCaptureResp(resp);
          out = resp;
          break;
        } catch (e: any) {
          log(`capture try ${i + 1} failed: ${e?.message || e}`);
        }
      }
      if (!out) throw new Error('capture exhausted');
      setVideo(out);
      log(`captured: key=${out.key}`);
    } catch (e: any) {
      log(`ERROR: ${e?.message || String(e)}`);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => () => { pollStop.current = true; }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-bold">Generation Test</h1>
      <div className="flex gap-2">
        <button onClick={start} disabled={running} className={`px-3 py-2 border ${running ? 'opacity-60' : ''}`}>Run Test</button>
        <button onClick={reset} className="px-3 py-2 border">Reset</button>
      </div>
      <div className="text-sm">uploadedKey: {uploadedKey || '-'}</div>
      <div className="text-sm">jobId: {jobId || '-'}</div>
      <div className="text-sm">status: {status}, progress: {progress}%</div>
      <div>
        <h2 className="font-semibold">Logs</h2>
        <pre className="text-xs bg-gray-100 p-2 max-h-64 overflow-auto">{logs.map(l => `${l.ts} ${l.msg}`).join('\n')}</pre>
      </div>
      {captureResp && (
        <div>
          <h2 className="font-semibold">Capture Response</h2>
          <pre className="text-xs bg-gray-100 p-2 max-h-64 overflow-auto">{JSON.stringify(captureResp, null, 2)}</pre>
        </div>
      )}
      {video && (
        <div>
          <h2 className="font-semibold">Video</h2>
          <video src={video.url} controls className="w-full max-w-md bg-black" />
        </div>
      )}
    </div>
  );
};

export default GenerationTestPage;

