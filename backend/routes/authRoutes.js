const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg });
    return false;
  }
  return true;
};

const registerRules = [
  body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters!"),
  body("email").isEmail().normalizeEmail().withMessage("Please enter a valid email address!"),
  body("password").isLength({ min: 6, max: 128 }).withMessage("Password must be 6-128 characters!"),
];

const loginRules = [
  body("email").isEmail().normalizeEmail().withMessage("Please enter a valid email address!"),
  body("password").notEmpty().withMessage("Please enter your password!"),
];

// REGISTER
router.post("/register", registerRules, async (req, res) => {
  if (!validate(req, res)) return;

  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful!",
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// LOGIN
router.post("/login", loginRules, async (req, res) => {
  if (!validate(req, res)) return;

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Email not found!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password!" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful!",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// GET CURRENT USER
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found!" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

module.exports = router;
