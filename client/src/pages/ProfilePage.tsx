import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usersService } from '@/services';
import { getInitials, formatDate } from '@/lib/utils';
import { Calendar } from 'lucide-react';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user', username],
    queryFn: () => usersService.getByUsername(username!),
    enabled: !!username,
  });

  const user = userData?.data;

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-muted" />
            <div className="flex-1">
              <div className="h-8 bg-muted rounded w-1/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <Button asChild>
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="text-2xl">
                  {getInitials(user.fullName || user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">
                    {user.fullName || user.username}
                  </h1>
                  {user.isVerified && (
                    <Badge variant="secondary">Verified</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">@{user.username}</p>
                {user.bio && <p className="mt-3">{user.bio}</p>}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {formatDate(user.createdAt)}
                  </span>
                  <span>{user._count?.projects || 0} projects</span>
                  <span>{user._count?.reviewsReceived || 0} reviews</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Projects by {user.username}</h2>
          <div className="text-center py-8 text-muted-foreground">
            Projects will be displayed here
          </div>
        </div>
      </div>
    </div>
  );
}
