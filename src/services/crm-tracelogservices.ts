import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import RequestBody from "../models/masterjsonbody/requestbody";
import { PluginFilter,PluginFilterRequest } from "../models/plugin-filter-dto";
import {
  CreatingEntity,
  EntityIdReturnBack,
  AddSolutionComponent,
  CreateLookupField,
  UpdateEntity,
  creatingAttribute,
  updatingattributes,
} from "./crm-service";

export let defaultsolutionname: string = "";

/**
 * Service class for handling CRM Trace Log operations.
 * All public methods are intended as controller endpoints.
 */
export default class CRMTraceLogServices {
  /**
   * Main entry for CRM customization execution.
   * Handles both entity creation and update workflows.
   */
  public async executeCrmCustomizations(
    req: Request,
    res: Response
  ): Promise<void> {
    let result: unknown;
    const finalpostmanresponse: unknown[] = [];
    const parsedResponse: RequestBody = req.body;

    // ✅ Validate entity fields
    const entityValidation = this.validateRequiredFields(parsedResponse.entity, [
      "schemaName",
      "displayName",
    ]);
    if (!entityValidation.isValid) {
      finalpostmanresponse.push(
        "Entity missing required field(s): " + entityValidation.missingFields
      );
      return;
    }

    const invalidAttributes = parsedResponse.entity.attributes
      .map((attr, index) => ({
        index,
        ...this.validateRequiredFields(attr, ["schemaName", "displayName"]),
      }))
      .filter((result) => !result.isValid);

    if (invalidAttributes.length > 0) {
      finalpostmanresponse.push(
        "Some attributes are missing required fields"
      );
      return;
    }

    try {
      if (parsedResponse.entity.id == null) {
        res.status(202).json({
          success: true,
          message: [
            "CRM customization is processing in the background. Check Dataverse after a few minutes",
          ],
        });

        result = await CreatingEntity(parsedResponse.entity);
        const entityid = await EntityIdReturnBack(
          parsedResponse.entity.schemaName
        );

        if (defaultsolutionname != null) {
          result = await AddSolutionComponent(entityid, "entity");
        }

        if (
          Array.isArray(parsedResponse.relationships) &&
          parsedResponse.relationships.length > 0
        ) {
          for (const relation of parsedResponse.relationships) {
            result = await CreateLookupField(relation);
            finalpostmanresponse.push(result);
          }
        }
      } else if (parsedResponse.entity.id != null) {
        const filledProperties = Object.entries(parsedResponse.entity)
          .filter(
            ([key, value]) =>
              value !== null && key !== "schemaName" && key !== "id"
          )
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {} as Record<string, unknown>);

        if (Object.keys(filledProperties).length > 0) {
          result = await UpdateEntity(parsedResponse.entity);
          finalpostmanresponse.push(result);
        }

        const attributesForCreate = parsedResponse.entity.attributes.filter(
          (attr: { id?: string }) => attr.id == null
        );
        if (attributesForCreate.length > 0) {
          result = await creatingAttribute(
            attributesForCreate,
            parsedResponse.entity.schemaName
          );
          finalpostmanresponse.push(result);
        }

        const attributesForUpdate = parsedResponse.entity.attributes.filter(
          (attr: { id?: string }) => attr.id != null
        );
        if (attributesForUpdate.length > 0) {
          result = await updatingattributes(attributesForUpdate);
          finalpostmanresponse.push(result);
        }

        if (
          Array.isArray(parsedResponse.relationships) &&
          parsedResponse.relationships.length > 0
        ) {
          for (const relation of parsedResponse.relationships) {
            result = await CreateLookupField(relation);
            finalpostmanresponse.push(result);
          }
        }
      }
    } catch (error: unknown) {
      res.status(500).json({
        message: error instanceof Error ? error.message : String(error),
      });
      finalpostmanresponse.push(error);
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
      return path.split(".").reduce((o, key) => (o ? o[key] : undefined), obj);
    };

