//#region classes import 
import Label from "../labelsmodel/labelmodel";
import Attribute from "../attributemodel/createattribute";
import AttributeInterface from "../models-interface/attributeinterface";
import EntityMetadata from "../models-interface/entityinterface";
import Constant from "../../constants/constant";
const Cons = new Constant();  
//#endregion 
class CreateEntity {
    public "@odata.type": string;
    public SchemaName?: string;
    public DisplayName?: Label;
    public DisplayCollectionName?: Label;
    public Description?: Label;
    public OwnershipType?: string;
    public IsActivity?: boolean;
    public IsVisibleInSales?:boolean;    
    public IsVisibleInService?:boolean;
    public IsVisibleInMarketing?:boolean;
    public IsVisibleInTraining?:boolean;
    public IsVisibleInSettings?:boolean;
    public IsMailMergeEnabled?: boolean;
    public IsDuplicateDetectionEnabled?: boolean;
    public IsQuickCreateEnabled?: boolean;
    public IsAuditEnabled?: boolean;
    public IsConnectionsEnabled?: boolean;
    public IsDocumentManagementEnabled?:boolean;
    public IsAccessTeamsEnabled?: boolean;
    public IsKnowledgeManagementEnabled?:boolean;
    public IsSLAEnabled?: boolean;
    public IsQueuesEnabled?: boolean;
    public IsActivitiesEnabled?: boolean;
    public IsSendEmailEnabled?: boolean;
    public IsFeedbackEnabled?: boolean;
    public IsNotesEnabled?: boolean;
    public IsBusinessProcessEnabled?: boolean;
    public IsChangeTrackingEnabled?: boolean;
    public HasNotes?: boolean;
    public HasActivities?: boolean;
    public Attributes?: Attribute[];
    constructor(entity: EntityMetadata) {
        this["@odata.type"] = Cons.meatadata;
        this.SchemaName = entity.schemaName;
        // this.IsActivity = entity.isactivity??false; 
        // if(entity.isactivity==true){  
        //     this.IsFeedbackEnabled=true;
        //     this.IsNotesEnabled= true;
        //     this.IsConnectionsEnabled =true;
        //     this.IsQueuesEnabled=true;
        // }else{
        // this.IsFeedbackEnabled=entity.isfeedbackenabled??false;
        // this.IsNotesEnabled= entity.isnotesenabled??false;
        // this.IsConnectionsEnabled =entity.isconnectionsenabled??false;
        // this.IsQueuesEnabled=entity.isqueuesenabled??false;
        // }
        // this.IsVisibleInSales =entity.isvisibleinsales??false;
        // this.IsVisibleInService=entity.isvisibleinservice??false;
        // this.IsVisibleInMarketing= entity.isvisibleinmarketing??false;
        // this.IsVisibleInTraining=entity.isvisibleIntraining??false; 
        // this.IsVisibleInSettings=entity.isvisibleinssettings??false;
        // this.IsMailMergeEnabled=entity.ismailmergeenabled??false;
        // this.IsDuplicateDetectionEnabled=entity.isduplicatedetectionenabled??false;
        // this.IsQuickCreateEnabled=entity.isquickcreateenabled??false;
        // this.IsAuditEnabled=entity.isauditenabled??false;
        // this.IsDocumentManagementEnabled=entity.isdocumentmanagementenabled??false;
        // this.IsAccessTeamsEnabled=entity.isaccessteamsenabled??false;   
        // this.IsKnowledgeManagementEnabled=entity.isknowledgemanagementenabled??false;
        // this.IsSLAEnabled=entity.isslaenabled??false;
        // this.IsSendEmailEnabled=entity.issendemailenabled??false;   
        // this.IsBusinessProcessEnabled=entity.isbusinessprocessenabled??false;
        // this.IsChangeTrackingEnabled=entity.ischangetrackingenabled??false;
        if(entity.displayName!==null){
            this.DisplayName = new Label(entity.displayName);
        }
        if(entity.displaycollectionname!==null){
        this.DisplayCollectionName = new Label(entity.displaycollectionname);
        }
        if (entity.description != null) {
        this.Description = new Label(entity.description);
        }
        if(entity.ownershipType!=null){
        this.OwnershipType = entity.ownershipType != null && entity.ownershipType.toLowerCase().includes("user")? Cons.UserOwned:entity.ownershipType.toLowerCase().includes("organ")?Cons.UserOwned:Cons.UserOwned;
        }else{
            this.OwnershipType = Cons.UserOwned;

        }
       
        this.HasNotes = entity.hasNotes??false;
    
       
        this.HasActivities = entity.hasActivities??false;
        
        this.Attributes = this.createAttributes(entity.attributes.filter(attr => attr.dataType.toLowerCase() !== 'lookup'));
    }
    createAttributes(fields: AttributeInterface[]): Attribute[] {
        if (!Array.isArray(fields)) {
            return []; 
        }
        return fields.map(field => new Attribute(field));   
    } 
}
export default CreateEntity;

