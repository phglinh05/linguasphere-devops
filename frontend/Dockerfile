FROM nginx:1.27-alpine

# Replace default site config with yours
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static frontend files to NGINX web root
COPY . /usr/share/nginx/html

# Container serves HTTP on port 80
EXPOSE 80