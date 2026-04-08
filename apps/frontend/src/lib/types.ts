// ============================================================
// Shared Types for AdMax Hoarding Marketplace
// ============================================================

export type Role = 'USER' | 'ADMIN';

export type ListingType = 'HOARDING' | 'KIOSK' | 'GANTRY' | 'TRANSIT';

export type ListingStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'LIVE' | 'REJECTED';

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  roles: Role[];
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface ListingImage {
  id: string;
  url: string;
  listingId: string;
}

export interface Listing {
  id: string;
  ownerId: string;
  owner?: User;
  title: string;
  description: string;
  type: ListingType;
  price: number;
  landmarks: string[];
  latitude: number;
  longitude: number;
  images: ListingImage[];
  status: ListingStatus;
  isFeatured: boolean;
  bookings?: Booking[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  listingId: string;
  userId: string;
  startDate: string;
  endDate: string;
  listing?: Listing;
  user?: User;
  createdAt: string;
}

export interface Offer {
  id: string;
  senderId: string;
  receiverId: string;
  sender?: User;
  receiver?: User;
  listings: Listing[];
  totalPrice: number;
  negotiatedPrice?: number;
  status: OfferStatus;
  conversationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  offerId?: string;
  offer?: Offer;
  listingId?: string;
  listing?: Listing;
  participants: User[];
  messages: ChatMessage[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: User;
  content: string;
  createdAt: string;
}

export interface AdminApproval {
  id: string;
  userId?: string;
  listingId?: string;
  status: ApprovalStatus;
  reason?: string;
  user?: User;
  listing?: Listing;
  createdAt: string;
}

export interface FeaturedListing {
  id: string;
  listingId: string;
  startDate: string;
  endDate: string;
  listing?: Listing;
}

// API request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  phone?: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateListingRequest {
  title: string;
  description: string;
  type: ListingType;
  price: number;
  landmarks: string[];
  latitude: number;
  longitude: number;
  availableFrom?: string;
  availableTo?: string;
}

export interface CreateOfferRequest {
  listingIds: string[];
  totalPrice: number;
  negotiatedPrice?: number;
  receiverId: string;
}

export interface ListingsFilter {
  search?: string;
  type?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  landmarks?: string[];
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalBookings: number;
  totalDeals: number;
  estimatedRevenue: number;
}

export const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: 'HOARDING', label: 'Hoarding' },
  { value: 'KIOSK', label: 'Kiosk' },
  { value: 'GANTRY', label: 'Gantry' },
  { value: 'TRANSIT', label: 'Transit Media' },
];

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  DRAFT: 'Draft',
  PENDING: 'Pending Approval',
  APPROVED: 'Approved',
  LIVE: 'Live',
  REJECTED: 'Rejected',
};

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  COUNTERED: 'Countered',
};
