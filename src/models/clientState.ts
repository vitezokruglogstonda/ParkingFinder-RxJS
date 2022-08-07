import {environments} from "../environments";
import { ParkingSpot } from "./ParkingSpot";

export let state: clientState = null;

class clientState{
    currentTab: string;
    parked:boolean;
    parkingSpot: ParkingSpot;

    constructor(currTab:string){
        this.currentTab = currTab;
        this.parked = false;
        this.parkingSpot = null;
    }
}

export function createClient(): clientState{
    if(this.state == null){
        this.state = new clientState(environments.initialTab);
    }    
    return this.state;
}

//export const state = new clientState(environments.initialTab);