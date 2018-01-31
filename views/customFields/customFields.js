'use strict';

angular
    .module('myApp')
    .controller('CustomField.IndexController', Controller);

function Controller($rootScope, $scope,$timeout, $window) {
  var vm = this;
  vm.initLoad = true;
  vm.back = function(){
    $window.history.back();
  };
    vm.filter = function () {
        if(vm.isFiltering){
            return;
        }
        vm.isFiltering = true;
        var filterFields = vm.buildFilterFields();
        var filterValues = vm.buildFilterValues();
        $rootScope.CustomField.getList({
            _page: 0,
            _perPage: 10,
            _filterFields: filterFields,
            _filterValues: filterValues
        }).then(function (customFields) {
            vm.currentPage = customFields.currentPage;
            vm.customFields = customFields;
            vm.totalCount = customFields.totalCount;
            vm.numberOfElements = customFields.numberOfElements;
            $timeout(function(){
                vm.isFiltering = false;
            }, 500);
            window.scrollTo(0,0);
        });
    };

    vm.pageChanged = function (page) {
        if(vm.isFiltering){
            return;
        }
        var filterFields = vm.buildFilterFields();
        var filterValues = vm.buildFilterValues();
        $rootScope.CustomField.getList({
            _page: page,
            _perPage: 10,
            _filterFields: filterFields,
            _filterValues: filterValues,
            _sortField: vm.propertyName,
            _sortDir: (vm.reverse ? 'DESC' : 'ASC')
        }).then(function (customFields) {
            vm.currentPage = customFields.currentPage;
            vm.customFields = customFields;
            vm.isFiltering = false;
        });
    };

  vm.sortBy = function(propertyName) {
    vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
    vm.propertyName = propertyName;
      vm.filter();
  };


    vm.buildFilterFields = function () {
        var fields = [];
        if (vm.nameFilter) {
            fields.push("name");
        }
        if (vm.descriptionFilter) {
            fields.push("description");
        }
        if (vm.typeFilter) {
            fields.push("clazz");
        }
        return fields;
    };

    vm.buildFilterValues = function () {
        var values = [];
        if (vm.nameFilter) {
            values.push(vm.nameFilter);
        }
        if (vm.descriptionFilter) {
            values.push(vm.descriptionFilter);
        }
        if (vm.typeFilter) {
            values.push(vm.typeFilter);
        }


        return values;
    };

    $scope.$watch('vm.nameFilter', function (newValue, oldValue) {
        if (newValue != oldValue && $rootScope.useFieldFilter(vm.nameFilter)) {
            vm.filter();
        }
    });

    $scope.$watch('vm.descriptionFilter', function (newValue, oldValue) {
        if (newValue != oldValue && $rootScope.useFieldFilter(vm.descriptionFilter)) {
            vm.filter();
        }
    });

    $scope.$watch('vm.typeFilter', function (newValue, oldValue) {
        if (newValue != oldValue && $rootScope.useFieldFilter(vm.typeFilter)) {
            vm.filter();
        }
    });


  vm.nameFilter = null;
  vm.descriptionFilter = null;
  vm.typeFilter = null;
  vm.statusFilter = null;
  vm.propertyName = 'name';
  vm.reverse = false;
    vm.init = function(){
        window.scrollTo(0,0);
        vm.isFiltering = false;
        vm.filter();

    };

}