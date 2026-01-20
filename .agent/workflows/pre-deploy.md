---
description: Pre-deploy checklist before pushing to main branch
---

# Pre-Deploy Checklist (ก่อน Push ไป Vercel)

// turbo-all

## 1. Version Consistency Check
ตรวจสอบว่า version ตรงกันทั้ง 3 ที่:

```bash
npm run build
```

### Version Files to Check:
1. **package.json** - `"version": "X.Y.Z"`
2. **src/config/version.ts** - `version: 'X.Y.Z'`
3. **src/config/version.ts** - ต้องมี release entry `vX.Y.Z` ใน `releases` object

> ⚠️ **สำคัญ**: ถ้า update version ใหม่ ต้องเพิ่ม release entry ที่ตรงกันด้วย!
> About page ใช้ dynamic lookup: `APP_VERSION.releases[\`v${APP_VERSION.version}\`]`
> ถ้าไม่มี entry จะทำให้ build fail!

## 2. Build Verification
รัน build locally ก่อน push:

```bash
npm run build
```

ตรวจสอบให้แน่ใจว่า:
- ✅ "Compiled successfully"
- ✅ ไม่มี TypeScript errors
- ✅ ไม่มี ESLint errors
- ✅ Static pages generated สำเร็จ

## 3. Git Commit
ถ้า build ผ่าน ทำการ commit:

```bash
git add -A
git status
git commit -m "feat: vX.Y.Z - [Description]"
```

## 4. Push to Main
Push และ Vercel จะ deploy อัตโนมัติ:

```bash
git push origin main
```

## 5. Verify Deployment
- ไปที่ Vercel Dashboard ตรวจสอบ deployment status
- ทดสอบ production URL หลัง deploy สำเร็จ
