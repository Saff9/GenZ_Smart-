import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Video, FlaskConical, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const queryClient = useQueryClient();
  
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/users/1/notifications'],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('PUT', `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/notifications/unread'] });
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4 text-primary" />;
      case 'assignment':
        return <FlaskConical className="h-4 w-4 text-chemistry" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-pending" />;
    }
  };

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-primary/10';
      case 'assignment':
        return 'bg-chemistry/10';
      default:
        return 'bg-pending/10';
    }
  };

  return (
    <Card className="fixed top-16 right-4 w-80 shadow-xl border border-slate-200 z-40">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Notifications</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsReadMutation.mutate(notification.id);
                  }
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 ${getIconBgColor(notification.type)} rounded-full flex items-center justify-center`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <Badge variant="secondary" className="ml-2">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className="p-4 border-t border-slate-200">
            <Button variant="ghost" className="w-full text-primary hover:text-primary/80">
              View All Notifications
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
