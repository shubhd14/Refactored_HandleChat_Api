import express from "express";
import  ServiceManager from "../services/crm-tracelogservices";
import { crmConnection } from "../services/get-access-token";
import { handleChatRequestApi } from "../controllers/chat-controller";


const router = express.Router();
const service = new ServiceManager();

router.route("/handlechatrequest").post(handleChatRequestApi);
router.get("/Bearertoken",crmConnection);

export default router;