/**
 * Setup Admin Script
 *
 * วิธีใช้: รันคำสั่งนี้ใน Firebase Console > Firestore > users collection
 * หรือใช้ Firebase Admin SDK
 *
 * ข้อมูลที่ต้องใส่ใน document ชื่อ users/{uid}:
 */

const adminUserData = {
    uid: "USER_UID_FROM_FIREBASE_AUTH", // ต้องดึงจาก Firebase Auth Console
    email: "krich.intratip@gmail.com",
    displayName: "Krich Intratip",
    photoURL: "", // จาก Google Profile
    role: "super_admin",
    unitId: "central", // หน่วยงานส่วนกลาง
    status: "approved",
    permissions: [
        "manage_users",
        "approve_users",
        "manage_units",
        "manage_evidence",
        "approve_evidence",
        "manage_ai_config",
        "view_all_data",
        "export_data",
        "manage_settings"
    ],
    createdAt: new Date(), // Firestore Timestamp
    updatedAt: new Date(), // Firestore Timestamp
    lastLoginAt: new Date(),
    isActive: true,
    metadata: {
        position: "System Administrator",
        department: "กอ.รมน.",
        phone: ""
    }
};

console.log("Admin User Data to insert:");
console.log(JSON.stringify(adminUserData, null, 2));

/**
 * วิธีการใส่ข้อมูลใน Firebase Console:
 *
 * 1. ไปที่ Firebase Console > Authentication > Users
 *    - หา email: krich.intratip@gmail.com
 *    - copy UID ของ user นี้
 *
 * 2. ไปที่ Firebase Console > Firestore Database
 *    - เลือก collection "users"
 *    - กด "Add document"
 *    - Document ID = UID ที่ copy มา
 *    - ใส่ข้อมูลตาม adminUserData ด้านบน
 *
 * หรือ รัน script ด้านล่างนี้ใน browser console ที่หน้า web app
 */

export const browserScript = `
// รัน script นี้ใน Browser Console ที่หน้า localhost:3000

// 1. Import Firebase
const { db, auth } = await import('/src/lib/firebase/config');
const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

// 2. ดึง current user UID
const currentUser = auth.currentUser;
if (!currentUser) {
    console.error('กรุณา login ก่อน');
} else {
    console.log('Current User UID:', currentUser.uid);
    console.log('Email:', currentUser.email);

    // 3. Update user เป็น admin
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || 'Krich Intratip',
        photoURL: currentUser.photoURL || '',
        role: 'super_admin',
        unitId: 'central',
        status: 'approved',
        permissions: [
            'manage_users',
            'approve_users',
            'manage_units',
            'manage_evidence',
            'approve_evidence',
            'manage_ai_config',
            'view_all_data',
            'export_data',
            'manage_settings'
        ],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        isActive: true,
        metadata: {
            position: 'System Administrator',
            department: 'กอ.รมน.',
            phone: ''
        }
    }, { merge: true });

    console.log('✅ Admin setup complete! Please refresh the page.');
}
`;
