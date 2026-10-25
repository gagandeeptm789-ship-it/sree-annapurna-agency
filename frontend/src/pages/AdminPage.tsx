import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Activity, AlertTriangle, ArrowRight, BarChart3, Bell, Boxes, BriefcaseBusiness, Building2, Camera, CircleDollarSign, ClipboardList, Eye, FileText, LayoutDashboard, LogOut, Menu, Package, Plus, Search, Settings, ShoppingCart, Truck, Users, X } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useStore } from '../context/StoreContext'
import type { AdminRecord, AdminRecordType, Brand, DemoOrder, Product } from '../types'
import { ImageAsset, Notice } from '../components/common'
import { apiClient } from '../services/apiClient'

type NavItem = { id: string; label: string; icon: typeof LayoutDashboard }

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }],
  },
  {
    label: 'Catalogue',
    items: [
      { id: 'products', label: 'Products', icon: Package },
      { id: 'brands', label: 'Brands & categories', icon: Boxes },
      { id: 'inventory', label: 'Inventory', icon: ClipboardList },
    ],
  },
  {
    label: 'Fulfilment',
    items: [
      { id: 'orders', label: 'Orders', icon: ShoppingCart },
      { id: 'dispatch', label: 'Delivery & dispatch', icon: Truck },
    ],
  },
  {
    label: 'Records',
    items: [
      { id: 'customers', label: 'Customers', icon: Users },
      { id: 'distributors', label: 'Distributors', icon: Building2 },
      { id: 'sales', label: 'Sales', icon: BarChart3 },
      { id: 'payments', label: 'Payments', icon: CircleDollarSign },
      { id: 'expenses', label: 'Expenses', icon: Activity },
      { id: 'invoices', label: 'Invoices', icon: FileText },
    ],
  },
  {
    label: 'Administration',
    items: [
      { id: 'reports', label: 'Reports', icon: BarChart3 },
      { id: 'staff', label: 'Staff & roles', icon: BriefcaseBusiness },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
]

const nav = navGroups.flatMap((group) => group.items)

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`
const formatDate = (value: Date) => value.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const orderStatusList: DemoOrder['status'][] = ['Pending', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled']

export function AdminPage() {
  const location = useLocation()
  const requestedSection = location.pathname.split('/')[2] || 'overview'
  const section = nav.some((item) => item.id === requestedSection) ? requestedSection : 'overview'
  const current = nav.find((item) => item.id === section) ?? nav[0]
  const [mobileNav, setMobileNav] = useState(false)
  const [search, setSearch] = useState('')
  const { products, brands, orders, records, saveProduct, deleteProduct, updateOrder, saveOrder, deleteOrder, saveBrand, saveRecord, deleteRecord, clearAllData, logoutOwner, notify } = useStore()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingOrder, setEditingOrder] = useState<DemoOrder | null>(null)
  const [viewingOrder, setViewingOrder] = useState<DemoOrder | null>(null)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [editingRecord, setEditingRecord] = useState<AdminRecord | null>(null)

  const openProductForm = (product?: Product) => setEditingProduct(product ?? {
    id: `product-${Date.now()}`, name: '', brandId: '', category: '', description: '',
    price: 0, sku: '', stock: 0, pack: '', image: '', active: true,
  })
  const openOrderForm = (order?: DemoOrder) => setEditingOrder(order ?? {
    id: `ORD-${Date.now().toString(36).toUpperCase()}`,
    customer: '',
    date: formatDate(new Date()),
    total: 0,
    status: 'Pending',
    payment: 'Pending',
    items: [],
  })
  const openRecordForm = (type: AdminRecordType, record?: AdminRecord) => setEditingRecord(record ?? {
    id: `${type}-${Date.now()}`, type, name: '', contact: '', details: '', amount: null, status: '',
  })
  const filteredProducts = useMemo(() => products.filter((product) =>
    `${product.name} ${product.sku} ${brands.find((brand) => brand.id === product.brandId)?.name ?? ''}`.toLowerCase().includes(search.toLowerCase())), [products, brands, search])
  const filteredOrders = useMemo(() => orders.filter((order) =>
    `${order.id} ${order.customer} ${order.status} ${order.phone ?? ''} ${order.customerEmail ?? ''}`.toLowerCase().includes(search.toLowerCase())), [orders, search])
  const filteredRecords = useMemo(() => records.filter((record) =>
    `${record.name} ${record.contact} ${record.details}`.toLowerCase().includes(search.toLowerCase())), [records, search])
  const awaitingFulfilment = orders.filter((order) =>
    order.status === 'Pending' || order.status === 'Confirmed' || order.status === 'Processing').length

  return <div className="admin-shell">
    <aside className={`admin-sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="admin-logo">
        <span className="admin-logo-mark" aria-hidden="true">SA</span>
        <span>
          <strong>SREE ANNAPURNA</strong>
          <small>Owner panel</small>
        </span>
        <button className="sidebar-close" onClick={() => setMobileNav(false)} aria-label="Close navigation">
          <X size={18} />
        </button>
      </div>
      <div className="admin-workspace">
        <span className="workspace-dot" aria-hidden="true" />
        <span>
          <strong>Owner workspace</strong>
          <small>{brands.length} brand lines · {products.length} products</small>
        </span>
      </div>
      <nav className="admin-nav" aria-label="Operations navigation">
        {navGroups.map((group) => (
          <div className="admin-nav-group" key={group.label}>
            <span className="admin-nav-group-label">{group.label}</span>
            {group.items.map((item) => {
              const Icon = item.icon
              const pending = item.id === 'orders' ? orders.filter((order) => order.status === 'Pending').length : 0
              return (
                <Link
                  key={item.id}
                  className={section === item.id ? 'active' : ''}
                  to={`/admin/${item.id}`}
                  onClick={() => setMobileNav(false)}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{item.label}</span>
                  {pending > 0 && <span className="nav-count">{pending}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="demo-sidebar-note">
          <span>Catalogue live</span>
          <p>{products.length} products and {brands.length} brand lines are published to the storefront.</p>
        </div>
        <button type="button" className="back-to-store admin-signout-btn" onClick={logoutOwner}>
          <LogOut size={15} aria-hidden="true" />Sign out</button>
        <Link to="/" className="back-to-store">
          <ArrowRight size={15} aria-hidden="true" />View storefront
        </Link>
      </div>
    </aside>
    {mobileNav && <button className="sidebar-scrim" aria-label="Close menu" onClick={() => setMobileNav(false)} />}
    <div className="admin-main">
      <header className="admin-topbar">
        <button className="admin-mobile-menu" aria-label="Open navigation" onClick={() => setMobileNav(true)}>
          <Menu size={20} />
        </button>
        <div className="admin-topbar-heading">
          <p className="admin-breadcrumb">
            Owner workspace <span>/</span> {current.label}
          </p>
          <h1>{current.label}</h1>
        </div>
        <div className="admin-search">
          <Search size={16} aria-hidden="true" />
          <input
            placeholder="Search this section"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search the current section"
          />
        </div>
        <span className="environment-chip">
          <span aria-hidden="true" />
          Owner mode
        </span>
        <button className="admin-icon-button" aria-label="Notifications" onClick={() => notify('No new operational alerts.')}>
          <Bell size={17} />
        </button>
        <button
          className="button button-outline button-small topbar-signout-btn"
          onClick={logoutOwner}
          title="Sign out of the owner panel"
        >
          <LogOut size={14} aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </header>
      <div className="admin-content">
        <div className="admin-intro">
          <span>Agency operations · {formatDate(new Date())}</span>
          <span className="admin-date">{awaitingFulfilment} orders awaiting fulfilment</span>
        </div>
        {section === 'overview' && <Overview products={products} brands={brands} orders={orders} records={records} onViewOrder={setViewingOrder} />}
        {section === 'products' && <ProductsSection products={filteredProducts} brands={brands} onAdd={() => openProductForm()} onEdit={openProductForm} onDelete={(product) => { if (window.confirm(`Delete ${product.name}?`)) { deleteProduct(product.id); notify('Product deleted.') } }} />}
        {section === 'inventory' && <InventorySection products={filteredProducts} onAdjust={(product, amount) => { saveProduct({ ...product, stock: Math.max(0, product.stock + amount) }); notify('Stock updated.') }} />}
        {section === 'brands' && <BrandsSection brands={brands} products={products} onEdit={setEditingBrand} />}
        {section === 'orders' && <OrdersSection orders={filteredOrders} onAdd={() => openOrderForm()} onEdit={openOrderForm} onView={setViewingOrder} onDelete={(order) => { if (window.confirm(`Delete order ${order.id}?`)) deleteOrder(order.id) }} onUpdate={(id, status) => updateOrder(id, { status })} />}
        {section === 'dispatch' && <DispatchSection orders={filteredOrders} onUpdate={(id, status) => updateOrder(id, { status })} onView={setViewingOrder} />}
        {section === 'customers' && <RecordsSection type="customer" title="Customer directory" records={filteredRecords} onAdd={() => openRecordForm('customer')} onEdit={setEditingRecord} onDelete={(record) => deleteRecord(record.id)} />}
        {section === 'distributors' && <RecordsSection type="distributor" title="Distributors & business partners" records={filteredRecords} onAdd={() => openRecordForm('distributor')} onEdit={setEditingRecord} onDelete={(record) => deleteRecord(record.id)} />}
        {section === 'sales' && <SalesSection orders={filteredOrders} records={filteredRecords} onAdd={() => openRecordForm('sale')} onEdit={setEditingRecord} onDelete={(record) => deleteRecord(record.id)} onViewOrder={setViewingOrder} />}
        {section === 'payments' && <RecordsSection type="payment" title="Payment records" records={filteredRecords} onAdd={() => openRecordForm('payment')} onEdit={setEditingRecord} onDelete={(record) => deleteRecord(record.id)} />}
        {section === 'expenses' && <RecordsSection type="expense" title="Expense records" records={filteredRecords} onAdd={() => openRecordForm('expense')} onEdit={setEditingRecord} onDelete={(record) => deleteRecord(record.id)} />}
        {section === 'invoices' && <RecordsSection type="invoice" title="Invoice register" records={filteredRecords} onAdd={() => openRecordForm('invoice')} onEdit={setEditingRecord} onDelete={(record) => deleteRecord(record.id)} />}
        {section === 'staff' && <RecordsSection type="staff" title="Staff & roles" records={filteredRecords} onAdd={() => openRecordForm('staff')} onEdit={setEditingRecord} onDelete={(record) => deleteRecord(record.id)} />}
        {section === 'reports' && <ReportsSection products={products} orders={orders} records={records} />}
        {section === 'settings' && <SettingsSection records={filteredRecords.filter((record) => record.type === 'business')} onAdd={() => openRecordForm('business')} onEdit={setEditingRecord} onDelete={(record) => deleteRecord(record.id)} clearAll={clearAllData} />}
      </div>
      <footer className="admin-footer"><span>Sree Annapurna Agency</span><span>Authorized Regional Brand Distribution</span><Link to="/about">About Agency</Link></footer>
    </div>
    {editingProduct && <ProductModal product={editingProduct} brands={brands} onClose={() => setEditingProduct(null)} onSave={(product) => { saveProduct(product); setEditingProduct(null); notify('Product saved.') }} />}
    {editingOrder && <OrderModal order={editingOrder} onClose={() => setEditingOrder(null)} onSave={(order) => { saveOrder(order); setEditingOrder(null); notify('Order saved.') }} />}
    {viewingOrder && <OrderDetailsModal order={viewingOrder} products={products} onClose={() => setViewingOrder(null)} onUpdateStatus={(status) => { updateOrder(viewingOrder.id, { status }); setViewingOrder({ ...viewingOrder, status }); notify(`Order status updated to ${status}.`) }} />}
    {editingBrand && <BrandModal brand={editingBrand} onClose={() => setEditingBrand(null)} onSave={(brand) => { saveBrand(brand); setEditingBrand(null); notify('Brand information updated.') }} />}
    {editingRecord && <RecordModal record={editingRecord} onClose={() => setEditingRecord(null)} onSave={(record) => { saveRecord(record); setEditingRecord(null); notify('Record saved.') }} />}
    <Notice />
  </div>
}

function Overview({ products, brands, orders, records, onViewOrder }: { products: Product[]; brands: Brand[]; orders: DemoOrder[]; records: AdminRecord[]; onViewOrder: (order: DemoOrder) => void }) {
  const salesTotal = orders.filter((order) => order.status !== 'Cancelled').reduce((sum, order) => sum + order.total, 0)
  const pendingOrders = orders.filter((order) => order.status === 'Pending' || order.status === 'Confirmed' || order.status === 'Processing').length
  const customers = records.filter((record) => record.type === 'customer').length
  const chartData = [...orders.reduce((totals, order) => {
    if (order.status !== 'Cancelled') totals.set(order.date, (totals.get(order.date) ?? 0) + order.total)
    return totals
  }, new Map<string, number>())].map(([date, sales]) => ({ date, sales }))

  return <>
    <div className="demo-notice"><span className="demo-notice-icon"><Activity size={17} /></span><span><strong>Operations overview</strong><small>Manage product catalogue, brand lines, incoming customer orders, and dispatch records.</small></span></div>
    <div className="metric-grid">
      {[
        {
          label: 'Order value',
          value: money(orders.filter((order) => order.status !== 'Cancelled').reduce((sum, order) => sum + order.total, 0)),
          hint: 'Excludes cancelled orders',
          icon: CircleDollarSign,
          tone: 'green',
        },
        {
          label: 'Orders placed',
          value: String(orders.length),
          hint: `${pendingOrders} awaiting fulfilment`,
          icon: ShoppingCart,
          tone: 'gold',
        },
        {
          label: 'Customer records',
          value: String(customers),
          hint: 'Directory entries',
          icon: Users,
          tone: 'orange',
        },
        {
          label: 'Catalogue products',
          value: String(products.length),
          hint: `Across ${brands.length} brand lines`,
          icon: Package,
          tone: 'neutral',
        },
      ].map((item) => {
        const Icon = item.icon
        return (
          <div className="metric-card" key={item.label}>
            <span className="metric-label">{item.label}</span>
            <strong className="metric-value">{item.value}</strong>
            <span className={`metric-icon ${item.tone}`} aria-hidden="true">
              <Icon size={17} />
            </span>
            <small>{item.hint}</small>
          </div>
        )
      })}
    </div>
    <div className="dashboard-main-grid">
      <section className="panel sales-chart-panel">
        <div className="panel-heading">
          <div>
            <h2>Order value</h2>
            <p>Recorded orders by date, excluding cancelled</p>
          </div>
        </div>
        {chartData.length ? (
          <>
            <div className="sales-total">
              <strong>{money(salesTotal)}</strong>
              <span>Across {orders.filter((order) => order.status !== 'Cancelled').length} orders</span>
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 14, right: 10, left: -6, bottom: 0 }}>
                  <CartesianGrid stroke="#e8e3de" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b6b6b', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b6b6b', fontSize: 11 }} tickFormatter={(value: number) => `${value / 1000}k`} />
                  <Tooltip formatter={(value) => [money(Number(value)), 'Order value']} />
                  <Line type="monotone" dataKey="sales" stroke="#b82025" strokeWidth={2} dot={{ r: 3, fill: '#b82025' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <EmptyPanel text="No orders recorded yet. As orders are placed, order value will appear here." />
        )}
      </section>
      <section className="panel brand-sales-panel">
        <div className="panel-heading">
          <div>
            <h2>Brand catalogue</h2>
            <p>Products per principal brand</p>
          </div>
        </div>
        {brands.map((brand) => {
          const count = products.filter((product) => product.brandId === brand.id).length
          return (
            <div className="brand-sales-row" key={brand.id}>
              <div>
                <span>{brand.name}</span>
                <strong>
                  {count} product{count === 1 ? '' : 's'}
                </strong>
              </div>
            </div>
          )
        })}
      </section>
    </div>
    <div className="dashboard-lower-grid"><section className="panel"><div className="panel-heading"><div><h2>Recent orders</h2><p>Customer order queue</p></div><Link className="panel-link" to="/admin/orders">View all<ArrowRight size={15} /></Link></div><OrdersTable orders={orders.slice(0, 5)} onView={onViewOrder} /></section>
      <section className="panel inventory-alerts"><div className="panel-heading"><div><h2>Inventory watch</h2><p>Current stock status</p></div><Link className="panel-link" to="/admin/inventory">Manage<ArrowRight size={15} /></Link></div>{products.length ? products.filter((product) => product.stock === 0).slice(0, 4).map((product) => <div className="alert-row" key={product.id}><span className="alert-product-icon"><AlertTriangle size={16} /></span><span><strong>{product.name}</strong><small>{product.sku || 'Identifier'}</small></span><span className="stock-alert">0</span></div>) : <EmptyPanel text="No products currently in catalogue." />}{products.length > 0 && !products.some((product) => product.stock === 0) && <EmptyPanel text="All catalogue products have inventory on hand." />}</section></div>
    <p className="dashboard-local-note">Active queue: {pendingOrders} pending / confirmed / processing orders. Live synchronization with customer storefront.</p>
  </>
}

function EmptyPanel({ text }: { text: string }) {
  return <div className="admin-empty-state"><p>{text}</p></div>
}

function ProductsSection({ products, brands, onAdd, onEdit, onDelete }: { products: Product[]; brands: Brand[]; onAdd: () => void; onEdit: (product: Product) => void; onDelete: (product: Product) => void }) {
  return <><div className="admin-section-toolbar"><span>{products.length} products in catalogue</span><button className="button button-admin" onClick={onAdd}><Plus size={16} />Add product</button></div><div className="panel table-panel"><div className="table-caption"><div><strong>Product catalogue</strong><span>Authorized brands catalogue for Sree Annapurna Agency.</span></div></div><div className="table-scroll"><table><thead><tr><th>PRODUCT</th><th>BRAND</th><th>CATEGORY</th><th>PRICE</th><th>STOCK</th><th>PHOTO STATUS</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{products.length ? products.map((product) => {
    const isCustom = Boolean(product.image && (product.image.startsWith('data:image/') || product.image.startsWith('http://') || product.image.startsWith('https://')))
    return <tr key={product.id}>
      <td>
        <span className="table-product">
          <ImageAsset src={product.image} alt="" fallback="No image" className="table-product-image" fallbackClassName="table-image-empty" fit="contain" />
          <span>
            <strong>{product.name}</strong>
            <small>{product.sku || ''}{product.pack ? ` · ${product.pack}` : ''}</small>
          </span>
        </span>
      </td>
      <td>{brands.find((brand) => brand.id === product.brandId)?.name ?? '—'}</td>
      <td>{product.category || 'General'}</td>
      <td>{product.price > 0 ? money(product.price) : 'Price unavailable'}</td>
      <td>{product.stock}</td>
      <td>
        <span className={`photo-tag ${isCustom ? 'photo-tag-custom' : 'photo-tag-spec'}`}>
          {isCustom ? 'Uploaded image' : 'Illustration'}
        </span>
      </td>
      <td><span className={`status-pill ${product.active ? 'status-active' : 'status-muted'}`}>{product.active ? 'Active' : 'Inactive'}</span></td>
      <td>
        <div className="row-actions">
          <button onClick={() => onEdit(product)} className="upload-photo-btn"><Camera size={13} aria-hidden="true" /> Edit photo</button>
          <button onClick={() => onEdit(product)}>Edit</button>
          <button className="delete-text" onClick={() => onDelete(product)}>Delete</button>
        </div>
      </td>
    </tr>
  }) : <EmptyTable columns={8} text="No products in catalogue. Add products to display them on the storefront." />}</tbody></table></div></div></>
}

function InventorySection({ products, onAdjust }: { products: Product[]; onAdjust: (product: Product, amount: number) => void }) {
  const zero = products.filter((product) => product.stock === 0).length
  return <><div className="inventory-summary"><div><AlertTriangle size={18} /><span><strong>{zero} products at zero stock</strong><small>Adjust available units on hand for accurate storefront stock levels.</small></span></div><button className="button button-admin" onClick={() => window.print()}><FileText size={16} />Print stock list</button></div><div className="panel table-panel"><div className="table-caption"><div><strong>Current stock</strong><span>{products.length} products tracked</span></div></div><div className="table-scroll"><table><thead><tr><th>PRODUCT</th><th>IDENTIFIER</th><th>BRAND</th><th>ON HAND</th><th>STOCK MOVEMENT</th></tr></thead><tbody>{products.length ? products.map((product) => <tr key={product.id}><td><strong>{product.name}</strong><small className="table-subline">{product.pack || 'Standard pack'}</small></td><td>{product.sku || '—'}</td><td>{product.brandId || '—'}</td><td>{product.stock}</td><td><div className="stock-adjust"><button aria-label={`Remove one ${product.name} from stock`} onClick={() => onAdjust(product, -1)} disabled={product.stock <= 0}>−</button><span>Adjust</span><button aria-label={`Add one ${product.name} to stock`} onClick={() => onAdjust(product, 1)}>+</button></div></td></tr>) : <EmptyTable columns={5} text="No inventory records available." />}</tbody></table></div></div></>
}

function BrandsSection({ brands, products, onEdit }: { brands: Brand[]; products: Product[]; onEdit: (brand: Brand) => void }) {
  return <><div className="demo-notice"><span className="demo-notice-icon"><Boxes size={17} /></span><span><strong>Brand identities & partners</strong><small>Six recognized brands distributed by Sree Annapurna Agency.</small></span></div><div className="brand-admin-grid">{brands.map((brand) => <article className="brand-admin-card" key={brand.id}><div className="brand-admin-image" style={{ backgroundColor: `${brand.color}18` }}><ImageAsset src={brand.image} alt={`${brand.name} brand image`} fallback="Image" className="brand-admin-asset" fallbackClassName="image-upload-empty" fit="contain" /><span>{brand.category}</span></div><div className="brand-admin-info"><div><h2>{brand.name}</h2><span>{products.filter((product) => product.brandId === brand.id).length} products</span></div><p>{brand.description}</p><button className="button button-outline button-small" onClick={() => onEdit(brand)}>Edit brand / upload asset</button></div></article>)}</div></>
}

function OrdersSection({ orders, onAdd, onEdit, onView, onDelete, onUpdate }: { orders: DemoOrder[]; onAdd: () => void; onEdit: (order: DemoOrder) => void; onView: (order: DemoOrder) => void; onDelete: (order: DemoOrder) => void; onUpdate: (id: string, status: DemoOrder['status']) => void }) {
  return <><div className="admin-section-toolbar"><span>{orders.length} customer orders</span><button className="button button-admin" onClick={onAdd}><Plus size={16} />Add order</button></div><div className="panel table-panel"><div className="table-caption"><div><strong>Customer orders</strong><span>Review and update incoming orders with full customer and item details.</span></div></div><OrdersTable orders={orders} onUpdate={onUpdate} onEdit={onEdit} onView={onView} onDelete={onDelete} /></div></>
}

function OrdersTable({ orders, onUpdate, onEdit, onView, onDelete }: { orders: DemoOrder[]; onUpdate?: (id: string, status: DemoOrder['status']) => void; onEdit?: (order: DemoOrder) => void; onView?: (order: DemoOrder) => void; onDelete?: (order: DemoOrder) => void }) {
  const { notify } = useStore()
  const canManage = !!onEdit || !!onDelete || !!onView
  return <div className="table-scroll"><table><thead><tr><th>ORDER ID</th><th>CUSTOMER</th><th>ITEMS</th><th>DATE</th><th>PAYMENT</th><th>STATUS</th><th>TOTAL</th>{onUpdate && <th>UPDATE STATUS</th>}{canManage && <th>ACTIONS</th>}</tr></thead><tbody>{orders.length ? orders.map((order) => <tr key={order.id}><td><strong>{order.id}</strong></td><td><div><strong>{order.customer || 'Customer'}</strong>{order.phone && <small className="table-subline">{order.phone}</small>}</div></td><td><span className="order-items-badge">{order.items?.length ?? 0} item{(order.items?.length ?? 0) === 1 ? '' : 's'}</span></td><td>{order.date}</td><td><span className={`payment-pill payment-${order.payment.toLowerCase().replace(/\s+/g, '-')}`}>{order.paymentMethod?.includes('UPI') && order.payment === 'Pending' ? 'Pending Verification' : order.payment}</span>{order.paymentDetails?.utrNumber && <div style={{ fontSize: '11px', color: '#173F35', fontWeight: 600, marginTop: '2px' }}>UTR: {order.paymentDetails.utrNumber}</div>}</td><td><span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span></td><td><strong>{money(order.total)}</strong></td>{onUpdate && <td><select className="table-select" value={order.status} onChange={(event) => onUpdate(order.id, event.target.value as DemoOrder['status'])} aria-label={`Update ${order.id} status`}>{orderStatusList.map((status) => <option key={status}>{status}</option>)}</select></td>}{canManage && <td><div className="row-actions">{onView && <button type="button" onClick={() => onView(order)} className="view-btn" title="View full details"><Eye size={14} /> View</button>}<button type="button" onClick={async () => { notify('Downloading official invoice...'); const res = await apiClient.downloadInvoicePdf(order.id, order.accessToken, order); if (res.success) notify(`Invoice for ${order.id} downloaded.`); else notify(res.message || 'Invoice download failed.'); }} className="invoice-btn" title="Download official PDF invoice" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FileText size={13} /> Invoice</button>{onEdit && <button type="button" onClick={() => onEdit(order)}>Edit</button>}{onDelete && <button type="button" className="delete-text" onClick={() => onDelete(order)}>Delete</button>}</div></td>}</tr>) : <EmptyTable columns={7 + Number(!!onUpdate) + Number(canManage)} text="No orders recorded yet." />}</tbody></table></div>
}

function EmptyTable({ columns, text }: { columns: number; text: string }) {
  return <tr><td className="admin-table-empty" colSpan={columns}>{text}</td></tr>
}

function RecordsSection({ type, title, records, onAdd, onEdit, onDelete }: { type: AdminRecordType; title: string; records: AdminRecord[]; onAdd: () => void; onEdit: (record: AdminRecord) => void; onDelete: (record: AdminRecord) => void }) {
  const items = records.filter((record) => record.type === type)
  const emptyMessage: Partial<Record<AdminRecordType, string>> = {
    customer: 'No customer accounts yet.',
    distributor: 'No distributors or partners registered yet.',
    sale: 'No sales records recorded yet.',
    payment: 'No payment transactions recorded yet.',
    expense: 'No expense entries recorded yet.',
    invoice: 'No invoices created yet.',
    staff: 'No staff members assigned yet.',
  }
  return <><div className="admin-section-toolbar"><span>{items.length} records</span><button className="button button-admin" onClick={onAdd}><Plus size={16} />Add record</button></div><div className="panel table-panel"><div className="table-caption"><div><strong>{title}</strong><span>Operational records register.</span></div></div><div className="table-scroll"><table><thead><tr><th>NAME / REFERENCE</th><th>CONTACT</th><th>DETAILS</th><th>AMOUNT</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{items.length ? items.map((record) => <tr key={record.id}><td><strong>{record.name}</strong></td><td>{record.contact || '—'}</td><td>{record.details || '—'}</td><td>{record.amount === null ? '—' : money(record.amount)}</td><td>{record.status || 'Active'}</td><td><div className="row-actions"><button onClick={() => onEdit(record)}>Edit</button><button className="delete-text" onClick={() => { if (window.confirm(`Delete ${record.name}?`)) onDelete(record) }}>Delete</button></div></td></tr>) : <EmptyTable columns={6} text={emptyMessage[type] ?? `No ${title.toLowerCase()} found.`} />}</tbody></table></div></div></>
}

function SalesSection({ orders, records, onAdd, onEdit, onDelete, onViewOrder }: { orders: DemoOrder[]; records: AdminRecord[]; onAdd: () => void; onEdit: (record: AdminRecord) => void; onDelete: (record: AdminRecord) => void; onViewOrder: (order: DemoOrder) => void }) {
  const orderSales = orders.filter((order) => order.status !== 'Cancelled')
  const total = orderSales.reduce((sum, order) => sum + order.total, 0)
  return <><div className="metric-grid"><div className="metric-card"><span>Sales from orders</span><strong>{money(total)}</strong><small>{orderSales.length} orders</small></div><div className="metric-card"><span>Manual sales entries</span><strong>{records.filter((record) => record.type === 'sale').length}</strong><small>Manual entries</small></div></div><div className="panel table-panel"><div className="table-caption"><div><strong>Order sales</strong><span>Calculated from customer orders</span></div></div><OrdersTable orders={orderSales} onView={onViewOrder} /></div><RecordsSection type="sale" title="Manual sales entries" records={records} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} /></>
}

function DispatchSection({ orders, onUpdate, onView }: { orders: DemoOrder[]; onUpdate: (id: string, status: DemoOrder['status']) => void; onView: (order: DemoOrder) => void }) {
  const dispatchable = orders.filter((order) => ['Pending', 'Confirmed', 'Processing', 'Dispatched'].includes(order.status))
  return <><div className="demo-notice"><span className="demo-notice-icon"><Truck size={17} /></span><span><strong>Delivery & dispatch management</strong><small>Manage delivery fulfillment and transit statuses.</small></span></div><div className="panel table-panel"><div className="table-caption"><div><strong>Orders awaiting fulfilment</strong><span>{dispatchable.length} orders</span></div></div><div className="table-scroll"><table><thead><tr><th>ORDER ID</th><th>CUSTOMER</th><th>DELIVERY CITY</th><th>STATUS</th><th>UPDATE</th><th>DETAILS</th></tr></thead><tbody>{dispatchable.length ? dispatchable.map((order) => <tr key={order.id}><td><strong>{order.id}</strong></td><td><div><strong>{order.customer}</strong>{order.phone && <small className="table-subline">{order.phone}</small>}</div></td><td>{order.deliveryDetails?.city || '—'}</td><td><span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span></td><td><select className="table-select" value={order.status} onChange={(event) => onUpdate(order.id, event.target.value as DemoOrder['status'])} aria-label={`Dispatch status for ${order.id}`}>{orderStatusList.map((status) => <option key={status}>{status}</option>)}</select></td><td><button type="button" className="view-btn" onClick={() => onView(order)}><Eye size={14} /> View</button></td></tr>) : <EmptyTable columns={6} text="No orders awaiting dispatch." />}</tbody></table></div></div></>
}

function ReportsSection({ products, orders, records }: { products: Product[]; orders: DemoOrder[]; records: AdminRecord[] }) {
  const totals = {
    sales: orders.filter((order) => order.status !== 'Cancelled').reduce((sum, order) => sum + order.total, 0),
    expenses: records.filter((record) => record.type === 'expense').reduce((sum, record) => sum + (record.amount ?? 0), 0),
    payments: records.filter((record) => record.type === 'payment').reduce((sum, record) => sum + (record.amount ?? 0), 0),
  }
  const reports = [
    ['Sales report', `${orders.length} orders · ${money(totals.sales)}`],
    ['Product catalogue', `${products.length} products across 6 brands`],
    ['Inventory report', `${products.reduce((sum, product) => sum + product.stock, 0)} units on hand`],
    ['Payments report', `${records.filter((record) => record.type === 'payment').length} records · ${money(totals.payments)}`],
    ['Expenses report', `${records.filter((record) => record.type === 'expense').length} records · ${money(totals.expenses)}`],
  ]
  return <><div className="demo-notice"><span className="demo-notice-icon"><BarChart3 size={17} /></span><span><strong>Operational reports</strong><small>Summary derived from active catalogue and customer transactions.</small></span></div><div className="report-card-grid">{reports.map(([title, summary]) => <article className="report-card" key={title}><span className="report-icon"><BarChart3 size={19} /></span><h2>{title}</h2><p>{summary}</p><button className="table-link" onClick={() => window.print()}>Print report</button></article>)}</div></>
}

function SettingsSection({ records, onAdd, onEdit, onDelete, clearAll }: { records: AdminRecord[]; onAdd: () => void; onEdit: (record: AdminRecord) => void; onDelete: (record: AdminRecord) => void; clearAll: () => void }) {
  const [confirmingClear, setConfirmingClear] = useState(false)
  const businessRecord = records.find((record) => record.type === 'business')
  return <><div className="demo-notice"><span className="demo-notice-icon"><Settings size={17} /></span><span><strong>Business settings & configuration</strong><small>Configure agency details, business profiles, and operational data.</small></span></div><div className="panel table-panel"><div className="table-caption"><div><strong>Business profile</strong><span>{businessRecord ? 'Saved profile' : 'Set agency trading name and contact.'}</span></div><button className="button button-admin" onClick={onAdd}><Plus size={16} />{businessRecord ? 'Edit details' : 'Add business details'}</button></div>{businessRecord && <div className="settings-record"><span><strong>{businessRecord.name}</strong><small>{businessRecord.contact || 'No contact'} · {businessRecord.details || 'No address'}</small></span><div className="row-actions"><button onClick={() => onEdit(businessRecord)}>Edit</button><button className="delete-text" onClick={() => { if (window.confirm(`Delete ${businessRecord.name}?`)) onDelete(businessRecord) }}>Delete</button></div></div>}</div><section className="panel clear-data-panel"><div><h2>Clear Operational Records</h2><p>Reset transaction records, order queues, customer accounts, and cart contents. The full product catalogue and six brand identities are permanently preserved.</p><p className="summary-note">Use this safely when clearing test transactions or resetting customer order logs.</p></div><button className="button button-outline" onClick={() => setConfirmingClear(true)}>Clear Operational Data</button></section>{confirmingClear && <div className="panel clear-confirm" role="alertdialog" aria-labelledby="clear-confirm-title" aria-describedby="clear-confirm-text"><div><h2 id="clear-confirm-title">Confirm Reset Operational Data</h2><p id="clear-confirm-text">This will clear stored orders, customer entries, and shopping cart records. All 6 brand identities and product catalogue items will remain intact.</p></div><div className="modal-actions"><button className="button button-outline" onClick={() => setConfirmingClear(false)}>Cancel</button><button className="button button-dark" onClick={() => { clearAll(); setConfirmingClear(false) }}>Confirm clear</button></div></div>}</>
}

function OrderDetailsModal({ order, products, onClose, onUpdateStatus }: { order: DemoOrder; products: Product[]; onClose: () => void; onUpdateStatus: (status: DemoOrder['status']) => void }) {
  const { verifyUpiPayment, notify } = useStore()
  const [downloading, setDownloading] = useState(false)
  const [downloadMsg, setDownloadMsg] = useState('')
  const d = order.deliveryDetails
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="admin-modal order-details-modal" role="dialog" aria-modal="true" aria-label={`Order details for ${order.id}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <p className="eyebrow">Order Inspection</p>
            <h2>{order.id}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button>
        </div>

        <div className="order-modal-body">
          <div className="order-modal-status-bar">
            <div className="status-badge-group">
              <span>Current Status:</span>
              <span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span>
            </div>
            <label className="status-update-control">
              <span>Change Status:</span>
              <select
                value={order.status}
                onChange={(e) => onUpdateStatus(e.target.value as DemoOrder['status'])}
                className="table-select"
              >
                {orderStatusList.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="order-details-grid">
            <section className="order-section-block">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> {order.customer || '—'}</p>
              <p><strong>Phone:</strong> {order.phone || d?.phone || '—'}</p>
              <p><strong>Email:</strong> {order.customerEmail || d?.email || '—'}</p>
              <p><strong>Order Date:</strong> {order.date}</p>
              <p><strong>Payment Method:</strong> {order.paymentMethod || 'Cash on Delivery / Agency Invoice'}</p>
              <p><strong>Payment Status:</strong> <span className={`payment-pill payment-${order.payment.toLowerCase().replace(/\s+/g, '-')}`}>{order.paymentMethod?.includes('UPI') && order.payment === 'Pending' ? 'Pending Verification' : order.payment}</span></p>
            </section>

            <section className="order-section-block">
              <h3>Delivery Details</h3>
              <p><strong>Street Address:</strong> {d?.address || '—'}</p>
              <p><strong>City / Area:</strong> {d?.city || '—'}</p>
              <p><strong>PIN Code:</strong> {d?.pincode || '—'}</p>
              {d?.notes && <p><strong>Delivery Instructions:</strong> {d.notes}</p>}
            </section>
          </div>

          {(order.paymentMethod?.includes('UPI') || order.paymentDetails?.provider === 'phonepe_upi') && (
            <div style={{ marginTop: '14px', padding: '14px', background: '#FDFBF7', border: '1.5px solid #285C4D', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#173F35', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                📱 PhonePe / UPI Payment Reference
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '12px' }}>
                <div><strong>Payee:</strong> {order.paymentDetails?.payeeName || 'GAGAN DEEP'}</div>
                <div><strong>Payee Phone:</strong> {order.paymentDetails?.payeeUpiNumber || '6360074675'}</div>
                <div><strong>UTR Reference:</strong> <code style={{ background: '#ECEEDF', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, color: '#173F35' }}>{order.paymentDetails?.utrNumber || 'N/A'}</code></div>
                <div><strong>Verification:</strong> <span className={`payment-pill payment-${order.payment.toLowerCase().replace(/\s+/g, '-')}`}>{order.paymentDetails?.verificationStatus || order.payment}</span></div>
              </div>
              {order.paymentDetails?.failureReason && (
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#B91C1C' }}>
                  <strong>Rejection Note:</strong> {order.paymentDetails.failureReason}
                </p>
              )}

              {order.payment !== 'Paid' && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="button button-admin"
                    style={{ background: '#166534', color: '#ffffff', fontSize: '12px', padding: '6px 14px' }}
                    onClick={async () => {
                      const res = await verifyUpiPayment(order.id, 'approve')
                      if (res.success) {
                        notify('UPI payment verified! Order confirmed & marked as Paid.')
                        onClose()
                      } else {
                        notify(res.message || 'Verification failed.')
                      }
                    }}
                  >
                    ✓ Verify & Mark Paid
                  </button>
                  <button
                    type="button"
                    className="button button-outline"
                    style={{ color: '#b91c1c', borderColor: '#fca5a5', fontSize: '12px', padding: '6px 14px' }}
                    onClick={async () => {
                      const reason = window.prompt('Enter rejection reason (optional):', 'UTR reference not matched on PhonePe statement')
                      if (reason !== null) {
                        const res = await verifyUpiPayment(order.id, 'reject', reason)
                        if (res.success) {
                          notify('Payment marked as Failed.')
                          onClose()
                        } else {
                          notify(res.message || 'Rejection update failed.')
                        }
                      }
                    }}
                  >
                    ✕ Reject Reference
                  </button>
                </div>
              )}
            </div>
          )}

          <section className="order-items-table-block" style={{ marginTop: '16px' }}>
            <h3>Ordered Products ({order.items?.length ?? 0})</h3>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Pack</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.length ? order.items.map((item, idx) => {
                    const prod = products.find((p) => p.id === item.productId)
                    return (
                      <tr key={`${item.productId}-${idx}`}>
                        <td>
                          <div className="table-product">
                            <ImageAsset src={item.image || prod?.image || ''} alt={item.name} fallback="No image" className="table-product-image" fit="contain" />
                            <strong>{item.name}</strong>
                          </div>
                        </td>
                        <td>{item.pack}</td>
                        <td>{item.quantity}</td>
                        <td>{money(item.unitPrice)}</td>
                        <td><strong>{money(item.unitPrice * item.quantity)}</strong></td>
                      </tr>
                    )
                  }) : (
                    <tr><td colSpan={5} className="admin-table-empty">No itemized line items recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="order-modal-total-line">
              <span>Grand Total</span>
              <strong>{money(order.total)}</strong>
            </div>
          </section>
        </div>

        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {downloadMsg && <span style={{ fontSize: '0.8125rem', color: '#68716b' }}>{downloadMsg}</span>}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="button button-admin"
              disabled={downloading}
              onClick={async () => {
                setDownloading(true)
                setDownloadMsg('Generating invoice PDF...')
                const res = await apiClient.downloadInvoicePdf(order.id, order.accessToken, order)
                setDownloading(false)
                if (res.success) setDownloadMsg('Invoice downloaded.')
                else setDownloadMsg(res.message || 'Download failed.')
                setTimeout(() => setDownloadMsg(''), 4000)
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <FileText size={16} /> {downloading ? 'Downloading...' : 'Download Invoice (PDF)'}
            </button>
            <button type="button" className="button button-outline" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function OrderModal({ order, onClose, onSave }: { order: DemoOrder; onClose: () => void; onSave: (order: DemoOrder) => void }) {
  const [form, setForm] = useState<DemoOrder>(order)
  const [error, setError] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.id.trim() || !form.customer.trim() || !form.date.trim()) {
      setError('Add an order ID, customer name, and date.')
      return
    }
    if (!Number.isFinite(form.total) || form.total < 0) {
      setError('Enter a valid non-negative total.')
      return
    }
    onSave({ ...form, id: form.id.trim(), customer: form.customer.trim() })
  }

  return <div className="modal-backdrop" role="presentation" onClick={onClose}><div className="admin-modal" role="dialog" aria-modal="true" aria-label={order.customer ? 'Edit order' : 'Add order'} onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">Order management</p><h2>{order.customer ? 'Edit order' : 'Add order'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button></div><form className="form-stack" onSubmit={submit}><div className="field-grid"><label>Order ID<input required value={form.id} readOnly /></label><label>Customer<input required value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} /></label><label>Date<input required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label><label>Total (₹)<input type="number" min="0" step="0.01" value={form.total} onChange={(event) => setForm({ ...form, total: Number(event.target.value) })} /></label><label>Payment status<select value={form.payment} onChange={(event) => setForm({ ...form, payment: event.target.value as DemoOrder['payment'] })}><option>Pending</option><option>Paid</option><option>Refunded</option></select></label><label>Order status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as DemoOrder['status'] })}>{orderStatusList.map((st) => <option key={st}>{st}</option>)}</select></label></div>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>Cancel</button><button className="button button-dark">Save order</button></div></form></div></div>
}

function ProductModal({ product, brands, onClose, onSave }: { product: Product; brands: Brand[]; onClose: () => void; onSave: (product: Product) => void }) {
  const [form, setForm] = useState(product)
  const [error, setError] = useState('')
  const update = (key: keyof Product, value: string | number | boolean) => setForm((current) => ({ ...current, [key]: value }))
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.brandId || !form.name.trim() || !form.category.trim()) { setError('Add the product name, brand, and category.'); return }
    if (!Number.isFinite(form.price) || !Number.isFinite(form.stock) || form.price < 0 || form.stock < 0) { setError('Enter valid non-negative price and stock values.'); return }
    onSave(form)
  }
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><div className="admin-modal" role="dialog" aria-modal="true" aria-label={product.name ? `Edit ${product.name}` : 'Add product'} onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">Catalogue management</p><h2>{product.name ? 'Edit product' : 'Add product'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button></div><form className="form-stack" onSubmit={submit}><div className="field-grid"><label>Product name<input required value={form.name} onChange={(event) => update('name', event.target.value)} /></label><label>Brand<select required value={form.brandId} onChange={(event) => update('brandId', event.target.value)}><option value="">Select brand</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></label><label>Category<input required value={form.category} onChange={(event) => update('category', event.target.value)} /></label><label>SKU / identifier (optional)<input value={form.sku} onChange={(event) => update('sku', event.target.value)} /></label><label>Price (₹)<input type="number" min="0" step="0.01" value={form.price || ''} onChange={(event) => update('price', Number(event.target.value))} /></label><label>Pack size<input value={form.pack} onChange={(event) => update('pack', event.target.value)} /></label><label>Stock quantity<input type="number" min="0" value={form.stock || ''} onChange={(event) => update('stock', Number(event.target.value))} /></label></div><ImageUpload label="Product Packaging Photography" value={form.image} defaultPlaceholder={`/images/products/${product.id}.svg`} onChange={(value) => update('image', value)} /><label>Description<textarea rows={3} value={form.description} onChange={(event) => update('description', event.target.value)} /></label><label className="checkbox-line"><input type="checkbox" checked={form.active} onChange={(event) => update('active', event.target.checked)} /> Product active</label>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>Cancel</button><button className="button button-dark">Save product</button></div></form></div></div>
}

function BrandModal({ brand, onClose, onSave }: { brand: Brand; onClose: () => void; onSave: (brand: Brand) => void }) {
  const [form, setForm] = useState(brand)
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><div className="admin-modal" role="dialog" aria-modal="true" aria-label={`Edit ${brand.name}`} onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">Brand information</p><h2>Edit brand</h2></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button></div><form className="form-stack" onSubmit={(event) => { event.preventDefault(); onSave(form) }}><label>Brand name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Brand category<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label><label>Brand description<textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><ImageUpload label="Brand identity asset" value={form.image} defaultPlaceholder={`/images/brands/${brand.id}.svg`} onChange={(image) => setForm({ ...form, image })} /><div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>Cancel</button><button className="button button-dark">Save details</button></div></form></div></div>
}

function ImageUpload({ label, value, defaultPlaceholder = '', onChange }: { label: string; value: string; defaultPlaceholder?: string; onChange: (value: string) => void }) {
  const [error, setError] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [showUrlField, setShowUrlField] = useState(false)

  const isCustomImage = Boolean(value && (value.startsWith('data:image/') || value.startsWith('http://') || value.startsWith('https://')))

  const readFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Choose a valid image file (PNG, JPG, WEBP).'); return }
    if (file.size > 2 * 1024 * 1024) { setError('Image must be 2 MB or smaller for browser storage.'); return }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') { onChange(reader.result); setError('') }
      else setError('Unable to read this image file.')
    }
    reader.onerror = () => setError('Unable to read this image file.')
    reader.readAsDataURL(file)
  }

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://') && !urlInput.startsWith('/')) {
      setError('Please provide a valid image URL (e.g. https://... or /images/...)')
      return
    }
    onChange(urlInput.trim())
    setUrlInput('')
    setShowUrlField(false)
    setError('')
  }

  return (
    <div className="image-upload-field">
      <div className="image-upload-heading">
        <label><strong>{label}</strong></label>
        <span className={`photo-tag ${isCustomImage ? 'photo-tag-custom' : 'photo-tag-spec'}`}>
          {isCustomImage ? '✓ Real Photograph Active' : 'Specification Placeholder Active'}
        </span>
      </div>

      <div className="image-upload-controls">
        <label className="button button-admin button-small file-input-label">
          <span>📁 Upload Photo File</span>
          <input type="file" accept="image/*" onChange={readFile} style={{ display: 'none' }} />
        </label>
        <button
          type="button"
          className="button button-outline button-small"
          onClick={() => setShowUrlField(!showUrlField)}
        >
          {showUrlField ? 'Cancel URL' : '🔗 Paste Image URL'}
        </button>
        {isCustomImage && (
          <button
            type="button"
            className="button button-outline button-small delete-text"
            onClick={() => onChange(defaultPlaceholder || '')}
          >
            Reset to Spec Visual
          </button>
        )}
      </div>

      {showUrlField && (
        <div className="image-url-row">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/authentic-product.jpg"
          />
          <button type="button" className="button button-dark button-small" onClick={handleApplyUrl}>
            Apply URL
          </button>
        </div>
      )}

      {value ? (
        <div className="image-upload-preview">
          <ImageAsset
            src={value}
            alt={`${label} preview`}
            fallback="Image unavailable"
            className="upload-image-preview"
            fallbackClassName="image-upload-empty"
            loading="eager"
            fit="contain"
          />
          <div className="preview-meta-info">
            <strong>{isCustomImage ? 'Authentic Custom Image' : 'Neutral Specification Visual'}</strong>
            <small>{value.startsWith('data:') ? 'Stored locally in browser' : value}</small>
          </div>
        </div>
      ) : (
        <p className="image-upload-empty">No image selected. Displaying neutral specification format.</p>
      )}

      {error && <p className="form-error">{error}</p>}
    </div>
  )
}

function RecordModal({ record, onClose, onSave }: { record: AdminRecord; onClose: () => void; onSave: (record: AdminRecord) => void }) {
  const [form, setForm] = useState(record)
  const [error, setError] = useState('')
  const title = record.type === 'business' ? 'Business information' : `${record.type[0].toUpperCase()}${record.type.slice(1)} record`
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.name.trim()) return
    if (form.amount !== null && (!Number.isFinite(form.amount) || form.amount < 0)) { setError('Enter a valid non-negative amount.'); return }
    onSave({ ...form, name: form.name.trim(), contact: form.contact.trim(), details: form.details.trim(), status: form.status.trim() })
  }
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><div className="admin-modal" role="dialog" aria-modal="true" aria-label={record.name ? `Edit ${title}` : `Add ${title}`} onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">Local record</p><h2>{record.name ? `Edit ${title}` : `Add ${title}`}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button></div><form className="form-stack" onSubmit={submit}><label>Name / reference<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Contact details<input value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} /></label><label>Notes / additional details<textarea rows={3} value={form.details} onChange={(event) => setForm({ ...form, details: event.target.value })} /></label><label>Amount (optional, ₹)<input type="number" min="0" step="0.01" value={form.amount ?? ''} onChange={(event) => setForm({ ...form, amount: event.target.value === '' ? null : Number(event.target.value) })} /></label><label>Status<input value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} /></label>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>Cancel</button><button className="button button-dark">Save record</button></div></form></div></div>
}
