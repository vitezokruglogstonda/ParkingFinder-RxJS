export class Location{
    lng: number; //horizontalno
    lat: number; //vertikalno
    constructor(newLocX?: number, newLocY?: number){
        if(newLocX !== undefined && newLocY !== undefined){
            this.lng = newLocX;
            this.lat = newLocY;
        }        
    }
}