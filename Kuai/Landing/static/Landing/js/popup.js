var popup_step = 0;
var start; 
var change; 
var changeBiz;
var timer; 
var d = new Date();
var startedsession = false; // toggle the starting number of people
var start;
var startnumberofpeople; 

$( document ).ready(function(){
    closePopUp()
    $("#close_popup").click(closePopUp);
    $("#popupnext").click(popUpNext);
    const popup = $("#popup");
    popup.find("#overflow_people").click(function(){
        popup.find(".people_in_front").toggle();
    })

    popup.find("#number_of_people").change(function(){
        if (startedsession == false){
            startedsession == true;
            startnumberofpeople = $(this).val();
            start = d.getTime();
        }
        resettimer($(this).val(), targetBiz);
    })

    popup.find("#overflow_people").change(function(){
        if (startedsession == false){
            startedsession == true;
            startnumberofpeople = -1;
            start = 0; 
        }
        change = -1;
        resettimer();
    })
})

function resettimer(change, tarBiz){
    console.log("started count down");
    console.log(change);
    console.log(tarBiz);
    stoptimer();
    timer = setTimeout(
        function() {
          //send updated wait time after 10 seconds
          if (targetBiz == tarBiz){
              //if the user hasnt clicked off then go
            console.log(change);
            console.log(tarBiz);
            }
        }, 5000);
}

function stoptimer(){
    clearTimeout(timer);
}
function runAvg(){
    if (startedsession){
        // send to the back end the overall wait time in seconds, and the number of peopple that person went through
        let OverallTime = starttime - d.getTime();
        console.log(OverallTime);
        console.log(startnumberofpeople);
        console.log(targetBiz);
        waitTimeAvgData(OverallTime, startnumberofpeople, targetBiz.place_id);
    }
}
function closePopUp(){
    startedsession = false;
    stoptimer();
    const popup = $("#popup");
    popup.hide();
    popup.find("#popup-input").hide();
    targetBiz = null;
    runAvg();
}

function openPopUp(name, place_id, wait_time = null, per_person_wait_time = null){
    console.log(targetBiz);
    const popup = $("#popup");
    popup_step = 0; 
    if (wait_time == null){
        // no wait time
        popup.find('#popup_wait_time').attr('data-val', "N/A");
    }else{
        popup.find('#popup_wait_time').attr('data-val', wait_time);
    }
    popup.find('#bis_name').attr('data-name', name);
    
    popup.find('#placeID').val(place_id);
    popup.find('#popupnext').html("Enter Line");
    popup.show();

    popup.find(".people_in_front").show();
    popup.find("#overflow_people").prop("checked", false );
    // user's entering the line time
    start = d.getTime();

}

function popUpNext(){
    const popup = $("#popup");
    popup_step++;
    switch (popup_step){
        case 1: 
            popup.find("#popup-input").show();
            popup.find('#popupnext').html("Exit Line"); 
            break;
        default:
            //last step // leave
            alert("Thank you, Bye!");
            closePopUp();
            break;
    }
}