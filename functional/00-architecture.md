# Functional Architecture

The "how it works" map of the student app: routes, layouts, navigation, state, and the data model. Stack-agnostic — derived from the prototype but describing behavior, not framework mechanics.

> This complements (does not replace) the PRD. The PRD is the forward-looking product spec across all roles; this describes the **as-built student app**. Where they differ on behavior, the prototype wins for what *is*, the PRD wins for what *should be* in areas not yet built. Prototype-only shortcuts are flagged as ⚠ **PROTOTYPE**.

---

## Route tree

```
/                       → splash / redirect gate
                          (authenticated → /home, else → /auth)

AUTH (unauthenticated, full-bleed blue background, no app chrome)
/auth                   → phone entry (routes new vs returning user)
/auth/otp               → OTP verification (new user)
/auth/password          → password login (returning user)
/auth/register          → registration form (after OTP)

APP (authenticated, wrapped in AppShell: 512px column + BottomNav)
/home                   → dashboard
/courses                → enrolled courses list
/courses/[courseId]     → course detail (tabs: content · review · performance)
/courses/[courseId]/[fileId]
                        → file viewer (video · quiz · pdf · assignment · task)
/explore                → browse & purchase (courses / tracks / bundles)
/messages               → chat list (system · guided · discussion)
/messages/[chatId]      → chat room (full-screen overlay)
/profile                → account hub
/profile/academic       → full academic report

COMMERCE (authenticated, own surface — not inside the BottomNav shell)
/cart                   → shopping cart
/cart/checkout          → checkout, refund agreement, payment, success
/bundle/[bundleId]      → bundle detail & purchase
```

Route docs (grouped by area): [`auth`](./routes/auth.md) · [`home`](./routes/home.md) · [`courses`](./routes/courses.md) · [`explore`](./routes/explore.md) · [`messages`](./routes/messages.md) · [`profile`](./routes/profile.md) · [`commerce`](./routes/commerce.md).

---

## Layout layers

| Layer | Applies to | Provides |
|---|---|---|
| **Root** | everything | `lang="ar"`, `dir="rtl"`, Dubai font, page surface. Title "أبواب بلس". |
| **Auth screens** | `/auth/*` | Full-bleed brand-blue background, centered white card (~384 px). No TopBar/BottomNav. |
| **AppShell** | `/home`, `/courses/*`, `/explore`, `/messages`, `/profile/*` | 512 px centered column on page surface, 80 px bottom padding, **BottomNav**. Each screen renders its own **TopBar**. |
| **Commerce** | `/cart`, `/cart/checkout`, `/bundle/*` | 512 px centered column + own TopBar, but **no BottomNav** (focused purchase flow). |
| **Chat room** | `/messages/[chatId]` | **Full-screen fixed overlay** (512 px centered) that covers the BottomNav. |

### Auth guard
The app layer checks authentication on mount. If unauthenticated → redirect to `/auth`. While the auth state resolves, a centered loader (📚 + "جاري التحميل...") is shown instead of content. On login, the course store is hydrated from the current student's progress record (`initForStudent`).

---

## Navigation model

- **Primary navigation** = the 5-item BottomNav (home, courses, messages, explore, profile). Active item = exact route or path-prefix match.
- **Forward navigation** pushes onto history (course → file, list → detail, explore → bundle). **Back** uses history (TopBar back button = right arrow in RTL).
- **Replace (no back)** is used after auth success (`/home`) and logout (`/auth`) so users can't navigate back into a stale auth state.
- **Cross-area entries:**
  - Home "view all" → `/courses`; home course card → course detail; home empty CTA → `/explore`; home "full report" → `/profile/academic`.
  - Course detail chat button → `/messages`.
  - Explore add-to-cart → cart store (no nav); bundle banner → `/bundle/[id]`; track subscribe → cart store.
  - Cart → `/cart/checkout`; checkout success → `/courses` or `/home`.
  - Bundle buy-now → enroll + `/courses`; bundle add-to-cart → `/cart`.
  - Profile academic card → `/profile/academic`; logout → `/auth`.
- **Cart badge** in the TopBar reflects cart item count live; **Messages unread badge** in BottomNav reflects total unread.

---

## State model

State is organized into stores by domain. (In the prototype these are client stores persisted to **session storage** ⚠ **PROTOTYPE** — the new build replaces these with real backend + client cache. Treat each store as a *service boundary*.)

