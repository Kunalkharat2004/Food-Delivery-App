const Order = require("../../../models/order");
const Menu = require("../../../models/menu");
const moment = require("moment");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

function orderController() {
  return {
    async index(req, res) {
      const orders = await Order.find({ customerId: req.user._id }, null, {
        sort: { createdAt: -1 },
      });
      res.header(
        "Cache-Control",
        "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
      );
      res.render("customers/orders", { orders, moment });
    },

    async store(req, res) {
      const { phone, address, paymentType } = req.body;
      if (!phone || !address) {
        req.flash("error", "All fields are required");
        req.flash("phone", phone);
        req.flash("address", address);
        return res.redirect("/cart");
      }

      const order = new Order({
        customerId: req.user._id,
        items: req.session.cart.items,
        phone,
        address,
        paymentType,
        totalPrice: req.session.cart.totalPrice,
      });

      try {
        await order.save();
        req.flash("success", "Order placed successfully");
        delete req.session.cart;

        // If payment type is card, redirect to payment page
        if (paymentType === "card") {
          return res.redirect(`/customer/payment/${order._id}`);
        }

        return res.redirect("/customer/orders");
      } catch (err) {
        req.flash("error", "Something went wrong");
        return res.redirect("/cart");
      }
    },

    async show(req, res) {
      const order = await Order.findById(req.params.id);
      if (!order) {
        req.flash("error", "Order not found");
        return res.redirect("/customer/orders");
      }
      res.render("customers/singleOrder", { order });
    },
  };
}

module.exports = orderController;
