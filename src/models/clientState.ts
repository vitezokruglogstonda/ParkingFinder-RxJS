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
    selectedPlace: string;
    map: any;

    constructor(currTab:string){
        this.currentTab = currTab;
        this.parked = false;
        this.parkingSpot = null;
        this.placesList = [];
        this.selectedPlace = null;
        this.map = null;
    }

    get places(): string[]{
        if(this.placesList.length === 0){
            this.placesList = fetchPlaces();
        }
        //let placeNames: string[] = this.placesList.map( (place: Place) =>  {return place.name;} );
        let placeNames: string[] = ["Beograd", "Nis"]
        return placeNames;
    }

    getMap(){
        let mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
        mapboxgl.accessToken = environments.mapToken;
        this.map = new mapboxgl.Map({
            container: 'mapDiv',
            style: 'mapbox://styles/mapbox/streets-v11'
        });
        this.map.addControl(new mapboxgl.NavigationControl());        
        return this.map;
    }

    showPlaceOnMap(){
        let currentPlace: Place = this.placesList.find( obj => {return obj.name === this.selectedPlace;});
        // state.map.center=currentPlace.center;
        // state.map.zoom=currentPlace.zoom;    
        
        
        this.map.flyTo({
            center: [20.453585, 44.807016],
            zoom: 10,
            essential: true 
        });
    }
}

export function createClient(): clientState{
    if(state === undefined){
        state = new clientState(environments.initialTab);
    }    
    return state;
}

//export const state = new clientState(environments.initialTab);