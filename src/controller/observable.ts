import {debounceTime, filter, from, fromEvent, map, Observable, switchMap} from "rxjs";
import { ParkingSpot } from "../models/ParkingSpot";
import {environments} from "../environments";

export function checkCode(input: HTMLInputElement){
    fromEvent(input, "input").pipe(
        debounceTime(500),
        map((ev: InputEvent) => (<HTMLInputElement>ev.target).value),
        filter(text => text.length == environments.codeLength),
        switchMap((text:string) => getParkingSpot(text)),
    );
}

function getParkingSpot(code:string):Observable<ParkingSpot[]>{
    return null;
    // return from(
    //   fetch(`${environments.URL}`)
    //     .then((res) => {
          
    //     })
    //     .catch((err) => (playerContainer.innerHTML = environments.codeError))
    // );
  }