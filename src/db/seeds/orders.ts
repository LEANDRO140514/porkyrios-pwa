import { db } from '@/db';
import { orders } from '@/db/schema';

async function main() {
    const now = new Date();
    
    const sampleOrders = [
        {
            orderNumber: 'PK-10001',
            customerName: 'María García',
            phone: '555-0101',
            total: 24.50,
            status: 'completed',
            createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
            orderNumber: 'PK-10002',
            customerName: 'Juan Hernández',
            phone: '555-0102',
            total: 15.75,
            status: 'ready',
            createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
            orderNumber: 'PK-10003',
            customerName: 'Ana Martínez',
            phone: '555-0103',
            total: 32.00,
            status: 'cooking',
            createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        },
        {
            orderNumber: 'PK-10004',
            customerName: 'Carlos López',
            phone: '555-0104',
            total: 18.25,
            status: 'preparing',
            createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
            orderNumber: 'PK-10005',
            customerName: 'Rosa Rodríguez',
            phone: '555-0105',
            total: 45.50,
            status: 'packing',
            createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        },
    ];

    await db.insert(orders).values(sampleOrders);
    
    console.log('✅ Orders seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});