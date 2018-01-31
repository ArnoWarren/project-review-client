'use strict';

angular
    .module('myApp')
    .controller('Client.Controller', Controller);

function Controller($uibModal, $window,$timeout,$rootScope, $scope,$location, $stateParams, Restangular, $sce, $http, server, $localStorage) {
  var vm = this;
  vm.loadData = function(){
      Restangular.one('admin/user/'+vm.succession.user.id+'/jobDescription').get().then(function(data){
          vm.prClient.jobDescription = data;
          vm.customFieldValues = vm.prClient.customFieldValues;
      });
  };

    vm.init = function () {
        if($stateParams.userId){
            Restangular.one('pr/client/clientsForUser',$stateParams.userId).get().then(function(data){
                vm.succession = data;
                vm.prClientModel = Restangular.one('admin/user',vm.succession.user.id);
                vm.prClientModel.get().then(function (data) {
                    vm.prClient = data;
                    vm.loadData();

                });


            });
        }else{

            Restangular.one('pr/client',$stateParams.id).get().then(function(data){
                vm.succession = data;
                vm.prClientModel = Restangular.one('admin/user',vm.succession.user.id);
                vm.prClientModel.get().then(function (data) {
                    vm.prClient = data;
                    vm.loadData();

                });


            });
        }


    };

    vm.loadJobDescriptions = function(search){
        if(search){
            $rootScope.JobDescription.getList({_page:0,_perPage:100, _filterFields:'name',_filterValues:search}).then(function(jobDescriptions){
                vm.jobDescriptions = jobDescriptions;
            });

        }
    };

    vm.addQuickNote = function(){
        $rootScope.QuickNote.post({user:vm.succession.user, note:vm.quickNoteComment}).then(function(quickNote){
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

    vm.loadUsers = function(term){
        if(term.search){
            Restangular.one($rootScope.userSearchURL+term.search).get().then(function(users){
                vm.prClients = users;
            })

        }
    };

    vm.save = function(){
        delete vm.prClient.permissionsProfiles;
        vm.prClient.put().then(function (resp) {
            vm.succession.put().then(function (resp) {
                Restangular.one('tm/jobrole/history/'+$stateParams.id).get().then(function(data){
                    vm.previousJobRoles = data;
                });
                vm.flash = 'Succession plan for '+vm.prClient.firstName + ' ' + vm.prClient.surname + ' has been saved successfully';
                vm.error = null;
                vm.showFlash = true;
            });
        });
    }
}

