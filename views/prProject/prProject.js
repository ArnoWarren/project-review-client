'use strict';

angular
    .module('myApp')
    .controller('Project.Controller', Controller);

function Controller($uibModal, $window,$timeout,$rootScope, $scope,$location, $stateParams, Restangular, $sce, $http, server, $localStorage) {
  var vm = this;
    vm.init = function () {
        if($stateParams.id){
            Restangular.one('/pr/project',$stateParams.id).get().then(function(data){
                vm.prProject = data;
                console.log(vm.prProject.projectDirector)
            });
        }else{

            Restangular.one('/pr/project',0).get().then(function(data){
                vm.prProject = data;

            });
        }


    };

    vm.save = function(){
        delete vm.prProject.permissionsProfiles;
        vm.prProject.put().then(function (resp) {
            vm.project.put().then(function (resp) {
                vm.flash = 'Project '+vm.prProject.name + ' has been saved successfully';
                vm.error = null;
                vm.showFlash = true;
            });
        });
    }
}

