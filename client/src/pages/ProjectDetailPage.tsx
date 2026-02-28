import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  Download,
  Eye,
  ShoppingCart,
  Heart,
  Share2,
  Check,
  Code,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { projectsService, reviewsService } from '@/services';
import { useCartStore, useAuthStore } from '@/stores';
import { formatPrice, formatDate, getInitials } from '@/lib/utils';

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem, hasItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const { data: projectData, isLoading } = useQuery({
    queryKey: ['project', slug],
    queryFn: () => projectsService.getBySlug(slug!),
    enabled: !!slug,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', projectData?.data?.id],
    queryFn: () => reviewsService.getByProject(projectData!.data.id, { limit: 5 }),
    enabled: !!projectData?.data?.id,
  });

  const project = projectData?.data;
  const reviews = reviewsData?.data || [];
  const isInCart = project ? hasItem(project.id) : false;

  const handleAddToCart = () => {
    if (!project) return;
    addItem({
      projectId: project.id,
      title: project.title,
      slug: project.slug,
      price: project.price,
      thumbnailUrl: project.thumbnailUrl,
      sellerId: project.sellerId,
      sellerUsername: project.seller.username,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4" />
          <div className="h-64 bg-muted rounded mb-4" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The project you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/explore">Browse Projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link to="/explore" className="hover:text-foreground">
                Projects
              </Link>
              <span>/</span>
              <Link
                to={`/categories/${project.category?.slug}`}
                className="hover:text-foreground"
              >
                {project.category?.name}
              </Link>
            </div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground mt-2">{project.shortDescription}</p>
          </div>

          {/* Thumbnail */}
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            {project.thumbnailUrl ? (
              <img
                src={project.thumbnailUrl}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Code className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{project.averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({project.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Download className="h-5 w-5" />
              <span>{project.downloadsCount} downloads</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="h-5 w-5" />
              <span>{project.viewsCount} views</span>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{project.description}</p>
            </div>
          </div>

          {/* Features */}
          {project.features && project.features.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Features</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {project.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tech Stack */}
          {project.techStack && project.techStack.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Reviews</h2>
              <Link
                to={`/projects/${project.slug}/reviews`}
                className="text-sm text-primary hover:underline"
              >
                View all reviews
              </Link>
            </div>
            {reviews.length === 0 ? (
              <p className="text-muted-foreground">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={review.reviewer.avatarUrl} />
                          <AvatarFallback>
                            {getInitials(review.reviewer.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.reviewer.username}</span>
                            {review.isVerifiedPurchase && (
                              <Badge variant="outline" className="text-xs">
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-muted-foreground ml-2">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="mt-2 text-sm">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Purchase Card */}
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <p className="text-4xl font-bold">
                  {project.isFree ? 'Free' : formatPrice(project.price)}
                </p>
              </div>

              {project.isFree ? (
                <Button className="w-full" size="lg" asChild>
                  <Link to={isAuthenticated ? `/projects/${project.slug}/download` : '/login'}>
                    <Download className="h-5 w-5 mr-2" />
                    Download Free
                  </Link>
                </Button>
              ) : isInCart ? (
                <Button className="w-full" size="lg" variant="outline" asChild>
                  <Link to="/cart">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    View in Cart
                  </Link>
                </Button>
              ) : (
                <Button className="w-full" size="lg" onClick={handleAddToCart}>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
              )}

              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              <Separator className="my-6" />

              {/* What's Included */}
              <div className="space-y-3">
                <h3 className="font-semibold">What's Included:</h3>
                <div className="space-y-2 text-sm">
                  {project.sourceCodeUrl && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Full Source Code</span>
                    </div>
                  )}
                  {project.documentationUrl && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Documentation</span>
                    </div>
                  )}
                  {project.pptUrl && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Presentation (PPT)</span>
                    </div>
                  )}
                  {project.reportUrl && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Project Report</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Lifetime Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Free Updates</span>
                  </div>
                </div>
              </div>

              {project.livePreviewUrl && (
                <>
                  <Separator className="my-6" />
                  <Button variant="outline" className="w-full" asChild>
                    <a href={project.livePreviewUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Live Preview
                    </a>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Seller Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About the Seller</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                to={`/profile/${project.seller.username}`}
                className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-lg -mx-2"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={project.seller.avatarUrl} />
                  <AvatarFallback>
                    {getInitials(project.seller.fullName || project.seller.username)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{project.seller.fullName || project.seller.username}</p>
                  <p className="text-sm text-muted-foreground">
                    @{project.seller.username}
                  </p>
                </div>
                {project.seller.isVerified && (
                  <Badge variant="secondary" className="ml-auto">
                    Verified
                  </Badge>
                )}
              </Link>
              {project.seller.bio && (
                <p className="text-sm text-muted-foreground mt-3">{project.seller.bio}</p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span>{project.seller._count?.projects || 0} projects</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
