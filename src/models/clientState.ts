import {environments} from "../environments";
import { ParkingSpot } from "./ParkingSpot";

let state: clientState = undefined;

class clientState{
    currentTab: string;
    parked:boolean;
    parkingSpot: ParkingSpot;
    price: number;

    constructor(currTab:string){
        this.currentTab = currTab;
        this.parked = false;
        this.parkingSpot = null;
    }
}

export function createClient(): clientState{
    if(state === undefined){
        state = new clientState(environments.initialTab);
    }    
    return state;
}

//export const state = new clientState(environments.initialTab);