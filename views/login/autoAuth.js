(function () {
  'use strict';

  angular
      .module('myApp')
      .controller('Login.AutoAuthController', Controller);

  function Controller($http,$stateParams, $rootScope, server, $location, $localStorage) {
    $rootScope.loadToolTips();
  }

})();