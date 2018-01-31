(function () {
    'use strict';

    angular
        .module('myApp')
        .factory('AuthenticationService', Service);

    function Service($http, $localStorage, $rootScope, server) {
        var service = {};

        service.Login = Login;
        service.Logout = Logout;

        return service;

        function Login(username, password, callback) {
            $http.post(server.uri+'/admin/auth/login', { login: username.toLowerCase(), password: password }).then(
                function (resp) {
                    var response = resp.data;
                    // login successful if there's a token in the response
                    if (response.token) {
                        // store username and token in local storage to keep user logged in between page refreshes
                        $localStorage.currentUser = { username: response.user.username,
                            token: response.token,
                            project:response.user.projectName,
                            email:response.user.email,
                            id:response.user.id,
                            manager: response.user.manager,
                            avatar: response.user.avatar,
                            lastLoggedIn: response.user.lastLogin,
                            name:response.user.firstname + ' '+response.user.lastname,
                            authorities:response.user.authorities,
                            supportEmailAddress:response.user.supportEmailAddress,
                            customFields: response.user.customFieldValues
                        };
                        $rootScope.initUser();
                        // add jwt token to auth header for all requests made by the $http service
                        $http.defaults.headers.common.Authorization = 'Bearer ' + response.token;
                        $http.get(server.uri+'/admin/user/'+$localStorage.currentUser.id+'?JSON_CALLBACK=cb').then(function(resp) {

                            server.user = angular.fromJson(resp.data.payload);
                            $rootScope.fullName = server.user.fullName;


                        });

                        // execute callback with true to indicate successful login
                        $rootScope.initUser();
                        // execute callback with true to indicate successful login
                        callback(true);
                    } else {
                        // execute callback with false to indicate failed login
                        callback(false);
                    }
                },
                function (response) {
                    if(response.data.message === 'accessRestricted'){
                        callback(response);
                    }else{
                        callback(false);
                    }

                });
        }

        function Logout() {
            // remove user from local storage and clear http auth header
            delete $localStorage.currentUser;
            $http.defaults.headers.common.Authorization = '';
        }
    }
})();