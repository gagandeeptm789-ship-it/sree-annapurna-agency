const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    pack: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const DeliveryDetailsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const PaymentDetailsSchema = new mongoose.Schema(
  {
    transactionId: { type: String, default: '' },
    provider: { type: String, default: '' }, // 'razorpay' | 'sandbox' | 'cod'
    signature: { type: String, default: '' },
    paidAt: { type: Date },
    failureReason: { type: String, default: '' },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    accessToken: {
      type: String,
      required: true,
      index: true,
    },
    isGuest: {
      type: Boolean,
      default: false,
      index: true,
    },
    customer: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
    },
    deliveryDetails: {
      type: DeliveryDetailsSchema,
      required: true,
    },
    items: [OrderItemSchema],
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      default: 'Cash on Delivery / Agency Invoice',
    },
    payment: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
      index: true,
    },
    paymentDetails: {
      type: PaymentDetailsSchema,
      default: () => ({}),
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', OrderSchema);
