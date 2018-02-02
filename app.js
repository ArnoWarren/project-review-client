'use strict';
var CORNEL_VOLUME_CONSTANT = 937;
// var statics = {server_address: "https://testing.thekhub.com"};
var originalURL;

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ui.router',
    'oc.lazyLoad',
    'ui.bootstrap',
    'ui.bootstrap.progressbar',
    'ui.bootstrap.modal',
    'ui.bootstrap.collapse',
    'ui.bootstrap.popover',
    'pascalprecht.translate',
    'ngResource',
    'ngAnimate',
    'angular-jwt',
    'ngMessages',
    'ngStorage',
    'ngFileUpload',
    'angucomplete-alt',
    'angular-confirm',
    'mwl.confirm',
    'picardy.fontawesome',
    'duScroll',
    'ui.select',
    'ngSanitize',
    'growlNotifications',
    'xeditable',
    'angular.filter',
    'ui.scrollpoint',
    'froala',
    'dndLists',
    'restangular',
    'ngTouch',
    'angular-clipboard',
    'ncy-angular-breadcrumb',
    'angularUtils.directives.dirPagination',
    'dndLists'
]).config(['$compileProvider', function ($compileProvider) {
    $compileProvider.debugInfoEnabled(true);
}])
    .service('newUsermodalProvider', ['$uibModal', function ($uibModal) {

    this.openPopupModal = function (doneCallback, closeCallback) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/users/userModal.html',
            size: 'lg',
            controller: 'Users.Controller as vm',
            resolve: {
                items: function() {
                    return {
                        close: closeCallback,
                        done: doneCallback
                    };
                }
            }
        });
        return modalInstance;
    }
}])
    .constant("server", {"uri": statics.server_address + "/rest", "url": statics.server_address})

    .config(['$translateProvider', function ($translateProvider) {
        // add translation tables
        $translateProvider.useSanitizeValueStrategy('sanitize');
        $translateProvider.translations('en', translationsEN);
        //$translateProvider.translations('de', translationsDE);
        $translateProvider.preferredLanguage('en');
        // remember language

    }])
    .config(function (RestangularProvider, $breadcrumbProvider) {
        $breadcrumbProvider.setOptions({
            prefixStateName: 'home',
            template: 'bootstrap2'
        });
        RestangularProvider.addFullRequestInterceptor(function (element, operation, what, url, headers, params, httpConfig) {
            if (operation == 'getList') {
                if (!params._page) {
                    params._page = 1;
                }
                params._page = (params._page - 1);
            }
            return {params: params};
        });

        // add a response intereceptor
        RestangularProvider.setBaseUrl(statics.server_address + '/rest');
        // RestangularProvider.setBaseUrl('https://testing.thekhub.com/rest/admin');
        RestangularProvider.addResponseInterceptor(function (data, operation, what, url, response, deferred) {
            var extractedData;

            if (data.payload && data.payload.content && operation === "getList") {
                extractedData = data.payload.content;
                extractedData.error = data.httpStatus;
                extractedData.status = data.responseCode;

                response.totalCount = data.payload.totalElements;
                extractedData.totalCount = data.payload.totalElements;
                extractedData.totalPages = data.payload.totalPages;
                extractedData.pageNumber = data.payload.number + 1;
                extractedData.numberOfElements = data.payload.numberOfElements;
            } else {
                extractedData = data.payload;
                if (operation === "getList" && data.payload && data.payload.totalElements == 0) {
                    extractedData = [];
                }
            }
            return extractedData;
        });

    })


    .config(config)
    .filter('trusted', ['$sce', function ($sce) {
        return function (url) {
            return $sce.trustAsResourceUrl(url);
        };
    }])
    .filter('secondsToDateTime', [function () {
        return function (seconds) {
            return new Date(1970, 0, 1).setSeconds(seconds);
        };
    }])
    .directive('confirmOnExit', function($confirm) {
        return {
            link: function($scope, elem, attrs) {
                    window.onbeforeunload = function(){
                        if (angular.element(elem[0]).hasClass('ng-dirty') && !angular.element(elem[0]).hasClass('ng-submitted')) {
                            return "You have unsaved changes - are you sure you want to leave the page?";
                        }
                    }
                    $scope.$on('$locationChangeStart', function(event, next, current) {
                        if (angular.element(elem[0]).hasClass('ng-dirty') && !angular.element(elem[0]).hasClass('ng-submitted')) {
                            $confirm({text: 'You have unsaved changes - are you sure you want to leave the page?'})
                                .then(function() {
                                    angular.element(elem[0]).removeClass('ng-dirty')
                                    window.location.href = next;
                                });

                            event.preventDefault();
                            // if(!confirm("You have unsaved changes - are you sure you want to leave the page?")) {
                            //
                            // }
                        }
                    });
            }
        };
    })

    .filter('propsFilter', function () {
        return function (items, props) {
            var out = [];

            if (angular.isArray(items)) {
                var keys = Object.keys(props);

                items.forEach(function (item) {
                    var itemMatches = false;

                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                // Let the output be the input untouched
                out = items;
            }

            return out;
        };
    })
    .factory('authInterceptor', ['$log', function ($location) {
        var authInterceptor = {
            response: function (response) {
                if (response.status == 403) {
                    originalURL = $location.url();
                    $location.path('/login');
                }
                else {
                    return response;
                }

            }
        };

        return authInterceptor;
    }])
    .filter('wordCounter', function () {
    return function (value) {
        if (value && (typeof value === 'string')) {
            return value.trim().split(/\s+/).length;
        } else {
            return 0;
        }
    };
}).filter('to_trusted', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}])
    .filter('titleCase', function () {
        return function (input) {
            input = (input || '').split('-').join(" ").split('_').join(" ");
            return input.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }
    }).
    value('froalaConfig', {
        theme: 'gray',
        key: 'Lc1bbygD-8fF1b1mfbruj==',
        placeholderText: 'Enter Text Here',
        toolbarButtons : ["fullscreen","bold","italic","underline","strikeThrough","subscript","superscript","|","fontFamily","fontSize","color","inlineStyle","paragraphStyle","|","paragraphFormat","align","formatOL","formatUL","outdent","indent","quote","-","insertLink","insertImage","insertVideo","embedly","insertFile","insertTable","|","emoticons","specialCharacters","insertHR","selectAll","clearFormatting","|","print","spellChecker","help","html","|","undo","redo","comment"],
        tableStyles: {
            class1: 'Alternate Rows',
            class2: 'Border'
        },
        inlineStyles: {
            'Padded': 'padding:15px',
            'Table Border': 'border : 1px solid lightgrey',
            'Padded With Margin': 'padding:15px; margin:15px',
            'Small Blue': 'font-size: 14px; color: blue;'
        }
    })