    for (const property of propertiesToCompare) {
      const key = property.split(".").pop() || property;
      const value1 = getNestedValue(input1, property);
      const value2 = getNestedValue(input2.entity, key);

      if (
        value1 !== undefined &&
        value2 !== undefined &&
        value1 !== value2
      ) {
        mismatches.push(`${key}: ${value1} !== ${value2}`);
      }
    }

    return mismatches.length > 0;
  }

  public async GetPluginTraceLog(
    req: PluginFilterRequest,
    res: Response
  ): Promise<void> {
    console.log("baseurl");

    const inputJson:PluginFilter = req.body.pluginfilter;
    let recordCount = 0;

    if (inputJson.recordCount) {
      recordCount = (inputJson.recordCount, 10);
    } else {
      recordCount = 100;
    }

    const conditions: string[] = [];

    if (inputJson.pluginTypeName) {
      const names = inputJson.pluginTypeName
        .trim()
        .split(",")
        .map((e: string) => e.trim());
      const conditionStrings = names.map(
        (name: string) =>
          `condition attribute="typename" operator="like" value="%${name}%"/>`
      );
      conditions.push(`<filter type="or">${conditionStrings.join("")}</filter>`);
    }

    if (inputJson.entityLogicalName) {
      const entities = inputJson.entityLogicalName
        .trim()
        .split(",")
        .map((e: string) => e.trim());
      const conditionStrings = entities.map(
        (entity: string) =>
          `<condition attribute="primaryentity" operator="like" value="%${entity}%" />`
      );
      conditions.push(`<filter type="or">${conditionStrings.join("")}</filter>`);
    }

    if (inputJson.messagename) {
      conditions.push(
        `<condition attribute="messagename" operator="like" value="%${inputJson.operationType}%" />`
      );
    }

    if (inputJson.correlationId) {
      conditions.push(
        `<condition attribute="correlationid" operator="eq" value="${inputJson.correlationId}" />`
      );
    }

    if (inputJson.userName) {
      conditions.push(
        `<condition attribute="createdby" operator="like" value="%${inputJson.userName}%" />`
      );
    }

    if (inputJson.errorMessage) {
      conditions.push(
        `<condition attribute="exceptiondetails" operator="like" value="%${inputJson.errorMessage}%" />`
      );
    } else if (inputJson.exceptionOnly) {
      conditions.push(`<condition attribute="exceptiondetails" operator="not-null" />`);
      conditions.push(`<condition attribute="exceptiondetails" operator="ne" value=""/>`);
    }

    if (inputJson.maxduration) {
      conditions.push(
        `<condition attribute="performanceexecutionduration" operator="le" value="${inputJson.maxduration}"/>`
      );
    }

    if (inputJson.minduration) {
      conditions.push(
        `<condition attribute="performanceexecutionduration" operator="ge" value="${inputJson.minduration}"/>`
      );
    }

    if (inputJson.dateRange?.startDate) {
      conditions.push(
        `<condition attribute="createdon" operator="on-or-after" value="${inputJson.dateRange?.startDate}"/>`
      );
    }

    if (inputJson.dateRange?.endDate) {
      conditions.push(
        `<condition attribute="createdon" operator="on-or-before" value="${inputJson.dateRange?.endDate}"/>`
      );
    }

    if (inputJson.processType) {
      conditions.push(
        `<condition attribute="operationtype" operator="eq" value="${inputJson.processType}"/>`
      );
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
            ${conditions.join("\n")}
          </filter>
          <link-entity name="sdkmessageprocessingstep" from="sdkmessageprocessingstepid" to="pluginstepid" alias="step">
            <attribute name="name" />
            <attribute name="stage" />
            <attribute name="rank" />
            <attribute name="mode" />
            ${
              sdkStepConditions.length > 0
                ? `<filter type="and">${sdkStepConditions.join("\n")}</filter>`
                : ""
            }
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
