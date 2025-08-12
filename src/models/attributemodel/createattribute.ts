import Label from "../labelsmodel/labelmodel";
import RequiredLevel from "../labelsmodel/requiredlevel";
import OptionSet from "../optionsetmodel/optionset";
import AttributeMetadata from "../modelsinterface/attributeinterface";
import Constant from "../../constants/constant";
import { AttributeTypeName, FormatName, IsAuditEnabled } from "./attributesetting";
import { IsGlobalFilterEnabled } from "./attributesetting";
import { IsSortableEnabled } from "./attributesetting";
import { IsCustomizable } from "./attributesetting";
import { IsRenameable } from "./attributesetting";
const Cons = new Constant();  
class Attribute {
        public "@odata.type": string;
        public "GlobalOptionSet@odata.bind": string;
        public MetadataId?: string;
        public HasChanged?: null;
        public AttributeOf?: null;
        public AttributeType?: string;
        public ColumnNumber?: number;
        public DeprecatedVersion?: null;
        public IntroducedVersion?: string;
        public EntityLogicalName?: string;
        public IsCustomAttribute?: boolean;
        public IsPrimaryId?: boolean;
        public IsValidODataAttribute?: boolean;
        public IsPrimaryName?: boolean;
        public IsValidForCreate?: boolean;
        public IsValidForRead?: boolean;
        public IsValidForUpdate?: boolean;
        public CanBeSecuredForRead?: boolean;
        public CanBeSecuredForCreate?: boolean;
        public CanBeSecuredForUpdate?: boolean;
        public IsSecured?: boolean;
        public IsRetrievable?: boolean;
        public IsFilterable?: boolean;
        public IsSearchable?: boolean;
        public IsManaged?: boolean;
        public LinkedAttributeId?: null;
        public LogicalName?: string;
        public IsValidForForm?: boolean;
        public IsRequiredForForm?: boolean;
        public IsValidForGrid?: boolean;
        public SchemaName: string;
        public ExternalName?: null;
        public IsLogical?: boolean;
        public IsDataSourceSecret?: boolean;
        public InheritsFrom?: null;
        public SourceType?: number;
        public AutoNumberFormat?: null;
        public DefaultValue?: boolean;
        public FormulaDefinition?: "";
        public SourceTypeMask?: number;
        public DisplayName: Label;
        public Description?: Label;
        public IsAuditEnabled?: IsAuditEnabled;
        public IsGlobalFilterEnabled?: IsGlobalFilterEnabled;
        public IsSortableEnabled?: IsSortableEnabled;
        public IsCustomizable?: IsCustomizable;
        public IsRenameable?: IsRenameable;
        public IsValidForAdvancedFind?: IsAuditEnabled;
        public CanModifyAdditionalSettings?: IsAuditEnabled;
        public RequiredLevel: RequiredLevel;
        public Settings?: [];
        public FormatName?: FormatName;
        public Format?: string;
        public AttributeTypeName?: AttributeTypeName;
        public MaxLength?: string;
        public OptionSet?: OptionSet;
        public MinValue?: number;
        public Precision?: number;
        public MaxValue?: number;
        public Targets?: string[];
        public IsGlobal?: boolean;
        public OptionSetType?: string;
    constructor(field: AttributeMetadata) {
        this["@odata.type"] = `Microsoft.Dynamics.CRM.${this.getAttributeType(field.dataType)}`;
        this.SchemaName = field.schemaName;
        this.DisplayName = new Label(field.displayName);
        if (field.description != null) {
            this.Description = new Label(field.description);
        }
        this.IsPrimaryName = field.isprimary ?? false;
        this.IsSearchable = field.isSearchable ?? false;
        this.IsSortableEnabled = new IsSortableEnabled(field.issortable??false);
        this.IsAuditEnabled = new IsAuditEnabled(field.isauditEnabled??false);
        this.IsSecured= field.issecured ?? false;   
        this.RequiredLevel = new RequiredLevel(field.requiredLevel??"none");
        if(field.dataType == Cons.bool){
          this.DefaultValue = field.defaultValue??false;
        }
        switch (field.dataType.toLowerCase()) {
            case Cons.string:
                this.MaxLength = field.maxlength ?? Cons.DefaultMaxLength;
                if(field.format==null || field.format.trim().toLowerCase()=="text") {
                    this.Format = Cons.TextFormat;
                }else if(field.format.trim().toLowerCase()=="text") {
                    this.Format = Cons.TextFormat;
                }  else if(field.format.trim().toLowerCase()=="email") {
                    this.Format = Cons.EmailFormat;
                }else if(field.format.trim().toLowerCase()=="phone") {
                    this.Format = Cons.PhoneFormat;
                }
                break;
                case Cons.SingleLineofText:
                    if(field.format==null || field.format.trim().toLowerCase()=="text") {
                        this.Format = Cons.TextFormat;
                    }else if(field.format.trim().toLowerCase()=="text") {
                        this.Format = Cons.TextFormat;
                    }  else if(field.format.trim().toLowerCase()=="email") {
                        this.Format = Cons.EmailFormat;
                    }else if(field.format.trim().toLowerCase()=="phone") {
                        this.Format = Cons.PhoneFormat;
                    }         
                     break;
                case "Single Line of Text":
                this.MaxLength = field.maxlength ?? Cons.DefaultMaxLength;
                if(field.format==null || field.format.trim().toLowerCase()=="text") {
                    this.Format = Cons.TextFormat;
                }else if(field.format.trim().toLowerCase()=="text") {
                    this.Format = Cons.TextFormat;
                }  else if(field.format.trim().toLowerCase()=="email") {
                    this.Format = Cons.EmailFormat;
                }else if(field.format.trim().toLowerCase()=="phone") {
                    this.Format = Cons.PhoneFormat;
                }        
                   break;
            case Cons.datetime:
                if(field.format==null){
                    this.Format = Cons.DateOnlyFormat;
                }else if(field.format && field.format.trim().toLowerCase()=="datetime") {
                    this.Format = Cons.DateAndTimeFormat;
                }  else if(field.format && field.format.trim().toLowerCase()=="dateonly") {
                    this.Format = Cons.DateOnlyFormat;
                }
                break;
                case Cons.date:   
                if(field.format==null){
                    this.Format = Cons.DateOnlyFormat;
                }else if(field.format && field.format.trim().toLowerCase()=="datetime") {
                    this.Format = Cons.DateAndTimeFormat;
                }  else if(field.format && field.format.trim().toLowerCase()=="dateonly") {
                    this.Format = Cons.DateOnlyFormat;
                }          
                break;
            case Cons.picklist:
                this. CheckOptionsetType(field);
                break;
            case Cons.money:
                this.MinValue = field.minValue ??Cons.DefaultMinValue;
                this.Precision = field.precision?? Cons.DefaultPrecision;
                this.MaxValue = field.maxValue ?? Cons.DefaultMaxValue;
                break;
            case Cons.int:
                if (field.format && field.format.toLocaleLowerCase() === Cons.duration) {
                    this.Format = Cons.DurationFormat;
                }
                break;
                case Cons.WholeNumber:
                    if (field.format.toLocaleLowerCase() === Cons.duration) {
                        this.Format = Cons.DurationFormat;
                    }
                    break;
            case Cons.decimal:
                this.MinValue = field.minValue ??Cons.DefaultMinValue;
                this.Precision = field.precision?? Cons.DefaultPrecision;
                this.MaxValue = field.maxValue ?? Cons.DefaultMaxValue;
                break;
            case Cons.memo:
                this.MaxLength = field.maxlength ?? Cons.DefaultMaxLengthMemo;
                break;
            case Cons.bool:
                this. CheckOptionsetType(field);
                break;  
                case Cons.multiselectpicklist:
                    this. CheckOptionsetType(field);
                    break;  
            default:
                this.MaxLength = field.maxlength ?? Cons.DefaultMaxLength;
                break;
        }
    }
    CheckOptionsetType(field: AttributeMetadata) {
        if (field.GlobalOptionsetId==null) {
            this.OptionSet =new OptionSet(field.options,field.IsGlobal) ;
            this.SourceTypeMask=0;

        } else {
            this.GlobalOptionset(field);
        }
    }
    GlobalOptionset(field: AttributeMetadata) {
        this["GlobalOptionSet@odata.bind"] = `/GlobalOptionSetDefinitions(${field.GlobalOptionsetId})`;
        this.SourceTypeMask=0; 
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
            case Cons.customer: return Cons.CustomerAttributeMetadata;
            case Cons.guis: return Cons.UniqueIdentifierAttributeMetadata;
            case Cons.memo: return Cons.MemoAttributeMetadata;
            case Cons.image: return Cons.ImageAttributeMetadata;
            case Cons.file: return Cons.FileAttributeMetadata;
            default: return Cons.StringAttributeMetadata; // Default case
        }
    }
  
    
}
export default Attribute;