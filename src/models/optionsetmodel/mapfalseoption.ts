import Label from "../labelsmodel/labelmodel";
class mapfalseoption {
    public Value: number;
    public Label: Label;

    constructor(value: number, label: string) {
        this.Value = value;
        this.Label = new Label (label);
    }
}
export default mapfalseoption;
   