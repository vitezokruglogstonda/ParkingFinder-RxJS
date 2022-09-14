import {environments} from "../environments";
import { IParkingSpot } from "./IParkingSpot";
import {getNearbyParkings, fetchPlaces} from "../controller/observable";
import { from, Subject } from "rxjs";
import { ILocation } from "./ILocation";
import { INearbyGarage, IPlace } from "./IResponse";
import { Map, Marker } from "mapbox-gl";

let state: clientState = undefined;

class clientState{
    currentTab: string;
    parked:boolean;
    parkingSpot: IParkingSpot;
    price: number;
    placesList: IPlace[];
    selectedPlace: string;
    map: Map;
    subjectPlaces: Subject<number>;
    userLocation: ILocation;
    fatchedParkings: INearbyGarage[];
    fatchedParkingsMarkers: Marker[];
    unsubscriber: Subject<boolean>;
    durS: number;
    timeExceeded: boolean;
    durS_trigger: Subject<[string, number]>;

    constructor(currTab:string){
        this.currentTab = currTab;
        this.parked = false;
        this.parkingSpot = null;
        this.placesList = [];
        this.selectedPlace = null;
        this.map = null;
        this.subjectPlaces = new Subject<number>();
        this.userLocation = null;
        this.fatchedParkings = [];
        this.fatchedParkingsMarkers = [];
        this.unsubscriber = new Subject<boolean>();
        this.durS = 0;
        this.timeExceeded = false;
        this.durS_trigger = null;
    }

    getPlaces(): string[]{
        if(this.placesList.length === 0){
            fetchPlaces().then((list: Array<IPlace>) => {
                list.forEach((el:IPlace)=>{
                    this.placesList.push(el);
                });
                state.subjectPlaces.next(1);
                state.subjectPlaces.complete();
            });
        }
        let placeNames: string[] = this.placesList.map( (place: IPlace) =>  {return place.name;} );
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
                
        this.map.on('click', (e) => {
            let userLocationPoint: HTMLElement = document.getElementById("marker");
            if(userLocationPoint === null){
                userLocationPoint = document.createElement('div');
                userLocationPoint.setAttribute("id","marker");
                //this.userLocation = new Location();
            }else{
                new mapboxgl.Marker(userLocationPoint)
                    .remove(this.map);
                this.fatchedParkingsMarkers.forEach( parking => {
                    parking.remove();
                });
                this.fatchedParkingsMarkers.splice(0, this.fatchedParkingsMarkers.length);
                this.fatchedParkings.splice(0, this.fatchedParkings.length);
            }
            this.userLocation = {
                lng: e.lngLat.lng,
                lat: e.lngLat.lat
            }
            new mapboxgl.Marker(userLocationPoint)
                .setLngLat(this.userLocation)
                .addTo(this.map);
                        
            console.log("Selected user location: ", this.userLocation);
            
            getNearbyParkings().subscribe((list: INearbyGarage[])=>{
                this.unsubscriber.next(true);
                this.unsubscriber.complete();

                let parkingLocationPoint: HTMLElement;
                let marker: Marker;

                from(list).subscribe((el: INearbyGarage) => {
                    
                    this.fatchedParkings.push(el);
                    parkingLocationPoint = document.createElement("div");
                    parkingLocationPoint.classList.add("parking");
                    let lngLat = {
                        lng: el.locationX, 
                        lat: el.locationY
                    };
                    
                    let popup = new mapboxgl.Popup({
                            closeButton: false,
                            closeOnClick: false,
                        })
                        .addClassName("popup")
                        .setHTML(`<h3>Street: ${el.address}</h3><p class="popupText">Zone: ${el.zone}</p><p class="popupText">Tariff: ${el.tariff}</p><p class="popupText">Max time (in seconds): ${el.maxTime}</p>`)
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
        let currentPlace: IPlace = this.placesList.find( obj => {return obj.name === this.selectedPlace;});
        
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
