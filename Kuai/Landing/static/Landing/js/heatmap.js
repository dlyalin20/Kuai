
// set up
const GRADIENT = ["#10f75d", "#24e556", "#38d34f", "#4cc148", "#60b041", "#749e3a", "#878c34", "#9b7a2d", "#af6826", "#c3571f", "#d74518", "#eb3311", "#ff210a"];
const myheatmap = new google.maps.visualization.HeatmapLayer({
    data: [],
    radius: 30,
    dissipating: true,
    gradient: GRADIENT,
    });

/**
 * Build key explaining heatmap colors
 */
function buildKey(){
    let keyHolderWidth = 500;
    let keyHolderHeight = $("#heatKey").css("height");
    console.log(keyHolderWidth);
    let singleColorWidth = Math.ceil(keyHolderWidth / GRADIENT.length)
    $("#heatKey").html("");
    for (i in GRADIENT){
        let singleColor = $("<div></div>").css({
            "background-color": GRADIENT[i],
            "height" : keyHolderHeight,
            "width" : singleColorWidth,
        })    
        $("#heatKey").append(singleColor);    
    }
}

buildKey();
$("#heatKey").hide();
/** Create intervals to explain the heat map key
* @param {int} min min wait time
* @param {int} max max wait time
 */
function setKeyIntervals(min, max){
    let change = (max - min) / GRADIENT.length;
    $("#heatKey > div").each(function(i){
        if (i == 0){
            $(this).attr("data-content", min)
        }else{
            $(this).attr("data-content", Math.floor(change * i + min))
        }
    })
    $("#heatKey>div:last-child").attr("data-content", max);

}


/**
 * renders a heat map of wait data in the user's visible surroundings
 * @param {Business[]} bisArray https://developers.google.com/maps/documentation/javascript/reference#WeightedLocation
 */
function render_heatmap(bisArray){
    // for each waittime, collect the wait time and plot on heat map
    var max = 0;
    for (i in bisArray){
        if (max < bisArray[i].weight){
            max = bisArray[i].weight;
        }
    }
    myheatmap.setData(bisArray);
    setKeyIntervals(0 , max);
}

function initHeat(){
    $('#WaitTime').css('background-color', "aquamarine");
    $('#HeatMap').css('background-color', "mediumaquamarine");
    $('.goMap').hide();
    $("#heatKey").show();
    closePopUp();
    myheatmap.setMap(map);
    BizHolder.hideMarkers();
}
function deactivateHeat(){
    $('#HeatMap').css('background-color', "aquamarine")
    $('#WaitTime').css('background-color', "mediumaquamarine")
    $("#heatKey").hide();
    myheatmap.setMap(null);
    $('.goMap').show();
    BizHolder.showMarkers();
}
