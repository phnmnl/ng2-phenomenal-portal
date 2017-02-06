############################################################
# Dockerfile to build PhenoMeNal Portal images
# Based on Ubuntu
############################################################
# Set the base image to Ubuntu
#FROM node:4-onbuild
FROM node:latest

# File Author / Maintainer
MAINTAINER PhenoMeNal-H2020 Project ( phenomenal-h2020-users@googlegroups.com )

#WORKDIR /code
#RUN apt-get -y update && apt-get install --no-install-recommends -y nginx git nodejs npm && \
#    npm install -g angular-cli && \
#    git clone https://github.com/phnmnl/ng2-phenomenal-portal.git . && \
#    ng build --prod && mv dist /usr/share/nginx/html && apt-get purge git npm nodejs && \
#    apt-get -y clean && apt-get -y autoremove && rm -rf /var/lib/{cache,log}/ /tmp/* /var/tmp/* && \
#    rm -rf /code

#RUN useradd --user-group --create-home --shell /bin/false app
#
#ENV APP_NAME "phenomenal-portal"
#ENV APP_USER "app"
#ENV HOME /home/$APP_USER
#ENV APP_DIR $HOME/$APP_NAME
#
#RUN npm install --global angular-cli
#
#WORKDIR $APP_DIR
#COPY package.json $APP_DIR/package.json
#RUN npm install && npm cache clean
#COPY . $APP_DIR
#RUN chown -R $APP_USER:$APP_USER $HOME/*
#
#USER $APP_USER
#WORKDIR $APP_DIR
#
#EXPOSE 3000

RUN apt-get -y update
RUN apt-get install --no-install-recommends -y nginx git
#RUN npm install npm@latest -g
RUN npm uninstall @angular/cli -g
RUN npm install rxjs -g
RUN npm cache clean
RUN npm install -g @angular/cli@latest

#Clone the project
RUN git clone https://github.com/phnmnl/ng2-phenomenal-portal.git

WORKDIR /ng2-phenomenal-portal
RUN npm install
RUN ng build --prod
RUN cp dist /usr/share/nginx/html
#Checkout webapp_jobs_branch
#RUN git checkout webapp_jobs_branch

#Go to the gui directory
#WORKDIR /RecordManager2/cz.mzk.recordmanager.webapp.gui/gui

EXPOSE 8001

#RUN npm install
CMD ["ng", "serve"]
#



