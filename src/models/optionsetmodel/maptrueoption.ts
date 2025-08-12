import Label from "../labelsmodel/labelmodel";

class maptrueoption {
    public Value: number;
    public Label: Label;

    constructor(value: number, label: string) {
        this.Value = value;
        this.Label = new Label (label);
    }
}
export default maptrueoption;
   