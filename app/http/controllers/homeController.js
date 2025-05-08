const Menu = require("../../models/menu");
function homeController() {
  return {
    async index(req, res) {
      // If user is admin, redirect to admin dashboard
      if (req.user && req.user.role === "admin") {
        return res.redirect("/admin");
      }

      // For customers or guests, show the home page with pizzas
      const pizzas = await Menu.find();
      return res.render("home", { pizzas: pizzas });
    },
  };
}

module.exports = homeController;
