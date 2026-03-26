import { db } from '@/db';
import { coupons } from '@/db/schema';

async function main() {
    const sampleCoupons = [
        {
            code: 'PORKY10',
            type: 'percentage',
            value: 10.0,
            minPurchase: null,
            maxDiscount: null,
            usageLimit: null,
            usedCount: 0,
            startDate: null,
            endDate: null,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: 'PRIMERORDEN',
            type: 'percentage',
            value: 20.0,
            minPurchase: null,
            maxDiscount: 50.0,
            usageLimit: null,
            usedCount: 0,
            startDate: null,
            endDate: null,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: 'VERANO2025',
            type: 'fixed',
            value: 5.0,
            minPurchase: 20.0,
            maxDiscount: null,
            usageLimit: null,
            usedCount: 0,
            startDate: null,
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: 'VIP50',
            type: 'percentage',
            value: 50.0,
            minPurchase: null,
            maxDiscount: 100.0,
            usageLimit: 10,
            usedCount: 3,
            startDate: null,
            endDate: null,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: 'GRATIS15',
            type: 'fixed',
            value: 15.0,
            minPurchase: 50.0,
            maxDiscount: null,
            usageLimit: null,
            usedCount: 0,
            startDate: null,
            endDate: null,
            active: true,
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(coupons).values(sampleCoupons);
    
    console.log('✅ Coupons seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});