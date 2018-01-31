function config($stateProvider, $urlRouterProvider, $httpProvider, $resourceProvider) {
    // default route
    $httpProvider.interceptors.push('authInterceptor');
    $urlRouterProvider.otherwise("/");
    $resourceProvider.defaults.stripTrailingSlashes = true;

    // app routes
    $stateProvider
        .state('actions', {
            url: '/actions/{function}',
            templateUrl: 'views/actions/index.html',
            controller: 'Actions.IndexController',
            controllerAs: 'vm'
        })
        .state('passwordReset', {
            url: '/passwordReset/{id}',
            templateUrl: 'views/dashboard/dashboard.html',
            controller: 'Dashboard.IndexController',
            controllerAs: 'vm',
            ncyBreadcrumb: {
                label: 'Home'
            },
            resolve: {
                load: function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'Dashboard.IndexController',
                        files: ['views/dashboard/dashboard.js']

                    });
                }
            }
        })
        .state('home', {
            url: '/',
            templateUrl: 'views/dashboard/dashboard.html',
            controller: 'Dashboard.IndexController',
            controllerAs: 'vm',
            ncyBreadcrumb: {
                label: 'Home'
            },
            resolve: {
                load: function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'Dashboard.IndexController',
                        files: ['views/dashboard/dashboard.js']

                    });
                }
            }
        })
        .state('autoAuth', {
            url: '/aauth',
            templateUrl: 'views/login/autoAuth.html',
            controller: 'Login.AutoAuthController',
            controllerAs: 'vm'
        })

        .state('system', {
            url: '/system',
            templateUrl: 'views/system/systemIndex.html',
            controller: 'System.IndexController',
            controllerAs: 'vm',
            ncyBreadcrumb: {
                label: 'Preferences'
            }
        })

        .state('admin', {
            url: '/admin',
            templateUrl: 'views/admin/admin.html',
            controller: 'Admin.Controller',
            controllerAs: 'vm',
            ncyBreadcrumb: {
                label: 'Administration'
            }, resolve: {
                load: function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'Admin.Controller',
                        files: ['views/admin/admin.js']

                    });
                }
            }
        })

        .state('clients', {
            url: '/clients',
            templateUrl: 'views/prClient/prClients.html',
            controller: 'Clients.IndexController',
            controllerAs: 'vm',
            ncyBreadcrumb: {
                label: 'Clients'
            }, resolve: {
                load: function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'Clients.IndexController',
                        files: ['views/prClient/prClients.js']

                    });
                }
            }
        })
        .state('client', {
            url: '/clients/{id}',
            templateUrl: 'views/prClient/prClient.html',
            controller: 'Clients.Controller',
            controllerAs: 'vm',
            ncyBreadcrumb: {
                parent: 'clients',
                label: '{{vm.client.name}}'
            }, resolve: {
                load: function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'Clients.Controller',
                        files: ['views/prClient/prClient.js']

                    });
                }
            }
        })

        .state('projects', {
            url: '/projects',
            templateUrl: 'views/prProject/prProjects.html',
            controller: 'Projects.IndexController',
            controllerAs: 'vm',
            ncyBreadcrumb: {
                label: 'Projects'
            }, resolve: {
                load: function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'Projects.IndexController',
                        files: ['views/prProject/prProjects.js']

                    });
                }
            }
        })
        .state('project', {
            url: '/projects/{id}',
            templateUrl: 'views/prProject/prProject.html',
            controller: 'Projects.Controller',
            controllerAs: 'vm',
            ncyBreadcrumb: {
                parent: 'projects',
                label: '{{vm.project.name}}'
            }, resolve: {
                load: function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'Projects.Controller',
                        files: ['views/prProject/prProject.js']

                    });
                }
            }
        })


        .state('login', {
            url: '/login',
            templateUrl: 'views/login/login.html',
            controller: 'Login.IndexController',
            controllerAs: 'vm'
        });
}