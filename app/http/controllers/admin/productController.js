const Menu = require("../../../models/menu");
const Category = require("../../../models/category");
const { cloudinary } = require("../../../config/cloudinary");
const fs = require("fs");

function productController() {
  return {
    // Display product list page
    async index(req, res) {
      const products = await Menu.find()
        .populate("category")
        .sort({ createdAt: -1 });
      return res.render("admin/products", { products });
    },

    // Display product create form
    async create(req, res) {
      const categories = await Category.find();
      return res.render("admin/products/create", { categories });
    },

    // Store a new product
    async store(req, res) {
      const { name, price, size, category, description } = req.body;
      let imageUrl = "";

      // Validate request
      if (!name || !price || !size || !category) {
        if (req.file && req.file.path) {
          // Remove uploaded image if validation fails
          await cloudinary.uploader.destroy(req.file.filename);
        }
        req.flash("error", "All fields are required");
        return res.redirect("/admin/products/create");
      }

      // Get image URL if uploaded
      if (req.file) {
        imageUrl = req.file.path;
      } else {
        req.flash("error", "Image is required");
        return res.redirect("/admin/products/create");
      }

      try {
        // Create product
        const product = new Menu({
          name,
          image: imageUrl,
          price,
          size,
          category,
          description: description || "",
        });

        await product.save();
        req.flash("success", "Product created successfully");
        return res.redirect("/admin/products");
      } catch (err) {
        if (req.file && req.file.path) {
          // Remove uploaded image if save fails
          await cloudinary.uploader.destroy(req.file.filename);
        }
        req.flash("error", "Something went wrong");
        console.log(err);
        return res.redirect("/admin/products/create");
      }
    },

    // Display edit product form
    async edit(req, res) {
      try {
        const product = await Menu.findById(req.params.id);
        const categories = await Category.find();

        if (!product) {
          req.flash("error", "Product not found");
          return res.redirect("/admin/products");
        }

        return res.render("admin/products/edit", { product, categories });
      } catch (err) {
        req.flash("error", "Something went wrong");
        console.log(err);
        return res.redirect("/admin/products");
      }
    },

    // Update product
    async update(req, res) {
      const {
        name,
        price,
        size,
        category,
        description,
        isAvailable,
      } = req.body;

      // Validate request
      if (!name || !price || !size || !category) {
        if (req.file && req.file.path) {
          // Remove uploaded image if validation fails
          await cloudinary.uploader.destroy(req.file.filename);
        }
        req.flash("error", "All fields are required");
        return res.redirect(`/admin/products/edit/${req.params.id}`);
      }

      try {
        const product = await Menu.findById(req.params.id);
        if (!product) {
          req.flash("error", "Product not found");
          return res.redirect("/admin/products");
        }

        // Update product data
        product.name = name;
        product.price = price;
        product.size = size;
        product.category = category;
        product.description = description || "";
        product.isAvailable = isAvailable === "on" ? true : false;

        // Update image if new one is uploaded
        if (req.file) {
          // Extract public_id from Cloudinary URL
          const publicId = product.image
            .split("/")
            .pop()
            .split(".")[0];
          // Delete old image
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
          // Set new image
          product.image = req.file.path;
        }

        await product.save();
        req.flash("success", "Product updated successfully");
        return res.redirect("/admin/products");
      } catch (err) {
        if (req.file && req.file.path) {
          // Remove uploaded image if save fails
          await cloudinary.uploader.destroy(req.file.filename);
        }
        req.flash("error", "Something went wrong");
        console.log(err);
        return res.redirect(`/admin/products/edit/${req.params.id}`);
      }
    },

    // Delete product
    async destroy(req, res) {
      try {
        const product = await Menu.findById(req.params.id);
        if (!product) {
          req.flash("error", "Product not found");
          return res.redirect("/admin/products");
        }

        // Extract public_id from Cloudinary URL
        const publicId = product.image
          .split("/")
          .pop()
          .split(".")[0];
        // Delete image from Cloudinary
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }

        // Delete product
        await Menu.findByIdAndDelete(req.params.id);
        req.flash("success", "Product deleted successfully");
      } catch (err) {
        req.flash("error", "Something went wrong");
        console.log(err);
      }
      return res.redirect("/admin/products");
    },

    // Toggle product availability
    async toggleAvailability(req, res) {
      try {
        const product = await Menu.findById(req.params.id);
        if (!product) {
          return res
            .status(404)
            .json({ success: false, message: "Product not found" });
        }

        product.isAvailable = !product.isAvailable;
        await product.save();

        return res.json({
          success: true,
          isAvailable: product.isAvailable,
          message: `Product is now ${
            product.isAvailable ? "available" : "unavailable"
          }`,
        });
      } catch (err) {
        console.log(err);
        return res
          .status(500)
          .json({ success: false, message: "Something went wrong" });
      }
    },
  };
}

module.exports = productController;
