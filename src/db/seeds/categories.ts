import { db } from '@/db';
import { categories } from '@/db/schema';

async function main() {
    const sampleCategories = [
        {
            name: 'Tacos',
            emoji: '🌮',
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Tortas',
            emoji: '🥖',
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Bebidas',
            emoji: '🥤',
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Postres',
            emoji: '🍰',
            active: true,
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(categories).values(sampleCategories);
    
    console.log('✅ Categories seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});