import { db } from '@/db';
import { postalCodes } from '@/db/schema';

async function main() {
    const samplePostalCodes = [
        // Central Guadalajara (44100-44300) - 35.00 MXN
        {
            code: '44100',
            municipality: 'Guadalajara',
            state: 'Jalisco',
            deliveryCost: 35.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '44160',
            municipality: 'Guadalajara',
            state: 'Jalisco',
            deliveryCost: 35.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '44200',
            municipality: 'Guadalajara',
            state: 'Jalisco',
            deliveryCost: 35.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '44280',
            municipality: 'Guadalajara',
            state: 'Jalisco',
            deliveryCost: 35.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        
        // Nearby areas (44400-44700) - 40.00 MXN
        {
            code: '44420',
            municipality: 'Guadalajara',
            state: 'Jalisco',
            deliveryCost: 40.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '44500',
            municipality: 'Guadalajara',
            state: 'Jalisco',
            deliveryCost: 40.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '44600',
            municipality: 'Guadalajara',
            state: 'Jalisco',
            deliveryCost: 40.00,
            active: false,
            createdAt: new Date().toISOString(),
        },
        {
            code: '44680',
            municipality: 'Guadalajara',
            state: 'Jalisco',
            deliveryCost: 40.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        
        // Zapopan area (45000-45200) - 45.00 MXN
        {
            code: '45010',
            municipality: 'Zapopan',
            state: 'Jalisco',
            deliveryCost: 45.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '45040',
            municipality: 'Zapopan',
            state: 'Jalisco',
            deliveryCost: 45.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '45070',
            municipality: 'Zapopan',
            state: 'Jalisco',
            deliveryCost: 45.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '45100',
            municipality: 'Zapopan',
            state: 'Jalisco',
            deliveryCost: 45.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '45130',
            municipality: 'Zapopan',
            state: 'Jalisco',
            deliveryCost: 45.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '45180',
            municipality: 'Zapopan',
            state: 'Jalisco',
            deliveryCost: 45.00,
            active: false,
            createdAt: new Date().toISOString(),
        },
        
        // Tonalá (45400-45450) - 55.00 MXN
        {
            code: '45400',
            municipality: 'Tonalá',
            state: 'Jalisco',
            deliveryCost: 55.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '45410',
            municipality: 'Tonalá',
            state: 'Jalisco',
            deliveryCost: 55.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '45430',
            municipality: 'Tonalá',
            state: 'Jalisco',
            deliveryCost: 55.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '45440',
            municipality: 'Tonalá',
            state: 'Jalisco',
            deliveryCost: 55.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        
        // Tlaquepaque (45500-45700) - 50.00 MXN
        {
            code: '45500',
            municipality: 'Tlaquepaque',
            state: 'Jalisco',
            deliveryCost: 50.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '45550',
            municipality: 'Tlaquepaque',
            state: 'Jalisco',
            deliveryCost: 50.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '45600',
            municipality: 'Tlaquepaque',
            state: 'Jalisco',
            deliveryCost: 50.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '45650',
            municipality: 'Tlaquepaque',
            state: 'Jalisco',
            deliveryCost: 50.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '45670',
            municipality: 'Tlaquepaque',
            state: 'Jalisco',
            deliveryCost: 50.00,
            active: false,
            createdAt: new Date().toISOString(),
        },
        
        // Tlajomulco de Zúñiga (45640-45659) - 60.00 MXN
        {
            code: '45640',
            municipality: 'Tlajomulco de Zúñiga',
            state: 'Jalisco',
            deliveryCost: 60.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '45645',
            municipality: 'Tlajomulco de Zúñiga',
            state: 'Jalisco',
            deliveryCost: 60.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '45653',
            municipality: 'Tlajomulco de Zúñiga',
            state: 'Jalisco',
            deliveryCost: 60.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        
        // Far suburbs (45800-45900) - 65.00 MXN
        {
            code: '45810',
            municipality: 'Zapopan',
            state: 'Jalisco',
            deliveryCost: 65.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '45850',
            municipality: 'Guadalajara',
            state: 'Jalisco',
            deliveryCost: 65.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            code: '45890',
            municipality: 'Tlaquepaque',
            state: 'Jalisco',
            deliveryCost: 65.00,
            active: true,
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(postalCodes).values(samplePostalCodes);
    
    console.log('✅ Postal codes seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});