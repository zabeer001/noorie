# Noorie WordPress

This repository tracks the local Docker setup and the custom Noorie theme. WordPress core, uploads, WooCommerce, and other third-party plugins are intentionally not committed.

## Start after cloning

1. Create the local environment file:

   ```bash
   cp .env.example .env
   ```

2. Replace the example database passwords in `.env`.

3. Start WordPress:

   ```bash
   docker compose up -d
   ```

4. Open `http://localhost:99/` and complete the WordPress setup if prompted.

5. Install and activate WooCommerce from **Plugins → Add New**.

6. Activate the **Noorie** theme from **Appearance → Themes**.

Glifnode custom plugins should be committed explicitly by adding their verified plugin directory to the allowlist in `.gitignore`.
