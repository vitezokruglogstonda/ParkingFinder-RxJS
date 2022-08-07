export class ParkingSpot{
    parkingHash: string;
    timeOccupied: string; //dateTime?
    zone: number; //ako je 3 onda se ne racuna penalty i nije ograniceno, 2 je malo ublazeno (ali se racuna), 1 - najgore
        //prepraviti u bazi zonu 3 da bude null za tarifu, penalty i maxTime
    tariff: number; //ovo se mnozi sa provedenim vremenom (kao koeficijent) i tako dobija cena
    penaltyIndex: number; //ovo se mnozi sa tarifom ako se prekoraci maxTime 
    maxTime: number;
    //lokacija?

    constructor(){

    }
}