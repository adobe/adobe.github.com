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

app.filter('projectsFilter', function() {
    return function(projects, scope) {
        projects = scope.filter('filter')(scope.projects, scope.searchName);
        var newProject = new Array();
        
        if (scope.searchLang || scope.searchOrg || scope.filterStarIndex != 0) {
            for (var i = 0; i < projects.length; i++) {
               var actProj = projects[i];
                
                switch(scope.filterStarIndex)
                {
                case 1:
                    filterStarBool = (actProj.watchers_count > 5) ? true : false;
                    break;
                case 2:
                    filterStarBool = (actProj.watchers_count > 30) ? true : false;
                    break;
                case 3:
                    filterStarBool = (actProj.watchers_count > 100) ? true : false;
                    break;
                case 4:
                    filterStarBool = (actProj.watchers_count > 300) ? true : false;
                    break;
                case 5:
                    filterStarBool = (actProj.watchers_count > 1000) ? true : false;
                    break;
                default:
                    filterStarBool = true;
                    break;
                }
                
                var resLang = scope.filter('filter')(actProj.languages, scope.searchLang);
                var resOrg = actProj.org.search(/scope.searchOrg/i);
                
                if (resLang.length && (resOrg != -1 || !scope.searchOrg) && filterStarBool) {
                    newProject.push(actProj);
                }
            }
        } else {
            newProject = projects;
        }
        newProject = scope.filter('orderBy')(newProject,(scope.filterOrder) ? scope.filterOrder : "-watchers_count");
		return newProject.slice(0, scope.projLast);
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

//Get Adobe Github language used
app.factory("LangAdobe", function($resource) {
    return $resource("/offline/languages.json")
});

//Get Feaatured for the header
app.factory("FeaturedHeader", function($resource) {
    return $resource("/offline/featured.json")
});

//TODO : Manage offline project list when errors
this.GitHubCtrl = function($scope, $filter, ReposAdobe, OrgsAdobe, LangAdobe, FeaturedHeader) {
	//Be able to call math functions
	$scope.Math = Math;
    $scope.filter = $filter;
    $scope.filterStarIndex = 0;
    $scope.indexFeatured = 0;
	
	//Loading active
	$scope.loading = true;
    
    // hFeatured on the header
    $scope.featureds = FeaturedHeader.query( function() {
        for (var i = 0; i < $scope.featureds.length; i++) {
            var actFeatured = $scope.featureds[i];
            
            actFeatured.textHeader = actFeatured.textHeader.join("\n");
        };
        console.log($scope.featureds);
    });
    
    $scope.changeIndexFeatured = function(delta) {
        if ($scope.indexFeatured <= 0 && delta < 0) {
            $scope.indexFeatured = $scope.featureds.length - 1;
        } else if ($scope.indexFeatured >= $scope.featureds.length-1 && delta > 0) {
            $scope.indexFeatured = 0;
        } else {
            $scope.indexFeatured += delta;
        }
    }
    
    $scope.setIndexFeatured = function(index) {
        $scope.indexFeatured = index;
    }
	
	//Init display range
	$scope.projFirst = 0;
	$scope.projLast = 10;
	
	//Reference Orgs
	$scope.orgs = OrgsAdobe.query( function() { });
    
	$scope.langs = LangAdobe.query( function() { });
	
	//Reference Orgs
	$scope.projects = ReposAdobe.query(function() { 
		//Loading over
		$scope.loading = false;
		//console.info($scope.projects);
	});
	
	$scope.showHideProj = function() {
		if ($scope.projLast == 10) {
			$scope.projLast = 100;
		}
		else {
			$("html, body").animate({ scrollTop: 350 }, 100);
			$scope.projLast = 10;
		}
	}
    
    $scope.majDisplayStar = function(index) { $scope.displayStarIndex = index; }
    $scope.majFilterStar = function(index) { $scope.filterStarIndex = index; }
};

/* ----------------------------------------------------------------------------
                Offline Controller */

//Get Adobe Github repos
app.factory("GitAdobe", function($resource) {
    return $resource("https://api.github.com/users/:user/:type?sort=updated", {user: "@user", type: "@type"})
});

//TODO : Manage offline project list when errors
this.OfflineCtrl = function($scope, $filter, GitAdobe, OrgsAdobe) {	
    //Initialize the project array
    $scope.projects = new Array();
    $scope.languages = new Array();
    
	$scope.getOffline = function() {
	
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
                                    $scope.addLanguage( { name: key, value: repLang[key] } );
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
		},
        function (data, status, headers, config) {
            console.log(response);
        });
	};
    
    $scope.addLanguage = function (lang) {
        var isPresent = false;
        
        for (var i = 0; i < $scope.languages.length; i++) {
            if ($scope.languages[i].name == lang.name) {
                $scope.languages[i].value += lang.value;
                isPresent = true;
            }
        }
        
        console.log(lang, isPresent, $scope.languages);
        if (!isPresent) {
            $scope.languages.push( lang );
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
			
        // ----------------------------------------------------------------------------
        //					First parallax: header
        if (scrollTop < ($(".header").height() + 20) ) {
            topLogo_header = ( $(window).scrollTop()/3 ) - 70;
            $(".logoFeatured").css({ top: topLogo_header });
            $(".text-header").css({ bottom: 45 + scrollTop });
        }
        
        // ----------------------------------------------------------------------------
        //					2nd parrallax: organisations
        topLogo_org = ( ( $(window).scrollTop() - $("#header_org").position().top + 350 ) / 2 ) - 10 ;
        if ( topLogo_org > 90 )
            topLogo_org = 90;
        $("#logo2").css({ top: topLogo_org });
        
        // ----------------------------------------------------------------------------
        //					3rd parrallax: footer
        topLogo_footer = ( scrollTop + $(window).height() - $("#footer").position().top - $("#footer").height()*2 ) - 115;
        $("#logo3").css({ bottom: topLogo_footer });
    });
});

$(document).foundation();