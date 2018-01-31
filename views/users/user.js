'use strict';

angular
    .module('myApp')
    .controller('Users.Controller', Controller)
;


function Controller($http, $window, $timeout, $rootScope, $scope, $location, $stateParams, Restangular, server, $uibModal, $ocLazyLoad, UsersMemberService, items) {
    var vm = this;

    vm.items = items;
    if (vm.items.close) {
        $stateParams.id = 0;
    }
    vm.userSearchLength = 0;
    vm.customFieldValues = [];
    vm.removedManagedUsers = [];
    vm.addedManagedUsers = [];
    vm.talentNotesLoaded = false;
    vm.back = function () {
        $window.history.back();
    };

    $rootScope.CustomField.get('customFieldDefinitions/User').then(function (customFields) {
        vm.customFields = customFields;
    });

    vm.init = function () {
        $ocLazyLoad.load('views/users/users.js');
        $ocLazyLoad.load('views/users/advancedUserSearch/advancedLinkedUsersGrid.js');
        $ocLazyLoad.load('views/users/advancedUserSearch/advancedUserSearchDialog.js');
        vm.userModel = Restangular.one('admin/user', $stateParams.id);
        vm.userModel.get().then(function (data) {
            vm.user = data;
            vm.quickNoteUser = vm.user;
            Restangular.one('admin/languages').getList().then(function (languages) {
                vm.languages = languages;
            });

            $http.get(server.uri + '/tm/talentNote?_filterFields=user.login&_filterValues='+vm.user.login+'&JSON_CALLBACK=cb').then(function (resp) {
                vm.talentNoteCount = resp.data.payload.count;
                vm.recentTalentNotesUpdated = resp.data.payload.content;
                vm.talentNotesLoaded = true;
            }, function (err) {
            });
            vm.customFieldValues = vm.user.customFieldValues;
            if (vm.user.id > 0) {
                vm.loadManager();
                Restangular.one('admin/user', vm.user.id).one('jobDescription').get().then(function (jobDescription) {
                        vm.jobDescription = jobDescription;
                    }
                );


            }
            $timeout(function(){
                Restangular.all('tm/evaluationAnswers').get(vm.user.id).then(function(resp){
                    vm.evaluationAnswers = resp;
                });
            });

            $timeout(function(){
                Restangular.all('tm/trainingGoals').get(vm.user.id).then(function(resp){
                    vm.trainingGoals = resp;
                });
            });

            vm.usersMemberService = new UsersMemberService(vm.user);
            vm.usersMemberService.userFilter(vm.usersMemberService);


            vm.user.getList('permissionsProfiles').then(function (data) {
                $scope.$watch('vm.user.permissionsProfiles', function () {
                    vm.user.hasManagerPermission = $rootScope.hasKhPermission('manager', vm.user);
                });
                vm.user.permissionsProfiles = data;
            });
        });

        $rootScope.JobDescription.getList().then(function (jobDescriptions) {
            vm.jobDescriptions = jobDescriptions;
        });


        window.scrollTo(0, 0);
    };

    vm.delete = function () {
        vm.user.remove().then(function (response) {
            vm.flash = vm.user.firstName + ' ' + vm.user.surname + ' has been deleted successfully';

            vm.error = null;
            vm.showFlash = true;
            $timeout(function () {
                $location.path('/users');
            }, 2000);
        });
    };

    vm.loadStatuses = function () {
        if (!vm.userStatuses || vm.userStatuses.length <= 1) {
            vm.loadingUserStatuses = true;
            $rootScope.UserStatus.getList().then(function (managers) {
                vm.userStatuses = managers;
                vm.loadingUserStatuses = false;
            });
        }
    };
    vm.addQuickNote = function(){
        $rootScope.QuickNote.post({user:vm.quickNoteUser, note:vm.quickNoteComment}).then(function(quickNote){
            quickNote.show = true;
            if(!vm.recentTalentNotesUpdated){
                vm.recentTalentNotesUpdated = [];
            }
            vm.recentTalentNotesUpdated.unshift(quickNote);
            vm.talentNoteCount++;
            delete vm.quickNoteComment;
        });
    };
    vm.deleteTalentNote = function(talentNote){
        $http.delete(server.uri + '/tm/talentNote/'+talentNote.id+'?JSON_CALLBACK=cb').then(function(){
            vm.recentTalentNotesUpdated.splice(vm.recentTalentNotesUpdated.indexOf(talentNote),1);
            vm.talentNoteCount--  ;
        })
    };
    vm.loadPermissions = function () {
        vm.allPermissionsProfiles = [];
        var allPermissionsProfiles = [];
        vm.loadingPermissionsProfiles = true;
        $rootScope.PermissionProfile.getList().then(function (permissionsProfiles) {
            allPermissionsProfiles = permissionsProfiles;
            if (vm.user.permissionsProfiles) {

                angular.forEach(allPermissionsProfiles, function (incoming) {
                    var add = true;
                    angular.forEach(vm.user.permissionsProfiles, function (pprof) {
                        if (pprof.id == incoming.id) {
                            add = false;
                        }
                    });

                    if (add) {
                        vm.allPermissionsProfiles.push(incoming)
                    }
                })
            } else {
                vm.allPermissionsProfiles = allPermissionsProfiles;
            }
            vm.loadingPermissionsProfiles = false;
        });


    };
    vm.addUser = function (newUser) {
        vm.usersMemberService.users.push(newUser.originalObject);
        vm.usersMemberService.usersTotalCount++;
        vm.addedManagedUsers.push(newUser.originalObject)
    };

    vm.loadManager = function () {
        $http.get(server.uri + '/admin/manager/' + vm.user.id + "?JSON_CALLBACK=cb").then(function (manager) {
            vm.manager = angular.fromJson(manager).data.payload;
            vm.managers = [];
            vm.managers.unshift(vm.manager);
        });
    };

    vm.loadJobDescriptions = function () {
        $rootScope.JobDescription.getList({_page: 0, _perPage: 99999}).then(function (jobDescriptions) {
            vm.jobDescriptions = jobDescriptions;
        });
    };

    vm.save = function () {
        if (!$scope.panelForm.$valid) {
            vm.error = 'Please check all fields are completed before saving';
            vm.showFlash = true;
            return
        }

        var managerId = angular.copy(vm.manager ? vm.manager.id : 0);
        var jobDescriptionId = angular.copy(vm.jobDescription ? vm.jobDescription.id : 0);
        vm.user.put().then(function (resp) {
                vm.user = resp;
                vm.flash = vm.user.firstName + ' ' + vm.user.surname + ' has been saved successfully';
                vm.error = null;
                vm.showFlash = true;

                vm.usersMemberService.ownerObject = vm.user;

                Restangular.one('admin/user', vm.user.id).post("addUsers", vm.addedManagedUsers ? vm.addedManagedUsers : []).then(function () {
                    Restangular.one('admin/user', vm.user.id).one('manager', managerId).put().then(function () {
                        Restangular.one('admin/user', vm.user.id).one('jobDescription', jobDescriptionId).put().then(function () {
                            vm.usersMemberService.updateUsers();
                            if (vm.items.done) {
                                vm.items.done(vm.user);
                            } else {
                                if ($stateParams.id == 0) {
                                    $location.path('/users/' + vm.user.id);
                                } else {
                                    vm.init();
                                }
                            }

                        });
                    });
                });

            },
            function errorCallback(err) {
                vm.error = null;
                console.log(err);
                if (err.data.message.indexOf('constraint') > 0) {
                    vm.error = 'A user already exists with login ' + vm.user.login + ' please choose another login'
                } else {
                    vm.error = 'An error occurred saving ' + vm.user.firstName + ' ' + vm.user.surname + '\n\r' + err.data.message;
                }
                vm.showFlash = true;
            });

    };


    vm.loadManagers = function () {
        if (!vm.managers || vm.managers.length <= 1) {
            vm.loadingManagers = true;
            $rootScope.Manager.getList().then(function (managers) {
                vm.managers = managers;
                vm.loadingManagers = false;
            });
        }
    };


    vm.sortBy = function (propertyName) {
        vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
        vm.propertyName = propertyName;
        vm.filter();
    };

    vm.responseFormatter = function (selection) {
        var items = angular.fromJson(selection.payload);
        angular.forEach(items, function (item) {
            if (item.coverImagePath) {
                item.iconLocation = server.url + item.coverImagePath;
            } else if (item.componentType) {
                item.iconLocation = server.url + item.componentType.id;
            }

        });
        selection.data = items;
        return selection;
    };


    vm.showAdvancedUserSearch = function () {
        vm.modalInstance = $uibModal.open({
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'advancedUserSearchDialog.html',
            controller: 'AdvancedUserSearch',
            controllerAs: 'vm',
            size: 'xlg-linker',
            resolve: {
                items: function () {
                    return {
                        owner: vm.user,
                        linking: true,
                        closeAction: function () {
                            vm.usersMemberService.userFilter(vm.usersMemberService);
                            vm.modalInstance.close();
                        },
                        saveAction: function () {
                            vm.modalInstance.close();
                            vm.save();
                        }
                    };
                }
            }
        });
    };
}