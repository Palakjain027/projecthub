import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ordersService } from '@/services';
import { formatPrice, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/stores';

export function OrdersPage() {
  const { isSeller } = useAuthStore();
  const [tab, setTab] = useState<'purchases' | 'sales'>('purchases');

  const { data: purchasesData, isLoading: purchasesLoading } = useQuery({
    queryKey: ['orders', 'purchases'],
    queryFn: () => ordersService.getMyPurchases({ limit: 50 }),
  });

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['orders', 'sales'],
    queryFn: () => ordersService.getMySales({ limit: 50 }),
    enabled: isSeller(),
  });

  const orders = tab === 'purchases' ? purchasesData?.data || [] : salesData?.data || [];
  const isLoading = tab === 'purchases' ? purchasesLoading : salesLoading;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'refunded':
        return <Badge variant="destructive">Refunded</Badge>;
      case 'disputed':
        return <Badge variant="destructive">Disputed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground">View your purchase and sales history</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={tab === 'purchases' ? 'default' : 'outline'}
          onClick={() => setTab('purchases')}
        >
          Purchases
        </Button>
        {isSeller() && (
          <Button
            variant={tab === 'sales' ? 'default' : 'outline'}
            onClick={() => setTab('sales')}
          >
            Sales
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search orders..." className="pl-10" />
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No {tab === 'purchases' ? 'purchases' : 'sales'} yet
            </h3>
            <p className="text-muted-foreground">
              {tab === 'purchases'
                ? 'Start exploring projects to make your first purchase'
                : 'When someone buys your project, it will appear here'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-20 rounded bg-muted overflow-hidden flex-shrink-0">
                    {order.project?.thumbnailUrl ? (
                      <img
                        src={order.project.thumbnailUrl}
                        alt={order.project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{order.project?.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(order.status)}
                      <span className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(order.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      Order #{order.id.slice(-8)}
                    </p>
                  </div>
                  {order.status === 'completed' && tab === 'purchases' && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
