'use strict';

angular
    .module('myApp')
    .controller('Dashboard.IndexController', Controller);

function Controller($rootScope,$location, $localStorage,$http,server, Upload,$timeout,AuthenticationService) {
  var vm = this;


  vm.init = function() {
      window.scrollTo(0, 0);

      if($location.path().contains('/passwordReset')){
          $rootScope.showInfoPanel = true;
          $rootScope.forgottenPassword = true;
          $rootScope.showPasswordResetForm = true;
      }

      $http.get(server.uri + '/pr/project/headline?JSON_CALLBACK=cb').then(function (resp) {
          vm.projectCount = resp.data.payload.count;
          vm.recentProjectsUpdates = resp.data.payload.recent;
      }, function (err) {
      });
      $http.get(server.uri + '/pr/client/headline?JSON_CALLBACK=cb').then(function (resp) {
          vm.clientsCount = resp.data.payload.count;
          vm.recentClientsUpdated = resp.data.payload.recent;
      }, function (err) {
      });
      $http.get(server.uri + '/pr/notification/headline?JSON_CALLBACK=cb').then(function (resp) {
          vm.notificationCount = resp.data.payload.count;
          vm.recentNotificationUpdated = resp.data.payload.numberOfElements;
      }, function (err) {
      });


  };


  vm.deleteMessage = function(message){
    $http.get(server.uri+'/tm/notification/remove/'+message.id+'?JSON_CALLBACK=cb').then(function(resp){
      vm.recentNotificationUpdated.splice(vm.recentNotificationUpdated.indexOf(message), 1);
    });
  };
    vm.addQuickNote = function(){
        $rootScope.QuickNote.post({user:vm.quickNoteUser, note:vm.quickNoteComment}).then(function(quickNote){
            quickNote.show = true;
            vm.recentTalentNotesUpdated.unshift(quickNote);
            vm.talentNoteCount++;
            delete vm.quickNoteUser;
            delete vm.quickNoteComment;
        });
    };
  vm.deleteTalentNote = function(talentNote){
      $http.delete(server.uri + '/tm/talentNote/'+talentNote.id+'?JSON_CALLBACK=cb').then(function(){
          vm.recentTalentNotesUpdated.splice(vm.recentTalentNotesUpdated.indexOf(talentNote),1);
          vm.talentNoteCount--  ;
    })
  };

}