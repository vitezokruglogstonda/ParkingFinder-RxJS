import {debounceTime, every, filter, forkJoin, from, fromEvent, interval, map, observable, Observable, Observer, reduce, single, skipWhile, startWith, Subject, Subscription, switchMap, take, takeUntil, takeWhile, zip} from "rxjs";
import { IParkingSpot } from "../models/IParkingSpot";
import {environments} from "../environments";
import { createClient } from "../models/clientState";
import { drawCheckerContent, showCurrentStateCombOp } from "../drawing";
import { INearbyGarage, INearbyParkingSpot, IParkingSpotResponse, IPlace } from "../models/IResponse";
import {ILocation} from "../models/ILocation";

export function checkCode(input: HTMLInputElement){
    fromEvent(input, "input").pipe(
        debounceTime(environments.checkCodeDelay),
        map((ev: InputEvent) => (<HTMLInputElement>ev.target).value),
        filter(text => text.length == environments.codeLength),
        map((text:string) => getParkingSpot(text)),
    ).subscribe((output: Promise<IParkingSpotResponse>)=>{
        output.then( (data) => {            
            if(data.occupied === true){
                let state = createClient();
                state.parked=true;
                state.parkingSpot = {
                    id: data.id,
                    parkingHash: data.code,
                    address: data.garages.address,
                    timeOccupied: data.timeOccupied, 
                    zone: data.garages.zone,
                    tariff: data.garages.tariff,
                    penaltyIndex: data.garages.penaltyIndex,
                    maxTime: data.garages.maxTime,
                    location: {
                        lng: data.garages.locationX,
                        lat: data.garages.locationY
                    },
                    garagesId: data.garagesId
                };
                drawCheckerContent();
            }else{
                alert("This is not your parking spot.");
            }
        });        
    });
}

function getParkingSpot(code:string):Promise<IParkingSpotResponse>{
    let url : string = `${environments.URL}/parkingSpots/?code=${code}&_expand=garages`;
    
    let promise = fetch(url)
        .then((res) => {
            if (res.ok){
                return res.json();
            } 
        else{
            throw new Error("Parking not found");
        } 
    })
    .catch((err) => (console.log(environments.codeError)));

    let data:IParkingSpotResponse;
    return promise.then((val)=>
        {
            return data = {...val[0]}
        }
    )
}

export function calculate(): Subscription{
    let state = createClient();
    state.durS = calculateDurationInSeconds();   
    let clock: number = environments.waitTime;
    state.durS_trigger = new Subject<[string, number]>();    
    const time = interval(clock).pipe(
        map( (x) => {
            return calculateTime();
        })
    );
    const sub = zip(time, state.durS_trigger).subscribe((res: [string, [string, number]])=>{showCurrentStateCombOp(res)});
    return sub;
}


function calculateTime(): string{
    let state = createClient();
    let res : string = undefined;    
    state.durS++;
    if(state.parkingSpot.maxTime < state.durS){
        state.timeExceeded = true;
    }
    res = `${Math.floor(state.durS/environments.secondsInHour)}:${Math.floor((state.durS%environments.secondsInHour)/environments.secondsInMinutes)}:${(state.durS%environments.secondsInHour)%environments.secondsInMinutes}`;                
    state.durS_trigger.next(calculatePrice());
    return res;
}

function calculatePrice():[string, number]{
    let state = createClient();
    let res: [string, number] = ["", 0];
    let index:number = state.parkingSpot.tariff;    
    if(state.parkingSpot.zone<3 && state.timeExceeded){
        index *= state.parkingSpot.penaltyIndex;
    }else{
        let remainingTime = state.parkingSpot.maxTime - state.durS
        res[0] = `${Math.floor(remainingTime/environments.secondsInHour)}:${Math.floor((remainingTime%environments.secondsInHour)/environments.secondsInMinutes)}:${(remainingTime%environments.secondsInHour)%environments.secondsInMinutes}`;
    }
    res[1] = Math.round(environments.pricePerSecond * index * state.durS * environments.roundFactor) / environments.roundFactor; 
    return res;
}

function calculateDurationInSeconds(): number{
    let state = createClient();
    let tmpDate : Date = new Date(); 
    let tmpH: number = tmpDate.getHours()*environments.secondsInHour;
    let tmpM: number = tmpDate.getMinutes()*environments.secondsInMinutes;
    let tmpS: number = tmpDate.getSeconds() + tmpH + tmpM;
    let timeOccupiedSplited : string[] = state.parkingSpot.timeOccupied.split(":",3);
    return tmpS - (parseInt(timeOccupiedSplited[0])*environments.secondsInHour + parseInt(timeOccupiedSplited[1])*environments.secondsInMinutes + parseInt(timeOccupiedSplited[2])) - 1;
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
    let url : string = `${environments.URL}/parkingSpots/${state.parkingSpot.id}`;
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
                    occupied:false,
                    timeOccupied: null,
                    garagesId: state.parkingSpot.garagesId
                }
            )
        })
    );
    state.parkingSpot=null;
    return putRequest;
}

export function fetchPlaces(): Promise<IPlace[]>{
    const url: string = `${environments.URL}/places/`;        
    const obs = fetch(url)
        .then( response => {
            return response.json();
        });
    return obs;
}

export function getNearbyParkings():Observable<INearbyGarage[]>{
    
    let state = createClient();
    let offset$: number[] = environments.offsets;    
    
    const obs = from(offset$).pipe(        
        map((offset: number) => calculateCoordinateLimits(offset)),
        switchMap((offset: number[]) => fetchNearbyParkings(offset)),
        map((garages: INearbyGarage[]) => {
                return garages.filter((garage: INearbyGarage) => {
                    garage.parkingSpots = garage.parkingSpots.filter((parkingSpot:INearbyParkingSpot) => parkingSpot.occupied===false);
                    return garage.parkingSpots.length >= 0;
                })
            }
        ),
        skipWhile((list: INearbyGarage[])=> list.length === 0),
        takeUntil(state.unsubscriber),
    ); 

    return obs;
}

function calculateCoordinateLimits(offset: number) : number[]{
    let state = createClient();
    let limit$: number[] = [state.userLocation.lng - offset, state.userLocation.lng + offset, state.userLocation.lat - offset, state.userLocation.lat + offset];
    return limit$;
}

function fetchNearbyParkings(values: number[]):Promise<INearbyGarage[]>{
    let url: string = `${environments.URL}/garages/?locationX_gte=${values[0]}&locationX_lte=${values[1]}&locationY_gte=${values[2]}&locationY_lte=${values[3]}&_embed=parkingSpots`;
    return fetch(url)
        .then(res=> res.json().then( list => {
            return list;        
    }));
}