import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, Users } from "lucide-react";
import { Header } from "@/components/header";
import { AdminModal } from "@/components/admin-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Video {
  id: number;
  title: string;
  subject: string;
  description: string | null;
  youtubeUrl: string;
  duration: number;
  instructor: string;
  uploadedAt: string;
  viewCount: number;
}

export default function Admin() {
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: videos = [] } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/videos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Video deleted",
        description: "The video has been removed from the library.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting video",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteVideo = (id: number) => {
    if (confirm('Are you sure you want to delete this video?')) {
      deleteVideoMutation.mutate(id);
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Physics':
        return 'bg-physics/10 text-physics';
      case 'Chemistry':
        return 'bg-chemistry/10 text-chemistry';
      case 'Mathematics':
        return 'bg-math/10 text-math';
      default:
        return 'bg-slate/10 text-slate';
    }
  };

  const totalVideos = videos.length;
  const totalViews = videos.reduce((sum, video) => sum + video.viewCount, 0);
  const subjectCounts = {
    Physics: videos.filter(v => v.subject === 'Physics').length,
    Chemistry: videos.filter(v => v.subject === 'Chemistry').length,
    Mathematics: videos.filter(v => v.subject === 'Mathematics').length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600 mt-1">Manage video content and track engagement</p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Videos</p>
                    <p className="text-2xl font-bold text-slate-900">{totalVideos}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Views</p>
                    <p className="text-2xl font-bold text-slate-900">{totalViews.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-watched/10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-watched" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Physics Videos</p>
                    <p className="text-2xl font-bold text-slate-900">{subjectCounts.Physics}</p>
                  </div>
                  <div className="w-12 h-12 bg-physics/10 rounded-lg flex items-center justify-center">
                    <span className="text-physics font-bold">P</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Chemistry Videos</p>
                    <p className="text-2xl font-bold text-slate-900">{subjectCounts.Chemistry}</p>
                  </div>
                  <div className="w-12 h-12 bg-chemistry/10 rounded-lg flex items-center justify-center">
                    <span className="text-chemistry font-bold">C</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Videos Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell className="font-medium">
                        <div className="max-w-xs truncate">{video.title}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSubjectColor(video.subject)}>
                          {video.subject}
                        </Badge>
                      </TableCell>
                      <TableCell>{video.instructor}</TableCell>
                      <TableCell>{video.duration} min</TableCell>
                      <TableCell>{video.viewCount.toLocaleString()}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(video.uploadedAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(video.youtubeUrl, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVideo(video.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <AdminModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
