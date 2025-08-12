import Label from "../labelsmodel/labelmodel"
import RequiredLevel from "./requiredlevel";
import Lookupinterface from "../modelsinterface/lookupinterface";
class Lookup {
    public SchemaName: string;
    public DisplayName: Label;
    public RequiredLevel :RequiredLevel;
    constructor(label: Lookupinterface) {
        this.SchemaName = label.attributeSchemaName;
        this.DisplayName =  new Label(label.attributeDisplayName);
        this.RequiredLevel =  new RequiredLevel(label.requiredLevel??"None");
    }
}
export default Lookup;