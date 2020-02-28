$( document ).ready(function() {
    // Check my script has loaded
    console.log("Hello from script.js");

    // FETCH Data
    async function fetchLandmarks() {
      let response = await fetch(`https://data.cityofnewyork.us/resource/x3ar-yjn2.geojson?$LIMIT=5000`);
      let data = await response.json();
      return data;
    }

    async function fetchLandmarksWithFilter(filterValue, filterType) {
      let response = await fetch(`https://data.cityofnewyork.us/resource/x3ar-yjn2.geojson?$WHERE=${filterType}='${filterValue}'&$LIMIT=5000`);
      let data = await response.json();
      return data;
    }

    async function fetchStyles() {
        // let response = await fetch(`https://data.cityofnewyork.us/resource/x3ar-yjn2.json?$SELECT=DISTINCT style_prim`);
        let response = await fetch(`https://data.cityofnewyork.us/resource/x3ar-yjn2.json?$SELECT=style_prim, count(style_prim) as count_of_styles&$GROUP=style_prim&$ORDER=count_of_styles DESC&$LIMIT=10&`);
        let data = await response.json();
        return data;
    }

    async function fetchLandmarkComplaints(bin) {
        let response = await fetch(`https://data.cityofnewyork.us/resource/wycc-5aqt.json?$bin=${bin}`);
        let data = await response.json();
        return data;
    }

    async function fetchLandmarkViolation(bin) {
        let response = await fetch(`https://data.cityofnewyork.us/resource/ck4n-5h6x.json?$bin=${bin}`);
        let data = await response.json();
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
    var mymap = L.map('mapid').setView([40.696,-73.989], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(mymap)

    layerOptions = { onEachFeature: onEachFeature, 
                     style: function(feature) { return {weight: "2"}
                    } 
                                    } 
    var propertyLayer = L.geoJSON([], layerOptions)
        .addTo(mymap);

    // L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    //     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    //     maxZoom: 18,
    //     id: 'mapbox/streets-v11',
    //     tileSize: 512,
    //     zoomOffset: -1,
    //     accessToken: 'your.mapbox.access.token'
    // }).addTo(mymap);

    // function onEachFeature(feature, layer) {
    //     // does this feature have a property named popupContent?
    //     if (feature.properties) {
    //         layer.bindPopup(`<div>See it on Google: <a target="_blank" href="https://www.google.com/maps/place/${feature.properties.address}, ${getBoroughName(feature.properties.borough)}, NYC ${feature.properties.zip_code}">Go here!</a> </div>`);
    //     }
    // }
    let currentSelected;
    function onEachFeature(feature, layer) {
        // does this feature have a property named popupContent?
        if (feature.properties) {
            if (currentSelected) {
                currentSelected.resetStyle()
            }
            layer.bindPopup(`<div>See it on Google: <a target="_blank" href="https://www.google.com/maps/place/${feature.properties.address}, ${getBoroughName(feature.properties.borough)}, NYC ${feature.properties.zip_code}">Go here!</a> </div>`);
            layer.on('click', function(e) {
                if (currentSelected) {
                    currentSelected.setStyle({color: '#3388ff', fillColor: '#3388ff'})
                }
                showLandmarkDisplayCard(feature.properties);
                layer.setStyle({color:'red', fillColor:'yellow'});
                currentSelected = layer;
                // fetchAdditionalLandmarkInformation()
            });
            layer.on('hover', function(e) {
                if (currentSelected) {
                    currentSelected.setStyle({color: '#3388ff', fillColor: '#3388ff'})
                }
                console.log("click clock");
                showLandmarkDisplayCard(feature.properties);
                layer.setStyle({color:'red', fillColor:'yellow'});
                currentSelected = layer;
                // fetchAdditionalLandmarkInformation()
            });
        }
    }

    function makeFilterButtons(architectureStyles) {
        return architectureStyles.map(function (style) {
            const styleValue = style.style_prim;
            const mapButton = $(`<button class="map-filter">${styleValue}</button>`);
            mapButton.click((e) => {
                currentSelected = null;
                propertyLayer.clearLayers();
                fetchLandmarksWithFilter(styleValue, "style_prim").then(function (data) {
                    propertyLayer.addData(data, {onEachFeature: onEachFeature}).addTo(mymap);
                })
            });
            return mapButton;
        });
    }

    function showLandmarkDisplayCard(landmarkData) {
        // Lets clear the existing card if it's there;
        $(".landmark-info-card").remove();

        // grab the variables we care about
        const { bin, bbl, borough, zip_code, address, owner_name, 
                num_floors,year_build, arch_build, style_prim, mat_prim, 
                use_orig, use_other, build_type,  build_nme, hist_dist, era } = landmarkData;
        // let's now build our new div
        const landmarkCardDiv = $("<div class='landmark-info-card'></div>");
        landmarkCardDiv.append(`<h3>${address}, ${getBoroughName(borough)}, NYC ${zip_code}</h3>`);
        if (hist_dist != '0') { landmarkCardDiv.append(`<div class="detail">Historic District: ${hist_dist}</div>`); }
        if (build_nme != '0') { landmarkCardDiv.append(`<div class="detail">${build_nme}</div>`); }
        landmarkCardDiv.append(`<div class="detail">Primary Style: ${style_prim}</div>`);
        landmarkCardDiv.append(`<div class="detail">Era: ${era}</div>`);
        landmarkCardDiv.append(`<div class="detail">Year Built: ${year_build}</div>`);
        landmarkCardDiv.append(`<div class="detail">Primary Style: ${style_prim}</div>`);
        landmarkCardDiv.append(`<div class="detail">Primary Material: ${mat_prim}</div>`);
        landmarkCardDiv.append(`<div class="detail">Building Type: ${build_type}</div>`);

        complaintButton = $('<button>See Complaints</button>');
        complaintButton.click(() => { 
            fetchLandmarkComplaints(bin); 
        });

        violationButton = $('<button>See Violations</button>');
        violationButton.click(() => { 
            fetchLandmarkViolations(bin);
        })
        landmarkData.append(complaintButton);
        landmarkData.append(violationButton)
        $('#landmark-info-container').append(landmarkCardDiv);
    }


    // Let's start doing things here

    fetchLandmarks().then((data) => {
        propertyLayer.addData(data, {onEachFeature: onEachFeature}).addTo(mymap);   
    });

    fetchStyles().then((data) => {
        const styleButtons = makeFilterButtons(data);
        $("#button-list").append(styleButtons);
    });
});

