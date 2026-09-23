# Routes — Home / Dashboard

Covers `/home`. The student's landing screen after login.

**Chrome:** TopBar with **logo + cart** (no title), inside the AppShell (BottomNav, "home" active). Content padded 16 px, sections 16 px apart.

---

## Wireframe

```
┌──────────────────────────────────────┐
│ TopBar:  [logo]              [🛒 cart] │
├──────────────────────────────────────┤
│ 🟢 أهلاً {firstName}!                   │  ← welcome: avatar + name + grade
│    {grade}                            │
│ ┌──────────────────────────────────┐ │
│ │ ملخص أدائك        التقرير الكامل ‹ │ │  ← analytics card
│ │ ┌──────────────────────────────┐ │ │
│ │ │ 📈 تقييم الأداء   {tag}   {x}% │ │ │  ← PerformanceTag banner (tinted)
│ │ └──────────────────────────────┘ │ │
│ │ ┌─────────────┐ ┌─────────────┐  │ │
│ │ │نسبة الإكمال  │ │اختبارات مكتملة│  │ │  ← two stat tiles
│ │ │ ▓▓▓▓░ {c}%  │ │  {n} / {m}   │  │ │
│ │ └─────────────┘ └─────────────┘  │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ ⚠ تنبيهات (n)   OR  ✅ لا توجد...  │ │  ← warnings (red) / no-warnings (green)
│ └──────────────────────────────────┘ │
│ كورساتي                  عرض الكل ‹    │  ← section header
│ ┌────┐┌────┐┌────┐  →                 │  ← horizontal scroll of CourseCard(mini)
│ │mini││mini││mini│                     │
│ └────┘└────┘└────┘                     │
│ ┌──────────────────────────────────┐ │
│ │ 🔑 كود الوصول                     │ │  ← access-key card
│ │ [ input (LTR) ]      [ تفعيل ]    │ │
│ │ [message: green success / red err]│ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ 📅 الجدول الدراسي — قريباً         │ │  ← timetable placeholder
│ └──────────────────────────────────┘ │
├──────────────────────────────────────┤
│ BottomNav: [home*][courses][msg][…]  │
└──────────────────────────────────────┘
```

---

## Regions (top → bottom)

1. **Welcome** — circular emoji avatar (tinted) + "أهلاً {first name}!" (18 px bold) + grade (12 px muted). `data-testid="welcome-section"`.
2. **Analytics card** (`analytics-card`) — header "ملخص أدائك" + "التقرير الكامل ‹" link (→ `/profile/academic`, `view-full-report`). Contains:
   - **PerformanceTag** banner — trend icon + label + tag word, tinted by score threshold; shows avg score % (LTR) when ≥1 quiz done.
   - **Two stat tiles** — "نسبة الإكمال" (mini blue progress bar + %) and "اختبارات مكتملة" ({completed}/{total} quizzes).
3. **Warnings** — if unread warnings exist → red **tinted banner** listing them (`warnings-card`); else → green positive card "لا توجد تنبيهات - أنت في المسار الصحيح!" (`no-warnings-card`).
4. **Enrolled courses** — header "كورساتي" + "عرض الكل ‹" (→ `/courses`, `view-all-courses`). If enrolled → horizontal scroller of **CourseCard (mini)** (`enrolled-courses-scroll`, each `course-card-{id}` → course detail). If empty → EmptyState 📭 + "استكشف الكورسات" CTA (→ `/explore`).
5. **Access key** (`access-key-card`) — key icon + input (LTR, `access-key-input`) + "تفعيل" button (`access-key-submit`); result message (`access-key-message`) green/red.
6. **Timetable** (`timetable-card`) — placeholder 📅 "الجدول الدراسي قريباً".

---

## Data shown & derivations
- Student: name, grade, avatar.
- **Completion rate** = completed files / all files across enrolled courses, rounded.
- **Avg score** = mean of recorded quiz scores (shown only if ≥1 quiz completed).
- **Performance tag** by thresholds (see `design-system/01-color.md`): none → "ابدأ الآن" (gray); ≥75 → "متفوق" (green); ≥50 → "جيد" (orange); else → "يحتاج تحسين" (red).
- Warnings: unread student warnings.

## Actions
- View full report → `/profile/academic`; view all courses → `/courses`; course card → `/courses/{id}`; empty CTA → `/explore`.
- **Access key** "تفعيل": look up key → already-enrolled (error) / valid (enroll + success + clear input) / invalid (error). Typing clears the message.

## States
- Avg-score block hidden until ≥1 quiz completed.
- Warnings card toggles red/green by presence of warnings.
- Courses: scroller vs empty state.

## Components used
PerformanceTag, StatBar / mini progress, CourseCard (mini), EmptyState, Card, Input, Button, Badge, TopBar, BottomNav, AvatarTile. (→ [`06-components.md`](../../design-system/06-components.md))

## Stores
Auth (`currentStudent`), Course (`enrolledCourseIds`, `completedFileIds`, `examScores`, `enrollInCourse`).

> ⚠ Guard: renders nothing if there is no current student.
