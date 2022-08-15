import {debounceTime, every, filter, forkJoin, from, fromEvent, interval, map, Observable, reduce, skipWhile, startWith, Subject, Subscription, switchMap, take, takeUntil, takeWhile} from "rxjs";
import { ParkingSpot } from "../models/ParkingSpot";
import {environments} from "../environments";
import { createClient } from "../models/clientState";
import { drawCheckerContent, showCurrentState } from "../drawing";
import { Place } from "../models/Place";
import { Location } from "../models/Location";

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
            state.parkingSpot = new ParkingSpot(output[0].id, output[0].parkingHash, output[0].timeOccupied, output[0].zone, output[0].tariff, output[0].penaltyIndex, output[0].maxTime, output[0].city, output[0].locationX, output[0].locationY);
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
    //javi serveru da je slobodno
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

export function fetchPlaces(){
    const url: string = `${environments.URL}/places/`;    
    let state = createClient();
    fetch(url)
        .then( response => {
            response.json().then( (list) => {
                list.forEach( (el:Place) => {
                    state.placesList.push(el);
                })
                state.subjectPlaces.next(1);
            })
    });
}

// export function fetchNearbyParkings(){
//     let state = createClient();
//     let minX: number, maxX: number, minY: number, maxY: number;
//     let offset = 0.001;
//     minX = state.userLocation.lng - offset;
//     maxX = state.userLocation.lng + offset;
//     minY = state.userLocation.lat - offset;
//     maxY = state.userLocation.lat + offset;

//     fetch(`${environments.URL}/parkings/?locationX_gte=${minX}&locationX_lte=${maxX}&locationY_gte=${minY}&locationY_lte=${maxY}`)
//         .then(res=> res.json().then( list => {
//             if(list.length > 0){            
//                 list.forEach( (el:any) => {
//                     state.fatchedParkings.push(new Location(el.locationX, el.locationY));
//                 })            
//                 state.subjectPakrings.next(1);
//             }        
//     }))
// }

export function getNearbyParkings(unsubscriber: Subject<any>):Observable<any>{
    
    let offset$: number[] = [0.001, 0.002, 0.003, 0.004, 0.005, 0.01];
    // const obs = from(offset$).pipe(
    //     reduce((offset: number) => {calculateCoordinateLimits(offset);}),
    //     switchMap((value$: number[]) => {fetchNearbyParkings(value$);})
    // ); 

    // const obs = from([]).pipe(
    //     startWith(1),
    //     takeWhile((x: number)=> x<=5),
    //     reduce((x: number)=> {return x*=0.001}),
    //     map((offset: number) => calculateCoordinateLimits(offset)),
    //     switchMap((offset: number[]) => fetchNearbyParkings(offset)),
    //     //every((list: any) => list.length>0)
    //     skipWhile((list: any)=> list.length === 0),
    //     takeUntil(unsubscriber)
    // ); 

    const obs = from(offset$).pipe(
        map((offset: number) => calculateCoordinateLimits(offset)),
        switchMap((offset: number[]) => fetchNearbyParkings(offset)),
        skipWhile((list: any)=> list.length === 0),
        takeUntil(unsubscriber)
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