/* ----------------------------------------------------------------------------
                GitHup Ctrl
---------------------------------------------------------------------------- */

//Initialisation
var app = angular.module("AdobeOpenSource", ["ngResource"])

app.filter('star', function() {
	return function(infos) {
        switch(infos.id)
        {
        case 0:
          state = (infos.value > 1) ? "on" : "off";
          break;
        case 1:
          state = (infos.value > 5) ? "on" : "off";
          break;
        case 2:
          state = (infos.value > 30) ? "on" : "off";
          break;
        case 3:
          state = (infos.value > 100) ? "on" : "off";
          break;
        case 4:
          state = (infos.value > 1000) ? "on" : "off";
          break;
        default:
          state = "off";
        }
		return state;
    };
});

app.filter('link', function() {
	return function(project) {
        return (project.homepage == "" || project.homepage == null) ? project.html_url : project.homepage;
    };
});

app.filter('niceNum', function() {
	return function (num) {
		var niceNum = "";
		var step = 1;
        
		while ( num > 1 ) {
			rest = num % 1000;
			
			//Put it in a nice string
			if ( num > 1000 ) {
				if ( rest < 10 ) {
					rest = "00" + rest;
                }
				else if ( rest < 100 ) {
					rest = "0" + rest;
                };
            };

			niceNum =  rest + "'" + niceNum;
			num = Math.floor(num / 1000);
        }
        
		return (niceNum == "") ? "0" : niceNum.substring(0, niceNum.length-1);
    }
});

app.filter('shortenStr', function() {
	return function (string) {
        maxChar = 120;
		return (string.length > maxChar ) ?  string.substring(0, maxChar)+"..." : string;
    }
});

//Get Adobe Github repos
app.factory("GitAdobe", function($resource) {
    return $resource("https://api.github.com/users/adobe/:type?sort=updated", {type: "@type"})
});

//TODO : Manage offline project list when errors
this.ProjectCtrl = function($scope, GitAdobe) {
    //Be able to call math functions
    $scope.Math = Math;
    
    //Init display range
    $scope.projFirst = 0;
    $scope.projLast = 10;
    
    //Get all projects
    $scope.projects = GitAdobe.query({ type: "repos" }, function() {
        $($scope.projects).each(function(i) {
            var actProj = $scope.projects[i];
            $scope.projects.languages = [ $scope.projects.language ];
            
            var request = $.ajax({
                url: actProj.languages_url,
                cache: true
            });
            
            request.done( function( repLang ) {
                $scope.$apply( function () {
                    actProj.languages = new Array();
                    actProj.languagesTotal = 0;
                    for (var key in repLang) {
                        actProj.languages.push( { name: key, value: repLang[key] } );
                        actProj.languagesTotal += repLang[key];
                    }
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
        
        console.info($scope.projects);
    });
    
    $scope.showHideProj = function() {
        if ($scope.projLast == 10) {
            $scope.projLast = 100
        }
        else {
            $("html, body").animate({ scrollTop: 350 }, 100);
            $scope.projLast = 10
        }
    }
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