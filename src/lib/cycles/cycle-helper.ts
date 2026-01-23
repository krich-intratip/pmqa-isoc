import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { AssessmentCycle } from '@/types/database';

/**
 * ดึงรอบการประเมินที่ active อยู่
 */
export async function getActiveCycle(): Promise<AssessmentCycle | null> {
    try {
        const q = query(
            collection(db, 'cycles'),
            where('isActive', '==', true),
            where('status', '==', 'active')
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        return snapshot.docs[0].data() as AssessmentCycle;
    } catch (error) {
        console.error('Error fetching active cycle:', error);
        return null;
    }
}

/**
 * ดึงรอบการประเมินทั้งหมด เรียงตามปีล่าสุด
 */
export async function getAllCycles(): Promise<AssessmentCycle[]> {
    try {
        const snapshot = await getDocs(collection(db, 'cycles'));
        const cycles = snapshot.docs.map(doc => doc.data() as AssessmentCycle);

        // เรียงตามปี จากมากไปน้อย
        return cycles.sort((a, b) => b.year - a.year);
    } catch (error) {
        console.error('Error fetching cycles:', error);
        return [];
    }
}

/**
 * เปลี่ยนรอบการประเมินที่ active (ปิดรอบเก่า เปิดรอบใหม่)
 */
export async function switchActiveCycle(newCycleId: string): Promise<boolean> {
    try {
        // 1. ปิด cycle เก่าทั้งหมด
        const activeCycles = await getDocs(
            query(collection(db, 'cycles'), where('isActive', '==', true))
        );

        const deactivatePromises = activeCycles.docs.map(d =>
            updateDoc(doc(db, 'cycles', d.id), {
                isActive: false,
                updatedAt: serverTimestamp()
            })
        );

        await Promise.all(deactivatePromises);

        // 2. เปิด cycle ใหม่
        await updateDoc(doc(db, 'cycles', newCycleId), {
            isActive: true,
            status: 'active',
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error switching active cycle:', error);
        return false;
    }
}

/**
 * ตรวจสอบว่าหมวดนี้อยู่ใน target categories ของ cycle หรือไม่
 */
export function isCategoryInCycle(cycle: AssessmentCycle | null, categoryId: number): boolean {
    if (!cycle) return false;
    return cycle.targetCategories.includes(categoryId);
}

/**
 * รับ display name ของสถานะ cycle
 */
export function getCycleStatusDisplay(status: AssessmentCycle['status']): string {
    switch (status) {
        case 'draft': return 'ร่าง';
        case 'active': return 'กำลังดำเนินการ';
        case 'completed': return 'เสร็จสิ้น';
        case 'archived': return 'เก็บถาวร';
        default: return status;
    }
}
