# Routes — Courses

Covers `/courses` (list), `/courses/[courseId]` (detail, 3 tabs), and `/courses/[courseId]/[fileId]` (file viewer).
Learning flow: [`../01-flows.md` §4](../01-flows.md).

---

## `/courses` — My Courses (list)

**Purpose:** all enrolled courses, filterable by subject and delivery type.
**Chrome:** TopBar "كورساتي" + cart; AppShell ("courses" active).

```
┌──────────────────────────────────────┐
│ TopBar:  كورساتي              [🛒]     │
├──────────────────────────────────────┤
│ [الكل][كيمياء][رياضيات][فيزياء] →      │  ← subject chips (BLUE family), scroll
│ [الكل][موجّه][ذاتي]                     │  ← type chips (brand blue, selected)
│ ┌──────────────────────────────────┐ │
│ │ 🧪  عنوان الكورس                   │ │  ← CourseCard(list)
│ │     كيمياء                        │ │
│ │     ▓▓▓▓▓▓░░░ 65%                  │ │
│ │     [موجّه][أونلاين]                │ │
│ └──────────────────────────────────┘ │
│ … (more cards) …                      │
│   — or —  📭 لا توجد كورسات تطابق الفلتر │  ← EmptyState
├──────────────────────────────────────┤
│ BottomNav                             │
└──────────────────────────────────────┘
```

**Data:** enrolled courses; per card progress = completed files / total files.
**Filters:** subject chips `[الكل, كيمياء, رياضيات, فيزياء, أحياء, علوم]`; type chips `[الكل, موجّه (guided), ذاتي (self)]`. Combined AND; "الكل" skips that filter.
**Actions:** chip tap sets filter; card tap → `/courses/{id}`.
**States:** list vs EmptyState 📭.
**Components:** ChipFilter (two families), CourseCard (list), Progress, Badge, EmptyState. **Test ids:** `subject-filters`, `filter-{subject}`, `type-filters`, `course-list`, `course-item-{id}`.
**Stores:** Course (`enrolledCourseIds`, `completedFileIds`).

> **Brand-reconciled:** both chip rows use **brand blue** when selected. The prototype's green type chips are superseded; distinguish subject vs type rows by position/label, not color.

---

## `/courses/[courseId]` — Course detail

**Purpose:** single-course hub: gradient header + progress + 3 tabs (content · review · performance).
**Chrome:** TopBar (course title) + back. No BottomNav obstruction beyond the shell; 80 px bottom padding.

```
┌──────────────────────────────────────┐
│ TopBar:  {course title}        ←      │
├──────────────────────────────────────┤
│▓▓▓ GRADIENT HEADER (#0655CB→#002F77)▓▓│
│ 🧪  {title}                           │  ← 64px cover tile (tint 20%)
│     {teacher}                         │
│     ▓▓▓▓▓░░ {progress}%  (white bar)  │
│     [مع متابعة][أونلاين][تسلسلي]        │  ← white@20% badges
├──────────────────────────────────────┤
│ [ المحتوى | المراجعة | الأداء ]         │  ← SegmentedTabBar
├──────────────────────────────────────┤
│ (tab content)                         │
└──────────────────────────────────────┘
```

**Header:** blue gradient; cover tile, title, teacher, white progress bar + %, badges (type "مع متابعة"/"ذاتي", mode, conditional "تسلسلي" if sequential).
**Not-found:** TopBar "كورس غير موجود" + ❌ "الكورس غير موجود".
**Tabs** (`course-tabs`, `tab-content`/`tab-review`/`tab-performance`): first section auto-expands on entry.

### Content tab (`content-tab`)
```
┌─ SectionAccordion (section-{id}) ─────┐
│ ▾ {section title}            {2}/{5}  │  ← header: title + count badge + chevron
│   ├ ▶ {file}        25 دقيقة · فيديو   │  ← FileRow (file-{id})
│   ├ ✓ {file completed, green}    85%  │  ← completed: green title + check + score badge
│   └ 🔒 {file}  (40% opacity, locked)  │  ← sequential-locked
└───────────────────────────────────────┘
… more sections …
┌───────────────────────────────────────┐
│ 💬 التواصل مع المعلم المساعد  (guided)  │  ← chat button (filled blue)
│    — or —  مجموعة النقاش (non-guided)   │  ← (outline blue)
└───────────────────────────────────────┘
```
- **FileRow:** icon tile (FileTypeIcon) + title + meta (duration · type label · score badge) + trailing check when complete.
- **Sequential lock:** first file of first section open; next file unlocks when previous completes; first file of a later section unlocks when *all* of the previous section completes. Locked rows are 40% opacity, non-tappable, lock icon.
- Tap unlocked file → `/courses/{courseId}/{fileId}`.
- **Chat access** (`chat-access-button`) → `/messages`. Label/style depends on guided vs non-guided.

