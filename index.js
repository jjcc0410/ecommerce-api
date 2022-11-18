import express from "express";
const app = express();
import connection from "./db/connection";
import userRoute from "./routes/user";
import authRoute from "./routes/auth";
import productRoute from "./routes/product";
import cartRoute from "./routes/cart";
import orderRoute from "./routes/order";
import stripeRoute from "./routes/stripe";
import cors from "cors";

connection();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/payment", orderRoute);
app.use("/api/checkout", stripeRoute);

app.listen(
  process.env.PORT,
  console.log(`Backend server running on port ${process.env.PORT}`)
);
