class clientState{
    currentTab: string;
    parked:boolean;

    constructor(currTab:string){
        this.currentTab = currTab;
        this.parked = false;
    }
}

export let state = new clientState("finder-tab");