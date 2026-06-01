export interface FilterOption {
  value: string
  label: string
  aliases: string[]
}

export interface FilterDefinition {
  key: string
  label: string
  categoryIds: string[]
  options: FilterOption[]
}

export const CATEGORY_DEFINITIONS = {
  all: 'Tất cả',
  keyboard: 'Bàn phím',
  mouse: 'Chuột',
  headset: 'Tai nghe',
  monitor: 'Màn hình',
  accessory: 'Phụ kiện / Khác',
} as const

export const CATEGORY_SLUG_TO_NAME: Record<string, string> = {
  monitor: 'Màn hình',
  keyboard: 'Bàn phím',
  mouse: 'Chuột',
  headset: 'Tai nghe',
  headphone: 'Tai nghe',
  accessory: 'Phụ kiện',
  chair: 'Ghế',
}

export const CATEGORY_NAME_TO_SLUG: Record<string, string> = {
  'Màn hình': 'monitor',
  'Bàn phím': 'keyboard',
  'Chuột': 'mouse',
  'Tai nghe': 'headset',
  'Phụ kiện': 'accessory',
  'Ghế': 'chair',
  'Phụ kiện (Hub, sạc, cáp..)': 'accessory',
  'Lót chuột (Mousepad)': 'accessory',
  'Giá đỡ màn hình (Arm)': 'accessory',
  'Bàn chơi game': 'chair',
}

