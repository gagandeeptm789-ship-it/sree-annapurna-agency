import type { Brand, DemoOrder, OrderPlacementData, OrderStatus, PaymentStatus, Product } from '../types'

const CUSTOMER_TOKEN_KEY = 'saa-customer-token'
const OWNER_TOKEN_KEY = 'saa-owner-token'

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  count?: number
  token?: string
  mode?: string
  user?: any
  owner?: any
  orderId?: string
  accessToken?: string
  total?: number
  [key: string]: any
}

class ApiClient {
  private baseUrl = '/api'

  getCustomerToken(): string | null {
    try {
      return localStorage.getItem(CUSTOMER_TOKEN_KEY)
    } catch {
      return null
    }
  }

  setCustomerToken(token: string): void {
    try {
      localStorage.setItem(CUSTOMER_TOKEN_KEY, token)
    } catch {}
  }

  clearCustomerToken(): void {
    try {
      localStorage.removeItem(CUSTOMER_TOKEN_KEY)
    } catch {}
  }

  getOwnerToken(): string | null {
    try {
      return sessionStorage.getItem(OWNER_TOKEN_KEY)
    } catch {
      return null
    }
  }

  setOwnerToken(token: string): void {
    try {
      sessionStorage.setItem(OWNER_TOKEN_KEY, token)
    } catch {}
  }

  clearOwnerToken(): void {
    try {
      sessionStorage.removeItem(OWNER_TOKEN_KEY)
    } catch {}
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ ok: boolean; status: number; data: ApiResponse<T> | null }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    // Attach owner token for admin endpoints or customer token for customer requests
    const isOwnerReq = endpoint.includes('/admin') || endpoint.includes('/owner') || Boolean((options.headers as any)?.['x-require-owner'])
    const ownerToken = this.getOwnerToken()
    const customerToken = this.getCustomerToken()

