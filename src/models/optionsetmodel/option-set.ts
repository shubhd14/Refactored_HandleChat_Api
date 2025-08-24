import Label from "../labelsmodel/labelmodel";
import booleanoptions from "./boolean-options";
import Option from "./option";
import mapoptions from "./map-options";
import maptrueoption from "./map-true-option";
import mapfalseoption from "./map-false-option";
import Constant from "../../constants/constant";
const Cons = new Constant();
class OptionSet {
        public TrueOption !:maptrueoption;
        public FalseOption!:mapfalseoption;
        public Options !:mapoptions[];
        public '@odata.type' !: string;
        public  IsGlobal!:boolean;
        public OptionSetType !: string;  
    constructor(options: Option[]|booleanoptions,IsGlobal :boolean|undefined) {
     
        if (Array.isArray(options) && options.length > 0) {
            this["@odata.type"] = Cons.OptionsetType;
             this.IsGlobal = IsGlobal ||false;
             this.OptionSetType = Cons.Picklist;
             this.Options = []; 
            options.forEach(option => {
                const label = new Label(option.Label);
                this.Options.push(new mapoptions(option.Value, label));
            });
        }
        else if (options && 'TrueOption' in options && 'FalseOption' in options) {
            this.OptionSetType = "Boolean";
            this.TrueOption = new maptrueoption(options.TrueOption.Value, options.TrueOption.Label);
            this.FalseOption = new mapfalseoption(options.FalseOption.Value, options.FalseOption.Label);
        }
    }
}
export default OptionSet;