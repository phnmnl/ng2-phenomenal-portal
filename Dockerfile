FROM ubuntu:14.04

MAINTAINER PhenoMeNal-H2020 Project ( phenomenal-h2020-users@googlegroups.com )

WORKDIR /code
RUN apt-get -y update && apt-get install --no-install-recommends -y nginx git nodejs npm && \
    npm install -g angular-cli && \
    git clone https://github.com/phnmnl/ng2-phenomenal-portal.git . && \
    ng build --prod && mv dist /usr/share/nginx/html && apt-get purge git npm nodejs && \
    apt-get -y clean && apt-get -y autoremove && rm -rf /var/lib/{cache,log}/ /tmp/* /var/tmp/* && \
    rm -rf /code

EXPOSE 80



