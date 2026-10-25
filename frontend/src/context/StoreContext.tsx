import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { AdminRecord, Brand, CartItem, Customer, DemoOrder, OrderPlacementData, Product } from '../types'
import { createEmptySnapshot, demoDataService, type StoreSnapshot } from '../services/demoService'
import { initialBrands, initialProducts } from '../data/catalog'
import { apiClient } from '../services/apiClient'

type PersistedState = StoreSnapshot

export interface StoreValue extends PersistedState {
  customer: Customer | null
  notice: string
  orderSyncError: string
  isOwnerAuthenticated: boolean
  loginOwner: (passcode: string) => Promise<boolean> | boolean
  logoutOwner: () => void
  customerOrderIds: string[]
  getCustomerOrders: () => DemoOrder[]
  refreshOwnerOrders: () => Promise<DemoOrder[] | null>
  addToCart: (product: Product, quantity?: number) => boolean
  setCartQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  saveProduct: (product: Product) => void
  deleteProduct: (productId: string) => void
  updateOrder: (id: string, update: Partial<DemoOrder>) => void
  placeOrderAsync: (data: OrderPlacementData) => Promise<{ orderId: string; accessToken?: string; total: number }>
  submitUpiPayment: (orderId: string, utrNumber: string, notes?: string) => Promise<{ success: boolean; message?: string }>
  verifyUpiPayment: (orderId: string, action: 'approve' | 'reject', rejectReason?: string) => Promise<{ success: boolean; message?: string }>
  saveBrand: (brand: Brand) => void
  records: AdminRecord[]
  saveRecord: (record: AdminRecord) => void
  deleteRecord: (id: string) => void
  signInRemote: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  registerRemote: (data: { name: string; email: string; password: string; phone?: string }) => Promise<{ success: boolean; message?: string }>
  signOutLocal: () => void
  notify: (message: string) => void
  clearAllData: () => Promise<boolean>
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
    ['Pending', 'Paid', 'Failed', 'Refunded', 'Pending Verification'].includes(String(value.payment))
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
          orders: [],
          records: value.records as AdminRecord[],
        }
    }
  } catch (error) {
    console.error('Unable to read saved local data.', error)
  }
  return createEmptySnapshot()
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<PersistedState>(readState)
  const [customer, setCustomer] = useState<Customer | null>(() => {
    try {
      const raw = localStorage.getItem('saa-customer-profile')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [customerOrders, setCustomerOrders] = useState<DemoOrder[]>([])
  const [notice, setNotice] = useState('')
  const [orderSyncError, setOrderSyncError] = useState('')
  const orderIdempotencyKey = useRef<string | null>(null)

  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(apiClient.getOwnerToken())
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
      if (!isMounted) return
      if (res && res.user && res.user.role === 'customer') {
        const c = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone,
        }
        setCustomer(c)
        try {
          localStorage.setItem('saa-customer-profile', JSON.stringify(c))
        } catch {}
      } else if (res && res.owner) {
        setIsOwnerAuthenticated(true)
      } else {
        if (!apiClient.getCustomerToken()) {
          setCustomer(null)
          try {
            localStorage.removeItem('saa-customer-profile')
          } catch {}
        }
        if (!apiClient.getOwnerToken()) {
          setIsOwnerAuthenticated(false)
        }
      }
    })
    if (apiClient.getOwnerToken()) {
      setIsOwnerAuthenticated(true)
      apiClient.getOwnerOrders().then((remoteOrders) => {
        if (!isMounted || !remoteOrders) return
        setSaved((current) => ({ ...current, orders: remoteOrders }))
      })
    }

    return () => {
      isMounted = false
    }
  }, [])

  // Poll the authoritative order API so owner and customer views stay current across devices.
  useEffect(() => {
    let isMounted = true
    let isLoading = false

    const loadOrders = async () => {
      if (document.visibilityState !== 'visible' || isLoading) return
      isLoading = true
      try {
        let syncError = ''
        if (isOwnerAuthenticated) {
          const remoteOrders = await apiClient.getOwnerOrders()
          if (!isMounted) return
          if (!remoteOrders) {
            syncError = 'Unable to sync orders with the backend. Retrying automatically.'
          } else {
            setSaved((current) => ({ ...current, orders: remoteOrders }))
          }
        }
        if (customer?.id) {
          const remoteOrders = await apiClient.getOrders()
          if (!isMounted) return
          if (!remoteOrders) {
            syncError = 'Unable to sync your orders with the backend. Retrying automatically.'
          } else {
            setCustomerOrders(remoteOrders)
          }
        }
        setOrderSyncError(syncError)
      } finally {
        isLoading = false
      }
    }

    void loadOrders()
    const interval = window.setInterval(() => void loadOrders(), 5000)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void loadOrders()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      isMounted = false
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [isOwnerAuthenticated, customer?.id])

  const refreshOwnerOrders = async (): Promise<DemoOrder[] | null> => {
    const remote = await apiClient.getOwnerOrders()
    if (remote) {
      setSaved((current) => ({ ...current, orders: remote }))
      setOrderSyncError('')
      return remote
    }
    setOrderSyncError('Unable to sync orders with the backend. Check the connection and retry.')
    return null
  }

  const loginOwner = async (passcode: string): Promise<boolean> => {
    // 1. Authenticate with backend API to obtain signed token
    const res = await apiClient.loginOwner(passcode)
    if (res.success) {
      setIsOwnerAuthenticated(true)
      const remote = await apiClient.getOwnerOrders()
      if (remote) {
        setSaved((current) => ({ ...current, orders: remote }))
      }
      return true
    }

    return false
  }

  const logoutOwner = () => {
    apiClient.clearOwnerToken()
    setIsOwnerAuthenticated(false)
  }

  const signInRemote = async (email: string, password: string) => {
    const res = await apiClient.login({ email, password })
    if (res.success && res.user) {
      const c = { id: res.user.id, name: res.user.name, email: res.user.email, phone: res.user.phone }
      setCustomer(c)
      try {
        localStorage.setItem('saa-customer-profile', JSON.stringify(c))
      } catch {}
      const remoteOrders = await apiClient.getOrders()
      if (remoteOrders) {
        setCustomerOrders(remoteOrders)
      }
      return { success: true }
    }
    return { success: false, message: res.message || 'Invalid credentials' }
  }

  const registerRemote = async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await apiClient.register(data)
    if (res.success && res.user) {
      const c = { id: res.user.id, name: res.user.name, email: res.user.email, phone: res.user.phone }
      setCustomer(c)
      try {
        localStorage.setItem('saa-customer-profile', JSON.stringify(c))
      } catch {}
      setCustomerOrders([])
      return { success: true }
    }
    return { success: false, message: res.message || 'Registration failed' }
  }

  const getCustomerOrders = (): DemoOrder[] => {
    if (!customer) return []
    return customerOrders
  }

  const value = useMemo<StoreValue>(() => ({
    ...saved,
    customer,
    notice,
    orderSyncError,
    isOwnerAuthenticated,
    loginOwner,
    logoutOwner,
    customerOrderIds: customerOrders.map((o) => o.id),
    getCustomerOrders,
    refreshOwnerOrders,
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
      if (update.status) {
        void apiClient.updateOrderStatus(id, update.status).then(async (success) => {
          if (!success) {
            setOrderSyncError('Unable to save the order status. Please retry.')
            return
          }
          setSaved((current) => ({
            ...current,
            orders: current.orders.map((item) => item.id === id
              ? { ...item, status: update.status!, updatedAt: new Date().toISOString() }
              : item),
          }))
          await refreshOwnerOrders()
        })
      }
    },
    placeOrderAsync: async (data: OrderPlacementData): Promise<{ orderId: string; accessToken?: string; total: number }> => {
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

      if (!customer?.id) throw new Error('Please sign in before placing your order.')
      if (!orderItems.length) throw new Error('Your basket contains no available products.')
      if (!orderIdempotencyKey.current) orderIdempotencyKey.current = crypto.randomUUID()
      const serverRes = await apiClient.createOrder(
        { ...data, items: orderItems },
        orderIdempotencyKey.current
      )
      if (!serverRes.success || !serverRes.orderId) {
        throw new Error(serverRes.message || 'The order could not be saved. Your basket is unchanged; please retry.')
      }
      orderIdempotencyKey.current = null
      const finalOrderId = serverRes.orderId
      const finalAccessToken = serverRes.accessToken
      const finalTotal = serverRes.total ?? data.total
      const customerUserId = customer.id

      const isUpi = data.paymentMethod === 'UPI' || data.paymentMethod === 'UPI / PhonePe'
      const isOnline = data.paymentMethod === 'ONLINE'
      const paymentMethodLabel = isOnline
        ? 'Online Payment (UPI/Cards)'
        : isUpi
        ? 'UPI / PhonePe'
        : 'Cash on Delivery / Agency Invoice'

      const paymentDetails = isUpi ? {
        provider: 'phonepe_upi',
        payeeName: 'GAGAN DEEP',
        payeeUpiNumber: '6360074675',
        utrNumber: data.utrNumber ? data.utrNumber.trim() : '',
        verificationStatus: 'Pending Verification',
        submittedAt: new Date().toISOString(),
      } : undefined

      const finalOrder: DemoOrder = {
        id: finalOrderId,
        accessToken: finalAccessToken,
        user: customerUserId,
        isGuest: false,
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
        paymentMethod: paymentMethodLabel,
        paymentDetails,
        items: orderItems,
      }

      // Add strictly to customer's own order list
      setCustomerOrders((prev) => [finalOrder, ...prev.filter((o) => o.id !== finalOrderId)])

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
      setOrderSyncError('')

      return {
        orderId: finalOrderId,
        accessToken: finalAccessToken,
        total: finalTotal,
      }
    },
    submitUpiPayment: async (orderId: string, utrNumber: string, notes?: string) => {
      const res = await apiClient.submitUpiPayment(orderId, utrNumber, notes)
      if (res.success) {
        const updater = (o: DemoOrder): DemoOrder => {
          if (o.id === orderId) {
            return {
              ...o,
              paymentMethod: 'UPI / PhonePe',
              payment: 'Pending',
              paymentDetails: {
                ...(o.paymentDetails || {}),
                provider: 'phonepe_upi',
                payeeName: 'GAGAN DEEP',
                payeeUpiNumber: '6360074675',
                utrNumber: utrNumber.trim(),
                verificationStatus: 'Pending Verification',
                submittedAt: new Date().toISOString(),
                adminNotes: notes ? notes.trim() : '',
              },
            }
          }
          return o
        }
        setCustomerOrders((prev) => prev.map(updater))
        setSaved((current) => ({
          ...current,
          orders: current.orders.map(updater),
        }))
        return { success: true, message: res.message || 'UPI reference submitted. Payment pending verification.' }
      }
      return { success: false, message: res.message || 'Failed to submit UPI reference.' }
    },
    verifyUpiPayment: async (orderId: string, action: 'approve' | 'reject', rejectReason?: string) => {
      const res = await apiClient.verifyUpiPayment(orderId, action, rejectReason)
      if (res.success) {
        const updater = (o: DemoOrder): DemoOrder => {
          if (o.id === orderId) {
            return {
              ...o,
              payment: action === 'approve' ? 'Paid' : 'Failed',
              paymentDetails: {
                ...(o.paymentDetails || {}),
                verificationStatus: action === 'approve' ? 'Verified' : 'Rejected',
                verifiedAt: new Date().toISOString(),
                verifiedBy: 'Owner',
                paidAt: action === 'approve' ? new Date().toISOString() : undefined,
                failureReason: action === 'reject' ? (rejectReason || 'Payment rejected by owner') : '',
              },
            }
          }
          return o
        }
        setCustomerOrders((prev) => prev.map(updater))
        setSaved((current) => ({
          ...current,
          orders: current.orders.map(updater),
        }))
        return { success: true, message: res.message || 'Payment updated successfully.' }
      }
      return { success: false, message: res.message || 'Failed to update payment status.' }
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
    signOutLocal: () => {
      setCustomer(null)
      setCustomerOrders([])
      apiClient.clearCustomerToken()
      try {
        localStorage.removeItem('saa-customer-profile')
      } catch {}
      setNotice('Signed out of customer account.')
    },
    clearAllData: async (): Promise<boolean> => {
      const serverRes = await apiClient.clearOperationalData()
      if (!serverRes.success) {
        setNotice(serverRes.message || 'Failed to clear operational data on the server.')
        return false
      }
      setSaved((current) => ({
        version: 4,
        products: current.products.length ? current.products : initialProducts,
        brands: current.brands.length ? current.brands : initialBrands,
        cart: [],
        orders: [],
        records: [],
      }))
      setCustomer(null)
      setCustomerOrders([])
      apiClient.clearCustomerToken()
      try {
        localStorage.removeItem('saa-customer-profile')
        localStorage.removeItem('saa-customer-order-ids')
      } catch {}
      setNotice('Operational records cleared from database and storage. Product catalogue preserved.')
      return true
    },
  }), [saved, customer, customerOrders, notice, orderSyncError, isOwnerAuthenticated])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used within StoreProvider')
  return context
}
