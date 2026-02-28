import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

export function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <p className="text-muted-foreground">View and manage all orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Order management coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
