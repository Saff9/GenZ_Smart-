import { useQuery } from "@tanstack/react-query";
import { List, Atom, FlaskConical, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface UserStats {
  totalVideos: number;
  watchedVideos: number;
  pendingVideos: number;
  progressPercentage: number;
}

interface Video {
  id: number;
  subject: string;
}

interface SidebarProps {
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
}

export function Sidebar({ selectedSubject, onSubjectChange }: SidebarProps) {
  const { data: stats } = useQuery<UserStats>({
    queryKey: ['/api/users/1/stats'],
  });

  const { data: videos = [] } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
  });

  const subjectCounts = {
    Physics: videos.filter(v => v.subject === 'Physics').length,
    Chemistry: videos.filter(v => v.subject === 'Chemistry').length,
    Mathematics: videos.filter(v => v.subject === 'Mathematics').length,
  };

  const weeklyStats = {
    released: 12,
    completed: 8,
    remaining: 4,
  };

  return (
    <aside className="lg:w-64 space-y-6">
      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Total Videos</span>
            <span className="font-semibold text-slate-900">
              {stats?.totalVideos || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Watched</span>
            <span className="font-semibold text-watched">
              {stats?.watchedVideos || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Pending</span>
            <span className="font-semibold text-pending">
              {stats?.pendingVideos || 0}
            </span>
          </div>
          <div className="pt-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-600">Progress</span>
              <span className="font-medium">
                {stats?.progressPercentage || 0}%
              </span>
            </div>
            <Progress value={stats?.progressPercentage || 0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Subject Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subject Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant={selectedSubject === 'All' ? 'default' : 'outline'}
            className="w-full justify-between"
            onClick={() => onSubjectChange('All')}
          >
            <div className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>All Subjects</span>
            </div>
            <Badge variant="secondary">
              {stats?.totalVideos || 0}
            </Badge>
          </Button>
          
          <Button
            variant={selectedSubject === 'Physics' ? 'default' : 'outline'}
            className="w-full justify-between"
            onClick={() => onSubjectChange('Physics')}
          >
            <div className="flex items-center space-x-2">
              <Atom className="h-4 w-4 text-physics" />
              <span>Physics</span>
            </div>
            <Badge variant="secondary">
              {subjectCounts.Physics}
            </Badge>
          </Button>
          
          <Button
            variant={selectedSubject === 'Chemistry' ? 'default' : 'outline'}
            className="w-full justify-between"
            onClick={() => onSubjectChange('Chemistry')}
          >
            <div className="flex items-center space-x-2">
              <FlaskConical className="h-4 w-4 text-chemistry" />
              <span>Chemistry</span>
            </div>
            <Badge variant="secondary">
              {subjectCounts.Chemistry}
            </Badge>
          </Button>
          
          <Button
            variant={selectedSubject === 'Mathematics' ? 'default' : 'outline'}
            className="w-full justify-between"
            onClick={() => onSubjectChange('Mathematics')}
          >
            <div className="flex items-center space-x-2">
              <Calculator className="h-4 w-4 text-math" />
              <span>Mathematics</span>
            </div>
            <Badge variant="secondary">
              {subjectCounts.Mathematics}
            </Badge>
          </Button>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">This Week</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Videos Released</span>
            <span className="font-semibold text-slate-900">
              {weeklyStats.released}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Completed</span>
            <span className="font-semibold text-watched">
              {weeklyStats.completed}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Remaining</span>
            <span className="font-semibold text-pending">
              {weeklyStats.remaining}
            </span>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
