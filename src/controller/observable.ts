import {debounceTime, filter, forkJoin, from, fromEvent, interval, map, Observable, Subscription, switchMap} from "rxjs";
import { ParkingSpot } from "../models/ParkingSpot";
import {environments} from "../environments";
import { createClient } from "../models/clientState";
import { drawCheckerContent, showCurrentState } from "../drawing";

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
            state.parkingSpot = new ParkingSpot(output[0].parkingHash, output[0].timeOccupied, output[0].zone, output[0].tariff, output[0].penaltyIndex, output[0].maxTime, output[0].city, output[0].locationX, output[0].locationY);
            drawCheckerContent();
        }else{
            alert("This is not your parking spot.");
        }
    });
}

function getParkingSpot(code:string):Observable<any>{
    let url : string = `${environments.URL}/parkings/?id=${code}`;
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
    ).subscribe((res: [string,number,boolean])=>{showCurrentState(res)});
    return sub;
}

function calculateDurationInSeconds(): number{
    let state = createClient();
    let tmpDate : Date = new Date(); 
    let tmpH: number = tmpDate.getHours()*360;
    let tmpM: number = tmpDate.getMinutes()*60;
    let tmpS: number = tmpDate.getSeconds() + tmpH + tmpM;
    let timeOccupiedSplited : string[] = state.parkingSpot.timeOccupied.split(":",3);
    return tmpS - parseInt(timeOccupiedSplited[0])*360 - parseInt(timeOccupiedSplited[1])*60 - parseInt(timeOccupiedSplited[2]) - 1;
}

function calculateTimeAndPrice(durS: number, x: number): [string, number, boolean]{
    let state = createClient();
    let res : [string, number, boolean] = ["",0,false];
    let penalty: boolean = false;
    durS+=x;
    res[0] = `${Math.floor(durS/360)}:${Math.floor(durS%360/60)}:${durS%360%60}`;                
    let index:number = state.parkingSpot.tariff;
    //za maxTime u satima
    // if(state.parkingSpot.zone<3 && state.parkingSpot.maxTime*360 > durS){
    //     index *= state.parkingSpot.penaltyIndex;
    //     penalty = true;
    // } 
    if(state.parkingSpot.zone<3 && state.parkingSpot.maxTime > durS){
        index *= state.parkingSpot.penaltyIndex;
        penalty = true;
    } 
    res[1] = environments.pricePerSecond * index * durS;
    res[2] = penalty;
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

function freeParking(){
    let state = createClient();
    let url : string = `${environments.URL}/parkings/?id=${state.parkingSpot.parkingHash}`;
    return from(    
        fetch(url, {
            method: "PUT", 
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(
                { 
                    id:state.parkingSpot.parkingHash,
                    city:state.parkingSpot.city,
                    zone:state.parkingSpot.zone,
                    tariff: state.parkingSpot.tariff,
                    penaltyIndex: state.parkingSpot.penaltyIndex,
                    maxTime: state.parkingSpot.maxTime,
                    locationX: state.parkingSpot.locationX,
                    locationY: state.parkingSpot.locationY,
                    occupied:false,
                    timeOccupied: null
                }
            )
        })
    );
}