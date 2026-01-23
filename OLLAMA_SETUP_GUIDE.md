# Ollama Setup Guide - คู่มือติดตั้ง Local AI

> คู่มือละเอียดสำหรับติดตั้งและตั้งค่า Ollama เพื่อใช้กับ PMQA ISOC System

---

## 📋 ข้อกำหนดระบบ (System Requirements)

### ⚙️ ขั้นต่ำ (Minimum)
- **OS**: Windows 10/11, Ubuntu 20.04+, macOS 11+
- **RAM**: 8 GB
- **Storage**: 10 GB ว่าง (สำหรับโมเดล 8B)
- **Internet**: สำหรับดาวน์โหลดครั้งแรก

### 🚀 แนะนำ (Recommended)
- **OS**: Windows 11 Pro, Ubuntu 22.04 LTS, macOS 14+
- **RAM**: 16 GB+ (32 GB สำหรับโมเดลใหญ่)
- **GPU**: NVIDIA RTX 3060+ (6GB VRAM)
- **Storage**: 50 GB+ ว่าง
- **CPU**: 8 cores+

---

## 🪟 การติดตั้งบน Windows

### วิธีที่ 1: ติดตั้งด้วย Installer (แนะนำ)

#### ขั้นตอนที่ 1: ดาวน์โหลด Ollama

1. เปิดเว็บ: https://ollama.com/download/windows
2. คลิก **Download for Windows**
3. Save file: `OllamaSetup.exe`

#### ขั้นตอนที่ 2: ติดตั้ง

```powershell
# Double-click OllamaSetup.exe
# หรือใช้ Command Line:
.\OllamaSetup.exe /S
```

> **หมายเหตุ:** การติดตั้งจะใช้เวลา 2-3 นาที

#### ขั้นตอนที่ 3: ตรวจสอบการติดตั้ง

```powershell
ollama --version
# Output: ollama version 0.x.x
```

---

### วิธีที่ 2: ติดตั้งด้วย winget

```powershell
# เปิด PowerShell as Administrator
winget install Ollama.Ollama

# รอติดตั้งเสร็จ จากนั้นตรวจสอบ
ollama --version
```

---

### ขั้นตอนที่ 4: ดาวน์โหลดโมเดล

```powershell
# โมเดลแนะนำสำหรับภาษาไทย (เลือก 1 ตัว)

# 1. Qwen 2.5 14B (ภาษาไทยดีที่สุด) - แนะนำ! 🌟
ollama pull qwen2.5:14b
# ขนาด: 9 GB, ต้อง RAM 16 GB

# 2. Llama 3.1 8B (เร็ว ใช้ RAM น้อย)
ollama pull llama3.1:8b
# ขนาด: 4.7 GB, ต้อง RAM 8 GB

# 3. Mistral 7B (สมดุลดี)
ollama pull mistral:7b
# ขนาด: 4.1 GB, ต้อง RAM 8 GB
```

> **⏱️ เวลาดาวน์โหลด:** 10-30 นาที (ขึ้นกับความเร็วเน็ต)

---

### ขั้นตอนที่ 5: เริ่มใช้งาน Ollama

```powershell
# เริ่ม Ollama server
ollama serve
```

**Output:**
```
Listening on 127.0.0.1:11434 (version 0.x.x)
time=2026-01-21T15:00:00.000+07:00 level=INFO msg="Ollama started"
```

> **💡 Tip:** Ollama จะรันเป็น background service อัตโนมัติหลังติดตั้ง
> คำสั่ง `ollama serve` ไม่จำเป็นต้องรันทุกครั้ง

---

### ขั้นตอนที่ 6: ทดสอบโมเดล

```powershell
# ทดสอบ Chat
ollama run qwen2.5:14b

# พิมพ์คำถาม:
>>> สวัสดีครับ คุณชื่ออะไร
สวัสดีครับ! ผมคือ Qwen ผู้ช่วย AI ที่พัฒนาโดย Alibaba Cloud...

# กด Ctrl+D เพื่อออก
```

---

## 🐧 การติดตั้งบน Linux (Ubuntu/Debian)

```bash
# ติดตั้ง Ollama
curl -fsSL https://ollama.com/install.sh | sh

# ตรวจสอบ
ollama --version

# ดาวน์โหลดโมเดล
ollama pull qwen2.5:14b

# เริ่ม service (จะรันอัตโนมัติ)
systemctl status ollama

# ทดสอบ
ollama run qwen2.5:14b
```

