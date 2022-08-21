import {Location} from "./Location";

export class ParkingSpot{
    id: number = undefined
    parkingHash: string = undefined;
    city: string = undefined;
    address: string = undefined;
    timeOccupied: string = undefined; 
    zone: number = undefined; 
    tariff: number = undefined; 
    penaltyIndex: number = undefined; 
    maxTime: number = undefined;
    location: Location = undefined;

    constructor(_id: number, _parkingHash : string, _timeOccupied : string, _address: string, _zone : number, _tariff : number, _penaltyIndex :number, _maxTime : number, _city: string, _locationX: number, _locationY: number){
        this.id = _id;
        this.parkingHash = _parkingHash;
        this.timeOccupied = _timeOccupied;
        this.zone = _zone;
        this.tariff = _tariff;
        if(this.zone===3){
            this.penaltyIndex=1;
            this.maxTime = 0;
        }else{
            this.penaltyIndex=_penaltyIndex;
            this.maxTime = _maxTime;
        }
        this.city = _city;
        this.address = _address;
        this.location = new Location(_locationX, _locationY);
    }
}