.controller('InlineComment.Controller', ['$scope', 'items','$timeout', function ($scope, items) {
    var vm = this;
    vm.selectedText = items.getSelectedText();
    vm.close = function(){
        items.closeAction();
    };

    vm.setComments = function(){
    };

    vm.addComment = function(){
        items.saveAction(vm.comment);

    };
}])
.controller('InsertTableModalInstanceController', ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {

    // Gets converted by createTable
    $scope.newtable = {};

    $scope.newtable.row = '';
    $scope.newtable.col = '';

    function createTable(tableParams) {
        if(angular.isNumber(tableParams.row) && angular.isNumber(tableParams.col)
            && tableParams.row > 0 && tableParams.col > 0){
            var table = "<p><br/></p><p><br/></p><div class='TableBorder'><table class='table table-hover table-bordered freeTextTable'>";
            var colWidth = 100/tableParams.col;
            for (var idxRow = 0; idxRow < tableParams.row; idxRow++) {
                var row = "<tr>";
                for (var idxCol = 0; idxCol < tableParams.col; idxCol++) {
                    row += "<td"
                        + (idxRow == 0 ? ' style="width: ' + colWidth + '%;"' : '')
                        +">&nbsp;</td>";
                }
                table += row + "</tr>";
            }
            return table + "</table></div><p><br/></p><p><br/></p>";
        }
    }

    $scope.close = function () {
        $uibModalInstance.dismiss()
    }

    $scope.insertTable = function() {
        $uibModalInstance.close(createTable($scope.newtable));
    }

}])
    .directive('checkAvatar', function ($http) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                attrs.$observe('ngSrc', function (ngSrc) {
                    $http.get(ngSrc).then(function () {
                    }, function () {
                        element.attr('src', 'img/avatar.png'); // set default image
                    });
                });
            }
        };
    })
    .run(run);