    if (isOwnerReq && ownerToken) {
      headers['Authorization'] = `Bearer ${ownerToken}`
    } else if (customerToken) {
      headers['Authorization'] = `Bearer ${customerToken}`
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      const json = await response.json().catch(() => null)
      return {
        ok: response.ok,
        status: response.status,
        data: json,
      }
    } catch (error) {
      // Offline / network failure handled gracefully
      return {
        ok: false,
        status: 0,
        data: null,
      }
    }
  }

  // --- Products ---
  async getProducts(params?: { brandId?: string; category?: string; search?: string }): Promise<Product[] | null> {
    const q = new URLSearchParams()
    if (params?.brandId) q.append('brandId', params.brandId)
    if (params?.category) q.append('category', params.category)
    if (params?.search) q.append('search', params.search)
    const queryStr = q.toString() ? `?${q.toString()}` : ''

    const res = await this.request<Product[]>(`/products${queryStr}`)
    if (res.ok && res.data?.data) {
      return res.data.data
    }
    return null
  }

  async getProduct(id: string): Promise<Product | null> {
    const res = await this.request<Product>(`/products/${id}`)
    return res.ok && res.data?.data ? res.data.data : null
  }

  async createProduct(product: Partial<Product>): Promise<Product | null> {
    const res = await this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
      headers: { 'x-require-owner': 'true' },
    })
    return res.ok && res.data?.data ? res.data.data : null
  }

  async updateProduct(id: string, update: Partial<Product>): Promise<Product | null> {
    const res = await this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(update),
      headers: { 'x-require-owner': 'true' },
    })
    return res.ok && res.data?.data ? res.data.data : null
  }

  // --- Brands ---
  async getBrands(): Promise<Brand[] | null> {
    const res = await this.request<Brand[]>('/brands')
    return res.ok && res.data?.data ? res.data.data : null
  }

  async getBrand(id: string): Promise<Brand | null> {
    const res = await this.request<Brand>(`/brands/${id}`)
    return res.ok && res.data?.data ? res.data.data : null
  }

  // --- Orders ---
  async getOrders(customerEmail?: string): Promise<DemoOrder[] | null> {
    const endpoint = customerEmail ? `/orders?customerEmail=${encodeURIComponent(customerEmail)}` : '/orders'
    const res = await this.request<DemoOrder[]>(endpoint)
    if (res.ok && res.data?.data) {
      // Map API Order schema to DemoOrder
      return (res.data.data as any[]).map((o) => ({
        id: o.orderId || o.id,
        customer: o.customer,
        customerEmail: o.customerEmail,
        phone: o.phone,
        deliveryDetails: o.deliveryDetails,
        date: new Date(o.date || o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        total: o.total,
        status: o.status,
        payment: o.payment,
        items: o.items,
      }))
    }
    return null
  }

  async getOrder(id: string): Promise<DemoOrder | null> {
    const res = await this.request<any>(`/orders/${id}`)
    if (res.ok && res.data?.data) {
      const o = res.data.data
      return {
        id: o.orderId || o.id,
        customer: o.customer,
        customerEmail: o.customerEmail,
        phone: o.phone,
        deliveryDetails: o.deliveryDetails,
        date: new Date(o.date || o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        total: o.total,
        status: o.status,
        payment: o.payment,
        items: o.items,
      }
    }
    return null
  }

  async createOrder(
    data: OrderPlacementData & { items: { productId: string; name: string; quantity: number; pack?: string; image?: string }[] }
  ): Promise<{ success: boolean; orderId?: string; accessToken?: string; message?: string; total?: number }> {
    const res = await this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (res.ok && (res.data?.data || res.data?.orderId)) {
      const order = res.data.data || res.data
      return {
        success: true,
        orderId: order.orderId,
        accessToken: order.accessToken,
        total: order.total,
      }
    }
    return {
      success: false,
      message: res.data?.message || 'Server was unable to process order. Falling back to local store.',
    }
  }

  async updateOrderStatus(id: string, status?: OrderStatus, payment?: PaymentStatus): Promise<boolean> {
    const res = await this.request<any>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, payment }),
      headers: { 'x-require-owner': 'true' },
    })
    return res.ok
  }

  // --- Auth ---
  async register(params: { name: string; email: string; password: string; phone?: string }): Promise<{ success: boolean; message?: string; user?: any }> {
    const res = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    })
    if (res.ok && res.data?.token) {
      this.setCustomerToken(res.data.token)
      return { success: true, user: res.data.user }
    }
    return { success: false, message: res.data?.message || 'Unable to register account.' }
  }

  async login(params: { email: string; password: string }): Promise<{ success: boolean; message?: string; user?: any }> {
    const res = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(params),
    })
    if (res.ok && res.data?.token) {
      this.setCustomerToken(res.data.token)
      return { success: true, user: res.data.user }
    }
    return { success: false, message: res.data?.message || 'Invalid email or password.' }
  }

  async loginOwner(passcode: string): Promise<{ success: boolean; message?: string; owner?: any }> {
    const res = await this.request<any>('/auth/owner/login', {
      method: 'POST',
      body: JSON.stringify({ passcode }),
    })
    if (res.ok && res.data?.token) {
      this.setOwnerToken(res.data.token)
      return { success: true, owner: res.data.owner }
    }
    return { success: false, message: res.data?.message || 'Invalid owner passcode.' }
  }

  async getMe(): Promise<{ user?: any; owner?: boolean } | null> {
    const res = await this.request<any>('/auth/me')
    if (res.ok && res.data?.user) {
      return { user: res.data.user, owner: res.data.user.role === 'owner' }
    }
    return null
  }

  // --- Invoices ---
  getInvoiceHtmlUrl(orderId: string, token?: string): string {
    const ownerToken = this.getOwnerToken()
    const customerToken = this.getCustomerToken()
    const query = new URLSearchParams()
    if (token) query.set('token', token)
    if (ownerToken) query.set('authToken', ownerToken)
    else if (customerToken) query.set('authToken', customerToken)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return `${this.baseUrl}/orders/${orderId}/invoice/html${qs}`
  }

  getInvoicePdfUrl(orderId: string, token?: string): string {
    const ownerToken = this.getOwnerToken()
    const customerToken = this.getCustomerToken()
    const query = new URLSearchParams()
    if (token) query.set('token', token)
    if (ownerToken) query.set('authToken', ownerToken)
    else if (customerToken) query.set('authToken', customerToken)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return `${this.baseUrl}/orders/${orderId}/invoice/pdf${qs}`
  }

  async downloadInvoicePdf(orderId: string, token?: string, fallbackOrder?: any): Promise<{ success: boolean; message?: string }> {
    try {
      const headers: Record<string, string> = {}
      const ownerToken = this.getOwnerToken()
      const customerToken = this.getCustomerToken()
      if (ownerToken) headers['Authorization'] = `Bearer ${ownerToken}`
      else if (customerToken) headers['Authorization'] = `Bearer ${customerToken}`
      if (token) headers['x-order-token'] = token

      const url = this.getInvoicePdfUrl(orderId, token)
      let res = await fetch(url, { headers })

      if (!res.ok && (res.status === 404 || res.status === 400) && fallbackOrder) {
        // Fallback: Generate PDF directly if order is not found on backend (e.g. offline dev or memory reset)
        res = await fetch(`${this.baseUrl}/invoices/generate-pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify(fallbackOrder),
        })
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        return {
          success: false,
          message: errJson?.message || `Failed to download invoice (HTTP ${res.status}).`,
        }
      }

      const blob = await res.blob()
      if (blob.size === 0) {
        return { success: false, message: 'Received empty PDF from server.' }
      }

      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = blobUrl
      a.download = `Invoice-${orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a)
        window.URL.revokeObjectURL(blobUrl)
      }, 60000)

      return { success: true }
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error downloading PDF invoice.' }
    }
  }

  async getInvoiceData(orderId: string, token?: string): Promise<any | null> {
    const res = await this.request<any>(`/orders/${orderId}/invoice${token ? `?token=${encodeURIComponent(token)}` : ''}`)
    return res.ok && res.data?.data ? res.data.data : null
  }

  // --- Payments ---
  async createPaymentOrder(orderId: string): Promise<any | null> {
    const res = await this.request<any>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    })
    return res.ok && res.data ? res.data : null
  }

  async submitUpiPayment(orderId: string, utrNumber: string, notes?: string): Promise<{ success: boolean; message?: string; data?: any }> {
    const res = await this.request<any>('/payments/submit-utr', {
      method: 'POST',
      body: JSON.stringify({ orderId, utrNumber, notes }),
    })
    if (res.ok && res.data?.success) {
      return { success: true, message: res.data.message, data: res.data.data }
    }
    return { success: false, message: res.data?.message || 'Failed to submit UPI payment reference.' }
  }

  async verifyUpiPayment(orderId: string, action: 'approve' | 'reject', rejectReason?: string): Promise<{ success: boolean; message?: string; data?: any }> {
    const res = await this.request<any>('/payments/verify-upi', {
      method: 'POST',
      body: JSON.stringify({ orderId, action, rejectReason }),
    })
    if (res.ok && res.data?.success) {
      return { success: true, message: res.data.message, data: res.data.data }
    }
    return { success: false, message: res.data?.message || 'Failed to verify UPI payment.' }
  }

  async verifyPayment(params: {
    orderId: string
    razorpayPaymentId?: string
    razorpayOrderId?: string
    razorpaySignature?: string
    sandboxTransactionId?: string
    testSignature?: string
  }): Promise<boolean> {
    const res = await this.request<any>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(params),
    })
    return res.ok
  }

  async recordPaymentFailure(orderId: string, reason?: string): Promise<boolean> {
    const res = await this.request<any>('/payments/fail', {
      method: 'POST',
      body: JSON.stringify({ orderId, reason }),
    })
    return res.ok
  }
}

export const apiClient = new ApiClient()

