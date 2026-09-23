# Routes — Authentication

Covers `/auth`, `/auth/otp`, `/auth/password`, `/auth/register`, and the root splash `/`.
Flow overview: [`../01-flows.md` §1](../01-flows.md). Visual specs link into [`design-system/06-components.md`](../../design-system/06-components.md).

**Shared visual context:** all auth screens sit on a **full-bleed brand-blue (`#0655CB`) background** with a centered white **Card** (~384 px max). The logo is rendered white (knockout). No TopBar/BottomNav. RTL; phone/OTP inputs forced LTR. Inner screens have an in-card back affordance (right-arrow + "رجوع").

---

## `/` — Splash / redirect gate

**Purpose:** decide where to send the user on app open.
**Behavior:** on mount, if authenticated → replace to `/home`, else → replace to `/auth`. Renders a centered splash while deciding.

```
┌──────────────────────────────┐
│         (#F5F5F5 page)       │
│                              │
│            📚                │  ← 48px book emoji
│        أبواب بلس              │  ← 24px bold, brand blue
│       جاري التحميل...         │  ← muted
│                              │
└──────────────────────────────┘
```
**Stores:** Auth (`isAuthenticated`).

---

## `/auth` — Phone entry

**Purpose:** collect phone, route new vs returning user.
**Entry:** splash (guest), or app-guard redirect.

```
┌──────────────────────────────┐  bg: brand blue
│         [white logo]         │
│      منصتك التعليمية الأولى    │  ← tagline, white@70%
│   ┌──────────────────────┐   │
│   │  تسجيل الدخول          │   │  ← 18px bold (card)
│   │  رقم الهاتف            │   │  ← 12px label
│   │ ┌──────────────────┐ │   │
│   │ │ 01xxxxxxxxx (LTR) │ │   │  ← Input, tel, max 11
│   │ └──────────────────┘ │   │
│   │ [error line if any]  │   │  ← 12px red
│   │ ┌──────────────────┐ │   │
│   │ │     متابعة        │ │   │  ← full-width blue button
│   │ └──────────────────┘ │   │
│   │  ادخل رقمك للبدء...    │   │  ← helper, muted
│   └──────────────────────┘   │
└──────────────────────────────┘
```

**Data:** local phone + error.
**Actions:** "متابعة" → validate `^01[0125]\d{8}$`; on fail show error; on pass store phone, then branch: existing student → `/auth/password`, else → `/auth/otp`. Typing clears the error.
**Validation:** Egyptian mobile, 11 digits. Error: "رقم الهاتف غير صحيح. يجب أن يبدأ بـ 01 ويتكون من 11 رقم".
**Components:** Card, Input (LTR phone), Button (primary). **Test ids:** `phone-input`, `phone-error`, `continue-button`.
**Stores:** Auth (`setPhone`, `findStudentByPhone`).

---

## `/auth/otp` — OTP verification (new user)

**Purpose:** verify a 4-digit code before registration.
**Entry:** `/auth` when phone is unknown.

```
┌──────────────────────────┐ (card)
│ ← رجوع                    │  ← back affordance
│   تأكيد رقم الهاتف         │  ← 18px bold
│  أدخل الرمز المرسل إلى …    │  ← subtitle w/ phone
│   ┌──────────────────┐   │
│   │   - - - -        │   │  ← OTP input: centered, 24px bold, wide tracking, LTR
│   └──────────────────┘   │
│   [error if any]         │
│   ┌──────────────────┐   │
│   │      تأكيد         │   │  ← full-width blue
│   └──────────────────┘   │
│  للتجربة: أي ٤ أرقام       │  ← helper
└──────────────────────────┘
```

**Actions:** "تأكيد" → validate exactly 4 digits → verify → `/auth/register`. Back → history back. Input strips non-digits, caps at 4.
**Validation:** `^\d{4}$`; errors "الرمز يجب أن يتكون من ٤ أرقام" / "رمز خاطئ، حاول مرة أخرى".
⚠ **PROTOTYPE:** any 4 digits pass.
**Components:** Card, Input (OTP treatment), Button. **Test ids:** `otp-input`, `otp-error`, `verify-button`.
**Stores:** Auth (`pendingPhone`, `verifyOtp`).

---

## `/auth/password` — Password login (returning user)

**Purpose:** returning-user password login.
**Entry:** `/auth` when phone is a known student.

```
┌──────────────────────────┐ (card)
│ ← رجوع                    │
│   مرحباً بعودتك!           │  ← 18px bold
│   {phone number}          │  ← subtitle
│   كلمة المرور             │  ← label
│   ┌──────────────────┐   │
│   │ ●●●●●●●● (password)│   │
│   └──────────────────┘   │
│   [error if any]         │
│   ┌──────────────────┐   │
│   │   تسجيل الدخول     │   │  ← full-width blue
│   └──────────────────┘   │
└──────────────────────────┘
```

**Actions:** "تسجيل الدخول" → require ≥4 chars → login → replace to `/home`. Back → history back.
**Validation:** min 4 chars; errors "كلمة المرور يجب أن تكون ٤ أحرف على الأقل" / "حدث خطأ في تسجيل الدخول".
⚠ **PROTOTYPE:** any password works.
**Components:** Card, Input (password), Button. **Test ids:** `password-input`, `password-error`, `login-button`.
**Stores:** Auth (`login`, `pendingPhone`).

---

## `/auth/register` — Registration (new user)

**Purpose:** complete the new-user profile after OTP.
**Entry:** `/auth/otp` on success.

```
┌──────────────────────────┐ (card, scrollable)
│ ← رجوع                    │
│   إنشاء حساب جديد          │  ← 18px bold
│   الاسم الكامل            │  → Input
│   رقم ولي الأمر           │  → Input (tel, LTR, 11)
│   الصف                    │  → Select (grades)
│   التخصص  (only if 2nd/3rd secondary) → Select
│   المحافظة                │  → Select (governorates)
│   ┌──────────────────┐   │
│   │   إنشاء الحساب     │   │  ← full-width brand-BLUE button (CTA)
│   └──────────────────┘   │
└──────────────────────────┘
```

**Data:** local form (name, parentPhone, grade, specialization, governorate) + per-field errors; option lists from constants (GRADES, GOVERNORATES, SPECIALIZATIONS).
**Conditional:** specialization Select appears only for secondary-2/secondary-3; changing grade resets specialization.
**Actions:** "إنشاء الحساب" → validate → register → replace to `/home`. Back → history.
**Validation:** name required; parent phone Egyptian format; grade required; specialization required if secondary; governorate required. Field-level red errors.
**Components:** Card, Input (text, LTR phone), Select (×3), Button (primary). **Test ids:** `name-input`, `parent-phone-input`, `grade-select`, `specialization-select`, `governorate-select`, `register-button`.
**Stores:** Auth (`pendingPhone`, `register`).

> **Brand-reconciled:** the register CTA uses **brand blue** (`#0655CB`), like all CTAs. The prototype rendered it green; that's superseded (see `../brand-alignment.md`).
