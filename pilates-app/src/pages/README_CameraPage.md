# 相机拍摄页面实现说明

## 页面概述
根据 Figma 设计 (node-id=178-905) 实现的相机拍摄页面，用于拍摄孩子的画作并上传。

## 主要功能

### 📷 摄像头功能
1. **权限管理**: 自动请求摄像头权限
2. **实时预览**: 显示摄像头实时画面
3. **前后摄像头切换**: 支持前置和后置摄像头
4. **拍照功能**: 高质量图片拍摄
5. **相册选择**: 从手机相册选择已有图片

### 🎯 用户体验
- **权限引导**: 友好的权限请求界面
- **错误处理**: 权限被拒绝时的重试机制
- **视觉反馈**: 拍照时的按钮动画效果
- **镜像显示**: 前置摄像头镜像效果

### 🖼️ 界面设计
- ✅ 完全还原 Figma 设计
- ✅ iOS 风格状态栏
- ✅ 半透明导航栏
- ✅ 底部 Tab 导航
- ✅ 圆形拍照按钮

## 技术实现

### 摄像头 API
```typescript
// 获取摄像头权限
await navigator.mediaDevices.getUserMedia({
  video: { 
    facingMode: 'environment', // 后置摄像头
    width: { ideal: 1280 },
    height: { ideal: 720 }
  },
  audio: false
});
```

### 图片拍摄
```typescript
// 使用 Canvas 从视频流中截取图片
const canvas = canvasRef.current;
const video = videoRef.current;
const context = canvas.getContext('2d');
context.drawImage(video, 0, 0);
const imageData = canvas.toDataURL('image/jpeg', 0.8);
```

### 相册选择
```typescript
// 使用 HTML5 文件选择 API
const input = document.createElement('input');
input.type = 'file';
input.accept = 'image/*';
input.onchange = (e) => {
  const file = e.target.files[0];
  // 处理选择的文件
};
```

## 组件接口

```typescript
interface CameraPageProps {
  onNavigateToGallery?: () => void;
  onNavigateToProfile?: () => void;
  onPhotoTaken?: (imageData: string) => void;
}
```

## 权限处理

### 浏览器权限
- 自动请求摄像头权限
- 处理权限被拒绝的情况
- 提供重新请求权限的选项

### 移动端适配
- 支持前后摄像头切换
- 优化移动端触摸体验
- 适配不同屏幕尺寸

## 错误处理

### 常见错误场景
1. **权限被拒绝**: 显示友好提示，引导用户手动开启
2. **摄像头被占用**: 提示摄像头正在被其他应用使用
3. **设备不支持**: 降级到文件选择功能
4. **网络问题**: 离线模式支持

### 降级方案
- 摄像头不可用时显示备用背景图
- 提供相册选择作为备选方案
- 保持界面交互的一致性

## 性能优化

### 资源管理
- 页面卸载时自动停止摄像头流
- 切换摄像头时正确释放资源
- 图片压缩优化文件大小

### 用户体验
- 拍照按钮防重复点击
- 加载状态提示
- 流畅的动画效果

## 安全考虑

### 隐私保护
- 仅在用户明确同意时访问摄像头
- 不保存用户的视频流
- 仅处理用户主动拍摄的照片

### 数据处理
- 图片数据仅在内存中处理
- 支持本地预览和编辑
- 安全的文件上传机制

## 浏览器兼容性

### 现代浏览器支持
- ✅ Chrome 53+
- ✅ Firefox 36+
- ✅ Safari 11+
- ✅ Edge 12+

### 移动浏览器
- ✅ iOS Safari 11+
- ✅ Android Chrome 53+
- ✅ Samsung Internet 6.2+

## 使用示例

```typescript
import CameraPage from './pages/CameraPage';

function App() {
  const handlePhotoTaken = (imageData: string) => {
    // 处理拍摄的照片
    console.log('照片已拍摄:', imageData);
  };

  return (
    <CameraPage 
      onPhotoTaken={handlePhotoTaken}
      onNavigateToGallery={() => navigate('/gallery')}
      onNavigateToProfile={() => navigate('/profile')}
    />
  );
}
```

## 下一步计划

1. **图片编辑**: 添加裁剪、旋转、滤镜功能
2. **云端上传**: 集成文件上传到后端服务
3. **AI 识别**: 集成画作识别和分析功能
4. **批量拍摄**: 支持连续拍摄多张照片
5. **录像功能**: 扩展支持视频录制

## 测试覆盖

- ✅ 组件渲染测试
- ✅ 权限请求测试
- ✅ 拍照功能测试
- ✅ 导航功能测试
- ✅ 错误处理测试