export const productFilters: FilterDefinition[] = [
  {
    key: 'brand',
    label: 'Thương hiệu',
    categoryIds: [],
    options: [
      {
        value: 'asus',
        label: 'Asus',
        aliases: ['asus', 'asus tuf', 'tuf gaming', 'rog'],
      },
      {
        value: 'lg',
        label: 'LG',
        aliases: ['lg'],
      },
      {
        value: 'dell',
        label: 'Dell',
        aliases: ['dell', 'alienware'],
      },
      {
        value: 'msi',
        label: 'MSI',
        aliases: ['msi'],
      },
      {
        value: 'samsung',
        label: 'Samsung',
        aliases: ['samsung', 'odyssey'],
      },
      {
        value: 'viewsonic',
        label: 'ViewSonic',
        aliases: ['viewsonic'],
      },
      {
        value: 'logitech',
        label: 'Logitech',
        aliases: ['logitech', 'g pro', 'g502', 'mx master'],
      },
      {
        value: 'razer',
        label: 'Razer',
        aliases: ['razer', 'viper', 'deathadder', 'blackwidow'],
      },
      {
        value: 'corsair',
        label: 'Corsair',
        aliases: ['corsair'],
      },
      {
        value: 'steelseries',
        label: 'Steelseries',
        aliases: ['steelseries'],
      },
      {
        value: 'akko',
        label: 'AKKO',
        aliases: ['akko'],
      },
      {
        value: 'keychron',
        label: 'Keychron',
        aliases: ['keychron'],
      },
      {
        value: 'hyperx',
        label: 'HyperX',
        aliases: ['hyperx'],
      },
      {
        value: 'zowie',
        label: 'Zowie',
        aliases: ['zowie', 'benq zowie'],
      },
      {
        value: 'pulsar',
        label: 'Pulsar',
        aliases: ['pulsar'],
      },
      {
        value: 'lamzu',
        label: 'Lamzu',
        aliases: ['lamzu'],
      },
      {
        value: 'e-dra',
        label: 'E-Dra',
        aliases: ['e-dra', 'edra'],
      },
    ],
  },
  {
    key: 'resolution',
    label: 'Độ phân giải',
    categoryIds: ['monitor'],
    options: [
      {
        value: 'full-hd',
        label: 'Full HD 1080p',
        aliases: ['full hd', 'fhd', '1080p', '1920 x 1080', '1920x1080', 'full hd (1920 x 1080)'],
      },
      {
        value: '2k',
        label: '2K QHD 1440p',
        aliases: ['2k', 'qhd', '1440p', '2560 x 1440', '2560x1440', '2k (2560 x 1440)'],
      },
      {
        value: '4k',
        label: '4K UHD',
        aliases: ['4k', 'uhd', '2160p', '3840 x 2160', '3840x2160', '4k (3840 x 2160)'],
      },
      {
        value: '6k',
        label: '6K',
        aliases: ['6k', '5120 x 2160', '5120x2160', '6k (5120 x 2160)'],
      },
    ],
  },
  {
    key: 'refreshRate',
    label: 'Tần số quét',
    categoryIds: ['monitor'],
    options: [
      { value: '60hz', label: '60Hz', aliases: ['60hz', '60 hz'] },
      { value: '75hz', label: '75Hz', aliases: ['75hz', '75 hz'] },
      { value: '100hz', label: '100Hz', aliases: ['100hz', '100 hz'] },
      { value: '144hz', label: '144Hz', aliases: ['144hz', '144 hz'] },
      { value: '165hz', label: '165Hz', aliases: ['165hz', '165 hz'] },
      { value: '180hz', label: '180Hz', aliases: ['180hz', '180 hz'] },
      { value: '240hz', label: '240Hz', aliases: ['240hz', '240 hz'] },
      { value: '280hz', label: '280Hz', aliases: ['280hz', '280 hz'] },
      { value: '310hz', label: '310Hz', aliases: ['310hz', '310 hz'] },
      { value: '360hz', label: '360Hz', aliases: ['360hz', '360 hz'] },
    ],
  },
  {
    key: 'size',
    label: 'Kích thước',
    categoryIds: ['monitor'],
    options: [
      { value: '22-inch', label: '22"', aliases: ['22"', '22 inch', '21.5"', '21.5 inch', '22"'] },
      { value: '24-inch', label: '24"', aliases: ['24"', '24 inch', '23.8"', '23.8 inch'] },
      { value: '25-inch', label: '25"', aliases: ['25"', '25 inch'] },
      { value: '27-inch', label: '27"', aliases: ['27"', '27 inch'] },
      { value: '29-inch', label: '29"', aliases: ['29"', '29 inch'] },
      { value: '32-inch', label: '32"', aliases: ['32"', '32 inch', '31.5"', '31.5 inch'] },
      { value: 'ultrawide', label: 'Ultrawide 34"+', aliases: ['34"', '34 inch', '38"', '38 inch', 'ultrawide', 'ultra wide'] },
      { value: 'portable', label: 'Di động / Portable', aliases: ['di động', 'portable', 'mobile monitor'] },
    ],
  },
  {
    key: 'panel',
    label: 'Tấm nền',
    categoryIds: ['monitor'],
    options: [
      { value: 'ips', label: 'IPS', aliases: ['ips', 'fast ips', 'nano ips', 'rapid ips'] },
      { value: 'fast-ips', label: 'Fast IPS', aliases: ['fast ips', 'fast-ips'] },
      { value: 'oled', label: 'OLED', aliases: ['oled', 'qd-oled', 'qd oled'] },
      { value: 'va', label: 'VA', aliases: [' va ', 'va panel', 'mvp'] },
      { value: 'tn', label: 'TN', aliases: [' tn ', 'tn panel'] },
    ],
  },
  {
    key: 'shape',
    label: 'Kiểu màn hình',
    categoryIds: ['monitor'],
    options: [
      { value: 'curved', label: 'Màn hình cong', aliases: ['curved', 'cong', 'curve'] },
      { value: 'flat', label: 'Phẳng', aliases: ['flat', 'phẳng'] },
    ],
  },
  {
    key: 'connection',
    label: 'Kết nối',
    categoryIds: ['keyboard', 'mouse', 'headset'],
    options: [
      { value: 'wireless', label: 'Không dây', aliases: ['wireless', 'không dây', '2.4ghz', '2.4g'] },
      { value: 'bluetooth', label: 'Bluetooth', aliases: ['bluetooth', 'bt5', 'bt 5'] },
      { value: 'wired', label: 'Có dây', aliases: ['wired', 'có dây', 'usb-c', 'usb cable'] },
    ],
  },
  {
    key: 'switch',
    label: 'Loại Switch',
    categoryIds: ['keyboard'],
    options: [
      { value: 'red', label: 'Red (Linear)', aliases: ['red', 'linear'] },
      { value: 'brown', label: 'Brown (Tactile)', aliases: ['brown', 'tactile'] },
      { value: 'blue', label: 'Blue (Clicky)', aliases: ['blue', 'clicky'] },
      { value: 'rapid-trigger', label: 'Rapid Trigger', aliases: ['rapid trigger', 'rapid-trigger'] },
    ],
  },
  {
    key: 'layout',
    label: 'Bố cục',
    categoryIds: ['keyboard'],
    options: [
      { value: '60', label: '60%', aliases: ['60%', '60', '60 layout'] },
      { value: '65', label: '65%', aliases: ['65%', '65', '65 layout'] },
      { value: '75', label: '75%', aliases: ['75%', '75', '75 layout'] },
      { value: 'tkl', label: 'TKL', aliases: ['tkl', 'tenkeyless'] },
      { value: 'fullsize', label: 'Full-size', aliases: ['full-size', 'fullsize', '100%'] },
    ],
  },
  {
    key: 'weight',
    label: 'Cân nặng',
    categoryIds: ['mouse'],
    options: [
      { value: 'lightweight', label: 'Nhẹ (<60g)', aliases: ['lightweight', 'nhẹ', '<60g', 'ultralight'] },
      { value: 'medium', label: 'Trung bình (60-80g)', aliases: ['medium', 'trung bình', '60-80g'] },
    ],
  },
  {
    key: 'sensor',
    label: 'Cảm biến',
    categoryIds: ['mouse'],
    options: [
      { value: 'hero', label: 'HERO', aliases: ['hero', 'logitech hero'] },
      { value: 'focus-pro', label: 'Focus Pro', aliases: ['focus pro', 'focus-pro', 'razer focus'] },
      { value: 'paw3395', label: 'PAW3395', aliases: ['paw3395', 'paw 3395'] },
    ],
  },
]

