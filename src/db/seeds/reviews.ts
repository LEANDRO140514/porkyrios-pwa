import { db } from '@/db';
import { reviews } from '@/db/schema';

async function main() {
    const now = new Date();
    const userId = "9iB51X2pA5vUx5f8MJuGTjIo057dVXjv";

    const sampleReviews = [
        {
            userId: userId,
            rating: 5,
            comment: "¡Excelente servicio! Los tacos al pastor están deliciosos y la entrega fue muy rápida. El empaque llegó perfecto y la comida todavía estaba caliente. Definitivamente volveré a ordenar.",
            status: "approved",
            moderationReason: null,
            ipAddress: "192.168.1.100",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            isVerifiedPurchase: true,
            reportedCount: 0,
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            moderatedAt: null,
            moderatedBy: null,
        },
        {
            userId: userId,
            rating: 5,
            comment: "Las tortas ahogadas son espectaculares. El sabor es auténtico y la salsa tiene el picante perfecto. La atención al cliente fue muy amable y me ayudaron con mi pedido. Muy recomendado, vale totalmente la pena el precio.",
            status: "approved",
            moderationReason: null,
            ipAddress: "192.168.1.105",
            userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
            isVerifiedPurchase: true,
            reportedCount: 0,
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            moderatedAt: null,
            moderatedBy: null,
        },
        {
            userId: userId,
            rating: 5,
            comment: "Pedí para toda la familia y todos quedaron encantados. Los chilaquiles verdes estaban frescos y las bebidas llegaron bien frías. El repartidor fue muy puntual y profesional. Sin duda la mejor comida mexicana de la zona.",
            status: "approved",
            moderationReason: null,
            ipAddress: "192.168.1.110",
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            isVerifiedPurchase: true,
            reportedCount: 0,
            createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            moderatedAt: null,
            moderatedBy: null,
        },
        {
            userId: userId,
            rating: 4,
            comment: "Muy buena comida en general. Los tacos de carnitas tienen excelente sabor y la presentación es bonita. La entrega fue rápida, aunque me hubiera gustado que incluyeran más salsas. Aún así, muy satisfecho con mi pedido.",
            status: "approved",
            moderationReason: null,
            ipAddress: "192.168.1.115",
            userAgent: "Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36",
            isVerifiedPurchase: true,
            reportedCount: 0,
            createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            moderatedAt: null,
            moderatedBy: null,
        },
        {
            userId: userId,
            rating: 4,
            comment: "Buena relación calidad-precio. Las enchiladas estaban riquísimas y bien servidas. El empaque es resistente y todo llegó bien organizado. Solo le faltó un poquito de temperatura a la comida, pero el sabor compensa todo.",
            status: "approved",
            moderationReason: null,
            ipAddress: "192.168.1.120",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
            isVerifiedPurchase: true,
            reportedCount: 0,
            createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            moderatedAt: null,
            moderatedBy: null,
        },
        {
            userId: userId,
            rating: 4,
            comment: "Me gustó mucho el servicio. Los burritos son grandes y llenadores. La atención por WhatsApp fue muy buena y respondieron todas mis dudas. El precio me parece justo para la cantidad y calidad de comida que ofrecen.",
            status: "approved",
            moderationReason: null,
            ipAddress: "192.168.1.125",
            userAgent: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
            isVerifiedPurchase: true,
            reportedCount: 0,
            createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            moderatedAt: null,
            moderatedBy: null,
        },
        {
            userId: userId,
            rating: 3,
            comment: "La comida está bien, los tacos tienen buen sabor aunque esperaba porciones un poco más grandes. El repartidor tardó un poco más de lo estimado, pero fue amable. El empaque es bueno y la comida llegó en condiciones aceptables.",
            status: "approved",
            moderationReason: null,
            ipAddress: "192.168.1.130",
            userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
            isVerifiedPurchase: true,
            reportedCount: 0,
            createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            moderatedAt: null,
            moderatedBy: null,
        },
        {
            userId: userId,
            rating: 3,
            comment: "Servicio decente. Las quesadillas estaban ricas pero la entrega se retrasó bastante. El precio me parece un poco elevado para lo que recibí. La atención al cliente es buena, pero creo que pueden mejorar en los tiempos de entrega y las porciones.",
            status: "approved",
            moderationReason: null,
            ipAddress: "192.168.1.135",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0",
            isVerifiedPurchase: true,
            reportedCount: 0,
            createdAt: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString(),
            moderatedAt: null,
            moderatedBy: null,
        }
    ];

    await db.insert(reviews).values(sampleReviews);
    
    console.log('✅ Reviews seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});