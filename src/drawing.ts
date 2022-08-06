import {state} from "./clientState"

export function draw(container:HTMLElement){
    const mainDiv: HTMLDivElement = document.createElement("div");
    mainDiv.classList.add("mainDiv");
    container.appendChild(mainDiv);  

    const footerDiv :HTMLDivElement = document.createElement("div");
    footerDiv.classList.add("footer");
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
        let currentTabHtmlElement = document.getElementById(state.currentTab);
        currentTabHtmlElement.classList.remove("selectedTab");
        let nextTabHtmlElement = document.getElementById(newTab);
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
    let contentDiv = document.getElementsByClassName("contentDiv");


}

function drawCheckerContent(){
    let contentDiv = document.getElementsByClassName("contentDiv");

    
}