import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, FolderSync, Download, ArrowRight, Sparkles } from "lucide-react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { VideoCard } from "@/components/video-card";
import { AdminModal } from "@/components/admin-modal";
import { Chatbot } from "@/components/chatbot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoWithWatchStatus } from "@/lib/types";

interface Video {
  id: number;
  title: string;
  subject: string;
  description: string | null;
  youtubeUrl: string;
  duration: number;
  instructor: string;
  uploadedAt: string;
  pdfUrl: string | null;
  thumbnailUrl: string | null;
  viewCount: number;
}

interface WatchedVideo {
  videoId: number;
}

export default function Dashboard() {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);

  const { data: videos = [] } = useQuery<Video[]>({
    queryKey: selectedSubject === 'All' ? ['/api/videos'] : ['/api/videos', selectedSubject],
    queryFn: () => {
      const url = selectedSubject === 'All' ? '/api/videos' : `/api/videos?subject=${selectedSubject}`;
      return fetch(url).then(res => res.json());
    },
  });

  const { data: watchedVideos = [] } = useQuery<WatchedVideo[]>({
    queryKey: ['/api/users/1/watched'],
  });

  const watchedVideoIds = new Set(watchedVideos.map(wv => wv.videoId));

  const videosWithWatchStatus: VideoWithWatchStatus[] = videos.map(video => ({
    ...video,
    uploadedAt: new Date(video.uploadedAt),
    isWatched: watchedVideoIds.has(video.id),
  }));

  const filteredVideos = videosWithWatchStatus.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = selectedSubject === 'All' || video.subject === selectedSubject;
    
    return matchesSearch && matchesSubject;
  });

  const todaysVideos = filteredVideos.filter(video => {
    const today = new Date();
    const videoDate = new Date(video.uploadedAt);
    return videoDate.toDateString() === today.toDateString();
  });

  const recentVideos = filteredVideos.slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar 
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
          />
          
          <main className="flex-1 space-y-8">
            {/* Search and Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search videos by title, topic, or subject..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button onClick={() => setShowAdminModal(true)}>
                      <FolderSync className="h-4 w-4 mr-2" />
                      Add Video
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Progress
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Videos */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Today's Videos</CardTitle>
                  <span className="text-sm text-slate-500">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="divide-y divide-slate-200">
                  {todaysVideos.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <p>No videos uploaded today</p>
                    </div>
                  ) : (
                    todaysVideos.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Videos */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Recent Videos</CardTitle>
                  <Button variant="ghost" className="text-primary hover:text-primary/80">
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentVideos.map((video) => (
                    <VideoCard key={video.id} video={video} compact />
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      <AdminModal 
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />
    </div>
  );
}
