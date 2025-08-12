
import { SchemaType, FunctionDeclaration } from "@google/generative-ai";
export const functionDeclarations: FunctionDeclaration[] = [
    {
      name: "Tracelogchecker",
      description:
        "Checks whether trace log is currently enabled or not. Called when the user wants to check the trace log is enable or not .",
    },
 {
  name: "retrieve_entity_metadata",
  description: "Retrieves metadata for Dynamics 365 entities and their attributes. This function is used when a user prompt mentions an entity name or display name (e.g., 'contact'). It begins by fetching all entities using `/EntityDefinitions?$select=LogicalName,DisplayName,Description,MetadataId`, then filters entities whose LogicalName or DisplayName contains the user-provided keyword. These matched entities are presented to the user for confirmation. Once the user selects the correct entity, this function fetches attribute metadata using `/EntityDefinitions(LogicalName='<confirmedLogicalName>')/Attributes?$select=DisplayName,LogicalName,MetadataId`. This attribute metadata is used to match any attribute names (e.g., 'salary') mentioned in the prompt, enabling accurate metadata access and OData query construction.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      partialmetadataurl: {
        type: SchemaType.STRING,
        description: "The relative metadata URL starting with `/EntityDefinitions`. Only the following formats are supported:\n\n1. `/EntityDefinitions?$select=LogicalName,DisplayName,Description,MetadataId` – Fetches metadata of all entities. This is used in the first step to identify and confirm the entity mentioned by the user (e.g., 'contact').\n\n2. `/EntityDefinitions(LogicalName='<entity>')/Attributes?$select=DisplayName,LogicalName,MetadataId` – Fetches all attribute metadata for the confirmed entity. This is used in the second step to locate the attribute mentioned by the user (e.g., 'salary').\n\n❌ Do not use unsupported query options like `$filter`, `$expand`, or `contains`.\n✅ Always use `$select` to limit metadata fields and keep responses optimized.\n✅ Always wait for user confirmation after listing matched entities before fetching attribute metadata."
      },
      entity: {
        type: SchemaType.STRING,
        description: "The display name or logical name of the entity mentioned in the user prompt. This is auto-detected from user input (e.g., in the prompt 'show me metadata of contact entity', the entity value should be 'contact')"
      },
      attribute: {
        type: SchemaType.STRING,
        description: "The display name or logical name of the attribute mentioned in the user prompt. This is auto-detected from user input (e.g., in the prompt 'show me metadata of last name attribute of contact entity', the attribute value should be 'lastname')"
      }
    },
    required: ["partialmetadataurl", "entity","attribute"]
  }
},
{
  name: "create_custom_entity",
  description: "Creates a new custom entity in Dynamics 365 with a primary attribute and optional additional attributes using the Web API. Do not assume or add values to any parameter. If the user prompt does not provide a value, set that parameter to null. Only use what the user has explicitly mentioned.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      url: {
        type: SchemaType.STRING,
        description: "The Dynamics 365 Web API endpoint to create the entity. This should include the base path '/EntityDefinitions'."
      },
      entityName: {
        type: SchemaType.STRING,
        description: "The singular display name of the new entity, e.g., 'Player'."
      },
      entityOwnership: {
        type: SchemaType.STRING,
        description: "Defines whether the entity is owned by individual users or the organization."
      },
      entityDescription: {
        type: SchemaType.STRING,
        description: "A description of the custom entity. Leave null if not mentioned by user."
      },
      primaryAttributeName: {
        type: SchemaType.STRING,
        description: "The display name of the entity’s primary attribute (e.g., 'Player Name')."
      },
      primaryattributeDescription: {
        type: SchemaType.STRING,
        description: "Description of the primary attribute. Leave null if not provided."
      },
      primaryattributeRequiredLevel: {
        type: SchemaType.STRING,
        description: "Specifies whether the primary attribute is mandatory. Leave null if not provided."
      },
      primaryattributeMaxLength: {
        type: SchemaType.INTEGER,
        description: "Maximum character length for the primary attribute. Leave null if not provided."
      },
      additionalAttributes: {
        type: SchemaType.ARRAY,
        description: "Optional array of additional attributes to be created along with the entity.",
        items: {
          type: SchemaType.OBJECT,
          properties: {
            schemaName: {
              type: SchemaType.STRING,
              description: "Schema name of the attribute (e.g., 'dev_Age')."
            },
            displayName: {
              type: SchemaType.STRING,
              description: "Display name of the attribute (e.g., 'Age')."
            },
            dataType: {
              type: SchemaType.STRING,
            
              description: "Data type of the attribute."
            },
            description: {
              type: SchemaType.STRING,
              description: "Description of the attribute. Leave null if not provided."
            },
            requiredLevel: {
              type: SchemaType.STRING,
              description: "Whether this attribute is required. Leave null if not provided."
            },
            maxLength: {
              type: SchemaType.INTEGER,
              description: "For String type: Maximum length allowed. Null for other types."
            },
            targetEntity: {
              type: SchemaType.STRING,
              description: "For Lookup type: the logical name of the referenced entity. Leave null otherwise."
            },
            optionSetOptions: {
              type: SchemaType.ARRAY,
              description: "For OptionSet or MultiSelect: array of option labels.",
              items: {
                type: SchemaType.STRING
              }
            }
          },
          required: ["schemaName", "displayName", "dataType"]
        }
      }
    },
    required: ["url", "entityName", "entityOwnership", "primaryAttributeName"]
  }
},
{
    name: "enableTraceLog",
    description:
      "Updates the trace logging setting in the CRM environment based on user intent. Use this function when the user requests to enable or disable plugin trace logging.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        plugintracelogsetting: {
          type: SchemaType.INTEGER,
          description:
            "Set to `0` to disable trace logging, `1` to enable logging only for exceptions, or `2` to enable logging for all plugin executions. Use this based on the user’s intent: 'disable' = 0, 'enable only exceptions' = 1, 'enable all logs' = 2.",
        },
      },
    },
  },
  {
  name: "execute_retrieve_query",
  description: "Retrieves records from a Dynamics 365 entity using schema (logical) field names. If the user's query includes Display Names (like 'First Name' or 'Email'), the assistant should first call `retrieve_entity_metadata` to get the mapping from Display Names to schema names. After receiving metadata, the assistant must build the correct OData URL using schema names and call this function with that URL.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      partialoDataUrl: {
        type: SchemaType.STRING,
        description: "OData query URL using schema (logical) field names. Example: contacts?$select=firstname,lastname&$filter=firstname eq 'John' and statecode eq 0. All field names must be logical names (not display names)."
      }
    },
    required: ["partialoDataUrl"]
  }
},
  {
  name: "execute_data_operation",
  description: "Executes a Dynamics 365 Web API operation to create, update, or delete records. This function supports all core CUD operations: POST for creating new records, PATCH for updating existing records, and DELETE for removing records. When updating a lookup field via PATCH, the function automatically resolves the attribute's logical name and its referenced entity's plural name using the 'retrieve_entity_metadata' function, and formats the value using the @odata.bind syntax. For example: 'primarycontactid@odata.bind': '/contacts(<GUID>)'.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      entity: {
        type: SchemaType.STRING,
        description: "The plural name of the Dynamics 365 entity, e.g., 'contacts', 'accounts', etc.",
      },
      operation: {
        type: SchemaType.STRING,
        format: "enum",
        enum: ["POST", "PATCH", "DELETE"],
        description: "The type of Web API operation to perform: POST for create, PATCH for update, and DELETE for delete.",
      },
      id: {
        type: SchemaType.STRING,
        description: "Record ID (GUID) of the record to operate on. Required for PATCH and DELETE."
      },
      body: {
        type: SchemaType.OBJECT,
        properties: {},
        description: "The request body containing data for create (POST) or update (PATCH) operations, in key-value format. When updating lookup fields, use the logical name of the attribute with the @odata.bind suffix and provide the referenced entity's plural name and record ID in the format: '/<entity_plural_name>(<GUID>)'.",
      },
    },
    required: ["entity", "operation", "id"],
  },
}
,
    {
      name: "getPluginTraceDetails",
      description:
        "Processes and returns detailed responses based on plugin trace log data from Dynamics 365 CRM using provided filter parameters.", //"Fetch plugin trace logs based on specific filter parameters.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          entityLogicalName: {
            type: SchemaType.STRING,
            description:
              "The primary entity involved in the plugin execution,.If multiple entities are mentioned → set as comma-separated string,",
          },
          executionMode: {
            type: SchemaType.INTEGER,
            description: `Execution mode of the plugin or workflow. Use '0' for synchronous execution (triggered and completed within the main operation) and '1' for asynchronous execution (runs independently in the background). Accepts values like 'sync', 'synchronous' for 0 and 'async', 'asynchronous' for 1.`,
          },
          messageName: {
            type: SchemaType.STRING,
            description:
              "The name of the message that triggered the plugin execution, such as 'Create', 'Update', 'Delete', etc. or any custom message name.",
          },
          executionStage: {
            type: SchemaType.INTEGER,
            description: `Defines the stage in the event pipeline where the plugin or workflow is executed. Common values include: 'PreValidation' → 10, 'PreOperation' → 20, and 'PostOperation' → 40. These stages help determine when the logic is triggered relative to the core platform operation.`,
          },
          startDate: {
            type: SchemaType.STRING,
            description: `Determines the beginning of the date/time range for filtering. Should be set dynamically based on the current date/time. Examples:
  - "Created on today" → startDate = today's date at 00:00 (e.g., {currentDate}T00:00)
  - "Created on tomorrow" → startDate = tomorrow's date at 00:00
  - "Created on yesterday" → startDate = yesterday's date at 00:00
  - "Created in the last X hours" → startDate = current time minus X hours
  - "Created on this week" → startDate = start of the current week (Monday at 00:00)
  - "Created on this month" → startDate = first day of the current month at 00:00
  - "Created on [specific date and time]" → startDate = specified datetime`,
          },
          endDate: {
            type: SchemaType.STRING,
            description: `Determines the end of the date/time range for filtering. Should be set dynamically based on the current date/time. Examples:
  - "Created on today" → endDate = today's date at 23:59 or current time (e.g., {currentDate}T23:59 or {currentDateTime})
  - "Created on tomorrow" → endDate = tomorrow's date at 23:59
  - "Created on yesterday" → endDate = yesterday's date at 23:59
  - "Created in the last X hours" → endDate = current date and time
  - "Created on this week" → endDate = current date and time
  - "Created on this month" → endDate = current date and time
  - "Created on [specific date and time]" → endDate = same as specified datetime`,
          },
          minDuration: {
            type: SchemaType.INTEGER,
            description: `Minimum execution time in milliseconds. Use this to filter logs where execution time is greater than or equal to this value. For example, 'execution time is greater than X ms' means minDuration = X `,
          },
          maxDuration: {
            type: SchemaType.INTEGER,
            description: `Maximum execution time in milliseconds. Use this to filter logs where execution time is less than or equal to this value. For example, 'execution time is less than X ms' means maxDuration = X `,
          },
          operationType: {
            type: SchemaType.INTEGER,
            description: `Indicates the type of trace log to retrieve.- 1: Plugin trace log (when the user requests a plugin trace).- 2: Workflow trace log (when the user requests a workflow trace).`,
          },
          errorMessage: {
            type: SchemaType.STRING,
            description: `Error message or exception details to filter logs where the plugin execution failed or encountered issues. This can include specific error messages or general terms like "exception" or "error".`,
          },
          typeName: {
            type: SchemaType.STRING,
            description:
              "The fully qualified name of the plugin class that executed.",
          },

          exceptionDetails: {
            type: SchemaType.STRING,
            description:
              "Exception message or details if an error occurred during execution.",
          },
          correlationId: {
            type: SchemaType.STRING,
            description:
              "The correlation ID used for tracing the execution flow.",
          },
          exceptionOnly: {
            type: SchemaType.BOOLEAN,
            description:
              "set false by default if user wants to filter only exception logs then set this to true.",
          },
          initiatingUserName: {
            type: SchemaType.STRING,
            description:
              "The name of the user who initiated the plugin execution.",
          },
        },
      },
    },
];
