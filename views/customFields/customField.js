'use strict';

angular
    .module('myApp')
    .controller('CustomField.Controller', Controller);

function Controller($scope, $window,$location,$rootScope, $stateParams, Restangular, server) {
  var vm = this;


  vm.selectedType = 'User';
  vm.back = function(){
    $window.history.back();
  };

  vm.removeOption = function(option){
    vm.customField.customFieldOptions.splice(vm.customField.customFieldOptions.indexOf(option), 1);
  };

  vm.addOption = function(){
    if(!vm.customField.customFieldOptions){
      vm.customField.customFieldOptions = [];
    }
    vm.customField.customFieldOptions.push({id:0});
  };



  vm.delete = function(){
    vm.customField.remove();
    $location.path('/customfields')
  };

  vm.init = function(){
    vm.customFieldModel = Restangular.one('customField', $stateParams.id);
    vm.customFieldModel.get().then(function(data){
      vm.customField = data;
      if(vm.customField.textArea){
        vm.customField.inputType = 'textarea';
      }else if(vm.customField.dateField){
        vm.customField.inputType = 'date';
      }else if(vm.customField.customFieldOptions){
        vm.customField.inputType = 'selection';
      }else{
        vm.customField.inputType = 'normal';
      }
    });
  };

  vm.save = function(){
      if(!$scope.panelForm.$valid){
          vm.error = 'Please check all fields are completed before saving';
          vm.showFlash = true;
          return
      }
    if(vm.customField.inputType == 'textarea'){
      vm.customField.textArea = true;
      vm.customField.dateField = false;
    }else if(vm.customField.inputType == 'date'){
      vm.customField.dateField = true;
      vm.customField.textArea = false;
    }else if(vm.customField.inputType == 'selection'){
      vm.customField.textArea = false;
      vm.customField.dateField = false;
    }else{
      vm.customField.textArea = false;
      vm.customField.dateField = false;
    }

    vm.customField.options = angular.copy(vm.customField.customFieldOptions);
    console.log(vm.customField);
    vm.customField.post().then(function(customField){
      vm.flash = vm.customField.name+' has been saved successfully';
        vm.error = null;
      vm.showFlash = true;
      vm.customField = customField;
        if ($stateParams.id == 0) {
            $location.path('/customfield/' + vm.customField.id);
        } else {
            vm.init();
        }

    });
  };


}