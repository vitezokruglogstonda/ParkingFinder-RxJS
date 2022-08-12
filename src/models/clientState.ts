import {environments} from "../environments";
import { ParkingSpot } from "./ParkingSpot";
import {fetchPlaces} from "../controller/observable";
import { Place } from "../models/Place";

let state: clientState = undefined;

class clientState{
    currentTab: string;
    parked:boolean;
    parkingSpot: ParkingSpot;
    price: number;
    //placesList: string[];
    placesList: Place[];

    constructor(currTab:string){
        this.currentTab = currTab;
        this.parked = false;
        this.parkingSpot = null;
        this.placesList = [];
    }

    get places(): string[]{
        if(this.placesList.length === 0){
            this.placesList = fetchPlaces();
        }
        let placeNames: string[] = []
        this.placesList.map( (place: Place) =>  console.log(place.name) );
        //console.log(this.placesList);
        return placeNames;
    }
}

export function createClient(): clientState{
    if(state === undefined){
        state = new clientState(environments.initialTab);
    }    
    return state;
}

//export const state = new clientState(environments.initialTab);