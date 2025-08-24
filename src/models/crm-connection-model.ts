import mongoose from "mongoose";

const crmConnectionSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true },
  clientId: { type: String, required: true },
  clientSecret: { type: String, required: true },
  enviromentUrl: { type: String, required: true },
  connectionName: { type: String },
  defaultSolutionName: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

const CRMConnectionModel = mongoose.model("CRMConnection", crmConnectionSchema);
export default CRMConnectionModel;
