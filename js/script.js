/* ----------------------------------------------------------------------------
                GitHup Ctrl
---------------------------------------------------------------------------- */

//Initialisation
var app = angular.module("AdobeOpenSource", ["ngResource"])

//Get Adobe Github repos
app.factory("GitAdobe", function($resource) {
    return $resource("https://api.github.com/users/adobe/:type?sort=updated", {type: "@type"})
});

//Get Adobe Github repos
app.factory("GitRepo", function($resource) {
    return $resource("https://api.github.com/repos/adobe/:repo/:info", {owner: "@owner", languages: "@languages"})
});

//TODO : Manage offline project list when errors

this.ProjectCtrl = function($scope, GitAdobe, GitRepo) {
    //Init display range
    $scope.projFirst = 0;
    $scope.projLast = 10;
    
    //Get all projects
    $scope.projects = GitAdobe.query({ type: "repos" }, function() {
        $($scope.projects).each(function(i) {
            var actProj = $scope.projects[i];
            $scope.projects.languages = {
                $scope.projects.language: 0
            };
            
            var request = $.ajax({
                url: "https://api.github.com/repos/adobe/"+this.name+"/languages"
            });
            
            request.done( function( repLang ) {
                $scope.$apply( function () {
                    var tempProj = 
                    $scope.projects.languages = repLang;
                    console.info( $scope.projects.languages );
                });
            });
            
            //If it fails, we use the main language only
            request.fail( function ( jqXHR, textStatus ) {
                $scope.$apply( function () {
                    $scope.projects.languages = $scope.projects.language;
                });
                console.log("Language query failed for "+actProj.name+", error: "+textStatus, jqXHR);
            });
        });
    });
};

/* ----------------------------------------------------------------------------
                Parrallax Scrolling
---------------------------------------------------------------------------- */

var scrollTop, topLogo_footer, topLogo_org, topLogo_header;
$(function(){ 
    $(document).foundation();
    
    
    $(window).scroll(function () {
        scrollTop = $(window).scrollTop();
        
        //Logo animation
        var baseH = 100;
        var adobeLogoLimit = $(".header").height() - 150;
        if ( scrollTop > adobeLogoLimit ) {
            if ( (scrollTop - adobeLogoLimit) <= 50 ) {
                newHeight = baseH - (scrollTop - adobeLogoLimit)
                $(".wrapLogoTop").css({height: newHeight });
            } else {
                $(".wrapLogoTop").css({height: baseH-50 });
            };
        }
        else if (scrollTop < adobeLogoLimit) {
            $(".wrapLogoTop").css({height: baseH });
        }
        
        //First parallax: header
        if (scrollTop < ($(".header").height() + 20) ) {
            topLogo_header = ( $(window).scrollTop()/3 ) - 70;
            $("#logo1").css({ top: topLogo_header });
            $("#text-header").css({ top: - scrollTop });
        }
        
        //2nd parrallax: organisations
        topLogo_org = ( ( $(window).scrollTop() - $("#header_org").position().top + 350 ) / 2 ) - 10 ;
        if ( topLogo_org > 90 )
            topLogo_org = 90;
        $("#logo2").css({ top: topLogo_org });
        
        //3rd parrallax: footer
        topLogo_footer = ( scrollTop + $(window).height() - $("#footer").position().top - $("#footer").height()*2 ) - 65;
        $("#logo3").css({ bottom: topLogo_footer });
    });
});

$(document).foundation();