import AttributeInterface from "./attributeinterface";
import Forminterface from "./forminterface";

interface EntityMetadata {
    "@odata.type":string;
    schemaName: string;
    displayName: string
    displaycollectionname: string
    description: string;
    ownershipType: string;
    isactivity: boolean;
    hasNotes: boolean;
    hasActivities: boolean;
    isfeedbackenabled: boolean;
    isnotesenabled: boolean;
     isqueuesenabled: boolean;
     isconnectionsenabled: boolean;
     isvisibleinsales?:boolean;    
     isvisibleinservice?:boolean;
     isvisibleinmarketing?:boolean;
     isvisibleIntraining?:boolean;
     isvisibleinssettings?:boolean;
     ismailmergeenabled?: boolean;
     isduplicatedetectionenabled?: boolean;
     isquickcreateenabled?: boolean;
     isauditenabled?: boolean;
     isdocumentmanagementenabled?: boolean;
     isaccessteamsenabled?: boolean;
     isknowledgemanagementenabled?: boolean;
     isslaenabled?: boolean;
     isactivitiesenabled?: boolean;
     issendemailenabled?: boolean;
     isbusinessprocessenabled?: boolean;
     ischangetrackingenabled?: boolean;
     attributes: AttributeInterface[];
     forms:Forminterface[];
     id:string;

   
}
export default EntityMetadata;