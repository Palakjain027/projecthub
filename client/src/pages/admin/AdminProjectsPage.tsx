import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Star,
  Package,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { projectsService } from '@/services';
import { formatDate, formatPrice, truncate } from '@/lib/utils';
import { Project, ProjectStatus } from '@/types';

export function AdminProjectsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'projects', { search, status: statusFilter, page }],
    queryFn: () => projectsService.getAll({
      search,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page,
      limit: 20,
    }),
  });

  const approveMutation = useMutation({
    mutationFn: (projectId: string) => projectsService.approve(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (projectId: string) => projectsService.reject(projectId, 'Rejected by admin'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
    },
  });

  const featureMutation = useMutation({
    mutationFn: (projectId: string) => projectsService.toggleFeatured(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
    },
  });

  const projects = data?.data || [];
  const pagination = data?.meta?.pagination;

  const getStatusBadgeVariant = (status: ProjectStatus) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending_review':
        return 'warning';
      case 'rejected':
        return 'destructive';
      case 'draft':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const stats = [
    { label: 'Pending Review', count: projects.filter((p: Project) => p.status === 'pending_review').length, icon: Clock, color: 'text-yellow-600' },
    { label: 'Approved', count: projects.filter((p: Project) => p.status === 'approved').length, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Rejected', count: projects.filter((p: Project) => p.status === 'rejected').length, icon: XCircle, color: 'text-red-600' },
    { label: 'Featured', count: projects.filter((p: Project) => p.isFeatured).length, icon: Star, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects Management</h1>
          <p className="text-muted-foreground">Review and manage projects</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.count}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Projects ({pagination?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No projects found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Project</th>
                    <th className="text-left py-3 px-4 font-medium">Seller</th>
                    <th className="text-left py-3 px-4 font-medium">Price</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Submitted</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project: Project) => (
                    <tr key={project.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={project.thumbnailUrl || '/placeholder.png'}
                            alt={project.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {truncate(project.title, 30)}
                              {project.isFeatured && (
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {project.category?.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">{project.seller?.fullName || project.seller?.username}</p>
                        <p className="text-xs text-muted-foreground">
                          @{project.seller?.username}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {formatPrice(project.price)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusBadgeVariant(project.status)}>
                          {project.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDate(project.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {project.status === 'pending_review' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => approveMutation.mutate(project.id)}
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => rejectMutation.mutate(project.id)}
                                disabled={rejectMutation.isPending}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          {project.status === 'approved' && !project.isFeatured && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => featureMutation.mutate(project.id)}
                              disabled={featureMutation.isPending}
                            >
                              <Star className="h-4 w-4 text-yellow-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
