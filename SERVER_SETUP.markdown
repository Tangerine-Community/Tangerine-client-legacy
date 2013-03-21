Some commands used to setup tangerine/tree/robbert on Ubuntu (digital ocean server)

Setup apache with passenger:

    sudo apt-get install ruby-dev git apache2 couchdb curl wget android-tools-adb ant help2man make gcc zlib1g-dev libssl-dev rake help2man rubygems libcurl4-openssl-dev ruby1.8-dev  apache2-prefork-dev libapr1-dev   libaprutil1-dev ruby1.9.1-dev
    sudo gem install passenger sinatra sinatra-cross_origin rest-client
    sudo vim /etc/bash.bashrc 
    sudo passenger-install-apache2-module
    sudo vim /etc/apache2/apache2.conf 
    sudo a2enmod proxy
    sudo a2enmod proxy_http
    
Stuff appended to /etc/apache2/apache2.conf 

    LoadModule passenger_module /var/lib/gems/1.9.1/gems/passenger-3.0.19/ext/apache2/mod_passenger.so
    PassengerRoot /var/lib/gems/1.9.1/gems/passenger-3.0.19
    PassengerRuby /usr/bin/ruby1.9.1

    <VirtualHost *:80>
        ServerName tree.tangerinecentral.org
        DocumentRoot /var/www/tree/public
        <Directory /var/www/tree/public>
            Allow from all
            Options -MultiViews
        </Directory>
    </VirtualHost>

    <VirtualHost *:80>
        ServerName robbert.tangerinecentral.org
        DocumentRoot /var/www/robbert
        <Directory /var/www/robbert>
            Allow from all
        </Directory>
    </VirtualHost>

    <VirtualHost *:80>
        ServerName databases.tangerinecentral.org
        ServerAdmin webmaster@dummy-host.example.com
        DocumentRoot "/var/www/databases"
        AllowEncodedSlashes On
        ProxyRequests Off
        KeepAlive Off
        <Proxy *>
            Allow from all
        </Proxy>
        ProxyPass / http://localhost:5984/ nocanon
        ProxyPassReverse / http://localhost:5984/
    </VirtualHost>


Setup tree:

    cd /var/www
    sudo git clone https://github.com/Tangerine-Community/tree.git
    cd tree/
    sudo mkdir public
    sudo mkdir tmp
    sudo touch tree.log
    sudo chmod 777 tree.log 
    cd /var/www

Setup robbert:

    sudo git clone git://github.com/Tangerine-Community/robbert.git
    sudo cp Config.sample.php Config.php
    sudo vim Config.php

Restart apache:

    sudo /etc/init.d/apache2 restart
