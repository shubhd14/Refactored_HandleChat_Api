// src/controllers/crmController.ts

import axios from "axios";
import { URLSearchParams } from "url";
import { Request, Response } from "express";
import CRMConnectionModel from "../models/crm-connection-model";

// Runtime globals (not recommended for production, but okay temporarily)
export let BearerToken: string = "";
export let crmurl: string = "";
export let defaultsolutionname: string = "";

// Request type with optional user
export interface AuthRequest extends Request {
  user?: any;
}

export interface CrmConnectionDetails {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  enviromentUrl: string;
  defaultSolutionName: string;
  connectionName: string;
}

export interface CrmAuthResponse {
  success: boolean;
  accessToken?: string;
  crmUrl?: string;
  defaultSolutionName?: string;
  connectionName?: string;
  message: string;
}

// ✅ Save CRM connection in MongoDB
export const SaveCrmConnection = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.uid;

  const {
    tenantId,
    clientId,
    clientSecret,
    enviromentUrl,
    defaultCrmSolutions,
    connectionName,
  } = req.body;

  if (!userId || !tenantId || !clientId || !clientSecret || !enviromentUrl) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    const crmData = {
      userId,
      connectionName,
      tenantId,
      clientId,
      clientSecret,
      enviromentUrl,
      defaultSolutionName: defaultCrmSolutions,
      updatedAt: new Date(),
    };

    const existing = await CRMConnectionModel.findOne({ userId });

    if (existing) {
      await CRMConnectionModel.updateOne({ userId }, crmData);
      return res.status(200).json({
        success: true,
        message: "CRM Connection updated successfully",
      });
    } else {
      await CRMConnectionModel.create(crmData);
      return res.status(200).json({
        success: true,
        message: "CRM Connection saved successfully",
      });
    }
  } catch (err) {
    console.error("Error saving CRM connection:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//  Get CRM connection from MongoDB (temporary logic with 'any')
export const getCrmConnection = async (userId: string): Promise<any | null> => {
  try {
    const connection = await CRMConnectionModel.findOne({ userId }).lean();
    return connection || null;
  } catch (error) {
    console.error("Failed to fetch CRM connection:", error);
    return null;
  }
};

//  Fetch access token using saved CRM connection
export const crmConnection = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  if (!userId) {
    res.status(400).json({ success: false, message: "Unauthorized user" });
    return;
  }

  const connection = await getCrmConnection(userId);

  if (!connection) {
    console.log("No CRM connection found for user");
    res
      .status(404)
      .json({ success: false, message: "CRM connection not found" });
    return;
  }

  const url = `https://login.microsoftonline.com/${connection.tenantId}/oauth2/v2.0/token`;
  const scopeUrl = connection.enviromentUrl + "/.default";

  const formData = new URLSearchParams();
  formData.append("grant_type", "client_credentials");
  formData.append("client_id", connection.clientId);
  formData.append("scope", scopeUrl);
  formData.append("client_secret", connection.clientSecret);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    BearerToken = response.data.access_token;
    crmurl = connection.enviromentUrl + "/api/data/v9.1/";
    defaultsolutionname = connection.defaultSolutionName;

    res.status(200).json({
      success: true,
      connectionName: connection.connectionName,
      message: "Access token fetched successfully",
    });
  } catch (error: any) {
    console.error(
      "Token fetch error:",
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({ success: false, message: "Unable to fetch access token" });
  }
};
