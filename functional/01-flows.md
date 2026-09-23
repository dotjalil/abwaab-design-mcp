# Key Flows

The cross-screen journeys, end to end. Each step notes the screen, the user action, and the system effect. ⚠ **PROTOTYPE** marks behavior that is faked and must be implemented for real.

---

## 1. Authentication & registration

```
/  (splash)
│  authenticated? ── yes ──→ /home
│         │
│         no
│         ▼
/auth  ── enter phone ──→ validate Egyptian phone (^01[0125]\d{8}$)
│                          │
│          existing phone? │ yes ─→ /auth/password ─→ enter password ─→ login ─→ /home (replace)
│                          │
│                          no ──→ /auth/otp ─→ enter 4-digit code ─→ verify ─→ /auth/register
│                                                                                  │
│                                              fill name, parent phone, grade,     │
│                                              (specialization if secondary),      │
│                                              governorate ─→ create account ──────┘─→ /home (replace)
```

**Rules & validation:**
- Phone: must match Egyptian mobile format `01[0/1/2/5]` + 8 digits = 11 digits, LTR. Same rule for parent phone (and parent ≠ student per PRD).
- The phone screen decides the branch by looking up whether the phone belongs to a known student.
- Registration requires specialization **only** for secondary-2 and secondary-3 grades; changing grade resets specialization.
- Post-auth navigation uses **replace** (no back into auth).

⚠ **PROTOTYPE:** any 4-digit OTP passes; password is ignored (login succeeds for the pending phone); registration generates a random avatar color + emoji. The real build wires OTP delivery/verification, password auth, and proper account creation. (See PRD §3 for the parent-signs-up edge case.)

---

## 2. Enrollment

There are **three ways** a student becomes enrolled in a course:

**A. Access key (offline/invite courses) — on `/home`:**
```
Home → Access Key card → enter key → validate
  ├─ key maps to a course already enrolled → error "أنت مشترك بالفعل في هذا الكورس"
  ├─ key valid & not enrolled → enrollInCourse(courseId) → success "تم الاشتراك بنجاح!"
  └─ no match → error "كود الوصول غير صحيح"
```

**B. Purchase (online courses/tracks) — via cart:** see flow 3.

**C. Bundle buy-now — on `/bundle/[id]`:** enrolls all bundle courses at once (see flow 3, bundle branch).

After enrollment the course appears in `/home` and `/courses`; a guided course also (per PRD) spawns a guided chat — in the prototype, chat rooms are seeded rather than created on enrollment.

---

## 3. Purchase & checkout

Two purchase paths, because **bundles are single-transaction** and don't mix with the cart.

### Cart path (courses + track tiers)
```
/explore (or course/track card)
   ├─ course "أضف للسلة" → addItem(course)        ┐
   └─ track "اشترك الآن" → addItem(track, monthly) ┘→ Cart store (TopBar badge +1)
        │
        ▼
/cart
   ├─ conflict notice: a cart course already covered by a cart track → "احذفه من السلة"
   ├─ bundle suggestion: ≥2 course items → upsell a cheaper bundle
   ├─ remove item / review total
   └─ "إتمام الشراء" ─→ /cart/checkout
        │
        ▼
/cart/checkout
   ├─ order summary + total
   ├─ MUST check "أوافق على سياسة الاسترداد" (refund: 7 days, if <30% completed)
   ├─ pay button disabled until agreed
   └─ "ادفع" → checkout() creates PaymentRecord, clears cart, then per item:
        ├─ course → enrollInCourse(referenceId)
        ├─ track  → enroll in each track.courseIds
        └─ bundle → ⚠ NO-OP (dead code) — bundle in cart records payment but enrolls nothing
        → success screen → "اذهب لكورساتي" (/courses) or "العودة للرئيسية" (/home)
```

### Bundle path (single transaction)
```
/explore bundle banner → /bundle/[id]
   ├─ shows discounted vs original price + savings + included courses
   ├─ "اشترِ الآن" → enroll ALL bundle.courseIds → /courses   ← the real bundle enrollment path
   └─ "أضف للسلة" → addItem(bundle) → /cart  (⚠ but checkout won't enroll it — see above)
```