---

## 🍎 การติดตั้งบน macOS

```bash
# ดาวน์โหลด .dmg จาก https://ollama.com/download/mac
# หรือใช้ Homebrew:
brew install ollama

# ดาวน์โหลดโมเดล
ollama pull qwen2.5:14b

# ทดสอบ
ollama run qwen2.5:14b
```

---

## 🔧 การตั้งค่า (Configuration)

### 1. เปลี่ยน Default Port (ถ้าต้องการ)

**Windows:**
```powershell
# Set environment variable
[Environment]::SetEnvironmentVariable("OLLAMA_HOST", "0.0.0.0:11435", "User")

# รีสตาร์ท Ollama
taskkill /F /IM ollama.exe
ollama serve
```

**Linux:**
```bash
# แก้ไข service file
sudo nano /etc/systemd/system/ollama.service

# เพิ่มบรรทัด:
Environment="OLLAMA_HOST=0.0.0.0:11435"

# รีโหลด
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

---

### 2. เปิดให้เข้าถึงจากเครื่องอื่น (Remote Access)

```powershell
# Windows: เซ็ต bind to 0.0.0.0
$env:OLLAMA_HOST = "0.0.0.0:11434"
ollama serve

# เปิด Firewall
netsh advfirewall firewall add rule name="Ollama" dir=in action=allow protocol=TCP localport=11434
```

---

### 3. ตั้งค่า GPU (NVIDIA)

```bash
# ตรวจสอบ GPU
nvidia-smi

# Ollama จะใช้ GPU อัตโนมัติ
# เช็คว่าใช้ GPU จริงหรือไม่:
ollama run qwen2.5:14b --verbose
```

---

## 🔗 เชื่อมต่อกับ PMQA Web App

### ขั้นตอนที่ 1: Config ใน Admin Panel

1. Login เป็น **Admin**
2. ไป **Admin → AI Settings → Ollama Setup**
3. กรอก:
   ```
   Ollama Server URL: http://localhost:11434
   Default Model: qwen2.5:14b
   ```
4. คลิก **Test Connection**
   - ✅ ถ้าขึ้น "Connected" → พร้อมใช้งาน
   - ❌ ถ้าขึ้น "Failed" → เช็คขั้นตอนด้านล่าง

---

### ขั้นตอนที่ 2: Enable Local AI

1. Toggle: **Enable Local AI for all users** → ON
2. Save Settings

---

### ขั้นตอนที่ 3: User เลือก Provider

ผู้ใช้ทุกคนสามารถ:
1. ไป **Settings → AI Provider**
2. เลือก **Local AI (Ollama)**
3. Save

---

## 🚨 Troubleshooting (แก้ปัญหา)

### ปัญหา 1: "Connection refused" หรือ "Ollama offline"

**วิธีแก้:**
```powershell
# Windows: ตรวจสอบว่า Ollama รันอยู่หรือไม่
tasklist | findstr ollama

# ถ้าไม่เจอ → เริ่มใหม่
ollama serve

# ลอง curl
curl http://localhost:11434/api/tags
```

---

### ปัญหา 2: "Model not found"

**วิธีแก้:**
```bash
# ดู models ที่มี
ollama list

# ถ้าไม่มี qwen2.5:14b → ดาวน์โหลดใหม่
ollama pull qwen2.5:14b
```

---

### ปัญหา 3: "Out of memory"

**วิธีแก้:**
- ใช้โมเดลเล็กกว่า: `llama3.1:8b` หรือ `mistral:7b`
- ปิดโปรแกรมอื่นที่กิน RAM
- Upgrade RAM เป็น 16GB+

---

### ปัญหา 4: Response ช้ามาก (>30 วินาที)

**วิธีแก้:**
- ตรวจสอบว่ามี GPU หรือไม่: `nvidia-smi`
- ใช้โมเดลเล็กกว่า: `llama3.1:8b`
- ปิด programs ที่ใช้ GPU อื่นๆ

---

## ⚡ One-Click Setup Script

### สำหรับ Windows (PowerShell)

```powershell
# ดาวน์โหลด script จาก Web App:
# Admin → Ollama Setup → Download Setup Script

# หรือคัดลอก script นี้:

# ==========================================
# Ollama Auto Setup Script for Windows
# ==========================================

Write-Host "🚀 Starting Ollama Setup..." -ForegroundColor Green

