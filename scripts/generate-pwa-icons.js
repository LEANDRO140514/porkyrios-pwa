const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputImage = '/tmp/pwa-icon.jpg';
const outputDir = path.join(__dirname, '..', 'public');

async function generateIcons() {
  console.log('🎨 Generando iconos PWA...');
  
  for (const size of sizes) {
    try {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(inputImage)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generado: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Error generando icon-${size}x${size}.png:`, error.message);
    }
  }
  
  console.log('🎉 ¡Todos los iconos generados exitosamente!');
}

generateIcons().catch(console.error);
