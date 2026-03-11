import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User";
import auth from "../middleware/auth";

const router = Router();

const validate = (req: Request, res: Response): boolean => {
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
router.post("/register", registerRules, async (req: Request, res: Response): Promise<void> => {
  if (!validate(req, res)) return;

  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "Email already in use!" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    res.status(201).json({
      message: "Registration successful!",
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// LOGIN
router.post("/login", loginRules, async (req: Request, res: Response): Promise<void> => {
  if (!validate(req, res)) return;

  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: "Email not found!" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: "Incorrect password!" });
      return;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    res.json({
      message: "Login successful!",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// GET CURRENT USER
router.get("/me", auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      res.status(404).json({ error: "User not found!" });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

export default router;
