import { Router } from "express";
const router = Router();
import User from "../models/User";
import asyncWrapper from "../middleware/asyncWrapper";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import {} from "dotenv/config";

router.post(
  "/register",
  asyncWrapper(async (req, res) => {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.PASS_SEC
      ).toString(),
    });
    const savedUser = await newUser.save();
    res.send(savedUser);
  })
);

router.post(
  "/login",
  asyncWrapper(async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(401).json("Wrong user credentials");

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    originalPassword !== req.body.password &&
      res.status(401).json("Wrong password credentials");

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );
    const { password, ...others } = user._doc;
    res.status(200).json({ ...others, accessToken });
  })
);

export default router;
