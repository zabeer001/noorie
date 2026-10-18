# Noorie WordPress

This repository contains the production VPS deployment configuration and the custom Noorie theme. WordPress core, uploads, WooCommerce, and other third-party plugins are intentionally not committed.

## What is tracked

- The custom `noorie` theme
- Production Docker Compose configuration
- Caddy HTTPS configuration
- Safe environment templates
- Glifnode plugins explicitly added to the `.gitignore` allowlist

The real `.env`, WordPress core, uploads, database data, WooCommerce, default themes, and third-party plugins remain untracked.

## Production VPS deployment

### Prerequisites

- A Linux VPS with Git, Docker Engine, and the Docker Compose plugin installed
- A domain whose `A` record points to the VPS public IPv4 address
- An `AAAA` record only if the VPS has working public IPv6
- Inbound TCP ports `22`, `80`, and `443` available

Wait for DNS to resolve to the VPS before starting Caddy. Automatic HTTPS cannot be issued until the domain reaches this server.

### 1. Clone and configure

```bash
git clone YOUR_REPOSITORY_URL noorie
cd noorie
cp .env.production.example .env
nano .env
```

Set `DOMAIN` to the production hostname without `https://`, set a valid `ACME_EMAIL`, and replace both example database passwords with long random values. Keep `WORDPRESS_DEBUG=0` in production.

The `.env` file contains secrets and must never be committed.

### 2. Configure the firewall

For Ubuntu with UFW:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw enable
sudo ufw status
```

Do not open MySQL ports `3306` or `3310`, and do not expose phpMyAdmin on a production VPS. The production Compose stack publishes only Caddy on ports `80` and `443`.

### 3. Start production

```bash
docker compose -f compose.prod.yaml config
docker compose -f compose.prod.yaml pull
docker compose -f compose.prod.yaml up -d
docker compose -f compose.prod.yaml ps
```

Follow startup and certificate logs:

```bash
docker compose -f compose.prod.yaml logs -f caddy wordpress
```

Press `Ctrl+C` to stop following logs; the containers continue running.

### 4. Complete WordPress

1. Open `https://YOUR_DOMAIN/`.
2. Complete the WordPress installation if prompted.
3. Go to **Plugins → Add New**, install WooCommerce, and activate it.
4. Go to **Appearance → Themes** and activate **Noorie**.
5. Configure WooCommerce currency, store address, shipping, payments, and permalinks.
6. Disable WooCommerce Coming Soon mode when the storefront is ready.

Installed plugins, media uploads, and generated WordPress files persist in the host `wordpress/` directory. MySQL and Caddy certificate data persist in named Docker volumes.

## Production operations

### Status and logs

```bash
docker compose -f compose.prod.yaml ps
docker compose -f compose.prod.yaml logs --tail=200 wordpress
docker compose -f compose.prod.yaml logs --tail=200 db
docker compose -f compose.prod.yaml logs --tail=200 caddy
```

### Restart

```bash
docker compose -f compose.prod.yaml restart
```

### Update the repository and container images

Back up first, then run:

```bash
git pull --ff-only
docker compose -f compose.prod.yaml pull
docker compose -f compose.prod.yaml up -d
docker compose -f compose.prod.yaml ps
```

### Back up WordPress files

```bash
mkdir -p backups
tar -czf "backups/wp-content-$(date +%F-%H%M%S).tar.gz" wordpress/wp-content
```

### Back up the database

```bash
mkdir -p backups
docker compose -f compose.prod.yaml exec -T db sh -c 'exec mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' > "backups/database-$(date +%F-%H%M%S).sql"
```

Copy backups to storage outside the VPS. Local files on the same VPS are not sufficient disaster recovery.

### Stop the stack

```bash
docker compose -f compose.prod.yaml down
```

Do not add `-v` unless you intentionally want to delete the database and Caddy certificate volumes.

## Troubleshooting

### HTTPS certificate is not issued

- Confirm the domain resolves to the VPS public IP.
- Confirm ports `80` and `443` are reachable.
- Check `docker compose -f compose.prod.yaml logs --tail=200 caddy`.
- Confirm no host-level Nginx, Apache, or another container is already using ports `80` or `443`.

### WordPress cannot connect to MySQL

- Confirm the four MySQL values in `.env` are present and consistent.
- Check `docker compose -f compose.prod.yaml ps` and the database logs.
- Use `db:3306` only inside Docker; do not change `WORDPRESS_DB_HOST` to `localhost`.

### Plugin installation asks for FTP credentials

Check that the WordPress container can write to the bind-mounted directory:

```bash
docker compose -f compose.prod.yaml exec wordpress sh -lc 'chown -R www-data:www-data /var/www/html/wp-content && find /var/www/html/wp-content -type d -exec chmod 775 {} \; && find /var/www/html/wp-content -type f -exec chmod 664 {} \;'
```

Never use recursive `777` permissions.

## Glifnode custom plugins

Third-party plugins are ignored by default. When a verified Glifnode plugin is added, explicitly allow its real directory in `.gitignore`:

```gitignore
!/wordpress/wp-content/plugins/glifnode-plugin-name/
!/wordpress/wp-content/plugins/glifnode-plugin-name/**
```
