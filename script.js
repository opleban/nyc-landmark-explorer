$( document ).ready(function() {
    // Check my script has loaded
    console.log("Hello from script.js")

    // FETCH Data
    async function fetchLandmarks() {
      let response = await fetch(`https://data.cityofnewyork.us/resource/x3ar-yjn2.geojson?$LIMIT=5000`);
      let data = await response.json()
      return data;
    }

    async function fetchLandmarksWithFilter(filterValue, filterType) {
      let response = await fetch(`https://data.cityofnewyork.us/resource/x3ar-yjn2.geojson?$WHERE=${filterType}='${filterValue}'&$LIMIT=5000`);
      let data = await response.json()
      return data;
    }

    async function fetchStyles() {
        // let response = await fetch(`https://data.cityofnewyork.us/resource/x3ar-yjn2.json?$SELECT=DISTINCT style_prim`);
        let response = await fetch(`https://data.cityofnewyork.us/resource/x3ar-yjn2.json?$SELECT=style_prim, count(style_prim) as count_of_styles&$GROUP=style_prim&$ORDER=count_of_styles DESC&$LIMIT=10&`)
        let data = await response.json()
        return data;
    }

    // utility function to translate borough code into borough name for address
    function getBoroughName(code) {
        const boroughDictionary = {
            "BK": "Brooklyn",
            "SI": "Staten Island",
            "QN": "Queens",
            "MN": "Manhattan",
            "BX": "Bronx"
        };

        return code ? boroughDictionary[code.toUpperCase()]: "NYC"
    }

    // Load my map using Leaflet
    var mymap = L.map('mapid').setView([40.721,-74.005], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(mymap)

    var propertyLayer = L.geoJSON([], {onEachFeature: onEachFeature}).addTo(mymap);

    // L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    //     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    //     maxZoom: 18,
    //     id: 'mapbox/streets-v11',
    //     tileSize: 512,
    //     zoomOffset: -1,
    //     accessToken: 'your.mapbox.access.token'
    // }).addTo(mymap);

    function onEachFeature(feature, layer) {
        // does this feature have a property named popupContent?
        if (feature.properties) {
            layer.bindPopup(`<div>See it on Google: <a target="_blank" href="https://www.google.com/maps/place/${feature.properties.address}, ${getBoroughName(feature.properties.borough)}, NYC ${feature.properties.zip_code}">Go here!</a> </div>`);
        }
    }

    function makeFilterButtons(architectureStyles) {
        return architectureStyles.map((style) => {
            const styleValue = style.style_prim;
            const mapButton = $(`<button class="map-filter">${styleValue}</button>`);
            mapButton.click((e) => {
                propertyLayer.clearLayers();
                fetchLandmarksWithFilter(styleValue, "style_prim").then((data) => {
                    propertyLayer.addData(data, {onEachFeature: onEachFeature}).addTo(mymap);
                })
            });
            return mapButton;
        });
    }

    // Let's start doing things here

    fetchLandmarks().then(data => {
        propertyLayer.addData(data, {onEachFeature: onEachFeature}).addTo(mymap);   
    });

    fetchStyles().then(data => {
        const styleButtons = makeFilterButtons(data);
        $("#button-list").append(styleButtons);
    });
});

