import falseoption from "./false-option";
import trueoption from "./true-option";
class booleanoptions {
    public TrueOption: trueoption;
    public FalseOption: falseoption;
    constructor(value: number, label: string) {
        this.TrueOption = new trueoption (value,label);
        this.FalseOption = new falseoption(value,label);
    }
}
export default booleanoptions;