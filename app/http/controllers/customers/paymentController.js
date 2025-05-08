const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const Order = require("../../../models/order");

function paymentController() {
  return {
    async createPaymentIntent(req, res) {
      try {
        const { amount } = req.body;

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount * 100, // Stripe expects amount in cents
          currency: "inr",
          automatic_payment_methods: {
            enabled: true,
          },
        });

        res.json({
          clientSecret: paymentIntent.client_secret,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error creating payment intent" });
      }
    },

    async confirmPayment(req, res) {
      try {
        const { orderId, paymentIntentId } = req.body;

        // Update order with payment information
        const order = await Order.findById(orderId);
        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }

        order.paymentStatus = "paid";
        order.paymentId = paymentIntentId;
        await order.save();

        res.json({ success: true });
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error confirming payment" });
      }
    },
  };
}

module.exports = paymentController;
