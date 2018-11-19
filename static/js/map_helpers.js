function getColorSFSites(d) {
    return d > 70 ? '#b30000' :
        d > 60 ? '#e60000' :
        d > 50 ? '#FF3300' :
        d > 40 ? '#FF6600' :
        d > 30 ? '#FF9900' :
        d > 20 ? '#FFCC00' :
        d > 10 ? '#99FF00' :
        '#00FF00';
}

// Add color to states
function getStateColor(d) {
    return d > 1000 ? '#800026' :
        d > 500 ? '#BD0026' :
        d > 200 ? '#E31A1C' :
        d > 100 ? '#FC4E2A' :
        d > 50 ? '#FD8D3C' :
        d > 20 ? '#FEB24C' :
        d > 10 ? '#FED976' :
        '#FFEDA0';
}

function colorScale(d, min, max) {
    var colors = ['#FFEDA0', '#FED976', '#FEB24C',
        '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'
    ];

    var cindex = Math.round(Math.abs((d - min) / (max - min) * 7));

    return colors[cindex];
}

// // Highlight state on mouse over
// function highlightFeature(e) {
//     var layer = e.target;

//     layer.setStyle({
//         weight: 5,
//         color: '#666',
//         dashArray: '',
//         fillOpacity: 0.7
//     });

//     if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
//         layer.bringToFront();
//     }
// }

// Reset on mouseout
// function resetHighlight(e) {
//     geojson.resetStyle(e.target);
// }

// Zoom to state on click
// function zoomToFeature(e) {
//     map.fitBounds(e.target.getBounds());
//}