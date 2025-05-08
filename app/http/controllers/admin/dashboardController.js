const Order = require("../../../models/order");

function dashboardController() {
  return {
    index(req, res) {
      // Redirect admin to orders page by default
      return res.redirect("/admin/orders");
    },
  };
}

module.exports = dashboardController;
