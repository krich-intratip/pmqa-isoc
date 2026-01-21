# PMQA-ISOC Development Roadmap

> แผนพัฒนาฟีเจอร์ - อัปเดต: 21 มกราคม 2569
> **Status:** v3.0.1 High Priority Features Release

---

## ✅ v3.0.1 - High Priority Features (Latest)

**Release Date:** 21 มกราคม 2569
**Status:** ✅ Released

### New Features:

#### Bulk Import Users ✅
- [x] อัปโหลด Excel/CSV เพื่อสร้างผู้ใช้หลายคนพร้อมกัน
- [x] ตรวจสอบข้อมูลอัตโนมัติก่อนนำเข้า (validation)
- [x] ดาวน์โหลดแม่แบบไฟล์นำเข้า
- [x] แสดง Preview ก่อนนำเข้า
- [x] รองรับชื่อคอลัมน์ภาษาไทย

#### Email Notifications ✅ (Infrastructure Ready)
- [x] แจ้งเตือนกำหนดส่งรอบประเมิน
- [x] แจ้งเตือนการอนุมัติ/ปฏิเสธบัญชี
- [x] แจ้งเตือนเมื่อมีคน @mention
- [x] Email queue system (พร้อมใช้เมื่อ Blaze Plan)
- [x] Email templates in Thai

> **หมายเหตุ:** การส่งอีเมลจริงต้องใช้ Firebase Blaze Plan และติดตั้ง Cloud Functions

### Bug Fixes:
- [x] แก้ไข getUnitLabel() placeholder function
- [x] ติดตั้ง dependencies ที่ขาด (regression, react-pdf, qrcode, @types/qrcode)
- [x] เพิ่ม Tooltip component ที่ขาด (@radix-ui/react-tooltip)
- [x] แก้ไข ProtectedRoute import
- [x] แก้ไข InsightDashboard missing prop
- [x] แก้ไข notification source type
- [x] แก้ไข Firebase config imports
- [x] แก้ไข AI API image format

---

## ✅ v3.0.0 - Smart PMQA Release

**Theme:** AI Automation & Engagement
**Release Date:** 21 มกราคม 2569
**Status:** ✅ Released

### Features:
- [x] Smart Evidence Tagging (Auto-categorize files with AI)
- [x] Chat with PMQA Rules (RAG-based chatbot)
- [x] Leaderboard (Department ranking)
- [x] Predictive Scoring (Linear Regression forecast)
- [x] Live Collaboration (Real-time presence)
- [x] Interactive eBook (PDF with QR Codes)

---

## Upcoming Features (Backlog)

### Medium Priority
- [ ] **Cross-Agency Benchmarking**: Anonymous comparison vs other units
- [ ] **Voice-to-Text**: Dictation for SAR writing
- [ ] **Offline Support (PWA)**: Work without internet

---

## Complete Version History

### v2.4.1 - Dark Mode & UI
- Light/Dark Theme toggle
- Modernized UI components

### v2.3.0 - AI & Comments
- Comments on Evidence/SAR
- @Mentions system
- AI Trend Analysis

### v2.2.0 - Search & Calendar
- Global Search (Cmd+K)
- Google Calendar Sync

---

## Tech Stack Info
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase 12.8 (Auth, Firestore, Storage, RTDB)
- **AI**: Google Gemini Pro 1.5

## Installed Dependencies (v3.0.1)
```json
{
  "regression": "^2.0.1",
  "@react-pdf/renderer": "^4.3.2",
  "qrcode": "^1.5.4",
  "@radix-ui/react-tooltip": "^1.1.x",
  "@types/qrcode": "^1.5.x"
}
```

## Files Added (v3.0.1)
| File | Purpose |
|------|---------|
| `src/components/admin/BulkImportUsers.tsx` | Bulk user import dialog component |
| `src/components/admin/EmailNotificationSettings.tsx` | Email settings & queue UI |
| `src/lib/email/email-service.ts` | Email queue service with templates |
| `src/components/ui/tooltip.tsx` | Tooltip UI component |
