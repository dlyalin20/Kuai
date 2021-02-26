$(function(){
    $("#dropdown-menu").hide();
    $("#hamburger").on("click", function(){
        $("#dropdown-menu").slideToggle(200);
    })
})