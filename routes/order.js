import { Router } from "express";
const router = Router();
import Order from "../models/Order";
import {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
} from "./verify";
import asyncWrapper from "../middleware/asyncWrapper";

// CREATE
router.post(
  "/",
  verifyToken,
  asyncWrapper(async (req, res) => {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  })
);

//UPDATE
router.put(
  "/:id",
  verifyTokenAndAdmin,
  asyncWrapper(async (req, res) => {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  })
);

// DELETE
router.delete(
  "/:id",
  verifyTokenAndAdmin,
  asyncWrapper(async () => {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted...");
  })
);

// GET USER ORDERS
router.get(
  "/find/:userId",
  verifyTokenAndAuthorization,
  asyncWrapper(async (req, res) => {
    const orders = await Order.findOne({ userId: req.params.userId });
    res.status(200).json(orders);
  })
);

// GET ALL ORDERS
router.get(
  "/",
  verifyTokenAndAdmin,
  asyncWrapper(async (req, res) => {
    const orders = await Order.find();
    res.status(200).json(orders);
  })
);

//GET MONTHLY INCOME
router.get(
  "/income",
  verifyTokenAndAdmin,
  asyncWrapper(async (req, res) => {
    const productId = req.query.pid;
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(
      new Date().setMonth(lastMonth.getMonth() - 1)
    );
    // use .aggregate to filter users (this is a function from MongoDB)
    const income = await Order.aggregate([
      // filter orders by date of creation
      {
        $match: {
          createdAt: { $gte: previousMonth },
          ...Order(
            productId && {
              products: { $elemMatch: { productId } },
            }
          ),
        },
      },
      // pass along orderss with their requested field (in this case their month of creation and sales)
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      // group the remaining orders and calculate the total number of sales
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  })
);

export default router;
