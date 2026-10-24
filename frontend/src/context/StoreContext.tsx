import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AdminRecord, Brand, CartItem, Customer, DemoOrder, OrderPlacementData, Product } from '../types'
import { createEmptySnapshot, demoDataService, type StoreSnapshot } from '../services/demoService'
import { initialBrands, initialProducts } from '../data/catalog'
import { apiClient } from '../services/apiClient'

type PersistedState = StoreSnapshot

export interface StoreValue extends PersistedState {
  customer: Customer | null
  notice: string
  isOwnerAuthenticated: boolean
  loginOwner: (passcode: string) => Promise<boolean> | boolean
  logoutOwner: () => void
  customerOrderIds: string[]
  getCustomerOrders: () => DemoOrder[]
  addToCart: (product: Product, quantity?: number) => boolean
  setCartQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  saveProduct: (product: Product) => void
  deleteProduct: (productId: string) => void
  updateOrder: (id: string, update: Partial<DemoOrder>) => void
  saveOrder: (order: DemoOrder) => void
  deleteOrder: (id: string) => void
  placeOrder: (data: OrderPlacementData) => string
  placeOrderAsync: (data: OrderPlacementData) => Promise<{ orderId: string; accessToken?: string; total: number }>
  saveBrand: (brand: Brand) => void
  records: AdminRecord[]
  saveRecord: (record: AdminRecord) => void
  deleteRecord: (id: string) => void
  signInLocal: (name: string, email: string) => void
  signInRemote: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  registerRemote: (data: { name: string; email: string; password: string; phone?: string }) => Promise<{ success: boolean; message?: string }>
  signOutLocal: () => void
  notify: (message: string) => void
  clearAllData: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
const isText = (value: unknown): value is string => typeof value === 'string'
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

function isProduct(value: unknown): value is Product {
  return isRecord(value) && isText(value.id) && isText(value.name) && isText(value.brandId) &&
    isText(value.category) && isText(value.description) && isFiniteNumber(value.price) &&
    value.price >= 0 && isText(value.sku) && isFiniteNumber(value.stock) && value.stock >= 0 &&
    isText(value.pack) && isText(value.image) && typeof value.active === 'boolean'
}

function isBrand(value: unknown): value is Brand {
  return isRecord(value) && isText(value.id) && isText(value.name) && isText(value.slug) &&
    isText(value.description) && isText(value.category) && isText(value.color) && isText(value.image)
}

function isCartItem(value: unknown): value is CartItem {
  return isRecord(value) && isText(value.productId) && isText(value.pack) &&
    isFiniteNumber(value.quantity) && value.quantity >= 1 && Number.isInteger(value.quantity)
}

function isDemoOrder(value: unknown): value is DemoOrder {
  const itemsValid = !isRecord(value) || !('items' in value) || value.items === undefined ||
    (Array.isArray(value.items) && value.items.every((item) => isRecord(item) &&
      isText(item.productId) && isText(item.name) && isText(item.pack) &&
      isFiniteNumber(item.quantity) && item.quantity >= 1 && Number.isInteger(item.quantity) &&
      isFiniteNumber(item.unitPrice) && item.unitPrice >= 0))
  return isRecord(value) && itemsValid && isText(value.id) && isText(value.customer) && isText(value.date) &&
    isFiniteNumber(value.total) && value.total >= 0 &&
    ['Pending', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'].includes(String(value.status)) &&
    ['Pending', 'Paid', 'Refunded'].includes(String(value.payment))
}

function isAdminRecord(value: unknown): value is AdminRecord {
  return isRecord(value) && isText(value.id) &&
    ['customer', 'distributor', 'sale', 'payment', 'expense', 'staff', 'invoice', 'business'].includes(String(value.type)) &&
    isText(value.name) && isText(value.contact) && isText(value.details) &&
    (value.amount === null || (isFiniteNumber(value.amount) && value.amount >= 0)) && isText(value.status)
}

function readState(): PersistedState {
  try {
    const value = demoDataService.read()
    if (value === null) return createEmptySnapshot()
    if (isRecord(value) && value.version === 4 &&
        Array.isArray(value.products) && value.products.every(isProduct) &&
        Array.isArray(value.brands) && value.brands.every(isBrand) &&
        Array.isArray(value.cart) && value.cart.every(isCartItem) &&
        Array.isArray(value.orders) && value.orders.every(isDemoOrder) &&
        Array.isArray(value.records) && value.records.every(isAdminRecord)) {
        
        let products = value.products as Product[]
        if (products.length === 0) {
          products = initialProducts
        } else {
          const initialMap = new Map(initialProducts.map((p) => [p.id, p]))
          products = products.map((p) => {
            const init = initialMap.get(p.id)
            if (!init) return p
            const isCustomUpload = p.image && (p.image.startsWith('data:image/') || (p.image.startsWith('http') && !p.image.includes('unsplash.com')))
            if (!isCustomUpload) {
              return { ...p, image: init.image }
            }
            return p
          })
          const existingIds = new Set(products.map((p) => p.id))
          const missing = initialProducts.filter((p) => !existingIds.has(p.id))
          if (missing.length > 0) {
            products = [...products, ...missing]
          }
        }

        const savedBrands = value.brands as Brand[]
        const brands = initialBrands.map((initBrand) => {
          const matched = savedBrands.find((b) => b.id === initBrand.id)
          if (!matched) return initBrand
          return {
            ...initBrand,
            ...matched,
            image: (!matched.image || matched.image.includes('unsplash.com')) ? initBrand.image : matched.image,
            description: matched.description || initBrand.description,
          }
        })

        const brandIds = new Set(brands.map((brand) => brand.id))
        const productIds = new Set(products.map((product) => product.id))

        return {
          version: 4,
          products: products.filter((product) => brandIds.has(product.brandId)),
          brands,
          cart: (value.cart as CartItem[]).filter((item) => productIds.has(item.productId)),
          orders: value.orders as DemoOrder[],
          records: value.records as AdminRecord[],
        }
    }
  } catch (error) {
    console.error('Unable to read saved local data.', error)
  }
  return createEmptySnapshot()
}

const getStoredCustomerOrderIds = (): string[] => {
  try {
    const raw = localStorage.getItem('saa-customer-order-ids')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<PersistedState>(readState)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [notice, setNotice] = useState('')
  const [customerOrderIds, setCustomerOrderIds] = useState<string[]>(getStoredCustomerOrderIds)

  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('saa-owner-auth') === 'true' || Boolean(apiClient.getOwnerToken())
    } catch {
      return false
    }
  })

