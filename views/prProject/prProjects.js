'use strict';

angular
    .module('myApp')
    .controller('Projects.IndexController', Controller);

function Controller($rootScope, $scope, $window, $timeout,$location, CustomFieldFilterService) {
    var vm = this;
    vm.randomId = 'prProjects-'+parseInt(Math.random() * 100000);

    vm.back = function(){
        $window.history.back();
    };
    vm.init = function(){
        vm.title = 'Manage Projects';
        window.scrollTo(0,0);
        vm.prProjects = [];
    };

    vm.buildFilterFields = function(){
        var fields = [];
        if(vm.nameFilter){
            fields.push("name");
        }
        if(vm.descriptionFilter){
            fields.push("description");
        }
        if(vm.statusFilter){
            fields.push("status");
        }
        return fields;
    };

    vm.buildFilterValues = function(){
        var values = [];
        if($rootScope.useFieldFilter(vm.nameFilter)){
            values.push(vm.nameFilter);
        }
        if($rootScope.useFieldFilter(vm.descriptionFilter)){
            values.push(vm.descriptionFilter);
        }
        if($rootScope.useFieldFilter(vm.statusFilter)){
            values.push(vm.statusFilter);
        }
        return values;
    };


    vm.pageChanged = function(page){
        if(vm.isFiltering){
            return;
        }
        var filterFields = vm.buildFilterFields();
        var filterValues = vm.buildFilterValues();
        $rootScope.Project.getList({_page:page,_perPage:10,_filterFields:filterFields,_filterValues:filterValues, _sortField:vm.propertyName, _sortDir:(vm.reverse ? 'DESC' : 'ASC')}).then(function(prProjects){
            vm.prProjects = prProjects;
            vm.currentPage = prProjects.currentPage;
            vm.isFiltering = false;
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
        $rootScope.Project.getList({_page:0,_perPage:10,_filterFields:filterFields,_filterValues:filterValues, _sortField:vm.propertyName, _sortDir:(vm.reverse ? 'DESC' : 'ASC')}).then(function(prProjects){
            vm.currentPage = prProjects.currentPage;
            vm.prProjects = prProjects;
            vm.totalCount = prProjects.totalCount;
            vm.numberOfElements = prProjects.numberOfElements;
            $timeout(function(){
                vm.isFiltering = false;
            }, 500);

        });
    };

    vm.nameFilter = null;
    vm.descriptionFilter = null;
    vm.typeFilter = null;
    vm.statusFilter = null;
    vm.propertyName = 'name';
    vm.reverse = false;
    vm.filtering = false;

    $scope.$watch('vm.nameFilter', function(newValue, oldValue){
        if(newValue != oldValue && $rootScope.useFieldFilter(vm.nameFilter)){
            vm.filter();
        }
    });

    $scope.$watch('vm.descriptionFilter', function(newValue, oldValue){
        if(newValue != oldValue && $rootScope.useFieldFilter(vm.descriptionFilter)) {
            vm.filter();
        }
    });

    $scope.$watch('vm.typeFilter', function(newValue, oldValue){
        if(newValue != oldValue && $rootScope.useFieldFilter(vm.typeFilter)) {
            vm.filter();
        }
    });

    $scope.$watch('vm.statusFilter', function(newValue, oldValue){
        if(newValue != oldValue && $rootScope.useFieldFilter(vm.statusFilter)) {
            vm.filter();
        }
    });


    vm.toggleProject = function(clients){
        clients.selected = !clients.selected;
    };

    vm.addAllFilteredParents = function(){
        var filterFields = vm.buildFilterFields();
        var filterValues = vm.buildFilterValues();
        vm.prProjects = null;
        vm.searchModel.getList('addParents',{_page:0,_perPage:10,_filterFields:filterFields,_filterValues:filterValues, _sortField:vm.propertyName, _sortDir:(vm.reverse ? 'DESC' : 'ASC')}).then(function(response){
            $rootScope.$broadcast('parentProjectsChanged');
            vm.flash = 'Parent courses added successfully';
            vm.error = null;
            vm.showFlash = true;
            vm.reInit();
        });

    };

    vm.addAllFiltered = function(endpoint){
        var filterFields = vm.buildFilterFields();
        var filterValues = vm.buildFilterValues();
        vm.prProjects = null;
        vm.searchModel.getList(endpoint,{_page:0,_perPage:10,_filterFields:filterFields,_filterValues:filterValues, _sortField:vm.propertyName, _sortDir:(vm.reverse ? 'DESC' : 'ASC')}).then(function(response){
            $rootScope.$broadcast('childProjectsChanged');
            $rootScope.$broadcast('prProjectsChanged');
            vm.flash = 'Courses added successfully';
            vm.error = null;
            vm.showFlash = true;
            vm.reInit();
        });

    };

    vm.addSelectedChildren = function(endpoint){
        var selected = [];
        angular.forEach(vm.prProjects, function(clients){
            if(clients.selected){
                selected.push(clients);
            }
        });
        vm.prProjects = null;
        vm.searchModel.post(endpoint,selected).then(function(){
            vm.flash = selected.length +' courses added successfully';
            vm.error = null;
            vm.showFlash = true;
            vm.reInit();
            $rootScope.$broadcast('childProjectsChanged');
            $rootScope.$broadcast('prProjectsChanged');

        });

    };

    vm.addSelectedProjects = function(){
        var selected = [];
        angular.forEach(vm.prProjects, function(clients){
            if(clients.selected){
                selected.push(clients);
            }
        });
        vm.prProjects = null;
        vm.searchModel.post('addProjects',selected).then(function(){
            vm.flash = selected.length +' courses added successfully';
            vm.error = null;
            vm.showFlash = true;
            vm.reInit();
            $rootScope.$broadcast('childProjectsChanged');
            $rootScope.$broadcast('prProjectsChanged');
        });

    };

    vm.showProject = function(clients){
        if(!vm.showAdvancedLinkList){
            $location.path('/prProjects/'+ clients.id);
        }else{
            clients.selected = !clients.selected;
        }

    };



    vm.addSelectedParents = function(){
        var selected = [];
        angular.forEach(vm.prProjects, function(clients){
            if(clients.selected){
                selected.push(clients);
            }
        });
        vm.prProjects = null;
        vm.searchModel.post('addParents',selected).then(function(){
            vm.flash = selected.length +' parent courses added successfully';
            vm.error = null;
            vm.showFlash = true;
            vm.reInit();
            $rootScope.$broadcast('parentProjectsChanged');
        });

    };

    vm.reInit = function(){
        vm.nameFilter = null;
        vm.descriptionFilter = null;
        vm.typeFilter = null;
        vm.statusFilter = 'ACTIVE';
        vm.propertyName = 'name';
        vm.reverse = false;
        vm.filtering = false;
        vm.filter();
    };

    vm.filter();

    vm.toggleStatus = function(clients){
        var newStatus = $rootScope.toggleStatusFilter(clients.clientsStatus.name);
        if(newStatus == '%ACTIVE'){
            newStatus = 'ACTIVE';
        }
        clients.one('status',newStatus).get().then(function(response){
            vm.prProjects[vm.prProjects.indexOf(clients)].clientsStatus = response.clientsStatus;
        });
    }


    vm.addSelectedLocal = function(){
        var selected = [];
        angular.forEach(vm.prProjects, function(clients){
            if(clients.selected){
                delete clients.selected;
                selected.push(angular.copy(clients));
            }
        });
        $rootScope.$broadcast('localProjectsAdded', selected);
    };

    vm.addAllFilteredLocal = function(){
        var filterFields = vm.buildFilterFields();
        var filterValues = vm.buildFilterValues();
        vm.searchModel.getList('addProjects',{_page:0,_perPage:9999,_filterFields:filterFields,_filterValues:filterValues, _sortField:vm.propertyName, _sortDir:(vm.reverse ? 'DESC' : 'ASC')}).then(function(response) {
            $rootScope.$broadcast('localProjectsAdded', response);
        });
    };
}