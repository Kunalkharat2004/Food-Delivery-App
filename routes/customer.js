const express = require("express");
const router = express.Router();
const auth = require("../app/http/middlewares/auth");
const profileController = require("../app/http/controllers/customers/profileController");
const { upload } = require("../app/config/cloudinary");

// Profile routes
router.get("/profile", auth, profileController().index);
router.post(
  "/profile/update",
  auth,
  upload.single("profileImage"),
  profileController().updateProfile
);
router.post("/profile/balance", auth, profileController().updateBalance);

module.exports = router;
