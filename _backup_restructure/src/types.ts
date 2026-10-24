export interface Brand {
  id: string
  name: string
  slug: string
  description: string
  category: string
  color: string
  image: string
}

export interface Product {
  id: string
  name: string
  brandId: string
  category: string
  description: string
  price: number
  sku: string
  stock: number
  pack: string
  image: string
  active: boolean
}

export interface CartItem {
  productId: string
  quantity: number
  pack: string
}

export interface DemoOrderItem {
  productId: string
  name: string
  pack: string
  quantity: number
  unitPrice: number
  image?: string
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Dispatched' | 'Delivered' | 'Cancelled'
export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded'

export interface CustomerDeliveryDetails {
  name: string
  phone: string
  email: string
  address: string
  city: string
  pincode: string
  notes?: string
}

export interface DemoOrder {
  id: string
  customer: string
  customerEmail?: string
  phone?: string
  deliveryDetails?: CustomerDeliveryDetails
  date: string
  total: number
  status: OrderStatus
  payment: PaymentStatus
  items?: DemoOrderItem[]
}

export interface OrderPlacementData {
  total: number
  customerName: string
  phone: string
  email: string
  address: string
  city: string
  pincode: string
  notes?: string
}

export type AdminRecordType = 'customer' | 'distributor' | 'sale' | 'payment' | 'expense' | 'staff' | 'invoice' | 'business'

export interface AdminRecord {
  id: string
  type: AdminRecordType
  name: string
  contact: string
  details: string
  amount: number | null
  status: string
}

export interface Customer {
  name: string
  email: string
}
