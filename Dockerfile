# Android development environment based on Ubuntu 14.04 LTS.
# version 0.0.1

# Start with Ubuntu 14.04 LTS.
FROM ubuntu:14.04
# Never ask for confirmations
ENV DEBIAN_FRONTEND noninteractive
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

# Install some core utilities
RUN apt-get update && apt-get -y install \
    software-properties-common \
    python-software-properties \
    bzip2 unzip \
    openssh-client \
    git \
    lib32stdc++6 \
    lib32z1 \
    curl \
    wget

RUN curl -sL https://deb.nodesource.com/setup_4.x | bash -
RUN apt-get -y install nodejs

# install nginx
RUN apt-get -y install nginx

# get top to work
RUN echo -e "\nexport TERM=xterm" >> ~/.bashrc

# Install jdk7
# RUN apt-get -y install oracle-java7-installer
RUN apt-get update && apt-get -y install default-jdk

# Installs Android SDK
ENV ANDROID_SDK_FILENAME android-sdk_r24.4.1-linux.tgz
ENV ANDROID_SDK_URL http://dl.google.com/android/${ANDROID_SDK_FILENAME}
ENV ANDROID_API_LEVELS android-15,android-16,android-17,android-18,android-19,android-20,android-21,android-22,android-23
ENV ANDROID_BUILD_TOOLS_VERSION 23.0.3
ENV ANDROID_HOME /opt/android-sdk-linux
ENV PATH ${PATH}:${ANDROID_HOME}/tools:${ANDROID_HOME}/platform-tools
RUN cd /opt && \
    wget -q ${ANDROID_SDK_URL} && \
    tar -xzf ${ANDROID_SDK_FILENAME} && \
    rm ${ANDROID_SDK_FILENAME} && \
    echo y | android update sdk --no-ui -a --filter tools,platform-tools,${ANDROID_API_LEVELS},build-tools-${ANDROID_BUILD_TOOLS_VERSION}

RUN echo y | android update sdk --no-ui --all --filter 137

RUN npm update && \
    npm install -g npm && \
    npm install -g cordova && \
    cd /tmp && \
    cordova create fakeapp && \
    cd /tmp/fakeapp && \
    cordova platform add android && \
    cordova plugin add cordova-plugin-crosswalk-webview && \
    cordova build android && \
    cd

ADD ./ /code
ARG assessments
ARG groupUrl
RUN echo ${assessments} >> /code/src/assessments.json
RUN echo ${groupUrl} >> /code/src/groupUrl
RUN cd /code && npm run build:apk  
RUN mv /code/build/android/build.apk /var/www/
RUN echo '<html><body><a href="./build.apk">Download</a></body></html>' >> /var/www/index.html

EXPOSE 80
ENTRYPOINT tail -f /var/log/nginx/access.log 
