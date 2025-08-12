import EntityMetadata from "../modelsinterface/entityinterface";
import Lookupinterface from "../modelsinterface/lookupinterface";

 interface RequestBody {
      entity: EntityMetadata;
      relationships: Lookupinterface[];
    }
    export default RequestBody;