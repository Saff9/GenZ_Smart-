import { useState } from "react";
import { Bell, GraduationCap, Settings, User, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NotificationPanel } from "./notification-panel";
import { ProfileModal } from "./profile-modal";

interface User {
  id: number;
  name: string;
  batch: string;
  username: string;
  email: string;
  profilePicture: string;
  bio: string | null;
}

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/1'],
  });

  const { data: unreadNotifications = [] } = useQuery<any[]>({
    queryKey: ['/api/users/1/notifications/unread'],
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    PW Lakshya JEE 2026
                  </h1>
                  <Badge variant="secondary" className="hidden sm:inline-flex bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-0 text-xs">
                    Video Tracker
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications.length > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 bg-red-500"
                    >
                      {unreadNotifications.length}
                    </Badge>
                  )}
                </Button>
                
                {showNotifications && (
                  <NotificationPanel 
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>
              
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 h-10 px-3 hover:bg-gray-50">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.profilePicture} alt={user?.name} />
                      <AvatarFallback className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {user ? getInitials(user.name) : 'AS'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-medium text-slate-900">
                        {user?.name || 'Loading...'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {user?.batch || 'JEE 2026'}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setShowProfile(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    View Progress
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <ProfileModal 
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
}
