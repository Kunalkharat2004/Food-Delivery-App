const User = require("../../../models/user");
const { cloudinary } = require("../../../config/cloudinary");

function profileController() {
  return {
    async index(req, res) {
      try {
        const user = await User.findById(req.user._id);
        res.render("customers/profile", { user });
      } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong");
        return res.redirect("/");
      }
    },

    async updateProfile(req, res) {
      try {
        const { name, phone, address } = req.body;
        const user = await User.findById(req.user._id);

        // Update basic info
        user.name = name;
        user.phone = phone || user.phone; // Keep existing if not provided
        user.address = address || user.address; // Keep existing if not provided

        // Handle profile image upload
        if (req.file) {
          // Delete old image from Cloudinary if it's not the default image
          if (
            user.profileImage &&
            !user.profileImage.includes("default-profile")
          ) {
            try {
              const publicId = user.profileImage
                .split("/")
                .pop()
                .split(".")[0];
              await cloudinary.uploader.destroy(publicId);
            } catch (error) {
              console.log("Error deleting old image:", error);
              // Continue even if deletion fails
            }
          }
          // Update with new image path
          user.profileImage = req.file.path;
        }

        await user.save();
        req.flash("success", "Profile updated successfully");
        return res.redirect("/customer/profile");
      } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong updating your profile");
        return res.redirect("/customer/profile");
      }
    },

    async updateBalance(req, res) {
      try {
        const { amount } = req.body;
        const user = await User.findById(req.user._id);

        // Validate amount
        if (!amount || isNaN(amount) || amount <= 0) {
          req.flash("error", "Please enter a valid amount");
          return res.redirect("/customer/profile");
        }

        user.balance += Number(amount);
        await user.save();

        req.flash("success", `₹${amount} added to your balance`);
        return res.redirect("/customer/profile");
      } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong adding balance");
        return res.redirect("/customer/profile");
      }
    },
  };
}

module.exports = profileController;
