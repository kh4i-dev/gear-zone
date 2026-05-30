import { Mouse, Keyboard, Headphones, Monitor, Sliders, Armchair } from 'lucide-react'
import type { ComponentType } from 'react'

export interface MegaMenuItem {
  label: string
  href: string
}

export interface MegaMenuGroup {
  title: string
  items: MegaMenuItem[]
}

export interface MegaMenuCategory {
  id: string
  slug: string
  label: string
  icon: ComponentType<any>
  queryName: string
  href: string
  groups: MegaMenuGroup[]
  footerLink?: {
    label: string
    href: string
  }
}

export const categoryMegaMenu: MegaMenuCategory[] = [
  {
    id: 'monitor',
    slug: 'monitor',
    label: 'Màn hình',
    icon: Monitor,
    queryName: 'Màn hình',
    href: '/products?category=monitor',
    groups: [
      {
        title: 'Hãng sản xuất',
        items: [
          { label: 'LG', href: '/products?category=monitor&brand=lg' },
          { label: 'Asus', href: '/products?category=monitor&brand=asus' },
          { label: 'ViewSonic', href: '/products?category=monitor&brand=viewsonic' },
          { label: 'Dell', href: '/products?category=monitor&brand=dell' },
          { label: 'Gigabyte', href: '/products?category=monitor&brand=gigabyte' },
          { label: 'AOC', href: '/products?category=monitor&brand=aoc' },
          { label: 'Acer', href: '/products?category=monitor&brand=acer' },
          { label: 'HKC', href: '/products?category=monitor&brand=hkc' },
        ],
      },
      {
        title: 'Hãng sản xuất',
        items: [
          { label: 'MSI', href: '/products?category=monitor&brand=msi' },
          { label: 'Samsung', href: '/products?category=monitor&brand=samsung' },
          { label: 'Philips', href: '/products?category=monitor&brand=philips' },
          { label: 'E-Dra', href: '/products?category=monitor&brand=e-dra' },
          { label: 'VSP', href: '/products?category=monitor&brand=vsp' },
        ],
      },
      {
        title: 'Giá tiền',
        items: [
          { label: 'Dưới 5 triệu', href: '/products?category=monitor&maxPrice=5000000' },
          { label: 'Từ 5 đến 10 triệu', href: '/products?category=monitor&minPrice=5000000&maxPrice=10000000' },
          { label: 'Từ 10 đến 20 triệu', href: '/products?category=monitor&minPrice=10000000&maxPrice=20000000' },
          { label: 'Từ 20 đến 30 triệu', href: '/products?category=monitor&minPrice=20000000&maxPrice=30000000' },
          { label: 'Trên 30 triệu', href: '/products?category=monitor&minPrice=30000000' },
        ],
      },
      {
        title: 'Độ phân giải',
        items: [
          { label: 'Màn hình Full HD', href: '/products?category=monitor&resolution=full-hd' },
          { label: 'Màn hình 2K 1440p', href: '/products?category=monitor&resolution=2k' },
          { label: 'Màn hình 4K UHD', href: '/products?category=monitor&resolution=4k' },
          { label: 'Màn hình 6K', href: '/products?category=monitor&resolution=6k' },
        ],
      },
      {
        title: 'Tần số quét',
        items: [
          { label: '60Hz', href: '/products?category=monitor&refreshRate=60hz' },
          { label: '75Hz', href: '/products?category=monitor&refreshRate=75hz' },
          { label: '100Hz', href: '/products?category=monitor&refreshRate=100hz' },
          { label: '144Hz', href: '/products?category=monitor&refreshRate=144hz' },
          { label: '240Hz', href: '/products?category=monitor&refreshRate=240hz' },
          { label: '310Hz', href: '/products?category=monitor&refreshRate=310hz' },
          { label: '360Hz', href: '/products?category=monitor&refreshRate=360hz' },
        ],
      },
      {
        title: 'Màn hình cong',
        items: [
          { label: '24" Curved', href: '/products?category=monitor&size=24-inch&shape=curved' },
          { label: '27" Curved', href: '/products?category=monitor&size=27-inch&shape=curved' },
          { label: '32" Curved', href: '/products?category=monitor&size=32-inch&shape=curved' },
          { label: 'Trên 32" Curved', href: '/products?category=monitor&shape=curved' },
        ],
      },
      {
        title: 'Kích thước',
        items: [
          { label: 'Màn hình 22"', href: '/products?category=monitor&size=22-inch' },
          { label: 'Màn hình 24"', href: '/products?category=monitor&size=24-inch' },
          { label: 'Màn hình 27"', href: '/products?category=monitor&size=27-inch' },
          { label: 'Màn hình 29"', href: '/products?category=monitor&size=29-inch' },
          { label: 'Màn hình 32"', href: '/products?category=monitor&size=32-inch' },
          { label: 'Màn hình Trên 32"', href: '/products?category=monitor&size=ultrawide' },
          { label: 'Hỗ trợ giá treo (VESA)', href: '/products?category=monitor&vesa=true' },
        ],
      },
      {
        title: 'Màn hình đồ họa',
        items: [
          { label: 'Màn hình đồ họa 24"', href: '/products?category=monitor&size=24-inch&type=graphic' },
          { label: 'Màn hình đồ họa 27"', href: '/products?category=monitor&size=27-inch&type=graphic' },
          { label: 'Màn hình đồ họa 32"', href: '/products?category=monitor&size=32-inch&type=graphic' },
        ],
      },
      {
        title: 'Phụ kiện màn hình',
        items: [
          { label: 'Giá treo màn hình', href: '/products?category=accessory&search=arm' },
          { label: 'Phụ kiện dây HDMI,DP,LAN', href: '/products?category=accessory&search=cáp' },
        ],
      },
      {
        title: 'Màn hình di động',
        items: [
          { label: 'Di động Full HD', href: '/products?category=monitor&size=portable&resolution=full-hd' },
          { label: 'Di động 2K 1440p', href: '/products?category=monitor&size=portable&resolution=2k' },
          { label: 'Di động cảm ứng', href: '/products?category=monitor&size=portable&touch=true' },
        ],
      },
    ],
    footerLink: {
      label: 'Màn hình Oled',
      href: '/products?category=monitor&panel=oled',
    },
  },
  {
    id: 'keyboard',
    slug: 'keyboard',
    label: 'Bàn phím',
    icon: Keyboard,
    queryName: 'Bàn phím',
    href: '/products?category=keyboard',
    groups: [
      {
        title: 'Thương hiệu',
        items: [
          { label: 'AKKO', href: '/products?category=keyboard&brand=akko' },
          { label: 'AULA', href: '/products?category=keyboard&brand=aula' },
          { label: 'Dare-U', href: '/products?category=keyboard&brand=dare-u' },
          { label: 'Durgod', href: '/products?category=keyboard&brand=durgod' },
          { label: 'Leobog', href: '/products?category=keyboard&brand=leobog' },
          { label: 'Keychron', href: '/products?category=keyboard&brand=keychron' },
          { label: 'FL-Esports', href: '/products?category=keyboard&brand=fl-esports' },
          { label: 'Corsair', href: '/products?category=keyboard&brand=corsair' },
          { label: 'E-Dra', href: '/products?category=keyboard&brand=e-dra' },
          { label: 'Cidoo', href: '/products?category=keyboard&brand=cidoo' },
          { label: 'Machenike', href: '/products?category=keyboard&brand=machenike' },
        ],
      },
      {
        title: 'Thương hiệu',
        items: [
          { label: 'ASUS', href: '/products?category=keyboard&brand=asus' },
          { label: 'Logitech', href: '/products?category=keyboard&brand=logitech' },
          { label: 'Razer', href: '/products?category=keyboard&brand=razer' },
          { label: 'Leopold', href: '/products?category=keyboard&brand=leopold' },
          { label: 'Steelseries', href: '/products?category=keyboard&brand=steelseries' },
          { label: 'Rapoo', href: '/products?category=keyboard&brand=rapoo' },
          { label: 'VGN', href: '/products?category=keyboard&brand=vgn' },
          { label: 'MadLions', href: '/products?category=keyboard&brand=madlions' },
          { label: 'SKYLOONG', href: '/products?category=keyboard&brand=skyloong' },
        ],
      },
      {
        title: 'Giá tiền',
        items: [
          { label: 'Dưới 1 triệu', href: '/products?category=keyboard&maxPrice=1000000' },
          { label: '1 triệu - 2 triệu', href: '/products?category=keyboard&minPrice=1000000&maxPrice=2000000' },
          { label: '2 triệu - 3 triệu', href: '/products?category=keyboard&minPrice=2000000&maxPrice=3000000' },
          { label: '3 triệu - 4 triệu', href: '/products?category=keyboard&minPrice=3000000&maxPrice=4000000' },
          { label: 'Trên 4 triệu', href: '/products?category=keyboard&minPrice=4000000' },
        ],
      },
      {
        title: 'Kết nối',
        items: [
          { label: 'Bluetooth', href: '/products?category=keyboard&connection=bluetooth' },
          { label: 'Wireless', href: '/products?category=keyboard&connection=wireless' },
          { label: 'Có dây', href: '/products?category=keyboard&connection=wired' },
        ],
      },
      {
        title: 'Loại Switch',
        items: [
          { label: 'Red Switch', href: '/products?category=keyboard&switch=red' },
          { label: 'Brown Switch', href: '/products?category=keyboard&switch=brown' },
          { label: 'Blue Switch', href: '/products?category=keyboard&switch=blue' },
          { label: 'Rapid Trigger', href: '/products?category=keyboard&switch=rapid-trigger' },
        ],
      },
    ],
    footerLink: {
      label: 'Bàn phím Rapid Trigger',
      href: '/products?category=keyboard&switch=rapid-trigger',
    },
  },
  {
    id: 'mouse',
    slug: 'mouse',
    label: 'Chuột + Lót chuột',
    icon: Mouse,
    queryName: 'Chuột',
    href: '/products?category=mouse',
    groups: [
      {
        title: 'Thương hiệu chuột',
        items: [
          { label: 'Logitech', href: '/products?category=mouse&brand=logitech' },
          { label: 'Razer', href: '/products?category=mouse&brand=razer' },
          { label: 'Corsair', href: '/products?category=mouse&brand=corsair' },
          { label: 'Microsoft', href: '/products?category=mouse&brand=microsoft' },
          { label: 'Dare U', href: '/products?category=mouse&brand=dare-u' },
        ],
      },
      {
        title: 'Thương hiệu chuột',
        items: [
          { label: 'ASUS', href: '/products?category=mouse&brand=asus' },
          { label: 'Steelseries', href: '/products?category=mouse&brand=steelseries' },
          { label: 'Glorious', href: '/products?category=mouse&brand=glorious' },
          { label: 'Rapoo', href: '/products?category=mouse&brand=rapoo' },
          { label: 'HyperX', href: '/products?category=mouse&brand=hyperx' },
          { label: 'ATK', href: '/products?category=mouse&brand=atk' },
          { label: 'Pulsar', href: '/products?category=mouse&brand=pulsar' },
          { label: 'Lamzu', href: '/products?category=mouse&brand=lamzu' },
          { label: 'Zowie', href: '/products?category=mouse&brand=zowie' },
        ],
      },
      {
        title: 'Chuột theo giá tiền',
        items: [
          { label: 'Dưới 500 nghìn', href: '/products?category=mouse&maxPrice=500000' },
          { label: 'Từ 500 nghìn - 1 triệu', href: '/products?category=mouse&minPrice=500000&maxPrice=1000000' },
          { label: 'Từ 1 triệu - 2 triệu', href: '/products?category=mouse&minPrice=1000000&maxPrice=2000000' },
          { label: 'Trên 2 triệu - 3 triệu', href: '/products?category=mouse&minPrice=2000000&maxPrice=3000000' },
          { label: 'Trên 3 triệu', href: '/products?category=mouse&minPrice=3000000' },
        ],
      },
      {
        title: 'Loại Chuột',
        items: [
          { label: 'Chuột chơi game', href: '/products?category=mouse&type=game' },
          { label: 'Chuột văn phòng', href: '/products?category=mouse&type=office' },
        ],
      },
      {
        title: 'Kết nối',
        items: [
          { label: 'Không dây', href: '/products?category=mouse&connection=wireless' },
          { label: 'Có dây', href: '/products?category=mouse&connection=wired' },
        ],
      },
      {
        title: 'Logitech',
        items: [
          { label: 'Logitech Gaming', href: '/products?category=mouse&brand=logitech&type=game' },
          { label: 'Logitech Văn phòng', href: '/products?category=mouse&brand=logitech&type=office' },
        ],
      },
      {
        title: 'Thương hiệu lót chuột',
        items: [
          { label: 'GEARVN', href: '/products?category=accessory&brand=gearvn' },
          { label: 'ASUS', href: '/products?category=accessory&brand=asus' },
          { label: 'Steelseries', href: '/products?category=accessory&brand=steelseries' },
          { label: 'Dare-U', href: '/products?category=accessory&brand=dare-u' },
          { label: 'Razer', href: '/products?category=accessory&brand=razer' },
          { label: 'SKYLOONG', href: '/products?category=accessory&brand=skyloong' },
        ],
      },
      {
        title: 'Các loại lót chuột',
        items: [
          { label: 'Mềm', href: '/products?category=accessory&material=soft' },
          { label: 'Cứng', href: '/products?category=accessory&material=hard' },
          { label: 'Dày', href: '/products?category=accessory&material=thick' },
          { label: 'Mỏng', href: '/products?category=accessory&material=thin' },
          { label: 'Viền có led', href: '/products?category=accessory&led=true' },
        ],
      },
      {
        title: 'Lót chuột theo size',
        items: [
          { label: 'Nhỏ', href: '/products?category=accessory&size=small' },
          { label: 'Vừa', href: '/products?category=accessory&size=medium' },
          { label: 'Lớn', href: '/products?category=accessory&size=large' },
        ],
      },
    ],
  },
  {
    id: 'headphone',
    slug: 'headset',
    label: 'Tai Nghe',
    icon: Headphones,
    queryName: 'Tai nghe',
    href: '/products?category=headset',
    groups: [
      {
        title: 'Thương hiệu tai nghe',
        items: [
          { label: 'ASUS', href: '/products?category=headset&brand=asus' },
          { label: 'HyperX', href: '/products?category=headset&brand=hyperx' },
          { label: 'Corsair', href: '/products?category=headset&brand=corsair' },
          { label: 'Razer', href: '/products?category=headset&brand=razer' },
          { label: 'ONIKUMA', href: '/products?category=headset&brand=onikuma' },
        ],
      },
      {
        title: 'Thương hiệu tai nghe',
        items: [
          { label: 'Steelseries', href: '/products?category=headset&brand=steelseries' },
          { label: 'Rapoo', href: '/products?category=headset&brand=rapoo' },
          { label: 'Logitech', href: '/products?category=headset&brand=logitech' },
          { label: 'Edifier', href: '/products?category=headset&brand=edifier' },
        ],
      },
      {
        title: 'Tai nghe theo giá',
        items: [
          { label: 'Tai nghe dưới 1 triệu', href: '/products?category=headset&maxPrice=1000000' },
          { label: 'Tai nghe 1 triệu đến 2 triệu', href: '/products?category=headset&minPrice=1000000&maxPrice=2000000' },
          { label: 'Tai nghe 2 đến 3 triệu', href: '/products?category=headset&minPrice=2000000&maxPrice=3000000' },
          { label: 'Tai nghe 3 đến 4 triệu', href: '/products?category=headset&minPrice=3000000&maxPrice=4000000' },
          { label: 'Tai nghe trên 4 triệu', href: '/products?category=headset&minPrice=4000000' },
        ],
      },
      {
        title: 'Kiểu kết nối',
        items: [
          { label: 'Tai nghe Wireless', href: '/products?category=headset&connection=wireless' },
          { label: 'Tai nghe Bluetooth', href: '/products?category=headset&connection=bluetooth' },
          { label: 'Tai nghe có dây', href: '/products?category=headset&connection=wired' },
        ],
      },
      {
        title: 'Kiểu tai nghe',
        items: [
          { label: 'Tai nghe Over-ear', href: '/products?category=headset&type=over-ear' },
          { label: 'Tai nghe Gaming In-ear', href: '/products?category=headset&type=in-ear' },
        ],
      },
    ],
  },
  {
    id: 'chair',
    slug: 'chair',
    label: 'Ghế - Bàn',
    icon: Armchair,
    queryName: 'Ghế',
    href: '/products?category=chair',
    groups: [
      {
        title: 'Thương hiệu ghế Gaming',
        items: [
          { label: 'Corsair', href: '/products?category=chair&brand=corsair' },
          { label: 'Warrior', href: '/products?category=chair&brand=warrior' },
          { label: 'E-DRA', href: '/products?category=chair&brand=e-dra' },
          { label: 'DXRacer', href: '/products?category=chair&brand=dxracer' },
          { label: 'Cougar', href: '/products?category=chair&brand=cougar' },
          { label: 'AKRacing', href: '/products?category=chair&brand=akracing' },
          { label: 'Razer', href: '/products?category=chair&brand=razer' },
        ],
      },
      {
        title: 'Thương hiệu ghế CTH',
        items: [
          { label: 'Warrior CTH', href: '/products?category=chair&brand=warrior&type=ergonomic' },
          { label: 'Sihoo', href: '/products?category=chair&brand=sihoo' },
          { label: 'E-Dra CTH', href: '/products?category=chair&brand=e-dra&type=ergonomic' },
        ],
      },
      {
        title: 'Kiểu ghế',
        items: [
          { label: 'Ghế Công thái học', href: '/products?category=chair&type=ergonomic' },
          { label: 'Ghế Gaming', href: '/products?category=chair&type=gaming' },
        ],
      },
      {
        title: 'Bàn Gaming',
        items: [
          { label: 'Bàn Gaming DXRacer', href: '/products?category=chair&brand=dxracer' },
          { label: 'Bàn Gaming E-Dra', href: '/products?category=chair&brand=e-dra' },
          { label: 'Bàn Gaming Warrior', href: '/products?category=chair&brand=warrior' },
        ],
      },
      {
        title: 'Bàn công thái học',
        items: [
          { label: 'Bàn CTH Warrior', href: '/products?category=chair&brand=warrior&type=ergonomic' },
        ],
      },
      {
        title: 'Phụ kiện bàn ghế',
        items: [
          { label: 'Phụ kiện bàn ghế', href: '/products?category=accessory&search=setup' },
        ],
      },
      {
        title: 'Giá tiền',
        items: [
          { label: 'Dưới 5 triệu', href: '/products?category=chair&maxPrice=5000000' },
          { label: 'Từ 5 đến 10 triệu', href: '/products?category=chair&minPrice=5000000&maxPrice=10000000' },
          { label: 'Trên 10 triệu', href: '/products?category=chair&minPrice=10000000' },
        ],
      },
    ],
  },
  {
    id: 'accessory',
    slug: 'accessory',
    label: 'Phụ kiện (Hub, sạc, cáp..)',
    icon: Sliders,
    queryName: 'Phụ kiện',
    href: '/products?category=accessory',
    groups: [
      {
        title: 'Sản phẩm setup',
        items: [
          { label: 'Giá treo màn hình (Arm)', href: '/products?category=accessory&search=arm' },
          { label: 'Mousepad cỡ lớn', href: '/products?category=accessory&search=lót+chuột' },
          { label: 'Giá treo tai nghe', href: '/products?category=accessory&search=giá+treo' },
          { label: 'Đèn treo màn hình', href: '/products?category=accessory&search=đèn' },
        ],
      },
    ],
  },
]