appContext.factory("HomeService", function($http, $cordovaFile, $cordovaFileTransfer, $q) {

    var getOperation = function() {
        var request = {
            url: "http://ec2-52-25-133-148.us-west-2.compute.amazonaws.com/BRbackoffice/web/operation/operation.txt?tmp="+ (new Date().getTime()), //prod
            //url: "http://ec2-52-25-133-148.us-west-2.compute.amazonaws.com/BRbackoffice/web/operation/operation.txt?tmp="+ (new Date().getTime()), //dev
            method: "GET",
            cache: false,
            transformResponse: function(data) {
                var array = new Array();
                array = data.split(";");
                return array;
            },
            timeout: 2000,
        }
        return $http(request);
    };

    /**
     * check if file exist
     */
    var fileExist = function(fileName, callBack) {

      isImage('./img/'+fileName).then(function(exist) {
          if (exist) {
            callBack('./img/'+fileName);
          } else {
            if (window.cordova) {
                if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                    path = cordova.file.applicationStorageDirectory;
                } else if (ionic.Platform.isWindowsPhone()) {
                    path = "//";
                } else {
                    path = cordova.file.documentsDirectory;
                }

                $cordovaFile.checkFile(path, fileName)
                    .then(function(success) {
                            callBack(success.nativeURL);
                    }, function(error) {
                        // error
                        callBack("404");

                    });
            }else{
              callBack("img/nasa_rodina_banner.jpg");
            }
          }
      });



    };

    /**
     * download photo serveur
     */
    var downloadImg = function( fileName, url, callBack) {

        if (window.cordova) {

          if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
              path = cordova.file.applicationStorageDirectory;
          } else if (ionic.Platform.isWindowsPhone()) {
              path = "//";
          } else {
              path = cordova.file.documentsDirectory;
          }

            $cordovaFile.createFile(path, fileName, true)
                .then(function(success) {
                    window.localStorage.setItem('encours' + fileName, true);
                    var targetPath = success.nativeURL;
                    var trustHosts = true;
                    var options = {};
                    $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
                        .then(function(result) {
                            //successs
                            window.localStorage.removeItem('encours ' + fileName);
                            callBack(result.nativeURL);
                        }, function(err) {
                          console.error(JSON.stringify(err));
                            console.log('erreur download ' + err.message);
                            // Error
                            callBack("404");

                        }, function(progress) {

                        });

                }, function(error) {
                    // error
                    console.error(JSON.stringify(error));
                    callBack("404");
                });

        } else {
          console.log
            callBack("404");
        }
    };

var isImage = function(src) {

    var deferred = $q.defer();

    var image = new Image();
    image.onerror = function() {
        deferred.resolve(false);
    };
    image.onload = function() {
        deferred.resolve(true);
    };
    image.src = src;

    return deferred.promise;
};

    return {
        getOperation: getOperation,
        fileExist: fileExist,
        downloadImg : downloadImg,
        isImage  : isImage

    }

}).factory("RunService",function( $http , $ionicUser ){
  var register = function(deviceId, deviceToken, fName, lName, email){
    var user = $ionicUser.get();

    if (!user.user_id) {
      user.user_id = $ionicUser.generateGUID();
    }

    angular.extend(user, {
      fullname : fName,
      email : lName,
      phone : email
    });

    $ionicUser.identify(user).then(function() {
      console.log('name: ' + user.name + "--- Id: " + user.user_id);
    });

    registerRequest = {
        url : "http://ec2-52-25-133-148.us-west-2.compute.amazonaws.com/BRbackoffice/web/app_dev.php/register/create",  //prod
      //  url : "http://ec2-52-25-133-148.us-west-2.compute.amazonaws.com/BRbackoffice/web/app_dev.php/register/create", //dev
        method : "POST",
        data : {
          deviceId : deviceId,
          deviceToken : deviceToken,
          firstname : fName,
          lastname : lName,
          email : email
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        transformRequest: function(obj) {
          var str = [];
          for ( var p in obj)
            str.push(encodeURIComponent(p) + "="
                    + encodeURIComponent(obj[p]));
          return str.join("&");
        },
        timeout : 10000
    };
    return $http(registerRequest);
  };
  return {
      register : register,
  }
});
