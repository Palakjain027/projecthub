import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export function AdminDisputesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Disputes Management</h1>
        <p className="text-muted-foreground">Review and resolve disputes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Disputes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Dispute management coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
