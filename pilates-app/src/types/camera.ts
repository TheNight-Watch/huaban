export interface CameraConfig {
  facingMode: 'user' | 'environment';
  width?: { ideal: number };
  height?: { ideal: number };
  aspectRatio?: number;
}

export interface PhotoData {
  imageData: string;
  timestamp: number;
  width: number;
  height: number;
  fileSize?: number;
}

export interface CameraPermission {
  granted: boolean;
  error?: string;
}

export interface CameraPageProps {
  onNavigateToGallery?: () => void;
  onNavigateToProfile?: () => void;
  onPhotoTaken?: (imageData: string) => void;
  onError?: (error: string) => void;
}

export interface CameraState {
  hasPermission: boolean | null;
  stream: MediaStream | null;
  isCapturing: boolean;
  error: string;
  facingMode: 'user' | 'environment';
}
