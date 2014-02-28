$(document).ready(function(){

    var randomColor = Math.floor(Math.random()*16777215).toString(16);
    randomColor = "#" + randomColor
    $('#controls-wrapper').css("background-color", randomColor);
    $('h1').css("color", randomColor);
});