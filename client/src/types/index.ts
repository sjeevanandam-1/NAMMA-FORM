export type Role = 'FARMER' | 'BUYER' | 'GOVERNMENT_OFFICIAL' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: Role;
  isVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  farmerProfile?: FarmerProfile;
  buyerProfile?: BuyerProfile;
  govProfile?: GovernmentProfile;
  trustScore?: TrustScore;
}

export interface FarmerProfile {
  id: string;
  userId: string;
  state: string;
  district: string;
  village: string;
  farmLocation: string;
  landAreaAcre: number;
  soilType: string;
  irrigationType: string;
  mainCrops: string;
  kycStatus: string;
  farms?: Farm[];
}

export interface BuyerProfile {
  id: string;
  userId: string;
  companyName: string;
  businessType: string;
  gstNumber?: string;
  state: string;
  district: string;
  location: string;
  requiredCrops: string;
  kycStatus: string;
}

export interface GovernmentProfile {
  id: string;
  userId: string;
  officialId: string;
  department: string;
  designation: string;
  state: string;
  district?: string;
}

export interface Farm {
  id: string;
  farmerProfileId: string;
  farmName: string;
  location: string;
  latitude?: number;
  longitude?: number;
  landAreaAcre: number;
  soilType: string;
  irrigation: string;
  crops: string;
  createdAt: string;
}

export interface Crop {
  id: string;
  name: string;
  category: string;
  variety?: string;
  description: string;
  season: string;
  idealSoil: string;
  gestationPeriodDays: number;
  imageUrl?: string;
}

export interface CropImage {
  id: string;
  listingId: string;
  url: string;
  filename: string;
  isPrimary: boolean;
}

export interface CropListing {
  id: string;
  farmerId: string;
  farmId?: string;
  cropId: string;
  variety: string;
  quantityKg: number;
  availableQuantityKg: number;
  unit: string;
  expectedPricePerKg: number;
  minAcceptablePrice: number;
  harvestDate: string;
  qualityGrade: 'GRADE_A' | 'GRADE_B' | 'GRADE_C';
  description: string;
  location: string;
  district: string;
  state: string;
  status: 'DRAFT' | 'ACTIVE' | 'RESERVED' | 'SOLD' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
  crop: Crop;
  farm?: Farm;
  images: CropImage[];
  farmer: {
    id: string;
    name: string;
    isVerified: boolean;
    avatarUrl?: string;
    trustScore?: TrustScore;
    farmerProfile?: {
      state: string;
      district: string;
      village: string;
      soilType: string;
      irrigationType: string;
      farmLocation?: string;
    };
    reviewsReceived?: Review[];
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  farmerId: string;
  listingId: string;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
  transportCost: number;
  taxAmount: number;
  grandTotal: number;
  status:
    | 'PENDING'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'CONFIRMED'
    | 'PACKED'
    | 'READY_FOR_PICKUP'
    | 'PICKED_UP'
    | 'IN_TRANSIT'
    | 'DELIVERED'
    | 'COMPLETED'
    | 'CANCELLED';
  deliveryAddress: string;
  deliveryDate?: string;
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
  listing: CropListing;
  buyer: {
    id: string;
    name: string;
    phone: string;
    buyerProfile?: BuyerProfile;
  };
  farmer: {
    id: string;
    name: string;
    phone: string;
    farmerProfile?: FarmerProfile;
  };
  payment?: Payment;
  delivery?: Delivery;
  reviews?: Review[];
}

export interface Payment {
  id: string;
  orderId: string;
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'PENDING' | 'AUTHORIZED' | 'PAID' | 'FAILED' | 'REFUNDED';
  provider: string;
  paidAt?: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  vehicleType: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  trackingNumber: string;
  estimatedCost: number;
  pickupLocation: string;
  deliveryLocation: string;
  status: 'REQUESTED' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED';
}

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  role: 'BUYER_TO_FARMER' | 'FARMER_TO_BUYER';
  createdAt: string;
  reviewer?: {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
  };
}

export interface TrustScore {
  id: string;
  userId: string;
  score: number;
  verifiedIdentityScore: number;
  completedOrdersScore: number;
  ratingScore: number;
  explanation: string;
}

export interface DiseaseScan {
  id: string;
  farmerId: string;
  cropName: string;
  imageUrl: string;
  diseaseName: string;
  confidenceScore: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  observedSymptoms: string;
  possibleCauses: string;
  status: 'ACTIVE' | 'RESOLVED' | 'RECURRING';
  followUpStatus?: 'IMPROVING' | 'STABLE' | 'POSSIBLY_WORSENING' | 'UNCERTAIN';
  createdAt: string;
  recommendation?: DiseaseRecommendation;
}

export interface DiseaseRecommendation {
  id: string;
  scanId: string;
  diseaseName: string;
  organicTreatment: string;
  chemicalTreatment: string;
  safetyGuideline: string;
  expertConsultationNote: string;
  sourceName: string;
  verificationDate: string;
}

export interface MarketPrice {
  id: string;
  cropName: string;
  marketName: string;
  district: string;
  state: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  unit: string;
  recordDate: string;
  source: string;
  isDemoData: boolean;
}

export interface AgroWeatherForecast {
  district: string;
  state: string;
  temperature: number;
  humidity: number;
  rainfallMm: number;
  rainProbability: number;
  windSpeedKmh: number;
  condition: string;
  isDemoData: boolean;
  forecast: Array<{
    day: string;
    tempMax: number;
    tempMin: number;
    condition: string;
    rainProb: number;
    rainfallMm: number;
  }>;
  actionableAlerts: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  metadata?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  farmerId: string;
  buyerId: string;
  listingId?: string;
  updatedAt: string;
  farmer: { id: string; name: string; avatarUrl?: string; role: string };
  buyer: { id: string; name: string; avatarUrl?: string; role: string };
  listing?: CropListing;
  messages: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: { id: string; name: string; avatarUrl?: string; role: string };
}
