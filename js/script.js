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
                
                
                var resLang = new Array();
                for (var j = 0; (j < scope.searchLang.length && resLang.length == 0); j++) {
                    resLang = scope.filter('filter')(actProj.languages, scope.searchLang[j]);
                }
                var resOrg = -2; //init value
                for (var k = 0; (k < scope.searchOrg.length && resOrg < 0); k++) {
                    var regOrg = new RegExp(scope.searchOrg[k], "i");
                    resOrg = actProj.org.search(regOrg);
                }
                
                if ((resLang.length || scope.searchLang.length == 0)
                && (resOrg != -1 || !scope.searchOrg)
                && filterStarBool) {
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

//Get Adobe Github repos & orgs
app.factory("ReposAdobe", function($resource) {
    return $resource("http://localhost:8000", {'8000': ':8000'});
});

//Get Feaatured for the header
app.factory("FeaturedHeader", function($resource) {
    return $resource("/offline/featured.json")
});

//TODO : Manage offline project list when errors
this.GitHubCtrl = function($scope, $filter, ReposAdobe, FeaturedHeader) {
    
    //------------------------------- Init --------------------------------
    
	//Be able to call math functions
	$scope.Math = Math;
	$scope.Object = Object;
	$scope.filter = $filter;
	$scope.filterStarIndex = 0;
	$scope.indexFeatured = {
		"org": 0,
		"projects": 0
	};
	$scope.searchLang = new Array();
	$scope.searchOrg = new Array();
	
	//Init display range
	$scope.projFirst = 0;
	$scope.projLast = 10;
	
	//Loading active
	$scope.loading = true;
    
    
    //------------------------------- Featured header --------------------------------
    
    // hFeatured on the header
    $scope.featureds = FeaturedHeader.query( function() {
		console.log("YEa");
		$scope.featureds = $scope.featureds[0];
		var keys = Object.keys($scope.featureds);
        for (var i = 0; i < keys.length; i++) {
			var actFeatured = $scope.featureds[keys[i]];
			for (var j = 0; j < actFeatured.length; j++) {
				var actFeaturedItem = actFeatured[j];
				
				actFeaturedItem.textHeader = actFeaturedItem.textHeader.join("\n");
			};
		};
    });
    
    $scope.changeIndexFeatured = function(i, delta) {
        if ($scope.indexFeatured[i] <= 0 && delta < 0) {
            $scope.indexFeatured[i] = $scope.featureds[i].length - 1;
        } else if ($scope.indexFeatured[i] >= $scope.featureds[i].length-1 && delta > 0) {
            $scope.indexFeatured[i] = 0;
        } else {
            $scope.indexFeatured[i] += delta;
        }
    }
    
    $scope.setIndexFeatured = function(i, index) {
        $scope.indexFeatured[i] = index;
    }
    
    //------------------------------- Datas --------------------------------
	
	$scope.projects = [];
	$scope.orgs = [];
	
	//Reference Orgs
	ReposAdobe.query(function(rep) { 
		console.log(rep);
		if (rep[0]) {
			$scope.projects = rep[0].repos;
			$scope.orgs = rep[0].orgs;
//			$scope.langs = rep[0].langs;
		}
		
		//Loading over
		$scope.loading = false;
		console.info($scope.projects);
	});
	
	$scope.showHideProj = function() {
		if ($scope.projLast == 10) {
			$scope.projLast = 100;
		}
		else {
			$("html, body").animate({ scrollTop: 380 }, 100);
			$scope.projLast = 10;
		}
	}
    
    //------------------------------- Filters --------------------------------
    
    $scope.majDisplayStar = function(index) { $scope.displayStarIndex = index; }
    $scope.majFilterStar = function(index) { $scope.filterStarIndex = index; }
    
    $scope.addFilter = function(filter, item) {
        var present = false;
        
        for (var i=0; i < filter.length; i++) {
            if (filter[i].name == item.name) {
                present = true;
            }
        }
        
        if (!present) {
            filter.push(item.name);
        }
        
        $scope.searchLangInput = "";
        $scope.searchOrgInput = "";
    }
    
    $scope.deleteFilter = function(array, i) {
        array.splice(i, 1);
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
        if (scrollTop < ($("#featuredProj").height() + 20) ) {
            topLogo_header = ( $(window).scrollTop()/3 ) - 70;
            $("#featuredProj .logo").css({ top: topLogo_header });
            $("#featuredProj .text-header").css({ bottom: 0 + scrollTop });
        }
        
        // ----------------------------------------------------------------------------
        //					2nd parrallax: organisations
        topLogo_org = ( ( $(window).scrollTop() - $("#featuredOrg").position().top + 350 ) / 2 ) - 10 ;
        if ( topLogo_org > 90 )
            topLogo_org = 90;
        $("#featuredOrg .logo").css({ top: topLogo_org });
        
        // ----------------------------------------------------------------------------
        //					3rd parrallax: footer
        topLogo_footer = ( scrollTop + $(window).height() - $("#footer").position().top - $("#footer").height()*2 ) - 115;
        $("#logo3").css({ bottom: topLogo_footer });
    });
});

$(document).foundation();