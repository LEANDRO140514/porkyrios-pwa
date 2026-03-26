import { db } from '@/db';
import { products } from '@/db/schema';

async function main() {
    const sampleProducts = [
        // TACOS (categoryId: 1)
        {
            name: 'Taco al Pastor',
            description: 'Marinated pork with pineapple, onions, and cilantro',
            price: 3.50,
            categoryId: 1,
            stock: 25,
            image: null,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Taco de Carne Asada',
            description: 'Grilled beef with guacamole and pico de gallo',
            price: 4.00,
            categoryId: 1,
            stock: 30,
            image: null,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Taco de Pollo',
            description: 'Grilled chicken with lettuce, cheese, and crema',
            price: 3.25,
            categoryId: 1,
            stock: 20,
            image: null,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Taco de Carnitas',
            description: 'Slow-cooked pork with salsa verde',
            price: 3.75,
            categoryId: 1,
            stock: 15,
            image: null,
            active: true,
            createdAt: new Date().toISOString(),
        },
        // TORTAS (categoryId: 2)
        {
            name: 'Torta Cubana',
            description: 'The ultimate torta with ham, breaded steak, sausage, egg, and avocado',
            price: 12.00,
            categoryId: 2,
            stock: 10,
            image: null,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Torta de Milanesa',
            description: 'Breaded chicken or beef with beans, lettuce, tomato, and jalapeños',
            price: 10.00,
            categoryId: 2,
            stock: 15,
            image: null,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Torta Ahogada',
            description: 'Pork carnitas drowned in spicy tomato sauce',
            price: 11.00,
            categoryId: 2,
            stock: 8,
            image: null,
            active: true,
            createdAt: new Date().toISOString(),
        },
        // BEBIDAS (categoryId: 3)
        {
            name: 'Agua de Horchata',
            description: 'Sweet rice milk with cinnamon',
            price: 3.50,
            categoryId: 3,
            stock: 40,
            image: null,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Jamaica',
            description: 'Hibiscus flower iced tea',
            price: 3.00,
            categoryId: 3,
            stock: 35,
            image: null,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Coca-Cola Mexicana',
            description: 'Glass bottle Coca-Cola with real cane sugar',
            price: 3.00,
            categoryId: 3,
            stock: 50,
            image: null,
            active: true,
            createdAt: new Date().toISOString(),
        },
        // POSTRES (categoryId: 4)
        {
            name: 'Churros',
            description: 'Fried dough pastry with cinnamon sugar and chocolate sauce',
            price: 5.00,
            categoryId: 4,
            stock: 20,
            image: null,
            active: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Flan',
            description: 'Creamy caramel custard',
            price: 4.50,
            categoryId: 4,
            stock: 12,
            image: null,
            active: true,
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(products).values(sampleProducts);
    
    console.log('✅ Products seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});