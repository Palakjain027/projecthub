import { PrismaClient, UserRole, ProjectStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function main() {
  console.log('🌱 Starting seed...');

  // Clean database
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.earning.deleteMany();
  await prisma.order.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.customRequest.deleteMany();
  await prisma.project.deleteMany();
  await prisma.category.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platformSettings.deleteMany();

  console.log('🗑️ Cleaned database');

  // Create platform settings
  await prisma.platformSettings.create({
    data: {
      platformFeeRate: 0.20,
      freeDownloadLimit: 5,
      basicPriceMonthly: 9.99,
      proPriceMonthly: 29.99,
      enterprisePriceMonthly: 99.99,
    },
  });

  console.log('⚙️ Created platform settings');

  // Create users
  const passwordHash = await hashPassword('Password123!');

  const users = await Promise.all([
    // Super Admin
    prisma.user.create({
      data: {
        email: 'superadmin@projecthub.com',
        passwordHash,
        username: 'superadmin',
        fullName: 'Super Admin',
        role: 'super_admin',
        isVerified: true,
      },
    }),
    // Admin
    prisma.user.create({
      data: {
        email: 'admin@projecthub.com',
        passwordHash,
        username: 'admin',
        fullName: 'Platform Admin',
        role: 'admin',
        isVerified: true,
      },
    }),
    // Sellers
    prisma.user.create({
      data: {
        email: 'john.seller@example.com',
        passwordHash,
        username: 'john_seller',
        fullName: 'John Smith',
        role: 'seller',
        isVerified: true,
        bio: 'Full-stack developer with 5+ years of experience. Specializing in React and Node.js.',
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah.dev@example.com',
        passwordHash,
        username: 'sarah_dev',
        fullName: 'Sarah Johnson',
        role: 'seller',
        isVerified: true,
        bio: 'Mobile app developer. Expert in React Native and Flutter.',
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike.coder@example.com',
        passwordHash,
        username: 'mike_coder',
        fullName: 'Mike Wilson',
        role: 'seller',
        isVerified: true,
        bio: 'Backend specialist. Node.js, Python, and Go expert.',
      },
    }),
    prisma.user.create({
      data: {
        email: 'emma.design@example.com',
        passwordHash,
        username: 'emma_design',
        fullName: 'Emma Davis',
        role: 'seller',
        isVerified: true,
        bio: 'UI/UX designer and frontend developer.',
      },
    }),
    prisma.user.create({
      data: {
        email: 'alex.fullstack@example.com',
        passwordHash,
        username: 'alex_fullstack',
        fullName: 'Alex Brown',
        role: 'seller',
        isVerified: true,
        bio: 'Full-stack developer specialized in MERN stack.',
      },
    }),
    // Buyers
    prisma.user.create({
      data: {
        email: 'buyer1@example.com',
        passwordHash,
        username: 'buyer_one',
        fullName: 'David Lee',
        role: 'buyer',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'buyer2@example.com',
        passwordHash,
        username: 'buyer_two',
        fullName: 'Lisa Chen',
        role: 'buyer',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'buyer3@example.com',
        passwordHash,
        username: 'buyer_three',
        fullName: 'Robert Taylor',
        role: 'buyer',
        isVerified: true,
      },
    }),
    // Freelancers
    prisma.user.create({
      data: {
        email: 'freelancer1@example.com',
        passwordHash,
        username: 'freelancer_pro',
        fullName: 'Chris Anderson',
        role: 'freelancer',
        isVerified: true,
        bio: 'Available for custom projects. Expert in web development.',
      },
    }),
    prisma.user.create({
      data: {
        email: 'freelancer2@example.com',
        passwordHash,
        username: 'code_wizard',
        fullName: 'Nina Patel',
        role: 'freelancer',
        isVerified: true,
        bio: 'Mobile and web app specialist.',
      },
    }),
    prisma.user.create({
      data: {
        email: 'freelancer3@example.com',
        passwordHash,
        username: 'dev_master',
        fullName: 'James Kim',
        role: 'freelancer',
        isVerified: true,
        bio: 'Full-stack developer with startup experience.',
      },
    }),
    // Free users
    prisma.user.create({
      data: {
        email: 'freeuser1@example.com',
        passwordHash,
        username: 'free_user_1',
        fullName: 'Sam Thompson',
        role: 'free_user',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'freeuser2@example.com',
        passwordHash,
        username: 'free_user_2',
        fullName: 'Amy White',
        role: 'free_user',
        isVerified: true,
      },
    }),
    // Paid user
    prisma.user.create({
      data: {
        email: 'paiduser@example.com',
        passwordHash,
        username: 'premium_user',
        fullName: 'Mark Premium',
        role: 'paid_user',
        isVerified: true,
      },
    }),
  ]);

  console.log(`👥 Created ${users.length} users`);

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Web Development',
        slug: 'web-development',
        icon: '🌐',
        description: 'Full-stack web applications and websites',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Mobile Apps',
        slug: 'mobile-apps',
        icon: '📱',
        description: 'iOS and Android mobile applications',
      },
    }),
    prisma.category.create({
      data: {
        name: 'E-Commerce',
        slug: 'e-commerce',
        icon: '🛒',
        description: 'Online stores and shopping platforms',
      },
    }),
    prisma.category.create({
      data: {
        name: 'SaaS Templates',
        slug: 'saas-templates',
        icon: '☁️',
        description: 'Software as a Service starter templates',
      },
    }),
    prisma.category.create({
      data: {
        name: 'AI & Machine Learning',
        slug: 'ai-ml',
        icon: '🤖',
        description: 'Artificial Intelligence and ML projects',
      },
    }),
  ]);

  console.log(`📁 Created ${categories.length} categories`);

  // Create projects
  const sellers = users.filter(u => u.role === 'seller');

  const projectData = [
    {
      title: 'E-Commerce React Dashboard',
      shortDescription: 'A complete admin dashboard for e-commerce platforms built with React and TailwindCSS.',
      description: `
# E-Commerce React Dashboard

A beautiful and fully responsive admin dashboard for e-commerce platforms.

## Features
- Real-time analytics and charts
- Order management system
- Product inventory tracking
- Customer management
- Multi-language support
- Dark/Light theme

## Tech Stack
- React 18 with TypeScript
- TailwindCSS for styling
- Recharts for visualizations
- React Query for data fetching
- Zustand for state management

## Installation
\`\`\`bash
npm install
npm run dev
\`\`\`

## License
MIT License
      `,
      categoryId: categories[0].id,
      sellerId: sellers[0].id,
      price: 49.99,
      isFree: false,
      techStack: ['React', 'TypeScript', 'TailwindCSS', 'Recharts'],
      features: ['Dark Mode', 'Responsive', 'Real-time Charts', 'Multi-language'],
      status: 'approved' as ProjectStatus,
      isFeatured: true,
    },
    {
      title: 'React Native Fitness App',
      shortDescription: 'Cross-platform fitness tracking app with workout plans and progress tracking.',
      description: `
# React Native Fitness App

A complete fitness tracking mobile application for iOS and Android.

## Features
- Workout tracking
- Custom workout plans
- Progress charts
- Body measurements
- Push notifications
- Social sharing

## Tech Stack
- React Native
- Expo
- TypeScript
- Firebase

## Getting Started
\`\`\`bash
expo install
expo start
\`\`\`
      `,
      categoryId: categories[1].id,
      sellerId: sellers[1].id,
      price: 79.99,
      isFree: false,
      techStack: ['React Native', 'Expo', 'TypeScript', 'Firebase'],
      features: ['iOS & Android', 'Push Notifications', 'Analytics', 'Social Features'],
      status: 'approved' as ProjectStatus,
      isFeatured: true,
    },
    {
      title: 'Node.js REST API Boilerplate',
      shortDescription: 'Production-ready Node.js API with authentication, validation, and best practices.',
      description: `
# Node.js REST API Boilerplate

A production-ready REST API boilerplate with everything you need to get started.

## Features
- JWT Authentication
- Role-based access control
- Request validation with Zod
- Error handling
- Logging
- Rate limiting
- Docker support

## Tech Stack
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL

## Quick Start
\`\`\`bash
npm install
npm run dev
\`\`\`
      `,
      categoryId: categories[0].id,
      sellerId: sellers[2].id,
      price: 0,
      isFree: true,
      techStack: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'PostgreSQL'],
      features: ['JWT Auth', 'RBAC', 'Docker', 'Swagger Docs'],
      status: 'approved' as ProjectStatus,
      isFeatured: false,
    },
    {
      title: 'Next.js SaaS Starter Kit',
      shortDescription: 'Complete SaaS template with auth, subscriptions, and admin panel.',
      description: `
# Next.js SaaS Starter Kit

Everything you need to launch your SaaS product.

## Features
- Authentication (Email, Google, GitHub)
- Subscription management with Stripe
- Admin dashboard
- User management
- Email templates
- Analytics

## Tech Stack
- Next.js 14
- React
- TypeScript
- Prisma
- Stripe
- Resend

## Get Started
\`\`\`bash
npm install
npm run dev
\`\`\`
      `,
      categoryId: categories[3].id,
      sellerId: sellers[3].id,
      price: 149.99,
      isFree: false,
      techStack: ['Next.js', 'React', 'TypeScript', 'Prisma', 'Stripe'],
      features: ['Auth', 'Subscriptions', 'Admin Panel', 'SEO Optimized'],
      status: 'approved' as ProjectStatus,
      isFeatured: true,
    },
    {
      title: 'AI Chatbot Integration',
      shortDescription: 'Ready-to-use AI chatbot component with OpenAI integration.',
      description: `
# AI Chatbot Integration

Add AI chat capabilities to your application in minutes.

## Features
- OpenAI GPT integration
- Customizable UI
- Conversation history
- Context awareness
- Rate limiting
- Analytics

## Installation
\`\`\`bash
npm install ai-chatbot-component
\`\`\`
      `,
      categoryId: categories[4].id,
      sellerId: sellers[4].id,
      price: 29.99,
      isFree: false,
      techStack: ['React', 'TypeScript', 'OpenAI', 'Node.js'],
      features: ['GPT-4 Support', 'Customizable', 'Analytics', 'Easy Integration'],
      status: 'approved' as ProjectStatus,
      isFeatured: false,
    },
  ];

  // Create more projects to reach 20
  const additionalProjects = [
    { title: 'Vue.js Admin Panel', category: 0, seller: 0, price: 39.99 },
    { title: 'Flutter Food Delivery App', category: 1, seller: 1, price: 89.99 },
    { title: 'Shopify Theme Modern', category: 2, seller: 2, price: 59.99 },
    { title: 'Laravel Blog System', category: 0, seller: 3, price: 24.99 },
    { title: 'Python ML Dashboard', category: 4, seller: 4, price: 69.99 },
    { title: 'React Portfolio Template', category: 0, seller: 0, price: 0 },
    { title: 'iOS SwiftUI App Template', category: 1, seller: 1, price: 49.99 },
    { title: 'WooCommerce Plugin Bundle', category: 2, seller: 2, price: 34.99 },
    { title: 'Django REST Framework Starter', category: 0, seller: 3, price: 0 },
    { title: 'Sentiment Analysis API', category: 4, seller: 4, price: 44.99 },
    { title: 'Angular Dashboard Pro', category: 0, seller: 0, price: 54.99 },
    { title: 'Kotlin Android Starter', category: 1, seller: 1, price: 29.99 },
    { title: 'Stripe Integration Kit', category: 3, seller: 2, price: 39.99 },
    { title: 'NestJS Microservices Boilerplate', category: 0, seller: 3, price: 79.99 },
    { title: 'Image Recognition API', category: 4, seller: 4, price: 99.99 },
  ];

  const projects = await Promise.all([
    ...projectData.map((p) =>
      prisma.project.create({
        data: {
          ...p,
          slug: slugify(p.title, { lower: true, strict: true }),
          tags: p.techStack.slice(0, 3),
          averageRating: 4.5,
          reviewCount: Math.floor(Math.random() * 50) + 5,
          downloadsCount: Math.floor(Math.random() * 500) + 50,
          viewsCount: Math.floor(Math.random() * 2000) + 100,
        },
      })
    ),
    ...additionalProjects.map((p) =>
      prisma.project.create({
        data: {
          title: p.title,
          slug: slugify(p.title, { lower: true, strict: true }),
          shortDescription: `${p.title} - Professional quality code ready to use.`,
          description: `# ${p.title}\n\nA professionally built project with best practices and clean code.\n\n## Features\n- Feature 1\n- Feature 2\n- Feature 3\n\n## Tech Stack\nModern technologies for optimal performance.`,
          categoryId: categories[p.category].id,
          sellerId: sellers[p.seller].id,
          price: p.price,
          isFree: p.price === 0,
          techStack: ['JavaScript', 'TypeScript', 'Node.js'],
          features: ['Clean Code', 'Documentation', 'Support'],
          tags: ['web', 'modern', 'professional'],
          status: 'approved' as ProjectStatus,
          averageRating: 4.0 + Math.random() * 1,
          reviewCount: Math.floor(Math.random() * 30) + 1,
          downloadsCount: Math.floor(Math.random() * 200) + 10,
          viewsCount: Math.floor(Math.random() * 1000) + 50,
        },
      })
    ),
  ]);

  console.log(`📦 Created ${projects.length} projects`);

  // Create some reviews
  const buyers = users.filter(u => u.role === 'buyer' || u.role === 'paid_user');
  const reviews = [];

  for (const project of projects.slice(0, 10)) {
    for (const buyer of buyers.slice(0, 2)) {
      reviews.push({
        reviewerId: buyer.id,
        projectId: project.id,
        sellerId: project.sellerId,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        comment: 'Great project! Well documented and easy to customize. Excellent support from the seller.',
        isVerifiedPurchase: true,
      });
    }
  }

  await prisma.review.createMany({
    data: reviews,
    skipDuplicates: true,
  });

  console.log(`⭐ Created ${reviews.length} reviews`);

  // Create some orders
  const orders = [];
  const paidProjects = projects.filter(p => !p.isFree);

  for (let i = 0; i < 10; i++) {
    const project = paidProjects[i % paidProjects.length];
    const buyer = buyers[i % buyers.length];
    
    orders.push({
      buyerId: buyer.id,
      projectId: project.id,
      sellerId: project.sellerId,
      amount: project.price,
      platformFee: Number(project.price) * 0.2,
      sellerEarnings: Number(project.price) * 0.8,
      status: 'completed' as const,
      downloadCount: Math.floor(Math.random() * 3),
    });
  }

  await prisma.order.createMany({
    data: orders,
  });

  console.log(`🛒 Created ${orders.length} orders`);

  console.log('✅ Seed completed successfully!');
  console.log('\n📝 Test accounts:');
  console.log('   Email: superadmin@projecthub.com | Password: Password123!');
  console.log('   Email: admin@projecthub.com | Password: Password123!');
  console.log('   Email: john.seller@example.com | Password: Password123!');
  console.log('   Email: buyer1@example.com | Password: Password123!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
