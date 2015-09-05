var app = angular.module('CobWebApp', ['ngRoute', 'angularMoment', 'ngDialog']);

app.config(function($routeProvider, $locationProvider) {
  // $locationProvider.html5Mode(true);

  $routeProvider
  .when('/news', {
    templateUrl: 'newsfeed.html',
    controller: 'CobWebAppCtrl'
  })
  .when('/user/:id', {
    templateUrl: 'user.html',
    controller: 'UserCtrl'
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

app.controller('CobWebAppCtrl', ['$scope', '$http', '$rootScope', 'ngDialog', function($scope, $http, $rootScope, ngDialog) {
  console.log("cobwerbapp ctrller fired");

  $scope.deviceLst = [];
  $scope.sensorLst = [];

  function loadNews(){
    loadDevices();
    loadSensors();
  }

  function loadDevices(){
    $rootScope.dataLoaded = false;
    $http.get('/api/device/newsfeed').success(function(data) {
      data.forEach(function(device){

        dev = {
          id: '',
          name: '',
          userId: '',
          time: '',
          msg : ''
        };

        dev.id = device.deviceId;
        dev.userId = device.userId;
        dev.time = device.dateTime;
        dev.msg = device.message;
        $scope.deviceLst.push(dev);
      });
    });
  }

  function loadSensors(){
    $http.get('/api/sensor/newsfeed').success(function(data) {
      data.forEach(function(sensor){

        sen = {
          id: '',
          deviceId: '',
          name: '',
          userId: '',
          time: '',
          msg : ''
        };

        sen.id = sensor.sensorId;
        sen.userId = sensor.userId;
        sen.deviceId = sensor.deviceId;
        sen.time = sensor.timeStamp;
        sen.msg = sensor.message;
        $scope.sensorLst.push(sen);
      });
    });
  }

  function loadDataById(obj, type){
    $http.get('/api/' + type +'/' + obj.id).success(function(data) {
      obj.name = data.name;
      obj.type = data[type+'Type'];
    });
  }

  function loadDeviceData(obj){
    $http.get('/api/device/' + obj.deviceId).success(function(data) {
      obj.deviceName = data.name;
      obj.deviceType = data.deviceType;
    });
  }

  function loadUserData(obj){
    $http.get('/api/friends/' + obj.userId).success(function(data) {
      obj.userName = data.firstName + ' ' + data.lastName;
      obj.emailHash = data.emailHash;
      console.log(data);
    });
  }

  $scope.popup = function (obj) {
    ngDialog.open({ template: '<h2>'+obj.userName+'</h2><p>Name: '+ obj.name+'</p>' +'<p>Id: '+ obj.id+'</p>'+'<p>Type: '+ obj.type+'</p>', className: 'ngdialog-theme-default', plain: true});
  };

  $scope.popupSensorParentDevice = function (obj) {
    ngDialog.open({ template: '<h2>'+obj.userName+'</h2><p>Name: '+ obj.deviceName+'</p>' +'<p>Id: '+ obj.deviceId+'</p>'+'<p>Type: '+ obj.deviceType+'</p>', className: 'ngdialog-theme-default', plain: true});
  };

  // Ugly hack to update news. Better use promises
  $scope.$watch('deviceLst', function(newval, old){
    newval.forEach(function(obj){
      loadDataById(obj, 'device');
      loadUserData(obj);
    });
    $rootScope.dataLoaded = true;
  }, true);

  $scope.$watch('sensorLst', function(newval, old){
    newval.forEach(function(obj){
      loadDataById(obj, 'sensor');
      loadUserData(obj);
      loadDeviceData(obj);
    });
    console.log(newval);
    $rootScope.dataLoaded = true;
  }, true);

  loadNews();
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

app.controller('UserCtrl', ['$scope', '$http', '$routeParams', '$rootScope', 'ngDialog', '$location', function($scope, $http, $routeParams, $rootScope, ngDialog, $location) {

  var userId = $routeParams.id;

  $scope.user = {
    userId: userId,
    userName: '',
    emailHash: ''
  };

  $scope.friendRequests = [];

  function loadUserData(obj){
    $http.get('/api/friends/' + obj.userId).success(function(data) {
      obj.userName = data.firstName + ' ' + data.lastName;
      obj.emailHash = data.emailHash;
      $rootScope.dataLoaded = true;
    });
  }

  function loadMyData(obj){
    $http.get('/api/user').success(function(data) {
      obj.userName = data.firstName + ' ' + data.lastName;
      obj.emailHash = data.emailHash;
      $rootScope.dataLoaded = true;
    });
  }

  function loadMyDevices(cb){
    $http.get('/api/device').success(function(devlst) {
      var deviceLst = [];
      devlst.forEach(function(device){
        var obj = {
          device: {name: device.name,
            id: device.id,
            type: device.deviceType,
            description: device.description
          },
          sensorIdList: device.sensorIdList,
          sensors: []
        };

        deviceLst.push(obj)
      });
      cb(deviceLst);
    });
  }

  function loadUserDevices(id, cb){
    $http.get('/api/friends/device/' + id).success(function(devlst) {
      var deviceLst = [];
      devlst.forEach(function(device){
        var obj = {
          device: {name: device.name,
            id: device.id,
            type: device.deviceType,
            description: device.description,
            subscribed: false
          },
          sensorIdList: device.sensorIdList,
          sensors: []
        };

        deviceLst.push(obj)
      });
      cb(deviceLst);
    });
  }

  function loadMySensors(lst){
    $scope.items = [];
    $http.get('/api/sensor').success(function(sensors) {
      var parentDevice;
      lst.forEach(function(item){
        sensors.forEach(function(sensor){
          if (item.device.id == sensor.parentDeviceId){
            item.sensors.push(sensor);  //O(D*S) :(
          }
        });
      $scope.items.push(item);
      });
      console.log('scope items', $scope.items);
      $scope.loadDeviceList(lst[0].device.name);
    });
  }

  function loadUserSensors(lst){
    $scope.items = [];
    lst.forEach(function(device){
      device.sensorIdList.forEach(function(sensorId){
        $http.get('/api/sensor/' + sensorId).success(function(sensorData) {
          device.sensors.push(sensorData);
        });
        $scope.items.push(device);
      });
    });
    $scope.loadDeviceList(lst[0].device.name); //Show the details of first device. Find a better way.
    setSubscribedStatus(lst);
    $rootScope.dataLoaded = true;
  }

  function deviceSubscribeStatus(lst, cb) {
    $http.get('/api/device/subscriptions').success(function(subscriptions) {
      lst.forEach(function(item){
        if (subscriptions.indexOf(item.device.id) > -1){
          item.device.subscribed = true;
        } else {
          item.device.subscribed = false;
        }
      });
      cb(lst);
    });
  }

  function sensorSubscribedStatus(lst){
    $http.get('/api/sensor/subscriptions').success(function(subscriptions) {
      lst.forEach(function(item){
        item.sensors.forEach(function(sensor){
          if (subscriptions.indexOf(sensor.id) > -1) {
            sensor.subscribed = true;
          } else {
            sensor.subscribed = false;
          }
          console.log(sensor);
        });
      });
    });
  }

  function setSubscribedStatus(lst){
    deviceSubscribeStatus(lst, sensorSubscribedStatus);
  }

  function loadDataById(obj, type){
    $http.get('/api/' + type +'/' + obj.id).success(function(data) {
      obj.name = data.name;
      obj.type = data[type+'Type'];
    });
  }

  function loadDeviceData(obj){
    $http.get('/api/device/' + obj.deviceId).success(function(data) {
      obj.deviceName = data.name;
      obj.deviceType = data.deviceType;
    });
  }

  function loadUserData(obj){
    $http.get('/api/friends/' + obj.userId).success(function(data) {
      obj.userName = data.firstName + ' ' + data.lastName;
      obj.emailHash = data.emailHash;
    });
  }

  function loadDeviceCards(id) {
    $scope.cardLst = [];

    $http.get('/api/device/message/' + id).success(function(data) {
      data.forEach(function(device){

        dev = {
          id: '',
          name: '',
          userId: '',
          time: '',
          msg: '',
          item: 'device'
        };

        dev.id = device.deviceId;
        dev.userId = device.userId;
        dev.time = device.dateTime;
        dev.msg = device.message;
        $scope.cardLst.push(dev);
      });
      console.log($scope.cardLst);
    });
  }

  function loadSensorCards(id){
    $scope.cardLst = [];

    $http.get('/api/sensor/message/' + id).success(function(data) {
      data.forEach(function(sensor){

        sen = {
          id: '',
          deviceId: '',
          name: '',
          userId: '',
          time: '',
          msg: '',
          item: 'sensor'
        };

        sen.id = sensor.sensorId;
        sen.userId = sensor.userId;
        sen.deviceId = sensor.deviceId;
        sen.time = sensor.timeStamp;
        sen.msg = sensor.message;
        $scope.cardLst.push(sen);
      });
      console.log($scope.cardLst);
    });
  }

  $scope.unfriend = function(){
    console.log("Unfriend", $scope.user.userId);
    $http.delete('/api/friends', {data: $scope.user.userId}).success(function(res){
      console.log(res);
    });
  }

  $scope.confirmUnfriend = function(){
    ngDialog.open({ template: '<p>Are you sure you want to unfriend ' + $scope.user.userName + '?</p> <button ng-click="unfriend(); closeThisDialog()" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Yes</button>', className: 'ngdialog-theme-default', scope: $scope, plain: true});
  }

  $scope.popup = function (obj) {
    ngDialog.open({ template: '<h2>'+obj.userName+'</h2><p>Name: '+ obj.name+'</p>' +'<p>Id: '+ obj.id+'</p>'+'<p>Type: '+ obj.type+'</p>', className: 'ngdialog-theme-default', plain: true});
  };

  $scope.subscribe = function(device, type){
    $http({
      method: 'POST',
      url: '/api/' + type +'/subscriptions',
      data: device.id,
      headers: {
        'Content-Type': 'text/plain'
      }})
      .success(function(result) {
        console.log(result);
      });
    device.subscribed = true;
  };

  $scope.unsubscribe = function(device, type){
    $http.delete('/api/' + type +'/subscriptions', {data: device.id}).success(function(res){
      console.log(res);
    });
    device.subscribed = false;
  }

  $scope.loadDeviceList = function(deviceName){
    $scope.deviceVisible = true;
    $scope.sensorVisible = false;
    $scope.selectedItem = _.filter($scope.items, {device: {name: deviceName}});
  }

  $scope.loadSensorList = function(sensorName) {
    var sensorList = [];
    $scope.sensorVisible = true;
    $scope.deviceVisible = false;
    $scope.selectedItem.forEach(function(device){
      device.sensors.forEach(function(sensor){
        sensorList.push(sensor);
      });
    });
    $scope.selectedItem = _.filter(sensorList, {name:sensorName});
  }

  $scope.deleteItem = function(){
    console.log("delete item", $scope.deleteId, $scope.deleteType);
    if ($scope.deleteType == 'device'){
      $http.delete('/api/device', {data: $scope.deleteId}).success(function(res){
        _.remove($scope.items, function(item){
          return item.device.id == $scope.deleteId;
        });
      });
    } else if ($scope.deleteType == 'sensor'){
      $http.delete('/api/sensor', {data: $scope.deleteId}).success(function(res){
        $scope.items.forEach(function(item){
          _.remove(item.sensors, function(sensor){
            return sensor.id == $scope.deleteId;
          });
        });
      });
    }
  }

  $scope.confirm = function(name, id, type){;
    $scope.deleteId = id;
    $scope.deleteType = type;
    ngDialog.open({ template: '<p> You sure you want to delete '+ name +'?</p> <button ng-click="deleteItem(); closeThisDialog()" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Delete</button>', className: 'ngdialog-theme-default', scope: $scope, plain: true});
  }


  $scope.loadCards = function(id, type){
    if (id){
      if (type == 'device') {
        loadDeviceCards(id);
      } else if (type == 'sensor') {
        loadSensorCards(id);
      }
    }
  }

  /*
  Create New Item
  */

  $scope.createItemPopup = function(){
    ngDialog.open({ template: 'createItemTemplate.html', className: 'ngdialog-theme-default', scope: $scope});
  }

  $scope.createItemType = 'device';
  $scope.deviceTypes = ['IPHONE','ANDROIDPHONE','WINDOWSPHONE','BLACKBERRYPHONE','ARDUINO','RASPBERRYPI','BEAGLEBONE','BEAGLEBOARD','INTELEDISON','INTELGALILEO','PC','GADGETEER','OTHER'];
  $scope.sensorTypes = ['GPS','TEMPERATURE','PRESSURE','HUMIDITY','GAS','ACCELEROMETER','GYRO','COMPASS','PROXIMITY','LUMINOSITY','POTENTIOMETER','PUSHBUTTON','TOUCH','OTHER'];

  $scope.createDevice = function(device){

    if (device.type != 'OTHER'){
      device.other = "null";
    }
    var dev = {
      name: device.name,
      description: device.description,
      type: device.type,
      otherType: device.other
    };

    $http.post('/api/device', dev).success(function(id) {
      loadMyDevices(function(deviceLst){
        loadMySensors(deviceLst);
      });
    });
  };

  $scope.createSensor = function(sensor){
    if (sensor.type != 'OTHER'){
      sensor.other = "null";
    }
    var sen = {
      name: sensor.name,
      description: sensor.description,
      type: sensor.type,
      otherType: sensor.other,
      deviceId: sensor.parentDeviceId
    };
    $http.post('/api/sensor', sen).success(function(id) {
      loadMyDevices(function(deviceLst){
        loadMySensors(deviceLst);
      });
    });
  };

  /*
  /Create New Item
  */

  /*
  Followers popup
  */

  function loadFollowerName(id, cb){
    $http.get('/api/friends/' + id).success(function(data) {
      user = {
        name: data.firstName + ' ' + data.lastName,
        id: id
      };
      cb(user);
    });
  }

  $scope.subscriberPopup = function(id, type){
    $scope.followers = [];
    $http.get('/api/'+ type +'/subscribers/' + id).success(function(ids) {
      console.log(ids);
      ids.forEach(function(id){
        loadFollowerName(id, function(data){
          console.log(data);
          $scope.followers.push(data);
        });
      });
      ngDialog.open({ template: 'followers.html', className: 'ngdialog-theme-default', scope: $scope});
    });
  }

  /*
  /Followers popup
  */

  $scope.$watch('cardLst', function(newval, old){
    console.log(newval);
    if (newval !== undefined && newval.length !== 0){
      if (newval[0].item == 'device'){
        newval.forEach(function(obj){
          loadDataById(obj, 'device');
          loadUserData(obj);
        });
      } else if (newval[0].item == 'sensor'){
        newval.forEach(function(obj){
          loadDataById(obj, 'sensor');
          loadUserData(obj);
          loadDeviceData(obj);
        });
      }
    }
  }, true);

  if (userId === "0") {
    $scope.loggedUserAccount = true;
    loadMyData($scope.user);
    loadMyDevices(function(deviceLst){
      loadMySensors(deviceLst);
    });
  } else {
    $scope.loggedUserAccount = false;
    loadUserData($scope.user);
    loadUserDevices($scope.user.userId, function(deviceLst){
      loadUserSensors(deviceLst);
    });
  }

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

app.directive('xngFocus', [function () {
  return function (scope, element, attrs) {
    return scope.$watch(attrs.xngFocus, function (newValue) {
      console.log(newValue);
      return newValue && element[0].focus();
    });
  };
}]);

