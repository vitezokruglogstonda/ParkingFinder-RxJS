export interface IParkingSpotResponse{
    id: number;
    code: string;
    garagesId: number;
    occupied: boolean;
    timeOccupied: string;
    garages: IGarageResponse;
}

export interface IGarageResponse{
    id:number;
    address: string;
    maxTime: number;
    penaltyIndex: number;
    placeId: number;
    tariff: number;
    zone: number;
    locationX: number;
    locationY: number;
    //places: IPlace;
}

export interface IPlace{
    id: number;
    name: string;
    //center: Array<number>;
    center: [number,number];
    zoom: number;
    garagesId: Array<number>;
}

export interface INearbyGarage{
    id:number;
    address: string;
    maxTime: number;
    penaltyIndex: number;
    placeId: number;
    tariff: number;
    zone: number;
    locationX: number;
    locationY: number;
    parkingSpots: Array<INearbyParkingSpot>;
}

export interface INearbyParkingSpot{
    id: number;
    code: string;
    garagesId: number;
    occupied: boolean;
    timeOccupied: string;
}