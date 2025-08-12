import dotenv from "dotenv";
import connectDB from "./config/db";
import { app } from "./app";
dotenv.config();

const port = process.env.PORT || 8080;
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running at port : ${port}`);
    });
  })
  .catch((err) => {
    console.log("mongoDB connection failed", err);
  });
