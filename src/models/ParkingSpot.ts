export class ParkingSpot{
    parkingHash: string = undefined;
    city: string = undefined;
    timeOccupied: string = undefined; //dateTime?
    zone: number = undefined; //ako je 3 onda se ne racuna penalty i nije ograniceno, 2 je malo ublazeno (ali se racuna), 1 - najgore
        //prepraviti u bazi zonu 3 da bude null za tarifu, penalty i maxTime
    tariff: number = undefined; //ovo se mnozi sa provedenim vremenom (kao koeficijent) i tako dobija cena
    penaltyIndex: number = undefined; //ovo se mnozi sa tarifom ako se prekoraci maxTime 
    maxTime: number = undefined;
    locationX: number = undefined;
    locationY: number = undefined;

    constructor(_parkingHash : string, _timeOccupied : string, _zone : number, _tariff : number, _penaltyIndex :number, _maxTime : number, _city: string, _locationX: number, _locationY: number){
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
        this.locationX = _locationX;
        this.locationY = _locationY;
    }
}