| Store | Owns | Key operations |
|---|---|---|
| **Auth** | current student session, pending phone, known students | `setPhone`, `findStudentByPhone`, `login`, `verifyOtp`, `register`, `logout`, `updateStudent` |
| **Course/Progress** | enrolled course ids, completed file ids, exam scores, mistakes | `initForStudent`, `enrollInCourse`, `completeFile`, `recordExamScore`, `isFileCompleted`, `getCourseCompletionRate`, `clearMistake`, `practiceOnMistakes` |
| **Cart** | cart items, payment history | `addItem`, `removeItem`, `clearCart`, `getTotal`, `getConflicts`, `getBundleSuggestion`, `checkout` |
| **Explore (UI)** | grade/subject/search/type filters | plain setters (ephemeral, not persisted) |
| **Messages** | chat rooms, messages | `sendMessage`, `markChatAsRead`, `rateMessage`, `getTotalUnread`, `getMessagesForChat` |

**Cross-store interactions worth preserving:**
- Login hydrates Course store from the Student record (progress is dual-tracked on the student and in the course store; `initForStudent` bridges them).
- Checkout (Cart) triggers enrollment (Course) per item; recording a quiz score (Course) also marks the file complete.
- `getTotalUnread` (Messages) drives the BottomNav badge; cart length drives the TopBar badge.

⚠ **PROTOTYPE shortcuts to replace:** OTP always succeeds; password is ignored on login; quiz scores are random (60–99); guided chat auto-replies after 1.5 s with a canned MTA message; the **bundle-in-cart checkout path does not enroll** (only bundle "buy now" enrolls) — see `routes/commerce.md`.

---

## Data model

Entities and relationships (string-id references unless "embedded"). This is the student-app slice; the PRD's full model (Track tiers, MTA pooling, attendance, etc.) is broader.

### Student
`id, name, phone, parentPhone, grade, specialization?, governorate, avatarColor, avatarEmoji, enrolledCourseIds[] → Course, warnings[] (embedded), completedFileIds[] → CourseFile, examScores{ fileId: 0–100 }`
**Warning (embedded):** `id, message, date (YYYY-MM-DD), courseId → Course, read`

### Course (embeds Section → CourseFile)
`id, title, subject, teacherId → Teacher, type, mode, price, description, coverColor, coverEmoji, sections[] (embedded), sequential, grade, specialization?, trackId? → Track`
- `type`: `"guided" | "non-guided"` (guided = assigned MTA + guided chat)
- `mode`: `"online" | "offline" | "hybrid"`
- **Section (embedded):** `id, title, order, files[] (embedded)`
- **CourseFile (embedded):** `id, title, type, duration?, order` — `type`: `"video" | "quiz" | "assignment" | "pdf" | "task"`. (There is no separate "Lesson" entity — a "lesson" maps to a video CourseFile; the PRD's Lesson level is collapsed into Section→File here.)

### MistakeRecord
`id, fileId → CourseFile, courseId → Course, question, studentAnswer, correctAnswer, archived`

### Track
`id, title, subject, teacherId → Teacher, description, courseIds[] → Course (ordered), grade, specialization?, pricing{ monthly, semester, "full-year" }, coverColor, coverEmoji`

### Bundle
`id, title, description, courseIds[] → Course, price, originalPrice, coverColor, coverEmoji` (one-time discounted group; no tiers)

### Teacher
`id, name, subject, bio, avatarColor, avatarEmoji`

### Cart
**CartItem:** `id, type ("course"|"track"|"bundle"), referenceId → Course|Track|Bundle, title, price, trackTier? (when type=track)`
**PaymentRecord:** `id, date, amount, description, items[] (titles)`

### Chat
**ChatRoom:** `id, title, type ("guided"|"discussion"|"system"), courseId?, lastMessage, lastMessageTime, unreadCount, avatarColor, avatarEmoji, mtaName?/mtaEmoji?/courseName? (guided), memberCount? (discussion)`
**Message:** `id, chatRoomId → ChatRoom, sender ("student"|"mta"|"system"), senderName, text, timestamp, type ("text"|"warning"|"task"|"rating"), rated?, ratingValue? ("yes"|"no"), replyCount?/replyTo? (discussion threading)`

### Relationship notes
- **Embedded:** Course fully contains Section → CourseFile. Everything else references by id.
- **Progress** is keyed by `fileId` (completed set + score map) — not stored on the course.
- **Purchasing is polymorphic:** CartItem points at a Course, Track, or Bundle via `referenceId` + `type`.
- **Three chat archetypes:** guided (1:1 student↔MTA, course-bound), discussion (group, threaded, `memberCount`), system (notifications, no input).

See the per-area route docs for how each entity surfaces in the UI.
