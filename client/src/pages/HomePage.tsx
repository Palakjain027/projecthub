import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Code, Zap, Shield, Users, Star, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { projectsService, categoriesService } from '@/services';
import { formatPrice } from '@/lib/utils';
import type { Project, Category } from '@/types';

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={`/projects/${project.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-video bg-muted relative overflow-hidden">
          {project.thumbnailUrl ? (
            <img
              src={project.thumbnailUrl}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Code className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {project.isFeatured && (
            <Badge className="absolute top-2 left-2" variant="default">
              Featured
            </Badge>
          )}
          {project.isFree && (
            <Badge className="absolute top-2 right-2" variant="success">
              Free
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {project.shortDescription}
          </p>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{project.averageRating.toFixed(1)}</span>
              <span>({project.reviewCount})</span>
            </div>
            <p className="font-bold text-lg">
              {project.isFree ? 'Free' : formatPrice(project.price)}
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Download className="h-3 w-3" />
              <span>{project.downloadsCount}</span>
            </span>
            <span>{project.category?.name}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link to={`/categories/${category.slug}`}>
      <Card className="group hover:shadow-md transition-shadow hover:border-primary">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <span className="text-2xl">{category.icon || '📦'}</span>
          </div>
          <h3 className="font-semibold">{category.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {category._count?.projects || 0} projects
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function HomePage() {
  const { data: featuredProjects } = useQuery({
    queryKey: ['projects', 'featured'],
    queryFn: () => projectsService.getFeatured(6),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', 'popular'],
    queryFn: () => categoriesService.getPopular(8),
  });

  const features = [
    {
      icon: Code,
      title: 'Quality Code',
      description: 'All projects are reviewed for code quality and best practices.',
    },
    {
      icon: Zap,
      title: 'Instant Download',
      description: 'Get source code, documentation, and assets immediately.',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Protected transactions with Stripe payment processing.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Join thousands of developers buying and selling projects.',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              The Developer Marketplace
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Buy, Sell & Discover
              <span className="text-primary block">Amazing Projects</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              The marketplace for developers to buy ready-made projects, sell their work, 
              and hire freelancers for custom solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/explore">
                  Explore Projects
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/register">Start Selling</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Projects', value: '10,000+' },
              { label: 'Developers', value: '50,000+' },
              { label: 'Downloads', value: '500,000+' },
              { label: 'Satisfaction', value: '99%' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Browse Categories</h2>
              <p className="text-muted-foreground mt-1">Find projects by technology</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/categories">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories?.data?.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Featured Projects</h2>
              <p className="text-muted-foreground mt-1">Hand-picked by our team</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/explore">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects?.data?.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">Why Choose ProjectHub?</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              We provide the best marketplace experience for developers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Selling?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of developers earning money by selling their projects.
            Set up your seller account in minutes.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/register">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
