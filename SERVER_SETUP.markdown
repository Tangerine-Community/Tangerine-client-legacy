Some commands used to setup tangerine/tree/robbert on Ubuntu (digital ocean server)

    sudo apt-get install ruby-dev git apache2 couchdb curl wget android-tools-adb ant help2man make gcc zlib1g-dev libssl-dev rake help2man rubygems libcurl4-openssl-dev ruby1.8-dev  apache2-prefork-dev libapr1-dev   libaprutil1-dev ruby1.9.1-dev
    sudo gem install passenger sinatra sinatra-cross_origin rest-client
    sudo vim /etc/bash.bashrc 
    sudo passenger-install-apache2-module
    sudo vim /etc/apache2/apache2.conf 
    sudo /etc/init.d/apache2 restart
    cd /var/www
    sudo mkdir tree
     cd tree/
    sudo git clone https://github.com/Tangerine-Community/tree.git
    cd tree/
    sudo mkdir public
    sudo mkdir tmp
    sudo touch tree.log
    sudo chmod 777 tree.log 
 
