
const myheatmap = new google.maps.visualization.HeatmapLayer({
    data: [],
    });
    
/**
 * renders a heat map of wait data in the user's visible surroundings
 * @param {Business[]} bisArray https://developers.google.com/maps/documentation/javascript/reference#WeightedLocation
 */
function render_heatmap(bisArray){
    // for each waittime, collect the wait time and plot on heat map
    for (i in bisArray){
        bisArray[i]
    }
}

function initHeat(){
    myheatmap.setMap(map);
}
function deactivateHeat(){
    myheatmap.setMap(null);
}