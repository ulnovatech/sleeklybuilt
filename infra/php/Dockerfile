# PHP 8.2 FPM for ulnovatech public_html (mysqli + PDO MySQL)
FROM php:8.2-fpm-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    libzip-dev \
    libonig-dev \
    && docker-php-ext-install mysqli pdo_mysql mbstring \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/public_html

ENV TEMPLATE_IMPORT_STAGING_DIR=/var/lib/ulnovatech/template-imports
ENV TEMPLATE_IMPORT_LOG_DIR=/var/log/ulnovatech/template-import
ENV TEMPLATE_PROFILE_DIR=/var/lib/ulnovatech/template-profiles
RUN install -d -o www-data -g www-data -m 0700 \
      "$TEMPLATE_IMPORT_STAGING_DIR" \
      "$TEMPLATE_PROFILE_DIR" \
      "$TEMPLATE_IMPORT_LOG_DIR"

# Allow env vars from Docker into PHP (php/.env still preferred)
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
    && { \
      echo 'upload_max_filesize=32M'; \
      echo 'post_max_size=32M'; \
      echo 'memory_limit=256M'; \
      echo 'expose_php=Off'; \
    } >> "$PHP_INI_DIR/conf.d/ulnovatech.ini"
