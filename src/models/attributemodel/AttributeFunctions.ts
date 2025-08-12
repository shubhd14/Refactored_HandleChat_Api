import axios from "axios";
import CRMTraceLogServices from "../../services/CRMTraceLogServices";
import { BearerToken } from "../../services/getAccessToken";

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