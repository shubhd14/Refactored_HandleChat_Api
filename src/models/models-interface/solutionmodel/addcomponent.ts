import Solutioninterface from "../solutioninterface";
class AddComponent {
    public ComponentType: number;
    public ComponentId: string;
    public SolutionUniqueName: string;
    public AddRequiredComponents: boolean;
    public IncludedComponentSettingsValues: null;
    public DoNotIncludeSubcomponents: boolean;
    constructor(solution: Solutioninterface) {
        if (solution.componentType == "field" || 
            solution.componentType == "column" || 
            solution.componentType == "attribute")
        {
            this.ComponentType = 2;
        }
        else if (solution.componentType== "entity"||
                 solution.componentType=="table"||
                    solution.componentType=="updateentity")
        {
          this.ComponentType = 1;
        }  
        else {
            throw new Error(`Unsupported componentType: ${solution.componentType}`);
        }
        this.ComponentId =solution.componentId;
        this.SolutionUniqueName = solution.solutionUniqueName;
        this.AddRequiredComponents = solution.addRequiredComponents;
        if(solution.componentType == "updateentity"){
            this.DoNotIncludeSubcomponents = true;
            this.AddRequiredComponents = false;
        }
        this.IncludedComponentSettingsValues = null;
        this.DoNotIncludeSubcomponents = solution.doNotIncludeSubcomponents;
    }
}
export default AddComponent;