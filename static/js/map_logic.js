// Grabbing superfund site data.
var superfundSites = [];
var stateStats = [];

d3.json("/superfund_sites", function (data) {

  data.forEach(function (sqlitedata) {
    data.name = sqlitedata.name;
    data.address = sqlitedata.address;
    data.city = sqlitedata.city;
    data.state = sqlitedata.state;
    data.hrs_score = +sqlitedata.hrs_score;
    data.latitude = +sqlitedata.latitude;
    data.longitude = +sqlitedata.longitude;
    data.id = +sqlitedata.id;
    superfundSites.push(
      L.circleMarker([data.latitude, data.longitude],
        {
          radius: 10,
          fillColor: getColorSFSites(data.hrs_score),
          fillOpacity: .7,
          stroke: true,
          color: "black",
          weight: .5
        }
        //,{ icon: L.BeautifyIcon.icon(options) }
      ).bindPopup(data.name.bold() + "<br>" + data.address + "<br>" + data.city + ", " + data.state + "<br>HRS Score: " + data.hrs_score + "<br>Site ID: " + data.id.toString().bold()));
  });

  var statePopDensChloro;
  var stateCancerChloro;
  var stateHRSChloro;
  var stateIncomeChloro;
  var PopLegend;
  var CanLegend;
  var HRSLegend;
  var InLegend;

  d3.json("/state_stats/get_data", function (data) {
    data.forEach(function (xdata) {
      var xstate = xdata.state;
      objIndex = statesData.features.findIndex((obj => obj.properties.name == xstate));
      statesData.features[objIndex].properties.state_stats = xdata;
    });
    // remove Puerto Rico
    statesData.features = statesData.features.filter(function (item) {
           return item.properties.name !== "Puerto Rico"
    });

    // extract min-max data needed for legends
    var res = createStateChloro("population_density", statesData, "Population Density");
    statePopDensChloro = res[0];
    PopLegend = res[1];

    res = createStateChloro("cancer_death_rate", statesData, "Cancer Death Rate");
    stateCancerChloro = res[0];
    CanLegend = res[1];

    res = createStateChloro("avg_hrsscore", statesData, "Avg. Hazard Ranking");
    stateHRSChloro = res[0];
    HRSLegend = res[1];

    res = createStateChloro("median_household_income", statesData, "Avg. Income");    
    stateIncomeChloro = res[0];
    InLegend = res[1];

    createMap(superfundSites,
      statePopDensChloro,PopLegend,
      stateCancerChloro,CanLegend,
      stateHRSChloro,HRSLegend,
      stateIncomeChloro,InLegend);

  });

});

function createStateChloro(prop,sdata,name) {

  var chloro = new L.LayerGroup();

  // All features together
  function XonEachFeature(feature, layer) {
    layer.on({
      //mouseover: highlightFeature,
      //mouseout: resetHighlight,
      //click: zoomToFeature
    });
  }

  // Add style to assign state color based on population density
  function Xstyle(feature) {
    var prop_max = prop+"_max";
    var prop_min = prop+"_min";

    return {
      fillColor: colorScale(feature.properties.state_stats[prop],
        feature.properties.state_stats[prop_min],
        feature.properties.state_stats[prop_max]),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  }

  geojson = L.geoJson(statesData, {
      style: Xstyle,
      onEachFeature: XonEachFeature
   }).addTo(chloro);


  var xlegend = L.control({ position: 'bottomleft' });
  xlegend.onAdd = function () {

    var prop_max = prop + "_max";
    var prop_min = prop + "_min";

    // compute grades
    var min = sdata.features[0].properties.state_stats[prop_min];
    var max = sdata.features[0].properties.state_stats[prop_max];

    var bgrades = [0,1,2,3,4,5,6]
    for(i=0;i<bgrades.length;i++) {
      bgrades[i] = Math.round(bgrades[i]/7.0 * (max-min) + min);
    }

    var div = L.DomUtil.create('div', 'info legend'),
      grades = bgrades,
      labels = [];

    div.innerHTML += '<b>'+name+'</b><br>'
    // Loop through intervals to generate labels and colored squares for superfund hazard rank legend
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + colorScale(grades[i] + 1,min,max) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };

  return [chloro,xlegend];
}


function createMap(superfundSites,
  statePopDensChloro,PopLegend,
  stateCancerChloro,CanLegend,
  stateHRSChloro,HRSLegend,
  stateIncomeChloro,InLegend) {

  // Define tile layers
  var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });
  var streetMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });
  var lightMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite Map": satelliteMap,
    "Street Map": streetMap,
    "Light Map": lightMap
  };

  // Add superfund and stateBoundary layers
  var superfundLayer = L.layerGroup(superfundSites);
  var emptyLayer = new L.LayerGroup()

  // Overlays that may be toggled on or off
  var overlayMaps = {
    "Superfund Sites": superfundLayer,
  };

  var overlayMapsAsBase = {
    "Nothing": emptyLayer,
    "Cancer Death Rate": stateCancerChloro,
    "Population Density": statePopDensChloro,
    "Avg. HRS Score": stateHRSChloro,
    "Avg. Income": stateIncomeChloro
  };

  // Creating map object and set default layers
  var myMap = L.map("map", {
    center: [37.8283, -98.5795],
    zoom: 5,
    layers: [streetMap, superfundLayer, emptyLayer]
  });


  // Pass map layers into layer control
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var xcontrol = L.control.layers(overlayMapsAsBase,{},{
    collapsed: false
  });
  myMap.addControl(xcontrol);


  // Create legend, this one is for the superfund stuff
  var legendSF = L.control({ position: 'bottomright' });
  legendSF.onAdd = function (myMap) {
    var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 10, 20, 30, 40, 50, 60, 70],
      labels = ['<strong>Text</strong>'];

    div.innerHTML += '<b>Hazard Ranking</b><br>' 
    // Loop through intervals to generate labels and colored squares for superfund hazard rank legend
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColorSFSites(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legendSF.addTo(myMap);


  myMap.on('overlayadd', function (eventLayer) {
    if (eventLayer.name === "Superfund Sites") {
      legendSF.addTo(this);
    }
    else {
      CanLegend.addTo(this);
      this.removeControl(legendSF);
    }
  });

  myMap.on('overlayremove', function (eventLayer) {
    if (eventLayer.name === "Superfund Sites") {
      this.removeControl(legendSF);
    }
  });

  myMap.on('baselayerchange', function (eventLayer) {
    console.log(eventLayer.name);
    if (eventLayer.name === "Cancer Death Rate") {
      CanLegend.addTo(this);
      this.removeControl(HRSLegend);
      this.removeControl(InLegend);
      this.removeControl(PopLegend);
    } else if (eventLayer.name === "Population Density"){
      PopLegend.addTo(this);
      this.removeControl(CanLegend);
      this.removeControl(HRSLegend);
      this.removeControl(InLegend);
    } else if (eventLayer.name === "Avg. HRS Score") {
      HRSLegend.addTo(this);
      this.removeControl(CanLegend);
      this.removeControl(PopLegend);
      this.removeControl(InLegend);
    } else if (eventLayer.name === "Avg. Income") {
      InLegend.addTo(this);
      this.removeControl(CanLegend);
      this.removeControl(PopLegend);
      this.removeControl(HRSLegend);
    } else if (eventLayer.name === "Nothing") {
      this.removeControl(CanLegend);
      this.removeControl(PopLegend);
      this.removeControl(HRSLegend);
      this.removeControl(InLegend);
    }


  });


  //legend.addTo(myMap);

}