import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, Clock, CreditCard, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usersService } from '@/services';
import { formatPrice, formatDate } from '@/lib/utils';

export function EarningsPage() {
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['earnings', 'summary'],
    queryFn: () => usersService.getEarningsSummary(),
  });

  const { data: earningsData, isLoading: earningsLoading } = useQuery({
    queryKey: ['earnings', 'list'],
    queryFn: () => usersService.getMyEarnings({ limit: 50 }),
  });

  const summary = summaryData?.data;
  const earnings = earningsData?.data || [];

  const stats = [
    {
      title: 'Total Earnings',
      value: formatPrice(summary?.totalEarnings || 0),
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Pending',
      value: formatPrice(summary?.pendingEarnings || 0),
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'Paid Out',
      value: formatPrice(summary?.paidEarnings || 0),
      icon: CreditCard,
      color: 'text-blue-600',
    },
    {
      title: 'This Month',
      value: formatPrice(summary?.thisMonthEarnings || 0),
      icon: TrendingUp,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Earnings</h1>
          <p className="text-muted-foreground">Track your revenue and payouts</p>
        </div>
        <Button>
          <CreditCard className="h-4 w-4 mr-2" />
          Request Payout
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{summaryLoading ? '...' : stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Earnings List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Earnings</CardTitle>
          <CardDescription>Your earnings from project sales</CardDescription>
        </CardHeader>
        <CardContent>
          {earningsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : earnings.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No earnings yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                When you make sales, your earnings will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {earnings.map((earning) => (
                <div
                  key={earning.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{earning.order?.project?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(earning.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+{formatPrice(earning.amount)}</p>
                    <Badge variant={earning.status === 'paid' ? 'success' : 'warning'}>
                      {earning.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
