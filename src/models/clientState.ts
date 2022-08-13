import {environments} from "../environments";
import { ParkingSpot } from "./ParkingSpot";
import {fetchPlaces} from "../controller/observable";
import { Place } from "../models/Place";
import { Subject } from "rxjs";

let state: clientState = undefined;

class clientState{
    currentTab: string;
    parked:boolean;
    parkingSpot: ParkingSpot;
    price: number;
    placesList: Place[];
    selectedPlace: string;
    map: any;
    subject: Subject<any>;

    constructor(currTab:string){
        this.currentTab = currTab;
        this.parked = false;
        this.parkingSpot = null;
        this.placesList = [];
        this.selectedPlace = null;
        this.map = null;
        this.subject = new Subject<any>();
    }

    getPlaces(): string[]{
        if(this.placesList.length === 0){
            fetchPlaces();
        }
        let placeNames: string[] = this.placesList.map( (place: Place) =>  {return place.name;} );
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

    changeSelectedPlace(newPlace: string){
        this.selectedPlace = newPlace;
    }

    showPlaceOnMap(){
        let currentPlace: Place = this.placesList.find( obj => {return obj.name === this.selectedPlace;});
        
        this.map.flyTo({
            center: currentPlace.center,
            zoom: currentPlace.zoom,
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
