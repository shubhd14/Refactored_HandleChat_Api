import { Router } from "express";
import {
  getToken,
  logoutUser,
} from "../middleware/auth.middleware";
import { crmConnection } from "../services/getAccessToken"; // ✅ import added
import { handleChatRequestApi } from "../controllers/chatController";

const router = Router();

// Auth route
router.route("/auth").post(getToken);

// CRM Access Token route ✅ ADD THIS
router.get("/Bearertoken", crmConnection);

// logout user
router.route("/logout").post(logoutUser);
router.post("/handlechatrequest", handleChatRequestApi); 

export default router;
