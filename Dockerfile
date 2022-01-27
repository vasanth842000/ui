FROM node:10

# Install nginx
RUN apt-get update \
  && apt-get install -y nginx --no-install-recommends \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN npm install -g cross-env

# We copy the code from the docker-compose-yml
# RUN git clone https://gitlab.com/dxperts1/dxperts-ui.git /dxperts-ui
CMD mkdir /dxperts-ui
WORKDIR /dxperts-ui
ADD package.json .
# RUN cross-env npm install

COPY . .
#RUN npm run build
#RUN cp -r /dxperts-ui/build/dist/* /var/www/

EXPOSE 80

## Copying default configuration
ADD conf/nginx.conf /etc/nginx/nginx.conf
ADD conf/start.sh /start.sh
RUN chmod a+x /start.sh

## Entry point
ENTRYPOINT ["/start.sh"]
