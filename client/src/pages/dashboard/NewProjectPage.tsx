import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { projectsService, categoriesService } from '@/services';
import type { ProjectFormData } from '@/services/projects.service';

export function NewProjectPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    shortDescription: '',
    description: '',
    categoryId: '',
    tags: [],
    price: 0,
    isFree: false,
    techStack: [],
    features: [],
    sourceCodeUrl: '',
    documentationUrl: '',
    livePreviewUrl: '',
  });
  
  const [techInput, setTechInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [error, setError] = useState('');

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: projectsService.create,
    onSuccess: (response) => {
      navigate(`/dashboard/projects/${response.data.id}`);
    },
    onError: () => {
      setError('Failed to create project. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description || !formData.categoryId) {
      setError('Please fill in all required fields');
      return;
    }

    createMutation.mutate(formData);
  };

  const addTech = () => {
    if (techInput.trim() && !formData.techStack?.includes(techInput.trim())) {
      setFormData({ ...formData, techStack: [...(formData.techStack || []), techInput.trim()] });
      setTechInput('');
    }
  };

  const addFeature = () => {
    if (featureInput.trim() && !formData.features?.includes(featureInput.trim())) {
      setFormData({ ...formData, features: [...(formData.features || []), featureInput.trim()] });
      setFeatureInput('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Project</h1>
          <p className="text-muted-foreground">Fill in the details to list your project</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential details about your project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  placeholder="E.g., E-Commerce React Dashboard"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  placeholder="A brief summary (max 200 characters)"
                  maxLength={200}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of your project..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesData?.data?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Set your project price</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="29.99"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    disabled={formData.isFree}
                  />
                </div>
                <div className="pt-6">
                  <Button
                    type="button"
                    variant={formData.isFree ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, isFree: !formData.isFree, price: 0 })}
                  >
                    Free
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card>
            <CardHeader>
              <CardTitle>Tech Stack & Features</CardTitle>
              <CardDescription>Technologies used and key features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tech Stack</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add technology (e.g., React)"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                  />
                  <Button type="button" onClick={addTech}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.techStack?.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          techStack: formData.techStack?.filter((t) => t !== tech),
                        })}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Features</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add feature"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.features?.map((feature) => (
                    <Badge key={feature} variant="outline">
                      {feature}
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          features: formData.features?.filter((f) => f !== feature),
                        })}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle>Links</CardTitle>
              <CardDescription>External links for your project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="livePreviewUrl">Live Preview URL</Label>
                <Input
                  id="livePreviewUrl"
                  type="url"
                  placeholder="https://demo.example.com"
                  value={formData.livePreviewUrl}
                  onChange={(e) => setFormData({ ...formData, livePreviewUrl: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create Project
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
