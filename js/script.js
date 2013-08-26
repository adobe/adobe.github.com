$(function(){ 
    $(document).foundation({ activeClass: 'hover' }); 
    
    $(window).scroll(function () {
        topLogoOriginal = ( $(window).scrollTop()/3 ) - 70;
        topLogoOriginal_org = ( ( $(window).scrollTop() - $(".header_org").position().top + 350 ) / 2 ) - 10 ;
        console.info(topLogoOriginal_org);
        topText = - ( $(window).scrollTop() );
        $("#icon1").css({ top: topLogoOriginal });
        $("#icon2").css({ top: topLogoOriginal_org });
        $(".text-header").css({ top: topText });
        //topLogoPlus = - ( $(window).scrollTop() * 1.5 ) + 150;
        //$("#brackets_plus").css({ top: topLogoPlus });
    });
});

$(document).foundation();