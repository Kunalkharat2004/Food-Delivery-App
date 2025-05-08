const Order = require("../../../models/order");

function orderController() {
  return {
    index(req, res) {
      console.log("Admin order controller index method called");
      console.log("Is XHR request:", req.xhr);

      Order.find({ status: { $ne: "completed" } }, null, {
        sort: { createdAt: -1 },
      })
        .populate("customerId", "-password")
        .exec((err, orders) => {
          if (err) {
            console.log("Error fetching orders:", err);
            return res.status(500).json({ error: "Something went wrong" });
          }

          console.log("Orders found:", orders ? orders.length : 0);

          if (req.xhr) {
            console.log("Sending JSON response for admin orders");
            return res.json(orders);
          } else {
            console.log("Rendering admin/orders template");
            return res.render("admin/orders");
          }
        });
    },
  };
}

module.exports = orderController;
