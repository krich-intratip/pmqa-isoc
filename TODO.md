# PMQA-ISOC Development Roadmap

> แผนพัฒนาฟีเจอร์ - อัปเดต: 26 มกราคม 2569
> **Status:** v3.0.9 Login Popup Fix - Redirect Fallback

---

## ✅ v3.0.9 - Login Popup Fix

**Release Date:** 26 มกราคม 2569
**Status:** ✅ Released

### Bug Fixes:
- [x] แก้ไขปัญหา Popup ถูก Block หรือปิดเร็วเกินไป
- [x] เพิ่ม Auto-fallback ไป Redirect เมื่อ Popup ถูก Block
- [x] เพิ่มปุ่ม "เข้าสู่ระบบแบบ Redirect" สำหรับกรณี Popup ไม่ทำงาน
- [x] ปรับปรุง Error Messages เป็นภาษาไทยที่เข้าใจง่าย
- [x] เพิ่ม Loading State และ Error Alert ในหน้า Login

---

## ✅ v3.0.7 - Login Fix

**Release Date:** 23 มกราคม 2569
**Status:** ✅ Released

### Bug Fixes:
- [x] แก้ไขปัญหา "แอปนี้ยังไม่ได้รับการยืนยันโดย Google" เมื่อ Login
- [x] ลบ `calendar.events` scope ออกจาก Google OAuth
- [x] ฟีเจอร์ Sync ปฏิทินถูกปิดใช้งานชั่วคราว

---

## ✅ v3.0.5 - User Management & Dark Mode Improvements

**Release Date:** 21 มกราคม 2569
**Status:** ✅ Released

### New Features:

#### User Management Enhancements ✅
- [x] แสดงสัญลักษณ์ออนไลน์/ออฟไลน์ที่หน้าชื่อ User ในตาราง
- [x] Filter กรองผู้ใช้ตามสถานะออนไลน์ (ทั้งหมด/ออนไลน์/ออฟไลน์)
- [x] เรียงลำดับตามชื่ออัตโนมัติ
- [x] แสดงประวัติการ Online ในหน้าแก้ไขผู้ใช้ (เข้ามาเมื่อไหร่ นานแค่ไหน)

#### Dark Mode Improvements ✅
- [x] ปรับสีตัวหนังสือให้มีความคมชัดมากขึ้น
- [x] ปรับสีพื้นหลังและ Card ให้เหมาะสม
- [x] ปรับปรุง Contrast Ratio สำหรับการอ่าน
- [x] ปรับสี Border และ Input ให้ชัดเจนขึ้น

---

## ✅ v3.0.2 - About Page Tabs & Dark Mode

**Release Date:** 21 มกราคม 2569
**Status:** ✅ Released

### New Features:

#### About Page Restructure ✅
- [x] สร้าง 4 Tabs: Functional, Non-Functional, Technology, Development History
- [x] แต่ละ Tab ใช้ Accordion ซ่อนรายละเอียด (คลิกขยายดูได้)
- [x] Functional: 8 หมวดหมู่ (User, Evidence, SAR, AI, Dashboard, Collaboration, Cycle, Search)
- [x] Non-Functional: 6 หมวดหมู่ (Security, Performance, Usability, Reliability, Scalability, Maintainability)
- [x] Technology: 6 หมวดหมู่ + Architecture Diagram
- [x] Development History: 18 เวอร์ชัน (collapsible)

#### Dark Mode Fix ✅
- [x] แก้ไข layout.tsx - bg-background
- [x] แก้ไข AppHeader.tsx - semantic colors
- [x] แก้ไข AppFooter.tsx - semantic colors
- [x] แก้ไข about/page.tsx - full dark mode support

### Bug Fixes:
- [x] เพิ่ม 14 icons ที่ขาดใน About page iconMap

### TODO - รอทดสอบ:
- [x] รัน `npm run dev` หรือ `npm run build` ✅ Build สำเร็จ
- [x] ทดสอบ Dark Mode toggle (Light/Dark/System) ✅ ใช้ semantic colors
- [x] ตรวจสอบ 4 Tabs ใน About page ทำงานถูกต้อง ✅
- [x] ตรวจสอบ Accordion ขยาย/ย่อได้ในทุก Tab ✅

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
