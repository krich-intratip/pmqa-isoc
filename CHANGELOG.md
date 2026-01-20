# Changelog

All notable changes to the PMQA ISOC project will be documented in this file.

## [2.1.0] - 2026-01-20

### 🎉 Major Release - Real-time Collaboration & Advanced Export

#### 👥 Real-time Collaboration System
- **Online Users Sidebar** - แสดงผู้ใช้ออนไลน์แบบ Real-time
  - Sidebar ด้านขวาสุด (Fixed position, Collapsible)
  - แสดงรายชื่อผู้ใช้ที่ออนไลน์พร้อม Avatar
  - Online Indicator สีเขียว (online) / เทา (offline)
  - แสดงเวลา Active ล่าสุด (formatDistanceToNow)
  - Search ค้นหาผู้ใช้ตามชื่อหรืออีเมล
  - Filter ตาม Role (Admin/Reviewer/Editor/Viewer)
  - Filter ตาม Unit Category
  - Responsive Design - ซ่อนใน Mobile, แสดงใน Desktop

- **Presence Tracking System** (Firebase Firestore)
  - Auto-detect Online/Offline status
  - Update activity timestamp ทุก 30 วินาที
  - Detect page visibility (tab hidden/visible)
  - Handle beforeunload event
  - Real-time subscription ด้วย onSnapshot
  - Zustand Store สำหรับจัดการ state

#### 📊 Advanced Export System
- **Export Dashboard HTML** - รายงาน Dashboard แบบสวยงาม
  - Gradient Header พร้อม Unit Name และ Cycle Info
  - Overall Progress Bar แบบ animated
  - Statistics Grid Cards (8 cards)
  - Phase Progress Bar Chart (แสดงทั้ง 8 Phases)
  - Print-ready CSS (@media print, @page A4)
  - Responsive Layout
  - รองรับภาษาไทย 100%

- **Export ภาษาไทย** - ทุก Export functions รองรับภาษาไทย
  - CSV with BOM (\uFEFF) สำหรับ Excel
  - HTML with UTF-8 charset
  - Thai font support (TH Sarabun New)
  - วันที่แสดงเป็นภาษาไทย

#### 🔒 Security Enhancement
- **Firestore Security Rules** - ครบทุก Collection
  - Helper functions: isAuthenticated(), isOwner(), isAdmin()
  - Presence Collection Rules - Read all, Write own only
  - Users Collection - Role-based access
  - Evidence, KPI, SAR, Risks, Q&A - Authenticated users
  - Cycles, Units - Admin only
  - Activity Log - Immutable (no update/delete)
  - Default deny all

#### 🛠️ Code Quality Improvements
- **ESLint Fixes** - แก้ไข errors ทั้งหมด
  - ลบ unused imports และ variables (10+ จุด)
  - แก้ unescaped entities (`"` → `&quot;`)
  - ลบ `any` types ทั้งหมด - ใช้ proper TypeScript types
  - แก้ React Hook exhaustive-deps warnings
  - แก้ cascading setState in useEffect

- **TypeScript Strict Mode**
  - แก้ไข "possibly undefined" errors
  - เพิ่ม type guards และ null checks
  - ปรับปรุง type definitions

- **Build Success** - Build สำเร็จ 100% ไม่มี errors

#### 🎨 New Components
- `OnlineUsersSidebar` - Sidebar แสดงผู้ใช้ออนไลน์
- `UserAvatar` - Avatar component พร้อม Online Indicator
- `PhaseProgressCard` - Enhanced version
- `CycleComparison` - Widget เปรียบเทียบรอบ

#### 📝 Technical Details
- เพิ่ม `src/lib/firebase/presence.ts` - Presence tracking utilities
- เพิ่ม `src/stores/presence-store.ts` - Zustand store
- เพิ่ม `exportDashboardHTML()` ใน `data-export.ts`
- อัพเดท Dashboard page ด้วย Presence integration
- อัพเดท Security Rules ใน `firestore.rules`

---

## [2.0.0] - 2026-01-20

### 🎉 Major Release - Complete Cycle Integration

#### ✨ Cycle Support for All Phases
- เพิ่ม Cycle Integration ครบทุก Phase (Phase 3-7)
  - Phase 3: Context Pack, Risk Analyzer, Strategy Linker
  - Phase 4: SAR Outline, SAR Writer
  - Phase 5: Results Pack, Recovery Narrative
  - Phase 6: Consistency Auditor, Score Simulator
  - Phase 7: Interview Brief, Q&A Bank
