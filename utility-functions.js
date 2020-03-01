
	// FETCH Data
export async function fetchLandmarks() {
  let response = await fetch(`https://data.cityofnewyork.us/resource/x3ar-yjn2.geojson?$LIMIT=5000`);
  let data = await response.json();
  return data;
}

export async function fetchLandmarksWithFilter(filterValue, filterType) {
  let response = await fetch(`https://data.cityofnewyork.us/resource/x3ar-yjn2.geojson?$WHERE=${filterType}='${filterValue}'&$LIMIT=5000`);
  let data = await response.json();
  return data;
}

export async function fetchPrimaryStyles() {
    let response = await fetch(`https://data.cityofnewyork.us/resource/x3ar-yjn2.json?$SELECT=style_prim, count(style_prim) as count_of_landmarks&$GROUP=style_prim&$ORDER=count_of_landmarks DESC&$LIMIT=20`);
    let data = await response.json();
    return data;
}

export async function fetchHistoricDistricts() {
    let response = await fetch(`https://data.cityofnewyork.us/resource/x3ar-yjn2.json?$SELECT=hist_dist, count(hist_dist) as count_of_landmarks&$GROUP=hist_dist&$ORDER=count_of_landmarks DESC&$LIMIT=20`);
    let data = await response.json();
    return data;
}

export async function fetchLandmarkComplaints(bin) {
    let response = await fetch(`https://data.cityofnewyork.us/resource/wycc-5aqt.json?bin=${bin}`);
    let data = await response.json();
    return data;
}

export async function fetchLandmarkViolations(bin) {
    let response = await fetch(`https://data.cityofnewyork.us/resource/ck4n-5h6x.json?bin=${bin}`);
    let data = await response.json();
    return data;
}

// utility function to translate borough code into borough name for address
export function getBoroughName(code) {
    const boroughDictionary = {
        "BK": "Brooklyn",
        "SI": "Staten Island",
        "QN": "Queens",
        "MN": "Manhattan",
        "BX": "Bronx"
    };

    return code ? boroughDictionary[code.toUpperCase()]: "NYC"
}
