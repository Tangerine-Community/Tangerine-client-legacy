Some commands used to setup tangerine/tree/robbert

 7877  sudo apt-get install ruby-dev git apache2 couchdb curl wget
 7882  sudo apt-get install android-tools-adb ant help2man make gcc zlib1g-dev libssl-dev rake help2man rubygems libcurl4-openssl-dev ruby1.8-dev  apache2-prefork-dev libapr1-dev   libaprutil1-dev ruby1.9.1-dev
 7883  sudo gem install passenger
 7884  sudo vim /etc/bash.bashrc 
 7888  sudo passenger-install-apache2-module
 7890  sudo vim /etc/apache2/apache2.conf 
 7891  sudo /etc/init.d/apache2 restart
 7892  cd /var/www
 7896  sudo mkdir tree
 7897  cd tree/
 7901  sudo git clone https://github.com/Tangerine-Community/tree.git
 7902  cd tree/
 7905  sudo mkdir public
 7906  sudo mkdir tmp
 7911  sudo gem install sinatra sinatra-cross_origin rest-client
 7918  sudo touch tree.log
 7921  sudo chmod 777 tree.log 
 
