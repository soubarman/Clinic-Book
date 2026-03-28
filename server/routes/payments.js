const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const auth = require('../middleware/auth');

// POST /api/payments/create-order — create Razorpay order
router.post('/create-order', auth, async (req, res) => {
  try {
    // Mock mode: return a fake order
    const mockOrder = {
      id: 'order_mock_' + Date.now(),
      amount: 2000, // ₹20 in paise
      currency: 'INR',
      receipt: 'booking_' + Date.now(),
    };

    // In production with real Razorpay keys:
    // const Razorpay = require('razorpay');
    // const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const order = await razorpay.orders.create({ amount: 2000, currency: 'INR', receipt: 'booking_' + Date.now() });

    res.json({ order: mockOrder, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payments/verify — verify Razorpay signature
router.post('/verify', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Mock mode: always succeed
    if (process.env.OTP_MOCK === 'true') {
      return res.json({ verified: true, paymentId: razorpay_payment_id || 'mock_pay_' + Date.now() });
    }

    // Production signature verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ verified: false, message: 'Payment verification failed' });
    }

    res.json({ verified: true, paymentId: razorpay_payment_id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
