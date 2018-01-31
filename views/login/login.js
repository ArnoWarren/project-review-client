(function () {
    'use strict';

    angular
        .module('myApp')
        .controller('Login.IndexController', Controller);

    function Controller($location, $http, server, AuthenticationService) {
        var vm = this;
        vm.isAuthed = function() {
            var token = self.getToken();
            if(token) {
                var params = self.parseJwt(token);
                return Math.round(new Date().getTime() / 1000) <= params.exp;
            } else {
                return false;
            }
        };
        vm.login = login;
        initController();

        function initController() {
            // reset login status
            AuthenticationService.Logout();
        }
        vm.requestPassword = function(){
            $http.get(server.uri+'/security/requestPassword/' + vm.emailAddress).then(function(resp){
                vm.flash = 'A password reset email has been sent to '+vm.emailAddress;
                vm.error = null;
                vm.showFlash = true;
            }, function(){
                vm.flash = null;
                vm.error = 'Unable to find a user account for '+vm.emailAddress;
            })
        };

        vm.showReset = false;
        vm.resetPassword = function($event){
            vm.showReset = !vm.showReset;
        };

        function login() {
            vm.loading = true;

            if(statics.hashPassword){
                vm.passwordHash =  CryptoJS.SHA256(vm.password).toString(CryptoJS.enc.Hex);
            }else{
                vm.passwordHash = vm.password;
            }

            AuthenticationService.Login(vm.username, vm.passwordHash, function (result) {
                if (result === true) {
                    $location.path('/');
                } else if(result.data && result.data.message && result.data.message === 'accessRestricted') {
                    vm.accessTimes = result.data.accessTimeslots;
                    angular.forEach(vm.accessTimes, function(timeSlot){
                        timeSlot.startTime = moment(timeSlot.startTime, 'DD-MM-YYYY HH:mm').format('HH:mm');
                        timeSlot.endTime = moment(timeSlot.endTime, 'DD-MM-YYYY HH:mm').format('HH:mm');
                    })

                    vm.error = 'Access to KnowHow has been restricted by your administrator.';
                    vm.loading = false;
                } else {
                    vm.error = 'Username or password is incorrect';
                    vm.loading = false;
                }
            });
        }
    }

})();