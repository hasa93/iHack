var app = angular.module('CrewApp', ['ngRoute', 'angularMoment', 'ngDialog']);

app.config(function($routeProvider, $locationProvider) {
  // $locationProvider.html5Mode(true);

  $routeProvider
  .when('/groups', {
    templateUrl: 'newsfeed.html',
    controller: 'GroupCtrl'
  })
  .when('/group/:id', {
    templateUrl: 'user.html',
    controller: 'CardsCtrl'
  })
  .when('/notifications', {
    templateUrl: 'notifications.html',
    controller: 'NotificationCtrl'
  })
  .otherwise({
    templateUrl: 'views/404',
    controller: 'MetaCtrl'
  });
});

app.controller('GroupCtrl', ['$scope', '$http', '$rootScope', 'ngDialog', function($scope, $http, $rootScope, ngDialog) {
  console.log("Group ctrller fired");
  var groupCounter = 0;

  $scope.groupLst = [];

  function loadGroup(){
    $rootScope.dataLoaded = false;
    $http.get('/api/group/list').success(function(data) {
      data.forEach(function(group){
        $scope.groupLst.push(group);
        console.log(group);
      });
      $rootScope.dataLoaded = true;
    });
  }

  $scope.postGroup = function(gname){
    $http.post('/api/group/create', {name: gname});
    $scope.groupLst.push({name: gname, _id: cardCounter});
    groupCounter++;
    $rootScope.dataLoaded = true;
  };

  $scope.createGroup = function () {
    ngDialog.open({ template: 'createGroup.html', className: 'ngdialog-theme-default', scope: $scope});
  };

  $scope.removeTask = function(id){
    console.log(id);
    $http.get('/api/group/'+ id +'/delete').success(function(data) {});
    _.remove($scope.groupLst, function(request){
      return request._id == id;
    });
  }

  loadGroup();
}]);

app.controller('LayoutCtrl', ['$rootScope', '$scope', '$http', '$location', '$window', '$filter', function($rootScope, $scope, $http, $location, $window, $filter) {
  console.log("layout ctrller fired");
  var baseLen = $location.absUrl().length - $location.url().length - 'web/home.html#'.length;
  var rediretUrl = $location.absUrl().slice(0, baseLen);
  $scope.logout = function(){
    console.log("logging out", rediretUrl);
    $http.get('/api/logout').then(function(){
      $window.location.href=rediretUrl;
    });
  }

}]);

app.controller('CardsCtrl', ['$scope', '$http', '$routeParams', '$rootScope', 'ngDialog', '$routeParams', function($scope, $http, $routeParams, $rootScope, ngDialog, $routeParams) {

  console.log("In cards controller", $routeParams.id);
  $rootScope.dataLoaded = true;

  $scope.taskLst = [];
  var cardCounter = 0;

  function sendMessage()
  {
    var socket = io();

    $('form').submit(function(){
      socket.emit('chat msg', $('#m').val());
      $('#m').val('');
      return false;
    });

    socket.on('chat msg', function(msg){
      $('#messages').append($('<li>').text(msg));
    });
  }

  $scope.postTask = function(name){
    $http.post('/api/task/create', {task: name, group: $routeParams.id});
    $scope.taskLst.push({task: name, _id: cardCounter});
    cardCounter++;
    $rootScope.dataLoaded = true;
  };

  $scope.createTask = function () {
    ngDialog.open({ template: 'createItem.html', className: 'ngdialog-theme-default', scope: $scope});
  };

  $scope.removeTask = function(id){
    console.log(id);
    $http.get('/api/task/'+ id +'/delete').success(function(data) {});
    _.remove($scope.taskLst, function(request){
      return request._id == id;
    });
  }

  function getTasks(id){
    $http.get('/api/group/' + id + '/tasks').success(function(data) {
      data.forEach(function(task){
        $scope.taskLst.push(task);
      });
      console.log($scope.taskLst);
    });
  }

  getTasks($routeParams.id);
  sendMessage();
  
}]);

app.controller('NotificationCtrl', ['$rootScope', '$scope', '$http', 'ngDialog', function($rootScope, $scope, $http, ngDialog) {
  console.log("Notifications ctrller fired");

  $scope.notificationCount = 0;


}]);

