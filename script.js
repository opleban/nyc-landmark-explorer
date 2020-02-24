(() => {

	async function fetchLandmarks() {
	  let response = await fetch(`https://data.cityofnewyork.us/resource/x3ar-yjn2.geojson?$LIMIT=5000`);
	  let data = await response.json()
	  return data;
	}

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

	console.log("Hello from script.js")
	var mymap = L.map('mapid').setView([40.721,-74.005], 15);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
      }).addTo(mymap)

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

	fetchLandmarks().then(data => {
		console.log(data);
		L.geoJSON(data, {onEachFeature: onEachFeature}).addTo(mymap);	
	});

})();