import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Grid, List, Star, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projectsService, categoriesService } from '@/services';
import { formatPrice } from '@/lib/utils';
import type { Project } from '@/types';

function ProjectCard({ project, view }: { project: Project; view: 'grid' | 'list' }) {
  if (view === 'list') {
    return (
      <Link to={`/projects/${project.slug}`}>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex gap-4">
            <div className="w-48 h-32 rounded-lg bg-muted overflow-hidden flex-shrink-0">
              {project.thumbnailUrl ? (
                <img
                  src={project.thumbnailUrl}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg hover:text-primary">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {project.shortDescription}
                  </p>
                </div>
                <p className="font-bold text-xl ml-4">
                  {project.isFree ? 'Free' : formatPrice(project.price)}
                </p>
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {project.averageRating.toFixed(1)} ({project.reviewCount})
                </span>
                <span className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  {project.downloadsCount}
                </span>
                <Badge variant="outline">{project.category?.name}</Badge>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {project.techStack?.slice(0, 4).map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/projects/${project.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className="aspect-video bg-muted relative overflow-hidden">
          {project.thumbnailUrl ? (
            <img
              src={project.thumbnailUrl}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          {project.isFeatured && (
            <Badge className="absolute top-2 left-2">Featured</Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-1 group-hover:text-primary">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {project.shortDescription}
          </p>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{project.averageRating.toFixed(1)}</span>
            </div>
            <p className="font-bold">
              {project.isFree ? 'Free' : formatPrice(project.price)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const isFree = searchParams.get('isFree') === 'true';
  const page = parseInt(searchParams.get('page') || '1');

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects', { search, category, sortBy, sortOrder, minPrice, maxPrice, isFree, page }],
    queryFn: () =>
      projectsService.getAll({
        search: search || undefined,
        category: category || undefined,
        sortBy: sortBy as 'createdAt' | 'price' | 'averageRating' | 'downloadsCount',
        sortOrder: sortOrder as 'asc' | 'desc',
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        isFree: isFree || undefined,
        page,
        limit: 12,
      }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  });

  const updateParams = (updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    if (!updates.page) {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = category || minPrice || maxPrice || isFree;
  const projects = projectsData?.data || [];
  const pagination = projectsData?.meta?.pagination;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Projects</h1>
        <p className="text-muted-foreground">
          Discover {pagination?.total || 0} amazing projects from our community
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => updateParams({ q: e.target.value || undefined })}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={category} onValueChange={(v) => updateParams({ category: v || undefined })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categoriesData?.data?.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={(v) => {
              const [newSortBy, newSortOrder] = v.split('-');
              updateParams({ sortBy: newSortBy, sortOrder: newSortOrder });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Newest First</SelectItem>
              <SelectItem value="createdAt-asc">Oldest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="averageRating-desc">Top Rated</SelectItem>
              <SelectItem value="downloadsCount-desc">Most Downloaded</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? 'border-primary text-primary' : ''}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <div className="border-l" />
          <Button
            variant={view === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setView('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-sm font-medium mb-1 block">Min Price</label>
                <Input
                  type="number"
                  placeholder="$0"
                  value={minPrice}
                  onChange={(e) => updateParams({ minPrice: e.target.value || undefined })}
                  className="w-32"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Max Price</label>
                <Input
                  type="number"
                  placeholder="$999"
                  value={maxPrice}
                  onChange={(e) => updateParams({ maxPrice: e.target.value || undefined })}
                  className="w-32"
                />
              </div>
              <Button
                variant={isFree ? 'default' : 'outline'}
                onClick={() => updateParams({ isFree: isFree ? undefined : 'true' })}
              >
                Free Only
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-muted animate-pulse" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-4">No projects found</p>
          <Button onClick={clearFilters}>Clear Filters</Button>
        </div>
      ) : (
        <>
          <div
            className={
              view === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} view={view} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={!pagination.hasPrev}
                onClick={() => updateParams({ page: String(page - 1) })}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={!pagination.hasNext}
                onClick={() => updateParams({ page: String(page + 1) })}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
