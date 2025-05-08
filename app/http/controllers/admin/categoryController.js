const Category = require("../../../models/category");
const slugify = require("slugify");

function categoryController() {
  return {
    // Display category list page
    async index(req, res) {
      const categories = await Category.find().sort({ createdAt: -1 });
      return res.render("admin/categories", { categories });
    },

    // Display category create form
    create(req, res) {
      return res.render("admin/categories/create");
    },

    // Store a new category
    async store(req, res) {
      const { name } = req.body;

      // Validate request
      if (!name) {
        req.flash("error", "Category name is required");
        return res.redirect("/admin/categories/create");
      }

      try {
        // Create category
        const category = new Category({
          name,
          slug: slugify(name, { lower: true }),
        });

        await category.save();
        req.flash("success", "Category created successfully");
        return res.redirect("/admin/categories");
      } catch (err) {
        if (err.code === 11000) {
          req.flash("error", "Category already exists");
        } else {
          req.flash("error", "Something went wrong");
          console.log(err);
        }
        return res.redirect("/admin/categories/create");
      }
    },

    // Display edit category form
    async edit(req, res) {
      const category = await Category.findById(req.params.id);
      if (!category) {
        req.flash("error", "Category not found");
        return res.redirect("/admin/categories");
      }
      return res.render("admin/categories/edit", { category });
    },

    // Update category
    async update(req, res) {
      const { name } = req.body;

      // Validate request
      if (!name) {
        req.flash("error", "Category name is required");
        return res.redirect(`/admin/categories/edit/${req.params.id}`);
      }

      try {
        await Category.findByIdAndUpdate(req.params.id, {
          name,
          slug: slugify(name, { lower: true }),
        });

        req.flash("success", "Category updated successfully");
        return res.redirect("/admin/categories");
      } catch (err) {
        if (err.code === 11000) {
          req.flash("error", "Category already exists");
        } else {
          req.flash("error", "Something went wrong");
          console.log(err);
        }
        return res.redirect(`/admin/categories/edit/${req.params.id}`);
      }
    },

    // Delete category
    async destroy(req, res) {
      try {
        await Category.findByIdAndDelete(req.params.id);
        req.flash("success", "Category deleted successfully");
      } catch (err) {
        req.flash("error", "Something went wrong");
        console.log(err);
      }
      return res.redirect("/admin/categories");
    },
  };
}

module.exports = categoryController;
