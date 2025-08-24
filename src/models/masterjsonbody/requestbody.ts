import EntityMetadata from "../models-interface/entityinterface";
import Lookupinterface from "../models-interface/lookupinterface";

 interface RequestBody {
      entity: EntityMetadata;
      relationships: Lookupinterface[];
    }
    export default RequestBody;