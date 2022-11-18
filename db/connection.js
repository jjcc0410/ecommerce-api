import mongoose from "mongoose";
import {} from "dotenv/config";
import asyncWrapper from "../middleware/asyncWrapper";

const connection = asyncWrapper(async () => {
  mongoose.connect(process.env.MONGO_URL);
  console.log("DB Connection Successfull!");
});

export default connection;
