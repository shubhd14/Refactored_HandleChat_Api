
import {Request,Response} from "express";
import {v4 as uuidv4} from "uuid";
import RequestBody from "../models/masterjsonbody/requestbody";
import { CreatingEntity } from "./crmService";
import { EntityIdReturnBack, AddSolutionComponent,CreateLookupField,UpdateEntity,creatingAttribute,updatingattributes } from "./crmService";
export let defaultsolutionname: string = "";

 export default class CRMTraceLogServices{

 async executeCrmCustomizations(req: Request, res: Response): Promise<void> {
    const SolutionUniqueName = process.env.SolutionUniqueName;
    const processId = uuidv4();
    let result;
    const logs: string[] = [];
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const service = new CRMTraceLogServices()
    let finalpostmanresposne = [];
    const parsedResponse: RequestBody = req.body
   
    const entityValidation = service.validateRequiredFields(parsedResponse.entity, ['schemaName', 'displayName']);
    if (!entityValidation.isValid) {
      finalpostmanresposne.push("Entity missing requried field : " + entityValidation.missingFields);
  
      return;
    }
    const invalidAttributes = parsedResponse.entity.attributes.map((attr, index) => ({ index, ...service.validateRequiredFields(attr, ['schemaName', 'displayName']), })).filter((result) => !result.isValid);
    if (invalidAttributes.length > 0) {
      finalpostmanresposne.push("Some attributes are missing required fields");

      return;
    }
    try {
      if (parsedResponse.entity.id == null) {
        
        res.status(202).json(
          {
            sucess: true,
            message: ['CRM customization is processing in the background. Check Dataverse after a few minutes']
          }
        );

        result = await CreatingEntity(parsedResponse.entity);
        
        const entityid = await EntityIdReturnBack(parsedResponse.entity.schemaName);
        if (defaultsolutionname != null) {
          result = await AddSolutionComponent(entityid, "entity");
        }
        //finalpostmanresposne.push(result);
        if (Array.isArray(parsedResponse.relationships) && parsedResponse.relationships.length > 0) {
          for (const relation of parsedResponse.relationships) {
            result = await CreateLookupField(relation);
            finalpostmanresposne.push(result);
          }
        }
      }
      else if (parsedResponse.entity.id != null) {
        const filledProperties = Object.entries(parsedResponse.entity).filter(([key, value]) => value !== null && key !== 'schemaName' && 'id').reduce((acc, [key, value]) => { acc[key] = value; return acc; }, {} as Record<string, any>);
        if (Object.keys(filledProperties).length > 0) {
          result = await UpdateEntity(parsedResponse.entity);
          finalpostmanresposne.push(result);
        }
        const AttributeForCreate = parsedResponse.entity.attributes.filter((attr: { id?: string }) => attr.id == null);
        if (AttributeForCreate.length > 0) {
          result = await creatingAttribute(AttributeForCreate, parsedResponse.entity.schemaName);
          finalpostmanresposne.push(result);
        }
        const Attributeforupdate = parsedResponse.entity.attributes.filter((attr: { id?: string }) => attr.id != null)
        if (Attributeforupdate.length > 0) {
          result = await updatingattributes(Attributeforupdate);
          finalpostmanresposne.push(result);
        }
        if (Array.isArray(parsedResponse.relationships) && parsedResponse.relationships.length > 0) {
          for (const relation of parsedResponse.relationships) {
            result = await CreateLookupField(relation);
            finalpostmanresposne.push(result);

          }
        }
      }
    } catch (error: any) {
      res.status(500).json({
        message: error,
      });
      finalpostmanresposne.push(error);
    }
  }
  validateRequiredFields<T extends object>(
    obj: T,
    requiredFields: (keyof T)[]
  ): { isValid: boolean; missingFields: string[] } {
    const missingFields = requiredFields.filter(
      (field) => obj[field] === null || obj[field] === undefined
    );

    return {
      isValid: missingFields.length === 0,
      missingFields: missingFields.map(String),
    };
  }
  isSchemaNameMatching(input1: any, input2: any): boolean {
    const mismatches: string[] = [];
    const propertiesToCompare = [
      "SchemaName",
      "DisplayName.UserLocalizedLabel.Label",
      "DisplayCollectionName.UserLocalizedLabel.Label",
      "OwnershipType",
      "IsActivity",
      "HasActivities",
      "HasNotes",
    ];
    const getNestedValue = (obj: any, path: string): any => {
      return path.split('.').reduce((o, key) => (o ? o[key] : undefined), obj);
    };
    for (const property of propertiesToCompare) {
      const key = property.split('.').pop() || property;
      const value1 = getNestedValue(input1, property);
      const value2 = getNestedValue(input2.entity, key);

      if (value1 !== undefined && value2 !== undefined && value1 !== value2) {
        mismatches.push(`${key}: ${value1} !== ${value2}`);
      }
    }
    return mismatches.length > 0;
  }
  async GetPluginTraceLog(req: Request, res: Response): Promise<void> {
    const ser = new CRMTraceLogServices();
    let entities;
    console.log("baseurl");
    const inputJson = req.body.pluginfilter as any;
    let recordCount = 0;
    console.log("recordCount", recordCount)
    console.log(inputJson)
    var input = inputJson;
    if (input.recordCount) {
      recordCount = parseInt(input.recordCount, 10);
    }
    else
      recordCount = 100;
    console.log(recordCount);
    const conditions: string[] = [];
    if (input.pluginTypeName) {
      const name = input.pluginTypeName.trim().split(',').map((e: string) => e.trim());
      const conditionStrings = name.map((name: string) => {
        return `condition attribute="typename" operator="like" value="%${name}%"/>`;
      });
      const filterString = `<filter type="or">${conditionStrings.join('')}</filter>`
      conditions.push(filterString);
    }
    // conditions.push(`<condition attribute="typename" operator="like" value="%${input.pluginTypeName}%" />`);
    if (input.entityLogicalName) {
      const entities = input.entityLogicalName.trim().split(',').map((e: string) => e.trim());
      const conditionStrings = entities.map((entity: string) => {
        return `<condition attribute="primaryentity" operator="like" value="%${entity}%" />`;
      });
      const filterString = `<filter type="or">${conditionStrings.join('')}</filter>`
      conditions.push(filterString);
    }
    if (input.messagename)
      conditions.push(`<condition attribute="messagename" operator="like" value="%${input.operationType}%" />`);
    if (input.correlationId)
      conditions.push(`<condition attribute="correlationid" operator="eq" value="${input.correlationId}" />`);
    if (input.userName)
      conditions.push(`<condition attribute="createdby" operator="like" value="%${input.userName}%" />`);
    if (input.errorMessage)
      conditions.push(`<condition attribute="exceptiondetails" operator="like" value="%${input.errorMessage}%" />`);
    else if (input.exceptionOnly) {
      conditions.push(`<condition attribute="exceptiondetails" operator="not-null" />`);
      conditions.push(`<condition attribute="exceptiondetails" operator="ne" value=""/>`);
    }
    if (input.maxduration) {
      conditions.push(`<condition attribute="performanceexecutionduration" operator="le" value="${input.maxduration}"/>`);
    }
    if (input.minduration) {
      conditions.push(`<condition attribute="performanceexecutionduration" operator="ge" value="${input.minduration}"/>`);
    }
    if (input.dateRange?.startDate) {
      conditions.push(`<condition attribute="createdon" operator="on-or-after" value="${input.dateRange?.startDate}"/>`);
    }
    if (input.dateRange?.endDate) {
      conditions.push(`<condition attribute="createdon" operator="on-or-before" value="${input.dateRange?.endDate}"/>`);
    }
    if (input.processType) {
      conditions.push(`<condition attribute="operationtype" operator="eq" value="${input.processType}"/>`);
    }
    const sdkStepConditions: string[] = [];
    const fetchXml = `
          <fetch count="${recordCount}">
          <entity name="plugintracelog">
            <attribute name="createdon"/>
            <attribute name="typename"/>
            <attribute name="plugintracelogid"/>
            <attribute name="messagename"/>
            <attribute name="performanceexecutionduration"/>
            <attribute name="performanceexecutionstarttime"/>
            <attribute name="pluginstepid"/>
            <attribute name="depth"/>
            <attribute name="operationtype"/>
            <attribute name="primaryentity"/>
            <attribute name="messageblock"/>
            <attribute name="exceptiondetails"/>
            <attribute name="correlationid"/>
            <order attribute="performanceexecutionstarttime" descending="true" />
            <filter type="and">
              ${conditions.join('\n')}
            </filter>
            <link-entity name="sdkmessageprocessingstep" from="sdkmessageprocessingstepid" to="pluginstepid" alias="step">
              <attribute name="name" />
              <attribute name="stage" />
              <attribute name="rank" />
              <attribute name="mode" />
              ${sdkStepConditions.length > 0 ? `<filter type="and">${sdkStepConditions.join('\n')}</filter>` : ''}
            </link-entity>
            <link-entity name="systemuser" from="systemuserid" to="createdby" alias="createdbyuser">
              <attribute name="fullname" />
            </link-entity>
          </entity>
        </fetch>`.trim();
    const encodedFetchXml = encodeURIComponent(fetchXml);
    console.log(fetchXml);
    console.log(encodedFetchXml);
  }
}