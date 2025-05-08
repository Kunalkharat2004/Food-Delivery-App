const homeController = require("../app/http/controllers/homeController");
const authController = require("../app/http/controllers/authController");
const cartController = require("../app/http/controllers/customers/cartController");
const orderController = require("../app/http/controllers/customers/orderController");
const adminOrderController = require("../app/http/controllers/admin/orderController");
const statusController = require("../app/http/controllers/admin/statusController");
const adminDashboardController = require("../app/http/controllers/admin/dashboardController");
const categoryController = require("../app/http/controllers/admin/categoryController");
const productController = require("../app/http/controllers/admin/productController");
const { upload } = require("../app/config/cloudinary");
const paymentController = require("../app/http/controllers/customers/paymentController");
const Order = require("../app/models/order");

// Middlewares
const guest = require("../app/http/middlewares/guest");
const auth = require("../app/http/middlewares/auth");
const admin = require("../app/http/middlewares/admin");

function initRoutes(app) {
  // Home route - conditionally shows admin or customer view
  app.get("/", homeController().index);

  // Auth routes
  app.get("/login", guest, authController().login);
  app.post("/login", authController().postLogin);
  app.get("/register", guest, authController().register);
  app.post("/register", authController().postRegister);
  app.post("/logout", authController().logout);

  // Cart routes
  app.get("/cart", cartController().index);
  app.post("/update-cart", cartController().update);

  // Customer routes
  app.post("/orders", auth, orderController().store);
  app.get("/customer/orders", auth, orderController().index);
  app.get("/customer/orders/:id", auth, orderController().show);
  app.get("/customer/payment/:id", auth, async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/customer/orders");
    }
    res.render("customers/payment", { order });
  });

  // Payment routes
  app.post(
    "/create-payment-intent",
    auth,
    paymentController().createPaymentIntent
  );
  app.post("/confirm-payment", auth, paymentController().confirmPayment);

  // Admin routes
  app.get("/admin", admin, adminDashboardController().index);

  // Admin Order routes
  app.get("/admin/orders", admin, adminOrderController().index);
  app.post("/admin/order/status", admin, statusController().update);

  // Admin Category routes
  app.get("/admin/categories", admin, categoryController().index);
  app.get("/admin/categories/create", admin, categoryController().create);
  app.post("/admin/categories", admin, categoryController().store);
  app.get("/admin/categories/edit/:id", admin, categoryController().edit);
  app.post("/admin/categories/update/:id", admin, categoryController().update);
  app.delete("/admin/categories/:id", admin, categoryController().destroy);

  // Admin Product routes
  app.get("/admin/products", admin, productController().index);
  app.get("/admin/products/create", admin, productController().create);
  app.post(
    "/admin/products",
    admin,
    upload.single("image"),
    productController().store
  );
  app.get("/admin/products/edit/:id", admin, productController().edit);
  app.post(
    "/admin/products/update/:id",
    admin,
    upload.single("image"),
    productController().update
  );
  app.delete("/admin/products/:id", admin, productController().destroy);
  app.patch(
    "/admin/products/:id/toggle-availability",
    admin,
    productController().toggleAvailability
  );
}

module.exports = initRoutes;
