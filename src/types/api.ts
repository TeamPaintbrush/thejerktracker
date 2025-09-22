import { Order, OrderItem, Restaurant, User, OrderStatus, OrderType, UserRole } from '@prisma/client'

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  error: string
}

export interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface OrdersResponse {
  orders: OrderWithRelations[]
  pagination: PaginationInfo
}

export interface RestaurantOrdersResponse {
  restaurant: {
    id: string
    name: string
  }
  orders: OrderWithRelations[]
  pagination: PaginationInfo
}

// Extended types with relations
export interface OrderWithRelations extends Order {
  items: OrderItem[]
  restaurant: {
    id: string
    name: string
    phone?: string | null
    address?: string | null
  }
  createdBy?: {
    id: string
    name: string
    email: string
  } | null
  updatedBy?: {
    id: string
    name: string
    email: string
  } | null
}

export interface RestaurantWithRelations extends Restaurant {
  users: {
    id: string
    name: string
    email: string
    role: UserRole
    createdAt: Date
  }[]
  orders: {
    id: string
    orderNumber: string
    customerName: string
    status: OrderStatus
    totalAmount: number
    createdAt: Date
  }[]
  _count: {
    orders: number
    users: number
  }
}

export interface RestaurantWithCounts extends Restaurant {
  _count: {
    orders: number
    users: number
  }
}

// Request body types
export interface CreateOrderRequest {
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  totalAmount: number
  orderType?: OrderType
  notes?: string
  specialRequests?: string
  deliveryAddress?: string
  restaurantId: string
  items: CreateOrderItemRequest[]
  createdById?: string
}

export interface CreateOrderItemRequest {
  name: string
  quantity: number
  price: number
  notes?: string
}

export interface UpdateOrderRequest {
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  totalAmount?: number
  status?: OrderStatus
  orderType?: OrderType
  notes?: string
  specialRequests?: string
  deliveryAddress?: string
  estimatedTime?: string
  actualTime?: string
  items?: CreateOrderItemRequest[]
  updatedById?: string
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus
  updatedById?: string
  estimatedTime?: string
  actualTime?: string
}

export interface CreateRestaurantRequest {
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  website?: string
  description?: string
  logoUrl?: string
}

export interface UpdateRestaurantRequest {
  name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  website?: string
  description?: string
  logoUrl?: string
}

// Query parameter types
export interface OrderQueryParams {
  restaurantId?: string
  status?: OrderStatus
  page?: string
  limit?: string
}

export interface RestaurantOrderQueryParams {
  status?: OrderStatus
  page?: string
  limit?: string
  startDate?: string
  endDate?: string
}

export interface ExportQueryParams {
  restaurantId?: string
  startDate?: string
  endDate?: string
  status?: OrderStatus
}

// Prisma where clause types
export interface OrderWhereClause {
  restaurantId?: string
  status?: OrderStatus
  createdAt?: {
    gte?: Date
    lte?: Date
  }
}