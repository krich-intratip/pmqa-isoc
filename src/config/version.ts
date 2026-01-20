/**
 * Application Version Configuration
 *
 * Central source of truth for version numbers and release dates.
 * Update this file when releasing a new version.
 */

export const APP_VERSION = {
  version: '1.8.0',
  lastUpdate: '2026-01-20',
  releaseDate: '20 มกราคม 2569',

  // Version history for About page
  releases: {
    'v1.8.0': {
      date: '20 มกราคม 2569',
      title: 'Code Quality & Type Safety Improvements',
      features: [
        {
          category: 'Code Quality',
          icon: 'Code',
          description: 'ปรับปรุงคุณภาพโค้ดและความปลอดภัยของ Type',
          items: [
            'แก้ไข ESLint errors จาก 105+ รายการ เหลือ 0 errors',
            'เปลี่ยนจาก any types เป็น proper TypeScript types',
            'ลบ unused imports ทั้งหมด',
            'แก้ไข useEffect dependencies warnings',
            'ปรับปรุง Type coverage เป็น >95%',
          ],
        },
        {
          category: 'Technical Improvements',
          icon: 'Settings',
          description: 'การปรับปรุงทางเทคนิค',
          items: [
            'ActivityLog.details ใช้ Record<string, unknown>',
            'User role/status ใช้ union types',
            'เพิ่ม useCallback สำหรับ performance',
            'Build สำเร็จโดยไม่มี errors',
          ],
        },
      ],
    },
    'v1.7.4': {
      date: '20 มกราคม 2569',
      title: 'Dashboard Announcements UI Refinement',
      features: [
        {
          category: 'User Interface',
          icon: 'Layout',
          description: 'ปรับปรุงการแสดงผลประกาศ',
          items: [
            'ปรับ Layout เป็น 3 คอลัมน์ (Grid View)',
            'เพิ่มระบบย่อ/ขยายเนื้อหา (Expand/Collapse)',
            'เพิ่ม Animation การแสดงผลที่นุ่มนวลขึ้น',
            'ปรับขนาด Card ให้เท่ากันเพื่อความสวยงาม',
          ],
        },
      ],
    },
    'v1.7.3': {
      date: '20 มกราคม 2569',
      title: 'Dashboard Announcements Feature',
      features: [
        {
          category: 'Dashboard Enhancements',
          icon: 'Megaphone',
          description: 'ระบบประกาศข่าวสารบน Dashboard',
          items: [
            'เพิ่ม 3 slot announcements (PMQA คืออะไร, ความสำคัญ, ประกาศ)',
            'แสดงผลแบบ Card Grid พร้อม Animation',
            'รองรับการปรับแต่ง Title, Content และ Link',
            'Admin Dashboard Tab สำหรับจัดการข้อมูลประกาศ',
            'แสดงผล responsive บนทุกอุปกรณ์',
          ],
        },
      ],
    },
    'v1.7.2': {
      date: '20 มกราคม 2569',
      title: 'Dashboard Real Data & Notification System',
      features: [
        {
          category: 'Dashboard Real Data Integration',
          icon: 'LayoutDashboard',
          description: 'Dashboard แสดงข้อมูลจริงจากระบบ',
          items: [
            'แสดงจำนวน KPI ที่บันทึกในรอบประเมิน',
            'แสดงจำนวน User รอการอนุมัติ (Admin)',
            'สถิติ Evidence และ Verified count จริง',
            'Progress คำนวณจากข้อมูลจริง',
          ],
        },
        {
          category: 'In-App Notification System',
          icon: 'Bell',
          description: 'ระบบแจ้งเตือนภายใน App',
          items: [
            'NotificationBell บน Header',
            'แสดง Unread count badge',
            'Notification เมื่อถูก Approve/Reject',
            'Mark as Read และ Mark All as Read',
          ],
        },
      ],
    },
    'v1.7.1': {
      date: '20 มกราคม 2569',
      title: 'Version Sync & Minor Fixes',
      features: [
        {
          category: 'Version Synchronization',
          icon: 'RefreshCw',
          description: 'Sync version ใน package.json และ version.ts',
          items: [
            'แก้ไข version mismatch',
            'อัปเดต lastUpdate date',
          ],
        },
      ],
    },
    'v1.7.0': {
      date: '20 มกราคม 2569',
      title: 'Role-Based Dashboard with Tabs & Enhanced Permissions',
      features: [
        {
          category: 'Adaptive Dashboard Design',
          icon: 'LayoutDashboard',
          description: 'Dashboard ปรับตามบทบาทผู้ใช้งาน',
          items: [
            'Admin Dashboard มี 4 Tabs (ภาพรวม, จัดการผู้ใช้, ประวัติการใช้งาน, เครื่องมือ Phase)',
            'User Dashboard แสดงเฉพาะเครื่องมือที่มีสิทธิ์เข้าถึง',
            'Phase Tools ถูกกรองตาม Role อัตโนมัติ',
            'UI ชัดเจนขึ้น ไม่สับสน',
          ],
        },
        {
          category: 'Enhanced Permission System',
          icon: 'ShieldCheck',
          description: 'ระบบ Permission ที่ยืดหยุ่นมากขึ้น',
          items: [
            'Helper functions สำหรับตรวจสอบสิทธิ์',
            'shouldShowAdminTabs(), canViewSystemStats()',
            'getAvailablePhaseTools() กรอง Phase ตาม Role',
            'Read-only users แสดงเฉพาะ Dashboard',
          ],
        },
      ],
    },
    'v1.6.2': {
      date: '20 มกราคม 2569',
      title: 'User Management Improvements & Bug Fixes',
      features: [
        {
          category: 'Enhanced User Management',
          icon: 'Users',
          description: 'ปรับปรุงระบบจัดการผู้ใช้งาน',
          items: [
            'แก้ไข Bug การอัปเดตข้อมูล User',
            'เพิ่มการแสดง "เข้าใช้งานล่าสุด" ในตาราง',
            'เพิ่ม Validation ก่อนบันทึกข้อมูล',
            'แก้ปัญหา isActive field sync',
          ],
        },
        {
          category: 'Improved Approval Process',
          icon: 'ShieldCheck',
          description: 'ปรับปรุงกระบวนการอนุมัติ User',
          items: [
            'แก้ไขข้อมูล User ก่อนอนุมัติได้',
            'กำหนด Role, หน่วยงาน, metadata',
            'Dialog แก้ไขข้อมูลก่อนอนุมัติ',
            'Confirmation ก่อนอนุมัติ',
          ],
        },
      ],
    },
    'v1.6.0': {
      date: '19 มกราคม 2569',
      title: 'File Versioning System & Extended Cycle Support',
      features: [
        {
          category: 'File Versioning System',
          icon: 'FileText',
          description: 'จัดการเวอร์ชันไฟล์หลักฐานแบบครบวงจร',
          items: [
            'Upload ไฟล์เวอร์ชันใหม่ได้',
            'ดูประวัติไฟล์ทุกเวอร์ชัน',
            'Revert กลับเวอร์ชันเก่า (Admin)',
            'Permission-based Delete (Admin only)',
          ],
        },
        {
          category: 'Extended Cycle Support',
          icon: 'Calendar',
          description: 'รองรับ Cycle ในหน้า Phase 1-2',
          items: [
            'Dashboard Real Data Integration',
            'Gap Tracker/Analyzer/Gate Checker',
            'Data Catalog & KPI Dictionary',
            'Warning UI เมื่อไม่ได้เลือก Cycle',
          ],
        },
      ],
    },
    'v1.5.0': {
      date: '15 มกราคม 2569',
      title: 'Cycle Integration & Assessment Roadmap',
      features: [
        {
          category: 'Assessment Roadmap',
          icon: 'Map',
          description: 'แผนที่กระบวนการประเมิน PMQA แบบ Interactive',
          items: [
            'แสดง 8 Phases และ 18 Tools',
            'Flow Chart และ Detailed View',
            'ลิงก์ไปยังเครื่องมือได้โดยตรง',
            'Responsive design',
          ],
        },
        {
          category: 'Cycle Integration',
          icon: 'Calendar',
          description: 'รองรับการทำงานแบบหลายรอบการประเมิน',
          items: [
            'Cycle Selector ใน Header/Dashboard',
            'Evidence & KPI Data แยกตามรอบ',
            'Auto-select active cycle',
            'Warning UI เมื่อไม่มี cycle',
          ],
        },
      ],
    },
    'v1.4.0': {
      date: '10 มกราคม 2569',
      title: 'Activity Logging',
      features: [
        {
          category: 'Activity Logging System',
          icon: 'Activity',
          description: 'ระบบบันทึกกิจกรรมแบบครอบคลุม',
          items: [
            'บันทึก Login/Logout อัตโนมัติ',
            'ติดตาม CRUD operations ทุกประเภท',
            'บันทึก File Upload/Download',
            'ดูประวัติ Activity พร้อม Filters ขั้นสูง',
            'Export Activity Logs เป็น CSV',
          ],
        },
        {
          category: 'Enhanced User Management',
          icon: 'Users',
          description: 'จัดการผู้ใช้งานแบบขั้นสูง',
          items: [
            'Tabs แยกตามสถานะ (Pending, Approved, Disabled, Rejected)',
            'Filters ขั้นสูง (Unit Category, Unit Name, Region)',
            'Bulk Approve/Reject หลายคนพร้อมกัน',
            'Sorting ตามชื่อหรือวันที่สมัคร',
            'Export ข้อมูลผู้ใช้เป็น CSV',
          ],
        },
      ],
    },
  },
} as const;

// Helper function to get version string
export const getVersion = () => APP_VERSION.version;

// Helper function to get formatted release date
export const getReleaseDate = () => APP_VERSION.releaseDate;

// Helper function to get last update date (ISO format)
export const getLastUpdate = () => APP_VERSION.lastUpdate;
