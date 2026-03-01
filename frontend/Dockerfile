FROM nginx:1.29-alpine3.23

# Replace default site config
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy static frontend
COPY . /usr/share/nginx/html

EXPOSE 80