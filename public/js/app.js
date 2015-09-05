var app = angular.module('CobWebApp', ['ngRoute', 'angularMoment', 'ngDialog']);

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

  $scope.groupLst = [];

  function loadGroup(){
    $rootScope.dataLoaded = false;
    $http.get('/api/group/list').success(function(data) {
      data.forEach(function(group){
        $scope.groupLst.push(group);
      });
      $rootScope.dataLoaded = true;
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

  /*
  Search
  */

  function loadUserList(cb) {
    $http.get('/api/user/search').success(function(userlst) {
      $scope.items = userlst;
      cb();
    });
  }

  loadUserList(afterload);

  function afterload(){
    var opened = 'opened';
    var closed = 'closed';

    $scope.selected = '';
    $scope.created = false;
    $scope.state = closed;
    $scope.change = function () {
      var filtered;
      filtered = $filter('filter')($scope.items, $scope.query);
      return $scope.state = filtered.length > 0 ? opened : 'closed';
    };
  }

  $scope.gotoProfile = function(id){
    console.log(id);
    $location.url('/user/' + id);
  }

}]);

app.controller('CardsCtrl', ['$scope', '$http', '$routeParams', '$rootScope', 'ngDialog', '$routeParams', function($scope, $http, $routeParams, $rootScope, ngDialog, $routeParams) {

  console.log("In cards controller", $routeParams.id);
  $rootScope.dataLoaded = true;

  $scope.taskLst = [];
  var cardCounter = 0;

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


}]);

app.controller('NotificationCtrl', ['$rootScope', '$scope', '$http', 'ngDialog', function($rootScope, $scope, $http, ngDialog) {
  console.log("Notifications ctrller fired");

  $scope.devices = [];
  $scope.sensors = [];
  $scope.friendRequests = [];

  function loadFriendRequests(){
    $http.get('/api/friends/manage/').success(function(data) {
      $scope.friendRequests = data;
    });
  }

  $scope.acceptFriendRequest = function(id){
    $http({
      method: 'POST',
      url: '/api/friends/manage',
      data: id,
      headers: {
        'Content-Type': 'text/plain'
      }})
      .success(function(result) {
        _.remove($scope.friendRequests, function(request){
          return request.userId == id;
        });
        console.log($scope.friendRequests);
      });
  }

  $scope.deleteFriendRequest = function(id){
    $http.delete('/api/friends/manage', {data: id}).success(function(res){
      _.remove($scope.friendRequests, function(request){
        return request.userId == id;
      });
    });
  }

  function loadDeviceSubscriberName(lst) {
    console.log(lst);
    lst.forEach(function(device){
      device.subscriberIds.forEach(function(id){
        $http.get('/api/friends/' +id).success(function(data) {
          device.subscriber.push({name: data.firstName + ' ' + data.lastName, subscriberId: id});
        });
      });
    });
    lst.forEach(function(device){
      $http.get('/api/device/' +device.id).success(function(data) {
        device.name = data.name;
      });
    });
    $scope.devices = lst;
  }

  function loadDeviceNotifications(cb){
    var deviceLst = [];
    var devIdLst = [];

    $http.get('/api/device/subscriptions/manage').success(function(data) {
      devIdLst = _.keys(data);

      var dev = {
        id: '',
        name: '',
        subscriberIds: [],
        subscriber: []
      };

      devIdLst.forEach(function(id){
        dev.id = id;
        dev.subscriberIds = data[id];
        deviceLst.push(dev);
        console.log(data[id], data, id);
      });
      cb(deviceLst);
    });
  }

  function loadSensorSubscriberName(lst) {
    console.log(lst);
    lst.forEach(function(sensor){
      sensor.subscriberIds.forEach(function(id){
        $http.get('/api/friends/' +id).success(function(data) {
          sensor.subscriber.push({name: data.firstName + ' ' + data.lastName, subscriberId: id});
        });
      });
    });
    lst.forEach(function(sensor){
      $http.get('/api/sensor/' +sensor.id).success(function(data) {
        sensor.name = data.name;
      });
    });
    $scope.sensors = lst;
    $rootScope.dataLoaded = true;
  }

  function loadSensorNotifications(cb){
    var sensorLst = [];
    var senIdLst = [];

    $http.get('/api/sensor/subscriptions/manage').success(function(data) {
      senIdLst = _.keys(data);

      var sen = {
        id: '',
        name: '',
        subscriberIds: [],
        subscriber: []
      };

      senIdLst.forEach(function(id){
        sen.id = id;
        sen.subscriberIds = data[id];
        sensorLst.push(sen);
        console.log(data[id], data, id);
      });
      cb(sensorLst);
    });
  }

  $scope.acceptSubscription = function(subscriberId, sensorId, sub) {
    var postData = {
      "subscriberId": subscriberId,
      "sensorId": sensorId,
      "accept": true
    };

    $http.post('/api/sensor/subscriptions/manage', postData).success(function(data) {
      console.log(data, sub);
      sub.requestSent = true;
    });
  }

  $scope.rejectSubscription = function(subscriberId, sensorId, sub) {
    var postData = {
      "subscriberId": subscriberId,
      "sensorId": sensorId,
      "accept": false
    };

    $http.post('/api/sensor/subscriptions/manage', postData).success(function(data) {
      console.log(data);
      sub.requestSent = true;
    });
  }

  // Update notifications badge
  $scope.$watch('sensors', function(newval, old){
    $rootScope.notificationCount = newval.length;
  }, true);

  $scope.$watch('devices', function(newval, old){
    $rootScope.notificationCount += newval.length;
  }, true);
  $scope.$watch('friendRequests', function(newval, old){
    $rootScope.notificationCount += newval.length;
  }, true);

  // check new notifications every 5 seconds

  setInterval(function(){
    loadFriendRequests()
    loadSensorNotifications(loadSensorSubscriberName);
    loadDeviceNotifications(loadDeviceSubscriberName);
  }, 5000);


  // loadDevices(loadDeviceInfo);
  loadFriendRequests()
  loadSensorNotifications(loadSensorSubscriberName);
  loadDeviceNotifications(loadDeviceSubscriberName);
  $rootScope.dataLoaded = true;

}]);

