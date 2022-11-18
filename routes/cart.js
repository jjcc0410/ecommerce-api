import { Router } from "express";
const router = Router();
import Cart from "../models/Cart";
import {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
} from "./verify";
import asyncWrapper from "../middleware/asyncWrapper";
import res from "express/lib/response";

// CREATE
router.post(
  "/",
  verifyToken,
  asyncWrapper(async (req, res) => {
    const newCart = new Product(req.body);
    const savedCart = await newCart.save();
    res.status(200).json(savedCart);
  })
);

//UPDATE
router.put(
  "/:id",
  verifyTokenAndAuthorization,
  asyncWrapper(async (req, res) => {
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedCart);
  })
);

// DELETE
router.delete(
  "/:id",
  verifyTokenAndAuthorization,
  asyncWrapper(async () => {
    await Cart.findByIdAndDelete(req.params.id);
    res.status(200).json("Cart has been deleted...");
  })
);

// GET USER CART
router.get(
  "/find/:userId",
  verifyTokenAndAuthorization,
  asyncWrapper(async (req, res) => {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.status(200).json(cart);
  })
);

// GET ALL CARTS
router.get(
  "/",
  verifyTokenAndAdmin,
  asyncWrapper(async (req, res) => {
    const carts = await Cart.find();
    res.status(200).json(carts);
  })
);

export default router;
