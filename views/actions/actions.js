(function () {
  'use strict';

  angular
      .module('myApp')
      .controller('Actions.IndexController', Controller);

  function Controller($location, $rootScope, AuthenticationService) {
      var vm = this;

      var links = {
          passwordreset:{url :'/passwordReset/'}
  };

    AuthenticationService.OtpLogin($location.search()['otp'], function(resp){
      if(!$rootScope.isAuthed()){
              vm.panelTitle = 'This link has already been used';
              vm.panelBody = 'Project Review links are only valid for a single use.';
              vm.okLink = '#!/login';
      }else{

          // user-booking-app
          angular.forEach(links, function(val, key){
              console.log($location.url().indexOf(key));
              console.log(key);
            if($location.url().indexOf(key) >= 0){
                console.log(val.url+$location.search()['id']);
                $location.path(val.url+$location.search()['id']);
            }
          });
      }

    })
  }

})();