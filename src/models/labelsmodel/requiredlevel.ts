import Constant from "../../constants/constant";
const Cons = new Constant();
const allMatchRegex = /(?=.*application\s*required)(?=.*business\s*required)(?=.*recommended)/i;
class RequiredLevel {
    public Value: string;
    public CanBeChanged: boolean;
    public ManagedPropertyLogicalName: string;
    constructor(required: string) {
        this.Value = allMatchRegex.test(required) ? Cons.BusinessRequried : Cons.None; this.CanBeChanged = false;// or some other value if all present
        this.ManagedPropertyLogicalName = Cons.EntityManagedPropertyLogicalName;
    }
}
export default RequiredLevel;


