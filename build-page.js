const fs = require('fs');

const path = 'src/app/admin/products/page.tsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');

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

// Find interface AdminProduct
const interfaceIdx = lines.findIndex(l => l.includes('interface AdminProduct {'));
const startIdx = lines.findIndex(l => l.includes('{(showForm || editingId !== null) && ('));

if (interfaceIdx === -1 || startIdx === -1) {
  console.log('Could not find markers');
  process.exit(1);
}

const beforeForm = lines.slice(interfaceIdx, startIdx).join('\n');

const newComponents = `        {(showForm || editingId !== null) && (
          <AdminProductForm
            formData={formData}
            setFormData={setFormData}
            existingCategories={existingCategories}
            isSaving={isSaving}
            isUploading={isUploading}
            editingId={editingId}
            hasSubmitted={hasSubmitted}
            handleImageUpload={handleImageUpload}
            handleSubmit={handleSubmit}
            handleCancelEdit={handleCancelEdit}
            previewVariant={previewVariant}
            previewPrice={previewPrice}
            previewOldPrice={previewOldPrice}
            previewStock={previewStock}
            formHasVariants={formHasVariants}
            formVariantStockTotal={formVariantStockTotal}
          />
        )}

        <AdminProductFilters
          products={products}
          categoryStats={categoryStats}
          brandStats={brandStats}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          filterTab={filterTab}
          setFilterTab={setFilterTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <AdminProductTable
          isLoading={isLoading}
          filteredProducts={filteredProducts}
          resolvedBrands={resolvedBrands}
          openActionMenuId={openActionMenuId}
          setOpenActionMenuId={setOpenActionMenuId}
          handleEditClick={handleEditClick}
          handleToggleVisibility={handleToggleVisibility}
          handleToggleStatus={handleToggleStatus}
          handleDuplicateProduct={handleDuplicateProduct}
          handleDeleteProduct={handleDeleteProduct}
          getSalesStatus={getSalesStatus}
          getAdminProductStock={getAdminProductStock}
          getInventoryStatus={getInventoryStatus}
          getProductBrand={getProductBrand}
        />
      </main>
    </div>
  )
}
`;

const finalContent = correctImports + '\n' + beforeForm + '\n' + newComponents;
fs.writeFileSync(path, finalContent);
console.log('Successfully refactored page.tsx');
