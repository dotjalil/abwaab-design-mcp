# Routes — Explore

Covers `/explore`. Browse and purchase courses, tracks, and bundles.
Purchase flow: [`../01-flows.md` §3](../01-flows.md).

**Chrome:** TopBar "استكشف" + cart; AppShell ("explore" active).

---

## Wireframe

```
┌──────────────────────────────────────┐
│ TopBar:  استكشف               [🛒]     │
├──────────────────────────────────────┤
│ ┌──────────────────────────────[🔍]┐ │  ← search (icon on RIGHT, RTL)
│ │ ابحث عن كورس...                   │ │
│ └──────────────────────────────────┘ │
│ [ الصف: {grade}              ▾ ]      │  ← grade toggle → bottom sheet
│ [الكل][كيمياء][رياضيات] →             │  ← subject chips
│ [   كورسات   |   مسارات   ]           │  ← course/track toggle
│ ┌──────────────────────────────────┐ │
│ │ 🎁 وفّر مع باقة …    {p} {p̶}  [‹]  │ │  ← bundle banner (orange, courses tab only)
│ └──────────────────────────────────┘ │
│ ── COURSES list ──                    │
│ ┌──────────────────────────────────┐ │
│ │ 🧪 {title}                        │ │  ← CourseCard(explore)
│ │    {teacher}                      │ │
│ │    [موجّه][grade]                  │ │
│ │    {price} ج.م        [🛒 أضف]     │ │  ← add-to-cart (brand blue)
│ └──────────────────────────────────┘ │
│ ── or TRACKS list ──                  │
│ ┌──────────────────────────────────┐ │
│ │ 🏆 {title} · {teacher}            │ │  ← TrackCard
│ │    {n} كورسات                     │ │
│ │    [شهري {p}][فصلي {p}]            │ │
│ │    [        اشترك الآن         ]   │ │  ← (blue)
│ └──────────────────────────────────┘ │
│   — empty → 🔍 لا توجد نتائج / مسارات   │
├──────────────────────────────────────┤
│ BottomNav                             │
└──────────────────────────────────────┘
```

---

## Regions
1. **Search** — input with magnifier pinned right; filters by course title or subject. `search-input`.
2. **Grade toggle** (`grade-toggle`) — opens a **bottom Sheet** "اختر الصف الدراسي" listing "الكل" + all grades; selecting sets the grade and closes. Default = student's signup grade.
3. **Subject chips** — `[الكل, كيمياء, رياضيات, فيزياء, أحياء, علوم]` (blue family).
4. **Course/Track toggle** — "كورسات" (`show-courses`) / "مسارات" (`show-tracks`).
5. **Bundle banner** (`bundle-banner`, courses tab only, if any bundle) — emoji + title + discounted/original price + "التفاصيل" (→ `/bundle/{id}`). Orange-tinted.
6. **Results list:**
   - **Courses** (`explore-course-list`): excludes already-enrolled; each **CourseCard (explore)** (`explore-course-{id}`) with "أضف للسلة" (`add-to-cart-{id}`, adds course to cart).
   - **Tracks** (`explore-track-list`): each **TrackCard** (`track-{id}`) with "اشترك الآن" (`add-track-{id}`, adds **monthly** tier to cart).
   - Empty → EmptyState 🔍.

## Data & filters
- Sources: courses, tracks, bundles, teachers.
- Course filter: not-enrolled AND grade (if set) AND subject (unless "الكل") AND search match (title or subject).
- Track filter: grade AND subject (no search, no enrollment exclusion).
- Defaults: grade = student grade; subject = "الكل"; tab = courses.

## Actions
Search type; grade select (sheet); subject chip; course/track toggle; bundle "التفاصيل" → bundle page; "أضف للسلة" → add course item; "اشترك الآن" → add track (monthly) item. Cart additions don't navigate (TopBar badge updates).

## Components used
Input (search), Sheet (bottom, grade picker), ChipFilter, segmented toggle, bundle banner (tinted), CourseCard (explore), TrackCard, Badge, Button, EmptyState. (→ [`06-components.md`](../../design-system/06-components.md))

## Stores
Auth (`currentStudent` for default grade), Course (`enrolledCourseIds` to exclude), Cart (`addItem`). (Explore filter state may live in the Explore UI store.)

> Track "اشترك الآن" defaults to the **monthly** tier — the new build should let the user pick a tier (monthly/semester/full-year) before adding, per PRD §5.2.
