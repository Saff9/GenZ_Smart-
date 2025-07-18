export type Subject = 'Physics' | 'Chemistry' | 'Mathematics';

export interface VideoWithWatchStatus {
  id: number;
  title: string;
  subject: Subject;
  description: string | null;
  youtubeUrl: string;
  duration: number;
  instructor: string;
  uploadedAt: Date;
  pdfUrl: string | null;
  thumbnailUrl: string | null;
  viewCount: number;
  isWatched: boolean;
}

export interface UserStats {
  totalVideos: number;
  watchedVideos: number;
  pendingVideos: number;
  progressPercentage: number;
}

export interface SubjectStats {
  physics: number;
  chemistry: number;
  mathematics: number;
}
