/* ----------------------------------------------------------------------------
                GitHup Ctrl
---------------------------------------------------------------------------- */

//Initialisation
var app = angular.module("AdobeOpenSource", ["ngResource"]);


/* ----------------------------------------------------------------------------
                Filters */
app.filter('star', function() {
	return function(infos) {
        switch(infos.id)
        {
        case 0:
          state = (infos.value > 5) ? "on" : "off";
          break;
        case 1:
          state = (infos.value > 30) ? "on" : "off";
          break;
        case 2:
          state = (infos.value > 100) ? "on" : "off";
          break;
        case 3:
          state = (infos.value > 500) ? "on" : "off";
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

app.filter('timeDiff', function() {
	return function (timeRaw) {
    var now = new Date();
    var time = new Date( timeRaw );
		var diff = now - time;
		
		var days = Math.floor(diff / 1000 / 60 / (60 * 24));

    var date_diff = new Date( diff );
		
		var sDate = "";
    if (days != 0) {
			//Count and display nb years
			var years = Math.floor( days / 365 );
			if (years != 0) {
				sDate += years + " year";
				sDate += (years > 1) ? "s " : " ";
				//Reduce it to the number of days not counted
				days = days % 365;
			}
			
			var months = Math.floor( days / 30 );
			if (months != 0 ) {
				sDate += months + " month";
				sDate += (months > 1) ? "s " : " ";
			}
			else if (years == 0) {
				sDate += days + " d "+ date_diff.getHours() + " h";
			}
		}
		else {
			sDate += date_diff.getHours() + " h " + date_diff.getMinutes() + " min";
		}
		
		return sDate;
  }
});

/* ----------------------------------------------------------------------------
                Main Controller */

//Get Adobe Github orgs
app.factory("OrgsAdobe", function($resource) {
    return $resource("/offline/orgs.json")
});

//Get Adobe Github orgs
app.factory("ReposAdobe", function($resource) {
    return $resource("/offline/repos.json")
});

//TODO : Manage offline project list when errors
this.GitHubCtrl = function($scope, $filter, ReposAdobe, OrgsAdobe) {
	//Be able to call math functions
	$scope.Math = Math;
	
	//Loading active
	$scope.loading = true;
	
	//Init display range
	$scope.projFirst = 0;
	$scope.projLast = 10;
	
	//Reference Orgs
	$scope.orgs = OrgsAdobe.query( function() { });
	
	//Reference Orgs
	$scope.projects = ReposAdobe.query(function() { 
		//Loading over
		$scope.loading = false;
		console.info($scope.projects);
	});
	
	$scope.showHideProj = function() {
		if ($scope.projLast == 10) {
			$scope.projLast = 100;
		}
		else {
			$("html, body").animate({ scrollTop: 350 }, 100);
			$scope.projLast = 10
		}
	}
};

/* ----------------------------------------------------------------------------
                Offline Controller */

//Get Adobe Github repos
app.factory("GitAdobe", function($resource) {
    return $resource("https://api.github.com/users/:user/:type?sort=updated", {user: "@user", type: "@type"})
});

//TODO : Manage offline project list when errors
this.OfflineCtrl = function($scope, $filter, GitAdobe, OrgsAdobe) {	
	$scope.getOffline = function() {
		//Initialize the project array
		$scope.projects = new Array();
	
		//Loading active
		$scope.loading = true;
		
		//Reference Orgs
		$scope.orgs = OrgsAdobe.query(function() {
			//To detect when all orgs has been processed
			var recievedOrgProj = 0;
			
			//Get all projects from each org
			$($scope.orgs).each(function (i) {
				
				GitAdobe.query({ user: $scope.orgs[i].userName, type: "repos" }, function(tempProjects) {
					recievedOrgProj++;
					
					$scope.tempProjects = tempProjects;
					
					$(tempProjects).each(function(iProj) {
						//And push it to the list
						$scope.projects.push({
							name: tempProjects[iProj].name
							, watchers_count: tempProjects[iProj].watchers_count
							, org: $scope.orgs[i].name
							, languages: [ tempProjects[iProj].language ]
							, description: tempProjects[iProj].description
							, pushed_at: tempProjects[iProj].pushed_at
							, html_url: tempProjects[iProj].html_url
							, homepage: tempProjects[iProj].homepage
						});
						
						//Then query for more languages
						var actProj = $scope.projects[$scope.projects.length-1];
						
						var request = $.ajax({
							url: tempProjects[iProj].languages_url,
							cache: true
						});
						
						request.done( function( repLang ) {
							$scope.$apply( function () {
								actProj.languages = new Array();
								actProj.languagesTotal = 0;
								for (var key in repLang) {
									actProj.languages.push( { name: key, value: repLang[key] } );
									actProj.languagesTotal += repLang[key];
								};
							});
						});
						
						//If it fails, we use the main language only
						request.fail( function ( jqXHR, textStatus ) {
							console.log("Language query failed for "+actProj.name+", error: "+textStatus, jqXHR);
						});
					});
					
					if (recievedOrgProj == $scope.orgs.length) {
						$scope.projects = $filter('orderBy')($scope.projects, '-watchers_count');
						
						//Everything loaded!
						$scope.loading = false;
						//console.info($scope.projects);
					}
				});
				
			});
		});
	}
};


/* ----------------------------------------------------------------------------
                Parrallax Scrolling
---------------------------------------------------------------------------- */

var scrollTop, topLogo_footer, topLogo_org, topLogo_header;
$(function(){ 
    $(document).foundation();
    $(document).foundation('orbit', {
      animation: 'fade',
      timer_speed: 10000,
      pause_on_hover: true,
      resume_on_mouseout: false,
      animation_speed: 500,
      stack_on_small: true,
      navigation_arrows: false,
      slide_number: false,
      container_class: 'orbit-container',
      stack_on_small_class: 'orbit-stack-on-small',
      next_class: 'orbit-next',
      prev_class: 'orbit-prev',
      timer_container_class: 'orbit-timer',
      timer_paused_class: 'paused',
      timer_progress_class: 'orbit-progress',
      slides_container_class: 'orbit-slides-container',
      bullets_container_class: 'orbit-bullets',
      bullets_active_class: 'active',
      slide_number_class: 'orbit-slide-number',
      caption_class: 'orbit-caption',
      active_slide_class: 'active',
      orbit_transition_class: 'orbit-transitioning',
      bullets: true,
      timer: false,
      variable_height: false,
      before_slide_change: function(){},
      after_slide_change: function(){}
    });
        
    
    $(window).scroll(function () {
        scrollTop = $(window).scrollTop();
			
        /* / ----------------------------------------------------------------------------
        //						Logo animation
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
        }*/
        
        // ----------------------------------------------------------------------------
        //					First parallax: header
        if (scrollTop < ($(".header").height() + 20) ) {
            topLogo_header = ( $(window).scrollTop()/3 ) - 70;
            $("#logo1").css({ top: topLogo_header });
            $("#text-header").css({ top: - scrollTop });
        }
        
        // ----------------------------------------------------------------------------
        //					2nd parrallax: organisations
        topLogo_org = ( ( $(window).scrollTop() - $("#header_org").position().top + 350 ) / 2 ) - 10 ;
        if ( topLogo_org > 90 )
            topLogo_org = 90;
        $("#logo2").css({ top: topLogo_org });
        
        // ----------------------------------------------------------------------------
        //					3rd parrallax: footer
        topLogo_footer = ( scrollTop + $(window).height() - $("#footer").position().top - $("#footer").height()*2 ) - 65;
        $("#logo3").css({ bottom: topLogo_footer });
    });
});

$(document).foundation();