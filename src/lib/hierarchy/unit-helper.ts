// Unit type used for type reference only

// Helper to get initial units structure (Hardcoded for MVP start, later fetched from DB)
export const ISOC_HIERARCHY = {
    REGIONS: [
        { id: 'region-1', name: 'กอ.รมน.ภาค 1', code: 'R1' },
        { id: 'region-2', name: 'กอ.รมน.ภาค 2', code: 'R2' },
        { id: 'region-3', name: 'กอ.รมน.ภาค 3', code: 'R3' },
        { id: 'region-4', name: 'กอ.รมน.ภาค 4', code: 'R4' },
    ],
    CENTERS: [
        { id: 'center-psd', name: 'ศูนย์ปรองดองสมานฉันท์ฯ' },
        { id: 'center-sbp', name: 'ศปป.1 (กอ.รมน.)' },
        { id: 'center-sbp2', name: 'ศปป.2 (กอ.รมน.)' },
        { id: 'center-sbp3', name: 'ศปป.3 (กอ.รมน.)' },
        { id: 'center-sbp4', name: 'ศปป.4 (กอ.รมน.)' },
    ],
    CENTRAL_UNITS: [
        { id: 'central-admin', name: 'สำนักนโยบายและยุทธศาสตร์ความมั่นคง (สนย.)' },
        { id: 'central-hr', name: 'สำนักกำลังพล' },
    ]
};

// This function would ideally fetch from Firestore if units are dynamic
export const getProvincesByRegion = (regionId: string) => {
    // Mock data for MVP UI testing - Real data needed via Network Mapper App
    // User "Real Data" requirement means we should probably have the full list eventually.
    // For now, return empty or common ones.
    switch (regionId) {
        case 'region-1': return ['กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'พระนครศรีอยุธยา'].map(n => ({ id: `prov-${n}`, name: n }));
        case 'region-2': return ['นครราชสีมา', 'ขอนแก่น', 'อุบลราชธานี', 'อุดรธานี'].map(n => ({ id: `prov-${n}`, name: n }));
        case 'region-3': return ['เชียงใหม่', 'เชียงราย', 'พิษณุโลก', 'ลำปาง'].map(n => ({ id: `prov-${n}`, name: n }));
        case 'region-4': return ['สงขลา', 'นครศรีธรรมราช', 'ยะลา', 'ปัตตานี'].map(n => ({ id: `prov-${n}`, name: n }));
        default: return [];
    }
};

export const getUnitLabel = (unitId: string): string => {
    // Lookup unit name from hierarchy data
    const allUnits = [
        ...ISOC_HIERARCHY.REGIONS,
        ...ISOC_HIERARCHY.CENTERS,
        ...ISOC_HIERARCHY.CENTRAL_UNITS,
    ];

    const unit = allUnits.find(u => u.id === unitId);
    if (unit) {
        return unit.name;
    }

    // Check if it's a province ID (format: prov-ชื่อจังหวัด)
    if (unitId.startsWith('prov-')) {
        return unitId.replace('prov-', '');
    }

    // Fallback to unitId if not found
    return unitId;
};
