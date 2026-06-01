# GearZone

Nen tang thuong mai dien tu cho thiet bi gaming gear.

## Cong Nghe

- **Frontend:** Next.js App Router, React, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Prisma ORM voi SQLite khi development; nen chuyen PostgreSQL/MySQL khi production
- **Authentication:** JWT (`jose`) + `bcryptjs`
- **Cart:** client state qua `CartProvider` va `localStorage`
- **Payment:** COD, chuyen khoan/VietQR va MoMo qua cau hinh he thong; hien tai chua co bang `Payment` rieng

## Tai Lieu Chinh

- [Bao cao phan tich va thiet ke he thong](docs/gearzone_system_design.md)
- [Azure Ubuntu + Neon PostgreSQL deployment](docs/azure-ubuntu-neon-deploy.md)

## So Do

| Noi dung | File |
|:--|:--|
| Use case | [images/use_case_gearzone.jpeg](images/use_case_gearzone.jpeg) |
| Chuc nang | [images/so_do_chuc_nang_gearzone.svg](images/so_do_chuc_nang_gearzone.svg) |
| Thanh phan | [images/so_do_thanh_phan_v2.svg](images/so_do_thanh_phan_v2.svg) |
| Activity dat hang | [images/activity_diagram_swimlane_gearzone.svg](images/activity_diagram_swimlane_gearzone.svg) |
| Sequence dat hang | [images/so_do_tuan_tu_dat_hang_gearzone.svg](images/so_do_tuan_tu_dat_hang_gearzone.svg) |
| Trang thai don hang | [images/so_do_trang_thai_don_hang_v2.svg](images/so_do_trang_thai_don_hang_v2.svg) |
| ERD | [images/erd_gearzone.svg](images/erd_gearzone.svg) |
| Class diagram | [images/class_diagram_gearzone.svg](images/class_diagram_gearzone.svg) |
| Deployment | [images/deployment_diagram_gearzone_v2.svg](images/deployment_diagram_gearzone_v2.svg) |

## Chay Local

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Mo `http://localhost:3000`.
