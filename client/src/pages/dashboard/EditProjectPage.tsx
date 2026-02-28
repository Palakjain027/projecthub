import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function EditProjectPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Edit Project</h1>
      <Card>
        <CardHeader>
          <CardTitle>Project Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Project editing form for project ID: {id}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            This page would contain the same form as NewProjectPage, pre-filled with existing project data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
