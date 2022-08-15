import {environments} from "../environments";
import { ParkingSpot } from "./ParkingSpot";
//import {fetchNearbyParkings, fetchPlaces} from "../controller/observable";
import {getNearbyParkings, fetchPlaces} from "../controller/observable";
import { Place } from "../models/Place";
import { Subject } from "rxjs";
import { Location } from "./Location";

let state: clientState = undefined;

class clientState{
    currentTab: string;
    parked:boolean;
    parkingSpot: ParkingSpot;
    price: number;
    placesList: Place[];
    selectedPlace: string;
    map: any;
    subjectPlaces: Subject<any>;
    userLocation: Location;
    fatchedParkings: Location[];
    fatchedParkingsMarkers: any[];
    unsubscriber: Subject<any>;

    constructor(currTab:string){
        this.currentTab = currTab;
        this.parked = false;
        this.parkingSpot = null;
        this.placesList = [];
        this.selectedPlace = null;
        this.map = null;
        this.subjectPlaces = new Subject<any>();
        this.userLocation = null;
        this.fatchedParkings = [];
        this.fatchedParkingsMarkers = [];
        this.unsubscriber = new Subject<any>();
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
                
        this.map.on('click', (e: any) => {
            let userLocationPoint: HTMLElement = document.getElementById("marker");
            if(userLocationPoint === null){
                userLocationPoint = document.createElement('div');
                userLocationPoint.setAttribute("id","marker");
                this.userLocation = new Location();
            }else{
                new mapboxgl.Marker(userLocationPoint)
                    .remove(this.map);
                this.fatchedParkingsMarkers.forEach( parking => {
                    parking.remove();
                });
                this.fatchedParkingsMarkers.splice(0);
                this.fatchedParkings.splice(0);
            }
            this.userLocation.lng = e.lngLat.lng;
            this.userLocation.lat = e.lngLat.lat;
            new mapboxgl.Marker(userLocationPoint)
                .setLngLat(this.userLocation)
                .addTo(this.map);

            //pozovi fetch za sve obliznje parkinge (prosledi lokaciju, pa on da racuna u kom range-u moze da bude parking)
            console.log(this.userLocation);
            
            //fetchNearbyParkings();
            getNearbyParkings().subscribe((list: any)=>{
                //unsubscriber.unsubscribe();
                
                list.forEach( (el:any) => {
                    state.fatchedParkings.push(new Location(el.locationX, el.locationY));
                })            
                //state.subjectPakrings.next(1);
                
                let parkingLocationPoint: HTMLElement;
                let marker: any;
                this.fatchedParkings.forEach( parking => {
                    parkingLocationPoint = document.createElement("div");
                    parkingLocationPoint.classList.add("parking");
                    marker = new mapboxgl.Marker(parkingLocationPoint)
                        .setLngLat(parking)
                        .addTo(this.map);
                    this.fatchedParkingsMarkers.push(marker);
                });
            });
            this.unsubscriber.next(1);
            this.unsubscriber.complete();

            // state.subjectPakrings.subscribe({
            //     next: () => {
            //         let parkingLocationPoint: HTMLElement;
            //         let marker: any;
            //         this.fatchedParkings.forEach( parking => {
            //             parkingLocationPoint = document.createElement("div");
            //             parkingLocationPoint.classList.add("parking");
            //             //obrisi prethodne
            //             marker = new mapboxgl.Marker(parkingLocationPoint)
            //                 .setLngLat(parking)
            //                 .addTo(this.map);
            //             this.fatchedParkingsMarkers.push(marker);
            //         });
            //     },
            // });


          });

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
