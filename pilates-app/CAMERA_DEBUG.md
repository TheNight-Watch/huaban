# 摄像头调试指南

## 🔍 当前问题
用户反馈"有权限管理但没有摄像头的画面"

## 🛠 已实施的调试措施

### 1. 添加详细调试信息
- ✅ 在页面上显示实时状态信息
- ✅ 控制台输出详细日志
- ✅ 错误捕获和显示

### 2. 简化摄像头配置
- ✅ 从复杂配置改为 `video: true`
- ✅ 移除可能导致兼容性问题的参数
- ✅ 保持最基本的功能

### 3. 改进视频元素处理
- ✅ 添加 `onloadedmetadata` 事件处理
- ✅ 显式调用 `video.play()`
- ✅ 添加错误处理回调

### 4. 创建测试组件
- ✅ 简单的摄像头测试组件
- ✅ 并排对比测试

## 🔧 调试步骤

### 检查浏览器支持
```javascript
// 检查API是否可用
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  console.log('浏览器不支持摄像头API');
}
```

### 检查权限状态
```javascript
navigator.permissions.query({ name: 'camera' }).then(result => {
  console.log('摄像头权限状态:', result.state);
});
```

### 检查HTTPS
- 摄像头API需要HTTPS或localhost环境
- HTTP环境下会被浏览器阻止

## 📱 常见问题及解决方案

### 问题1: 权限获取成功但无画面
**可能原因:**
- 视频元素没有正确绑定流
- 视频没有开始播放
- CSS样式问题

**解决方案:**
```javascript
video.onloadedmetadata = () => {
  video.play().catch(console.error);
};
```

### 问题2: 在移动设备上不工作
**可能原因:**
- 需要 `playsInline` 属性
- iOS Safari的限制

**解决方案:**
```html
<video autoPlay playsInline muted />
```

### 问题3: 黑屏或静态图像
**可能原因:**
- 摄像头被其他应用占用
- 权限设置问题
- 硬件问题

## 🧪 测试方法

### 1. 在浏览器控制台运行
```javascript
// 测试摄像头访问
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log('摄像头访问成功', stream);
    // 停止流
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(console.error);
```

### 2. 检查设备列表
```javascript
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const cameras = devices.filter(d => d.kind === 'videoinput');
    console.log('可用摄像头:', cameras);
  });
```

### 3. 查看页面调试信息
- 页面顶部会显示实时状态
- 浏览器控制台查看详细日志
- 网络选项卡检查资源加载

## 🚀 下一步调试

如果问题仍存在，请检查：

1. **浏览器兼容性**
   - Chrome 53+
   - Firefox 36+
   - Safari 11+

2. **网络环境**
   - 必须是HTTPS或localhost
   - 检查代理设置

3. **设备权限**
   - 系统摄像头权限
   - 浏览器权限设置

4. **硬件状态**
   - 摄像头是否被其他应用占用
   - 设备管理器中的状态

## 📞 技术支持

如需进一步协助，请提供：
- 浏览器版本和类型
- 操作系统版本
- 控制台错误信息
- 页面显示的调试信息
