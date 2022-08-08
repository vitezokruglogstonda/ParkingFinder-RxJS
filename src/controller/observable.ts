import {debounceTime, filter, from, fromEvent, map, Observable, Subscription, switchMap} from "rxjs";
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
            state.parkingSpot = new ParkingSpot(output[0].parkingHash, output[0].timeOccupied, output[0].zone, output[0].tariff, output[0].penaltyIndex, output[0].maxTime);
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

    let tmpDate : Date = new Date(); 
    let tmpH: number = tmpDate.getHours()*360;
    let tmpM: number = tmpDate.getMinutes()*60;
    let tmpS: number = tmpDate.getSeconds() + tmpH + tmpM;
    let timeOccupiedSplited : string[] = state.parkingSpot.timeOccupied.split(":",3);
    
    let durS : number = tmpS - parseInt(timeOccupiedSplited[0])*360 - parseInt(timeOccupiedSplited[1])*60 - parseInt(timeOccupiedSplited[2]) - 1;
    
    const sub = Observable.create(
        () => {
            setInterval(
            () => {
                let res : [string, number, boolean] = undefined;
                let penalty: boolean = false;
                durS++;
                res[0] = `${durS/360}:${durS%360/60}:${durS%360%60}`;
                let index:number = state.parkingSpot.tariff;
                if(state.parkingSpot.zone<3 && state.parkingSpot.maxTime*360 > durS){
                    index *= state.parkingSpot.penaltyIndex;
                    penalty = true;
                }
                res[1] = environments.pricePerSecond * index * durS;
                res[2] = penalty;
                return res;
            }    
            ,1000)
        }
    ).subscribe((res: [string,number,boolean])=>{showCurrentState(res)});

    return sub;
}
////////////////////////////1:2:3


// function execCreate() {
//     const sub = Observable.create(generator => {
//       setInterval(() => {
//         generator.next(parseInt(Math.random() * 6));
//       }, 500)
//     }).subscribe(x => console.log(x));
//     return sub;
//   }
  
//   function createUnsubscribeButton(subscription) {
  
//     const button = document.createElement("button");
//     document.body.appendChild(button);
//     button.innerHTML = "Stop!";
//     button.onclick = () => subscription.unsubscribe();
  
//   }
  
  
//   //execInterval();
//   const sub = execCreate();
//   createUnsubscribeButton(sub);


/////////////////

export function logOut(sub: Subscription){
    //pitaj korisnika da l je siguran
    sub.unsubscribe();
    //javi serveru da je slobodno
}