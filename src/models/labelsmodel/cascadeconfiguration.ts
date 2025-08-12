class cascade {
    public Assign: string;
    public Delete: string;
    public Merge: string;
    public Reparent: string;    
    public Unshare: string;

    constructor() {
        this.Assign = "NoCascade";
        this.Delete = "RemoveLink";
        this.Merge = "NoCascade";
        this.Reparent = "NoCascade";
        this.Unshare = "NoCascade";
    }
}
export default cascade;