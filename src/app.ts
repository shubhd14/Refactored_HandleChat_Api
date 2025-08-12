import express, { Router } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes";
import chatRouter from "./routes/chat.routes";

const app = express();

// Ensure CORS_ORIGIN is treated as a non-nullable string
const rawOrigins = process.env.CORS_ORIGIN ?? "";
const allowedOrigins: string[] = rawOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

app.use(
  cors({
    origin: function (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(bodyParser.json());

app.get("/", (_req, res) => {
  res.send("✅ API is live on Cloud Run!");
});

//routes import
app.use("/api/v1.0/users", userRouter);
app.use("/api/v1.0/chat", chatRouter);

export { app };