> ⚠ **Critical bug to fix:** bundle enrollment works **only** through bundle "buy now". A bundle added to the cart gets a payment record but no enrollment. The new build must implement bundle enrollment at checkout (and decide whether bundles are allowed in the cart at all — the PRD says bundles are a separate single transaction).

**Upgrade/credit (PRD, not in prototype):** the PRD §5.6 defines credit-prior-payment-toward-package rules (month→semester→full-year, owning courses inside a bundle). The prototype does not implement upgrades; the new build should.

---

## 4. Learning & progress

```
/courses → course card → /courses/[courseId]
   │ tabs: content · review · performance
   │
   ├─ CONTENT: sections (accordion) → file rows
   │     ├─ sequential course? lessons unlock in order (locked rows greyed + lock icon)
   │     └─ tap unlocked file → /courses/[courseId]/[fileId]
   │           ├─ video → "تشغيل وإكمال" → completeFile
   │           ├─ pdf → "تحميل وإكمال" → completeFile
   │           ├─ assignment → "تسليم الواجب" → completeFile
   │           ├─ task → "إكمال المهمة" → completeFile
   │           └─ quiz → "بدء الاختبار" → ⚠ random score 60–99 → recordExamScore → result panel
   │                       verdict: ≥50 "ناجح" (green) / <50 "يحتاج تحسين" (red)
   │
   ├─ REVIEW: wrong answers from quizzes
   │     └─ "تدرب على أخطاءك" → practice each mistake → "فهمت - أرشفة" (clearMistake → archived)
   │
   └─ PERFORMANCE: ring (overall completion) + stat bars (files, avg score, exams) + attendance
```

**Completion semantics:**
- A file is complete per its type (watch/download/submit/pass). Recording a quiz score also marks the file complete.
- **Sequential gating:** first file of first section is open; each next file unlocks when the previous one is complete; the first file of a later section unlocks when *all* files of the previous section are complete.
- Course **progress %** = completed files / total files. **Avg score** = mean of recorded quiz scores.
- Mistakes accumulate from wrong quiz answers; practicing archives them (clears from the active list, kept in an archive).

⚠ **PROTOTYPE:** quizzes have no real questions — the action button fabricates a score. The file viewer is a single template that swaps a type-specific placeholder + one primary action.

---

## 5. Messaging & support

```
/messages
   ├─ system banner (amber) → /messages/[systemChatId]  (read-only notifications)
   ├─ guided chats (blue unread) → /messages/[id]        (1:1 with MTA)
   └─ discussion groups (green unread) → /messages/[id]  (threaded group)

/messages/[chatId]  (full-screen overlay; markChatAsRead on open)
   ├─ GUIDED: bubbles + quick-action prompts + input (text/image/mic)
   │     ├─ send → ⚠ MTA auto-replies after 1.5s with a canned message
   │     ├─ rating message → "هل فهمت؟ نعم/لا" → rateMessage
   │     └─ warnings/system messages render as centered pills (red if warning)
   ├─ DISCUSSION: threaded cards (parent + replies) + input (no quick actions)
   └─ SYSTEM: notification list, NO input (read-only)
```

**Entry points to chat:** BottomNav messages, and the course-detail chat button (guided course → "التواصل مع المعلم المساعد"; non-guided → "مجموعة النقاش").

**Read-only rule (PRD):** a guided chat becomes read-only only when **both** the subscription and the guide have expired; history is preserved. (Prototype shows read-only only for the system channel.)

⚠ **PROTOTYPE:** MTA replies are simulated; rooms are seeded, not created on enrollment.

---

## 6. Identity & reporting

```
/profile
   ├─ profile header (avatar, name, grade, specialization)
   ├─ info rows (phone, parent phone, grade, governorate)
   ├─ QR card (tap → reveal QR encoding studentId, blue modules) — for offline attendance
   ├─ academic card (inline completion% + avg) → /profile/academic
   ├─ billing card (tap → payment history)
   ├─ settings / support (placeholders)
   └─ logout → /auth (replace)

/profile/academic  (read-only dashboard)
   └─ performance tag + ring · 3 stat bars · quick-stat grid (courses/mistakes/warnings)
      · achievement badges · per-course breakdown · warnings history
```

The QR encodes the student id for the offline-attendance scan flow described in PRD §10.3 (admin-side, not built here). The academic report is the full version of the home analytics snippet.
