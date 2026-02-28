import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import api from '@/services/api';

export function AdminDashboardPage() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/admin/stats').then(res => res.data),
  });

  const { data: recentData } = useQuery({
    queryKey: ['admin', 'recent'],
    queryFn: () => api.get('/admin/recent-activity').then(res => res.data),
  });

  const stats = statsData?.data || {};
  const recentActivity = recentData?.data || [];

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Total Projects',
      value: stats.totalProjects || 0,
      change: '+8%',
      icon: Package,
      color: 'text-purple-600',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      change: '+24%',
      icon: ShoppingCart,
      color: 'text-green-600',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue || 0),
      change: '+18%',
      icon: DollarSign,
      color: 'text-yellow-600',
    },
  ];

  const pendingItems = [
    {
      label: 'Pending Projects',
      count: stats.pendingProjects || 0,
      icon: Package,
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      label: 'Open Disputes',
      count: stats.openDisputes || 0,
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-800',
    },
    {
      label: 'Pending Payouts',
      count: stats.pendingPayouts || 0,
      icon: DollarSign,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      label: 'Pending Verifications',
      count: stats.pendingVerifications || 0,
      icon: CheckCircle,
      color: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="success" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">
                    {isLoading ? '...' : stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pending Items */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Actions</CardTitle>
          <CardDescription>Items requiring admin attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pendingItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`p-4 rounded-lg ${item.color} flex items-center gap-3`}
                >
                  <Icon className="h-5 w-5" />
                  <div>
                    <p className="text-2xl font-bold">{item.count}</p>
                    <p className="text-xs">{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the past year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Revenue chart</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { action: 'New user registered', user: 'john_doe', time: '2 minutes ago' },
                  { action: 'Project submitted for review', user: 'seller123', time: '5 minutes ago' },
                  { action: 'Order completed', user: 'buyer456', time: '10 minutes ago' },
                  { action: 'Dispute opened', user: 'user789', time: '15 minutes ago' },
                  { action: 'Payout processed', user: 'seller321', time: '20 minutes ago' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">by {activity.user}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
