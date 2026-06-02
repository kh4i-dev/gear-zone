#!/bin/bash
echo "Starting deployment..."
git pull origin main
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart gearzone-app || pm2 start npm --name "gearzone-app" -- start
echo "Deployment completed successfully! Check pm2 logs for details."
