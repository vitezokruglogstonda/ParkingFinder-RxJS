export interface IParkingSpot{
    id: number;
    parkingHash: string;
    city: string;
    address: string;
    timeOccupied: string; 
    zone: number; 
    tariff: number; 
    penaltyIndex: number; 
    maxTime: number;
    location: Location;
}