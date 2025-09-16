import React, { useEffect, useMemo, useState } from 'react';
import SplashScreen from './pages/SplashScreen';
import GalleryPage from './pages/GalleryPage';
import CameraPage from './pages/CameraPage';
import DescriptionPage from './pages/DescriptionPage';
import GenerationPage from './pages/GenerationPage';
import ArtworkDetailPage from './pages/ArtworkDetailPage';
// import ProfilePage from './pages/ProfilePage';
import GrowPage from './pages/GrowPage';
import AnalysisPage from './pages/AnalysisPage';
import GenerationTestPage from './pages/GenerationTestPage';
import AppShell from './components/layout/AppShell';
import { BarProvider, useBar } from './context/bar-context';
import type { TabKey } from './context/bar-context';
import * as api from './services/api';
import videoPlaceholder from './assets/images/generation-preview-1-15692c.png';

type Route =
  | 'splash'
  | 'gallery'
  | 'upload'
  | 'grow'
  | 'description'
  | 'generation'
  | 'detail'
  | 'analysis'
  | 'gentest';

interface ArtworkItem {
  id: string;           // Local identifier (for gallery-loaded items we set it to bucket key)
  title: string;
  coverUrl: string;
  createdAt: string;
  videoUrl?: string;    // Presigned URL for playback (gallery items)
  videoKey?: string;    // Bucket object key (only set for gallery items)
}

