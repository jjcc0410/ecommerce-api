import { Router } from "express";
const router = Router();
import Product from "../models/Products";
import { verifyTokenAndAdmin } from "./verify";
import asyncWrapper from "../middleware/asyncWrapper";
import res from "express/lib/response";

// CREATE
router.post(
  "/",
  verifyTokenAndAdmin,
  asyncWrapper(async (req, res) => {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  })
);

//UPDATE
router.put(
  "/:id",
  verifyTokenAndAdmin,
  asyncWrapper(async (req, res) => {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  })
);

// DELETE
router.delete(
  "/:id",
  verifyTokenAndAdmin,
  asyncWrapper(async () => {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted...");
  })
);

// GET PRODUCT
router.get(
  "/find/:id",
  asyncWrapper(async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  })
);

// GET ALL PRODUCTS
router.get(
  "/",
  asyncWrapper(async (req, res) => {
    const qNew = req.query.new;
    const qCategory = req.query.category;
    let products;
    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(5);
    } else if (qCategory) {
      products = await Product.find({ categories: { $in: [qCategory] } });
    } else {
      products = await Product.find();
    }
    res.status(200).json(products);
  })
);

export default router;
