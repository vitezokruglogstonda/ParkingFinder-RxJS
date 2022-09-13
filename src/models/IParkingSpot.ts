import {ILocation} from "./ILocation";

export interface IParkingSpot{
    id: number;
    parkingHash: string;
    address: string;
    timeOccupied: string; 
    zone: number; 
    tariff: number; 
    penaltyIndex: number; 
    maxTime: number;
    location: ILocation;
    garagesId: number;    
}