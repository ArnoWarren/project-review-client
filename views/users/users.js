'use strict';

angular
    .module('myApp')
    .controller('Users.IndexController', Controller);

function Controller($rootScope, $scope, $window, $timeout, $location, CustomFieldFilterService) {
  var vm = this;
    vm.randomId = 'containers-'+parseInt(Math.random() * 100000);
    vm.showJobDescriptionFilter = true;
    vm.hideSearch = false;
    $rootScope.$on('advancedUserFunctions', function(event, searchModel){
        vm.showAdvancedLinkList = true;
        vm.searchModel = searchModel;
        vm.hideSearchPossibly = true;
    });

    vm.customFieldFilterService = new CustomFieldFilterService();
    $rootScope.CustomField.get('customFieldDefinitions/User').then(function (locatedCustomFields) {
        vm.customFieldFilterService.setCustomFields(locatedCustomFields);
    });

    vm.firstNameFilter = null;
    vm.jobDescriptionFilter = null;
    vm.surnameFilter = null;
    vm.loginFilter = null;
    vm.statusFilter = 'Active';
    vm.propertyName = 'firstName';
    vm.reverse = false;
    vm.filtering = false;
    vm.setFilters = true;
  vm.back = function(){
    $window.history.back();
  };

  vm.init = function(){
      vm.currentPage = 1;
      window.scrollTo(0,0);
      $rootScope.JobDescription.getList().then(function(jobDescriptions){
          vm.jobDescriptions = jobDescriptions;
      });

  };


  vm.buildFilterFields = function(){
    var fields = [];
    if(vm.firstNameFilter){
      fields.push("firstName");
    }
    if(vm.surnameFilter){
      fields.push("surname");
    }
    if(vm.loginFilter){
      fields.push("login");
    }
    if(vm.emailFilter){
      fields.push("emailAddress");
    }
    if(vm.statusFilter){
      fields.push("userStatus.name");
    }
    if(vm.jobDescriptionFilter){
      fields.push("jobDescription.name");
    }
    vm.customFieldFilterService.checkCustomFieldFilterFields(fields);
    return fields;
  };


  vm.buildFilterValues = function(){
    var values = [];
    if($rootScope.useFieldFilter(vm.firstNameFilter)){
      values.push(vm.firstNameFilter);
    }
    if($rootScope.useFieldFilter(vm.surnameFilter)){
      values.push(vm.surnameFilter);
    }
    if($rootScope.useFieldFilter(vm.loginFilter)){
      values.push(vm.loginFilter);
    }
    if($rootScope.useFieldFilter(vm.emailFilter)){
      values.push(vm.emailFilter);
    }
    if($rootScope.useFieldFilter(vm.statusFilter)){
      values.push(vm.statusFilter);
    }

    if(vm.jobDescriptionFilter && vm.jobDescriptionFilter.id){
      values.push(vm.jobDescriptionFilter.name);
    }


    vm.customFieldFilterService.checkCustomFieldFilterValues(values);
    return values;
  };


  vm.pageChanged = function(page){
    var filterFields = vm.buildFilterFields();
    var filterValues = vm.buildFilterValues();
        $rootScope.Succession.getList({_page:page,_perPage:10,_filterFields:filterFields,_filterValues:filterValues, _sortField:vm.propertyName, _sortDir:(vm.reverse ? 'DESC' : 'ASC')}).then(function(users){
            vm.users = users;
            vm.currentPage = users.currentPage;

            window.scrollTo(0,0);
        });
  };

  vm.sortBy = function(propertyName) {
    vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
    vm.propertyName = propertyName;
      vm.filter();
  };




  vm.filter = function(){
    if(vm.isFiltering){
      return;
    }
    vm.isFiltering = true;
    var filterFields = vm.buildFilterFields();
    var filterValues = vm.buildFilterValues();

          $rootScope.Succession.getList({
              _page: 0,
              _perPage: 10,
              _filterFields: filterFields,
              _filterValues: filterValues,
              _sortField: vm.propertyName,
              _sortDir: (vm.reverse ? 'DESC' : 'ASC')
          }).then(function (users) {
              vm.users = users;
              vm.totalCount = users.totalCount;
              vm.numberOfElements = users.numberOfElements;
              vm.currentPage = users.currentPage;
              if(vm.hideSearchPossibly && vm.users.length == 0 && filterFields.length == 0){
                  vm.hideSearch = true;
              }

              $timeout(function () {
                  vm.isFiltering = false;
              }, 500);

              window.scrollTo(0, 0);
          });
  };

    $scope.$watch('vm.firstNameFilter', function(newValue, oldValue){
        if(!vm.isFiltering && newValue != oldValue && $rootScope.useFieldFilter(vm.firstNameFilter)){
            vm.filter();
        }

    });

    $scope.$watch('vm.surnameFilter', function(newValue, oldValue){
        if(!vm.isFiltering && newValue != oldValue && $rootScope.useFieldFilter(vm.surnameFilter)){
            vm.filter();
        }
    });

    $scope.$watch('vm.loginFilter', function(newValue, oldValue){
        if(!vm.isFiltering && newValue != oldValue && $rootScope.useFieldFilter(vm.loginFilter)){
            vm.filter();
        }

    });

    $scope.$watch('vm.statusFilter', function(newValue, oldValue){
        if(!vm.isFiltering && newValue != oldValue && $rootScope.useFieldFilter(vm.statusFilter)){
            vm.filter();
        }
    });

    $scope.$watch('vm.jobDescriptionFilter', function(newValue, oldValue){
        if(!vm.jobDescriptionFilter){
            vm.filter();
        }
        if(!vm.isFiltering && vm.jobDescriptionFilter && vm.jobDescriptionFilter.id){
            vm.filter();
        }
    });


    vm.showUser = function(user){
        if(!vm.showAdvancedLinkList){
            $location.path('/users/'+ user.id);
        }else{
            user.selected = !user.selected;
        }

    };


    vm.addAllFiltered = function(){
        var filterFields = vm.buildFilterFields();
        var filterValues = vm.buildFilterValues();
        vm.users = null;
        vm.searchModel.getList('addUsers',{_page:0,_perPage:10,_filterFields:filterFields,_filterValues:filterValues, _sortField:vm.propertyName, _sortDir:(vm.reverse ? 'DESC' : 'ASC')}).then(function(response){
            $rootScope.$broadcast('usersChanged');
            vm.flash = 'Users added successfully';
            vm.showFlash = true;
            vm.init();
        });

    };

    vm.addSelected = function(){
        var selected = [];
        angular.forEach(vm.users, function(container){
            if(container.selected){
                selected.push(container);
            }
        });
        vm.users = null;
        vm.searchModel.post('addUsers',selected).then(function(){
            vm.flash = selected.length +' users added successfully';
            vm.showFlash = true;
            vm.init();
            $rootScope.$broadcast('usersChanged');
        });

    };

    vm.addSelectedLocal = function(){
        var selected = [];
        angular.forEach(vm.users, function(user){
            if(user.selected){
                delete user.selected;
                selected.push(angular.copy(user));
            }
        });
        $rootScope.$broadcast('localUsersAdded', selected);
    };

    vm.addAllFilteredLocal = function(){
        var filterFields = vm.buildFilterFields();
        var filterValues = vm.buildFilterValues();
        vm.searchModel.getList('addUsers',{_page:0,_perPage:9999,_filterFields:filterFields,_filterValues:filterValues, _sortField:vm.propertyName, _sortDir:(vm.reverse ? 'DESC' : 'ASC')}).then(function(response) {
            $rootScope.$broadcast('localUsersAdded', response);
        });
    };

    vm.customFieldFilterService.init(vm.filter);
    vm.filter();

    vm.toggleStatus = function(user){
        var newStatus = $rootScope.toggleStatusFilter(user.userStatus.name);
        if(newStatus == '%ctive'){
            newStatus = 'Active';
        }
        user.one('status',newStatus).get().then(function(response){
            vm.users[vm.users.indexOf(user)].userStatus = response.userStatus;
        });
    }
}