'use strict';

angular
    .module('myApp')
    .controller('Project.Controller', Controller);

function Controller($uibModal, $window,$timeout,$rootScope, $scope,$location, $stateParams, Restangular, $sce, $http, server, $localStorage) {
  var vm = this;
  vm.loadData = function(){
      Restangular.one('admin/user/'+vm.project.user.id+'/jobDescription').get().then(function(data){
          vm.prProject.jobDescription = data;
          vm.customFieldValues = vm.prProject.customFieldValues;
      });
  };

    vm.init = function () {
        if($stateParams.userId){
            Restangular.one('pr/prProject/projectsForUser',$stateParams.userId).get().then(function(data){
                vm.project = data;
                vm.prProjectModel = Restangular.one('admin/user',vm.project.user.id);
                vm.prProjectModel.get().then(function (data) {
                    vm.prProject = data;
                    vm.loadData();

                });


            });
        }else{

            Restangular.one('pr/prProject',$stateParams.id).get().then(function(data){
                vm.project = data;
                vm.prProjectModel = Restangular.one('admin/user',vm.project.user.id);
                vm.prProjectModel.get().then(function (data) {
                    vm.prProject = data;
                    vm.loadData();

                });


            });
        }


    };

    vm.save = function(){
        delete vm.prProject.permissionsProfiles;
        vm.prProject.put().then(function (resp) {
            vm.project.put().then(function (resp) {
                Restangular.one('tm/jobrole/history/'+$stateParams.id).get().then(function(data){
                    vm.previousJobRoles = data;
                });
                vm.flash = 'Succession plan for '+vm.prProject.firstName + ' ' + vm.prProject.surname + ' has been saved successfully';
                vm.error = null;
                vm.showFlash = true;
            });
        });
    }
}

