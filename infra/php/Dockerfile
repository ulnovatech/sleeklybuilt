# PHP 8.2 FPM for sleeklybuilt public_html (mysqli + PDO MySQL)
# Also installs Node + Chromium for post-publish gallery screenshots.
FROM php:8.2-fpm-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    curl \
    gnupg \
    ca-certificates \
    libzip-dev \
    libonig-dev \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    && docker-php-ext-install mysqli pdo_mysql mbstring \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/public_html

ENV TEMPLATE_IMPORT_STAGING_DIR=/var/lib/sleeklybuilt/template-imports
ENV TEMPLATE_IMPORT_LOG_DIR=/var/log/sleeklybuilt/template-import
ENV TEMPLATE_PROFILE_DIR=/var/lib/sleeklybuilt/template-profiles
ENV TEMPLATE_SCREENSHOT_NODE=/usr/bin/node
ENV TEMPLATE_SCREENSHOT_CHROMIUM=/usr/bin/chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

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
    } >> "$PHP_INI_DIR/conf.d/sleeklybuilt.ini"
