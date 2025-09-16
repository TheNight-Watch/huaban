export interface Artwork {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl: string;
  audioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArtworkDetailProps {
  artwork: Artwork;
  onBack?: () => void;
  onEdit?: () => void;
  onPlayAudio?: (audioUrl: string) => void;
}
