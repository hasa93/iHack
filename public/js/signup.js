var app = angular.module('CobWebApp', ['ngDialog']);

app.controller('LoginCtrl', ['$scope', '$http', 'ngDialog', function($scope, $http, ngDialog) {
  console.log("login ctrl fired");

  $scope.signup = function(user) {

    var userData = {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: user.password
    };

    if ($scope.signupForm.$valid) {
      $http.post('/anon/signup', userData).
      then(function(response) {
        console.log(response);
        ngDialog.open({ template: '<p> An activation link has been sent. Please check your email and verify in order to activate. </p> <button ng-click="closeThisDialog()" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Ok</button>', className: 'ngdialog-theme-default', scope: $scope, plain: true});
      });
    }
  }
}]);

app.directive('compareTo', [function () {
  return {
    require: "ngModel",
    scope: {
        otherModelValue: "=compareTo"
    },
    link: function(scope, element, attributes, ngModel) {

        ngModel.$validators.compareTo = function(modelValue) {
            return modelValue == scope.otherModelValue;
        };

        scope.$watch("otherModelValue", function() {
            ngModel.$validate();
        });
    }
  };
}]);

