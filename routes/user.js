import { Router } from "express";
const router = Router();
import User from "../models/User";
import { verifyTokenAndAdmin, verifyTokenAndAuthorization } from "./verify";
import asyncWrapper from "../middleware/asyncWrapper";
import res from "express/lib/response";

// UPDATE
router.put(
  "/:id",
  verifyTokenAndAuthorization,
  asyncWrapper(async (req, res) => {
    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(
        req.body.password,
        process.env.PASS_SEC
      ).toString();
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  })
);

// DELETE
router.delete(
  "/:id",
  verifyTokenAndAuthorization,
  asyncWrapper(async () => {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted...");
  })
);

// GET USER
router.get(
  "/find/:id",
  verifyTokenAndAdmin,
  asyncWrapper(async (req, res) => {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  })
);

// GET ALL USERS
router.get(
  "/",
  verifyTokenAndAdmin,
  asyncWrapper(async (req, res) => {
    const query = req.query.new;
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(1)
      : await User.find();
    res.status(200).json(users);
  })
);

// GET USER STATS
router.get(
  "/stats",
  verifyTokenAndAdmin,
  asyncWrapper(async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
    // use .aggregate to filter users (this is a function from MongoDB)
    const data = await User.aggregate([
      // filter users by date creation, only let the ones created last year pass through
      { $match: { createdAt: { $gte: lastYear } } },
      // pass along users with their requested field (in this case their month of creation)
      { $project: { month: { $month: "$createdAt" } } },
      // group the remaining users and calculate the total of users for each month
      { $group: { _id: "$month", total: { $sum: 1 } } },
    ]);
    res.status(200).json(data);
  })
);

export default router;
