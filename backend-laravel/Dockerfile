FROM php:8.5-cli
RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev unzip git && docker-php-ext-install pdo_pgsql && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-scripts
COPY . .
RUN composer dump-autoload --no-scripts && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs && chown -R www-data:www-data storage bootstrap/cache
USER www-data
EXPOSE 3002
CMD ["php","artisan","serve","--host=0.0.0.0","--port=3002"]
