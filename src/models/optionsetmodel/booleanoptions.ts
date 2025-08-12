import falseoption from "./falseoption";
import trueoption from "./trueoption";
class booleanoptions {
    public TrueOption: trueoption;
    public FalseOption: falseoption;
    constructor(value: number, label: string) {
        this.TrueOption = new trueoption (value,label);
        this.FalseOption = new falseoption(value,label);
    }
}
export default booleanoptions;