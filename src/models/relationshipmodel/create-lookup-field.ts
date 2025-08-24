import lookupmetda from "../models-interface/lookupinterface"
import cascade from "../labelsmodel/cascadeconfiguration";
import Lookup from "../labelsmodel/lookuplabel"
import Constant from "../../constants/constant";
const Cons = new Constant();  
class Createlookup {
    public "@odata.type": string;
    public ReferencedEntity: string;
    public SchemaName: string;
    public ReferencingEntity: string;
    public ReferencedAttribute: string;
    public CascadeConfiguration: cascade;
    public Lookup: Lookup;
    constructor(look: lookupmetda) { 
        const Withoutprefix = look.attributeSchemaName?.startsWith("dev_") ? look.attributeSchemaName.slice(4) : look.attributeSchemaName;
        this["@odata.type"] = "Microsoft.Dynamics.CRM.OneToManyRelationshipMetadata";
        this.SchemaName = Cons.SolutionPrefix+look.referencingEntity+"_"+look.referencedEntity+"_"+Withoutprefix;
        this.ReferencedEntity =look.referencedEntity;
        this.ReferencingEntity = look.referencingEntity;
        this.ReferencedAttribute = look.referencedEntity+"id";
        this.CascadeConfiguration = new cascade();
        this.Lookup = new Lookup(look);
    }
}
export default Createlookup; 