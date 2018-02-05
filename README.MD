# AngularJS project for a Project Review client interface
Install
    install NodeJS
        https://nodejs.org/en/download/
    install Bower (npm is provided by NodeJS)
        npm install -g bower
    intall dependencies
        cd project-review-client
        bower install
    install apache24
        https://www.apachelounge.com/download/VC15/binaries/httpd-2.4.29-Win64-VC15.zip 
    
Configuration

    Apache 
        edit httpd.conf
        Add alias and directory (note / on both windows and *nix) to bottom of apache2.conf or httpd.conf
        
        Alias /project-review "{PATH}/project-review-client/app/"
        <Directory "{PATH}/project-review-client/app">
            Order allow,deny
            Allow from all
        </Directory>
        restart apache service
        

    Check server configuration in app/systemConfig.js
    Testing server
        https://testing.thekhub.com
    Production
        https://knowhow.training
        
        
Open browser and point to 
    http://localhost/project-review        
