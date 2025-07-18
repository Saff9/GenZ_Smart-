import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Clock, 
  User, 
  Eye, 
  StickyNote, 
  FileText, 
  Youtube, 
  Check,
  Atom,
  FlaskConical,
  Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { VideoWithWatchStatus } from "@/lib/types";

interface VideoCardProps {
  video: VideoWithWatchStatus;
  compact?: boolean;
}

export function VideoCard({ video, compact = false }: VideoCardProps) {
  const queryClient = useQueryClient();
  const [isWatching, setIsWatching] = useState(false);

  const markWatchedMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/videos/${video.id}/watch`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/watched'] });
    },
  });

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'Physics':
        return <Atom className="h-4 w-4 text-physics" />;
      case 'Chemistry':
        return <FlaskConical className="h-4 w-4 text-chemistry" />;
      case 'Mathematics':
        return <Calculator className="h-4 w-4 text-math" />;
      default:
        return <Atom className="h-4 w-4" />;
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

  const getSubjectBgColor = (subject: string) => {
    switch (subject) {
      case 'Physics':
        return 'bg-physics/10';
      case 'Chemistry':
        return 'bg-chemistry/10';
      case 'Mathematics':
        return 'bg-math/10';
      default:
        return 'bg-slate/10';
    }
  };

  const handleWatchClick = () => {
    setIsWatching(true);
    window.open(video.youtubeUrl, '_blank');
  };

  const handleMarkWatched = () => {
    markWatchedMutation.mutate();
  };

  if (compact) {
    return (
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className={`w-full h-32 ${getSubjectBgColor(video.subject)} rounded-t-lg flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8"></div>
          <div className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
            {getSubjectIcon(video.subject)}
          </div>
          {video.isWatched && (
            <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Badge className={`${getSubjectColor(video.subject)} font-medium`}>
              {video.subject}
            </Badge>
            <span className="text-xs text-slate-500">
              {video.duration} min
            </span>
          </div>
          
          <div>
            <h3 className="font-bold text-slate-900 mb-1 line-clamp-2 leading-tight">
              {video.title}
            </h3>
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {video.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <User className="h-3 w-3" />
                <span className="truncate max-w-20">{video.instructor}</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <Eye className="h-3 w-3" />
                <span>{video.viewCount}</span>
              </div>
            </div>
            
            <Button
              size="sm"
              onClick={handleWatchClick}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 h-8 text-xs"
            >
              <Youtube className="h-3 w-3 mr-1" />
              {video.isWatched ? 'Rewatch' : 'Watch'}
            </Button>
          </div>
          
          <div className="text-xs text-slate-400 text-center pt-1 border-t border-slate-100">
            {formatDistanceToNow(new Date(video.uploadedAt), { addSuffix: true })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-6 hover:bg-slate-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 ${getSubjectBgColor(video.subject)} rounded-lg flex items-center justify-center`}>
              {getSubjectIcon(video.subject)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Badge className={getSubjectColor(video.subject)}>
                {video.subject}
              </Badge>
              <span className="text-sm text-slate-500">
                {formatDistanceToNow(new Date(video.uploadedAt), { addSuffix: true })}
              </span>
              {video.isWatched && (
                <Badge className="bg-watched/10 text-watched">
                  <Check className="h-3 w-3 mr-1" />
                  Watched
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              {video.title}
            </h3>
            <p className="text-sm text-slate-600 mb-2">
              {video.description}
            </p>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span>
                <Clock className="h-4 w-4 mr-1 inline" />
                {video.duration} min
              </span>
              <span>
                <User className="h-4 w-4 mr-1 inline" />
                {video.instructor}
              </span>
              <span>
                <Eye className="h-4 w-4 mr-1 inline" />
                {video.viewCount.toLocaleString()} views
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3 ml-4">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary">
            <StickyNote className="h-4 w-4" />
          </Button>
          {video.pdfUrl && (
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary">
              <FileText className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={handleWatchClick}
            className="bg-red-600 hover:bg-red-700"
          >
            <Youtube className="h-4 w-4 mr-2" />
            {video.isWatched ? 'Rewatch' : 'Watch'}
          </Button>
          {video.isWatched ? (
            <Button variant="outline" disabled className="bg-watched/10 text-watched border-watched/20">
              <Check className="h-4 w-4 mr-2" />
              Watched
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleMarkWatched}
              disabled={markWatchedMutation.isPending}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark Watched
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
