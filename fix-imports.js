const fs = require('fs');

const path = 'src/app/admin/products/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const correctImports = `'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Boxes, ImageIcon, Loader2, Package, Plus, Search, ShieldCheck, Tag, TrendingUp, Edit2, Trash2, 
  EyeOff, XCircle, Copy, ExternalLink, MoreVertical, AlertTriangle, ListFilter, X
} from 'lucide-react'
import { Navbar } from '@/components/domain/Navbar'
import { Button, Input, MoneyInputVND } from '@/components/domain/ui'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatPrice, sanitizeProductExcerpt } from '@/lib/utils'
import { getPrimaryLegacyImageUrl, getSafeImageSrc } from '@/lib/product-images'
import { toast } from 'sonner'
import { getAdminPath } from '@/lib/adminPath'
import { AdminProductForm } from '@/components/domain/AdminProductForm'
import { AdminProductFilters } from '@/components/domain/AdminProductFilters'
import { AdminProductTable } from '@/components/domain/AdminProductTable'
import type { AdminOptionGroup, AdminVariant } from '@/components/domain/AdminVariantEditor'
import { hydrateAdminVariants, parseSpecText, serializeSpecs } from '@/lib/products/adminProductForm'
import { buildCategoryCounts, buildBrandCounts } from '@/lib/products/adminProductFilters'
`;

// Find the first interface definition to know where imports end
const interfaceIdx = content.indexOf('interface AdminProduct {');
if (interfaceIdx !== -1) {
  content = correctImports + '\n' + content.substring(interfaceIdx);
  fs.writeFileSync(path, content);
  console.log('Fixed imports');
} else {
  console.log('interface AdminProduct not found');
}