function run($rootScope, $window, $http, $location, $timeout, $localStorage, $sce, $uibModal, Restangular, Upload, server, editableOptions, editableThemes, $state, $transitions) {
    if(statics.sso){
        var oReq = new XMLHttpRequest();
        oReq.addEventListener("load", function(){
            var resp = JSON.parse(oReq.responseText);
            if (resp.token) {
                $http.defaults.headers.common.Authorization = 'Bearer ' + resp.token;
                $localStorage.currentUser = {
                    username: resp.user.username,
                    token: resp.token,
                    project: resp.user.projectName,
                    email: resp.user.email,
                    manager: resp.user.manager,
                    avatar: resp.user.avatar,
                    lastLoggedIn: resp.user.lastLogin,
                    id: resp.user.id,
                    name: resp.user.firstname + ' ' + resp.user.lastname,
                    authorities: resp.user.authorities,
                    customFields: resp.user.customFieldValues
                };
                $rootScope.initUser();
                return $http.defaults.headers.common.Authorization;
            }
        });
        oReq.open("GET", server.uri+'/auth/validate');
        oReq.send();
    }
    $rootScope.datePickerOpen = [];
    $rootScope.activeMenu = $state.name;
    $rootScope.allFarmsItem = {farmOrUnitName:'All Farms', id:0};
    $rootScope.allFarmsSelected = false;
    $rootScope.statics = statics;

    editableThemes.bs3.inputClass = 'input-sm';
    editableThemes.bs3.buttonsClass = 'btn-sm';
    editableThemes.inputClass = 'input-sm';
    editableThemes.buttonsClass = 'btn-sm';
    editableOptions.theme = 'bs3';

    $rootScope.defaultHeadingStyle = '.Heading1';
    $rootScope.dateOptions = {
        formats: 'yyyy-MM-dd',
        startingDay: 1
    };

    $rootScope.back = function(){
        $window.history.back();
    };

    $rootScope.hideUsers = true;
    $rootScope.hideContainers = true;
    $rootScope.hideComponents = true;
    $rootScope.hideEvaluations = true;
    $rootScope.hideJobDescriptions = true;
    $rootScope.dateOptions = {
        formats:'yyyy-MM-dd',
        startingDay: 1
    };


    $rootScope.isViewer = function(){
        return $location.path().indexOf('technicalFileViewer') >= 0;
    }

    $rootScope.capitalizeFirstLetter = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };


    $rootScope.download = function (url) {
        $rootScope.uploadProgress = 50;
        $http({
            method: 'GET',
            url: server.url + '/' + url,
            responseType: 'arraybuffer'
        }).then(function (data) {
            $rootScope.uploadProgress = 100;
            var filename = data.headers()['x-filename'];
            var contentType = data.headers()['content-type'];
            var linkElement = document.createElement('a');
            try {
                var blob = new Blob([data.data], {
                    type: contentType,
                    endings: 'native'
                });
                var url = window.URL.createObjectURL(blob);

                linkElement.setAttribute('href', url);
                linkElement.setAttribute("download", filename);

                var clickEvent = new MouseEvent("click", {
                    "view": window
                });
                linkElement.dispatchEvent(clickEvent);
                $timeout(function(){
                    $rootScope.uploadProgress = 0;
                },1000)
            } catch (ex) {
                console.log(ex);
                vm.running = false;
            }
        });
    };


    // keep user logged in after page refresh
    if ($localStorage.currentUser) {
        $http.defaults.headers.common.Authorization = 'Bearer ' + $localStorage.currentUser.token;
    }

    $rootScope.init = function(){
        if(!statics.sso && !$localStorage.currentUser){
            if ($localStorage.currentUser && $localStorage.currentUser.token) {
                $http.get(server.uri + 'rest/auth/validate/true').then(function (resp) {
                    var response = angular.fromJson(resp.data);
                    $rootScope.initUser();
                    if (resp.status !== 200) {
                        $location.path('/login')
                    }
                });
            } else {
                var publicPages = ['/login'];
                var restrictedPage = $location.path().indexOf('aauth') <= 0 && publicPages.indexOf($location.path()) === -1 && $location.path().length > 1;
                if (restrictedPage) {
                    $location.path('/login')
                }

            }
        }
        }
    };
    $rootScope.userSearchURL = server.uri + '/tm/talentNote/user/search/';

    $rootScope.User = Restangular.all('admin/user');
    $rootScope.Client = Restangular.all('pr/client');
    $rootScope.Project = Restangular.all('pr/project');
    $rootScope.UserRoles = Restangular.all('admin/userRoles');
    $rootScope.CustomField = Restangular.all('admin/customField');
    $rootScope.UserStatus = Restangular.all('admin/userStatus');
    $rootScope.Manager = Restangular.all('admin/manager');
    $rootScope.JobDescription = Restangular.all('admin/jobDescription');
    $rootScope.PermissionProfile = Restangular.all('admin/permissionProfile');
    $rootScope.Permission = Restangular.all('admin/permission');

    $rootScope.getCustomFieldValue = function(customFieldOwner,customFieldName){
        if(customFieldOwner && customFieldOwner.customFieldValues){
            for(var i=0; i<customFieldOwner.customFieldValues.length;i++) {
                var customFieldValue = customFieldOwner.customFieldValues[i];
                if (customFieldValue.customField.name === customFieldName) {
                    return customFieldValue.value;
                }
            }
        }
    };

    $rootScope.getCustomField = function(customFieldOwner,customFieldName){
        if(customFieldOwner && customFieldOwner.customFieldValues){
            for(var i=0; i<customFieldOwner.customFieldValues.length;i++) {
                var customFieldValue = customFieldOwner.customFieldValues[i];
                if (customFieldValue.customField.name === customFieldName) {
                    return customFieldValue;
                }
            }
        }
    };


    $rootScope.useFieldFilter = function (filter) {
        var use = typeof filter != 'undefined' && filter != null && filter.length > 0;
        return use;
    };

    $rootScope.toggleInfoPanel = function(){
        $rootScope.showInfoPanel = !$rootScope.showInfoPanel;
        $rootScope.showPasswordResetForm = false;
        return $rootScope.showInfoPanel;
    };

    $rootScope.toggleStatusFilter = function (statusFilter) {
        if (!statusFilter || statusFilter == '') {
            return 'ACTIVE';
        }
        if (statusFilter == 'ACTIVE') {
            return 'PROPOSED';
        }
        if (statusFilter == 'PROPOSED') {
            return statusFilter = 'DRAFT';
        }
        if (statusFilter == 'DRAFT') {
            return statusFilter = 'RETIRED';
        }
        if (statusFilter == 'RETIRED') {
            return statusFilter = 'ACTIVE';
        }
    };
    $rootScope.removeAvatar = function(){
    };

    $rootScope.importAvatar = function(file){
        if (file) {
            Upload.upload({
                url: server.uri + '/userProfile/'+$rootScope.getCurrentUser().id+"/avatar",
                data: {file: file}
            }).then(function (resp) {
                $rootScope.avatarUploadProgress = 0;
                if(resp.data.responseCode === 500){
                }else{
                    $rootScope.getCurrentUser().avatar = resp.data.payload;
                    $rootScope.avatarUploadProgress = 0;
                }

            }, function (resp) {
                $rootScope.avatarUploadProgress = 0;
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                $rootScope.avatarUploadProgress = progressPercentage;
            });
        }

    };



    $rootScope.setCustomFieldOption = function(customFieldOption, customFieldValue){
        customFieldValue.value = customFieldOption.value;
    };

    $rootScope.setCustomField = function(vm, customFieldValues, customFieldName){
        angular.forEach(customFieldValues, function(customFieldValue){
            if(customFieldValue.customField.name === customFieldName){
                vm.customFields[customFieldName] = customFieldValue;
                vm.customFieldOptions[customFieldName] = customFieldValue.customField.customFieldOptions;
            }
        });
    };

    $rootScope.clearFlash = function(){
        delete $rootScope.flash;
        delete $rootScope.error;
        $rootScope.showFlash = false;
    };

    $rootScope.changePassword = function(passwordReset){
        if($rootScope.isAuthed()){

            Restangular.one('userProfile').post('setPassword',{newPassword : CryptoJS.SHA256(passwordReset.newPassword).toString(CryptoJS.enc.Hex), oldPassword:!$rootScope.showPasswordResetForm ? CryptoJS.SHA256(passwordReset.currentPassword).toString(CryptoJS.enc.Hex) : null}).then(function(resp, status){
                passwordReset.currentPassword = null;
                passwordReset.newPassword = null;
                passwordReset.newPasswordRepeat = null;
                $rootScope.showPasswordResetForm = false;
                $rootScope.flash = 'Your password has been reset successfully';
                $rootScope.showFlash = true;
                $timeout(function(){
                    $rootScope.toggleInfoPanel();
                    $rootScope.clearFlash()
                }, 2500);

            }, function(err){
                passwordReset.currentPassword = null;
                passwordReset.newPassword = null;
                passwordReset.newPasswordRepeat = null;
                delete $rootScope.flash;
                $rootScope.error = 'Your current password is incorrect. Please try again.';
                $rootScope.showFlash = true;
                $timeout(function(){
                    $rootScope.clearFlash()
                }, 2500)

            });
            $rootScope.forgottenPassword = false;
        }
    };
    $transitions.onSuccess({},function(){
        $rootScope.activeMenu = $state.current.name;
        window.scrollTo(0, 0);
        $rootScope.init();
    });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        $rootScope.isMenuCollapsed = true;
        $rootScope.showInfoPanel = false;
        $rootScope.showPasswordResetForm = false;
        window.scrollTo(0, 0);
        $rootScope.init();

    });



    // redirect to login page if not logged in and trying to access a restricted page
    $rootScope.$on('$locationChangeStart', function (event, next, current) {
        var publicPages = ['/login', '/aauth'];
        var hash = window.location.hash;
        var pathStart = '';
        if($location.path().length > 6){
            pathStart = $location.path().substring(0,6);
        }

        var restrictedPage =  publicPages.indexOf(pathStart) === -1 && publicPages.indexOf($location.path()) === -1;
        if (!statics.sso){

            if (restrictedPage && !$localStorage.currentUser) {
                $location.path('/login')
            }else{
                if($location.path().indexOf('/aauth') >=0){
                    $localStorage.currentUser = null;
                    var pathElements = $location.path().replace('/aauth/','').split("/");
                    var token = $location.path().replace('/aauth/'+pathElements[0]+'/','');
                    $rootScope.cid = pathElements[0];
                    $rootScope.token = token;
                    $http.post(server.uri+'auth/joinsession/'+$rootScope.cid, $rootScope.token)
                        .success(function (response) {
                            // login successful if there's a token in the response
                            if (response.token) {
                                $localStorage.currentUser = { username: response.username, token: response.token, id:response.i, name:response.name };
                                $rootScope.initUser();
                                // add jwt token to auth header for all requests made by the $http service
                                $http.defaults.headers.common.Authorization = 'Bearer ' + response.token;
                                // execute callback with true to indicate successful login

                                $location.path(decodeURIComponent(hash.substring(hash.indexOf('redirect=')+'redirect='.length)));

                            } else {
                                // execute callback with false to indicate failed login
                                $location.path('/login')
                            }
                        });

                }
            }
        }

    });

    $rootScope.setUser = function(resp){
        $localStorage.currentUser = {
            username: resp.user.username,
            token: resp.token,
            farm: resp.user.farm,
            activeFarmSeason: resp.user.activeFarmSeason,
            email: resp.user.email,
            avatar: resp.user.avatar,
            lastLoggedIn: resp.user.lastLogin,
            id: resp.user.id,
            name: resp.user.firstname + ' ' + resp.user.lastname,
            authorities: resp.user.authorities,
            customFields: resp.user.customFieldValues
        };

    }
    $rootScope.initUser = function () {
        if (originalURL && originalURL.indexOf("login") < 0) {
            $location.path(originalURL);
            originalURL = null;
        }
    };

    $rootScope.responseFormatter = function (selection) {
        var items = angular.fromJson(selection.data)[0];
        selection.data = items;
        return selection;
    };

    $rootScope.trustServerResource = function (link) {
        link = link.substring(1);
        return $sce.trustAsUrl(server.uri + link);
    };


    $rootScope.hasKhPermission = function (key, user) {
        var authorities = user.permissionsProfiles;
        var permissionFound = false;
        angular.forEach(authorities, function (authority) {
            angular.forEach(authority.permissions, function (authority) {
                if (!permissionFound && authority.profileKey === key) {
                    permissionFound = true;
                }
            });
        });
        return permissionFound;
    };

    $rootScope.hasPermission = function (key) {
        if(!$localStorage.currentUser){
            return false;
        }
        var authorities = $localStorage.currentUser.authorities;

        var permissionFound = false;
        angular.forEach(authorities, function (authority) {
            if (!permissionFound && authority.authority === 'ROLE_' + key) {
                permissionFound = true;
            }
        });
        return permissionFound;
    };

    $rootScope.hasPermissionForProfiles = function (key, authorities) {
        var permissionFound = false;
        angular.forEach(authorities, function (authority) {
            if (!permissionFound && authority.authority === key) {
                permissionFound = true;
            }
        });
        return permissionFound;
    };

    $rootScope.userSearch = function(searchText){
        if(!searchText){
            delete $rootScope.userSearchResults;
            return;
        }


        $rootScope.UserSearch.one('search', searchText).get().then(function(users){
            $rootScope.userSearchResults = users;
        });
    };

    $rootScope.hasAnyPermission = function (keys) {
        var permissionFound = false;
        angular.forEach(keys, function (key) {
            if (!permissionFound && $rootScope.hasPermission(key)) {
                permissionFound = true;
            }
        });

        return permissionFound;
    };


    $rootScope.parseJwt = function (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse($window.atob(base64));
    };

    $rootScope.getCurrentUser = function () {
        return $localStorage.currentUser;
    };


    $rootScope.admin = function () {
        return $localStorage.currentUser && $localStorage.currentUser.username === 'topdog'
    };

    $rootScope.isAuthed = function () {
        if ($localStorage.currentUser) {
            return true;
        } else {
            return false;
        }
    }



    $.FroalaEditor.DefineIcon('comment', {NAME: 'comment'});
    $.FroalaEditor.RegisterCommand('comment', {
        title: 'Add Comment',
        focus: false,
        undo: false,
        refreshAfterCallback: false,
        callback: function (a,b,c) {
            var thisEditor = this;
            var beforeComment = this.html.get(false);
            thisEditor.colors.background('#fdfa76');
            var newContent = this.html.get(false);
            var selectedText = this.html.getSelected();
            if(!$rootScope.addingCommentsTo.technicalFileComments){
                $rootScope.addingCommentsTo.technicalFileComments = [];
            }
            var sectionCommentNumber = ($rootScope.addingCommentsTo.technicalFileComments.length+1);
            var commentString = '<span class="section-comment clickable section-comment-'+sectionCommentNumber+'"><i class="fa fa-comment" style="background:#fdfa76"></i></span>'+thisEditor.html.getSelected();
            thisEditor.html.insert (commentString, true);

            var items = function () {
                return {
                    getComments : function(){
                    },
                    closeAction: function () {
                        thisEditor.html.set(beforeComment, false);
                        $rootScope.inlinceCommentModalInstance.close();
                    },
                    saveAction: function (comments) {

                        var user = $localStorage.currentUser;
                        $rootScope.addingCommentsTo.technicalFileComments.push({'open':true, 'creator': {'id':user.id, 'firstName':user.name.split(' ')[0], 'lastName':user.name.split(' ')[1]},
                            'createdOn' : new Date().getTime(),
                            'name':comments,
                            'commentSource': selectedText});

                        $rootScope.inlinceCommentModalInstance.close();
                    },
                    getSelectedText : function () {
                        return selectedText;
                    }
                };
            };
            $rootScope.inlinceCommentModalInstance = $uibModal.open({
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'inlineCommentsModal.html',
                controller: 'InlineComment.Controller',
                controllerAs: 'vm',
                size: 'md',
                resolve: {
                    items: items
                }
            })
        }
    });

}

function Service($http, $localStorage, AuthenticationService, $rootScope) {
    var service = {};

    service.Login = AuthenticationService.Login;
    service.Logout = AuthenticationService.Logout;

    return service;


}

