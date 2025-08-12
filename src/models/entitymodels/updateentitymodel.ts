import Label from "../labelsmodel/labelmodel";
import EntityMetadata from "../modelsinterface/entityinterface";
import Constant from "../../constants/constant";
const Cons = new Constant();
class updateentity {
    public "@odata.type": string;
    public SchemaName?: string;
    public DisplayName?: Label;
    public DisplayCollectionName?: Label;
    public Description?: Label;
    public OwnershipType?: string;
    public IsActivity?: boolean;
    public HasNotes?: boolean;
    public HasActivities?: boolean;
    constructor(entity: EntityMetadata) {
         this.SchemaName = entity.schemaName;
         if(entity.displayName!=null){
            this.DisplayName = new Label(entity.displayName);
         }
         if(entity.displaycollectionname!=null){
            this.DisplayCollectionName = new Label(entity.displaycollectionname);
        }
         if(entity.description!=null){
            this.Description = new Label(entity.description);
        }
         if(entity.isactivity!=null){
            this.IsActivity = entity.isactivity;
        }
        if(entity.hasNotes!=null){
            this.HasNotes = entity.hasNotes;
        }
        if(entity.hasActivities!=null){
            this.HasActivities = entity.hasActivities;
        }
    
    }   
}
export default updateentity;

      