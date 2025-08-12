import booleanoptions from "../optionsetmodel/booleanoptions";
import Option from "../optionsetmodel/option";
interface  AttributeInterface {
    "@odata.type":string;
    "GlobalOptionSet@odata.bind":string
    schemaName: string;
    displayName: string
    description: string
    isprimary: boolean;
    requiredLevel: string;
    maxlength: string;
    format: string;
    minValue: number; 
    precision:number;
    maxValue:number;
    Targets:string[]
    dataType:string;
    options: Option[]|booleanoptions;
    IsGlobal?: boolean;
    GlobalOptionsetId: string;
    lookupTargets:string;
    defaultValue: boolean;
    isauditEnabled:boolean;
    isSearchable:boolean;
    issortable:boolean;
    issecured:boolean;  
    isglobalfilterenabled:boolean;
     id :string;
     entitylogicalname :string;
     optinsetValue:number ;
     optionsetname:string;
    optiosnetorder:number[];   
}
export default AttributeInterface;