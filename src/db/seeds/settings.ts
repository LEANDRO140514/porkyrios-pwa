import { db } from '@/db';
import { settings } from '@/db/schema';

async function main() {
    const sampleSettings = [
        {
            key: 'reviews_section_enabled',
            value: 'true',
            description: 'Controls whether the reviews section is displayed on the homepage',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(settings).values(sampleSettings);
    
    console.log('✅ Settings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});