import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FolderKanban,
  ShoppingBag,
  DollarSign,
  Star,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores';
import { projectsService, ordersService, usersService } from '@/services';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

export function DashboardPage() {
  const { user, isSeller } = useAuthStore();

  const { data: myProjects } = useQuery({
    queryKey: ['projects', 'my', { limit: 5 }],
    queryFn: () => projectsService.getMyProjects({ limit: 5 }),
    enabled: isSeller(),
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['orders', 'purchases', { limit: 5 }],
    queryFn: () => ordersService.getMyPurchases({ limit: 5 }),
  });

  const { data: earningsSummary } = useQuery({
    queryKey: ['earnings', 'summary'],
    queryFn: () => usersService.getEarningsSummary(),
    enabled: isSeller(),
  });

  const stats = [
    {
      title: 'Total Projects',
      value: myProjects?.meta?.pagination?.total || 0,
      icon: FolderKanban,
      href: '/dashboard/projects',
      change: '+12%',
      trend: 'up',
      show: isSeller(),
    },
    {
      title: 'Orders',
      value: recentOrders?.meta?.pagination?.total || 0,
      icon: ShoppingBag,
      href: '/dashboard/orders',
      change: '+8%',
      trend: 'up',
      show: true,
    },
    {
      title: 'Total Earnings',
      value: formatPrice(earningsSummary?.data?.totalEarnings || 0),
      icon: DollarSign,
      href: '/dashboard/earnings',
      change: '+23%',
      trend: 'up',
      show: isSeller(),
    },
    {
      title: 'Pending Earnings',
      value: formatPrice(earningsSummary?.data?.pendingEarnings || 0),
      icon: TrendingUp,
      href: '/dashboard/earnings',
      change: '+5%',
      trend: 'up',
      show: isSeller(),
    },
  ].filter((stat) => stat.show);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <Badge variant="success">{status}</Badge>;
      case 'pending':
      case 'pending_review':
        return <Badge variant="warning">{status.replace('_', ' ')}</Badge>;
      case 'rejected':
      case 'refunded':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, {user?.fullName || user?.username}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your account today.
          </p>
        </div>
        {isSeller() && (
          <Button asChild>
            <Link to="/dashboard/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} to={stat.href}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className={`flex items-center text-sm ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 ml-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects (Sellers) */}
        {isSeller() && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Your latest project submissions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/projects">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {myProjects?.data?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No projects yet</p>
                  <Button asChild>
                    <Link to="/dashboard/projects/new">Create Your First Project</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myProjects?.data?.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50"
                    >
                      <div className="h-12 w-12 rounded bg-muted flex-shrink-0 overflow-hidden">
                        {project.thumbnailUrl ? (
                          <img
                            src={project.thumbnailUrl}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FolderKanban className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/dashboard/projects/${project.id}`}
                          className="font-medium hover:text-primary truncate block"
                        >
                          {project.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(project.status)}
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(project.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(project.price)}</p>
                        <p className="text-xs text-muted-foreground">
                          {project.downloadsCount} sales
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your purchase history</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders?.data?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <Button asChild>
                  <Link to="/explore">Browse Projects</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders?.data?.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50"
                  >
                    <div className="h-12 w-12 rounded bg-muted flex-shrink-0 overflow-hidden">
                      {order.project?.thumbnailUrl ? (
                        <img
                          src={order.project.thumbnailUrl}
                          alt={order.project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{order.project?.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(order.status)}
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(order.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(order.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/explore">
              <div className="p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors text-center">
                <ShoppingBag className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="font-medium">Browse Projects</p>
              </div>
            </Link>
            {isSeller() && (
              <Link to="/dashboard/projects/new">
                <div className="p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors text-center">
                  <Plus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="font-medium">New Project</p>
                </div>
              </Link>
            )}
            <Link to="/dashboard/settings">
              <div className="p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors text-center">
                <Star className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="font-medium">Settings</p>
              </div>
            </Link>
            <Link to="/freelance">
              <div className="p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="font-medium">Hire Freelancer</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
