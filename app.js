var listFlights = angular.module("listFlights", ["ngRoute"]);

listFlights
  .config([
    "$routeProvider",
    function ($routeProvider) {
      $routeProvider
        .when("/", {
          templateUrl: "searchFlights.htm",
          controller: "searchController",
        })
        .when("/viewFlights", {
          templateUrl: "viewFlights.htm",
          controller: "viewController",
        })
        .otherwise({
          redirectTo: "/",
        });
    },
  ])
  .config([
    "$httpProvider",
    function ($httpProvider) {
      $httpProvider.defaults.useXDomain = true;
      delete $httpProvider.defaults.headers.common["X-Requested-With"];
    },
  ])

  .controller("searchController", [
    "$scope",
    "$http",
    "$rootScope",
    "$location",

    function ($scope, $http, $rootScope, $location) {
      //   console.log($location);
      $rootScope.dataExists = false;
      $rootScope.output = [];
      $rootScope.inputData = {
        dot: "",
        from: "",
        to: "",
        passengers: null,
        seatType: "-1",

        search: function () {
          var input = $rootScope.inputData;
          var url = "http://localhost:1212/getflightsByDate";
          var dot_loc = "";
          if (
            input.dot == "" ||
            input.from == "" ||
            input.to == "" ||
            input.passengers == null ||
            input.seatType == "-1"
          ) {
            return;
          }
          dot_loc =
            dot_loc +
            input.dot.getDate().toString() +
            "." +
            (input.dot.getMonth() + 1).toString() +
            "." +
            input.dot.getFullYear().toString();
          console.log(input.dot);
          console.log(dot_loc);
          //   console.log($http);
          $http
            .get(url, {
              params: {
                dot: dot_loc,
                from: input.from,
                to: input.to,
              },
            })
            .then(function (response) {
              console.log(response.data);
              $rootScope.output = response.data;
              if (response.data.length != 0) {
                $rootScope.dataExists = true;
                console.log("Variable set");

                // console.log($location);
                $location.path("viewFlights");
                console.log("Data set");
              } else {
                alert("No Flights Found :(");
              }
            });
        },
      };
    },
  ])
  .controller("viewController", [
    "$rootScope",
    "$scope",

    function ($rootScope, $scope) {
      console.log($rootScope.inputData);
      console.log($rootScope.output);
      $scope.dataExists = $rootScope.dataExists;
      $scope.output = $rootScope.output;
      $scope.cost =
        (1000 * Number($rootScope.inputData.seatType) + 2500) *
        $rootScope.inputData.passengers; // change 2500 to base cost which will be added to the table
    },
  ]);
