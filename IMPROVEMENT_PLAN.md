# แผนพัฒนาปรับปรุงระบบ PMQA-ISOC

> สร้างเมื่อ: 21 มกราคม 2569
> สถานะ: รอดำเนินการ

---

## 1. ปรับปรุง Performance - INP Issue (User Approval)

### ปัญหาที่พบ:
- ปุ่มอนุมัติ User ใช้เวลา ~1.5 วินาที ทำให้ UI ค้าง
- Chrome DevTools แจ้ง INP (Interaction to Next Paint) warning

### แนวทางแก้ไข:

#### 1.1 เพิ่ม Optimistic UI Update
```typescript
// แสดงผลลัพธ์ทันทีก่อนรอ Firestore
const handleApprove = async (targetUser: User) => {
    // 1. อัปเดต UI ทันที (optimistic)
    setUsers(prev => prev.map(u =>
        u.uid === targetUser.uid ? { ...u, status: 'approved' } : u
    ));

    // 2. ทำงานจริงใน background
    try {
        await updateDoc(...);
    } catch (error) {
        // 3. Rollback ถ้าผิดพลาด
        setUsers(prev => prev.map(u =>
            u.uid === targetUser.uid ? { ...u, status: 'pending' } : u
        ));
    }
};
```

#### 1.2 ใช้ React startTransition
```typescript
import { startTransition } from 'react';

const handleApprove = async (targetUser: User) => {
    startTransition(() => {
        // Non-urgent UI updates
        setUsers(...);
    });
};
```

#### 1.3 แยก Notification ออกจาก Main Thread
```typescript
// ส่ง notification แบบ fire-and-forget
sendApprovalNotification(targetUser.uid, user?.displayName)
    .catch(console.error); // ไม่ต้อง await
```

### ไฟล์ที่ต้องแก้ไข:
- `src/app/admin/users/page.tsx` - handleApprove, handleReject
- `src/app/admin/approvals/page.tsx` - handleSaveAndApprove

### Priority: Medium
### Estimated Effort: 2-3 ชั่วโมง

---

## 2. Super Admin กำหนด Role ให้ User ไม่ได้

### สถานะปัจจุบัน:
✅ **ทำได้แล้ว!** - ตรวจสอบโค้ดพบว่า:
- Dialog แก้ไข User มี Select สำหรับเลือก Role ครบทุก role
- รวมถึง `super_admin` และ `central_admin`

### ตำแหน่งในโค้ด:
`src/app/admin/users/page.tsx` บรรทัด 752-766

```typescript
<Select value={role} onValueChange={(v: User['role']) => setRole(v)}>
    <SelectContent>
        <SelectItem value="super_admin">ผู้ดูแลระบบสูงสุด</SelectItem>
        <SelectItem value="central_admin">ผู้ดูแลส่วนกลาง</SelectItem>
        <SelectItem value="regional_coordinator">ผู้ประสานงานภาค</SelectItem>
        <SelectItem value="provincial_staff">เจ้าหน้าที่จังหวัด</SelectItem>
        <SelectItem value="data_owner">เจ้าของข้อมูล</SelectItem>
        <SelectItem value="reviewer">ผู้ตรวจสอบ</SelectItem>
        <SelectItem value="read_only">ผู้เข้าชม</SelectItem>
    </SelectContent>
</Select>
```

### วิธีใช้งาน:
1. ไปที่ **Admin** → **จัดการผู้ใช้**
2. คลิกปุ่ม **แก้ไข** (ไอคอนดินสอ) ที่ User ที่ต้องการ
3. เลือก **บทบาท** จาก dropdown
4. กด **บันทึกการแก้ไข**

### ข้อเสนอปรับปรุงเพิ่มเติม:

#### 2.1 เพิ่มปุ่ม Quick Action สำหรับเปลี่ยน Role
แทนที่จะต้องเปิด Dialog ทุกครั้ง

```typescript
// เพิ่มปุ่ม "Promote to Admin" ในตาราง
<Button
    size="sm"
    variant="outline"
    onClick={() => handlePromoteToAdmin(user)}
>
    <ShieldCheck className="h-4 w-4" />
</Button>
```

#### 2.2 เพิ่ม Role Badge ที่แสดงชัดเจนในตาราง
```typescript
// เน้น Admin roles ด้วยสีพิเศษ
{user.role === 'super_admin' && (
    <Badge className="bg-red-600">Super Admin</Badge>
)}
{user.role === 'central_admin' && (
    <Badge className="bg-purple-600">Central Admin</Badge>
)}
```

#### 2.3 เพิ่ม Confirmation ก่อนเปลี่ยนเป็น Admin
```typescript
// ป้องกันการตั้ง Admin โดยไม่ตั้งใจ
if (newRole === 'super_admin' || newRole === 'central_admin') {
    if (!confirm(`ยืนยันการตั้งค่า ${displayName} เป็น ${getRoleDisplay(newRole)}?`)) {
        return;
    }
}
```

### Priority: Low (ทำงานได้แล้ว แค่ปรับปรุง UX)
### Estimated Effort: 1-2 ชั่วโมง

---

## 3. ปรับปรุงเพิ่มเติมที่แนะนำ

### 3.1 Activity Log สำหรับการเปลี่ยน Role
```typescript
// บันทึกเมื่อมีการเปลี่ยน role
if (editingUser.role !== role) {
    await logUserRoleChangeAction(
        editingUser.uid,
        editingUser.displayName,
        editingUser.role, // old role
        role // new role
    );
}
```

### 3.2 Email Notification เมื่อได้รับ Role ใหม่
```typescript
// แจ้งเตือนเมื่อได้รับ promotion
await sendRoleChangeNotification(
    targetUser.uid,
    getRoleDisplay(newRole)
);
```

### 3.3 Role History ในหน้า User Profile
แสดงประวัติการเปลี่ยนแปลง Role ของ User

---

## สรุปลำดับความสำคัญ

| # | งาน | Priority | Status |
|---|-----|----------|--------|
| 1 | แก้ไข INP Performance Issue | Medium | รอดำเนินการ |
| 2 | ตรวจสอบ Role Assignment | - | ✅ ทำได้แล้ว |
| 3 | เพิ่ม Quick Action Buttons | Low | รอดำเนินการ |
| 4 | เพิ่ม Confirmation Dialog | Low | รอดำเนินการ |
| 5 | Activity Log สำหรับ Role Change | Low | รอดำเนินการ |

---

## หมายเหตุ
- การแก้ไข INP Issue ควรทำก่อน deploy production
- Role Assignment ใช้งานได้แล้ว เพียงแค่ต้องรู้วิธีใช้
- ปรับปรุง UX สามารถทำทีหลังได้
