import {environments} from "../environments";
import { ParkingSpot } from "./ParkingSpot";
import {getNearbyParkings, fetchPlaces} from "../controller/observable";
import { Place } from "../models/Place";
import { from, Subject } from "rxjs";
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
    fatchedParkings: ParkingSpot[];
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
            fetchPlaces().subscribe((list: any) => {
                list.forEach((el:Place)=>{
                    this.placesList.push(el);
                });
                state.subjectPlaces.next(1);
                state.subjectPlaces.complete();
            });
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
                this.fatchedParkingsMarkers.splice(0, this.fatchedParkingsMarkers.length);
                this.fatchedParkings.splice(0, this.fatchedParkings.length);
            }
            this.userLocation.lng = e.lngLat.lng;
            this.userLocation.lat = e.lngLat.lat;
            new mapboxgl.Marker(userLocationPoint)
                .setLngLat(this.userLocation)
                .addTo(this.map);
                        
            console.log(this.userLocation);
            
            getNearbyParkings().subscribe((list: any)=>{
                
                this.unsubscriber.next(true);
                this.unsubscriber.complete();

                let parkingLocationPoint: HTMLElement;
                let marker: any;
                let parking: ParkingSpot;

                from(list).subscribe((el: any) => {
                    parking = new ParkingSpot(el.id, el.code, el.timeOccupied, el.address, el.zone, el.tariff, el.penaltyIndex, el.maxTime, el.city, el.locationX, el.locationY);
                    this.fatchedParkings.push(parking);
                    parkingLocationPoint = document.createElement("div");
                    parkingLocationPoint.classList.add("parking");
                    let lngLat = new Location(parking.location.lng, parking.location.lat);
                    
                    let popup = new mapboxgl.Popup({
                            closeButton: false,
                            closeOnClick: false,
                        })
                        .addClassName("popup")
                        .setHTML(`<h2>City: ${parking.city}</h2>Street: ${parking.address}</h3><p class="popupText">Zone: ${parking.zone}</p><p class="popupText">Tariff: ${parking.tariff}</p><p class="popupText">Max time (in seconds): ${parking.maxTime}</p>`)
                        .setLngLat(lngLat);

                    parkingLocationPoint.addEventListener('mouseenter', () => {
                        popup.addTo(this.map);
                    });
                    parkingLocationPoint.addEventListener('mouseleave', () => {
                        popup.remove();
                    });

                    marker = new mapboxgl.Marker(parkingLocationPoint)
                        .setLngLat(lngLat)
                        .setPopup(popup)                        
                        .addTo(this.map);

                    this.fatchedParkingsMarkers.push(marker);
                });
                
            });        

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
