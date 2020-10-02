if (/MSIE [5-9]/.test(navigator.userAgent)) {
  document.getElementById("old").style.display = "block";
  document.getElementById("supported").style.display = "none";
} else {
  /* ----------------------------------------------------------------------------
                GitHup Ctrl
---------------------------------------------------------------------------- */

  //Initialisation
  var app = angular.module("AdobeOpenSource", ["ngResource"]);

  /* ----------------------------------------------------------------------------
                Main Controller */

  //Get Adobe Github repos & orgs
  app.factory("DatasAdobe", function ($resource) {
    return $resource("//opensource-adobe-server.herokuapp.com");
  });

  //Offline backup of json
  app.factory("DatasAdobeOffline", function ($resource) {
    return $resource("data/server.json");
  });

  //Get Feaatured for the header
  app.factory("FeaturedHeader", function ($resource) {
    return $resource("data/featured.json");
  });

  //TODO : Manage offline project list when errors
  this.GitHubCtrl = function (
    $scope,
    $sce,
    $filter,
    DatasAdobe,
    DatasAdobeOffline,
    FeaturedHeader
  ) {
    //------------------------------- Init --------------------------------

    //Be able to call math functions
    $scope.Math = Math;
    $scope.Object = Object;
    $scope.filter = $filter;
    $scope.filterStarIndex = 0;
    $scope.indexFeatured = {
      orgs: 0,
      projects: 0,
    };
    $scope.searchLang = [];
    $scope.searchOrg = [];

    //Init display range
    $scope.projFirst = 0;
    $scope.projLast = 10;

    //Loading active
    $scope.loading = true;

    //------------------------------- Featured header --------------------------------

    // hFeatured on the header
    $scope.featureds = FeaturedHeader.query(function () {
      $scope.featureds = $scope.featureds[0];
      var keys = Object.keys($scope.featureds);
      for (var i = 0; i < keys.length; i++) {
        var actFeatured = $scope.featureds[keys[i]];
        for (var j = 0; j < actFeatured.length; j++) {
          var actFeaturedItem = actFeatured[j];

          actFeaturedItem.textHeader = $sce.trustAsHtml(
            actFeaturedItem.textHeader.join("\n")
          );
        }
      }
    });

    $scope.changeIndexFeatured = function (i, delta) {
      if ($scope.indexFeatured[i] <= 0 && delta < 0) {
        $scope.indexFeatured[i] = $scope.featureds[i].length - 1;
      } else if (
        $scope.indexFeatured[i] >= $scope.featureds[i].length - 1 &&
        delta > 0
      ) {
        $scope.indexFeatured[i] = 0;
      } else {
        $scope.indexFeatured[i] += delta;
      }
    };

    $scope.setIndexFeatured = function (i, index) {
      $scope.indexFeatured[i] = index;
    };

    //------------------------------- Datas --------------------------------

    $scope.projects = [];
    $scope.orgs = [];

    /*
    DatasAdobe.query(function(rep) {
        if (rep[0]) {
            $scope.updateData(rep[0]);
        } else {
            console.error("ERROR: The data recieved from the server seems to be corrupted.");
            $scope.loadOffline();
        }
    }, function(error) {
        console.error("ERROR: Server error.\n", error);
        $scope.loadOffline();
    });
    */

    // $scope.loadOffline = function() {
    //TODO: display message in front

    DatasAdobeOffline.query(
      function (rep) {
        if (rep[0]) {
          $scope.updateData(rep[0]);
        } else {
          console.error("ERROR: All the datas seems corrupted. Please reload.");
        }
      },
      function (error) {
        console.error("ERROR: Impossible to load the data. Please reload.");
      }
    );
    // };

    $scope.updateData = function (data) {
      $scope.projects = data.repos;
      $scope.orgs = data.orgs;
      $scope.langs = data.langs;
      $scope.stats = data.stats;

      $("#searchLang").autocomplete({
        source: $scope.objToNamedArray($scope.langs),
        select: function (e, q) {
          $scope.$apply(function () {
            $("#searchLang").val("Loading...");
            $scope.addFilter($scope.searchLang, q.item.value);
            $scope.searchLangInput = "";
          });
          return false;
        },
      });

      $("#searchOrg").autocomplete({
        source: $scope.objToNamedArray($scope.orgs),
        select: function (e, q) {
          $scope.$apply(function () {
            $("#searchOrg").val("Loading...");
            $scope.addFilter($scope.searchOrg, q.item.value);
            $scope.searchOrgInput = "";
          });
          return false;
        },
      });

      $scope.updateGraph();

      //Loading over
      $scope.loading = false;
    };

    $scope.updateGraph = function () {
      // Filtering langs for only major ones
      var majorLangs = $scope.filter("majorLangs")(
        $scope.langs,
        $scope.stats.bitesLangCode
      );

      //Initiate graphs
      //        var langChart = dc.pieChart("#langChart");
      var langChart = dc.rowChart("#langChart");
      //Import data in crossfilter
      var langsData = crossfilter(majorLangs);
      var langsDim = langsData.dimension(function (d) {
        return d.name;
      });
      var langsGroup = langsDim
        .group()
        .reduceSum(function (d) {
          return d.value;
        })
        .order(function (d) {
          return d.value;
        });
      langChart
        .width(190)
        .height(180)
        .dimension(langsDim)
        .group(langsGroup)
        .margins({ top: 0, left: 0, right: 0, bottom: 20 })
        .title(function (d) {
          return (
            d.key +
            " (" +
            Math.round((d.value / $scope.stats.bitesLangCode) * 100) +
            "%)"
          );
        })
        .label(function (d) {
          return d.key;
        })
        .renderLabel(true)
        .colors(d3.scale.category20());
      dc.renderAll();
    };

    $scope.showHideProj = function () {
      if ($scope.projLast === 10) {
        $scope.projLast = 1000;
        showMore = true;
        $(".buttonMore").css({ position: "fixed", bottom: 0 });
      } else {
        $("html, body").animate({ scrollTop: 380 }, 100);
        $scope.projLast = 10;
        showMore = false;
      }
    };

    $scope.objToNamedArray = function (objs) {
      var namedArray = [];
      for (var i = 0; i < objs.length; i++) {
        namedArray.push(objs[i].name);
      }
      return namedArray;
    };

    //------------------------------- Filters --------------------------------

    $scope.majDisplayStar = function (index) {
      $scope.displayStarIndex = index;
    };
    $scope.majFilterStar = function (index) {
      $scope.filterStarIndex = index;
    };

    $scope.addFilter = function (filter, item) {
      var present = false;

      for (var i = 0; i < filter.length; i++) {
        if (filter[i] == item) {
          present = true;
        }
      }

      if (!present) {
        filter.push(item);
      }
    };

    $scope.deleteFilter = function (array, i) {
      array.splice(i, 1);
    };

    $scope.closeHelp = function () {
      $scope.helped = true;
    };

    $scope.toggleFiltersButton = function () {
      $scope.closeHelp();
      $scope.toggleFilters = !$scope.toggleFilters;
    };

    //--------------------------- Mobile & Parrallax -----------------------------

    $scope.mobile = isMobile(
      navigator.userAgent || navigator.vendor || window.opera
    );
    $scope.menuOpen = false;

    if ($scope.mobile) {
      $(window).off("scroll", scrollUpdate);
      $(".header_inline").addClass("mobile");
    } else {
      $(window).on("scroll", scrollUpdate);
    }

    $(document).foundation();

    $scope.expandMenu = function () {
      $scope.menuOpen = !$scope.menuOpen;
    };
  };

  $(document).foundation();

  /* ----------------------------------------------------------------------------
                Scrolling
---------------------------------------------------------------------------- */

  //Getting the header item list, and the anchors associated (have to be in the same order in the DOM)
  var bases = $(".head-base");
  var anchors = $(".head-anchor");
  var active_index = 0;
  //Making the first item active
  bases.eq(active_index).addClass("active");

  var showMore = false;
  var scrollUpdate = function () {
    var scrollTop = $(window).scrollTop();

    var index = 0;
    //Looping over the differents anchors
    while (index + 1 !== anchors.length) {
      //If the top position of the anchor has been reached ...
      if (scrollTop + 1 > anchors.eq(index + 1).offset().top) {
        index++;
      } else {
        break; //... if not, we're good to go
      }
    }
    if (active_index !== index) {
      bases.eq(active_index).removeClass("active");
      bases.eq(index).addClass("active");
      active_index = index;
    }

    // ----------------------------------------------------------------------------
    //					First parallax: header
    if (scrollTop < $("#featuredProj").height() + 100) {
      var topLogo_header = $(window).scrollTop() * 1.5 - 180;
      $("#featuredProj .logo").css({ top: topLogo_header });
    }

    // ----------------------------------------------------------------------------
    //					2nd parrallax: organisations
    var topLogo_org =
      ($(window).scrollTop() - $("#featuredOrg").position().top + 350) / 2 - 10;
    if (topLogo_org > 90) topLogo_org = 90;
    $("#featuredOrg .logo").css({ top: topLogo_org });

    // ----------------------------------------------------------------------------
    //					3rd parrallax: footer
    var bottomScreen = scrollTop + $(window).height();
    var footerBottom = $("#footer").position().top + $("#footer").height();
    var topLogo_footer = Math.round(
      bottomScreen - footerBottom - $(".menu").height()
    );
    $("#logo3").css({ bottom: topLogo_footer });

    // ----------------------------------------------------------------------------
    //					Show More/Less button
    if (!showMore) {
      $(".buttonMore").css({ position: "absolute", bottom: -50 });
    } else {
      var bottomScreen = scrollTop + $(window).height();

      if (bottomScreen > $("#featuredOrg").offset().top + 25) {
        $(".buttonLess").css({ position: "absolute", bottom: -50 });
      } else {
        $(".buttonLess").css({ position: "fixed", bottom: 0 });
      }
    }
  };

  /* ----------------------------------------------------------------------------
                Mobile Detection
---------------------------------------------------------------------------- */

  var isMobile = function (a) {
    var test1 = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
      a
    );
    var test2 = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      a.substr(0, 4)
    );
    if (test1 || test2) {
      return true;
    } else {
      return false;
    }
  };

  /* ----------------------------------------------------------------------------
                Modules */

  app.directive("loading", function () {
    return {
      restrict: "E",
      templateUrl: "views/loading.html",
    };
  });

  app.directive("stats", function () {
    return {
      restrict: "E",
      scope: {
        projects: "=",
        orgs: "=",
        langs: "=",
        stats: "=",
      },
      templateUrl: "views/stats.html",
      replace: true,
    };
  });

  app.directive("project", function () {
    return {
      restrict: "E",
      scope: {
        project: "=",
      },
      templateUrl: "views/project.html",
      replace: true,
      link: function (scope) {
        scope.Math = Math;
      },
    };
  });

  app.directive("org", function () {
    return {
      restrict: "E",
      scope: {
        org: "=",
      },
      templateUrl: "views/org.html",
      replace: true,
      link: function (scope) {
        scope.Math = Math;
      },
    };
  });

  /* ----------------------------------------------------------------------------
                Filters */
  app.filter("star", function () {
    return function (infos) {
      switch (infos.id) {
        case 0:
          state = infos.value > 5 ? "on" : "off";
          break;
        case 1:
          state = infos.value > 30 ? "on" : "off";
          break;
        case 2:
          state = infos.value > 100 ? "on" : "off";
          break;
        case 3:
          state = infos.value > 500 ? "on" : "off";
          break;
        case 4:
          state = infos.value > 1000 ? "on" : "off";
          break;
        default:
          state = "off";
      }
      return state;
    };
  });

  app.filter("projectsFilter", function () {
    return function (projects, scope) {
      projects = scope.filter("filter")(scope.projects, scope.searchName);
      var newProject = [];

      if (scope.searchLang || scope.searchOrg || scope.filterStarIndex !== 0) {
        for (var i = 0; i < projects.length; i++) {
          var actProj = projects[i];

          switch (scope.filterStarIndex) {
            case 1:
              filterStarBool = actProj.watchers_count > 5 ? true : false;
              break;
            case 2:
              filterStarBool = actProj.watchers_count > 30 ? true : false;
              break;
            case 3:
              filterStarBool = actProj.watchers_count > 100 ? true : false;
              break;
            case 4:
              filterStarBool = actProj.watchers_count > 300 ? true : false;
              break;
            case 5:
              filterStarBool = actProj.watchers_count > 1000 ? true : false;
              break;
            default:
              filterStarBool = true;
              break;
          }

          var resLang = [];
          for (
            var j = 0;
            j < scope.searchLang.length && resLang.length === 0;
            j++
          ) {
            resLang = scope.filter("filter")(
              actProj.languages,
              scope.searchLang[j]
            );
          }
          var resOrg = -2; //init value
          for (var k = 0; k < scope.searchOrg.length && resOrg < 0; k++) {
            var regOrg = new RegExp(scope.searchOrg[k], "i");
            resOrg = actProj.org.search(regOrg);
          }

          if (
            (resLang.length || scope.searchLang.length === 0) &&
            (resOrg !== -1 || !scope.searchOrg) &&
            filterStarBool
          ) {
            newProject.push(actProj);
          }
        }
      } else {
        newProject = projects;
      }
      newProject = scope.filter("orderBy")(
        newProject,
        scope.filterOrder ? scope.filterOrder : "-watchers_count"
      );

      return newProject.slice(0, scope.projLast);
      //        return projects.slice(0, scope.projLast);
    };
  });

  app.filter("majorLangs", function () {
    return function (langs, max) {
      var majorLangs = [];
      var other = {
        name: "Others",
        value: 0,
      };

      for (var i = 0; i < langs.length; i++) {
        var lang = langs[i];

        if (lang.value / max > 0.07) {
          majorLangs.push(lang);
        } else {
          other.value += lang.value;
        }
      }
      majorLangs.sort(function (a, b) {
        return a.value - b.value;
      });
      majorLangs.push(other);

      return majorLangs;
    };
  });

  app.filter("linkProject", function () {
    return function (project) {
      if (project.homepage === "" || project.homepage == null) {
        return project.html_url;
      } else {
        return project.homepage.substring(0, 4) !== "http"
          ? "http://" + project.homepage
          : project.homepage;
      }
    };
  });

  app.filter("linkOrg", function () {
    return function (org) {
      if (org.userName) {
        return "https://github.com/" + org.userName;
      } else {
        return "#";
      }
    };
  });

  app.filter("niceNum", function () {
    return function (num) {
      var niceNum = "";
      var step = 1;

      while (num >= 1) {
        rest = num % 1000;

        //Put it in a nice string
        if (num > 1000) {
          if (rest < 10) {
            rest = "00" + rest;
          } else if (rest < 100) {
            rest = "0" + rest;
          }
        }

        niceNum = rest + "'" + niceNum;
        num = Math.floor(num / 1000);
      }

      return niceNum === "" ? "0" : niceNum.substring(0, niceNum.length - 1);
    };
  });

  app.filter("unitNum", function () {
    return function (num) {
      if (num > 1000000000) {
        return Math.round(num / 10000000) / 100 + " tera";
      } else if (num > 1000000) {
        return Math.round(num / 10000) / 100 + " giga";
      } else if (num > 1000) {
        return Math.round(num / 10) / 100 + " mega";
      } else if (num > 0) {
        return "kilo";
      } else {
        return "";
      }
    };
  });

  app.filter("shortenStr", function () {
    return function (string) {
      maxChar = 120;
      return string.length > maxChar
        ? string.substring(0, maxChar) + "..."
        : string;
    };
  });

  app.filter("timeDiff", function () {
    return function (timeRaw) {
      var now = new Date();
      var time = new Date(timeRaw);
      var diff = now - time;

      var days = Math.floor(diff / 1000 / 60 / (60 * 24));

      var date_diff = new Date(diff);
      var sDate = "";
      if (days !== 0) {
        //Count and display nb years
        var years = Math.floor(days / 365);
        if (years !== 0) {
          sDate += years + " year";
          sDate += years > 1 ? "s " : " ";
          //Reduce it to the number of days not counted
          days = days % 365;
        }

        var months = Math.floor(days / 30);
        if (months !== 0) {
          sDate += months + " month";
          sDate += months > 1 ? "s " : " ";
        } else if (years === 0) {
          sDate += days + " d " + date_diff.getHours() + " h";
        }
      } else {
        sDate += date_diff.getHours() + " h " + date_diff.getMinutes() + " min";
      }

      return sDate;
    };
  });
}
