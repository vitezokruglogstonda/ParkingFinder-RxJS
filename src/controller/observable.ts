import {debounceTime, every, filter, forkJoin, from, fromEvent, interval, map, Observable, reduce, single, skipWhile, startWith, Subject, Subscription, switchMap, take, takeUntil, takeWhile} from "rxjs";
import { ParkingSpot } from "../models/ParkingSpot";
import {environments} from "../environments";
import { createClient } from "../models/clientState";
import { drawCheckerContent, showCurrentState } from "../drawing";
import { Place } from "../models/Place";

export function checkCode(input: HTMLInputElement){
    fromEvent(input, "input").pipe(
        debounceTime(500),
        map((ev: InputEvent) => (<HTMLInputElement>ev.target).value),
        filter(text => text.length == environments.codeLength),
        switchMap((text:string) => getParkingSpot(text)),
    ).subscribe((output)=>{
        if(output[0].occupied === true){
            let state = createClient();
            state.parked=true;
            state.parkingSpot = new ParkingSpot(output[0].id, output[0].code, output[0].timeOccupied, output[0].address, output[0].zone, output[0].tariff, output[0].penaltyIndex, output[0].maxTime, output[0].city, output[0].locationX, output[0].locationY);
            drawCheckerContent();
        }else{
            alert("This is not your parking spot.");
        }
    });
}

function getParkingSpot(code:string):Observable<any>{
    let url : string = `${environments.URL}/parkings/?code=${code}`;
    return from(    
        fetch(url)
        .then((res) => {
            if (res.ok){
                return res.json();
            } 
            else{
                throw new Error("Parking not found");
            } 
        })
        .catch((err) => (console.log(environments.codeError)))
    );
}

export function calculate(): Subscription{
    let state = createClient();
    let durS : number = calculateDurationInSeconds();    
    const sub = interval(1000).pipe(
        map( (x) => {
            return calculateTimeAndPrice(durS,x);
        })
    ).subscribe((res: [string, string, number,boolean])=>{showCurrentState(res)});
    return sub;
}

function calculateDurationInSeconds(): number{
    let state = createClient();
    let tmpDate : Date = new Date(); 
    let tmpH: number = tmpDate.getHours()*360;
    let tmpM: number = tmpDate.getMinutes()*60;
    let tmpS: number = tmpDate.getSeconds() + tmpH + tmpM;
    let timeOccupiedSplited : string[] = state.parkingSpot.timeOccupied.split(":",3);
    return tmpS - (parseInt(timeOccupiedSplited[0])*360 + parseInt(timeOccupiedSplited[1])*60 + parseInt(timeOccupiedSplited[2])) - 1;
}

function calculateTimeAndPrice(durS: number, x: number): [string, string, number, boolean]{
    let state = createClient();
    let res : [string, string, number, boolean] = ["","",0,false];
    let penalty: boolean = false;
    durS+=x;
    res[0] = `${Math.floor(durS/360)}:${Math.floor((durS%360)/60)}:${(durS%360)%60}`;                
    let index:number = state.parkingSpot.tariff;
    //za maxTime u satima
    // if(state.parkingSpot.zone<3 && state.parkingSpot.maxTime*360 > durS){
    //     index *= state.parkingSpot.penaltyIndex;
    //     penalty = true;
    // } 
    if(state.parkingSpot.zone<3 && state.parkingSpot.maxTime < durS){
        index *= state.parkingSpot.penaltyIndex;
        penalty = true;
    }else{
        let remainingTime = state.parkingSpot.maxTime - durS
        res[1] = `${Math.floor(remainingTime/360)}:${Math.floor((remainingTime%360)/60)}:${(remainingTime%360)%60}`;
    }
    res[2] = Math.round(environments.pricePerSecond * index * durS * 100) / 100; 
    res[3] = penalty;
    return res;
}

export function logOut(sub: Subscription){
    sub.unsubscribe();
    freeParking();
    let state = createClient();
    let info: string = environments.paymentInfo+state.price;
    alert(info);
    state.parked = false;
    drawCheckerContent();
}

function freeParking():Observable<Response>{
    let state = createClient();
    let url : string = `${environments.URL}/parkings/${state.parkingSpot.id}`;
    const putRequest: Observable<Response> = from(    
        fetch(url, {
            method: "PUT", 
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(
                { 
                    id:state.parkingSpot.id,
                    code:state.parkingSpot.parkingHash,
                    city:state.parkingSpot.city,
                    address: state.parkingSpot.address,
                    zone:state.parkingSpot.zone,
                    tariff: state.parkingSpot.tariff,
                    penaltyIndex: state.parkingSpot.penaltyIndex,
                    maxTime: state.parkingSpot.maxTime,
                    locationX: state.parkingSpot.location.lng,
                    locationY: state.parkingSpot.location.lat,
                    occupied:false,
                    timeOccupied: null
                }
            )
        })
    );
    state.parkingSpot=null;
    return putRequest;
}

export function fetchPlaces(): Observable<any>{
    const url: string = `${environments.URL}/places/`;        
    const obs = from(
        fetch(url)
        .then( response => {
            return response.json();
        })
    );
    return obs;
}

export function getNearbyParkings():Observable<any>{
    
    let state = createClient();
    let offset$: number[] = environments.offsets;    
    
    const obs = from(offset$).pipe(        
        map((offset: number) => calculateCoordinateLimits(offset)),
        switchMap((offset: number[]) => fetchNearbyParkings(offset)),
        map((list: any) => list.filter((parking: any) => parking.occupied === false)),
        map((list:any) => list.filter((el: any, index: number) => list.indexOf(list.find((p:any) => p.locationX===el.locationX && p.locationY===el.locationY)) === index )),
        skipWhile((list: any)=> list.length === 0),
        takeUntil(state.unsubscriber),
    ); 

    return obs;
}

function calculateCoordinateLimits(offset: number) : number[]{
    let state = createClient();
    let limit$: number[] = [state.userLocation.lng - offset, state.userLocation.lng + offset, state.userLocation.lat - offset, state.userLocation.lat + offset];
    return limit$;
}

function fetchNearbyParkings(values: number[]):Observable<any>{
    let url: string = `${environments.URL}/parkings/?locationX_gte=${values[0]}&locationX_lte=${values[1]}&locationY_gte=${values[2]}&locationY_lte=${values[3]}`;
    return from(fetch(url)
        .then(res=> res.json().then( list => {
            return list;        
    })))
}