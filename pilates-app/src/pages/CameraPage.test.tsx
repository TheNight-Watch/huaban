import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CameraPage from './CameraPage';

// Mock navigator.mediaDevices
const mockGetUserMedia = jest.fn();
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
});

// Mock HTMLVideoElement
Object.defineProperty(HTMLVideoElement.prototype, 'srcObject', {
  set: jest.fn(),
  get: jest.fn(),
});

describe('CameraPage', () => {
  beforeEach(() => {
    mockGetUserMedia.mockClear();
  });

  test('renders camera page with all UI elements', () => {
    render(<CameraPage />);
    
    // 检查标题
    expect(screen.getByText('上传画作')).toBeInTheDocument();
    
    // 检查底部导航
    expect(screen.getByText('画廊')).toBeInTheDocument();
    expect(screen.getByText('上传')).toBeInTheDocument();
    expect(screen.getByText('个人')).toBeInTheDocument();
    
    // 检查时间显示
    expect(screen.getByText('9:41')).toBeInTheDocument();
  });

  test('requests camera permission on mount', async () => {
    const mockStream = { getTracks: jest.fn(() => []) };
    mockGetUserMedia.mockResolvedValue(mockStream);
    
    render(<CameraPage />);
    
    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
    });
  });

  test('handles camera permission denial', async () => {
    mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));
    
    render(<CameraPage />);
    
    await waitFor(() => {
      expect(screen.getByText('摄像头权限被拒绝')).toBeInTheDocument();
      expect(screen.getByText('重新请求权限')).toBeInTheDocument();
    });
  });

  test('calls navigation callbacks', () => {
    const mockNavigateToGallery = jest.fn();
    const mockNavigateToProfile = jest.fn();
    
    render(
      <CameraPage 
        onNavigateToGallery={mockNavigateToGallery}
        onNavigateToProfile={mockNavigateToProfile}
      />
    );
    
    // 点击画廊按钮
    const galleryButton = screen.getByText('画廊').closest('button');
    if (galleryButton) {
      fireEvent.click(galleryButton);
      expect(mockNavigateToGallery).toHaveBeenCalledTimes(1);
    }
    
    // 点击个人按钮
    const profileButton = screen.getByText('个人').closest('button');
    if (profileButton) {
      fireEvent.click(profileButton);
      expect(mockNavigateToProfile).toHaveBeenCalledTimes(1);
    }
  });

  test('handles photo capture', async () => {
    const mockOnPhotoTaken = jest.fn();
    const mockStream = { 
      getTracks: jest.fn(() => []),
      active: true
    };
    mockGetUserMedia.mockResolvedValue(mockStream);
    
    // Mock canvas and video elements
    const mockCanvas = {
      getContext: jest.fn(() => ({
        drawImage: jest.fn(),
      })),
      toDataURL: jest.fn(() => 'data:image/jpeg;base64,mock-image-data'),
      width: 0,
      height: 0,
    };
    
    const mockVideo = {
      videoWidth: 1280,
      videoHeight: 720,
    };
    
    jest.spyOn(React, 'useRef')
      .mockReturnValueOnce({ current: mockVideo as any })
      .mockReturnValueOnce({ current: mockCanvas as any });
    
    render(<CameraPage onPhotoTaken={mockOnPhotoTaken} />);
    
    // 等待权限获取
    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled();
    });
    
    // 模拟点击拍照按钮
    const captureButton = screen.getByRole('button', { name: /capture/i });
    if (captureButton) {
      fireEvent.click(captureButton);
      
      await waitFor(() => {
        expect(mockOnPhotoTaken).toHaveBeenCalledWith('data:image/jpeg;base64,mock-image-data');
      });
    }
  });
});
