
import CreateEntity from "../models/entitymodels/createntitymodel";
import EntityMetadata from "../models/modelsinterface/entityinterface";
import axios, { AxiosError } from "axios";
import Solutioninterface from "../models/modelsinterface/solutioninterface";
import AddComponent from "../models/modelsinterface/solutionmodel/addcomponent";
import Lookupinterface from "../models/modelsinterface/lookupinterface";
import Createlookup from "../models/relationshipmodel/createlookupfield";
import updateentity from "../models/entitymodels/updateentitymodel";
import CRMTraceLogServices from "./CRMTraceLogServices";
import AttributeInterface from "../models/modelsinterface/attributeinterface";
import { CreateAttributesMethod } from "../helpers/attributeHelpers";
import { genAI } from "./chatService";
import { BearerToken } from "./getAccessToken";
import { cleanText } from "./systemmessagebuilder";

import { UpdateAttributesmethod } from "../helpers/attributeHelpers";

export let crmurl: string = "";
export let defaultsolutionname: string = "";


export async function Crmaction(input: any, chatmodel: number): Promise<string | null> {
  const maxRetries = 3;
  const retryDelay = 1000;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const chat = model.startChat({ history: input });

      let result, response, text;

      if (chatmodel === 0) {
        result = await chat.sendMessage("map all the collected details in the json");
      } else {
        const prompt = "Extract only the plugin-related filter values (including duration and date/time per specified rules) from the entire conversation history. Populate only the values explicitly mentioned; everything else must be null. Do not assume or infer any value. Return only the required JSON object, no explanation.";
        result = await chat.sendMessage(prompt);
      }

      response = await result.response;
      text = response.text();
      const plaintext = cleanText(text, chatmodel);
      return plaintext;
    } catch (err: any) {
      console.error(`Attempt ${attempt + 1} failed:`, err);
      attempt++;
      if (attempt < maxRetries) {
        await new Promise(res => setTimeout(res, retryDelay));
      } else {
        return err.toString();
      }
    }
  }

  return null;
}

export async function CreatingEntity(createobj: EntityMetadata): Promise<string> {
    const url = crmurl;
    const entityData = new CreateEntity(createobj);
    try {
      const response = await axios.post(url + "EntityDefinitions", entityData, {
        headers: {
          'Authorization': `Bearer ${BearerToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      return createobj.displayName + " Entity created successfully";
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error in creating a new entity:', {
        message: axiosError.message,
        response: axiosError.response ? axiosError.response.data : null,
        config: axiosError.config,
        requestData: entityData
      });
      return axiosError.message;
    }
  }




  //lestup functions

  export async function EntityIdReturnBack(
    logicalname: string
  ): Promise<string> {
    const url = crmurl;
    const service = new CRMTraceLogServices();
    console.log(logicalname);
    try {
      // const bearerToken = await service.getAccessToken();
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      await delay(10000);
      const response = await axios.get(
        `${url}EntityDefinitions(LogicalName='${logicalname}')`,
        {
          headers: {
            Authorization: `Bearer ${BearerToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      console.log(response.data.MetadataId + "karan");
      return response.data.MetadataId;
    } catch (error) {
      return "Error retrieving entity ID";
    }
  }

  export  async function AddSolutionComponent(Componentid: string, Type: string): Promise<string> {
    const url = crmurl;
    const service = new CRMTraceLogServices();
    const SolutionUniqueName = defaultsolutionname;
    const ComponentMeatadatId = Componentid;
    const ComponentType = Type;
    const data: Solutioninterface = {
      componentType: ComponentType,
      componentId: ComponentMeatadatId,
      solutionUniqueName: SolutionUniqueName || "",
      addRequiredComponents: true,
      doNotIncludeSubcomponents: false,
    };
    const Solutiondata = new AddComponent(data);
    try {
      const response = await axios.post(
        `${url}AddSolutionComponent`,
        Solutiondata,
        {
          headers: {
            Authorization: `Bearer ${BearerToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      return `Component added to ${SolutionUniqueName} solution successfully`;
    } catch (error) {
      return "Error in adding component to solution";
    }
  }

  export async function CreateLookupField(look: Lookupinterface): Promise<string> {
    const url = crmurl;
    // const bearerToken = await this.getAccessToken();
    const idName: string | undefined = process.env.YOUR_ORG;
    const lookupdata = new Createlookup(look);
    try {
      const response = await axios.post(`${url}RelationshipDefinitions`, lookupdata, {
        headers: {
          'Authorization': `Bearer ${BearerToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      return `Lookup Field successfully`
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error in creating  a lookup field :', {
        message: axiosError.message,
        response: axiosError.response ? axiosError.response.data : null,
        config: axiosError.config,
        requestData: lookupdata
      });
      return axiosError.message;
    }
  }
 
  export async function UpdateEntity(updateobj: EntityMetadata): Promise<string> {
    const url = crmurl;
    const entityData = new updateentity(updateobj);
    console.log(JSON.stringify(entityData, null, 2));

    var updateurl = `${url}` + "EntityDefinitions" + `(${updateobj.id})`;
    console.log(updateurl);
    console.log(JSON.stringify(entityData, null, 2));

    try {
      const response = await axios.put(updateurl, entityData, {
        headers: {
          'Authorization': `Bearer ${BearerToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      return updateobj.displayName + "Entity updated successfully";
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error in updating entity entity:', {
        message: axiosError.message,
        // response: axiosError.response ? axiosError.response.data : null,
        config: axiosError.config,
        requestData: entityData
      });
      return "Error in updating entity";


    }
  }
  

   export async function updatingattributes(updateattrobj: AttributeInterface[]): Promise<string> {
    const url = crmurl;
    const services = new CRMTraceLogServices();
    try {
      const updateattributedata = UpdateAttributesmethod(updateattrobj);
      const updatePromises = updateattributedata.map((attribute) => {
        console.log(JSON.stringify(attribute, null, 2));
        const updateurl = `${url}EntityDefinitions(LogicalName='${attribute.EntityLogicalName}')/Attributes(LogicalName='${attribute.SchemaName}')`;
        console.log(updateurl);
        return axios.put(updateurl, attribute, {
          headers: {
            'Authorization': `Bearer ${BearerToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      });
      await Promise.all(updatePromises);
      return "Attributes updated successfully";
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error in Updating  Attributes:', {
        message: axiosError.message,
        response: axiosError.response ? axiosError.response.data : null,
        config: axiosError.config,
      });
      return axiosError.message;
    }
  }
  
  export async function  creatingAttribute(createAtrrobj: AttributeInterface[], entityname: string): Promise<string> {
    const url = crmurl;
    const services = new CRMTraceLogServices();

    try {

      const CreateAttributes = CreateAttributesMethod(createAtrrobj);

      for (const attribute of CreateAttributes) {
        const updateurl = `${url}EntityDefinitions(LogicalName='${entityname}')/Attributes`;
        console.log(updateurl);
        try {
          const response = await axios.post(updateurl, attribute, {
            headers: {
              Authorization: `Bearer ${BearerToken}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });

        } catch (error) {
          return "Error creating attribute";
        }
      }

      return 'Attribute  created Sucessfully ';

    } catch (error) {
      const axiosError = error as AxiosError;

      return axiosError.message;
    }
  }
 