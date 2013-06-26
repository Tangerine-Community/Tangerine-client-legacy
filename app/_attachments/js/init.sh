if [ ! -d "min" ]; then
  mkdir min
else
  rm min/*
fi
rm lib.js app.js
./uglify.rb `find ./modules -name "*.js"`
./uglify.rb `ls *.js`
./uglify.rb lib
./uglify.rb app