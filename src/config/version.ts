/**
 * Application Version Configuration
 *
 * Central source of truth for version numbers and release dates.
 * Update this file when releasing a new version.
 */

export const APP_VERSION = {
  version: '3.0.7',
  lastUpdate: '2026-01-23',
  releaseDate: '23 มกราคม 2569',

  // Version history for About page
  releases: {
    'v3.0.7': {
      date: '23 มกราคม 2569',
      title: 'Login Fix - Google OAuth Scope Removed',
      features: [
        {
          category: 'Login Fix',
          icon: 'Shield',
          description: 'แก้ไขปัญหา "แอปนี้ยังไม่ได้รับการยืนยันโดย Google"',
          items: [
            'ลบ calendar.events scope ออกจาก Google OAuth',
            'ผู้ใช้สามารถ Login ได้โดยไม่ต้องเห็นหน้าจอ Unverified App',
            'ฟีเจอร์ Sync ปฏิทินถูกปิดใช้งานชั่วคราว',
          ],
        },
      ],
    },
    'v3.0.6': {
      date: '21 มกราคม 2569',
      title: 'Complete Dark Mode Support',
      features: [
        {
          category: 'Dark Mode Improvements',
          icon: 'Palette',
          description: 'ปรับปรุง Dark Mode ให้สมบูรณ์ทุกหน้า',
          items: [
            'แก้ไข hardcoded colors ในทุก components ให้ใช้ semantic colors',
            'ปรับปรุง Guide page, Search Dialog, Comments, Chat และ Insights',
            'เพิ่ม dark mode support สำหรับ Online Users Sidebar และ Live Presence',
            'ปรับปรุง contrast ratio และความอ่านง่ายใน dark mode',
            'แก้ไข UI components ให้รองรับ dark mode อย่างสมบูรณ์',
          ],
        },
      ],
    },
    'v3.0.5': {
      date: '21 มกราคม 2569',
      title: 'User Management & Dark Mode Improvements',
      features: [
        {
          category: 'User Management Enhancements',
          icon: 'Users',
          description: 'ปรับปรุงการจัดการผู้ใช้งานและแสดงสถานะออนไลน์',
          items: [
            'แสดงสัญลักษณ์ออนไลน์/ออฟไลน์ที่หน้าชื่อ User ในตาราง',
            'Filter กรองผู้ใช้ตามสถานะออนไลน์ (ทั้งหมด/ออนไลน์/ออฟไลน์)',
            'เรียงลำดับตามชื่ออัตโนมัติ',
            'แสดงประวัติการ Online ในหน้าแก้ไขผู้ใช้ (เข้ามาเมื่อไหร่ นานแค่ไหน)',
          ],
        },
        {
          category: 'Dark Mode Improvements',
          icon: 'Palette',
          description: 'ปรับปรุง Dark Mode ให้อ่านง่ายขึ้น',
          items: [
            'ปรับสีตัวหนังสือให้มีความคมชัดมากขึ้น',
            'ปรับสีพื้นหลังและ Card ให้เหมาะสม',
            'ปรับปรุง Contrast Ratio สำหรับการอ่าน',
            'ปรับสี Border และ Input ให้ชัดเจนขึ้น',
          ],
        },
      ],
    },
    'v3.0.4': {
      date: '21 มกราคม 2569',
      title: 'Stability & Meta Sync',
      features: [
        {
          category: 'Version Sync',
          icon: 'Package',
          description: 'ปรับหมายเลขเวอร์ชันให้ตรงกับการ deploy ล่าสุด',
          items: [
            'อัปเดตแหล่งอ้างอิงเวอร์ชันหลักเป็น 3.0.4',
            'แก้ไขเอกสารและไฟล์ metadata ให้ตรงกัน',
          ],
        },
      ],
    },
    'v3.0.3': {
      date: '21 มกราคม 2569',
      title: 'Performance & Real-time User Presence',
      features: [
        {
          category: 'Online Users Popup',
          icon: 'Users',
          description: 'แสดงรายชื่อผู้ใช้ออนไลน์แบบ Popup',
          items: [
            'คลิกที่ปุ่มผู้ใช้ออนไลน์เพื่อดูรายชื่อทั้งหมด',
            'แสดง Avatar, ชื่อ และสถานะเวลาที่ active',
            'Admin สามารถคลิกชื่อ User เพื่อไปหน้าจัดการผู้ใช้',
            'ปุ่มลัดไปหน้าจัดการผู้ใช้ทั้งหมด (Admin)',
            'Real-time update ทุก 30 วินาที',
          ],
        },
        {
          category: 'INP Performance Fix',
          icon: 'Zap',
          description: 'แก้ไข UI ค้างเมื่อกดปุ่มอนุมัติ User',
          items: [
            'ใช้ Optimistic UI Update - แสดงผลทันที',
            'Fire-and-forget สำหรับ logging และ notification',
            'Rollback อัตโนมัติเมื่อเกิดข้อผิดพลาด',
            'ลดเวลาตอบสนองจาก ~1.5 วินาที เหลือทันที',
          ],
        },
        {
          category: 'Presence Tracking Fix',
          icon: 'Activity',
          description: 'แก้ไขการติดตามผู้ใช้ออนไลน์',
          items: [
            'Presence tracking ทำงานได้แม้ไม่มี unitId',
            'User ทุกคนจะถูกแสดงในรายชื่อออนไลน์',
          ],
        },
      ],
    },
    'v3.0.2': {
      date: '21 มกราคม 2569',
      title: 'About Page Tabs & Dark Mode Fix',
      features: [
        {
          category: 'About Page Restructure',
          icon: 'Layout',
          description: 'ปรับโครงสร้างหน้า About ใหม่ทั้งหมด',
          items: [
            '4 Tabs: Functional, Non-Functional, Technology, Development History',
            'Collapsible Accordion sections ในทุก Tab',
            'Functional: 8 หมวดหมู่ (User, Evidence, SAR, AI, Dashboard, etc.)',
            'Non-Functional: 6 หมวดหมู่ (Security, Performance, etc.)',
            'Technology: 6 หมวดหมู่ + Architecture Diagram',
            'Development History: 18 เวอร์ชัน (ซ่อนรายละเอียด กดขยายได้)',
          ],
        },
        {
          category: 'Dark Mode Fix',
          icon: 'Palette',
          description: 'แก้ไข Dark Mode ทำงานทั้งเว็บ',
          items: [
            'แก้ไข hardcoded colors ใน layout.tsx',
            'แก้ไข AppHeader.tsx ใช้ semantic colors',
            'แก้ไข AppFooter.tsx รองรับ Dark Mode',
            'ใช้ CSS variables (bg-background, text-foreground, etc.)',
          ],
        },
      ],
    },
    'v3.0.1': {
      date: '21 มกราคม 2569',
      title: 'High Priority Features & Bug Fixes',
      features: [
        {
          category: 'Bulk Import Users',
          icon: 'Upload',
          description: 'นำเข้าผู้ใช้จำนวนมากจาก Excel',
          items: [
            'อัปโหลด Excel/CSV เพื่อสร้างผู้ใช้หลายคนพร้อมกัน',
            'ตรวจสอบข้อมูลอัตโนมัติก่อนนำเข้า',
            'ดาวน์โหลดแม่แบบไฟล์นำเข้า',
          ],
        },
        {
          category: 'Email Notifications',
          icon: 'Mail',
          description: 'ระบบแจ้งเตือนทางอีเมล (ต้องใช้ Blaze Plan)',
          items: [
            'แจ้งเตือนกำหนดส่งรอบประเมิน',
            'แจ้งเตือนการอนุมัติ/ปฏิเสธบัญชี',
            'แจ้งเตือนเมื่อมีคน @mention',
          ],
        },
        {
          category: 'Bug Fixes',
          icon: 'Wrench',
          description: 'แก้ไขปัญหาและปรับปรุง',
          items: [
            'แก้ไข getUnitLabel() placeholder function',
            'ติดตั้ง dependencies ที่ขาด (regression, react-pdf, qrcode)',
            'เพิ่ม Tooltip component ที่ขาด',
          ],
        },
      ],
    },
    'v3.0.0': {
      date: '21 มกราคม 2569',
      title: 'Smart PMQA: AI Automation & Engagement',
      features: [
        {
          category: 'AI Automation',
          icon: 'Sparkles',
          description: 'เพิ่มประสิทธิภาพการทำงานด้วย AI',
          items: [
            'Smart Evidence Tagging (Tag เอกสารอัตโนมัติด้วย AI)',
            'Chat with PMQA Rules (ถาม-ตอบเกณฑ์ด้วย RAG)',
          ],
        },
        {
          category: 'Data Insights',
          icon: 'BarChart3',
          description: 'วิเคราะห์ข้อมูลเชิงลึก',
          items: [
            'Predictive Scoring (พยากรณ์คะแนนในอนาคต)',
            'Department Ranking (จัดอันดับความก้าวหน้า)',
          ],
        },
        {
          category: 'Engagement & UX',
          icon: 'Users',
          description: 'ประสบการณ์การใช้งานที่ดีขึ้น',
          items: [
            'Live Collaboration (เห็นผู้ใช้งานอื่นแบบ Real-time)',
            'Interactive eBook Export (QR Codes & Clickable TOC)',
          ],
        },
      ],
    },
    'v2.4.1': {
      date: '20 มกราคม 2569',
      title: 'Dark Mode & UI Improvements',
      features: [
        {
          category: 'User Interface',
          icon: 'Palette',
          description: 'ปรับปรุงการแสดงผลและธีม',
          items: [
            'Light/Dark Mode system (Theme Toggle)',
            'หน้า Settings ใหม่สำหรับจัดการการตั้งค่า',
            'ปรับปรุง UI ให้รองรับทั้งโหมดมืดและสว่าง',
          ],
        },
      ],
    },
    'v2.3.1': {
      date: '20 มกราคม 2569',
      title: 'AI Enhancements & User Experience',
      features: [
        {
          category: 'AI Capabilities',
          icon: 'Sparkles',
          description: 'เพิ่มขีดความสามารถ AI',
          items: [
            'AI Trend Analysis วิเคราะห์แนวโน้มเทียบกับรอบก่อนหน้า',
            'AI Writing Assistant (Refine Text) ปรับภาษาทางการ',
            'Dynamic Tone Selection (Official, Concise, Elaborate)',
          ],
        },
        {
          category: 'User Experience',
          icon: 'Compass',
          description: 'ประสบการณ์ผู้ใช้',
          items: [
            'User Onboarding Tour แนะนำการใช้งานสำหรับผู้ใช้ใหม่',
            'Interactive Spotlight Guide',
          ],
        },
      ],
    },
    'v2.3.0': {
      date: '20 มกราคม 2569',
      title: 'Comments & @Mentions System',
      features: [
        {
          category: 'Comments & @Mentions',
          icon: 'MessageSquare',
          description: 'ระบบความคิดเห็นและการกล่าวถึงผู้ใช้',
          items: [
            'Comment บน Evidence items',
            'Comment บน SAR sections',
            '@mention ผู้ใช้พร้อม autocomplete',
            'แจ้งเตือนเมื่อถูก mention',
            'แก้ไข/ลบ comment ของตัวเอง',
            'Comment history & audit trail',
          ],
        },
        {
          category: 'AI Strategic Insights',
          icon: 'Sparkles',
          description: 'ระบบวิเคราะห์กลยุทธ์ด้วย AI (Advanced)',
          items: [
            'Generate Strategic Insights (SWOT Analysis)',
            'Executive Summary generation',
            'AI-powered Recommendations',
            'Q&A Assistant (Chat with your SAR data)',
            'New Insights Dashboard',
          ],
        },
      ],
    },
    'v2.2.0': {
      date: '20 มกราคม 2569',
      title: 'Google Calendar Integration',
      features: [
        {
          category: 'Google Calendar Sync',
          icon: 'Calendar',
          description: 'ซิงค์กำหนดเวลารอบประเมินกับ Google Calendar',
          items: [
            'ปุ่ม Sync Calendar ในหน้า Cycles',
            'สร้าง Event สำหรับวันเริ่มและสิ้นสุด',
            'แจ้งเตือนล่วงหน้า 7, 3, 1 วัน',
            'OAuth Google Calendar permission',
          ],
        },
      ],
    },
    'v2.1.1': {
      date: '20 มกราคม 2569',
      title: 'Global Search Enhancement',
      features: [
        {
          category: 'Global Search',
          icon: 'Search',
          description: 'ค้นหาข้อมูลทั้งระบบแบบครอบคลุม',
          items: [
            'ค้นหา Pages, Evidence, KPI, SAR, และ Users',
            'Filter tabs กรองตามประเภทข้อมูล',
            'Text Highlighting แสดงคำที่ค้นพบ',
            'Keyboard shortcut (Cmd/Ctrl + K)',
            'Loading indicator ขณะค้นหา',
            'Type badges แยกสีตามประเภท',
          ],
        },
      ],
    },
    'v2.1.0': {
      date: '20 มกราคม 2569',
      title: 'Real-time Collaboration & Advanced Export System',
      features: [
        {
          category: 'Real-time Collaboration',
          icon: 'Users',
          description: 'ระบบติดตามผู้ใช้ออนไลน์แบบ Real-time',
          items: [
            'Online Users Sidebar - แสดงผู้ใช้ที่ออนไลน์ด้านขวา',
            'Real-time Presence Tracking ด้วย Firestore',
            'User Avatar พร้อม Online Indicator (เขียว/เทา)',
            'Search และ Filter ตาม Role และ Unit',
            'แสดงเวลา Active ล่าสุดของผู้ใช้',
            'Auto-detect Online/Offline status',
          ],
        },
        {
          category: 'Advanced Export System',
          icon: 'FileText',
          description: 'ส่งออกรายงานหลายรูปแบบพร้อมกราฟสวยงาม',
          items: [
            'Export Dashboard เป็น HTML พร้อมกราฟสวยงาม',
            'แสดง Phase Progress ทั้ง 8 Phase พร้อม Bar Chart',
            'รองรับภาษาไทยทุก Export (CSV, HTML)',
            'Print-ready HTML Report (Ctrl+P)',
            'Gradient Design และ Responsive Layout',
          ],
        },
        {
          category: 'Code Quality Improvements',
          icon: 'Code',
          description: 'ปรับปรุงคุณภาพโค้ดและความปลอดภัย',
          items: [
            'แก้ไข ESLint errors ทั้งหมด',
            'ปรับปรุง TypeScript types (ลบ any types)',
            'แก้ไข React Hook dependencies',
            'ลบ unused imports และ variables',
            'Build สำเร็จ 100% ไม่มี errors',
          ],
        },
        {
          category: 'Security Enhancement',
          icon: 'Shield',
          description: 'เพิ่มความปลอดภัยของข้อมูล',
          items: [
            'Firestore Security Rules ครบทุก Collection',
            'Role-based Access Control (Admin/Reviewer/Editor/Viewer)',
            'Presence Collection Security Rules',
            'Authentication-based Read/Write permissions',
            'Immutable Activity Log protection',
          ],
        },
      ],
    },
    'v2.0.0': {
      date: '20 มกราคม 2569',
      title: 'Complete Cycle Integration & Dashboard Enhancement',
      features: [
        {
          category: 'Cycle Integration',
          icon: 'Calendar',
          description: 'รองรับ Cycle ครบทุก Phase',
          items: [
            'Phase 3-7 รองรับ Cycle ID filtering',
            'Cycle Badge แสดงบนทุกหน้า',
            'Warning UI เมื่อไม่ได้เลือกรอบ',
            'Auto-refresh เมื่อเปลี่ยนรอบ',
          ],
        },
        {
          category: 'Dashboard Enhancement',
          icon: 'LayoutDashboard',
          description: 'Dashboard แสดงข้อมูลจริง',
          items: [
            'Phase Progress Section แสดงความคืบหน้า 8 Phase',
            'Real-time Stats จาก Firestore',
            'Cycle Comparison Widget เปรียบเทียบรอบ',
            'Export Dashboard Summary เป็น CSV',
          ],
        },
        {
          category: 'Data Export',
          icon: 'Download',
          description: 'ส่งออกข้อมูลหลายรูปแบบ',
          items: [
            'Dashboard Summary CSV',
            'Evidence List CSV',
            'KPI Data CSV',
            'SAR Document HTML',
          ],
        },
      ],
    },
    'v1.9.0': {
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
