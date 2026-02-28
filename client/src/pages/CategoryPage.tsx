import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { categoriesService, projectsService } from '@/services';
import { formatPrice } from '@/lib/utils';
import { Star, ArrowLeft } from 'lucide-react';

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoriesService.getBySlug(slug!),
    enabled: !!slug,
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', 'category', slug],
    queryFn: () => projectsService.getByCategory(slug!, { limit: 20 }),
    enabled: !!slug,
  });

  const category = categoryData?.data;
  const projects = projectsData?.data || [];
  const isLoading = categoryLoading || projectsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <Button asChild>
          <Link to="/categories">View All Categories</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/categories">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Categories
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center text-3xl">
            {category.icon || '📦'}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            {category.description && (
              <p className="text-muted-foreground mt-1">{category.description}</p>
            )}
          </div>
        </div>
        <p className="text-muted-foreground mt-4">
          {projectsData?.meta?.pagination?.total || 0} projects in this category
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-4">
            No projects found in this category
          </p>
          <Button asChild>
            <Link to="/explore">Explore All Projects</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.slug}`}>
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
          ))}
        </div>
      )}
    </div>
  );
}
