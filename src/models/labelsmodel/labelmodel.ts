import LocalizedLabel from "./localizedlabelmodel";
import Constant from "../../constants/constant";
const Cons = new Constant();
class Label {
    public "@odata.type": string;
    public LocalizedLabels: LocalizedLabel[];

    constructor(label: string) {
        this["@odata.type"] = Cons.LabelType;
    
        this.LocalizedLabels = [new LocalizedLabel(label)];
    }
}
export default Label;