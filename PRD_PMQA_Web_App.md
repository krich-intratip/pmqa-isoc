# Product Requirements Document (PRD)
# PMQA 4.0 Web Application Platform

> **Smart Assessment Management System for National Security Network**

---

## Document Information

| Field | Value |
|-------|-------|
| **Product Name** | PMQA 4.0 Web Application Platform |
| **Version** | 1.0.0 |
| **Last Updated** | 19 มกราคม 2568 |
| **Status** | Draft - Ready for Development |
| **Lead Developer** | พล.ท.ดร.กริช อินทราทิพย์ |
| **Portfolio** | https://portfolio-two-sepia-33.vercel.app/ |
| **Project Type** | Single Platform - Multi-Phase Development |
| **Target** | Production-Ready (MVP → Full Platform) |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Goals & Objectives](#3-goals--objectives)
4. [User Personas & Roles](#4-user-personas--roles)
5. [Functional Requirements](#5-functional-requirements)
6. [Technical Architecture](#6-technical-architecture)
7. [Data Model](#7-data-model)
8. [User Flows](#8-user-flows)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Success Metrics](#10-success-metrics)
11. [Development Roadmap](#11-development-roadmap)
12. [Risk Management](#12-risk-management)
13. [Appendix](#13-appendix)

---

## 1. Executive Summary

### 1.1 Product Vision
PMQA 4.0 Web Application Platform เป็นระบบบริหารจัดการการประเมินคุณภาพการบริหารจัดการภาครัฐ (PMQA 4.0) แบบครบวงจรสำหรับเครือข่าย 70+ หน่วยงาน โดยใช้ AI และ Automation เพื่อยกระดับประสิทธิภาพการทำงานและเพิ่มโอกาสได้คะแนนระดับ Advance

### 1.2 Business Context
- **องค์กร:** กองอำนวยการรักษาความมั่นคงภายในราชอาณาจักร (กอ.รมน.)
- **ขอบเขต:** เครือข่าย 70+ หน่วย (ส่วนกลาง/ภาค/จังหวัด/พื้นที่)
- **เป้าหมาย:** คะแนน PMQA ระดับ Advance
- **ปัญหาหลัก:** 
  - ผลลัพธ์ย้อนหลังไม่สมบูรณ์ และต่ำกว่าค่าเฉลี่ยประเทศ
  - การจัดการหลักฐาน 20-30% เป็นเอกสารชั้นความลับ
  - การรวมข้อมูลจากหลายหน่วยไม่มีมาตรฐาน
  - การเขียน SAR ใช้เวลานานและไม่ได้คะแนนเต็มศักยภาพ

### 1.3 Solution Overview
Web Application แบบ Single Platform ที่รวม 20 Mini Apps เข้าด้วยกัน โดยแบ่งการพัฒนาเป็น 7 Phases:

| Phase | Apps | Focus |
|-------|------|-------|
| Phase 0 | 4 | Project Setup & Governance |
| Phase 1 | 4 | Evidence Management |
| Phase 2 | 5 | Data Management |
| Phase 3 | 3 | Analysis & Narrative |
| Phase 4 | 2 | SAR Writing |
| Phase 5 | 2 | Results |
| Phase 6 | 2 | Quality Assurance |
| Phase 7 | 2 | Interview Prep |
| **Total** | **24** | **End-to-End PMQA Platform** |

### 1.4 Key Differentiators
- 🤖 **AI-Powered:** ใช้ Google AI (Gemini) ช่วยวิเคราะห์, เขียน SAR, แนะนำการปรับปรุง
- 🌐 **Network-Native:** ออกแบบสำหรับการทำงานแบบเครือข่าย 70+ หน่วย
- 📊 **Data-Driven:** Dashboard แบบ real-time สำหรับติดตามความคืบหน้า
- 🔒 **Security-First:** รองรับเอกสารชั้นความลับด้วย Access Control
- 📱 **Mobile-Ready:** Responsive design ใช้งานได้ทุก device
- 🆓 **Cost-Effective:** ใช้ Free tiers ของ Firebase, Vercel, Google AI

---

## 2. Product Overview

### 2.1 Product Description
PMQA 4.0 Web Application Platform เป็นระบบบริหารจัดการการประเมิน PMQA แบบครบวงจร ประกอบด้วย:

#### Core Modules (20 Apps)
**Phase 0: Project Setup & Governance (4 Apps)**
1. Network Scope Mapper - กำหนดขอบเขตเครือข่าย
2. Owner Matrix Builder - สร้าง RACI Matrix
3. Repository Setup Wizard - จัดโครงสร้างเอกสาร
4. Submission Calendar Generator - ปฏิทินส่งข้อมูล

**Phase 1: Evidence Management (4 Apps)**
5. Evidence Register Builder - ทะเบียนหลักฐาน
6. Evidence Gap Analyzer - วิเคราะห์ช่องว่าง
7. Evidence Gate Checker - ตรวจคุณภาพหลักฐาน
8. Evidence Gap Closure Tracker - ติดตามปิดช่องว่าง

**Phase 2: Data Management (5 Apps)**
9. Data Source Catalog Builder - สำรวจแหล่งข้อมูล
10. KPI Dictionary Builder - สร้างนิยาม KPI
11. Excel Template Generator - สร้างเทมเพลต
12. Data Collector & Validator - รวมและตรวจสอบข้อมูล
13. Data Cleaning Assistant - ทำความสะอาดข้อมูล
14. Results Baseline Analyzer - วิเคราะห์ผลลัพธ์

**Phase 3: Analysis & Narrative (3 Apps)**
15. Context Pack Builder - สร้างบริบทองค์กร
16. Risk & Foresight Analyzer - วิเคราะห์ความเสี่ยง
17. Strategy-to-KPI Linker - เชื่อมโยงยุทธศาสตร์

**Phase 4: SAR Writing (2 Apps)**
18. SAR Outline Generator - สร้างโครงคำตอบ
19. SAR Writer Assistant - ช่วยเขียน SAR (AI-powered)

**Phase 5: Results (2 Apps)**
20. Results Data Pack Builder - จัดทำผลลัพธ์
21. Recovery Narrative Builder - เขียน Recovery Story

**Phase 6: Quality Assurance (2 Apps)**
22. Cross-Consistency Auditor - ตรวจความสอดคล้อง
23. Score Simulator & Fix Planner - จำลองคะแนน

**Phase 7: Interview Prep (2 Apps)**
24. Interview Brief Generator - สร้าง Talking Points
25. Q&A Bank Builder - คลังคำถาม-คำตอบ

> **Note:** จำนวน Apps เพิ่มจาก 20 → 24 เนื่องจากแยก Apps ที่ทำงานร่วมกันออกเป็นโมดูลย่อย

### 2.2 Target Audience
- **Primary Users:** เจ้าหน้าที่ส่วนกลาง/ภาค/จังหวัด จำนวน 200-500 users
- **Secondary Users:** ผู้บริหาร, Data Owners, Reviewers
- **Geographic:** ทั่วประเทศไทย (70+ locations)

### 2.3 Value Proposition
| Stakeholder | Current Pain | Solution | Value |
|-------------|--------------|----------|-------|
| **เจ้าหน้าที่** | ทำ SAR ใช้เวลา 2-3 เดือน | AI ช่วยเขียน + Template | ลดเวลา 50% |
| **Data Owner** | ส่งข้อมูลผิดรูปแบบ ส่งซ้ำ | Template + Validation | ลดข้อผิดพลาด 80% |
| **ผู้บริหาร** | ไม่รู้ความคืบหน้าแบบ real-time | Dashboard | เห็นภาพรวมทันที |
| **กอ.รมน.** | คะแนนต่ำกว่าค่าเฉลี่ย | ระบบช่วยยกระดับ | เพิ่มโอกาสได้ Advance |

---

## 3. Goals & Objectives

### 3.1 Business Goals
1. **เพิ่มคะแนน PMQA:** จากระดับ Basic → **Advance** ภายในปี 2569
2. **ลดเวลาทำงาน:** จาก 3 เดือน → **6 สัปดาห์** (ลด 50%)
3. **เพิ่มความครบถ้วนข้อมูล:** จาก 60% → **95%**
4. **มาตรฐานเครือข่าย:** ให้ 70+ หน่วยใช้มาตรฐานเดียวกัน

### 3.2 Product Goals
1. **MVP (Phase 0):** พร้อมใช้งานภายใน **4 สัปดาห์**
2. **Core Platform (Phase 0-2):** พร้อมภายใน **8 สัปดาห์**
3. **Full Platform (Phase 0-7):** พร้อมภายใน **16 สัปดาห์**
4. **Adoption Rate:** 70%+ ของหน่วยใช้งานภายใน **3 เดือน**

### 3.3 User Goals
1. **ง่ายต่อการใช้:** Non-tech users ใช้ได้ภายใน 15 นาที
2. **ประหยัดเวลา:** ลดงานซ้ำซ้อน และ manual work
3. **คุณภาพสูงขึ้น:** SAR ได้คะแนนดีขึ้น
4. **ความมั่นใจ:** มั่นใจว่าข้อมูลครบและถูกต้อง

### 3.4 Success Metrics (OKRs)
**Objective 1:** เปิดตัว MVP สำเร็จ
- KR1: Phase 0 (4 Apps) Deploy production ภายใน 4 สัปดาห์
- KR2: มีผู้ใช้ทดสอบ 10+ คน และ feedback score > 4/5
- KR3: Uptime > 99%

**Objective 2:** ยกระดับคุณภาพข้อมูล
- KR1: Data completeness เพิ่มจาก 60% → 90%
- KR2: Data quality errors ลดลง 70%
- KR3: Evidence coverage เพิ่มจาก 50% → 95%

**Objective 3:** เพิ่มประสิทธิภาพการทำงาน
- KR1: เวลาเขียน SAR ลดลง 50%
- KR2: เวลารวมข้อมูลลดลง 60%
- KR3: User satisfaction score > 4.5/5

---

## 4. User Personas & Roles

### 4.1 User Roles & Permissions

| Role | Description | Count | Permissions |
|------|-------------|-------|-------------|
| **Super Admin** | ผู้ดูแลระบบสูงสุด | 1-2 | Full access, manage users, system settings |
| **Central Admin** | เจ้าหน้าที่ส่วนกลาง | 5-10 | Create/edit all content, view all data, manage regional users |
| **Regional Coordinator** | ผู้ประสานงานภาค | 5 | Manage provincial users, view regional data, submit regional reports |
| **Provincial Staff** | เจ้าหน้าที่จังหวัด | 77 | View own data, submit data, upload evidence |
| **Data Owner** | เจ้าของข้อมูล KPI | 50-100 | Edit specific KPIs, submit data, view related reports |
| **Reviewer** | ผู้ตรวจสอบ | 20-30 | View content, add comments, approve/reject |
| **Read-Only** | ผู้บริหาร/ผู้ชม | Unlimited | View dashboards and reports only |

### 4.2 Primary Persona: "นาวาเอก สมชาย" (Provincial Staff)

**Demographics:**
- อายุ: 35-45 ปี
- ตำแหน่ง: เจ้าหน้าที่จังหวัด
- ระดับ IT: ปานกลาง (ใช้ Excel, Google Drive ได้)

**Goals:**
- ส่งข้อมูลตรงเวลา
- ทำงานให้ถูกต้องครบถ้วน
- ไม่ต้องส่งซ้ำ

**Pain Points:**
- ไม่แน่ใจว่าข้อมูลครบหรือยัง
- Template เปลี่ยนบ่อย
- ส่งแล้วถูกส่งกลับแก้ไข

**Usage Pattern:**
- Login 2-3 ครั้ง/สัปดาห์
- ใช้เวลา 30-60 นาที/ครั้ง
- ใช้บน Desktop เป็นหลัก

### 4.3 Secondary Persona: "พันเอก วิชัย" (Central Admin)

**Demographics:**
- อายุ: 40-50 ปี
- ตำแหน่ง: เจ้าหน้าที่ส่วนกลาง PMQA
- ระดับ IT: สูง

**Goals:**
- รวบรวมข้อมูลจากทุกหน่วยให้ครบ
- ตรวจสอบคุณภาพข้อมูล
- เขียน SAR ได้คะแนนสูง

**Pain Points:**
- ข้อมูลจากหน่วยไม่ตรงกัน
- ใช้เวลานานในการรวมข้อมูล
- เขียน SAR ยาก ไม่แน่ใจว่าได้คะแนนเต็ม

**Usage Pattern:**
- Login ทุกวัน
- ใช้เวลา 2-4 ชั่วโมง/วัน
- ใช้ทั้ง Desktop และ Tablet

---

## 5. Functional Requirements

### 5.1 Core Features (MVP - Must Have)

#### F1. Authentication & Authorization
- **F1.1** Sign in with Google (OAuth 2.0)
- **F1.2** Role-based access control (7 roles)
- **F1.3** Session management (auto logout after 8 hours)
- **F1.4** Email verification (optional)
- **F1.5** Password reset (if using email/password)

#### F2. Dashboard (Home)
- **F2.1** Overview widgets:
  - Progress by Phase (0-7)
  - Evidence completeness (%)
  - Data quality score
  - Upcoming deadlines
  - Recent activities
- **F2.2** Quick actions:
  - Upload evidence
  - Submit data
  - View my tasks
  - Download reports
- **F2.3** Notifications center
- **F2.4** Search global

#### F3. User Management
- **F3.1** Add/edit/delete users (Admin only)
- **F3.2** Assign roles and permissions
- **F3.3** Bulk import users (CSV/Excel)
- **F3.4** User activity logs
- **F3.5** Deactivate/reactivate users

#### F4. File Management (Google Drive Integration)
- **F4.1** Upload files (PDF, Excel, Images, Docs)
- **F4.2** Organize by folder structure (Phase/Category/Unit)
- **F4.3** File versioning
- **F4.4** Access control (Public/Private/Restricted)
- **F4.5** Search and filter files
- **F4.6** Preview files (PDF, Images)
- **F4.7** Download files
- **F4.8** Bulk operations (move, delete, share)

#### F5. Export Functionality
- **F5.1** Export to Excel (.xlsx)
- **F5.2** Export to PDF (with formatting)
- **F5.3** Export to CSV (raw data)
- **F5.4** Export to Google Sheets (sync)
- **F5.5** Export to HTML (web view)
- **F5.6** Export to Google Docs (formatted)
- **F5.7** Batch export (multiple files)
- **F5.8** Custom export templates

### 5.2 Phase-Specific Features

#### Phase 0: Project Setup & Governance (4 Apps)

**App 0.1: Network Scope Mapper**
- **F0.1.1** Import unit list (Excel/CSV)
- **F0.1.2** Group units by region/province/type
- **F0.1.3** Visualize network map (org chart)
- **F0.1.4** Define aggregation rules (sum/average/weighted)
- **F0.1.5** Export network map (Excel/PDF/Google Sheets)

**App 0.2: Owner Matrix Builder**
- **F0.2.1** Import staff list (Excel/CSV)
- **F0.2.2** Import SAR question structure
- **F0.2.3** AI-suggest owners by expertise
- **F0.2.4** Manual assign Owner/Reviewer/Approver
- **F0.2.5** Create RACI Matrix
- **F0.2.6** Create KPI Data Owner Directory
- **F0.2.7** Send email notifications to owners
- **F0.2.8** Export Owner Matrix (Excel/Google Sheets)

**App 0.3: Repository Setup Wizard**
- **F0.3.1** Create folder structure (Phase 0-7)
- **F0.3.2** Create sub-folders by unit (70+)
- **F0.3.3** Set naming convention (E-{phase}-{item}-{year}-{unit})
- **F0.3.4** Set access permissions per folder
- **F0.3.5** Generate README files
- **F0.3.6** Create submission SOP document
- **F0.3.7** Integrate with Google Drive API

**App 0.4: Submission Calendar Generator**
- **F0.4.1** Input project milestones (deadline, phases)
- **F0.4.2** Define submission frequency (monthly/quarterly)
- **F0.4.3** Set unit-specific SLA (e.g., border areas +3 days)
- **F0.4.4** Generate submission calendar (backward planning)
- **F0.4.5** Sync with Google Calendar
- **F0.4.6** Auto-send email reminders (7 days, 3 days, 1 day before)
- **F0.4.7** Track submission status (on-time/late/missing)
- **F0.4.8** Export calendar (PDF/Excel/Google Sheets)

#### Phase 1: Evidence Management (4 Apps)

**App 1.1: Evidence Register Builder**
- **F1.1.1** Collect evidence metadata via Google Form
- **F1.1.2** Upload evidence files to Google Drive
- **F1.1.3** Auto-generate evidence ID (E-{phase}-{item}-{year}-{unit})
- **F1.1.4** Validate completeness (owner/date/link/classification)
- **F1.1.5** Organize by Phase/Item
- **F1.1.6** Display in table view (sortable/filterable)
- **F1.1.7** Show submission progress per unit
- **F1.1.8** Alert incomplete entries
- **F1.1.9** Export Evidence Register (Excel/Google Sheets)

**App 1.2: Evidence Gap Analyzer**
- **F1.2.1** Import Evidence Register
- **F1.2.2** Import SAR question structure
- **F1.2.3** Map evidence to SAR items (each item needs 2-5 pieces)
- **F1.2.4** Identify gaps (items with < 2 evidence)
- **F1.2.5** Rate evidence strength (Strong/Medium/Weak)
- **F1.2.6** AI-suggest alternative evidence (non-classified)
- **F1.2.7** Create Evidence Map (matrix view)
- **F1.2.8** Create Evidence Gap List
- **F1.2.9** Export Gap Analysis (Excel/PDF)

**App 1.3: Evidence Gate Checker**
- **F1.3.1** Auto-detect new files in Google Drive
- **F1.3.2** Check filename against naming convention
- **F1.3.3** AI-read file content for relevance check
- **F1.3.4** Validate metadata (date/owner/classification)
- **F1.3.5** Check file integrity (not corrupted)
- **F1.3.6** Pass/Fail decision
- **F1.3.7** Send email with fail reasons
- **F1.3.8** Move approved files to final folder
- **F1.3.9** Generate Gate Report (Pass/Fail list)

**App 1.4: Evidence Gap Closure Tracker**
- **F1.4.1** Import Evidence Gap List
- **F1.4.2** Import Owner Matrix
- **F1.4.3** Convert gaps to tasks (assign owner + deadline)
- **F1.4.4** Categorize by priority (Quick wins/System fix/Sustain)
- **F1.4.5** Send task notifications
- **F1.4.6** Update status real-time (Not started/In progress/Completed)
- **F1.4.7** Dashboard: Progress by category (%)
- **F1.4.8** Alert overdue tasks
- **F1.4.9** Export Roadmap (Excel/Google Sheets)

#### Phase 2: Data Management (5 Apps)

**App 2.1: Data Source Catalog Builder**
- **F2.1.1** Collect data sources via Google Form (KPI → Source → Owner → Frequency)
- **F2.1.2** Import KPI list
- **F2.1.3** Create catalog table (KPI | Source | Owner | Frequency | Format | Quality notes)
- **F2.1.4** Flag KPIs with multiple sources
- **F2.1.5** Alert missing sources
- **F2.1.6** Export Data Source Catalog (Excel/Google Sheets)

**App 2.2: KPI Dictionary Builder**
- **F2.2.1** Import KPI list
- **F2.2.2** AI-suggest definition (unit/formula/period)
- **F2.2.3** User edit/approve definitions
- **F2.2.4** Create data quality rules (e.g., "value >= 0")
- **F2.2.5** Create good examples
- **F2.2.6** Publish KPI Dictionary (versioned)
- **F2.2.7** Export Dictionary (Excel/PDF/Google Sheets)

**App 2.3: Excel Template Generator**
- **F2.3.1** Import KPI Dictionary
- **F2.3.2** Generate Excel template with:
  - Data validation (dropdown/range)
  - Conditional formatting (required fields in red)
  - Formulas (if any)
  - Instructions sheet
- **F2.3.3** Generate Quick Guide (1-page PDF)
- **F2.3.4** Version control
- **F2.3.5** Distribute to units (email + Google Drive)

**App 2.4: Data Collector & Validator**
- **F2.4.1** Auto-read Excel files from Google Drive (70+ units)
- **F2.4.2** Validate against KPI Dictionary
- **F2.4.3** Check data quality rules
- **F2.4.4** Detect outliers/duplicates/wrong period
- **F2.4.5** Consolidate into single dataset
- **F2.4.6** Generate Data Quality Report (per unit)
- **F2.4.7** Generate Missingness Report (% complete/partial/missing)
- **F2.4.8** Export Consolidated Dataset (Excel/Google Sheets)

**App 2.5: Data Cleaning Assistant**
- **F2.5.1** Import Data Quality Report
- **F2.5.2** Display issues (outlier/missing/wrong format)
- **F2.5.3** AI-suggest fixes
- **F2.5.4** User approve/reject
- **F2.5.5** Auto-fix (e.g., format standardization)
- **F2.5.6** Send email to Data Owner for manual fixes
- **F2.5.7** Track fix status
- **F2.5.8** Export Clean Dataset (Excel/Google Sheets)
- **F2.5.9** Export Issue Log (tracking)

**App 2.6: Results Baseline Analyzer** (optional in MVP)
- **F2.6.1** Import Clean Dataset
- **F2.6.2** Calculate trends (3-year if available)
- **F2.6.3** Compare vs. target/benchmark
- **F2.6.4** AI-suggest root causes
- **F2.6.5** User validate root causes
- **F2.6.6** AI-suggest recovery measures
- **F2.6.7** Define leading indicators
- **F2.6.8** Generate Baseline Dashboard (charts)
- **F2.6.9** Generate Recovery Plan (90 day/6 month/12 month)
- **F2.6.10** Export Dashboard + Plan (PDF/Excel)

#### Phase 3: Analysis & Narrative (3 Apps)

**App 3.1: Context Pack Builder**
- **F3.1.1** Import Network Scope Map
- **F3.1.2** Input mission/structure/partners
- **F3.1.3** Input stakeholders
- **F3.1.4** AI-draft Organizational Profile
- **F3.1.5** AI-summarize value chain
- **F3.1.6** AI-identify security/area constraints
- **F3.1.7** User edit/approve
- **F3.1.8** Export Context Pack (Google Docs/PDF)

**App 3.2: Risk & Foresight Analyzer**
- **F3.2.1** Import policy/strategy documents
- **F3.2.2** Input existing risks
- **F3.2.3** Input external trends
- **F3.2.4** AI-suggest Strategic Focus (3-5 items)
- **F3.2.5** Create Risk Register (Risk → Owner → Measure → KPI)
- **F3.2.6** AI-analyze Foresight factors
- **F3.2.7** User edit/approve
- **F3.2.8** Export Strategic Focus (1-page summary)
- **F3.2.9** Export Risk Register (Excel/Google Sheets)
- **F3.2.10** Export Foresight Summary (PDF)

**App 3.3: Strategy-to-KPI Linker**
- **F3.3.1** Import Strategic Focus
- **F3.3.2** Import KPI Dictionary
- **F3.3.3** Input major projects
- **F3.3.4** AI-map: Goal → Project → KPI → Result
- **F3.3.5** Define Coverage Rules (% units implementing, % areas reviewed)
- **F3.3.6** Assign KPI Owners
- **F3.3.7** Validate coverage completeness
- **F3.3.8** Export Strategy-to-KPI Map (Excel/Google Sheets)
- **F3.3.9** Export Coverage Rules Table

#### Phase 4: SAR Writing (2 Apps)

**App 4.1: SAR Outline Generator**
- **F4.1.1** Import Evidence Map
- **F4.1.2** Import Context Pack
- **F4.1.3** Import Strategy-to-KPI Map
- **F4.1.4** Import SAR question structure (7 categories)
- **F4.1.5** Break down questions into sub-items
- **F4.1.6** Define minimum evidence/data per item
- **F4.1.7** Create SAR Outline (structured)
- **F4.1.8** Create Minimum Checklist per item
- **F4.1.9** Export Outline (Google Docs template)

**App 4.2: SAR Writer Assistant** ⭐ (AI-Powered)
- **F4.2.1** Import SAR Outline
- **F4.2.2** Import all evidence
- **F4.2.3** Import Risk Register
- **F4.2.4** Import Coverage Rules
- **F4.2.5** User select item to write
- **F4.2.6** AI-draft answer (ADLR format):
  - **A**pproach: Methods/Standards
  - **D**eployment: Coverage (central-regional-local)
  - **L/R**: Learning/Review (PDCA/AAR)
  - **Linkage**: Strategy/Risk/Stakeholder/KPI
  - **Evidence**: Reference IDs (2-5)
- **F4.2.7** User edit/refine
- **F4.2.8** AI-suggest "Score Levers" (how to improve score)
- **F4.2.9** Check cross-references
- **F4.2.10** Save to Google Docs (version control)
- **F4.2.11** Export SAR Draft (Google Docs/PDF)

#### Phase 5: Results (2 Apps)

**App 5.1: Results Data Pack Builder**
- **F5.1.1** Import Clean Dataset
- **F5.1.2** Import Missingness Report
- **F5.1.3** Create tables/charts by dimension
- **F5.1.4** Categorize data (complete/partial/missing)
- **F5.1.5** Calculate trends (if 3-year data available)
- **F5.1.6** Cite data sources
- **F5.1.7** Create Data Completeness Statement
- **F5.1.8** Export Results Data Pack (Excel + Charts)
- **F5.1.9** Export Trend Charts (images)

**App 5.2: Recovery Narrative Builder** (AI-Powered)
- **F5.2.1** Import Baseline & Recovery Plan
- **F5.2.2** Import Risk Register
- **F5.2.3** Import SAR Draft (Categories 1-6)
- **F5.2.4** AI-draft Explain-Improve-Verify Narrative:
  - **Explain**: Root causes (systemic/area-specific)
  - **Improve**: Recovery measures + Data system improvement
  - **Verify**: Evidence + Leading indicators
- **F5.2.5** Link to Risk Register
- **F5.2.6** Create Measure-to-Evidence Table
- **F5.2.7** User edit/approve
- **F5.2.8** Export SAR Category 7 Draft (Google Docs/PDF)

#### Phase 6: Quality Assurance (2 Apps)

**App 6.1: Cross-Consistency Auditor**
- **F6.1.1** Import SAR Draft (all 7 categories)
- **F6.1.2** Import Evidence Map
- **F6.1.3** Import Coverage Rules
- **F6.1.4** Check cross-category consistency (e.g., Strategy in Cat 2 vs Results in Cat 7)
- **F6.1.5** Validate evidence references (IDs exist and correct)
- **F6.1.6** Check coverage completeness
- **F6.1.7** Check for classified data leaks
- **F6.1.8** Generate Issue Log (must-fix/should-fix)
- **F6.1.9** Auto-fix simple issues (e.g., broken links)
- **F6.1.10** Export SAR Draft v3 (cleaned)
- **F6.1.11** Export Consistency Report (PDF)

**App 6.2: Score Simulator & Fix Planner**
- **F6.2.1** Import SAR v3
- **F6.2.2** Import PMQA Scoring Tool (Excel)
- **F6.2.3** Import Scoring Criteria
- **F6.2.4** User/AI score per item/category
- **F6.2.5** Calculate total score
- **F6.2.6** Identify "missing score multipliers" (e.g., incomplete Deployment)
- **F6.2.7** Create Urgent Fix List (achievable in 7-14 days)
- **F6.2.8** Assign owner + deadline
- **F6.2.9** Export Scorecard (summary)
- **F6.2.10** Export Urgent Fix List (Excel/Google Sheets)

#### Phase 7: Interview Prep (2 Apps)

**App 7.1: Interview Brief Generator** (AI-Powered)
- **F7.1.1** Import SAR Final
- **F7.1.2** Import Scorecard
- **F7.1.3** Import Recovery Plan
- **F7.1.4** AI-summarize to 1-page Executive Brief:
  - Strengths
  - Weaknesses
  - Risks
  - Urgent recommendations
- **F7.1.5** AI-create Talking Points (per category)
- **F7.1.6** AI-prepare answers for low results/incomplete data
- **F7.1.7** Create Brief by level (Central/Regional/Local)
- **F7.1.8** Export Executive Brief (Google Docs/PDF)
- **F7.1.9** Export Talking Points Pack (PDF)

**App 7.2: Q&A Bank Builder** (AI-Powered)
- **F7.2.1** Import Evidence Map
- **F7.2.2** Import Issue Log
- **F7.2.3** Import Talking Points
- **F7.2.4** Input common evaluator questions (optional)
- **F7.2.5** AI-generate potential questions (100+)
- **F7.2.6** Link Evidence IDs to answers
- **F7.2.7** Create Evidence Quick-Reference (cheat sheet)
- **F7.2.8** Categorize Q&A by region/area
- **F7.2.9** Export Q&A Bank (Google Docs/PDF)
- **F7.2.10** Export Evidence Quick-Reference (PDF)

### 5.3 Common Features (All Phases)

#### Notifications
- Email notifications (Firebase Cloud Functions + SendGrid/Gmail API)
- In-app notifications (real-time via Firebase)
- Push notifications (optional)

#### Search & Filter
- Global search (across all modules)
- Advanced filters (by phase/unit/date/status)
- Saved searches

#### Collaboration
- Comments (per item)
- @mentions
- Activity logs
- Version history (Google Docs integration)

#### Reports
- Standard reports (pre-built templates)
- Custom reports (user-defined)
- Scheduled reports (weekly/monthly email)
- Dashboard export (PDF/PNG)

---

## 6. Technical Architecture

### 6.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   Next.js 14 (App Router) + React 18                   │ │
│  │   - shadcn/ui + Tailwind CSS                           │ │
│  │   - React Query (data fetching)                        │ │
│  │   - Zustand (state management)                         │ │
│  │   - React Hook Form (forms)                            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API LAYER (Next.js API Routes)           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   /api/auth/*        - Authentication                  │ │
│  │   /api/users/*       - User Management                 │ │
│  │   /api/apps/*        - App-specific endpoints          │ │
│  │   /api/files/*       - File operations                 │ │
│  │   /api/ai/*          - AI/ML operations                │ │
│  │   /api/export/*      - Export functionality            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Firebase    │  │ Google Drive │  │  Google AI   │      │
│  │  Services    │  │     API      │  │    Studio    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Firestore   │  │ Google Drive │  │   Firebase   │      │
│  │   Database   │  │   Storage    │  │   Storage    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Tech Stack Details

#### Frontend
```typescript
{
  "framework": "Next.js 14.2+ (App Router)",
  "language": "TypeScript 5.4+",
  "ui-library": "React 18.3+",
  "styling": {
    "framework": "Tailwind CSS 3.4+",
    "components": "shadcn/ui",
    "icons": "Lucide React"
  },
  "state-management": {
    "client": "Zustand",
    "server": "React Query (TanStack Query)"
  },
  "forms": "React Hook Form + Zod",
  "tables": "TanStack Table",
  "charts": "Recharts",
  "file-upload": "react-dropzone",
  "date": "date-fns",
  "pdf": "react-pdf",
  "excel": "SheetJS (xlsx)"
}
```

#### Backend (API Routes + Server Actions)
```typescript
{
  "runtime": "Node.js 20+",
  "api": "Next.js API Routes + Server Actions",
  "validation": "Zod",
  "auth": "Firebase Auth",
  "database": "Firebase Firestore",
  "storage": {
    "primary": "Google Drive API",
    "secondary": "Firebase Storage"
  },
  "ai": "Google AI Studio API (Gemini 1.5 Pro)",
  "email": "Firebase Cloud Functions + Gmail API",
  "cron": "Vercel Cron Jobs"
}
```

#### Infrastructure
```typescript
{
  "hosting": "Vercel (Free tier → Pro if needed)",
  "cdn": "Vercel Edge Network",
  "domain": "Custom domain (TBD)",
  "ssl": "Auto SSL (Vercel)",
  "monitoring": {
    "errors": "Sentry",
    "analytics": "Vercel Analytics",
    "performance": "Vercel Speed Insights"
  }
}
```

#### Development Tools
```typescript
{
  "package-manager": "pnpm",
  "linting": "ESLint + Prettier",
  "testing": {
    "unit": "Vitest",
    "e2e": "Playwright",
    "api": "Postman/Insomnia"
  },
  "ci-cd": "GitHub Actions + Vercel",
  "version-control": "Git + GitHub",
  "documentation": "Storybook (optional)"
}
```

### 6.3 Firebase Services Configuration

```javascript
// firebase.config.js
export const firebaseConfig = {
  // Authentication
  auth: {
    providers: ['google.com'],
    settings: {
      sessionExpirationTime: 8 * 60 * 60 * 1000, // 8 hours
      allowMultipleAccounts: false
    }
  },
  
  // Firestore Database
  firestore: {
    collections: [
      'users',
      'units',
      'evidence',
      'data',
      'sar',
      'notifications',
      'activities',
      'settings'
    ],
    rules: 'firestore.rules'
  },
  
  // Storage
  storage: {
    buckets: {
      default: 'gs://pmqa-app.appspot.com',
      classified: 'gs://pmqa-app-classified.appspot.com'
    },
    rules: 'storage.rules'
  },
  
  // Cloud Functions
  functions: {
    region: 'asia-southeast1', // Singapore
    runtime: 'nodejs20'
  }
}
```

### 6.4 Google Drive API Integration

```javascript
// google-drive.config.js
export const driveConfig = {
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ],
  
  rootFolder: {
    name: 'PMQA_2568',
    structure: {
      'ไม่ลับ': {
        'Phase_0': {},
        'Phase_1': {},
        // ... Phase 2-7
      },
      'ลับ': {
        // Requires password access (future)
      }
    }
  },
  
  fileTypes: {
    allowed: ['.pdf', '.xlsx', '.xls', '.docx', '.doc', '.jpg', '.jpeg', '.png'],
    maxSize: 50 * 1024 * 1024 // 50MB
  }
}
```

### 6.5 Google AI Studio Integration

```javascript
// ai.config.js
export const aiConfig = {
  model: 'gemini-1.5-pro-latest',
  apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
  
  features: {
    sarWriter: {
      systemPrompt: `คุณคือผู้เชี่ยวชาญ PMQA 4.0 ที่ช่วยเขียน SAR...`,
      temperature: 0.3,
      maxTokens: 8192
    },
    
    evidenceAnalyzer: {
      systemPrompt: `วิเคราะห์หลักฐานและแนะนำความเกี่ยวข้อง...`,
      temperature: 0.2,
      maxTokens: 4096
    },
    
    dataAnalyzer: {
      systemPrompt: `วิเคราะห์ข้อมูลและหา root cause...`,
      temperature: 0.4,
      maxTokens: 4096
    }
  },
  
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerDay: 1500
  }
}
```

### 6.6 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│  1. Transport Layer                                          │
│     - HTTPS/TLS 1.3 (Vercel automatic)                      │
│     - HSTS headers                                           │
│     - CSP headers                                            │
├─────────────────────────────────────────────────────────────┤
│  2. Authentication Layer                                     │
│     - Google OAuth 2.0 (Firebase Auth)                      │
│     - JWT tokens (httpOnly cookies)                         │
│     - Session management (8-hour expiry)                    │
├─────────────────────────────────────────────────────────────┤
│  3. Authorization Layer                                      │
│     - Role-Based Access Control (RBAC)                      │
│     - Resource-level permissions                            │
│     - Firestore Security Rules                              │
│     - API route guards                                       │
├─────────────────────────────────────────────────────────────┤
│  4. Data Layer                                               │
│     - Firestore encryption at rest                          │
│     - Google Drive access controls                          │
│     - Classified file separation                            │
│     - Audit logs                                             │
├─────────────────────────────────────────────────────────────┤
│  5. Application Layer                                        │
│     - Input validation (Zod schemas)                        │
│     - XSS protection (React built-in)                       │
│     - CSRF protection (Next.js built-in)                    │
│     - Rate limiting (Vercel Edge)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Data Model

### 7.1 Core Collections (Firestore)

#### Collection: `users`
```typescript
interface User {
  uid: string; // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'super_admin' | 'central_admin' | 'regional_coordinator' | 
        'provincial_staff' | 'data_owner' | 'reviewer' | 'read_only';
  unitId: string; // Reference to units collection
  permissions: string[]; // Array of permission strings
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
  isActive: boolean;
  metadata: {
    position?: string;
    department?: string;
    phone?: string;
  };
}
```

#### Collection: `units`
```typescript
interface Unit {
  id: string; // Auto-generated
  code: string; // Unit code (e.g., "BKK-01")
  name: string;
  type: 'central' | 'regional' | 'provincial' | 'local';
  region?: 'north' | 'northeast' | 'central' | 'south';
  province?: string;
  parentUnitId?: string; // Reference to parent unit
  aggregationRule: 'sum' | 'average' | 'weighted' | 'separate';
  weight?: number; // For weighted aggregation
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  metadata: {
    address?: string;
    contactEmail?: string;
    contactPhone?: string;
  };
}
```

#### Collection: `evidence`
```typescript
interface Evidence {
  id: string; // E-{phase}-{item}-{year}-{unitCode}
  phase: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  item: string; // SAR item (e.g., "1.1", "2.3")
  title: string;
  description: string;
  fileId: string; // Google Drive file ID
  fileUrl: string;
  fileName: string;
  fileType: string; // pdf, xlsx, etc.
  fileSize: number; // bytes
  classification: 'public' | 'internal' | 'confidential' | 'secret';
  unitId: string;
  ownerId: string; // User UID
  uploadedBy: string; // User UID
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  reviewComments?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata: {
    version?: string;
    tags?: string[];
    relatedItems?: string[]; // Related SAR items
  };
}
```

#### Collection: `kpi_data`
```typescript
interface KPIData {
  id: string; // Auto-generated
  kpiId: string; // Reference to KPI Dictionary
  kpiCode: string;
  kpiName: string;
  unitId: string;
  period: string; // YYYY-MM or YYYY-Q1
  periodType: 'monthly' | 'quarterly' | 'annual';
  value: number;
  unit: string; // e.g., "คน", "ครั้ง", "%"
  dataSource: string;
  dataOwnerId: string;
  status: 'draft' | 'submitted' | 'validated' | 'approved' | 'rejected';
  qualityFlags: {
    isOutlier?: boolean;
    isMissing?: boolean;
    hasIssue?: boolean;
    issueDescription?: string;
  };
  submittedBy: string;
  submittedAt?: Timestamp;
  validatedBy?: string;
  validatedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Collection: `sar_content`
```typescript
interface SARContent {
  id: string; // Auto-generated
  category: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  item: string; // e.g., "1.1", "2.3"
  content: {
    approach: string;
    deployment: string;
    learning: string;
    linkage: string;
    evidenceIds: string[]; // References to evidence collection
  };
  status: 'draft' | 'review' | 'final';
  version: number;
  authorId: string;
  reviewerId?: string;
  approverId?: string;
  scoreEstimate?: number;
  scoreLevels?: {
    approach?: number;
    deployment?: number;
    learning?: number;
    linkage?: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata: {
    wordCount?: number;
    completeness?: number; // %
    qualityScore?: number; // AI-estimated
  };
}
```

#### Collection: `tasks`
```typescript
interface Task {
  id: string; // Auto-generated
  type: 'evidence_gap' | 'data_quality' | 'sar_review' | 'other';
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'quick_win' | 'system_fix' | 'sustain';
  assigneeId: string;
  reporterId: string;
  status: 'not_started' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
  dueDate: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  relatedItems: {
    evidenceIds?: string[];
    kpiIds?: string[];
    sarItemIds?: string[];
  };
  comments: Array<{
    userId: string;
    text: string;
    createdAt: Timestamp;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Collection: `notifications`
```typescript
interface Notification {
  id: string; // Auto-generated
  userId: string;
  type: 'task_assigned' | 'task_due' | 'review_request' | 'approval_request' | 
        'data_submitted' | 'evidence_rejected' | 'system';
  title: string;
  message: string;
  link?: string; // Deep link to relevant page
  isRead: boolean;
  readAt?: Timestamp;
  createdAt: Timestamp;
  metadata: {
    taskId?: string;
    evidenceId?: string;
    sarItemId?: string;
  };
}
```

#### Collection: `activity_logs`
```typescript
interface ActivityLog {
  id: string; // Auto-generated
  userId: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 
          'export' | 'approve' | 'reject';
  resourceType: 'evidence' | 'kpi_data' | 'sar_content' | 'task' | 'user';
  resourceId: string;
  details: Record<string, any>; // Flexible metadata
  ipAddress?: string;
  userAgent?: string;
  timestamp: Timestamp;
}
```

### 7.2 Relationships

```
users (1) ─────────< (N) units
users (1) ─────────< (N) evidence
users (1) ─────────< (N) kpi_data
users (1) ─────────< (N) sar_content
users (1) ─────────< (N) tasks
users (1) ─────────< (N) notifications

units (1) ─────────< (N) units (parent-child)
units (1) ─────────< (N) evidence
units (1) ─────────< (N) kpi_data

evidence (N) ──────< (N) sar_content (many-to-many via evidenceIds array)

tasks (N) ─────────< (N) evidence (via relatedItems.evidenceIds)
tasks (N) ─────────< (N) kpi_data (via relatedItems.kpiIds)
tasks (N) ─────────< (N) sar_content (via relatedItems.sarItemIds)
```

### 7.3 Indexes (Firestore)

```javascript
// Required composite indexes for efficient queries
const firestoreIndexes = [
  {
    collection: 'evidence',
    fields: [
      { field: 'unitId', order: 'ASCENDING' },
      { field: 'phase', order: 'ASCENDING' },
      { field: 'status', order: 'ASCENDING' }
    ]
  },
  {
    collection: 'kpi_data',
    fields: [
      { field: 'unitId', order: 'ASCENDING' },
      { field: 'period', order: 'DESCENDING' },
      { field: 'status', order: 'ASCENDING' }
    ]
  },
  {
    collection: 'tasks',
    fields: [
      { field: 'assigneeId', order: 'ASCENDING' },
      { field: 'status', order: 'ASCENDING' },
      { field: 'dueDate', order: 'ASCENDING' }
    ]
  },
  {
    collection: 'notifications',
    fields: [
      { field: 'userId', order: 'ASCENDING' },
      { field: 'isRead', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ]
  }
];
```

---

## 8. User Flows

### 8.1 Core User Flows

#### Flow 1: User Login & Dashboard
```
1. User visits app URL → Landing page
2. Click "Sign in with Google" → Google OAuth popup
3. Select Google account → Authorize permissions
4. Redirect to Dashboard → Show personalized widgets
5. Dashboard displays:
   - Progress overview (Phase 0-7)
   - My tasks (assigned to me)
   - Recent activities
   - Upcoming deadlines
   - Quick actions
```

#### Flow 2: Upload Evidence (Provincial Staff)
```
1. Navigate to Evidence Module (Phase 1)
2. Click "Upload Evidence" button
3. Fill form:
   - Select Phase & SAR Item
   - Enter title & description
   - Upload file (drag & drop or browse)
   - Set classification (Public/Internal/Confidential)
4. Submit → File uploads to Google Drive
5. System generates Evidence ID (E-1-1.1-2568-BKK01)
6. Evidence appears in register (status: Pending Review)
7. Email notification sent to Reviewer
```

#### Flow 3: Review & Approve Evidence (Reviewer)
```
1. Receive email notification
2. Click link → Navigate to Evidence Review page
3. See evidence details:
   - Metadata (title, description, file info)
   - Preview file (PDF/image inline)
   - Classification level
4. Check against criteria:
   - Filename correct?
   - Content relevant to SAR item?
   - Metadata complete?
5. Decision:
   - Approve → Status changes to "Approved"
   - Reject → Enter reason → Send back to uploader
6. Notification sent to uploader
```

#### Flow 4: Submit KPI Data (Data Owner)
```
1. Download Excel Template (from App 2.3)
2. Fill in data offline
3. Navigate to Data Module (Phase 2)
4. Upload filled Excel file
5. System validates:
   - Check against KPI Dictionary
   - Check data quality rules
   - Detect outliers/missing values
6. Show validation results:
   - Green: Pass → Submit
   - Red: Fail → Fix and re-upload
7. After submit → Data appears in consolidated dataset
8. Email confirmation sent
```

#### Flow 5: AI-Assisted SAR Writing (Central Admin)
```
1. Navigate to SAR Writer (App 4.2)
2. Select SAR Category & Item (e.g., "Category 2, Item 2.1")
3. System loads relevant data:
   - Evidence list
   - KPI data
   - Risk Register
   - Coverage info
4. Click "Generate Draft" → AI writes ADLR format
5. Review AI draft:
   - Edit Approach
   - Edit Deployment
   - Edit Learning/Review
   - Edit Linkage
   - Check Evidence references
6. AI suggests "Score Levers" (how to improve)
7. Save draft → Auto-save to Google Docs
8. Submit for review → Notify Reviewer
```

#### Flow 6: Export Reports (Any User)
```
1. Navigate to any module with data
2. Click "Export" button
3. Select format:
   - Excel (.xlsx)
   - PDF (formatted)
   - CSV (raw data)
   - Google Sheets (sync)
   - HTML (web view)
   - Google Docs (formatted)
4. Configure options (if any):
   - Date range
   - Units to include
   - Fields to export
5. Click "Export" → Generate file
6. Download link appears
7. File also saved to Google Drive (optional)
```

### 8.2 Admin User Flows

#### Flow 7: User Management (Super Admin)
```
1. Navigate to Admin → Users
2. View user list (table with filters)
3. Add new user:
   - Click "+ Add User"
   - Enter email
   - Select role (from 7 roles)
   - Select unit
   - Assign permissions
   - Click "Send Invite"
   - User receives email with login link
4. Edit user:
   - Click on user row
   - Update role/unit/permissions
   - Save
5. Deactivate user:
   - Click "..." menu
   - Select "Deactivate"
   - Confirm → User cannot login
```

#### Flow 8: System Setup (Central Admin)
```
Phase 0 Setup Sequence:

1. App 0.1: Network Scope Mapper
   - Upload unit list (Excel)
   - Review auto-grouping (by region/province)
   - Set aggregation rules
   - Export Network Map

2. App 0.2: Owner Matrix Builder
   - Upload staff list (Excel)
   - Import SAR structure
   - Review AI-suggested owners
   - Adjust manually
   - Send email notifications

3. App 0.3: Repository Setup Wizard
   - Connect Google Drive
   - Click "Create Folder Structure"
   - System creates folders (Phase 0-7, 70+ units)
   - Set permissions per folder
   - Generate README files

4. App 0.4: Submission Calendar
   - Input project deadline
   - Set submission frequency (monthly/quarterly)
   - Review auto-generated calendar
   - Sync to Google Calendar
   - Auto-reminders activated
```

---

## 9. Non-Functional Requirements

### 9.1 Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Page Load Time** | < 2s (initial) | First Contentful Paint (FCP) |
| **Time to Interactive** | < 3s | Time to Interactive (TTI) |
| **API Response Time** | < 500ms (p95) | Server response time |
| **AI Response Time** | < 10s (SAR draft) | End-to-end generation |
| **File Upload Speed** | > 1MB/s | Upload throughput |
| **File Download Speed** | > 2MB/s | Download throughput |
| **Concurrent Users** | 100+ simultaneous | Load testing |
| **Database Queries** | < 100ms (p95) | Firestore query time |

### 9.2 Scalability

- **Horizontal Scaling:** Vercel auto-scales based on traffic
- **Database:** Firestore auto-scales (no limits in free tier for reads/writes needed)
- **Storage:** Google Drive (unlimited with Workspace account)
- **AI API:** 60 requests/min, 1500/day (within free tier limits)

**Capacity Planning:**
- **Users:** 500 concurrent (current), 2000+ (future)
- **Data Volume:** 100GB (Year 1), 500GB (Year 3)
- **Files:** 10,000 (Year 1), 50,000 (Year 3)
- **API Calls:** 100K/day (current), 1M/day (peak)

### 9.3 Availability & Reliability

| Metric | Target |
|--------|--------|
| **Uptime** | 99.5% (43.8 hours downtime/year max) |
| **Error Rate** | < 0.1% of requests |
| **Recovery Time (RTO)** | < 1 hour |
| **Recovery Point (RPO)** | < 15 minutes (data loss) |
| **Backup Frequency** | Daily (automatic via Firestore) |

**Disaster Recovery:**
- Firestore: Auto-replication (multi-region)
- Google Drive: Google's 99.9% SLA
- Vercel: Multi-region deployment
- Backup: Daily export to Google Cloud Storage (optional)

### 9.4 Security Requirements

#### Authentication
- ✅ Google OAuth 2.0 (mandatory)
- ✅ Multi-factor Authentication (optional, via Google)
- ✅ Session timeout: 8 hours
- ✅ Logout on inactivity: 30 minutes

#### Authorization
- ✅ Role-Based Access Control (RBAC)
- ✅ Resource-level permissions
- ✅ Firestore Security Rules (enforced)
- ✅ API route guards (server-side)

#### Data Protection
- ✅ HTTPS/TLS 1.3 (all traffic)
- ✅ Encryption at rest (Firestore automatic)
- ✅ Encryption in transit (Google Drive automatic)
- ✅ Classified file separation (different Drive folders)
- ✅ Access logs (activity tracking)

#### Compliance
- ✅ PDPA (Personal Data Protection Act) - Thailand
- ✅ Government data handling guidelines
- ✅ Security classification handling (Public/Internal/Confidential/Secret)

### 9.5 Usability

- **Learning Curve:** < 30 minutes for basic tasks
- **Accessibility:** WCAG 2.1 Level AA (target)
- **Mobile Support:** Responsive (Desktop/Tablet/Mobile)
- **Browser Support:**
  - Chrome 90+ (primary)
  - Edge 90+
  - Safari 14+
  - Firefox 88+
- **Language:** Thai only (RTL support not needed)
- **Help & Documentation:**
  - Inline tooltips
  - Video tutorials (future)
  - FAQ section
  - User manual (PDF)

### 9.6 Maintainability

- **Code Quality:** ESLint + Prettier enforcement
- **Testing Coverage:** > 70% (unit + integration)
- **Documentation:** Code comments + API docs
- **Deployment:** CI/CD via GitHub Actions + Vercel
- **Monitoring:**
  - Error tracking: Sentry
  - Performance: Vercel Analytics
  - Uptime: Vercel
- **Version Control:** Git + GitHub (feature branches)

### 9.7 Cost Management

**Target: Free Tier Usage (Year 1)**

| Service | Free Tier Limit | Estimated Usage | Status |
|---------|----------------|-----------------|--------|
| **Vercel** | 100GB bandwidth/month | ~20GB/month | ✅ Safe |
| **Firebase Firestore** | 50K reads, 20K writes/day | ~10K reads, 5K writes/day | ✅ Safe |
| **Firebase Storage** | 5GB storage, 1GB/day download | ~2GB storage, 500MB/day | ✅ Safe |
| **Google Drive API** | Workspace (unlimited) | N/A | ✅ Free |
| **Google AI Studio** | 1500 requests/day | ~500 requests/day | ✅ Safe |

**Upgrade Path (if needed):**
- Vercel Pro: $20/month (unlimited bandwidth)
- Firebase Blaze: Pay-as-you-go (very cheap for expected usage)
- Google AI Studio: Pay-per-token (minimal cost)

---

## 10. Success Metrics

### 10.1 Key Performance Indicators (KPIs)

#### Product Metrics
| Metric | Baseline | Target (3 months) | Measurement |
|--------|----------|-------------------|-------------|
| **Active Users** | 0 | 350+ (70% of 500) | Monthly Active Users (MAU) |
| **User Retention** | N/A | 80% | % users active month-over-month |
| **Feature Adoption** | N/A | 60%+ | % users using each phase |
| **Task Completion Rate** | N/A | 85% | % tasks completed vs. created |
| **Error Rate** | N/A | < 1% | % failed operations |

#### Business Metrics
| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| **PMQA Score** | Basic | **Advance** | Official evaluation |
| **Data Completeness** | 60% | 95% | % KPIs with complete data |
| **Evidence Coverage** | 50% | 95% | % SAR items with evidence |
| **Time to Prepare SAR** | 12 weeks | 6 weeks | Average time |
| **Data Quality Errors** | High | -80% | Validation failures |

#### User Satisfaction
| Metric | Target | Method |
|--------|--------|--------|
| **Overall Satisfaction** | 4.5/5 | User survey (monthly) |
| **Ease of Use** | 4.3/5 | User survey |
| **Feature Usefulness** | 4.2/5 | User survey |
| **AI Quality (SAR Writer)** | 4.0/5 | User feedback |
| **Support Response Time** | < 24 hours | Ticket tracking |

### 10.2 Analytics & Tracking

**Events to Track:**
```javascript
// User Actions
- user_login
- user_logout
- feature_used (which app/phase)
- file_upload
- file_download
- export_report
- ai_draft_generated
- task_created
- task_completed
- comment_added

// System Events
- error_occurred
- validation_failed
- api_timeout
- ai_api_called
- email_sent

// Business Events
- evidence_submitted
- evidence_approved
- data_submitted
- sar_draft_completed
- phase_completed
```

**Dashboards:**
1. **Admin Dashboard:** System health, user activity, feature usage
2. **Manager Dashboard:** Progress by phase, data quality, task completion
3. **User Dashboard:** My tasks, my submissions, my notifications

---

## 11. Development Roadmap

### 11.1 Release Strategy

**Approach:** Phased rollout (Phase 0 → Phase 7)
**Methodology:** Agile (2-week sprints)
**Team:** Solo developer (พล.ท.ดร.กริช)

### 11.2 Phase 0: MVP Foundation (Sprint 1-2, Weeks 1-4)

**Sprint 1 (Weeks 1-2): Core Setup**
- [ ] Project setup (Next.js + TypeScript + Tailwind)
- [ ] Firebase setup (Auth + Firestore + Storage)
- [ ] Google Drive API setup
- [ ] Google AI Studio API setup
- [ ] Authentication (Sign in with Google)
- [ ] Basic dashboard layout
- [ ] User management (CRUD)
- [ ] File upload/download basic

**Sprint 2 (Weeks 3-4): Phase 0 Apps**
- [ ] App 0.1: Network Scope Mapper
- [ ] App 0.2: Owner Matrix Builder
- [ ] App 0.3: Repository Setup Wizard
- [ ] App 0.4: Submission Calendar Generator
- [ ] Email notifications (basic)
- [ ] Export to Excel/PDF (basic)

**Deliverable:** MVP v0.1.0 (Phase 0 complete)
**Demo:** Internal testing with 5-10 users

---

### 11.3 Phase 1: Evidence Management (Sprint 3-4, Weeks 5-8)

**Sprint 3 (Weeks 5-6):**
- [ ] App 1.1: Evidence Register Builder
- [ ] App 1.2: Evidence Gap Analyzer
- [ ] Google Drive integration (full)
- [ ] File preview (PDF/images)

**Sprint 4 (Weeks 7-8):**
- [ ] App 1.3: Evidence Gate Checker (AI-powered)
- [ ] App 1.4: Evidence Gap Closure Tracker
- [ ] Task management system
- [ ] Comments & collaboration

**Deliverable:** v0.2.0 (Phase 0-1 complete)
**Demo:** Regional coordinators (5 users)

---

### 11.4 Phase 2: Data Management (Sprint 5-7, Weeks 9-14)

**Sprint 5 (Weeks 9-10):**
- [ ] App 2.1: Data Source Catalog Builder
- [ ] App 2.2: KPI Dictionary Builder
- [ ] App 2.3: Excel Template Generator

**Sprint 6 (Weeks 11-12):**
- [ ] App 2.4: Data Collector & Validator
- [ ] App 2.5: Data Cleaning Assistant
- [ ] Data quality dashboard

**Sprint 7 (Weeks 13-14):**
- [ ] App 2.6: Results Baseline Analyzer (optional)
- [ ] Advanced charts & visualizations
- [ ] Export to all formats (Excel/PDF/CSV/Google Sheets/HTML/Docs)

**Deliverable:** v0.3.0 (Phase 0-2 complete)
**Demo:** Provincial staff (20 users)
**Milestone:** Core platform ready for data collection

---

### 11.5 Phase 3-7: Full Platform (Sprint 8-14, Weeks 15-28)

**Sprint 8-9 (Weeks 15-18): Phase 3 - Analysis**
- [ ] App 3.1: Context Pack Builder
- [ ] App 3.2: Risk & Foresight Analyzer
- [ ] App 3.3: Strategy-to-KPI Linker

**Sprint 10-11 (Weeks 19-22): Phase 4 - SAR Writing** ⭐
- [ ] App 4.1: SAR Outline Generator
- [ ] App 4.2: SAR Writer Assistant (AI-powered)
- [ ] Google Docs integration (full)
- [ ] Version control

**Sprint 12 (Weeks 23-24): Phase 5 - Results**
- [ ] App 5.1: Results Data Pack Builder
- [ ] App 5.2: Recovery Narrative Builder

**Sprint 13 (Weeks 25-26): Phase 6 - Quality Assurance**
- [ ] App 6.1: Cross-Consistency Auditor
- [ ] App 6.2: Score Simulator & Fix Planner

**Sprint 14 (Weeks 27-28): Phase 7 - Interview Prep**
- [ ] App 7.1: Interview Brief Generator
- [ ] App 7.2: Q&A Bank Builder

**Deliverable:** v1.0.0 (All 24 apps complete)
**Launch:** Production-ready for all 500 users
**Target:** Mid-Year 2025 evaluation ready

---

### 11.6 Post-Launch (Ongoing)

**Sprint 15+ (Weeks 29+): Optimization & Scale**
- [ ] Performance optimization
- [ ] Bug fixes based on user feedback
- [ ] Advanced features (mobile app, real-time collaboration)
- [ ] Analytics & reporting enhancements
- [ ] Integration with government systems (if needed)
- [ ] Migration to paid tiers (if usage exceeds free limits)

---

## 12. Risk Management

### 12.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **AI API Rate Limits** | Medium | High | Cache responses, batch requests, upgrade if needed |
| **Google Drive API Limits** | Low | Medium | Use Firebase Storage as backup |
| **Free Tier Exhaustion** | Medium | Medium | Monitor usage, optimize queries, upgrade plan |
| **Firebase Performance** | Low | High | Use composite indexes, pagination, caching |
| **Browser Compatibility** | Low | Low | Test on all major browsers, provide fallbacks |
| **Data Loss** | Very Low | Very High | Daily backups, Firestore replication |

### 12.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Low User Adoption** | Medium | High | Training, user-friendly UI, support |
| **Data Quality Issues** | Medium | High | Validation, AI assistance, quality checks |
| **Deadline Pressure** | High | Medium | Phased rollout, focus on MVP first |
| **Scope Creep** | High | Medium | Strict phase boundaries, feature freeze |
| **Solo Developer Dependency** | High | Very High | Documentation, code comments, video logs |

### 12.3 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Unauthorized Access** | Low | Very High | Google OAuth, RBAC, access logs |
| **Data Breach** | Very Low | Very High | Encryption, security rules, audits |
| **Classified Data Leak** | Low | Very High | Separate folders, access control, warnings |
| **CSRF/XSS Attacks** | Low | Medium | Next.js built-in protection, input validation |
| **DDoS Attack** | Very Low | Medium | Vercel Edge protection, rate limiting |

### 12.4 Mitigation Strategies

**Technical:**
1. **Monitoring:** Set up Sentry + Vercel Analytics from Day 1
2. **Testing:** Write tests for critical paths (auth, file upload, AI calls)
3. **Backups:** Daily Firestore export to Google Cloud Storage
4. **Graceful Degradation:** Fallbacks when AI/external APIs fail

**Business:**
1. **User Training:** Video tutorials, user manual, onboarding flow
2. **Feedback Loop:** Weekly surveys, direct communication channels
3. **Pilot Program:** Test with small group (5-10 users) before full rollout
4. **Change Management:** Clear communication about new features/changes

**Security:**
1. **Code Review:** Self-review all code before commit
2. **Security Audit:** Run security checks (npm audit, Snyk)
3. **Penetration Testing:** Manual testing of auth/authorization flows
4. **Incident Response Plan:** Document steps if breach occurs

---

## 13. Appendix

### 13.1 Glossary

| Term | Definition |
|------|------------|
| **PMQA** | Public Sector Management Quality Award - เกณฑ์คุณภาพการบริหารจัดการภาครัฐ |
| **SAR** | Self-Assessment Report - รายงานการประเมินตนเอง |
| **KPI** | Key Performance Indicator - ตัวชี้วัดความสำเร็จ |
| **ADLR** | Approach-Deployment-Learning-Results - โครงสร้างการตอบ SAR |
| **กอ.รมน.** | กองอำนวยการรักษาความมั่นคงภายในราชอาณาจักร |
| **RACI** | Responsible-Accountable-Consulted-Informed - เมทริกซ์ความรับผิดชอบ |
| **MVP** | Minimum Viable Product - ผลิตภัณฑ์พื้นฐานที่ใช้งานได้ |

### 13.2 References

**PMQA Documentation:**
- คู่มือเกณฑ์ PMQA 4.0 (KPI) ปี 2568 (ฉบับปรับปรุง)
- PMQA 4.0 Toolkit
- PPT Clinic PMQA 4.0 (KPI) 68

**Technical Documentation:**
- Next.js 14: https://nextjs.org/docs
- Firebase: https://firebase.google.com/docs
- Google Drive API: https://developers.google.com/drive
- Google AI Studio: https://ai.google.dev/docs
- shadcn/ui: https://ui.shadcn.com

### 13.3 Development Environment Setup

```bash
# Required Software
Node.js 20+
pnpm 8+
Git 2.40+
VS Code (recommended)

# VS Code Extensions (recommended)
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Firebase
- GitLens

# Environment Variables (.env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

GOOGLE_DRIVE_CLIENT_ID=
GOOGLE_DRIVE_CLIENT_SECRET=
GOOGLE_DRIVE_REDIRECT_URI=

GOOGLE_AI_API_KEY=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 13.4 Coding Standards

**TypeScript:**
```typescript
// Use strict typing
const user: User = { ... };

// Use interfaces for objects
interface Props {
  title: string;
  onClick: () => void;
}

// Use named exports (no default exports)
export const MyComponent = () => { ... };

// Use functional components + hooks (no class components)
```

**File Naming:**
```
/app
  /page.tsx              # Page component (lowercase)
  /layout.tsx            # Layout component
/components
  /ui
    /button.tsx          # shadcn/ui components (lowercase)
  /AppSpecific.tsx       # App-specific components (PascalCase)
/lib
  /utils.ts              # Utility functions (lowercase)
  /api.ts                # API helpers
/types
  /index.ts              # Type definitions
```

**Component Structure:**
```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types
interface Props {
  title: string;
}

// 3. Component
export const MyComponent = ({ title }: Props) => {
  // 3a. Hooks
  const [state, setState] = useState('');
  
  // 3b. Functions
  const handleClick = () => { ... };
  
  // 3c. Effects
  useEffect(() => { ... }, []);
  
  // 3d. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Click</Button>
    </div>
  );
};
```

### 13.5 Git Workflow

**Branch Strategy:**
```
main                  # Production (auto-deploy to Vercel)
  ├─ develop          # Development (staging)
  │   ├─ feature/xxx  # Feature branches
  │   ├─ fix/xxx      # Bug fix branches
  │   └─ refactor/xxx # Refactor branches
```

**Commit Message Format:**
```
type(scope): subject

body (optional)

footer (optional)

# Types:
feat     - New feature
fix      - Bug fix
docs     - Documentation
style    - Code style (formatting)
refactor - Code refactoring
test     - Add tests
chore    - Maintenance

# Examples:
feat(auth): add Google OAuth login
fix(upload): resolve file size limit error
docs(readme): update installation guide
```

**Pull Request Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactoring

## Testing
- [ ] Tested locally
- [ ] Added tests
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Code follows style guide
- [ ] Self-reviewed code
- [ ] Updated documentation
- [ ] No console errors
```

### 13.6 Testing Strategy

**Unit Tests (Vitest):**
```typescript
// lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from './utils';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const result = formatDate(new Date('2024-01-01'));
    expect(result).toBe('01/01/2024');
  });
});
```

**Integration Tests (Playwright):**
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can login with Google', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Sign in with Google');
  // ... rest of test
});
```

**Test Coverage Targets:**
- Utils: 90%+
- API Routes: 80%+
- Components: 70%+
- E2E: Critical paths only

### 13.7 Deployment Checklist

**Pre-Deployment:**
- [ ] All tests pass
- [ ] No console errors/warnings
- [ ] Environment variables set (production)
- [ ] Firebase rules deployed
- [ ] Google APIs enabled
- [ ] Performance tested (Lighthouse > 90)
- [ ] Security checked (npm audit clean)
- [ ] Backup created

**Post-Deployment:**
- [ ] Smoke test (login, basic features)
- [ ] Monitor errors (Sentry)
- [ ] Monitor performance (Vercel)
- [ ] Check analytics (Vercel Analytics)
- [ ] Announce to users (email)
- [ ] Update documentation

### 13.8 Support & Maintenance

**Support Channels:**
1. In-app feedback form
2. Email: support@pmqa-app.example.com (TBD)
3. Line group (internal)
4. GitHub Issues (for bugs)

**Maintenance Schedule:**
- **Daily:** Monitor errors + performance
- **Weekly:** Review user feedback, plan fixes
- **Monthly:** Security updates, dependency updates
- **Quarterly:** Major feature releases

**SLA:**
- **Critical bugs:** Fix within 24 hours
- **High priority:** Fix within 3 days
- **Medium priority:** Fix within 1 week
- **Low priority:** Next sprint

---

## 14. Sign-off

### 14.1 Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Lead Developer** | พล.ท.ดร.กริช อินทราทิพย์ | __________ | ______ |
| **Product Owner** | [TBD] | __________ | ______ |
| **Project Sponsor** | [TBD] | __________ | ______ |

### 14.2 Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 19 ม.ค. 2568 | พล.ท.ดร.กริช | Initial PRD creation |

---

## 15. Next Steps

**Immediate Actions:**
1. **Review & Approve PRD:** Stakeholder review within 3 days
2. **Setup Development Environment:** Day 1
3. **Create GitHub Repository:** Day 1
4. **Setup Firebase Project:** Day 1-2
5. **Setup Google Cloud Project:** Day 1-2
6. **Start Sprint 1:** Week 1

**Contact:**
- **Developer:** พล.ท.ดร.กริช อินทราทิพย์
- **Portfolio:** https://portfolio-two-sepia-33.vercel.app/
- **GitHub:** [TBD]
- **Email:** [TBD]

---

**END OF DOCUMENT**

---

*This PRD is a living document and will be updated as the project evolves.*