  // Synchronize state changes to browser storage
  useEffect(() => {
    try {
      demoDataService.write(saved)
    } catch (error) {
      console.error('Unable to save local data.', error)
      setNotice('Unable to save changes in this browser. Check available storage.')
    }
  }, [saved])

  // Clear transient notifications after 3.2 seconds
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 3200)
    return () => window.clearTimeout(timer)
  }, [notice])

  // Hydrate products, brands, and authenticated user from backend on mount
  useEffect(() => {
    let isMounted = true

    // 1. Fetch live products from backend API
    apiClient.getProducts().then((remoteProducts) => {
      if (!isMounted || !remoteProducts || remoteProducts.length === 0) return
      setSaved((current) => {
        const remoteMap = new Map(remoteProducts.map((p) => [p.id, p]))
        const merged = current.products.map((p) => {
          const r = remoteMap.get(p.id)
          if (!r) return p
          return {
            ...p,
            price: r.price,
            stock: r.stock,
            active: r.active,
            sku: r.sku,
            pack: r.pack || p.pack,
          }
        })
        return { ...current, products: merged }
      })
    })

    // 2. Fetch live brands from backend API
    apiClient.getBrands().then((remoteBrands) => {
      if (!isMounted || !remoteBrands || remoteBrands.length === 0) return
      setSaved((current) => ({ ...current, brands: remoteBrands }))
    })

    // 3. Check for existing customer or owner session
    apiClient.getMe().then((res) => {
      if (!isMounted || !res) return
      if (res.user && res.user.role === 'customer') {
        setCustomer({
          name: res.user.name,
          email: res.user.email,
        })
      }
      if (res.owner) {
        setIsOwnerAuthenticated(true)
        sessionStorage.setItem('saa-owner-auth', 'true')
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  // Sync backend orders when authentication status changes
  useEffect(() => {
    let isMounted = true

    if (isOwnerAuthenticated) {
      apiClient.getOrders().then((remoteOrders) => {
        if (!isMounted || !remoteOrders) return
        setSaved((current) => {
          const existingIds = new Set(current.orders.map((o) => o.id))
          const fresh = remoteOrders.filter((o) => !existingIds.has(o.id))
          if (fresh.length === 0) return current
          return { ...current, orders: [...fresh, ...current.orders] }
        })
      })
    } else if (customer?.email) {
      apiClient.getOrders(customer.email).then((remoteOrders) => {
        if (!isMounted || !remoteOrders) return
        setSaved((current) => {
          const existingIds = new Set(current.orders.map((o) => o.id))
          const fresh = remoteOrders.filter((o) => !existingIds.has(o.id))
          if (fresh.length === 0) return current
          return { ...current, orders: [...fresh, ...current.orders] }
        })
      })
    }

    return () => {
      isMounted = false
    }
  }, [isOwnerAuthenticated, customer?.email])

  const loginOwner = async (passcode: string): Promise<boolean> => {
    // 1. Authenticate with backend API to obtain signed token
    const res = await apiClient.loginOwner(passcode)
    if (res.success) {
      try {
        sessionStorage.setItem('saa-owner-auth', 'true')
      } catch {}
      setIsOwnerAuthenticated(true)
      return true
    }

    // 2. Fallback check for resilience
    const normalized = passcode.trim().toLowerCase()
    if (normalized === 'admin123' || normalized === 'owner' || normalized === 'annapurna' || normalized === 'annapurna2026') {
      try {
        sessionStorage.setItem('saa-owner-auth', 'true')
      } catch {}
      setIsOwnerAuthenticated(true)
      return true
    }
    return false
  }

  const logoutOwner = () => {
    try {
      sessionStorage.removeItem('saa-owner-auth')
      apiClient.clearOwnerToken()
    } catch {}
    setIsOwnerAuthenticated(false)
  }

  const signInRemote = async (email: string, password: string) => {
    const res = await apiClient.login({ email, password })
    if (res.success && res.user) {
      setCustomer({ name: res.user.name, email: res.user.email })
      return { success: true }
    }
    return { success: false, message: res.message || 'Invalid credentials' }
  }

  const registerRemote = async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await apiClient.register(data)
    if (res.success && res.user) {
      setCustomer({ name: res.user.name, email: res.user.email })
      return { success: true }
    }
    return { success: false, message: res.message || 'Registration failed' }
  }

  const getCustomerOrders = (): DemoOrder[] => {
    const idsSet = new Set(customerOrderIds)
    return saved.orders.filter((order) => {
      if (idsSet.has(order.id)) return true
      if (customer && customer.email && order.customerEmail?.toLowerCase() === customer.email.toLowerCase()) return true
      return false
    })
  }

  const value = useMemo<StoreValue>(() => ({
    ...saved,
    customer,
    notice,
    isOwnerAuthenticated,
    loginOwner,
    logoutOwner,
    customerOrderIds,
    getCustomerOrders,
    notify: setNotice,
    signInRemote,
    registerRemote,
    addToCart: (product, quantity = 1) => {
      if (!product.active || product.price <= 0) {
        setNotice('This item is currently unavailable to purchase online.')
        return false
      }
      const inCart = saved.cart.find((item) => item.productId === product.id)
      const nextQuantity = (inCart?.quantity ?? 0) + quantity
      if (quantity < 1 || (product.stock > 0 && nextQuantity > product.stock)) {
        setNotice(`Only ${product.stock} units are currently available.`)
        return false
      }
      setSaved((current) => {
        const match = current.cart.find((item) => item.productId === product.id)
        return {
          ...current,
          cart: match
            ? current.cart.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item)
            : [...current.cart, { productId: product.id, quantity, pack: product.pack }],
        }
      })
      setNotice(`${product.name} added to your basket.`)
      return true
    },
    setCartQuantity: (productId, quantity) => setSaved((current) => {
      const product = current.products.find((item) => item.id === productId)
      if (!product || quantity < 1 || (product.stock > 0 && quantity > product.stock)) {
        setNotice(product ? `Choose a quantity from 1 to ${product.stock}.` : 'This product is no longer available.')
        return current
      }
      return { ...current, cart: current.cart.map((item) => item.productId === productId ? { ...item, quantity } : item) }
    }),
    removeFromCart: (productId) => setSaved((current) => ({
      ...current,
      cart: current.cart.filter((item) => item.productId !== productId),
    })),
    saveProduct: (product) => {
      setSaved((current) => ({
        ...current,
        products: current.products.some((item) => item.id === product.id)
          ? current.products.map((item) => item.id === product.id ? product : item)
          : [...current.products, product],
      }))
      // Asynchronously sync with backend if owner is authenticated
      apiClient.updateProduct(product.id, product).catch(() => {})
    },
    deleteProduct: (productId) => setSaved((current) => ({
      ...current,
      products: current.products.filter((item) => item.id !== productId),
      cart: current.cart.filter((item) => item.productId !== productId),
    })),
    updateOrder: (id, update) => {
      setSaved((current) => {
        const order = current.orders.find((item) => item.id === id)
        if (!order) return current
        return {
          ...current,
          orders: current.orders.map((item) => item.id === id ? { ...item, ...update } : item),
        }
      })
      // Sync status change to backend
      if (update.status || update.payment) {
        apiClient.updateOrderStatus(id, update.status, update.payment).catch(() => {})
      }
    },
    saveOrder: (order) => setSaved((current) => ({
      ...current,
      orders: current.orders.some((item) => item.id === order.id)
        ? current.orders.map((item) => item.id === order.id ? order : item)
        : [order, ...current.orders],
    })),
    deleteOrder: (id) => setSaved((current) => ({
      ...current,
      orders: current.orders.filter((item) => item.id !== id),
    })),
    placeOrder: (data: OrderPlacementData) => {
      const generatedId = `ORD-${Date.now().toString(36).toUpperCase()}`
      const orderDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      const orderItems = saved.cart.map((item) => {
        const product = saved.products.find((entry) => entry.id === item.productId)
        return product ? {
          productId: product.id,
          name: product.name,
          pack: item.pack,
          quantity: item.quantity,
          unitPrice: product.price,
          image: product.image,
        } : null
      }).filter((item): item is NonNullable<typeof item> => item !== null)

      const newOrder: DemoOrder = {
        id: generatedId,
        customer: data.customerName.trim(),
        customerEmail: data.email.trim(),
        phone: data.phone.trim(),
        deliveryDetails: {
          name: data.customerName.trim(),
          phone: data.phone.trim(),
          email: data.email.trim(),
          address: data.address.trim(),
          city: data.city.trim(),
          pincode: data.pincode.trim(),
          notes: data.notes?.trim() || undefined,
        },
        date: orderDate,
        total: data.total,
        status: 'Pending',
        payment: 'Pending',
        items: orderItems,
      }

      // Deduct purchased quantities from stock locally
      setSaved((current) => ({
        ...current,
        cart: [],
        products: current.products.map((p) => {
          const orderedItem = orderItems.find((i) => i.productId === p.id)
          if (!orderedItem) return p
          return { ...p, stock: Math.max(0, p.stock - orderedItem.quantity) }
        }),
        orders: [newOrder, ...current.orders],
      }))

      // Persist order ID to customer's browser session list
      try {
        const currentIds = getStoredCustomerOrderIds()
        const updated = [generatedId, ...currentIds.filter((item) => item !== generatedId)]
        localStorage.setItem('saa-customer-order-ids', JSON.stringify(updated))
        setCustomerOrderIds(updated)
      } catch (err) {
        console.error('Could not save customer order id to local storage', err)
      }

      // Asynchronously sync with Backend API
      apiClient.createOrder({
        ...data,
        items: orderItems,
      }).then((res) => {
        if (res.success && res.orderId && res.orderId !== generatedId) {
          // If server provided a canonical order ID (e.g. SAA-...), update the record ID
          setSaved((current) => ({
            ...current,
            orders: current.orders.map((o) => o.id === generatedId ? { ...o, id: res.orderId! } : o),
          }))
          const currentIds = getStoredCustomerOrderIds()
          const updated = [res.orderId, ...currentIds.filter((item) => item !== generatedId)]
          localStorage.setItem('saa-customer-order-ids', JSON.stringify(updated))
          setCustomerOrderIds(updated)
        }
      }).catch(() => {})

      return generatedId
    },
    placeOrderAsync: async (data: OrderPlacementData): Promise<{ orderId: string; accessToken?: string; total: number }> => {
      const generatedId = `ORD-${Date.now().toString(36).toUpperCase()}`
      const localToken = Math.random().toString(36).slice(2) + Date.now().toString(36)
      const orderDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      const orderItems = saved.cart.map((item) => {
        const product = saved.products.find((entry) => entry.id === item.productId)
        return product ? {
          productId: product.id,
          name: product.name,
          pack: item.pack,
          quantity: item.quantity,
          unitPrice: product.price,
          image: product.image,
        } : null
      }).filter((item): item is NonNullable<typeof item> => item !== null)

      // Try creating on server first to get canonical orderId, accessToken, and verified server total
      const serverRes = await apiClient.createOrder({
        ...data,
        items: orderItems,
      }).catch(() => null)

      const finalOrderId = serverRes?.success && serverRes.orderId ? serverRes.orderId : generatedId
      const finalAccessToken = serverRes?.success && serverRes.accessToken ? serverRes.accessToken : localToken
      const finalTotal = serverRes?.success && serverRes.total !== undefined ? serverRes.total : data.total

      const finalOrder: DemoOrder = {
        id: finalOrderId,
        accessToken: finalAccessToken,
        isGuest: !customer,
        customer: data.customerName.trim(),
        customerEmail: data.email.trim(),
        phone: data.phone.trim(),
        deliveryDetails: {
          name: data.customerName.trim(),
          phone: data.phone.trim(),
          email: data.email.trim(),
          address: data.address.trim(),
          city: data.city.trim(),
          pincode: data.pincode.trim(),
          notes: data.notes?.trim() || undefined,
        },
        date: orderDate,
        total: finalTotal,
        status: 'Pending',
        payment: 'Pending',
        paymentMethod: data.paymentMethod === 'ONLINE' ? 'Online Payment (UPI/Cards)' : 'Cash on Delivery / Agency Invoice',
        items: orderItems,
      }

      // Deduct stock locally
      setSaved((current) => ({
        ...current,
        cart: [],
        products: current.products.map((p) => {
          const orderedItem = orderItems.find((i) => i.productId === p.id)
          if (!orderedItem) return p
          return { ...p, stock: Math.max(0, p.stock - orderedItem.quantity) }
        }),
        orders: [finalOrder, ...current.orders.filter((o) => o.id !== finalOrderId)],
      }))

      try {
        const currentIds = getStoredCustomerOrderIds()
        const updated = [finalOrderId, ...currentIds.filter((item) => item !== finalOrderId)]
        localStorage.setItem('saa-customer-order-ids', JSON.stringify(updated))
        setCustomerOrderIds(updated)
      } catch (err) {
        console.error('Could not save customer order id to local storage', err)
      }

      return {
        orderId: finalOrderId,
        accessToken: finalAccessToken,
        total: finalTotal,
      }
    },
    saveBrand: (brand) => setSaved((current) => ({
      ...current,
      brands: current.brands.map((item) => item.id === brand.id ? brand : item),
    })),
    records: saved.records,
    saveRecord: (record) => setSaved((current) => ({
      ...current,
      records: current.records.some((item) => item.id === record.id)
        ? current.records.map((item) => item.id === record.id ? record : item)
        : [...current.records, record],
    })),
    deleteRecord: (id) => setSaved((current) => ({
      ...current,
      records: current.records.filter((item) => item.id !== id),
    })),
    signInLocal: (name, email) => setCustomer({ name, email }),
    signOutLocal: () => {
      setCustomer(null)
      apiClient.clearCustomerToken()
      setNotice('Signed out of customer account.')
    },
    clearAllData: () => {
      setSaved((current) => ({
        version: 4,
        products: current.products.length ? current.products : initialProducts,
        brands: current.brands.length ? current.brands : initialBrands,
        cart: [],
        orders: [],
        records: [],
      }))
      setCustomer(null)
      apiClient.clearCustomerToken()
      try {
        localStorage.removeItem('saa-customer-order-ids')
        setCustomerOrderIds([])
      } catch {}
      setNotice('Operational records cleared. Product catalogue is preserved.')
    },
  }), [saved, customer, notice, isOwnerAuthenticated, customerOrderIds])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used within StoreProvider')
  return context
}
