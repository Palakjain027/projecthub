# ProjectHub

A full-stack web platform that combines a GitHub-style project system, digital marketplace, and freelance platform - built with React, TypeScript, Node.js, and PostgreSQL.

## 🚀 Features

### Core Features
- **Project Marketplace**: Buy and sell digital products (code, templates, UI kits, etc.)
- **Freelance Platform**: Post custom requests and receive bids from freelancers
- **Multi-Role System**: Super Admin, Admin, Seller, Buyer, Freelancer, Free User, Paid User
- **Real-time Notifications**: Socket.IO powered real-time updates
- **Review System**: 5-star ratings with seller responses and helpful votes
- **Milestone Management**: Track freelance project progress with milestones

### Technical Features
- **Authentication**: JWT with access/refresh tokens, HTTP-only cookies
- **Role-Based Access Control**: Fine-grained permissions per user role
- **Payment Integration**: Stripe for secure payments
- **File Storage**: AWS S3 for project files and assets
- **Caching**: Redis for session and data caching
- **Rate Limiting**: Protection against API abuse
- **AI Integration**: OpenAI for content suggestions

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **TailwindCSS** with ShadCN UI components
- **Zustand** for state management
- **TanStack Query v5** for data fetching
- **React Router v6** for routing
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express.js
- **TypeScript** with strict mode
- **Prisma ORM** with PostgreSQL
- **Redis** for caching and sessions
- **Socket.IO** for real-time features
- **Bull** for job queues
- **Zod** for validation

### Infrastructure
- **Docker** & Docker Compose
- **PostgreSQL** database
- **Redis** cache
- **Nginx** reverse proxy

## 📁 Project Structure

```
ProjectHub/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API services
│   │   ├── stores/         # Zustand stores
│   │   ├── types/          # TypeScript types
│   │   └── lib/            # Utilities
│   ├── Dockerfile
│   └── nginx.conf
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── middlewares/    # Express middlewares
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── projects/
│   │   │   ├── categories/
│   │   │   ├── orders/
│   │   │   ├── reviews/
│   │   │   ├── freelance/
│   │   │   └── notifications/
│   │   ├── prisma/         # Database schema & seed
│   │   └── utils/          # Utilities
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Palakjain027/projecthub.git
cd projecthub
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Install dependencies**
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

4. **Set up the database**
```bash
cd server
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. **Start development servers**
```bash
# Backend (from server/)
npm run dev

# Frontend (from client/)
npm run dev
```

### Using Docker

```bash
# Build and start all services
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### Projects
- `GET /api/v1/projects` - List projects
- `GET /api/v1/projects/:slug` - Get project details
- `POST /api/v1/projects` - Create project
- `PATCH /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/purchases` - Get my purchases
- `GET /api/v1/orders/sales` - Get my sales
- `GET /api/v1/orders/:id/download` - Get download URL

### Reviews
- `GET /api/v1/reviews/project/:projectId` - Get project reviews
- `POST /api/v1/reviews` - Create review
- `POST /api/v1/reviews/:id/reply` - Reply to review

### Freelance
- `GET /api/v1/freelance/requests` - List custom requests
- `POST /api/v1/freelance/requests` - Create request
- `POST /api/v1/freelance/bids` - Place bid
- `POST /api/v1/freelance/bids/:id/accept` - Accept bid

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| Super Admin | Full platform control, system settings |
| Admin | User management, content moderation |
| Seller | List projects, manage sales, respond to reviews |
| Buyer | Purchase projects, leave reviews |
| Freelancer | Bid on custom requests, complete projects |
| Free User | Limited downloads, basic features |
| Paid User | Unlimited downloads, premium features |

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 📦 Building for Production

```bash
# Backend
cd server
npm run build

# Frontend
cd client
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [ShadCN UI](https://ui.shadcn.com/) for beautiful components
- [Prisma](https://prisma.io/) for excellent database tooling
- [TanStack Query](https://tanstack.com/query) for data fetching
