import { initialBrands, initialProducts } from '../data/catalog'
import type { AdminRecord, Brand, CartItem, DemoOrder, Product } from '../types'

export interface StoreSnapshot {
  version: 4
  products: Product[]
  brands: Brand[]
  cart: CartItem[]
  orders: DemoOrder[]
  records: AdminRecord[]
}

export interface DemoDataService {
  read(): unknown
  write(snapshot: StoreSnapshot): void
}

const STORAGE_KEY = 'saa-store-v4'

export const demoDataService: DemoDataService = {
  read: () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as unknown) : null
  },
  write: (snapshot) => {
    const previous = localStorage.getItem(STORAGE_KEY)
    const previousOrders = previous ? (JSON.parse(previous) as Partial<StoreSnapshot>).orders : undefined
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...snapshot, orders: previousOrders ?? [] }))
  },
}

export function createEmptySnapshot(): StoreSnapshot {
  return {
    version: 4,
    products: initialProducts,
    brands: initialBrands,
    cart: [],
    orders: [],
    records: [],
  }
}
