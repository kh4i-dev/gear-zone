const fs = require('fs');

const path = 'src/app/admin/products/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const startMarker = '{(showForm || editingId !== null) && (';
const endMarker = '</main>';

// We know the form is after line 500, so let's start searching from there
const searchOffset = content.indexOf('return (', 500);
if (searchOffset === -1) {
  console.log('return ( not found');
  process.exit(1);
}

const matchIdx = content.indexOf(startMarker, searchOffset);
if (matchIdx === -1) {
  console.log('startMarker not found');
  process.exit(1);
}

// Find the start of the line with the startMarker
let lineStart = matchIdx;
while (lineStart > 0 && content[lineStart - 1] !== '\\n') {
  lineStart--;
}

const endIndex = content.indexOf(endMarker, matchIdx);
if (endIndex === -1) {
  console.log('endMarker not found');
  process.exit(1);
}

const replacement = `        {(showForm || editingId !== null) && (
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
      `;

content = content.substring(0, lineStart) + replacement + content.substring(endIndex);

// Update imports
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

const interfaceIdx = content.indexOf('interface AdminProduct {');
if (interfaceIdx !== -1) {
  content = correctImports + '\\n' + content.substring(interfaceIdx);
  fs.writeFileSync(path, content);
  console.log('Successfully refactored page.tsx');
} else {
  console.log('interface AdminProduct not found');
  process.exit(1);
}
