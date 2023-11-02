// bugi:
// 1. dziwny margin/padding miedzy puzzlami na dole

class Index {
    constructor(i, j) {
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
        alert("Sorry, no geolocation available for you!");
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
        let marker = L.marker([latitude, longitude]).addTo(map);

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
        let puzzleWidth = mapWidth / 4; // Dla 4x4 siatki
        let puzzleHeight = mapHeight / 4;

        let counter = 0;

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                indexArray.push(new Index(i, j));
            }
        }

        shuffleArray(indexArray);

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {

                // aby zapewnic losowsc moge zrobic tak ze dodam najpierw te elemety do jakiejs tablicy
                // a potem losowo wybierajac z tablicy bede je appendowac jako childy do wyswietlenia
                // jednoczesnie usuwajac z tablicy zaappendowane elementy

                // (zrobic obiekty ktore maja i, j jako indeksy (?) i je uzywac losowo)

                let rasterMap = document.createElement("canvas");

                rasterMap.draggable = true;
                rasterMap.id = `item-${counter}`;
                rasterMap.style.width = puzzleWidth + "px";
                rasterMap.style.height = puzzleHeight + "px";

                rasterMap.width = puzzleWidth;
                rasterMap.height = puzzleHeight;

                rasterMap.style.margin = "0px";

                document.body.appendChild(rasterMap);

                console.log(`${counter}: ${i}, ${j}`);

                let rasterContext = rasterMap.getContext("2d");
                // rasterContext.drawImage(canvas, (puzzleWidth * i), (puzzleHeight * j), puzzleWidth, puzzleHeight, 0, 0, puzzleWidth, puzzleHeight);

                let index = indexArray[counter++];
                rasterContext.drawImage(canvas, (puzzleWidth * index.i), (puzzleHeight * index.j), puzzleWidth, puzzleHeight, 0, 0, puzzleWidth, puzzleHeight);
            }
        }
    });

    setTimeout(addDraggableFunction, 10000);
    //addDraggableFunction();
});

function addDraggableFunction() {
    let items = document.querySelectorAll("canvas");
    for (let item of items) {
        item.addEventListener("dragstart", function (event) {
            this.style.border = "5px dashed #D8D8FF";
            event.dataTransfer.setData("text", this.id);
            console.log(event.dataTransfer.getData("text"));
        });

        item.addEventListener("dragend", function (event) {
            this.style.borderWidth = "0";
        });
    }

    let target = document.getElementById("drag-target");
    target.addEventListener("dragenter", function (event) {
        this.style.border = "2px solid #7FE9D9";
    });
    target.addEventListener("dragleave", function (event) {
        this.style.border = "2px dashed #7f7fe9";
    });
    target.addEventListener("dragover", function (event) {
        event.preventDefault();
    });
    target.addEventListener("drop", function (event) {
        let myElement = document.querySelector("#" + event.dataTransfer.getData("text"));
        this.appendChild(myElement)
        this.style.border = "2px dashed #7f7fe9";
    }, false);
}

function splitMap() {
    let layers = [];
    map.eachLayer( function(layer) {
        if( layer instanceof L.TileLayer ) {
            layers.push(layer);
        }
    } );

    console.log(layers.length);
    console.log(layers);

    let mapWidth = map.getSize().x;
    let mapHeight = map.getSize().y;
    let puzzleWidth = mapWidth / 4; // Dla 4x4 siatki
    let puzzleHeight = mapHeight / 4;

    // let puzzleWidth = mapWidth; // Dla 4x4 siatki
    // let puzzleHeight = mapHeight;

    document.getElementById("puzzle-container").innerHTML = "";

    let x = Math.floor((longitude + 180) / 360 * Math.pow(2, zoom)); // Obliczenie wartości x
    let y = Math.floor((1 - Math.log(Math.tan(latitude * Math.PI / 180) + 1 / Math.cos(latitude * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)); // Obliczenie wartości y
    let url = 'https://' + subdomain + '.tile.openstreetmap.org/' + zoom + '/' + x + '/' + y + '.png';


    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {


            let puzzle = document.createElement("div");
            puzzle.className = "map-puzzle";
            puzzle.style.width = puzzleWidth + "px";
            puzzle.style.height = puzzleHeight + "px";
            puzzle.style.backgroundImage = `url(${url})`; // Ustaw obraz mapy jako tło

            puzzle.style.backgroundPosition = "-" + j * puzzleWidth + "px -" + i * puzzleHeight + "px"; // Ustaw pozycję tła
            document.getElementById("map-puzzle-container").appendChild(puzzle);

            console.log(url);

        }
    }
}

let latitude = 51.505; // Przykładowe współrzędne
let longitude = -0.09;
let zoom = 12; // Przykładowy poziom przybliżenia
let subdomain = 'c'; // Możesz wybrać subdomenę (a, b, c)

let map = L.map('map').setView([latitude, longitude], zoom);
// let layer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 18,
//     renderer: L.canvas() // to dodalem
// });

L.tileLayer.provider('Esri.WorldImagery').addTo(map);
// layer.addTo(map);

map.on('zoom', ({ target }) => {
    zoom = target.getZoom();
});

// map.on('zoomend', ({ target }) => {
//     console.log(target.getZoom());
// });