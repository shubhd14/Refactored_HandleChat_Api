import Label from "../labelsmodel/labelmodel";
class mapoptions {
    public Value!: number;
    public Label!: Label;

    constructor(value: number, label: Label) {
        this.Value = value;
        this.Label = label;
    }
}
export default mapoptions;