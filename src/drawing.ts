import {createClient} from "./models/clientState";
import { checkCode } from "./controller/observable";
import { environments } from "./environments";

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

}

function drawCheckerContent(){
    let contentDiv = document.getElementsByClassName("contentDiv")[0];

    contentDiv.childNodes.forEach((x)=>{
        contentDiv.removeChild(x);
    });

    let parkingSpotBox: HTMLDivElement = document.createElement("div");
    parkingSpotBox.classList.add("parkingSpotBox");
    contentDiv.appendChild(parkingSpotBox);
    if(!state.parked){
        let label: HTMLLabelElement = document.createElement("label");
        label.innerHTML = "Enter your code here:";
        parkingSpotBox.appendChild(label);
        let inputHashField: HTMLInputElement = document.createElement("input");
        inputHashField.maxLength = environments.codeLength;
        parkingSpotBox.appendChild(inputHashField);
        checkCode(inputHashField);
        //applyButton.addEventListener("click", ()=>{})
            //funkcija se inportuje iz 2. fajla
            //mora da pita da li je kod validan (ovde se obraca serveru da izvuce iz baze)
            //ako jeste onda funkcija poziva samu sebe (da iscrta sve ponovo)
    }else{
     
        



    }
}