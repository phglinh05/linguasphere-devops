FROM nginx:1.27-alpine

RUN apk update && apk upgrade --no-cache

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY pages/ /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/

# Create non-root user and adjust ownership of runtime dirs
RUN addgroup -S linguasphere \
    && adduser -S nhom9 -G linguasphere \
    && chown -R nhom9:linguasphere /usr/share/nginx/html

RUN chown -R nhom9:linguasphere /usr/share/nginx/html

RUN touch /var/run/nginx.pid && \
    chown -R nhom9:linguasphere /var/run/nginx.pid && \
    chown -R nhom9:linguasphere /var/cache/nginx && \
    chown -R nhom9:linguasphere /var/log/nginx && \
    chown -R nhom9:linguasphere /etc/nginx/conf.d

# Run container as non-root user
USER nhom9

EXPOSE 8080
