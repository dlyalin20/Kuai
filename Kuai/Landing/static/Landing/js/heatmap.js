
const myheatmap = new google.maps.visualization.HeatmapLayer({
    data: [],
    radius: 30,
    });

/**
 * renders a heat map of wait data in the user's visible surroundings
 * @param {Business[]} bisArray https://developers.google.com/maps/documentation/javascript/reference#WeightedLocation
 */
function render_heatmap(bisArray){
    // for each waittime, collect the wait time and plot on heat map
    myheatmap.setData(bisArray);
}

function initHeat(){
    myheatmap.setMap(map);
}
function deactivateHeat(){
    myheatmap.setMap(null);
}