function MainAppRoutes() {
  const [route, setRoute] = useState<Route>('splash');
  const bar = useBar();
  const [artworks, setArtworks] = useState<ArtworkItem[]>([ 
    { id: 'a1', title: '2024/10/3 我的自画像', coverUrl: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&h=600&fit=crop&crop=face', createdAt: '2024/10/03' },
    { id: 'a2', title: '2024/9/27 点线面的构成', coverUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop', createdAt: '2024/09/27' },
    { id: 'a3', title: '2024/9/25 我未来的家', coverUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop', createdAt: '2024/09/25' },
    { id: 'a4', title: '2024/9/24 小狮子', coverUrl: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=800&h=600&fit=crop', createdAt: '2024/09/24' },
    { id: 'a5', title: '2024/9/20 彩虹桥', coverUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop', createdAt: '2024/09/20' },
    { id: 'a6', title: '2024/9/18 花园里的蝴蝶', coverUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&h=600&fit=crop', createdAt: '2024/09/18' },
  ]);
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState<number | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [fetched, setFetched] = useState<boolean>(false);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [artworkId, setArtworkId] = useState<string | null>(null);

  // Splash: 3s 后进入画廊
  useEffect(() => {
    if (route !== 'splash') return;
    const t = setTimeout(() => {
      setRoute('gallery');
      bar.setActive('gallery');
      bar.show();
    }, 3000);
    return () => clearTimeout(t);
  }, [route, bar]);

  // Dev helper: enable test page via localStorage or global function
  useEffect(() => {
    if (localStorage.getItem('gentest') === '1') {
      setRoute('gentest');
    }
    (window as any).gentest = () => setRoute('gentest');
  }, []);

  // 尝试从后端加载画廊（如果配置了 REACT_APP_API_BASE）
  useEffect(() => {
    const base = (process.env.REACT_APP_API_BASE || '').trim();
    if (!base || fetched || route !== 'gallery') return;
    (async () => {
      try {
        const res = await api.getGallery(30);
        if (Array.isArray(res.items) && res.items.length > 0) {
          const items: ArtworkItem[] = res.items.map((it) => ({
            id: it.key, // keep id equal to key for remote items
            title: it.key,
            // 使用占位图作为封面，视频在详情页播放
            coverUrl: videoPlaceholder,
            createdAt: new Date(it.lastModified || Date.now()).toISOString().slice(0, 10),
            videoUrl: it.url,
            videoKey: it.key
          }));
          setArtworks(items);
        }
      } catch (e) {
        // 静默降级到内置 mock 数据
        console.warn('Load gallery from API failed:', e);
      } finally {
        setFetched(true);
      }
    })();
  }, [route, fetched]);

  // 底部 Tab 切换
  const gotoTab = (tab: TabKey) => {
    bar.setActive(tab);
    setRoute(tab === 'gallery' ? 'gallery' : tab === 'upload' ? 'upload' : 'grow');
  };

  // 画廊项数据（CircularGallery 输入格式）
  const galleryItems = useMemo(() => artworks.map(a => ({ image: a.coverUrl, text: a.title })), [artworks]);

  // 上传流程：拍照/选择 → 描述 → 生成 → 详情
  const handlePhotoTaken = (imageData: string) => {
    setPendingImage(imageData);
    setRoute('description');
    bar.setActive('upload');
  };

  const handleDescriptionNext = () => {
    const base = (process.env.REACT_APP_API_BASE || '').trim();
    if (!base || !artworkId) {
      // 无后端或未建作品，直接进入生成页（占位流程）
      setRoute('generation');
      return;
    }
    (async () => {
      try {
        // 阶段3：优先走语音转写（如未就绪则静默降级文本直填）
        const fallbackText = '孩子描述：请将我画里的主角、动作、场景、情绪生成一个简洁的动画提示。';
        try {
          const tr = await api.transcribe(artworkId);
          if (!tr?.ok) {
            console.log('STT pending; fallback to text');
            await api.transcribeText(artworkId, fallbackText);
          }
        } catch (e) {
          // 网络或后端异常，也直接降级文本
          console.log('STT unavailable; fallback to text');
          await api.transcribeText(artworkId, fallbackText);
        }
        await api.runLLM(artworkId);
      } catch (e) {
        console.warn('Stage3 text/llm skipped:', e);
      } finally {
        setRoute('generation');
      }
    })();
  };

  const handleCaptureComplete = (out: { key: string; url: string }) => {
    // 将新视频加入画廊并跳到详情
    const item: ArtworkItem = {
      id: out.key,
      title: out.key,
      coverUrl: videoPlaceholder,
      createdAt: new Date().toISOString().slice(0, 10),
      videoUrl: out.url,
      videoKey: out.key
    };
    setArtworks(prev => [item, ...prev]);
    setSelectedArtworkIndex(0);
    setRoute('detail');
    // 清理阶段性状态
    setPendingImage(null);
    setArtworkId(null);
    setUploadedKey(null);
    setJobId(null);
  };

  // 画廊选择项 → 进入详情
  const handleSelectGalleryIndex = (index: number) => {
    setSelectedArtworkIndex(((index % artworks.length) + artworks.length) % artworks.length);
    setRoute('detail');
  };

  const handleFilterClick = () => {
    alert('时间筛选将于后续版本开放');
  };

  // 详情与分析页导航
  const handleBackFromDetail = () => {
    // 返回画廊
    setRoute('gallery');
  };

  const handleEnterAnalysis = () => {
    setRoute('analysis');
  };

  const handleBackFromAnalysis = () => {
    setRoute('detail');
  };

  // bar visibility + active mapping by route
  useEffect(() => {
    const visibleRoutes: Route[] = ['gallery', 'upload', 'grow', 'description', 'generation'];
    if (visibleRoutes.includes(route)) {
      bar.show();
    } else {
      bar.hide();
    }

    if (route === 'gallery') bar.setActive('gallery');
    if (route === 'grow') bar.setActive('grow');
    if (route === 'upload' || route === 'description' || route === 'generation') bar.setActive('upload');
  }, [route, bar]);

  // 当进入 generation 页面：若已经建作品则按作品ID发起生成；否则保留旧的占位逻辑
  useEffect(() => {
    const base = (process.env.REACT_APP_API_BASE || '').trim();
    if (route !== 'generation' || !base) return;
    (async () => {
      try {
        if (artworkId) {
          const gen = await api.generateForArtwork(artworkId);
          if (gen?.jobId) setJobId(gen.jobId);
          console.log('Ark job for artwork:', gen);
        } else if (pendingImage) {
          // 兼容：无作品ID则走旧路径
          const up = await api.presignUpload('image/jpeg');
          const blob = await (await fetch(pendingImage)).blob();
          await fetch(up.put.url, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: blob });
          setUploadedKey(up.key);
          const job = await api.createJobFromKey(up.key, '请生成5秒1080p动画');
          if (job?.jobId) setJobId(job.jobId);
          console.log('Doubao job submitted:', job);
        }
      } catch (e) {
        console.warn('Upload/generate skipped:', e);
      }
    })();
  }, [route, pendingImage, artworkId, uploadedKey]);

  // 进入描述页时：若有图片且后端可用且未建作品 → 先上传图片并创建作品，保存 artworkId
  useEffect(() => {
    const base = (process.env.REACT_APP_API_BASE || '').trim();
    if (route !== 'description' || !pendingImage || !base || artworkId) return;
    (async () => {
      try {
        const up = await api.presignUpload('image/jpeg');
        const blob = await (await fetch(pendingImage)).blob();
        await fetch(up.put.url, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: blob });
        setUploadedKey(up.key);
        const created = await api.createArtworkFromImageKey(up.key);
        setArtworkId(created.artworkId);
        console.log('Artwork created:', created.artworkId);
      } catch (e) {
        console.warn('Create artwork skipped:', e);
      }
    })();
  }, [route, pendingImage, artworkId]);

  return (
    <AppShell onTabChange={gotoTab}>
      {route === 'splash' && <SplashScreen />}

      {route === 'gallery' && (
        <GalleryPage 
          items={galleryItems}
          onSelectIndex={handleSelectGalleryIndex}
          onFilterClick={handleFilterClick}
        />
      )}

      {route === 'upload' && (
        <CameraPage 
          onPhotoTaken={handlePhotoTaken}
        />
      )}

      {route === 'grow' && (
        <GrowPage />
      )}

      {route === 'description' && (
        <DescriptionPage 
          onNext={handleDescriptionNext}
          artworkImage={pendingImage ?? undefined}
          artworkId={artworkId ?? undefined}
        />
      )}

      {route === 'generation' && (
        <GenerationPage 
          jobId={jobId}
          onCaptured={handleCaptureComplete}
        />
      )}

      {route === 'detail' && (
        <ArtworkDetailPage 
          onBack={handleBackFromDetail}
          onEdit={() => console.log('编辑画作')}
          onEnterAnalysis={handleEnterAnalysis}
          title={selectedArtworkIndex != null ? artworks[selectedArtworkIndex]?.title : undefined}
          videoUrl={selectedArtworkIndex != null ? artworks[selectedArtworkIndex]?.videoUrl : undefined}
          videoKey={selectedArtworkIndex != null ? artworks[selectedArtworkIndex]?.videoKey : undefined}
        />
      )}

      {route === 'analysis' && (
        <AnalysisPage onBack={handleBackFromAnalysis} />
      )}

      {route === 'gentest' && (
        <GenerationTestPage />
      )}
    </AppShell>
  );
}

function App() {
  return (
    <BarProvider>
      <MainAppRoutes />
    </BarProvider>
  );
}

export default App;
