# Azure Ubuntu + Neon PostgreSQL Deployment

This guide deploys GearZone on an Azure Ubuntu VM with Neon PostgreSQL. Production must use Prisma Migrate, not `prisma db push`.

## 1. Prerequisites

- Ubuntu 22.04 or 24.04 VM.
- Node.js LTS 22.x.
- Nginx.
- PM2 or a systemd service.
- A Neon PostgreSQL database.
- A backed-up copy of the local SQLite source database if importing existing data.

## 2. Environment Variables

Create `.env.production` on the server. Do not commit it.

Required:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/DB?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST.REGION.aws.neon.tech/DB?sslmode=require"
NEXT_PUBLIC_APP_URL="https://your-domain.example"
JWT_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_ADMIN_PANEL_PREFIX="system-control"
NEXT_PUBLIC_ADMIN_LOGIN_PATH="auth-login"
ADMIN_EMAIL=""
ADMIN_PASSWORD=""
```

Optional payment/display variables are listed in `.env.production.example`.

If a production-like env file was created locally during setup, rotate every secret from it before launch.

## 3. Install Runtime

```bash
sudo apt update
sudo apt install -y curl git nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
node -v
npm -v
```

## 4. Clone And Install

```bash
git clone <repo-url> /var/www/gear-zone
cd /var/www/gear-zone
cp .env.production.example .env.production
nano .env.production
cp .env.production .env
npm ci
```

## 5. Apply Prisma Migration

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma migrate status
```

Do not run `prisma db push` in production.

## 6. Import SQLite Data To Neon

Back up the SQLite file before copying it to the server. The current local dev database path is:

```text
prisma/prisma/dev.db
```

Copy it to the server, for example:

```bash
mkdir -p /var/www/gear-zone/prisma/import
scp ./prisma/prisma/dev.db user@server:/var/www/gear-zone/prisma/import/dev.db
```

Run the deterministic import:

```bash
cd /var/www/gear-zone
SQLITE_DATABASE_PATH=/var/www/gear-zone/prisma/import/dev.db npm run db:import:sqlite
```

Import order:

1. users
2. categories
3. products
4. settings
5. orders
6. order items

There are no cart or review tables in the current schema.

## 7. Build

```bash
npm run lint
npm run type-check
npm run build
```

## 8. PM2

Create `/var/www/gear-zone/ecosystem.config.cjs`:

```js
module.exports = {
  apps: [
    {
      name: 'gear-zone',
      cwd: '/var/www/gear-zone',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
```

Start and persist:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## 9. Nginx Reverse Proxy

Create `/etc/nginx/sites-available/gear-zone`:

```nginx
server {
    listen 80;
    server_name your-domain.example;

    client_max_body_size 220m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/gear-zone /etc/nginx/sites-enabled/gear-zone
sudo nginx -t
sudo systemctl reload nginx
```

## 10. SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.example
sudo systemctl reload nginx
```

## 11. Health Checks

```bash
curl -fsS http://127.0.0.1:3000/api/health
curl -fsS https://your-domain.example/api/health
curl -fsS "https://your-domain.example/api/products?page=1&pageSize=5"
```

Expected health response:

```json
{
  "data": {
    "status": "ok",
    "database": "connected"
  },
  "error": null,
  "meta": {
    "traceId": "...",
    "timestamp": "..."
  }
}
```

## 12. Deployment Checklist

- `npx prisma validate`
- `npx prisma migrate deploy`
- `npx prisma migrate status`
- `npm run lint`
- `npm run type-check`
- `npm run build`
- `curl /api/health`
- `curl /api/products`
- Open `/products`
- Open one `/products/:id`
- Check admin product create/update/delete flows
- Check uploaded media persistence strategy for `public/uploads`
