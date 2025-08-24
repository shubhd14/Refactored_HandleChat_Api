import Label from "../labelsmodel/labelmodel";
import RequiredLevel from "../labelsmodel/requiredlevel";
import AttributeMetadata from "../models-interface/attributeinterface";
import { AttributeTypeName, FormatName, IsAuditEnabled } from "./attributesetting";
import { IsGlobalFilterEnabled } from "./attributesetting";
import { IsSortableEnabled } from "./attributesetting";
import { IsCustomizable } from "./attributesetting";
import { IsRenameable } from "./attributesetting";
import { IsValidForAdvancedFind } from "./attributesetting";
import { CanModifyAdditionalSettings } from "./attributesetting";
import Constant from "../../constants/constant";
import Attribute from "./createattribute";  
const Cons = new Constant();  
class updateattribute extends Attribute {  
   constructor(field: AttributeMetadata) {
        super(field);
        this["@odata.type"] = `Microsoft.Dynamics.CRM.${this.getAttributeType(field.dataType)}`;
        this.MetadataId= field.id;
        this.HasChanged=null;
        this.AttributeOf=null;
        if(field.dataType==Cons.datetime){
            this.AttributeType = Cons.DateAndTimeFormat;
        }
        if(field.dataType==Cons.datetime){
            this.AttributeType = Cons.DateOnlyFormat;
        }
        if(field.dataType==Cons.SingleLineofText){
            this.AttributeType = Cons.string;
        }if(field.dataType==Cons.WholeNumber){
            this.AttributeType = Cons.int;
        }if(field.dataType=="Single Line of Text"){ 
            this.AttributeType = Cons.string;
        }
        this.AttributeType = field.dataType.charAt(0).toUpperCase() + field.dataType.slice(1).toLowerCase();
        this.ColumnNumber = 35;
        this.DeprecatedVersion=null;
        this.IntroducedVersion= Cons.IntroducedVersion;
        this.EntityLogicalName = field.entitylogicalname;
        this.IsCustomAttribute = true;
        this.IsPrimaryId = false 
        this.IsValidODataAttribute = true;
        this.IsPrimaryName = false;
        this.IsPrimaryId = false 
        this.IsValidForCreate = true;
        this.IsValidForRead  = true ;
        this.IsValidForUpdate = true;
        this.CanBeSecuredForRead = true;
        this.CanBeSecuredForCreate = true;
        this.CanBeSecuredForUpdate = true;
        this.IsSecured =field.issecured??false;
        this.IsRetrievable = false;
        this.IsFilterable = false;
        this.IsSearchable = false ;
        this.IsManaged= false ;
        this.IsSearchable = false ;
        this.IsManaged= false ;
        this.LinkedAttributeId = null;
        this.LogicalName = field.schemaName;
        this.IsValidForForm = true;
        this.IsRequiredForForm= true;
        this.IsValidForGrid = true;
        this.SchemaName= field.schemaName
        this.ExternalName=null;
        this.IsLogical=false;
        this.IsDataSourceSecret=false;
        this.InheritsFrom = null;
        this.SourceType = 0;
        this.AutoNumberFormat = null;
       // this.Format = field.format;
        if(field.dataType == Cons.bool){    
            this.DefaultValue = field.defaultValue??false;
          }
        this.SourceTypeMask = 0;
        this.AttributeTypeName = new AttributeTypeName(field.dataType.charAt(0).toUpperCase() + field.dataType.slice(1).toLowerCase());
        if(field.description!=null){
        this.Description = new Label(field.description);
        }
        this.DisplayName = new Label(field.displayName);
        if(field.isauditEnabled!=null){
        this.IsAuditEnabled= new IsAuditEnabled(field.isauditEnabled??false);
        }
        if(field.isglobalfilterenabled!=null){
        this.IsGlobalFilterEnabled= new IsGlobalFilterEnabled(field.isglobalfilterenabled);
        }
        if(field.issortable!=null){
        this.IsSortableEnabled= new IsSortableEnabled(field.issortable);
        }
        this.IsCustomizable= new IsCustomizable();
        this.IsRenameable= new IsRenameable();
        this.IsValidForAdvancedFind= new IsValidForAdvancedFind();
        this.CanModifyAdditionalSettings= new CanModifyAdditionalSettings();
        this.RequiredLevel=  new RequiredLevel(field.requiredLevel);
        this.Settings= [];
        if(field.format!=null&&field.dataType.toLowerCase()==Cons.string){
        this.FormatName = new FormatName(field.format?? Cons.TextFormat);
        }
    }
    getAttributeType(dataType: string): string {
        switch (dataType.toLowerCase()) {
            case Cons.string: return Cons.StringAttributeMetadata;
            case Cons.SingleLineofText: return Cons.StringAttributeMetadata;
            case Cons.int: return Cons.IntegerAttributeMetadata;
            case Cons.WholeNumber: return Cons.IntegerAttributeMetadata;
            case Cons.decimal: return Cons.DecimalAttributeMetadata;
            case Cons.money: return Cons.MoneyAttributeMetadata;
            case Cons.date: return Cons.DateTimeAttributeMetadata;
            case Cons.datetime: return Cons.DateTimeAttributeMetadata;
            case Cons.bool: return Cons.BooleanAttributeMetadata;
            case Cons.picklist: return Cons.PicklistAttributeMetadata;
            case Cons.multiselectpicklist: return Cons.MultiSelectPicklistAttributeMetadata;
            case Cons.lookup: return Cons.LookupAttributeMetadata;
            case Cons.customer: return Cons.CustomerAttributeMetadata;
            case Cons.guis: return Cons.UniqueIdentifierAttributeMetadata;
            case Cons.memo: return Cons.MemoAttributeMetadata;
            case Cons.image: return Cons.ImageAttributeMetadata;
            case Cons.file: return Cons.FileAttributeMetadata;
            default: return Cons.StringAttributeMetadata; // Default case
        }
    }
    
}
export default updateattribute;