- ทุกหน้าแสดง Cycle Badge และ Warning เมื่อไม่มี cycle
- Firestore queries ถูก filter ด้วย `cycleId` ทุกหน้า

#### 📊 Dashboard Enhancement
- **Phase Progress Section** - แสดงความคืบหน้า 8 Phase ด้วย cards สีสันสวยงาม
- **Real-time Stats** - ดึงข้อมูลจริงจาก Firestore:
  - Evidence count และ verified count
  - KPI data และ definitions count
  - SAR contents count
  - Risks count
  - Q&A Bank count
  - Strategy Links count
  - Context Pack status
- **Cycle Comparison Widget** - เปรียบเทียบข้อมูลระหว่าง 2 รอบการประเมิน
  - เลือกรอบที่จะเปรียบเทียบ
  - แสดง Growth indicators (เพิ่ม/ลด)
  - Trend badges สีเขียว/แดง

#### 📤 Data Export Feature
- สร้าง `data-export.ts` utility library
- **Export Dashboard Summary** - ส่งออกสถิติภาพรวมเป็น CSV
- **Export Evidence List** - ส่งออกรายการหลักฐาน
- **Export KPI Data** - ส่งออกข้อมูล KPI
- **Export SAR to HTML** - ส่งออกรายงาน SAR สำหรับพิมพ์
- ปุ่ม "Export CSV" บน Dashboard (Admin และ User)

#### 🎨 UI Components
- `PhaseProgressCard` - Card แสดงสถิติแต่ละ Phase
- `CycleComparison` - Widget เปรียบเทียบข้อมูลระหว่างรอบ

#### 📝 Documentation
- สร้าง README.md ใหม่พร้อมรายละเอียดทุก Phase
- อัพเดท CHANGELOG สำหรับ v2.0.0

### Technical
- เพิ่ม state variables ใหม่สำหรับ stats ใน Dashboard
- สร้าง `src/lib/export/data-export.ts`
- สร้าง `src/components/dashboard/CycleComparison.tsx`

---

## [1.8.0] - 2026-01-20

### Fixed - Code Quality & Type Safety
- แก้ไข ESLint errors จาก 105 รายการ เหลือเพียง warnings เท่านั้น
- ปรับปรุง Type Safety ทั้งหมด - เปลี่ยนจาก `any` เป็น proper types
  - `ActivityLog.details` ใช้ `Record<string, unknown>`
  - `User` role และ status ใช้ union types
  - `AssessmentCycle` status ใช้ union types
  - Form handlers ใช้ typed parameters
- ลบ unused imports ทั้งหมด
  - ลบ `User`, `Label`, `Calendar` ที่ไม่ได้ใช้ใน activity-log
  - ลบ `getUnitLabel`, `getRoleDisplay` ที่ไม่ได้ใช้ใน approvals
  - ลบ `query`, `where`, `getDocs` ที่ไม่ได้ใช้ใน cycles และ users
  - ลบ `Image` ที่ไม่ได้ใช้ใน login page
- แก้ไข useEffect dependencies warnings
  - เพิ่ม `useCallback` สำหรับ `fetchLogs` ใน activity-log
  - เพิ่ม dependencies ที่จำเป็น

### Technical Improvements
- ปรับปรุง TypeScript type coverage > 95%
- Compile สำเร็จโดยไม่มี errors
- Build สำเร็จ - พร้อม deploy

## [1.7.4] - 2026-01-20

### Changed - Dashboard Announcements UI
- ปรับ Layout การแสดงผลประกาศเป็น 3 คอลัมน์
- เพิ่มระบบ Expand/Collapse สำหรับเนื้อหาประกาศที่ยาว
- ปรับปรุง Animation และการตัดคำ (Truncate text)
- แสดงปุ่ม "อ่านต่อ" เฉพาะเมื่อเนื้อหายาวเกินกำหนด

## [1.7.3] - 2026-01-20

### Added - Dashboard Announcements
- เพิ่มระบบประกาศ 3 ส่วนบนหน้า Dashboard
  - PMQA 4.0 คืออะไร
  - ความสำคัญของ PMQA
  - ประกาศสำคัญ (นโยบายผู้บังคับบัญชา)
- เพิ่ม `AnnouncementCards` component สำหรับแสดงผล User ทั่วไป
- เพิ่ม Tab "ประกาศ" ใน Admin Dashboard
- เพิ่ม `AnnouncementManager` component สำหรับ Admin จัดการข้อมูล
- เพิ่ม Animation (Fade-in/Slide-up)

## [1.7.2] - 2026-01-20

### Added - Dashboard Real Data & Notification System

