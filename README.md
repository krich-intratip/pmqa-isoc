# PMQA ISOC - ระบบสนับสนุนการประเมินตนเอง PMQA 4.0

![Version](https://img.shields.io/badge/version-3.0.7-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)

ระบบสนับสนุนการประเมินตนเอง (ISOC - Integrated Self-Assessment Online Companion) สำหรับกระบวนการประเมินคุณภาพการบริหารจัดการภาครัฐ PMQA 4.0

## ✨ Features

### 🗂️ Phase 0: Foundation Setup
- **Owner Matrix** - มอบหมายผู้รับผิดชอบหมวด 1-7
- **Repository Setup** - สร้างโฟลเดอร์เก็บหลักฐาน
- **Submission Calendar** - ตารางกำหนดการส่งงาน

### 📋 Phase 1: Evidence Management
- **Evidence Register** - นำเข้าและทะเบียนหลักฐาน
- **Gap Analyzer** - วิเคราะห์ช่องว่างหลักฐาน
- **Gate Checker** - ตรวจสอบและอนุมัติหลักฐาน
- **Gap Tracker** - ติดตามการปิด Gap

### 📊 Phase 2: Data Management
- **Data Source Catalog** - จัดทำคลังแหล่งข้อมูล
- **KPI Dictionary** - พจนานุกรม KPI
- **Excel Templates** - สร้าง Template
- **Data Collector** - กรอกข้อมูล KPI
- **Data Cleaning** - ทำความสะอาดข้อมูล
- **Baseline Analyzer** - วิเคราะห์ผลลัพธ์

### 🔍 Phase 3: Analysis & Narrative
- **Context Pack** - รวบรวมบริบทองค์กร
- **Risk Analyzer** - วิเคราะห์ความเสี่ยง
- **Strategy Linker** - เชื่อมโยงยุทธศาสตร์กับ KPI

### ✍️ Phase 4: SAR Writing (AI-Powered)
- **SAR Outline** - สร้างโครงร่าง SAR
- **SAR Writer** - เขียนเนื้อหาด้วย AI (Google Gemini)

### 📈 Phase 5: Results & Analysis
- **Results Pack** - รวบรวมผลลัพธ์และ Export
- **Recovery Narrative** - สร้างเนื้อหาแก้ไขปรับปรุง

### ✅ Phase 6: Quality Assurance
- **Consistency Auditor** - ตรวจสอบความสอดคล้อง
- **Score Simulator** - จำลองคะแนนและวางแผนปรับปรุง

### 🎤 Phase 7: Interview Preparation
- **Interview Brief** - สร้างเอกสารเตรียมรับการตรวจประเมิน
- **Q&A Bank** - คลังคำถาม-คำตอบสำหรับการสัมภาษณ์

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase account

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/pmqa-isoc.git
cd pmqa-isoc

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your Firebase config

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## ⚙️ Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Firestore Database
3. Enable Firebase Authentication (Email/Password)
4. Copy your Firebase config to `.env.local`

### AI Configuration
1. Get Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)
2. Configure in Dashboard > Settings > AI Configuration

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── phase0-7/          # Phase-specific pages
│   ├── admin/             # Admin pages
│   └── dashboard/         # Main dashboard
├── components/            # Reusable UI components
├── lib/                   # Utilities and configs
│   ├── firebase/          # Firebase configuration
│   ├── google/            # Google AI API
│   └── export/            # Data export utilities
└── stores/                # Zustand state management
```

## 🔐 Role-Based Access

| Role | Description |
|------|-------------|
| `super_admin` | Full system access |
| `unit_admin` | Unit management |
| `reviewer` | Evidence approval |
| `editor` | Content editing |
| `viewer` | Read-only access |

## 📤 Data Export

- **Dashboard Summary** - Export สถิติภาพรวมเป็น CSV
- **Evidence List** - Export รายการหลักฐาน
- **KPI Data** - Export ข้อมูล KPI
- **SAR Document** - Export รายงาน SAR เป็น HTML

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **State**: Zustand
- **AI**: Google Gemini API

## 📝 License

Copyright © 2569 PMQA ISOC Team

## 👥 Contributors

- Development Team
