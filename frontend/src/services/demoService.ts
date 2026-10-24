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
const LEGACY_KEYS = ['saa-store-v3', 'saa-local-store-v2', 'saa-demo-store-v1']

export const demoDataService: DemoDataService = {
  read: () => {
    // Clear old legacy keys
    for (const key of LEGACY_KEYS) {
      localStorage.removeItem(key)
    }
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as unknown) : null
  },
  write: (snapshot) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
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
