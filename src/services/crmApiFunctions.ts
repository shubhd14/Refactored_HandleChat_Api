//import axiosRetry from 'axios-retry';
import axios from 'axios';
import { AttributeMetadata, EntityMetadata } from './data/geminiifunctions/hardcodeddata/entitymetadata';
import { BearerToken, crmurl } from './getAccessToken';
let organizationId: string | null = null;

export async function getPluginTraceDetails() {
  try {
    const response = await fetch(crmurl+"plugintracelogs?$top=10", {
      method: "GET",
      headers: {
       'Authorization': `Bearer ${BearerToken}`, // Replace with actual token
          'Accept': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0'
      },
    });
    if (!response.ok) {
      throw new Error(`API call failed with status ${response.status}`);
    }
    const pluginLogs = await response.json();
    console.log("Plugin Logs:", pluginLogs);
    if (!pluginLogs || pluginLogs.length === 0) {
      return "No plugin trace logs were found. It's possible that trace logging is disabled in your environment. If you'd like, I can check whether plugin trace logging is currently disabled.";
    } else {
      return `These are the top 10 trace logs from your CRM environment:\n${JSON.stringify(pluginLogs, null, 2)}\nCurrent date and time is: ${new Date().toISOString()}`;
    }
  } catch (error: any) {
    return `Failed to fetch plugin trace logs. Reason: ${error.message}`;
  }
}
export async function Tracelogchecker(): Promise<string> {
  try {
    const baseUrl = crmurl;
    const endpoint = "organizations?$select=plugintracelogsetting";
    const fullUrl = baseUrl + endpoint;
    const response = await fetch(fullUrl,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${BearerToken}`, // Replace with actual token
          'Accept': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0'
        }
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const isTraceLogEnabled = data?.value?.[0]?.plugintracelogsetting ?? false;
    organizationId = data?.value?.[0]?.organizationid ?? null;
    if (isTraceLogEnabled == 0) {
      console.log("first  :" + isTraceLogEnabled);
      return "Trace logs are disabled in your CRM environment. If you want, I can enable trace logging for you.";
    }
    else {
      return "I’ve confirmed that trace logs are enabled in your CRM environment. However, there may be another issue due to which the trace logs are not being retrieved.";
    }
  } catch (error: any) {
    console.error('Failed to fetch plugintracelogsetting:', error);
    return `Error checking trace log status: ${error.message}`;
  }
}
export async function enableTraceLog(value: number): Promise<string> {
  const baseUrl = crmurl;
  const endpoint = organizationId ? `organizations(${organizationId})` : "";
  const fullUrl = baseUrl + endpoint;
  const patchUrl = fullUrl;
  try {
    const response = await fetch(patchUrl, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${BearerToken}`,
        "Content-Type": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        plugintracelogsetting: value
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PATCH failed: ${response.status} - ${errorText}`);
    }
    return "Trace logs have been enabled in your CRM environment. now you can retrieve plugin trace details.";
  } catch (error: any) {
    return `Error in enable  trace log: ${error.message}`;
  }
}
export async function formatResponseSummary(title: string, followupPrompts: string[]): Promise<any> {
  const time = new Date().toISOString();
  console.log(time);
  const responseJson = {
    title,
    followupPrompts,
    time
  };

  return responseJson;
}
export async function execute_data_operation(entity: string, operation: "GET" | "POST" | "PATCH" | "DELETE", id?: string, body?: Record<string, any>): Promise<any> {
  let url = `${crmurl}/${entity}`;

  // For GET, PATCH, DELETE with ID
  if (id && ["GET", "PATCH", "DELETE"].includes(operation)) {
    url += `(${id})`;
  }
  console.log("🔗 URL:", url);
  console.log("📦 body:", body);

  const config = {
    method: operation,
    url,
    headers: {
      Authorization: `Bearer ${BearerToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "OData-MaxVersion": "4.0",
      "OData-Version": "4.0",
    },
    ...(operation === "POST" || operation === "PATCH"
      ? { data: body || {} }
      : {}),
  };

  try {
    const response = await axios(config);
    return response.data || { success: true, status: response.status };
  } catch (error: any) {
    console.error("Dynamics 365 API Error:", error.response?.data || error.message);
    throw new Error(
      `Dynamics operation failed: ${error.response?.data?.error?.message || error.message}`
    );
  }
}
export async function execute_retrieve_query(partialoDataUrl: string): Promise<any> {
  const fullUrl = `${crmurl}${partialoDataUrl}`;
  console.log("🔗 Full OData Query URL:", fullUrl);
  try {
    const response = await axios.get(fullUrl, {
      headers: {
        Authorization: `Bearer ${BearerToken}`,
        Accept: "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0"
      }
    });
    console.log("✅ API Response Received");
    return response.data;
  } catch (error: any) {
    console.error("❌ Error while fetching OData:", error.message || error);
    return {
      error: true,
      message: error.message || "Unknown error occurred while calling OData API",
    };
  }
}
export async function retrieve_entity_metadata(partialmetadataurl: string, entity: string,attribute:string): Promise<any> {
  const fullUrl = `${crmurl}${partialmetadataurl}`;
  console.log("🔗 Full OData Query URL:", fullUrl);
  console.log("🔗 Entity:", entity);
  console.log("🔗 Attribute:", attribute);
  try {
    const response = await axios.get(fullUrl, {
      headers: {
        Authorization: `Bearer ${BearerToken}`,
        Accept: "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0"
      }
    });
    if (fullUrl.includes("/Attributes")) {
    const rawattributes = (response.data as any).value;
    const entities = rawattributes.map((item: any) => AttributeMetadata.fromJson(item));
    const mappedattributes = entities.map((entity: AttributeMetadata) => ({
      MetadataId: entity.MetadataId,
      DisplayName: entity.getDisplayName(),
      Description: entity.getDescription(),
      LogicalName: entity.LogicalName,
    }));
    if (attribute) {
     const normalizedInput = attribute.replace(/\s+/g, "").toLowerCase();
    const regex = new RegExp(normalizedInput, "i");
    const filteredAttributes = mappedattributes.filter((e: {
      MetadataId: string;
      DisplayName: string;
      Description: string;
      LogicalName: string;
    }) => {
      const normalizedLogicalName = e.LogicalName?.replace(/\s+/g, "").toLowerCase();
      const normalizedDisplayName = e.DisplayName?.replace(/\s+/g, "").toLowerCase();
      return regex.test(normalizedLogicalName) || regex.test(normalizedDisplayName);
    });
   // return filteredAttributes.slice(0, 5).join(", ");
    return JSON.stringify(filteredAttributes.slice(0, 5));

    }else {

      console.log("🧾 Mapped Entities:", mappedattributes);
      //return mappedattributes.slice(0, 5).join(", ");
      return JSON.stringify(mappedattributes);

    }
  }
 else {
    const rawEntities = (response.data as any).value;
    const entities = rawEntities.map((item: any) => EntityMetadata.fromJson(item));
    const mappedEntities = entities.map((entity: EntityMetadata) => ({
      MetadataId: entity.MetadataId,
      DisplayName: entity.getDisplayName(),
      Description: entity.getDescription(),
      LogicalName: entity.LogicalName,
    }));
    if (entity) {
     const normalizedInput = entity.replace(/\s+/g, "").toLowerCase();
    const regex = new RegExp(normalizedInput, "i");
    const filteredEntities = mappedEntities.filter((e: {
      MetadataId: string;
      DisplayName: string;
      Description: string;
      LogicalName: string;
    }) => {
      const normalizedLogicalName = e.LogicalName?.replace(/\s+/g, "").toLowerCase();
      const normalizedDisplayName = e.DisplayName?.replace(/\s+/g, "").toLowerCase();
      return regex.test(normalizedLogicalName) || regex.test(normalizedDisplayName);
    });
    //return filteredEntities.slice(0, 5).join(", ");
     return JSON.stringify(filteredEntities.slice(0, 5));
    }else {

      console.log("🧾 Mapped Entities:", mappedEntities);
      //return mappedEntities.slice(0, 5).join(", ");
      return JSON.stringify(mappedEntities.slice(0, 5));
    }
  }
  } catch (error: any) {
    console.error("❌ Error while fetching OData:", error.message || error);
    return {
      error: true,
      message: error.message || "Unknown error occurred while calling OData API",
    };
  }
}
export async function create_custom_entity( url:string , entityName:string,entityOwnership:string,entityDescription:string,primaryAttributeName:string,primaryattributeDescription:string,primaryattributeRequiredLevel:string,primaryattributeMaxLength:number,additionalAttributes:any): Promise<any> {
   console.log("🔗 URL:", url);
  console.log("📦 entityName:", entityName);
  console.log("📦 entityOwnership:", entityOwnership);
  console.log("📦 entityDescription:", entityDescription);
  console.log("📦 primaryAttributeName:", primaryAttributeName)
  console.log("📦 primaryattributeDescription:", primaryattributeDescription);
  console.log("📦 primaryattributeRequiredLevel:", primaryattributeRequiredLevel);
  console.log("📦 primaryattributeMaxLength:", primaryattributeMaxLength);
  console.log("📦 additionalAttributes:", additionalAttributes);
  if (Array.isArray(additionalAttributes) && additionalAttributes.length > 0) {
    console.log(`📌 additionalAttributes (${additionalAttributes.length}):`);
    additionalAttributes.forEach((attr, index) => {
      console.log(`  🔹 Attribute ${index + 1}:`);
      console.log(`    ▪ schemaName: ${attr.schemaName}`);
      console.log(`    ▪ displayName: ${attr.displayName}`);
      console.log(`    ▪ dataType: ${attr.dataType}`);
      console.log(`    ▪ description: ${attr.description}`);
      console.log(`    ▪ requiredLevel: ${attr.requiredLevel}`);
      console.log(`    ▪ maxLength: ${attr.maxLength}`);
      console.log(`    ▪ targetEntity: ${attr.targetEntity}`);
      console.log(`    ▪ optionSetOptions: ${Array.isArray(attr.optionSetOptions) ? attr.optionSetOptions.join(", ") : null}`);
    });
  } else {
    console.log("📌 additionalAttributes: None");
  }
}

