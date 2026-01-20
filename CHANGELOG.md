# Changelog

All notable changes to the PMQA ISOC project will be documented in this file.

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