export const SPEC_KEY_TO_FILTER: Record<string, string> = {
  'độ phân giải': 'resolution',
  'tần số quét': 'refreshRate',
  'tấm nền': 'panel',
  'kích thước màn hình': 'size',
  'kích thước': 'size',
  'thương hiệu': 'brand',
  'hãng sản xuất': 'brand',
  'kết nối': 'connection',
  'kiểu kết nối': 'connection',
  'switch': 'switch',
  'loại switch': 'switch',
  'loại phím': 'switch',
  'kiểu màn hình': 'shape',
  'kiểu': 'shape',
  'bố cục': 'layout',
  'cân nặng': 'weight',
  'cảm biến': 'sensor',
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
}

export function normalizeQueryValue(value: string): string {
  const normalized = normalizeText(value)
  return normalized.replace(/\s+/g, '-')
}

export function rawValueToSlug(filterKey: string, rawValue: string): string | null {
  const def = productFilters.find((f) => f.key === filterKey)
  if (!def) return null
  const lower = rawValue.toLowerCase()
  for (const opt of def.options) {
    if (opt.aliases.some((alias) => lower.includes(alias.toLowerCase()))) {
      return opt.value
    }
  }
  return null
}

export function getFilterLabel(key: string, slugValue: string): string {
  if (key === 'category') {
    return CATEGORY_SLUG_TO_NAME[slugValue] ?? slugValue
  }
  if (key === 'brand') {
    return slugValue
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }
  const def = productFilters.find((f) => f.key === key)
  const opt = def?.options.find((o) => o.value === slugValue)
  return opt?.label ?? slugValue
}

export function textMatchesFilterSlug(text: string, key: string, slugValue: string): boolean {
  const lower = text.toLowerCase()
  
  if (key === 'brand') {
    return lower.includes(slugValue.toLowerCase())
  }
  
  const def = productFilters.find((f) => f.key === key)
  if (!def) return lower.includes(slugValue.toLowerCase())
  
  const opt = def.options.find((o) => o.value === slugValue)
  if (!opt) return false
  
  return opt.aliases.some((alias) => lower.includes(alias.toLowerCase()))
}

export function parseFilterValue(value: string): string[] {
  if (!value) return []
  return value.split(',').map((v) => v.trim()).filter(Boolean)
}