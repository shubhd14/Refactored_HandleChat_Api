import updateattribute from "../models/attributemodel/updateattribute";
import AttributeInterface from "../models/models-interface/attributeinterface";
import Attribute from "../models/attributemodel/createattribute";

  export function UpdateAttributesmethod(fields: AttributeInterface[]): updateattribute[] {
    if (!Array.isArray(fields)) {
      return [];
    }
    return fields.map(field => new updateattribute(field));
  }
  export function CreateAttributesMethod(fields: AttributeInterface[]): Attribute[] {
    if (!Array.isArray(fields)) {
      return [];
    }
    return fields.map(field => new Attribute(field));
  }
