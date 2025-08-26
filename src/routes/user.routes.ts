import express from "express";
import  ServiceManager from "../services/crm-tracelogservices";
import { handleChatRequestApi } from "../controllers/chat-controller";



const router = express.Router();
const service = new ServiceManager();

router.route("/handlechatrequest").post(handleChatRequestApi);


export default router;