#### 📊 Dashboard Real Data Integration
- Dashboard แสดงข้อมูลจริงจากระบบ
  - แสดงจำนวน KPI ที่บันทึกในรอบประเมิน
  - Admin Dashboard แสดงจำนวน User รอการอนุมัติ
  - สถิติ Evidence และ Verified count จากข้อมูลจริง
  - Progress คำนวณจากข้อมูลจริง

#### 🔔 In-App Notification System
- สร้างระบบแจ้งเตือนภายใน App
  - `NotificationBell` component บน Header
  - แสดง Unread count badge
  - Notification เมื่อ User ถูก Approve/Reject
  - Mark as Read และ Mark All as Read
  - Real-time updates ด้วย Firestore onSnapshot

### Technical
- เพิ่ม `Notification` interface ใน database.ts
- สร้าง `notification-store.ts` (Zustand)
- สร้าง `notification-helper.ts` สำหรับสร้าง notifications
- เพิ่ม shadcn Popover และ ScrollArea components

## [1.7.1] - 2026-01-20

### Fixed
- แก้ไข version mismatch ระหว่าง package.json และ version.ts
- อัปเดต lastUpdate date

## [1.5.0] - 2026-01-19

### Added - Cycle Integration Features

#### 🔄 Assessment Roadmap Page
- เพิ่มหน้า `/roadmap` - Interactive PMQA Assessment Flow Visualization
  - แสดง 8 Phases และ 18 Tools ของกระบวนการประเมิน PMQA
  - 2 โหมดการแสดงผล: Flow Chart และ Detailed View
  - ลิงก์ไปยังเครื่องมือแต่ละตัวได้โดยตรง
  - แสดงระยะเวลาและ deliverables ของแต่ละ Phase
  - Responsive design สำหรับทุกขนาดหน้าจอ

#### 🎯 Cycle Selector Component
- เพิ่ม `CycleSelector.tsx` component แบบ reusable
  - แสดงรายการรอบการประเมินทั้งหมด
  - Compact mode สำหรับแสดงใน Header
  - Status badges (ร่าง, ใช้งาน, เสร็จสิ้น, เก็บถาวร)
  - Persistent selection ด้วย Zustand + localStorage
  - Auto-select active cycle on first load
  - เพิ่ม Cycle Selector ใน Header และ Dashboard

#### 📁 Evidence Page - Cycle Support
- อัปเดตหน้า `/phase1/evidence` ให้รองรับ Assessment Cycles
  - เพิ่ม `useCycleStore` integration
  - กรองหลักฐานตาม `cycleId`
  - บันทึก `cycleId` เมื่ออัปโหลดหลักฐานใหม่
  - แสดง warning UI เมื่อยังไม่ได้เลือกรอบการประเมิน
  - ป้องกันการเพิ่มหลักฐานโดยไม่มี cycle context

#### 📊 Data Collector - Cycle Support
- อัปเดตหน้า `/phase2/data-collector` ให้รองรับ Assessment Cycles
  - เพิ่ม `cycleId` ใน KPIData interface
  - กรองข้อมูล KPI ตาม `cycleId`
  - บันทึก `cycleId` เมื่อบันทึกข้อมูล KPI
  - แสดง warning UI เมื่อยังไม่ได้เลือกรอบการประเมิน
  - Validate cycle selection ก่อนบันทึกข้อมูล
  - ล้างข้อมูลเมื่อไม่มี cycle ที่เลือก

### Changed

#### 🗄️ Cycle Store Enhancement
- ปรับปรุง `src/stores/cycle-store.ts`
  - เพิ่ม `selectedCycle` state
  - เพิ่ม `fetchCycles()` function
  - Auto-fetch cycles และ auto-select active cycle
  - Persist `selectedCycle` ด้วย localStorage
  - Query cycles จาก Firestore เรียงตามปี

#### 🎨 UI/UX Improvements
- เพิ่ม warning cards เมื่อไม่มี cycle selected (สีเหลือง)
- ปรับปรุง navigation ใน Dashboard
- เพิ่มลิงก์ไปหน้า Roadmap ใน Dashboard

### Technical

#### 🔧 Build & TypeScript
- Build สำเร็จโดยไม่มี TypeScript errors
- ทดสอบ Evidence และ Data Collector pages
- Verify cycle context ทำงานถูกต้อง

#### 📝 Database Schema
- `evidence` collection: เพิ่ม `cycleId` field
- `kpi_data` collection: เพิ่ม `cycleId` field

### Notes
- v1.5.0 มุ่งเน้นการ integrate Cycle Management เข้ากับ core data entry pages
- Pages อื่นๆ จะได้รับ cycle support ในเวอร์ชันถัดไป
- Cycle Management ช่วยแยกข้อมูลระหว่างรอบการประเมินต่างๆ อย่างชัดเจน

