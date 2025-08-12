class LocalizedLabel {
    public "@odata.type": string;
    public Label: string;
    public LanguageCode: number;
    public IsManaged : boolean;
    constructor(label: string) {
        this["@odata.type"] = "Microsoft.Dynamics.CRM.LocalizedLabel";
        this.Label = label;
        this.LanguageCode = 1033;
        this.IsManaged = false;

    }
}
export default LocalizedLabel;