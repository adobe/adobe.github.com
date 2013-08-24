$(function(){ 
    $(document).foundation(); 
    
    $(window).scroll(function () {
        topLogoOriginal = ( $(window).scrollTop()/3 ) - 70;
        $("#brackets").css({ top: topLogoOriginal });
        topLogoPlus = - ( $(window).scrollTop() * 1.5 ) + 150;
        $("#brackets_plus").css({ top: topLogoPlus });
    });
});

$(document).foundation();