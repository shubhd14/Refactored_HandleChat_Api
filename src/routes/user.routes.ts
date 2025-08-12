import express from "express";
import  ServiceManager from "../services/CRMTraceLogServices";
import { crmConnection } from "../services/getAccessToken";
import { handleChatRequestApi } from "../controllers/chatController";


const router = express.Router();
const service = new ServiceManager();

router.route("/handlechatrequest").post(handleChatRequestApi);
router.get("/Bearertoken",crmConnection);

export default router;