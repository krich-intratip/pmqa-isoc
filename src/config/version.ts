/**
 * Application Version Configuration
 *
 * Central source of truth for version numbers and release dates.
 * Update this file when releasing a new version.
 */

export const APP_VERSION = {
  version: '3.0.10',
  lastUpdate: '2026-01-28',
  releaseDate: '28 มกราคม 2569',

  // Version history for About page
  releases: {
    'v3.0.10': {
      date: '28 มกราคม 2569',
      title: 'System Admin Role & Registration Flow',
      features: [
        {
          category: 'System Admin Role',
          icon: 'Shield',
          description: 'เพิ่ม Role ผู้ดูแลระบบ (System Admin)',
          items: [
            'เพิ่ม Role System Admin ที่มีสิทธิ์เทียบเท่า Super Admin',
            'System Admin ไม่สามารถแก้ไข/ลบ Super Admin ได้',
            'รองรับการจัดการผู้ใช้ตาม Role Hierarchy',
            'เพิ่ม System Admin ใน Bulk Import Users',
          ],
        },
        {
          category: 'Registration Flow',
          icon: 'UserPlus',
          description: 'ปรับปรุงขั้นตอนการลงทะเบียน',
          items: [
            'แสดง Popup แจ้งผู้ใช้ใหม่หลังลงทะเบียนว่ารอการอนุมัติ',
            'ส่ง Email แจ้งเตือน Super Admin และ System Admin เมื่อมีผู้ใช้ใหม่',
            'ผู้ใช้ที่รออนุมัติสามารถเข้าถึงเฉพาะหน้า Help และ About',
          ],
        },
      ],
    },
    'v3.0.9': {
      date: '26 มกราคม 2569',
      title: 'Login Popup Fix - Redirect Fallback',
      features: [
        {
          category: 'Login Fix',
          icon: 'Shield',
          description: 'แก้ไขปัญหา Popup ถูก Block หรือปิดเร็วเกินไป',
          items: [
            'เพิ่ม Auto-fallback ไป Redirect เมื่อ Popup ถูก Block',
            'เพิ่มปุ่ม "เข้าสู่ระบบแบบ Redirect" สำหรับกรณี Popup ไม่ทำงาน',
            'ปรับปรุง Error Messages เป็นภาษาไทยที่เข้าใจง่าย',
            'เพิ่ม Loading State และ Error Alert ในหน้า Login',
            'รองรับ getRedirectResult สำหรับ Login ผ่าน Redirect',
          ],
        },
      ],
    },
    'v3.0.8': {
      date: '26 มกราคม 2569',
      title: 'Login Enhancement - Error Dialog & Configuration',
      features: [
        {
          category: 'Login Improvements',
          icon: 'Shield',
          description: 'ปรับปรุงประสบการณ์การ Login',
          items: [
            'เพิ่ม Error Dialog Popup แสดงรายละเอียด error ที่ชัดเจน',
            'แก้ไข error handling ให้ผู้ใช้เห็นสาเหตุ error',
            'เพิ่ม Environment Variables สำหรับ Firebase Configuration',
            'ปรับปรุง UX เมื่อเกิด error ในขั้นตอน login',
          ],
        },
      ],
    },
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
            'แสดงประวัติการ Online ในหน้าแก้ไขผู้ใช้ (เข้ามาเมื่อไหร่ นานแค่)',
          ],
        },
        {
          category: 'Dark Mode Improvements',
          icon: 'Palette',
          description: 'ปรับปรุง Dark Mode ให้อ่านง่ายขึ้น',
          items: [
            'ปรับสีตัวหนังสือให้มีความคมชัดมากขึ้น',
            'ปรับสีพื้นหลักและ Card ให้เหมาะสม',
            'ปรับปรุง Contrast Ratio สำหรับการอ่าน',
            'ปรับปรุง Border และ Input ให้ชัดเจนขึ้น',
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
          description: 'ปรับหมายเลขเวอร์ชันใน package.json และ version.ts',
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
  },
} as const;

// Helper function to get version string
export const getVersion = () => APP_VERSION.version;

// Helper function to get formatted release date
export const getReleaseDate = () => APP_VERSION.releaseDate;

// Helper function to get last update date (ISO format)
export const getLastUpdate = () => APP_VERSION.lastUpdate;