### Review tab (`review-tab`) — mistakes
- If active mistakes & not practicing → brand-blue "تدرب على أخطاءك ({n})" (`practice-mistakes-button`) → practice mode. (Prototype rendered this green; CTAs are now blue.)
- **Practice mode** (`practice-mode`): one card per mistake (question + red "إجابتك" box + green "الصحيح" box) with "فهمت - أرشفة" (`clear-mistake-{id}`, archives it) + "رجوع".
- **List mode** (`mistakes-list`): if none → success EmptyState (green check + "لا توجد أخطاء — أحسنت!"); else mistake cards; plus an "أخطاء مؤرشفة ({n})" faded archive section.

### Performance tab (`performance-tab`)
- **RingChart** (size 120) for overall completion.
- **StatBar** × up to 3: "ملفات مكتملة" ({done}/{total}, blue); "متوسط درجات الاختبارات" ({avg}%, green/red by 50) — only if quizzes done; "اختبارات مكتملة" ({n}/{m}, blue).
- **Quick-stat tiles** (2-col): section count; subscription date (static `٢٠٢٦/٠١/١٥`, LTR).
- **Attendance:** offline/hybrid → "٤ / ٥" (green) "حضور الحصص"; online → "لا يوجد حضور في السنتر".

**Components:** course gradient header, SegmentedTabBar, SectionAccordion, FileRow, FileTypeIcon, RingChart, StatBar, Badge, Button, EmptyState.
**Stores:** Course (`completedFileIds`, `examScores`, `mistakes`, `clearMistake`).

---

## `/courses/[courseId]/[fileId]` — File viewer

**Purpose:** one universal screen for every file type; a type-specific placeholder + one primary action that marks complete (or runs the quiz simulation).
**Chrome:** TopBar (file title) + back. No BottomNav.

```
┌──────────────────────────────────────┐
│ TopBar:  {file title}          ←      │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │           [▢ hero icon 48px]      │ │  ← FileHeroBadge (color by type)
│ │           {title}                 │ │
│ │           [نوع][مدة][مكتمل✓]        │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │  type-specific placeholder:       │ │
│ │  video → ▶ black 16:9 player      │ │
│ │  quiz  → intro / 🎉 result panel  │ │
│ │  pdf   → file-down + "جاهز للتحميل"│ │
│ │  assignment/task → icon + note    │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │   {action label}  (full-width)    │ │  ← blue, or green "مكتمل ✓" when done
│ └──────────────────────────────────┘ │
│ [ العودة للكورس ] (only after quiz)    │
└──────────────────────────────────────┘
```

**Action label by type:** video "تشغيل وإكمال"; quiz "بدء الاختبار"; assignment "تسليم الواجب"; pdf "تحميل وإكمال"; task "إكمال المهمة"; when complete → "مكتمل ✓" (green, disabled for non-quiz).
**Quiz flow:** "بدء الاختبار" → ⚠ **PROTOTYPE** fabricates a random score 60–99 → records it → shows result panel (🎉 + {score}% + verdict badge: ≥50 green "ناجح" / <50 red "يحتاج تحسين") + "العودة للكورس" (back).
**Completion:** non-quiz → marks file complete (button then disabled). Quiz → records score (also marks complete) and stays re-takeable.
**Not-found:** TopBar "غير موجود" + ❌.
**Components:** FileTypeIcon (hero), Card, Badge, Button. **Test ids:** `file-info-card`, `quiz-result`, `file-action-button`, `back-to-course`.
**Stores:** Course (`completedFileIds`, `examScores`, `completeFile`, `recordExamScore`).

> ⚠ There is no real quiz UI — implement actual questions/grading in the new build. The viewer is one template; keep that single-template approach but feed it real content per type.
