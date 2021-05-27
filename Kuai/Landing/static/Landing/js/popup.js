var popup_step = 0;
var last; 
var changeBiz;
var timer; 
var startedsession = false; // toggle the starting number of people
var starttime; 
var startnumberofpeople; 
var per_person;
$( document ).ready(function(){
    const popup = $("#popup");

    closePopUp()
    $("#close_popup").click(closePopUp);
    $("#popupnext").click(popUpNext);
    popup.find("#overflow_people").click(function(){
        popup.find(".people_in_front").toggle();
    })

    popup.find("#number_of_people").change(function(){
        let currentPlace = $(this).val(); 
        if (currentPlace == 0){
            popUpNext(2);
        }
        popup.find('#popup_wait_time').attr('data-val', per_person * currentPlace);
        if (currentPlace && last > currentPlace){
            last = currentPlace; 
            if (!(startedsession)){
                console.log("startedsession");
                startedsession = true;
                startnumberofpeople = currentPlace;
                let d = new Date();
                starttime = d.getTime() / 1000;
            }else{
                resettimer(currentPlace, targetBiz);
            }
        }
    })

    popup.find("#overflow_people").change(function(){
        if ($(this).is(':checked')){
            if (!(startedsession)){
                console.log("startedsession");
                startedsession = true;
                startnumberofpeople = -1;
                let d = new Date();
                starttime = d.getTime() / 1000;
            }else{
                resettimer(-1, tarBiz);
            }
        }
    })

    
// send to back end to update all other people at this biz's with their wait time
function resettimer(change, tarBiz){
    if (startnumberofpeople > change){ // if there is a change in the line
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
    
}

function stoptimer(){
    clearTimeout(timer);
}
function runAvg(){
    if (startedsession){
        console.log("Recording session data");
        // send to the back end the overall wait time in seconds, and the number of peopple that person went through
        let end = new Date();
        let OverallTime = end / 1000 - starttime;
        console.log(OverallTime);
        console.log(startnumberofpeople);
        console.log(targetBiz);
        waitTimeAvgData(OverallTime, startnumberofpeople, targetBiz.placeID);
    }
}
function closePopUp(){
    startedsession = false;
    targetBiz = null;
    stoptimer();
    // const popup = $("#popup");
    popup.hide();
    popup.find("#popup-input").hide();
    
    
}



function popUpNext(event, setto=null){
    if (setto){
        popup_step = setto
    }
    else{
        popup_step++;
    }
    switch (popup_step){
        case 1: 
            popup.find("#popup-input").show();
            popup.find('#popupnext').html("Submit"); 
            break;
        default:
            //last step // leave
            alert("Thank you, Bye!");
            runAvg();
            closePopUp();
            break;
    }
}
})
function openPopUp(name, place_id, wait_time = null, per_person_wait_time = null){
    const popup = $("#popup");
    last = 20; // record at most 20 people on line
    console.log(targetBiz);
    per_person = per_person_wait_time
    popup_step = 0; 
    if (wait_time == null){
        // no wait time
        popup.find('#popup_wait_time').attr('data-val', "N/A");
    }else{
        popup.find('#popup_wait_time').attr('data-val', wait_time);
    }
    popup.find('#bis_name').attr('data-name', name);
    popup.find("#number_of_people").val('');
    popup.find('#placeID').val(place_id);
    popup.find('#popupnext').html("Enter Line");
    popup.show();

    popup.find(".people_in_front").show();
    popup.find("#overflow_people").prop("checked", false );

}