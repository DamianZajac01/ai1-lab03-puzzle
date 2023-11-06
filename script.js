class Index {
    constructor(id, i, j) {
        this.id = id;
        this.i = i;
        this.j = j;
    }
}

let indexArray = [];

function shuffleArray(array) {
    for (let i = 0; i < array.length; i++) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getLocation() {
    if (! navigator.geolocation) {
        alert("Nie można kontynuować bez zgody na udostępnienie lokalizacji");
    }

    navigator.geolocation.getCurrentPosition((position) => {

        map.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        map.panTo(new L.LatLng(latitude, longitude));
        L.marker([latitude, longitude]).addTo(map);

    }, (positionError) => {
        console.error(positionError);
    }, {
        enableHighAccuracy: false
    });
}

document.getElementById("saveButton").addEventListener("click", function() {

    leafletImage(map, function (err, canvas) {
        let mapWidth = map.getSize().x;
        let mapHeight = map.getSize().y;
        let puzzleWidth = mapWidth / 4;
        let puzzleHeight = mapHeight / 4;

        let counter = 0;

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                indexArray.push(new Index(counter++, i, j));
            }
        }

        shuffleArray(indexArray);

        counter = 0;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let rasterMap = document.createElement("canvas");
                let index = indexArray[counter++];

                rasterMap.draggable = true;
                rasterMap.id = `item-${index.id}`;
                rasterMap.style.width = puzzleWidth + "px";
                rasterMap.style.height = puzzleHeight + "px";

                rasterMap.width = puzzleWidth;
                rasterMap.height = puzzleHeight;

                rasterMap.style.margin = "0px";

                document.body.appendChild(rasterMap);

                let rasterContext = rasterMap.getContext("2d");

                rasterContext.drawImage(canvas, (puzzleWidth * index.j), (puzzleHeight * index.i), puzzleWidth, puzzleHeight, 0, 0, puzzleWidth, puzzleHeight);
            }
        }

        addDraggableFunction();
    });
});

function addDraggableFunction() {
    let mainTarget = document.getElementById("main-drag-target");

    let items = document.querySelectorAll("canvas");
    for (let item of items) {
        item.addEventListener("dragstart", function (event) {
            this.style.border = "5px dashed #D8D8FF";
            event.dataTransfer.setData("text", this.id);
        });

        item.addEventListener("dragend", function (event) {
            this.style.borderWidth = "0";
        });

        let target = document.createElement("div");
        target.draggable = true;
        target.style.height = item.style.height;
        target.style.width = item.style.width;
        target.style.backgroundColor = "red";
        target.style.border = "1px solid black"
        target.classList.add("drag-target");
        mainTarget.appendChild(target);
    }

    let targets = document.getElementsByClassName("drag-target");
    for (let target of targets) {

        target.addEventListener("dragenter", function (event) {
            this.style.border = "2px solid #7FE9D9";
        });

        target.addEventListener("dragleave", function (event) {
            this.style.border = "1px solid black";
            const hasCanvas = target.querySelector('canvas');
            if (hasCanvas) {
                this.style.borderWidth = "0";
            }
        });

        target.addEventListener("dragover", function (event) {
            event.preventDefault();
        });

        target.addEventListener("drop", function (event) {
            let myElement = document.querySelector("#" + event.dataTransfer.getData("text"));
            this.appendChild(myElement)
            this.style.borderWidth = "0";

            isSolved(mainTarget);

        }, false);
    }
}

function isSolved(mainTarget) {
    let canvas = mainTarget.querySelectorAll(".drag-target canvas");

    if (canvas.length !== 16) {
        return;
    }

    let counter = 0;
    for (let cnvs of canvas) {
        let id = cnvs.id;

        console.log(`item-${counter}` === id);
        if (`item-${counter}` !== id) {
            return;
        }
        counter++;
    }

    setTimeout(winInfo, 500);
}

function winInfo() {
    alert("Wygrałeś!");
}

let latitude = 51.505;
let longitude = -0.09;
let zoom = 16;

let map = L.map('map').setView([latitude, longitude], zoom);
L.tileLayer.provider('Esri.WorldImagery').addTo(map);

map.on('zoom', ({ target }) => {
    zoom = target.getZoom();
});