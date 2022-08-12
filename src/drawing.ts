import {createClient} from "./models/clientState";
import { calculate, checkCode, logOut } from "./controller/observable";
import { environments } from "./environments";
import { filter } from "rxjs";

const state = createClient();

export function draw(container:HTMLElement){
    const mainDiv: HTMLDivElement = document.createElement("div");
    mainDiv.classList.add("mainDiv");
    container.appendChild(mainDiv);  

    const footerDiv :HTMLDivElement = document.createElement("div");
    footerDiv.classList.add("footer");
    const footerText : HTMLElement = document.createElement("p");
    footerText.innerHTML = environments.footer;
    footerDiv.appendChild(footerText);
    container.appendChild(footerDiv);

    const centerDiv: HTMLDivElement = document.createElement("div");
    centerDiv.classList.add("centerDiv");
    mainDiv.appendChild(centerDiv);    

    const optionsDiv: HTMLDivElement = document.createElement("div");
    optionsDiv.classList.add("optionsDiv");
    centerDiv.appendChild(optionsDiv);

    const contentDiv: HTMLDivElement = document.createElement("div");
    contentDiv.classList.add("contentDiv");
    centerDiv.appendChild(contentDiv);
    
    const tabsDiv: HTMLDivElement = document.createElement("div");
    tabsDiv.classList.add("tabsDiv");
    optionsDiv.appendChild(tabsDiv);      

    let tab:HTMLDivElement = document.createElement("div");
    tab.classList.add("tab");
    tab.classList.add("selectedTab");
    tab.innerHTML = "Find parking";
    tab.setAttribute("id","finder-tab");
    tab.addEventListener("click", (ev)=>{
        changeTabTo("finder-tab");
    });
    tabsDiv.appendChild(tab);

    tab = document.createElement("div");
    tab.classList.add("tab");
    tab.innerHTML = "Check status";
    tab.setAttribute("id","checker-tab");
    tab.addEventListener("click", (ev)=>{
        changeTabTo("checker-tab");
    });
    tabsDiv.appendChild(tab);

    const horisontalLine: HTMLDivElement = document.createElement("div");
    horisontalLine.classList.add("hrLine");
    optionsDiv.appendChild(horisontalLine);

    //content
    drawFinderContent();

}

function changeTabTo(newTab: string){
    if(state.currentTab !== newTab){
        let currentTabHtmlElement: HTMLElement = document.getElementById(state.currentTab);
        currentTabHtmlElement.classList.remove("selectedTab");
        let nextTabHtmlElement: HTMLElement = document.getElementById(newTab);
        nextTabHtmlElement.classList.add("selectedTab");
        state.currentTab = newTab;
        if(state.currentTab === "finder-tab"){
            drawFinderContent();
        }else{
            drawCheckerContent();
        }
    }
}

function drawFinderContent(){
    let contentDiv = document.getElementsByClassName("contentDiv")[0];
    
    contentDiv.childNodes.forEach((x)=>{
        contentDiv.removeChild(x);
    });

    let filterDiv: HTMLDivElement = document.createElement("div");
    filterDiv.classList.add("filterDiv");

    let label : HTMLLabelElement = document.createElement("label");
    label.innerHTML = "City: ";
    filterDiv.appendChild(label);

    let selectCity: HTMLSelectElement = document.createElement("select");
    let state = createClient();    
    let places: string[] = state.places;
    let option: HTMLOptionElement;
    places.forEach( (place) => {
        option = document.createElement("option");
        option.innerHTML = place;
        option.value = place;
        selectCity.appendChild(option);
    });
    //on change da poziva funkciju iz observable gde steluje mapu
    filterDiv.appendChild(selectCity);

    contentDiv.appendChild(filterDiv);

    //mapa


}

export function drawCheckerContent(){
    
    let contentDiv = document.getElementsByClassName("contentDiv")[0];

    contentDiv.childNodes.forEach((x)=>{
        contentDiv.removeChild(x);
    });

    let parkingSpotBox: HTMLDivElement = document.createElement("div");
    parkingSpotBox.classList.add("parkingSpotBox");
    if(state.parked){
        parkingSpotBox.classList.add("parkingSpotBoxAddition");
    }
    contentDiv.appendChild(parkingSpotBox);
    if(!state.parked){
        let label: HTMLLabelElement = document.createElement("label");
        label.classList.add("enterCodeLabel");
        label.innerHTML = `${environments.labelEnterCodeString}`;
        parkingSpotBox.appendChild(label);
        let inputHashField: HTMLInputElement = document.createElement("input");
        inputHashField.maxLength = environments.codeLength;
        parkingSpotBox.appendChild(inputHashField);
        checkCode(inputHashField);
    }else{
        let infoBox: HTMLDivElement = document.createElement("div");
        infoBox.classList.add("infoBox");
        
        let label: HTMLLabelElement = document.createElement("label");
        label.setAttribute("id","timeSpentLabel");
        label.classList.add("infoLabel");
        infoBox.appendChild(label);

        label = document.createElement("label");
        label.setAttribute("id","priceLabel");
        label.classList.add("infoLabel");
        infoBox.appendChild(label);

        label = document.createElement("label");
        label.setAttribute("id","remainingTimeLabel");
        label.classList.add("infoLabel");
        infoBox.appendChild(label);

        parkingSpotBox.appendChild(infoBox);
        let logOutButton : HTMLButtonElement = document.createElement("button");
        logOutButton.innerHTML = "Pay";        
        parkingSpotBox.appendChild(logOutButton);

        let sub = calculate();

        logOutButton.addEventListener("click", (ev)=>{
            logOut(sub);
        });
    }
}

export function showCurrentState(output: [string, string, number, boolean]){
    let state = createClient();    
    let duration = output[0];
    state.price = output[2];
    let labelTime : HTMLElement= document.getElementById("timeSpentLabel");
    let labelPrice : HTMLElement= document.getElementById("priceLabel");
    let labelRemainingTime : HTMLElement= document.getElementById("remainingTimeLabel");
    if(output[3]){
        labelTime.classList.add("infoLabelPenalty");
        labelPrice.classList.add("infoLabelPenalty");
        labelRemainingTime.innerHTML = `${environments.labelRemainingTimePenaltyString}`;
        labelRemainingTime.classList.add("infoLabelPenalty");
    }else{
        labelRemainingTime.innerHTML = `${environments.labelRemainingTimeString}${output[1]}`;
    }
    labelTime.innerHTML = `${environments.labelTimeString}${duration}`;
    labelPrice.innerHTML = `${environments.labelPriceString}${state.price} ${environments.currency}`;
}