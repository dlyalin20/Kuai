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
    // event listeners
    $("#close_popup").click(closePopUp);
    $("#popupnext").click(popUpNext);
    popup.find(".timeinput").click(function(event){ 
        event.stopPropagation();
        event.stopImmediatePropagation();
        popup.find(".timeinput").prop("disabled", false);
        popup.find("#customtimeinput").prop("disabled", false);
        event.currentTarget.setAttribute("disabled", true);
    });
    popup.find("#customtimeinput").change(function(){
        popup.find(".timeinput").prop("disabled", false);
        popup.find("#customtimeinput").prop("disabled", false);
        this.setAttribute("disabled", true);
    });
    popup.find("#overflow_people").click(function(){
        popup.find(".people_in_front").toggle();
    })

function runAvg(){
    console.log("Recording session data");
    if(popup.find(".timeinput[disabled='true']").length == 1){
        waitTimeVal = popup.find(".timeinput[disabled='true']").val()
    }
    else if (popup.find("#customtimeinput[disabled='true']").length == 1) {
        waitTimeVal = popup.find("#customtimeinput[disabled='true']").val()
    } else {
        alert('Please select a wait time before submitting')
        return false;
    }
    console.log(waitTimeVal);
    waitTimeAvgData(waitTimeVal, targetBiz.placeID);

    return true;

}
function closePopUp(){
    startedsession = false;
    targetBiz = null;
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
            if (runAvg()){
                alert("Thank you, Bye!");
                closePopUp();
            }
                
            break;
    }
}
})
function openPopUp(name, place_id, wait_time = null){
    const popup = $("#popup");
    
    popup.find(".timeinput").prop("disabled", false);
    popup.find("#customtimeinput").prop("disabled", false);
    last = 20; // record at most 20 people on line
    console.log(targetBiz);
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
    popup.find("#popup-input").hide(); 
    popup.find(".people_in_front").show();
    popup.find("#overflow_people").prop("checked", false );

}