---

## [1.4.0] - 2026-01-19

### Added - Major Features

#### 📊 Activity Logging System
- เพิ่มระบบบันทึก Activity Log แบบครอบคลุม
  - สร้าง `ActivityLog` interface ใน `database.ts`
  - รองรับการบันทึก 12 ประเภทการกระทำ (login, logout, create, update, delete, upload, download, view, approve, reject, enable, disable)
  - รองรับ 7 ประเภท resource (user, cycle, evidence, unit, file, system, auth)
  - Denormalization สำหรับ performance (userName, unitName ใน logs)
  - เพิ่ม `src/lib/activity-log/activity-logger.ts` - Core logging functions
  - เพิ่ม `src/lib/activity-log/activity-helper.ts` - Query และ export functions
  - เพิ่ม `src/hooks/useActivityLogger.ts` - React hook สำหรับ components

#### 👥 Enhanced User Management
- ปรับปรุงหน้า `/admin/users` แบบครบวงจร
  - **Tabs System**: แยกแสดงผู้ใช้ตามสถานะ (pending, approved, disabled, rejected)
  - **Advanced Filters**:
    - กรองตามระดับหน่วยงาน (Central, Regional, Provincial, Center, DirectUnit)
    - กรองตามหน่วยงาน (dropdown จาก units collection)
    - กรองตามภูมิภาค (ภาค 1-4)
  - **Sorting**: เรียงตามชื่อ (A-Z) หรือวันที่สมัคร (ใหม่-เก่า)
  - **Bulk Actions**: อนุมัติ/ปฏิเสธผู้ใช้หลายคนพร้อมกัน
  - **CSV Export**: ส่งออกข้อมูลผู้ใช้ (รองรับภาษาไทย)
  - **Registration Date**: แสดงวันที่สมัครของผู้ใช้
  - **Activity Logging Integration**: บันทึก log อัตโนมัติเมื่อ approve/reject/enable/disable
  - **URL Parameter Support**: รองรับ `?filter=pending` สำหรับลิงก์จาก Dashboard

#### 📝 Activity Log Viewer
- สร้างหน้า `/admin/activity-log` สำหรับดู Activity Logs
  - แสดง logs ทั้งหมดในระบบ
  - **Search**: ค้นหาด้วย keyword (ชื่อผู้ใช้, อีเมล, ชื่อข้อมูล)
  - **Filters**:
    - กรองตามประเภทการกระทำ (login, logout, create, etc.)
    - กรองตามประเภทข้อมูล (user, cycle, evidence, etc.)
    - กรองตามช่วงเวลา (date range)
  - **Pagination**: แบ่งหน้าแสดงผล (50 รายการต่อหน้า)
  - **CSV Export**: ส่งออก Activity Logs (รองรับภาษาไทย)
  - **Real-time Stats**: แสดงจำนวน logs ทั้งหมดและที่กรองแล้ว

### Changed

#### 🔐 Authentication & Activity Tracking
- เพิ่มการบันทึก Login activity ใน `src/lib/firebase/auth.ts`
  - บันทึกอัตโนมัติเมื่อ user login สำเร็จ
  - บันทึก IP address, User Agent, Device, Browser
- เพิ่มการบันทึก Logout activity ใน `src/context/AuthContext.tsx`
  - บันทึกอัตโนมัติก่อน user logout

#### 🎨 Dashboard Updates
- ปรับ **User Approvals card** ให้ลิงก์ไปที่ `/admin/users?filter=pending`
  - รวม approval workflow เข้ากับ user management
- เพิ่ม **Activity Log card** ใหม่
  - เข้าถึงหน้าดู Activity Logs ได้สะดวก

### Technical

#### Database Schema
- เพิ่ม `activityLogs` collection ใน Firestore
- ปรับปรุง composite indexes สำหรับ query performance
- Denormalization strategy สำหรับ fast reads

#### Code Organization
- แยก concerns ระหว่าง logger (write) และ helper (read/query)
- React hooks pattern สำหรับ reusable logging logic
- Error handling ที่ไม่ block main operations

### Security
- ✅ Activity Logs ปกป้องด้วย RBAC (เฉพาะ super_admin, central_admin)
- ✅ Bulk operations ต้องการ explicit confirmation
- ✅ Logging failures ไม่ block main operations
- ✅ Sensitive data ไม่ถูกบันทึกใน logs

