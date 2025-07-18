import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Save, FolderSync, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    youtubeUrl: '',
    duration: '',
    instructor: '',
    pdfUrl: '',
    thumbnailUrl: '',
  });

  const createVideoMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/videos', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/stats'] });
      toast({
        title: "Video added successfully",
        description: "The video has been added to the library.",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error adding video",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const videoData = {
      ...formData,
      duration: parseInt(formData.duration) || 0,
    };

    createVideoMutation.mutate(videoData);
  };

  const handleClose = () => {
    setFormData({
      title: '',
      subject: '',
      description: '',
      youtubeUrl: '',
      duration: '',
      instructor: '',
      pdfUrl: '',
      thumbnailUrl: '',
    });
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Admin Panel - Add New Video</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Video Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter video title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">YouTube URL</Label>
              <Input
                id="youtubeUrl"
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => handleInputChange('youtubeUrl', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter video description"
                className="h-24"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="45"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) => handleInputChange('instructor', e.target.value)}
                  placeholder="Prof. Name"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pdfUrl">PDF Notes URL (Optional)</Label>
              <Input
                id="pdfUrl"
                type="url"
                value={formData.pdfUrl}
                onChange={(e) => handleInputChange('pdfUrl', e.target.value)}
                placeholder="https://example.com/notes.pdf"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL (Optional)</Label>
              <Input
                id="thumbnailUrl"
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>
            
            <div className="flex items-center space-x-4 pt-4">
              <Button 
                type="submit" 
                disabled={createVideoMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {createVideoMutation.isPending ? 'Saving...' : 'Save Video'}
              </Button>
              <Button type="button" variant="outline">
                <FolderSync className="h-4 w-4 mr-2" />
                Auto FolderSync from YouTube
              </Button>
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
