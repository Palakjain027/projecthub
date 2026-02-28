import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, Clock, DollarSign, ArrowRight } from 'lucide-react';

export function FreelancePage() {
  const features = [
    {
      icon: Users,
      title: 'Skilled Freelancers',
      description: 'Connect with verified developers ready to build your project.',
    },
    {
      icon: Briefcase,
      title: 'Custom Projects',
      description: 'Get tailored solutions built specifically for your needs.',
    },
    {
      icon: Clock,
      title: 'Milestone Payments',
      description: 'Pay in stages as your project progresses safely.',
    },
    {
      icon: DollarSign,
      title: 'Secure Escrow',
      description: 'Your payment is protected until work is completed.',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="secondary" className="mb-4">
          Freelance Marketplace
        </Badge>
        <h1 className="text-4xl font-bold mb-4">
          Hire Expert Freelancers for Your Project
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Post your project requirements and receive bids from skilled developers.
          Work with the best talent to bring your ideas to life.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/freelance/post">
              Post a Project
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/freelance/browse">Find Work</Link>
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title}>
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* How It Works */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div className="space-y-6">
          {[
            { step: 1, title: 'Post Your Project', description: 'Describe your requirements, budget, and timeline.' },
            { step: 2, title: 'Receive Bids', description: 'Get proposals from qualified freelancers.' },
            { step: 3, title: 'Choose & Collaborate', description: 'Select the best freelancer and start working together.' },
            { step: 4, title: 'Review & Pay', description: 'Approve the work and release payment securely.' },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-16">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-2">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of clients and freelancers on ProjectHub.
            </p>
            <Button size="lg" asChild>
              <Link to="/register">Create Free Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
