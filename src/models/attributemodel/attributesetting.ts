import Constant from "../../constants/constant";
const Cons = new Constant();  
class AuditSettings {
    public Value?: boolean;
    public CanBeChanged?: boolean;
    public ManagedPropertyLogicalName?: string;
    constructor(field:boolean) {
        this.Value = field;
        this.CanBeChanged = true;
        this.ManagedPropertyLogicalName = Cons.AttributeManagedPropertyLogicalName; 
    }
}
class IsAuditEnabled extends AuditSettings {
    constructor(field: boolean) {
        super(field);
    }
}
class IsGlobalFilterEnabled extends AuditSettings {
    constructor(field:boolean) {
        super(field);
    }
}
class IsCustomizable extends AuditSettings {
    constructor() {
        super(false);
    }
}class IsRenameable extends AuditSettings {
    constructor() {
        super(true);
    }
}class IsValidForAdvancedFind extends AuditSettings {
    constructor() {
        super(true);
    }
}class CanModifyAdditionalSettings extends AuditSettings {
    constructor() {
        super(true);
    }
}class IsSortableEnabled extends AuditSettings {
    constructor(field:boolean) {
        super(field);
    }
}class Base {
    public Value?: string;
    constructor(value: string) {
        this.Value = value; 
    }
}
class FormatName extends Base {
    constructor(field: string) {
        super(field);
    }
}
class AttributeTypeName extends Base {
    constructor(field: string) {
        super(field+"Type");
    }
}
export { IsAuditEnabled, IsGlobalFilterEnabled ,IsCustomizable,IsRenameable,IsValidForAdvancedFind,CanModifyAdditionalSettings,IsSortableEnabled,FormatName,AttributeTypeName};
