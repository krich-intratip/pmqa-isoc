// ============================================
// Thai Language Utilities
// Adapated from WebAppDevSkills/thai-utilities.ts
// ============================================

/**
 * Thai Text Normalization and Processing
 */
export class ThaiTextProcessor {
    // Thai Unicode ranges
    private static readonly THAI_CONSONANTS = /[\u0E01-\u0E2E]/g
    private static readonly THAI_VOWELS = /[\u0E30-\u0E3A\u0E40-\u0E46]/g
    private static readonly THAI_TONES = /[\u0E48-\u0E4B]/g
    private static readonly THAI_CHARS = /[\u0E00-\u0E7F]/g

    /**
     * Normalize Thai text (Unicode normalization + whitespace)
     */
    static normalize(text: string): string {
        return text
            .normalize('NFC') // Normalize Unicode composition
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/\u200B/g, '') // Remove zero-width space
            .trim()
    }

    /**
     * Count Thai characters (excluding spaces and punctuation)
     */
    static countThaiChars(text: string): number {
        const matches = text.match(this.THAI_CHARS)
        return matches ? matches.length : 0
    }

    /**
     * Check if text contains Thai characters
     */
    static isThaiText(text: string): boolean {
        return this.THAI_CHARS.test(text)
    }

    /**
     * Simple Thai keyword extraction (by frequency)
     */
    static extractKeywords(text: string, minLength: number = 3, topN: number = 10): string[] {
        // Split by non-Thai characters
        const words = text
            .split(/[^\u0E00-\u0E7F]+/)
            .filter(word => word.length >= minLength)

        // Count frequency
        const frequency = new Map<string, number>()
        words.forEach(word => {
            const normalized = this.normalize(word)
            frequency.set(normalized, (frequency.get(normalized) || 0) + 1)
        })

        // Sort by frequency and return top N
        return Array.from(frequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, topN)
            .map(([word]) => word)
    }
}

/**
 * Thai Date and Time Utilities
 */
export class ThaiDateTime {
    private static readonly THAI_MONTHS = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]

    private static readonly THAI_MONTHS_SHORT = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ]

    private static readonly THAI_DAYS = [
        'อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'
    ]

    private static readonly THAI_DAYS_SHORT = [
        'อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'
    ]

    /**
     * Format date in Thai Buddhist Era
     * Example: "15 มกราคม 2567"
     */
    static formatThai(date: Date, format: 'long' | 'short' = 'long'): string {
        const day = date.getDate()
        const month = date.getMonth()
        const year = date.getFullYear() + 543 // Convert to Buddhist Era

        const monthName = format === 'long'
            ? this.THAI_MONTHS[month]
            : this.THAI_MONTHS_SHORT[month]

        return `${day} ${monthName} ${year}`
    }

    /**
     * Format date with day of week
     * Example: "วันอาทิตย์ที่ 15 มกราคม 2567"
     */
    static formatThaiWithDay(date: Date, format: 'long' | 'short' = 'long'): string {
        const dayOfWeek = date.getDay()
        const dayName = format === 'long'
            ? this.THAI_DAYS[dayOfWeek]
            : this.THAI_DAYS_SHORT[dayOfWeek]

        const dateStr = this.formatThai(date, format)

        return `วัน${dayName}ที่ ${dateStr}`
    }

    /**
     * Format datetime in Thai
     * Example: "15 มกราคม 2567 เวลา 14:30 น."
     */
    static formatThaiDateTime(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${this.formatThai(date)} เวลา ${hours}:${minutes} น.`
    }
}

/**
 * Thai Military Rank Utilities (RTA Specific)
 */
export class ThaiMilitaryRank {
    private static readonly RANKS = {
        officers: [
            { abbr: 'พล.อ.', full: 'พลเอก', level: 13 },
            { abbr: 'พล.ท.', full: 'พลโท', level: 12 },
            { abbr: 'พล.ต.', full: 'พลตรี', level: 11 },
            { abbr: 'พ.อ.', full: 'พันเอก', level: 10 },
            { abbr: 'พ.อ. (พิเศษ)', full: 'พันเอก (พิเศษ)', level: 10.5 }, // Special case
            { abbr: 'พ.ท.', full: 'พันโท', level: 9 },
            { abbr: 'พ.ต.', full: 'พันตรี', level: 8 },
            { abbr: 'ร.อ.', full: 'ร้อยเอก', level: 7 },
            { abbr: 'ร.ท.', full: 'ร้อยโท', level: 6 },
            { abbr: 'ร.ต.', full: 'ร้อยตรี', level: 5 },
        ],
        ncos: [
            { abbr: 'จ.ส.อ.', full: 'จ่าสิบเอก', level: 4 },
            { abbr: 'จ.ส.ท.', full: 'จ่าสิบโท', level: 3 },
            { abbr: 'จ.ส.ต.', full: 'จ่าสิบตรี', level: 2 },
            { abbr: 'ส.อ.', full: 'สิบเอก', level: 1 },
        ]
    }

    static getFullRank(abbr: string): string | null {
        const allRanks = [...this.RANKS.officers, ...this.RANKS.ncos]
        const rank = allRanks.find(r => r.abbr === abbr)
        return rank?.full || null
    }
}

/**
 * Thai Number Formatter
 */
export class ThaiNumberFormatter {
    static formatBaht(amount: number, showStang: boolean = true): string {
        return amount.toLocaleString('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: showStang ? 2 : 0
        })
    }
}

// Export all as default
export const ThaiUtils = {
    Text: ThaiTextProcessor,
    DateTime: ThaiDateTime,
    MilitaryRank: ThaiMilitaryRank,
    Number: ThaiNumberFormatter,
}

export default ThaiUtils;
