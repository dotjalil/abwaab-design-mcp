# Routes — Profile

Covers `/profile` (account hub) and `/profile/academic` (full academic report).
Identity & reporting flow: [`../01-flows.md` §6](../01-flows.md).

---

## `/profile` — Account

**Purpose:** identity, contact info, scannable QR id, academic entry, billing, settings/support, logout.
**Chrome:** TopBar "حسابي" (no back); AppShell ("profile" active).

```
┌──────────────────────────────────────┐
│ TopBar:  حسابي                         │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │ 🟢  {name}                        │ │  ← profile header (64px avatar)
│ │     {grade}   [specialization]    │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ ☎ رقم الهاتف        {phone, LTR}  │ │  ← InfoRow ×4 (hairline-separated)
│ │ 👤 رقم ولي الأمر    {parent, LTR} │ │
│ │ 🎓 الصف             {grade}       │ │
│ │ 📍 المحافظة          {governorate}│ │
│ └──────────────────────────────────┘ │
│ ┌ QR card (tap to reveal) ─ qr ─ ‹/▾ ┐│  ← CollapsibleCard → 200px blue QR
│ ┌ التقرير الأكاديمي  إكمال:x% اختبارات:y ‹│  ← academic card → /profile/academic
│ ┌ الفواتير (tap to reveal) ──── ‹/▾ ──┐│  ← billing CollapsibleCard
│ ┌ ⚙ الإعدادات   /   ❓ المساعدة ──────┐│  ← settings/support (placeholders)
│ [        تسجيل الخروج (red outline)   ]│  ← logout
├──────────────────────────────────────┤
│ BottomNav                             │
└──────────────────────────────────────┘
```

**Regions:** profile header (`profile-card`); InfoRow group (phone/parent/grade/governorate; phones LTR); **QR card** (`qr-card` → toggles `qr-display`: 200 px QR, blue modules on white, caption = student id); **academic card** (`academic-card` → `/profile/academic`, shows inline completion % and avg score); **billing card** (`billing-card` → `billing-details`: payment rows or "لا توجد فواتير"); settings & support rows (no handlers yet); **logout** (`logout-button`, red outline → clears session → `/auth`).
**Data:** student identity; derived overall completion + avg score; payment history.
**Components:** AvatarTile, InfoRow, Separator, CollapsibleCard, QRBlock, Badge, Button. **Test ids:** `profile-card`, `qr-card`, `qr-display`, `academic-card`, `billing-card`, `billing-details`, `logout-button`.
**Stores:** Auth (`currentStudent`, `logout`), Course (`enrolledCourseIds`, `completedFileIds`, `examScores`), Cart (`payments`).

> The QR encodes the student id for offline attendance scanning (admin-side, PRD §10.3). Per PRD, the real QR should carry a short-lived token to prevent screenshot sharing.

---

## `/profile/academic` — Academic report

**Purpose:** full read-only academic dashboard (the expanded version of the home snippet).
**Chrome:** TopBar "التقرير الأكاديمي" + back. No store mutations.

```
┌──────────────────────────────────────┐
│ TopBar:  التقرير الأكاديمي       ←     │
├──────────────────────────────────────┤
│ 🟢 {name} · {grade}                    │  ← header row
│ ┌─ الأداء العام (overall-performance) ─┐│
│ │ ┌ 📈 تقييم الأداء  {tag}   (ring) ┐ │ │  ← PerformanceTag + RingChart(70)
│ │ نسبة الإكمال الكلية   ▓▓▓▓▓ {x}%   │ │  ← StatBar (blue)
│ │ متوسط الاختبارات     ▓▓▓ {y}%/—   │ │  ← StatBar (green/red, or — )
│ │ الاختبارات المكتملة  ▓▓ {n}/{m}    │ │  ← StatBar (blue)
│ │ [كورسات {a}][أخطاء {b}][تنبيهات {c}]│ │  ← quick-stat grid (3-col)
│ └────────────────────────────────────┘│
│ ┌─ الشارات ──────────────────────────┐│  ← achievement Badges (wrap)
│ │ [متفوق][ملتزم][بدون تنبيهات] …      ││
│ └────────────────────────────────────┘│
│ أداء الكورسات                          │  ← per-course breakdown
│ ┌ 🧪 {course} · {teacher}  [مع متابعة]┐│
│ │ نسبة الإكمال ▓▓▓ {done}/{total}     ││  ← StatBar
│ │ متوسط الاختبارات ▓▓ {avg}%          ││  ← StatBar (if any)
│ │ اختبارات مكتملة            {n}/{m}  ││
│ └────────────────────────────────────┘│
│ ┌─ سجل التنبيهات (if any warnings) ───┐│  ← warnings history (red)
│ │ • {warning} • {warning}             ││
│ └────────────────────────────────────┘│
└──────────────────────────────────────┘
```

**Sections:** Overall performance (`overall-performance`) = PerformanceTag banner + RingChart (only if quizzes done) + three StatBars (overall completion, avg score, exams completed) + 3-col quick-stat grid (enrolled courses / active mistakes / warnings — warnings number colored 0=green, ≤2=orange, else red); Achievement **badges** (متفوق ≥75 / جيد 50–74 / يحتاج تحسين 1–49 / ملتزم completion≥80 / بدون تنبيهات 0-warnings; empty fallback prompt); Per-course breakdown (icon + title + teacher + type badge + StatBars + completed-quiz line); Warnings history (only if warnings exist).
**Data:** overall completion, avg score, per-course stats, mistakes count, warnings.
**Components:** PerformanceTag, RingChart, StatBar, Badge (achievements), AvatarTile, Card. **Test id:** `overall-performance`.
**Stores:** Auth (`currentStudent`, warnings), Course (`enrolledCourseIds`, `completedFileIds`, `examScores`, `mistakes`).

> Per PRD §9, this report should also drive the weekly parent WhatsApp PDF; the metrics here are the same set. The new build should expose them in an exportable form.
