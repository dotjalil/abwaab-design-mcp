# Routes — Commerce

Covers `/cart`, `/cart/checkout`, and `/bundle/[bundleId]`.
Purchase flow: [`../01-flows.md` §3](../01-flows.md).

**Chrome:** these screens use the 512 px column + own TopBar but **no BottomNav** (focused purchase flow).

> **Brand-reconciled color (supersedes prototype green):** CTAs (checkout, pay, buy-now) = **brand blue** `#0655CB`; savings/promo cues (bundle price, savings badge, bundle suggestion) = **brand yellow** `#FFCA00`; success *feedback* (the purchase-success disc) stays **green**. See `../brand-alignment.md`.

---

## `/cart` — Shopping cart

**Purpose:** review line items, see conflicts and bundle savings, proceed to checkout.
**Chrome:** TopBar "سلة التسوق" + back.

```
┌──────────────────────────────────────┐
│ TopBar:  سلة التسوق             ←      │
├──────────────────────────────────────┤
│  EMPTY → 🛒 السلة فارغة                 │
│          [ استكشف الكورسات ] (blue)    │
│  — or —                               │
│ ┌ ⚠ تنبيه (orange) ─────────────────┐ │  ← conflict notice (if any)
│ │ • الكورس "X" مشمول في المسار "Y"… │ │
│ └────────────────────────────────────┘│
│ ┌ 🎁 (yellow) ───────────────────────┐│  ← bundle suggestion (savings → highlight)
│ │ وفّر أكثر مع باقة التفوق! …          ││
│ └────────────────────────────────────┘│
│ ┌ cart items ───────────────────────┐ │
│ │ {title}  [كورس/مسار][tier]         │ │  ← line item
│ │                {price} ج.م   [🗑]  │ │  ← price + remove (red, 44px)
│ └────────────────────────────────────┘│
│ ┌ summary ──────────────────────────┐ │
│ │ المجموع              {total} ج.م   │ │
│ │ [     إتمام الشراء (brand blue)   ] │ │  → /cart/checkout
│ └────────────────────────────────────┘│
└──────────────────────────────────────┘
```

**Regions:** EmptyState 🛒 (with explore CTA) when empty; else **conflict notice** (`conflict-notice`, orange — a cart course already covered by a cart track), **bundle suggestion** (`bundle-suggestion`, green — ≥2 course items → upsell a cheaper bundle), **items** (`cart-items`; each: title + type badge + optional tier badge + price + remove `remove-item-{id}`), **summary** (`cart-summary`; total + checkout `checkout-button`).
**Item vocabulary:** type course/track/bundle → "كورس/مسار/باقة"; tier monthly/semester/full-year → "شهري/فصلي/سنوي".
**Actions:** remove item; explore CTA → `/explore`; checkout → `/cart/checkout`.
**Components:** EmptyState, tinted status banners, cart line item, Badge, Button. **Test ids:** `conflict-notice`, `bundle-suggestion`, `cart-items`, `remove-item-{id}`, `cart-summary`, `checkout-button`.
**Stores:** Cart (`items`, `removeItem`, `getTotal`, `getConflicts`, `getBundleSuggestion`).

---

## `/cart/checkout` — Checkout

**Purpose:** order review, mandatory refund agreement, payment, success + enrollment.
**Chrome:** TopBar "إتمام الشراء" + back. Empty cart → redirects to `/cart`.

```
┌──────────────────────────────────────┐
│ TopBar:  إتمام الشراء           ←      │
├──────────────────────────────────────┤
│ ┌ ملخص الطلب ───────────────────────┐ │
│ │ {item}                 {price} ج.م │ │  ← order line per item
│ │ المجموع                {total} ج.م │ │
│ └────────────────────────────────────┘│
│ ┌ سياسة الاسترداد ──────────────────┐ │
│ │ {7-day / <30% completion text}     │ │
│ │ ☐ أوافق على سياسة الاسترداد        │ │  ← Checkbox (required)
│ └────────────────────────────────────┘│
│ [ ادفع {total} ج.م  (brand blue, tall) ] │  ← disabled until checkbox checked
└──────────────────────────────────────┘

SUCCESS view:
┌──────────────────────────────────────┐
│ TopBar:  تم الشراء                     │
│        (✓ 96px green disc)            │
│     تم الشراء بنجاح! 🎉                 │  ← 24px bold blue
│   [ اذهب لكورساتي (blue) ]             │  → /courses
│   [ العودة للرئيسية (outline) ]         │  → /home
└──────────────────────────────────────┘
```

**Actions:** check refund agreement (`refund-checkbox`) enables pay; "ادفع" (`pay-button`) → create payment record, clear cart, then per item enroll: course → enroll; track → enroll each course in the track; **bundle → ⚠ NO-OP (dead code)**; then success view → `/courses` or `/home`.
**States:** main form / success (`checkout-success`) / empty-redirect.
**Components:** Card, order line, Checkbox, Button (success, tall), success disc. **Test ids:** `checkout-success`, `refund-checkbox`, `pay-button`.
**Stores:** Cart (`items`, `getTotal`, `checkout`), Course (`enrollInCourse`).

> ⚠ **Bug to fix:** bundles added to the cart record a payment but are never enrolled at checkout. Either enroll bundles here, or (per PRD §5.5) disallow bundles in the cart entirely and force the single-transaction bundle path.

---

## `/bundle/[bundleId]` — Bundle detail

**Purpose:** bundle landing — identity, discounted vs original price + savings, included courses, two purchase paths.
**Chrome:** TopBar "تفاصيل الباقة" + back. No BottomNav.

```
┌──────────────────────────────────────┐
│ TopBar:  تفاصيل الباقة           ←     │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │            🎁 (48px)               │ │  ← bundle header (centered)
│ │            {title}                │ │
│ │            {description}          │ │
│ │     {price} ج.م   {original ̶p̶}    │ │  ← price + strikethrough original
│ │        [وفّر {savings} ج.م]         │ │  ← savings badge (brand yellow → highlight)
│ └──────────────────────────────────┘ │
│ ┌ الكورسات المشمولة ({n}) ───────────┐ │
│ │ 🧪 {course}   {price} ج.م منفرداً  │ │  ← included course rows
│ └────────────────────────────────────┘│
│ [ اشترِ الآن - {price} ج.م (brand blue) ] │  ← buy now → enroll all → /courses
│ [   أضف للسلة (navy outline)         ] │  ← add bundle to cart → /cart
└──────────────────────────────────────┘
```

**Regions:** header (emoji, title, description, price block + strikethrough original, savings badge in brand yellow); included-courses card (rows with standalone price); two CTAs (buy-now = brand blue, add-to-cart = blue outline).
**Actions:** **buy now** (`bundle-buy-now`) → enroll **all** bundle courses → `/courses` (the working enrollment path); **add to cart** (`bundle-add-to-cart`) → add bundle line item → `/cart` (⚠ but checkout won't enroll it).
**Not-found:** TopBar "باقة غير موجودة" + ❌.
**Components:** AvatarTile/emoji, price block, Badge (savings), included-course row, Button (success + outline). **Test ids:** `bundle-buy-now`, `bundle-add-to-cart`.
**Stores:** Cart (`addItem`), Course (`enrollInCourse`).

> Per PRD §5.6, bundle purchase should **credit** any already-owned courses toward the bundle price (upgrade path) — not implemented in the prototype.