# 1. Check if Ollama installed
if (Get-Command ollama -ErrorAction SilentlyContinue) {
    Write-Host "✅ Ollama already installed" -ForegroundColor Green
} else {
    Write-Host "📥 Installing Ollama..." -ForegroundColor Yellow
    winget install Ollama.Ollama -h --accept-source-agreements --accept-package-agreements
    Write-Host "✅ Ollama installed" -ForegroundColor Green
}

# 2. Pull model
Write-Host "📦 Downloading qwen2.5:14b model..." -ForegroundColor Yellow
ollama pull qwen2.5:14b
Write-Host "✅ Model downloaded" -ForegroundColor Green

# 3. Start service
Write-Host "🔄 Starting Ollama service..." -ForegroundColor Yellow
Start-Process ollama -ArgumentList "serve" -WindowStyle Hidden
Start-Sleep -Seconds 3

# 4. Test
Write-Host "🧪 Testing connection..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get
if ($response) {
    Write-Host "✅ Ollama is running!" -ForegroundColor Green
    Write-Host "Models installed:" -ForegroundColor Cyan
    $response.models | ForEach-Object { Write-Host "  - $($_.name)" -ForegroundColor White }
} else {
    Write-Host "❌ Connection failed" -ForegroundColor Red
}

Write-Host "`n🎉 Setup complete! You can now use Local AI in PMQA app." -ForegroundColor Green
```

**วิธีใช้:**
1. เปิด PowerShell as Administrator
2. Copy-Paste script ข้างบน
3. กด Enter
4. รอจนเสร็จ (~10-30 นาที)

---

### สำหรับ Linux (Bash)

```bash
#!/bin/bash
# Ollama Auto Setup Script for Linux

echo "🚀 Starting Ollama Setup..."

# 1. Install Ollama
if command -v ollama &> /dev/null; then
    echo "✅ Ollama already installed"
else
    echo "📥 Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
    echo "✅ Ollama installed"
fi

# 2. Pull model
echo "📦 Downloading qwen2.5:14b model..."
ollama pull qwen2.5:14b
echo "✅ Model downloaded"

# 3. Start service (should auto-start)
echo "🔄 Checking Ollama service..."
sudo systemctl enable ollama
sudo systemctl start ollama

# 4. Test
echo "🧪 Testing connection..."
sleep 3
response=$(curl -s http://localhost:11434/api/tags)
if [ ! -z "$response" ]; then
    echo "✅ Ollama is running!"
    echo "Models installed:"
    echo "$response" | grep -o '"name":"[^"]*"' | cut -d'"' -f4
else
    echo "❌ Connection failed"
fi

echo ""
echo "🎉 Setup complete! You can now use Local AI in PMQA app."
```

**วิธีใช้:**
```bash
chmod +x ollama-setup.sh
sudo ./ollama-setup.sh
```

---

## 📊 เปรียบเทียบโมเดล

| โมเดล | ขนาด | RAM | ภาษาไทย | ความเร็ว | แนะนำสำหรับ |
|-------|------|-----|---------|---------|------------|
| **qwen2.5:14b** | 9 GB | 16 GB | ⭐⭐⭐⭐⭐ | ⚡⚡ | ใช้งานจริง (Production) |
| llama3.1:8b | 4.7 GB | 8 GB | ⭐⭐⭐ | ⚡⚡⚡ | ทดสอบ / RAM น้อย |
| mistral:7b | 4.1 GB | 8 GB | ⭐⭐⭐⭐ | ⚡⚡⚡ | สมดุลดี |
| llama3.1:70b | 40 GB | 64 GB | ⭐⭐⭐⭐⭐ | ⚡ | Server แรงมาก |

---

## 🎯 Next Steps

หลังติดตั้งเสร็จ:

1. ✅ Login เข้า PMQA Web App
2. ✅ ไป Settings → AI Provider
3. ✅ เลือก "Local AI (Ollama)"
4. ✅ ทดสอบ Chat with PMQA Rules
5. ✅ ทดสอบ Smart Evidence Tagging

---

## 📞 ติดต่อ Support

หากมีปัญหา:
- 📖 อ่าน Troubleshooting ด้านบน
- 🌐 ดู Ollama Docs: https://ollama.com/docs
- 💬 ติดต่อ Admin ของระบบ

---

**สุดท้าย:** ยินดีต้อนรับสู่ Local AI! 🎉 ข้อมูลของคุณจะปลอดภัยและไม่ออกจาก Server อีกต่อไป 🛡️
