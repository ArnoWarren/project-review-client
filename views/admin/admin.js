'use strict';

angular
    .module('myApp')
    .controller('Admin.Controller', Controller);

function Controller($uibModal, $window,$timeout,$rootScope, $scope,$location, $stateParams, Restangular, server, $http) {
  var vm = this;

  vm.back = function(){
      $window.history.back();
  };
    

    vm.init = function(){
    window.scrollTo(0,0);
  };

    vm.importPMR = function(file){
        if (file) {
            Upload.upload({
                url: server.uri + '/pr/importPMR',
                data: {file: file}
            }).then(function (resp) {
                console.log(resp);
                window.location.reload();
                vm.uploadProgress = 0;
                vm.uploadStatus = '';
                if(resp.data.responseCode === 500){
                    vm.uploadStatus = 'error importing...';
                    vm.uploadErrorReport = resp.data.status.message;
                }else{
                    console.log('Success ' + resp.data.payload + ' uploaded. Response: ' + resp.data);
                    vm.uploadProgress = 0;
                }

            }, function (resp) {
                vm.uploadProgress = 0;
                vm.uploadStatus = 'error importing...';
                vm.coverImageUploadErrorReport[0] = resp.status;
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                vm.coverImageUploadErrorReport = [];
                vm.uploadProgress = progressPercentage;
                if(progressPercentage == 100){
                    vm.uploadStatus = 'processing...';
                }else{
                    vm.uploadStatus = 'uploading...';
                }
            });
        }

    };

        vm.save = function () {
            if (!$scope.panelForm.$valid) {
                delete vm.flash;
                vm.error = 'Please check all fields are completed before saving';
                vm.showFlash = true;
                return
            }

            var newClient = !vm.admin.id || vm.admin.id <= 0;
            vm.admin.put().then(function (resp) {
                        vm.flash =' Preferences saved successfully';
                        $timeout(function () {
                            $location.path('/dashboard');
                        }, 1500);
                    vm.showFlash = true;
                },
                function errorCallback(err) {
                    delete vm.flash;
                    vm.error = 'An error occurred saving your preferences' + '\n\r' + err.data.message;
                    vm.showFlash = true;
                });

        };

}