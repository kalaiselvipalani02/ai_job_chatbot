const express = require("express");
const router = express.Router();
const {
  userRegister,
  userLogin,
  userProfile,
  userLogout,
} = require("../controller/userController");
const { authenticateToken } = require("../middleware/auth");

router.post("/register", userRegister);
router.post("/login", userLogin);
router.get("/profile", authenticateToken, userProfile);
router.get("/logout", authenticateToken, userLogout);

module.exports = router;
