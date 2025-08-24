// src/controllers/crmController.ts
import  { Request, Response } from 'express';

export interface CrmConnection extends Request {
user?: any;
}

interface CrmCon {
   tenantId: string;
  clientId: string;
  clientSecret: string;
  enviromentUrl: string;
  userId: string;
  updatedAt: Date;
  connectionName?: string | null;
  defaultSolutionName?: string | null;
}


const SaveCrmConnection = async (req: CrmConnection, res: Response) => {
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
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Example encryption (replace with real logic if needed)
    const encryptedTenantId = tenantId;
    const encryptedClientId = clientId;
    const encryptedClientSecret = clientSecret;
    const encryptedEnvUrl = enviromentUrl;

    const crmData = {
      connectionName,
      tenantId: encryptedTenantId,
      clientId: encryptedClientId,
      clientSecret: encryptedClientSecret,
      enviromentUrl: encryptedEnvUrl,
      defaultCrmSolutions,
      updatedAt: new Date(),
    };

    // Add logic to save crmData here

    res.status(200).json({ success: true, message: 'CRM Connection saved successfully' });
  } catch (err) {
    console.error('Error saving CRM connection:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}



const getCrmConnection = async (userId: string) => {
    if (!userId) return null;


    
    //  Decrypt all fields


};

export { SaveCrmConnection, getCrmConnection };