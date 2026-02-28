// User Types
export type UserRole = 
  | 'super_admin'
  | 'admin'
  | 'seller'
  | 'buyer'
  | 'freelancer'
  | 'free_user'
  | 'paid_user';

export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  stripeCustomerId?: string;
  stripeAccountId?: string;
  payoutEnabled?: boolean;
  createdAt: string;
  _count?: {
    projects: number;
    ordersAsBuyer: number;
    ordersAsSeller: number;
    reviewsReceived: number;
  };
}

// Project Types
export type ProjectStatus = 
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'archived';

export interface Project {
  id: string;
  sellerId: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  categoryId: string;
  tags: string[];
  price: number;
  isFree: boolean;
  status: ProjectStatus;
  thumbnailUrl?: string;
  demoVideoUrl?: string;
  sourceCodeUrl?: string;
  documentationUrl?: string;
  pptUrl?: string;
  reportUrl?: string;
  livePreviewUrl?: string;
  techStack: string[];
  features: string[];
  downloadsCount: number;
  viewsCount: number;
  averageRating: number;
  reviewCount: number;
  isFeatured: boolean;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  seller: SellerInfo;
  category: Category;
  reviews?: Review[];
}

export interface SellerInfo {
  id: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  isVerified: boolean;
  _count?: {
    projects: number;
  };
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  _count?: {
    projects: number;
  };
}

// Order Types
export type OrderStatus = 'pending' | 'completed' | 'refunded' | 'disputed';

export interface Order {
  id: string;
  buyerId: string;
  projectId: string;
  sellerId: string;
  amount: number;
  platformFee: number;
  sellerEarnings: number;
  status: OrderStatus;
  stripePaymentIntentId?: string;
  downloadCount: number;
  downloadLimit: number;
  createdAt: string;
  buyer?: User;
  project?: Project;
  seller?: User;
}

// Review Types
export interface Review {
  id: string;
  reviewerId: string;
  projectId: string;
  sellerId: string;
  rating: number;
  comment?: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  reviewer: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  project?: {
    id: string;
    title: string;
    slug: string;
  };
}

// Freelance Types
export type RequestStatus = 
  | 'open'
  | 'in_progress'
  | 'submitted'
  | 'revision'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type BidStatus = 'pending' | 'accepted' | 'rejected';

export interface CustomRequest {
  id: string;
  clientId: string;
  freelancerId?: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deadline?: string;
  status: RequestStatus;
  attachments: string[];
  finalDeliveryUrl?: string;
  createdAt: string;
  client?: User;
  freelancer?: User;
  bids?: Bid[];
  milestones?: Milestone[];
}

export interface Bid {
  id: string;
  requestId: string;
  freelancerId: string;
  amount: number;
  deliveryDays: number;
  proposal: string;
  status: BidStatus;
  createdAt: string;
  freelancer?: User;
}

export interface Milestone {
  id: string;
  requestId: string;
  title: string;
  description?: string;
  amount: number;
  dueDate?: string;
  status: 'pending' | 'completed' | 'paid';
}

// Notification Types
export type NotificationType =
  | 'order_placed'
  | 'order_completed'
  | 'project_approved'
  | 'project_rejected'
  | 'bid_received'
  | 'bid_accepted'
  | 'bid_rejected'
  | 'payment_received'
  | 'payout_completed'
  | 'review_received'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'subscription_created'
  | 'subscription_cancelled'
  | 'system_announcement';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    timestamp: string;
    pagination?: PaginationMeta;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
  meta: {
    timestamp: string;
    requestId?: string;
  };
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  fullName?: string;
  role: 'seller' | 'buyer' | 'freelancer' | 'free_user';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// Earning Types
export interface Earning {
  id: string;
  sellerId: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'paid';
  stripePayoutId?: string;
  createdAt: string;
  order?: {
    id: string;
    project: {
      title: string;
      slug: string;
    };
  };
}

// Dispute Types
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed';

export interface Dispute {
  id: string;
  orderId: string;
  raisedById: string;
  reason: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  resolution?: string;
  createdAt: string;
  order?: Order;
  raisedBy?: User;
}
