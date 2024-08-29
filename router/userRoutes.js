const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getUser } = require("../controller/userController");
const {
  signupValidation,
  loginValidation,
} = require("../middleware/AuthValidation");

router.post("/register", signupValidation, registerUser);
router.post("/login", loginValidation, loginUser);
router.get('/allUser/:userID',getUser )

module.exports = router;
