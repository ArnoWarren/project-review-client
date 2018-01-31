'use strict';
angular
    .module('myApp')
    .factory('UsersMemberService', ['$http', '$rootScope', '$timeout', 'Restangular',
        function ($http, $rootScope, $timeout, Restangular) {
            // USER CRUD STUFF
            function UsersMemberService(ownerObject){
                this.readOnly = false;
                this.users = [];
                this.ownerObject = ownerObject;
                this.userCurrentPage = 0;
                this.usersPropertyName = 'surname';
                this.usersReverse = false;
                this.usersTotalCount = 0;
                this.firstNameFilter = null;
                this.surnameFilter = null;
                this.loginFilter = null;
                this.emailFilter = null;
                this.statusFilter = null;
                this.userFiltering = false;
                this.addedUsers = [];
                this.removedUsers = [];
            }


            // Hooks for custom field filtering service if available
            UsersMemberService.prototype.checkCustomFieldFilterFields = function (fields) {};
            UsersMemberService.prototype.checkCustomFieldFilterValues = function (fields) {};

            UsersMemberService.prototype.userResponseFormatter = $rootScope.userResponseFormatter;

            UsersMemberService.prototype.addUser = function (instance, user) {
                if (user && user.originalObject) {
                    if (!instance.users) {
                        instance.users = [];
                    }
                    instance.addedUsers.push(user.originalObject);
                    instance.users.push(user.originalObject);

                    if (!instance.users.usersTotalCount) {
                        instance.users.usersTotalCount = 0;
                    }

                    instance.users.usersTotalCount = instance.users.usersTotalCount + 1;
                    instance.users.totalCount = instance.users.totalCount + 1;
                    console.log(instance.users);
                }
            };

            UsersMemberService.prototype.removeUser = function (user) {
                this.usersTotalCount = this.usersTotalCount - 1;
                this.removedUsers.push(user);
                this.users.splice(this.users.indexOf(user), 1);
            };

            UsersMemberService.prototype.updateUsers = function (altAddMethod, altDelMethod) {
                if (!this.ownerObject) {
                    console.log('Unable to update user members without an owner');
                    return;
                }

                if (this.removedUsers.length > 0) {
                    Restangular.one(this.ownerObject.route, this.ownerObject.id).post(altDelMethod ? altDelMethod : "removeUsers", this.removedUsers);
                }
                if (this.addedUsers.length > 0) {
                    Restangular.one(this.ownerObject.route, this.ownerObject.id).post(altAddMethod ? altAddMethod : "addUsers", this.addedUsers);
                }
                this.addedUsers = [];
                this.removedUsers = [];
                this.userFilter();
            };


            UsersMemberService.prototype.buildUserFilterFields = function () {

                var fields = [];
                if (this.firstNameFilter) {
                    fields.push("firstName");
                }
                if (this.surnameFilter) {
                    fields.push("surname");
                }
                if (this.loginFilter) {
                    fields.push("login");
                }
                if (this.emailFilter) {
                    fields.push("email");
                }
                if (this.statusFilter) {
                    fields.push("userStatus.name");
                }

                this.checkCustomFieldFilterFields(fields);

                return fields;
            };
            UsersMemberService.prototype.buildUserFilterValues = function () {
                var values = [];

                if ($rootScope.useFieldFilter(this.firstNameFilter)) {
                    values.push(this.firstNameFilter);
                }
                if ($rootScope.useFieldFilter(this.surnameFilter)) {
                    values.push(this.surnameFilter);
                }
                if ($rootScope.useFieldFilter(this.loginFilter)) {
                    values.push(this.loginFilter);
                }
                if ($rootScope.useFieldFilter(this.emailFilter)) {
                    values.push(this.emailFilter);
                }
                if ($rootScope.useFieldFilter(this.statusFilter)) {
                    values.push(this.statusFilter);
                }

                this.checkCustomFieldFilterValues(values);

                return values;
            };
            UsersMemberService.prototype.usersPageChanged = function (instance, page) {
                if(instance.loading){
                    return;
                }
                var filterFields = this.buildUserFilterFields();
                var filterValues = this.buildUserFilterValues();
                this.ownerObject.getList("users", {
                    _page: page,
                    _perPage: 10,
                    _filterFields: filterFields,
                    _filterValues: filterValues,
                    _sortField:this.usersPropertyName,
                    _sortDir:(this.usersReverse ? 'DESC' : 'ASC')
                }).then(function (usersResponse) {
                    instance.users = usersResponse;
                    instance.userCurrentPage = usersResponse.pageNumber;
                });
            };

            UsersMemberService.prototype.userSortBy = function (propertyName) {
                this.usersReverse = (this.usersPropertyName === propertyName) ? !this.usersReverse : false;
                this.usersPropertyName = propertyName;
            };

            UsersMemberService.prototype.userFilter = function (instance) {
                if(!instance){
                    console.log('no userMemberInstance supplied!');
                    return;
                }
                if (!this.ownerObject) {
                    console.log('no object owner defined!');
                    return;
                }
                if (!this.ownerObject.id) {
                    return;
                }
                instance.loading = true;
                var filterFields = this.buildUserFilterFields();
                var filterValues = this.buildUserFilterValues();

                this.ownerObject.getList(this.altPath ? this.altPath : "users", {
                    _page: 1,
                    _perPage: 10,
                    _filterFields: filterFields,
                    _filterValues: filterValues,
                    _sortField:this.usersPropertyName,
                    _sortDir:(this.usersReverse ? 'DESC' : 'ASC')
                }).then(function (usersResponse) {
                    instance.users = usersResponse;
                    instance.userCurrentPage = usersResponse.pageNumber;
                    instance.usersTotalCount = usersResponse.totalCount;
                    instance.usersNumberOfElements = usersResponse.numberOfElements;
                    $timeout(function(){
                        instance.loading = false;
                    });

                });
            };
            return UsersMemberService;
        }])
    .factory('authInterceptor', ['$log', function($location) {
        var authInterceptor = {
            response: function (response) {
                if (response.status == 403) {
                    originalURL = $location.url();
                    $location.path('/login');
                }
                else {
                    return response;
                }

            }
        };
        return authInterceptor;
    }]).directive('datetimepickerNeutralTimezone', function() {
    return {
        restrict: 'A',
        priority: 1,
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            ctrl.$formatters.push(function (value) {
                var date = new Date(Date.parse(value));
                date = new Date(date.getTime() + (60000 * date.getTimezoneOffset()));
                return date;
            });

            ctrl.$parsers.push(function (value) {
                var date = new Date(value.getTime() - (60000 * value.getTimezoneOffset()));
                return date;
            });
        }
    };
})
    .factory('AuthenticationService', Service)
    .factory('CustomFieldFilterService', ['$rootScope',function ($rootScope) {
        function CustomFieldFilterService() {
        }
        CustomFieldFilterService.customFields = [];
        CustomFieldFilterService.customFieldFilters = [];

        CustomFieldFilterService.prototype.filter = function () {};

        CustomFieldFilterService.prototype.unSetCustomFieldFilterOption = function (customField) {
            var key = 'cf_' + customField.id;
            if(this.customFieldFilters){
                delete this.customFieldFilters[key];
            }

        };

        CustomFieldFilterService.prototype.setCustomFieldFilterOption = function (item, customField) {
            if (item && item.value) {
                var key = 'cf_' + customField.id;
                this.customFieldFilters[key] = item.value;
            } else {
                this.unSetCustomFieldFilterOption(customField);
            }
            this.filter();
        };

        CustomFieldFilterService.prototype.checkCustomFieldFilterFields = function (fields) {
            for (var property in this.customFieldFilters) {
                fields.push(property);
            }
            return fields;
        };

        CustomFieldFilterService.prototype.getCustomFields = function(){
            return this.customFields;
        };
        CustomFieldFilterService.prototype.checkCustomFieldFilterValues = function (values) {
            for (var property in this.customFieldFilters) {
                values.push(this.customFieldFilters[property])
            }
            return values;
        };

        CustomFieldFilterService.prototype.setCustomFields = function (customFields) {
            this.customFields = customFields;
        };

        CustomFieldFilterService.prototype.init = function (callback) {
            this.filter = callback;
        };

        return CustomFieldFilterService;
    }])
    .service('customFieldFilterService', ['$rootScope',function ($rootScope) {
        function service() {
        }
        service.filter = function () {};
        service.customFields = [];
        service.customFieldFilters = [];

        service.init = function(){
            service.customFields = [];
            service.customFieldFilters = [];
            return service;
        };

        service.unSetCustomFieldFilterOption = function (customField) {
            var key = 'cf_' + customField.id;
            delete service.customFieldFilters[key];
        };

        service.setCustomFieldFilterOption = function (item, customField) {
            if (item && item.value) {
                var key = 'cf_' + customField.id;
                service.customFieldFilters[key] = item.value;
            } else {
                service.unSetCustomFieldFilterOption(customField);
            }
            service.filter();
        };

        service.checkCustomFieldFilterFields = function (fields) {
            for (var property in service.customFieldFilters) {
                fields.push(property);
            }
            return fields;
        };

        service.checkCustomFieldFilterValues = function (values) {
            for (var property in service.customFieldFilters) {
                values.push(service.customFieldFilters[property])
            }
            return values;
        };

        service.load = function (type, callback) {
            service.filter = callback;
            $rootScope.CustomField.get('customFieldDefinitions/' + type).then(function (customFields) {
                service.customFields = customFields;
                service.filter();
            }, function () {
                service.filter();
            });
        };

        return service;
    }])
    .filter('wordCounter', function () {
        return function (value) {
            if (value && (typeof value === 'string')) {
                return value.trim().split(/\s+/).length;
            } else {
                return 0;
            }
        };
    });