appContext.controller("EventController", function(HomeService, $scope, $interval, $ionicLoading, $cordovaMedia, $ionicPlatform, $window, $ionicPopup, RunService, $cordovaInAppBrowser, $sce, $rootScope, $state) {

    $ionicLoading.show({
        template: 'Loading...'
    });

    var soundPlaying;
    var imgDisplaying;
    var sound;
    var stop;
    var formPopup;
    var formName;
    $scope.isForm = false;
    $scope.isCountdown = false;
    $scope.focused = true;
    $scope.banner = false;



    $ionicPlatform.ready(function() {
        $scope.height = $window.innerHeight;
        $scope.width = $window.innerWidth;
        callServer();

    });

    /**
     *
     * get file from server
     */
    function callServer() {
        HomeService.getOperation().success(function(data, status, headers, config, statusText) {

            $ionicLoading.hide();
            var label = data[0];
            var text = data[1];
            var image = data[4];
            //var image = "xx.jpg";
            var sound = data[5];
            var partyTime = data[6];

            $scope.textColor = data[2];
            $scope.bgColor = data[3];


            if ( 0 <= label.toUpperCase().indexOf("DISPLAYARTIST")) {
                $scope.text =  $sce.trustAsHtml(text);
                $scope.alreadySigned = false;
                $scope.isForm = false;
                $scope.isCountdown = false;
                $scope.banner = true;
                console.info("111111");

                HomeService.fileExist(image, function(fileName) {

                    if ("404" == fileName) {

                        HomeService.downloadImg(image, "http://ec2-52-25-133-148.us-west-2.compute.amazonaws.com/BRbackoffice/web/uploads/" + image, function(imgURL) { //prod
                            //HomeService.downloadImg(image, "http://ec2-52-25-133-148.us-west-2.compute.amazonaws.com/BRbackoffice/web/uploads/" + image, function(imgURL) { //dev

                            $scope.imgBanner = imgURL + "?" + new Date().getTime();

                        });
                    } else {

                        $scope.imgBanner = fileName + "?" + new Date().getTime();
                        console.warn($scope.imgBanner);
                    }

                });
                callServer();
                //Form
            } else if ("FORM" == label.toUpperCase()) {

                $scope.text = "";
                $scope.show = false;
                $scope.bgColor = "#FFFFFF";

                if (null == localStorage.getItem(text.toUpperCase())) {
                    formName = text.toUpperCase();
                    $scope.eventName = text;

                    $scope.alreadySigned = false;

                    var fullname = localStorage.getItem("fullname");
                    var email = localStorage.getItem("email");
                    var phone = localStorage.getItem("phone");

                    if ("" != fullname)
                        $scope.fullname = fullname;
                    if ("" != phone)
                        $scope.phone = phone;
                    if ("" != email)
                        $scope.email = email;

                    callServer();
                } else {

                    $scope.eventName = localStorage.getItem(text);

                    $scope.diffTime = calculateMargin(partyTime * 1000 - new Date().getTime());

                    if( $scope.alreadySigned == "true")
                    $interval(function() {
                      console.log('eeeeee');
                        $scope.diffTime = $scope.diffTime - 1000;
                    }, 1000);

                    $scope.alreadySigned = true;
                    callServer();
                }
                $scope.isForm = true;
                $scope.banner = false;



            } else if ("" != text && "" == image && "" != sound) {
                if (document.querySelector('.display-text') != null)
                    $scope.marginTopText = calculateMargin((($window.innerHeight - document.querySelector('.display-text').clientHeight) / 2));
                $scope.text = text;
                $scope.isForm = false;
                $scope.banner = false;
                $scope.show = false;
                console.warn("1111111111111111111111");
                HomeService.fileExist(sound, function(fileName) {
                    /** if file does not exist */
                    if ("404" == fileName) {
                        HomeService.downloadImg(sound, "http://ec2-52-25-133-148.us-west-2.compute.amazonaws.com/BRbackoffice/web/uploads/" + sound, function(mp3URL) { //prod
                            //HomeService.downloadImg(sound, "http://ec2-52-25-133-148.us-west-2.compute.amazonaws.com/BRbackoffice/web/uploads/" + sound, function(mp3URL) { //dev
                            var media = new Media(mp3URL, null, null, mediaStatusCallback);

                            var iOSPlayOptions = {
                                numberOfLoops: 2,
                                playAudioWhenScreenIsLocked: false
                            }
                            if (ionic.Platform.isIOS() && soundPlaying != mp3URL) {
                                media.play(iOSPlayOptions);

                            } else if (soundPlaying != mp3URL) {
                                media.play();
                            }
                            soundPlaying = mp3URL;
                            callServer();
                        });
                        /** if file already exist */
                    } else {
                        var media = new Media(fileName, null, null, mediaStatusCallback);

                        var iOSPlayOptions = {
                            numberOfLoops: 2,
                            playAudioWhenScreenIsLocked: false
                        }

                        if (ionic.Platform.isIOS() && soundPlaying != fileName) {
                            media.play(iOSPlayOptions);
                            soundPlaying = fileName;

                        } else if (soundPlaying != fileName) {
                            media.play();
                            soundPlaying = fileName;

                        }

                        callServer();
                    }
                });
            } else if ( ""!= text && "" == image && "" == sound) {
                $scope.show = false;
                console.warn("2222222222222222222");
                $scope.isForm = false;
                $scope.banner = false;
                $scope.text = text;

                if ( window.localStorage.getItem("canReload") == true) {
                  $window.location.reload();

                  window.localStorage.setItem("canReload",false);
                }

                if (document.querySelector('.display-text') != null)
                    $scope.marginTopText = calculateMargin((($window.innerHeight - document.querySelector('.display-text').clientHeight) / 2));

                $scope.show = false;
                callServer();

            } else if ("" == text && "" != image && "" != sound) {
                console.warn("3333333333333333");
                $scope.isForm = false;
                $scope.banner = false;
                $scope.text = "";
                HomeService.fileExist(image, function(fileName) {
                    if ("404" == fileName) {
                        HomeService.downloadImg(image, "http://ec2-52-25-133-148.us-west-2.compute.amazonaws.com/BRbackoffice/web/uploads/" + image, function(imgURL) { //prod
                            //HomeService.downloadImg(image, "http://ec2-52-25-133-148.us-west-2.compute.amazonaws.com/BRbackoffice/web/uploads/" + image, function(imgURL) { //dev
                            getNaturalDimension(imgURL);
                            if (imgDisplaying != imgURL) {
                                $scope.imgSrc = imgURL + "?" + new Date().getTime();
                                $scope.show = true;
                                $scope.text = "";
                            }

                            imgDisplaying = imgURL;

                        });
                    } else {
                        if (imgDisplaying != fileName) {
                            $scope.imgSrc = fileName + "?" + new Date().getTime();
                            $scope.show = true;
                            $scope.text = "";
                        }
                        imgDisplaying = fileName;

                    }
                });
                //######################## for sound
                HomeService.fileExist(sound, function(fileName) {
                    /** if file does not exist */
                    if ("404" == fileName) {
                        //HomeService.downloadImg(sound, "http://ec2-52-25-133-148.us-west-2.compute.amazonaws.com/BRbackoffice/web/uploads/" + sound, function(mp3URL) { //prod
                        HomeService.downloadImg(sound, "http://ec2-52-25-133-148.us-west-2.compute.amazonaws.com/BRbackoffice/web/uploads/" + sound, function(mp3URL) { //dev
                            var media = new Media(mp3URL, null, null, mediaStatusCallback);

                            var iOSPlayOptions = {
                                numberOfLoops: 2,
                                playAudioWhenScreenIsLocked: false
                            }
                            if (ionic.Platform.isIOS() && soundPlaying != mp3URL) {
                                media.play(iOSPlayOptions);

                            } else if (soundPlaying != mp3URL) {
                                media.play();
                            }
                            soundPlaying = mp3URL;
                            callServer();
                        });
                        /** if file already exist */
                    } else {
                        var media = new Media(fileName, null, null, mediaStatusCallback);

                        var iOSPlayOptions = {
                            numberOfLoops: 2,
                            playAudioWhenScreenIsLocked: false
                        }

                        if (ionic.Platform.isIOS() && soundPlaying != fileName) {
                            media.play(iOSPlayOptions);
                            soundPlaying = fileName;

                        } else if (soundPlaying != fileName) {
                            media.play();
                            soundPlaying = fileName;

                        }

                        callServer();
                    }
                });
            } else if ("" == text && "" != image && "" == sound) {
                console.warn("4444444444444444444444");
                  window.localStorage.setItem("canReload",true);
                $scope.isForm = false;
                $scope.banner = false;
                $scope.text = "";
                $scope.show = true;
                HomeService.fileExist(image, function(fileName) {

                    if ("404" == fileName) {
                        HomeService.downloadImg(image, "http://ec2-52-25-133-148.us-west-2.compute.amazonaws.com/BRbackoffice/web/uploads/" + image, function(imgURL) { //prod
                            getNaturalDimension(imgURL);
                            //HomeService.downloadImg(image, "http://ec2-52-25-133-148.us-west-2.compute.amazonaws.com/BRbackoffice/web/uploads/" + image, function(imgURL) { //dev
                            if (imgDisplaying != imgURL) {
                                $scope.imgSrc = imgURL + "?" + new Date().getTime();
                                $scope.show = true;
                            }


                            imgDisplaying = imgURL;
                            callServer();
                        });
                    } else {
                        getNaturalDimension(fileName);
                        if (imgDisplaying != fileName) {
                            $scope.imgSrc = fileName + "?" + new Date().getTime();
                            $scope.show = true;
                        }
                        imgDisplaying = fileName;
                        callServer();
                    }
                });
            } else if ("" == text && "" == image && "" != sound) {
                console.warn("555555555555555555");
                $scope.isForm = false;
                $scope.banner = false;
                $scope.text = "";
                $scope.show = false;
                HomeService.fileExist(sound, function(fileName) {
                    /** if file does not exist */
                    if ("404" == fileName) {
                        HomeService.downloadImg(sound, "http://ec2-52-25-133-148.us-west-2.compute.amazonaws.com/BRbackoffice/web/uploads/" + sound, function(mp3URL) { //prod
                            //HomeService.downloadImg(sound, "http://ec2-52-25-133-148.us-west-2.compute.amazonaws.com/BRbackoffice/web/uploads/" + sound, function(mp3URL) { //dev
                            var media = new Media(mp3URL, null, null, mediaStatusCallback);

                            var iOSPlayOptions = {
                                numberOfLoops: 2,
                                playAudioWhenScreenIsLocked: false
                            }
                            if (ionic.Platform.isIOS() && soundPlaying != mp3URL) {
                                media.play(iOSPlayOptions);

                            } else if (soundPlaying != mp3URL) {
                                media.play();
                            }
                            soundPlaying = mp3URL;
                            callServer();
                        });
                        /** if file already exist */
                    } else {
                        var media = new Media(fileName, null, null, mediaStatusCallback);

                        var iOSPlayOptions = {
                            numberOfLoops: 2,
                            playAudioWhenScreenIsLocked: false
                        }

                        if (ionic.Platform.isIOS() && soundPlaying != fileName) {
                            media.play(iOSPlayOptions);
                            soundPlaying = fileName;

                        } else if (soundPlaying != fileName) {
                            media.play();
                            soundPlaying = fileName;

                        }
                    }
                    callServer();
                });
            } else if ("" == text && "" == image && "" == sound) {
                console.warn("666666666666666666666666");
                $scope.isForm = false;
                $scope.banner = false;
                $scope.text = "";
                $scope.show = false;
                callServer();

            } else if ("" != text && "" != image && "" != sound) {
                if (document.querySelector('.display-text') != null)
                    $scope.marginTopText = calculateMargin((($window.innerHeight - document.querySelector('.display-text').clientHeight) / 2));
                console.warn("777777777777");
                $scope.isForm = false;
                $scope.banner = false;
                $scope.text = text;
                $scope.show = false;
                HomeService.fileExist(sound, function(fileName) {
                    /** if file does not exist */
                    if ("404" == fileName) {
                        HomeService.downloadImg(sound, "http://ec2-52-25-133-148.us-west-2.compute.amazonaws.com/BRbackoffice/web/uploads/" + sound, function(mp3URL) { //prod
                            //HomeService.downloadImg(sound, "http://ec2-52-25-133-148.us-west-2.compute.amazonaws.com/BRbackoffice/web/uploads/" + sound, function(mp3URL) { //dev
                            var media = new Media(mp3URL, null, null, mediaStatusCallback);

                            var iOSPlayOptions = {
                                numberOfLoops: 2,
                                playAudioWhenScreenIsLocked: false
                            }
                            if (ionic.Platform.isIOS() && soundPlaying != mp3URL) {
                                media.play(iOSPlayOptions);

                            } else if (soundPlaying != mp3URL) {
                                media.play();
                            }
                            soundPlaying = mp3URL;
                            callServer();
                        });
                        /** if file already exist */
                    } else {
                        var media = new Media(fileName, null, null, mediaStatusCallback);

                        var iOSPlayOptions = {
                            numberOfLoops: 2,
                            playAudioWhenScreenIsLocked: false
                        }

                        if (ionic.Platform.isIOS() && soundPlaying != fileName) {
                            media.play(iOSPlayOptions);
                            soundPlaying = fileName;

                        } else if (soundPlaying != fileName) {
                            media.play();
                            soundPlaying = fileName;

                        }
                    }
                    callServer();
                });
            } else if ("" != text && "" != image && "" == sound) {
                console.warn("8888888888888");

                $scope.isForm = false;
                $scope.banner = false;
                $scope.text = text;
                $scope.show = false;
                if (document.querySelector('.display-text') != null)
                    $scope.marginTopText = calculateMargin((($window.innerHeight - document.querySelector('.display-text').clientHeight) / 2));

                callServer();
            }

        }).error(function(data, status, headers, config, statusText) {
            console.warn("--------------------------- ");
            callServer();
        })
    }


    var mediaStatusCallback = function(status) {
        if (false) {
            $ionicLoading.show({
                template: 'Loading...'
            });
        } else {
            $ionicLoading.hide();
        }
    }

    $scope.signup = function(signupForm) {

        console.log(signupForm.lastname);
        $scope.submitted = true;
        if (signupForm.$valid) {

            $ionicLoading.show({
                template: 'Loading...'
            });

            localStorage.setItem('fullname', signupForm.fullname.$modelValue);
            localStorage.setItem('phone', signupForm.phone.$modelValue);
            localStorage.setItem('email', signupForm.email.$modelValue);
            RunService.register(localStorage.getItem("deviceToken"), localStorage.getItem("deviceId"), signupForm.fullname.$modelValue, signupForm.phone.$modelValue, signupForm.email.$modelValue)
                .success(function(response, status, headers, config) {
                    localStorage.setItem(formName, formName);
                    $scope.alreadySigned = true;
                    $ionicLoading.hide();
                }).error(function(response) {

                    $ionicLoading.hide();
                    alert("Network Error");
                });
        } else {
            formPopup = $ionicPopup.show({
                template: '<h4 style="text-align: center;vertical-align: middle; display:block ">please fill all the form ! <h4/><br><a class="button button-full" style="font-weight: bolder;" id="bwlogin" ng-click="okPopup()">Ok</a>',
                scope: $scope,
                title: "Batelier Records"
            });
        }

    };

    $scope.okPopup = function() {
        formPopup.close();
    };

    //on focus
    $scope.focus = function() {
        $scope.focused = false;
    };
    //on blr
    $scope.blur = function() {
        $scope.focused = true;
    };


    function getNaturalDimension(src) {
        var image = new Image(); // or document.createElement('img')
        var width, height;
        $scope.maxHeight = $window.innerHeight;
        $scope.maxWidth = $window.innerWidth;
        image.onload = function() {

            var wRatio = this.width / $window.innerWidth;
            var hRatio = this.height / $window.innerHeight;

            if (wRatio >= 1 && hRatio >= 1) { //valid
                $scope.height = (this.height / wRatio);
                $scope.marginTop = ($window.innerHeight - $scope.height) / 2

            } else if (wRatio >= 1 && hRatio < 1) {
                console.warn("wRatio >= 1 && hRatio < 1");
                $scope.height = (this.height * hRatio);
                $scope.width = (this.width / wRatio);
                $scope.marginTop = ($window.innerHeight - $scope.height) / 2

            } else if (wRatio < 1 && hRatio >= 1) { //valid
                $scope.height = (this.height / hRatio);
                $scope.width = (this.width * wRatio);
                $scope.marginLeft = ($window.innerWidth - $scope.width) / 2;


            } else if (wRatio < 1 && hRatio < 1) { //valid
                $scope.height = (this.height);
                $scope.width = (this.width);
                $scope.marginTop = ($window.innerHeight - $scope.height) / 2
                $scope.marginLeft = ($window.innerWidth - $scope.width) / 2
            }

        };
        image.src = src;

    }

    function validateEmail(email) {
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(email);
    }

    function calculateMargin(margin) {
        if (margin <= 0) {
            return 15;
        } else {
            return margin;
        }
    }
});
