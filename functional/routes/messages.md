# Routes — Messages

Covers `/messages` (chat list) and `/messages/[chatId]` (chat room).
Messaging flow: [`../01-flows.md` §5](../01-flows.md). Channel-color rule: [`design-system/07-visual-patterns.md` §3](../../design-system/07-visual-patterns.md).

---

## `/messages` — Chat list

**Purpose:** inbox of three channel types: system notifications (banner), guided 1:1 MTA chats, discussion groups.
**Chrome:** TopBar "الرسائل" (no cart/back); AppShell ("messages" active, unread badge driven by total unread).

```
┌──────────────────────────────────────┐
│ TopBar:  الرسائل                       │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │ 🔔 إشعارات النظام        [n] ‹     │ │  ← SystemBanner (amber)
│ └──────────────────────────────────┘ │
│ المعلم المساعد الخاص بك  [مع متابعة]    │  ← guided section header
│ ┌──────────────────────────────────┐ │
│ │ (🧑‍🔬•) {MTA name}        {time}    │ │  ← GuidedChatCard (premium)
│ │ {course}                          │ │     • = green online dot
│ │ {last message}            [n blue]│ │
│ └──────────────────────────────────┘ │
│ مجموعات النقاش                         │  ← discussion section header
│ ▢ {group title}              {time}   │  ← DiscussionChatRow (flat)
│   {last msg}        👥 {members} [n🟢]│     n = green unread
│   — empty → 💬 لا توجد رسائل بعد        │
├──────────────────────────────────────┤
│ BottomNav                             │
└──────────────────────────────────────┘
```

**Sections:** system banner (if any; `system-notifications-banner` → first system room); guided (if any), sorted by recency; discussion (if any), sorted by recency. Global empty → EmptyState 💬 "لا توجد رسائل بعد".
**Unread encoding (keep):** guided = **blue** badge; discussion = **green** badge; system = **amber** badge. Unread titles render bold.
**Time format:** today → HH:MM; yesterday → "أمس"; <7d → "منذ {n} أيام"; else date.
**Components:** SystemBanner, GuidedChatCard, DiscussionChatRow, Badge, AvatarTile, EmptyState. **Test ids:** `chat-list`, `system-notifications-banner`, `chat-room-{id}`.
**Stores:** Messages (`chatRooms`).

---

## `/messages/[chatId]` — Chat room

**Purpose:** one of three layouts by room type. **Full-screen fixed overlay** (512 px centered) covering the BottomNav. Marks the chat read on open; auto-scrolls to the newest message.
**Chrome:** TopBar with back; guided shows an empty title (the custom MTA header carries identity), others show the room title.

### Guided (1:1 with MTA)
```
┌──────────────────────────────────────┐
│ ← (🧑‍🔬•) {MTA name}                    │  ← MtaChatHeader (avatar + green dot)
│    {course}                           │
├──────────────────────────────────────┤ bg: page surface
│                    {MTA bubble} ◖      │  ← other: white, shadow, name shown
│ ◗ {student bubble}                     │  ← self: blue, white text (right-aligned)
│            ── system pill (centered) ──│  ← system/warning (red if warning)
│   ┌ هل فهمت الإجابة؟  [👍 نعم][👎 لا] ┐  │  ← RatingPrompt
├──────────────────────────────────────┤
│ [📖 سؤال][❓ استفسار][🔧 مشكلة] →      │  ← QuickActionsBar (blue pills)
│ [🖼][🎤] [ اكتب رسالة...        ] [➤] │  ← MessageInputBar
└──────────────────────────────────────┘
```
- **ChatBubble:** self = blue/white (tail bottom-trailing); other = white/`shadow-sm` (tail bottom-leading) + blue sender name. `message-{id}`.
- **System messages** → centered pill, red if `warning`. `system-message-{id}`.
- **Rating message** (unrated) → prompt with نعم/لا (`rate-yes-{id}`/`rate-no-{id}`, `rating-message-{id}`); once rated → small "✓ أفاد"/"✗ لم يفد" badge.
- **Quick actions** (`quick-actions`): tapping a canned prompt sends it as a message.
- **Input bar** (`message-input-container`): image + mic (decorative) + text input (`message-input`, Enter sends) + send (`send-button`, disabled when empty).
- ⚠ **PROTOTYPE:** after sending, an MTA reply is auto-appended ~1.5 s later with a canned line.

### Discussion (threaded group)
```
┌──────────────────────────────────────┐
│ ← ▢ {group title}                      │  ← GroupChatHeader
│    👥 {members} عضو                     │
├──────────────────────────────────────┤
│ ┌ ThreadCard ───────────────────────┐ │
│ │ (a) {author}  {time}               │ │  ← parent
│ │     {body}                         │ │
│ │ ── replies ──                      │ │
│ │   (b) {author} {time}  {reply}     │ │
│ │ 💬 {n} رد                          │ │  ← reply affordance (display only)
│ └────────────────────────────────────┘│
├──────────────────────────────────────┤
│ [ شارك في النقاش...            ] [➤]  │  ← input (no quick actions / no image-mic)
└──────────────────────────────────────┘
```

### System (read-only)
```
┌──────────────────────────────────────┐
│ ← 🔔 إشعارات النظام                     │  ← SystemChatHeader
├──────────────────────────────────────┤
│ {notification card}        {time}     │  ← red tint if warning
│ {notification card}        {time}     │
├──────────────────────────────────────┤
│           (NO input bar — read-only)  │
└──────────────────────────────────────┘
```

**Not-found:** TopBar "محادثة غير موجودة" + ❌.
**Components:** MtaChatHeader/GroupChatHeader/SystemChatHeader, ChatBubble, SystemPill, RatingPrompt/RatingResult, ThreadCard, QuickActionsBar, MessageInputBar, SystemNotificationCard. **Test ids:** `messages-container`, `message-{id}`, `system-message-{id}`, `rating-message-{id}`, `rate-yes-{id}`, `rate-no-{id}`, `quick-actions`, `message-input-container`, `message-input`, `send-button`.
**Stores:** Auth (`currentStudent`), Messages (`chatRooms`, `getMessagesForChat`, `sendMessage`, `markChatAsRead`, `rateMessage`).

> Read-only rule (PRD): guided chat becomes read-only only when subscription **and** guide both expire — history preserved. Implement this gate in the new build (prototype only makes the system channel read-only).