### Performance
- Client-side filtering สำหรับ Activity Logs (trade-off: simplicity vs real-time)
- Pagination สำหรับ large datasets
- Denormalized fields เพื่อหลีกเลี่ยง expensive joins

---

## [1.3.0] - 2026-01-19

### Added - Major Features

#### 🔄 Assessment Cycle Management System
- เพิ่มระบบจัดการรอบการประเมิน PMQA (`AssessmentCycle`)
  - สร้าง Database Schema สำหรับ `assessmentCycles` collection
  - รองรับการกำหนดปี พ.ศ., ช่วงเวลา, และหมวดที่ต้องการประเมิน
  - สามารถเลือกหมวด PMQA ที่ต้องการประเมินได้ (ไม่จำเป็นต้องครบ 7 หมวด)
  - รองรับการมีรอบการประเมินหลายรอบ แต่มีเพียง 1 รอบที่ active พร้อมกัน
  - เพิ่มหน้า `/admin/cycles` สำหรับจัดการรอบการประเมิน (CRUD)
  - เพิ่ม `cycle-store.ts` สำหรับจัดการ state
  - เพิ่ม `cycle-helper.ts` สำหรับ utility functions

#### 👥 Enhanced User Management
- เพิ่มหน้า `/admin/users` สำหรับจัดการผู้ใช้งานแบบเต็มรูปแบบ
  - แก้ไขข้อมูล User (ชื่อ, บทบาท, หน่วยงาน, ตำแหน่ง, เบอร์โทร)
  - ปิด/เปิดการใช้งาน User (Soft Delete)
  - ค้นหาและกรองผู้ใช้งานตามสถานะ
  - แสดงข้อมูลแบบตาราง พร้อม pagination

#### 🔐 User Profile Enhancements
- เพิ่มฟีเจอร์ **ปิดการใช้งาน Account** (Soft Delete)
  - User สามารถปิดการใช้งาน Account ของตนเองได้
  - เปลี่ยนสถานะเป็น `disabled` และ `isActive: false`
  - บันทึกเหตุผลและเวลาที่ปิดใช้งานใน metadata
  - Logout อัตโนมัติหลังปิดใช้งาน
  - Admin สามารถเปิดใช้งานใหม่ได้

#### 🎨 UI/UX Improvements
- **Header**: ทำให้คลิกชื่อ/รูปโปรไฟล์ User ได้
  - เพิ่ม Avatar component พร้อม hover effect
  - คลิกเพื่อไปหน้า `/profile`
- **Dashboard**: เพิ่มเมนู Admin ใหม่
  - Cycle Management
  - User Management
  - จัดเรียงเมนู Admin ให้เป็นหมวดหมู่

### Changed
- ปรับ `Evidence` interface ให้มี `cycleId` field
  - เตรียมรองรับการแยกข้อมูลตามรอบการประเมิน
- ปรับโครงสร้าง Dashboard ให้แสดงเมนู Admin ได้ชัดเจนขึ้น
- ปรับ User status flow รองรับ `disabled` status

### Technical
- เพิ่ม `useCycleStore` Zustand store
- เพิ่ม `cycle-helper.ts` utility functions:
  - `getActiveCycle()`
  - `getAllCycles()`
  - `switchActiveCycle()`
  - `isCategoryInCycle()`
  - `getCycleStatusDisplay()`
- ปรับ TypeScript interfaces ใน `database.ts`:
  - เพิ่ม `AssessmentCycle` interface
  - เพิ่ม `cycleId` ใน `Evidence` interface

### Security
- ✅ ทุกหน้า Admin ใช้ `ProtectedRoute` กับ RBAC
- ✅ User ทั่วไปไม่สามารถเข้าถึง Admin features ได้
- ✅ Soft Delete แทน Hard Delete เพื่อความปลอดภัยของข้อมูล

---

## [1.2.0] - Previous Version
(เนื้อหาจากเวอร์ชันก่อนหน้า)

---

## Development Notes

### Next Phase Priorities
1. ⏳ สร้างหน้า Assessment Roadmap/Flow (/assessment-roadmap)
2. ⏳ เพิ่ม Cycle Selector ใน Dashboard/Header
3. ⏳ ปรับหน้า Evidence, Data และอื่นๆ ให้รองรับ cycleId

### Known Issues
- ยังไม่มี Cycle Selector UI (จะพัฒนาในเวอร์ชันถัดไป)
- Dashboard ยังแสดงข้อมูล hard-coded (0%, -, etc.)

### Future Enhancements
- Dashboard แสดงสถิติจริงจาก Database
- Notification system
- Activity log / Audit trail
- Bulk operations
- Export/Import data
