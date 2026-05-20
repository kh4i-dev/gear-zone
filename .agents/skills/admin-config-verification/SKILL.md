# skills/admin-config-verification/SKILL.md

> Verify that admin panel configurations actually apply to the storefront. Use when user wants to verify admin settings work, asks about hardcoded values, or wants to audit admin-to-frontend consistency.

## Purpose

This skill ensures admin configurations actually work on the frontend by checking:
1. Admin config values are stored in database
2. Frontend reads from the same source
3. No hardcoded fallback that bypasses database
4. Cache invalidation after save
5. Preview matches production render

---

## Verification Checklist

### 1. Shop Identity Verification

```php
// Check: Is shop name hardcoded in any blade?
Grep: "Khai Shop" in *.blade.php files
Expected: Only in placeholders/defaults, not in production render

// Check: Does $siteData['name'] exist in blade?
Grep: "\$siteData\['name'\]" in pages/*.blade.php
Expected: All shop name references use $siteData

// Check: Is SiteSettingService::name() used correctly?
Read: app/Services/SiteSettingService.php
Verify: name() returns DB value with config fallback
```

### 2. Hero Configuration Verification

```php
// Check: Hero stored in site_settings table?
Grep: "SiteSetting::set.*hero_" in HeroController.php
Expected: All hero_* keys saved to DB

// Check: Frontend reads from SiteSettingService::hero()?
Grep: "siteSettings->hero()" in PageController.php
Expected: Hero data from service, not hardcoded

// Check: Empty field = no render (not fallback hardcode)?
Grep: "\$hero\['title'\]" in hero/*.blade.php
Expected: @if($hero['title']) ... @endif or ?? fallback

// Check: Preview uses same transformer as storefront?
Read: admin/hero-builder.blade.php preview section
Verify: Same Blade component as storefront
```

### 3. Category Media Verification

```php
// Check: Media stored in JSON column?
Read: Category model - media column type
Expected: JSON column with purpose mapping

// Check: Media accessed via MediaHelper::get()?
Grep: "MediaHelper::get" in CategoryController, PageController
Expected: All media access through helper

// Check: No hardcoded thumbnail/hero_banner fields?
Grep: "->thumbnail" or "->hero_banner" in resources/views
Expected: Only through MediaHelper

// Check: Eager loading parent for fallback?
Grep: "->with\('parent" in category queries
Expected: parent:id,name,slug,media for N+1 prevention
```

### 4. Category Price Display Verification

```php
// Check: Service category cards show price?
Grep: "starting_price" in category card blade
Expected: Shows category price, not account price

// Check: Game page header doesn't show price?
Read: resources/views/pages/category.blade.php hero section
Expected: No price display in category header

// Check: Account listing shows account price?
Grep: "account->price" in product card blade
Expected: Shows account.price, not category.price
```

### 5. Cache Invalidation Verification

```php
// Check: SettingsController calls invalidateCache?
Grep: "invalidateCache" in SettingsController.php
Expected: After any site_setting save

// Check: HeroController calls invalidateCache?
Grep: "invalidateCache" in HeroController.php
Expected: After hero save

// Check: Cache key is consistent?
Verify: Same key in service and controller
Expected: 'site_settings' key used everywhere
```

---

## How to Use

### Before Making Admin Changes
```
1. Run verification checklist on the relevant area
2. Identify any hardcoded values or missing dynamic bindings
3. Fix before implementing new admin feature
```

### After Admin Feature Implementation
```
1. Verify config is saved to DB (SiteSetting or model column)
2. Verify frontend reads from same source
3. Check for hardcoded fallbacks
4. Verify cache invalidation exists
5. Compare preview to production render
```

### Example: Adding New Admin Setting

```php
// BEFORE: Create setting in admin panel
// 1. Where is it stored?
//    ✓ SiteSetting::set('new_setting', $value) → site_settings table
//    ✗ $this->settings['new_setting'] = $value → in-memory only

// 2. Where does frontend read it?
//    ✓ SiteSettingService::get('new_setting')
//    ✗ config('site.new_setting') → bypasses DB

// 3. Is there hardcoded fallback?
//    ✓ $value ?? 'default'
//    ✗ 'Khai Shop' hardcoded

// 4. Is cache invalidated?
//    ✓ SiteSettingService::invalidateCache()
//    ✗ No cache handling
```

---

## Common Anti-Patterns to Catch

| Anti-Pattern | What to Check | Fix |
|-------------|---------------|-----|
| Hardcoded shop name | `Grep: "Khai Shop"` | Replace with `$siteData['name']` |
| Hardcoded hero fallback | `Grep: "config\('site.hero` in blade` | Use service with fallback |
| Missing eager load | `Grep: "->with\('parent"` in category query` | Add eager loading |
| No cache invalidation | `Grep: "invalidateCache"` in controller` | Add after save |
| Direct field access | `Grep: "->media\[` in blade` | Use MediaHelper::get() |
| Wrong price display | `Grep: "account->price" in category card` | Use category.starting_price |

---

## Files to Audit

| Area | Files to Check |
|------|---------------|
| Shop Identity | `SiteSettingService.php`, `settings/index.blade.php`, `category.blade.php` |
| Hero | `HeroController.php`, `hero-builder.blade.php`, `components/hero/*.blade.php` |
| Category | `CategoryController.php`, `MediaHelper.php`, `category.blade.php` |
| Site Settings | `SettingsController.php`, `SiteSetting.php`, `SiteSettingService.php` |

---

## Output Format

After verification, report:

```
### Admin Config Verification: [FEATURE]

#### ✅ PASSED
- [x] Setting stored in database
- [x] Frontend reads from service
- [x] No hardcoded fallbacks
- [x] Cache invalidation works

#### ❌ FAILED
- [ ] **Shop name hardcoded in category.blade.php line 48**
  - Current: `<a href="/">Khai Shop</a>`
  - Expected: `<a href="/">{{ $siteData['name'] ?? 'Shop' }}</a>`
  - Status: FIXED

#### 🔄 NEEDS VERIFICATION
- [ ] Preview in admin matches production render
- [ ] Cache clears after save
```

---

## Related Docs

- `docs/adr/0001-category-media-purpose-json.md`
- `docs/adr/0002-shop-identity-dynamic.md`
- `docs/HOMEPAGE_BUILDER.md`
- `docs/CATEGORY_CMS.md`
- `docs/ARCHITECTURE.md` Section 3.8 (SiteSettingService)
