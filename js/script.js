$(function(){ 
    $(document).foundation(); 
    
    $(window).scroll(function () {
        topLogoOriginal = ( $(window).scrollTop()/3 ) - 70;
        $("#brackets").css({ top: topLogoOriginal });
        topLogoEdge = - ( $(window).scrollTop() * 1.5 ) + 200;
        $("#brackets_edge").css({ top: topLogoEdge });
        topLogoInspect = ( $(window).scrollTop() * 1.5 ) - 70;
        $("#brackets_inspect").css({ top: topLogoInspect });
    });
});

$(document).foundation();