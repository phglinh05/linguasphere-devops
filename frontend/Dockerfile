FROM nginx:1.27-alpine

ENV PORT=5000

# Replace default site config
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy static frontend
COPY . /usr/share/nginx/html

EXPOSE 80