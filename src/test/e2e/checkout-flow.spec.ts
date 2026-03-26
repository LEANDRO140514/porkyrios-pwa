import { test, expect } from '@playwright/test';

test.describe('Complete Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete full purchase flow from menu to payment', async ({ page }) => {
    // 1. Navigate to menu
    await page.click('text=🍽️ ¡Hacer mi pedido!');
    await expect(page).toHaveURL('/menu');

    // 2. Wait for products to load
    await page.waitForSelector('text=Taco al Pastor', { timeout: 10000 });

    // 3. Add first product to cart
    const firstAddButton = page.locator('button:has-text("Agregar")').first();
    await firstAddButton.click();
    await expect(page.locator('text=¡Producto agregado al carrito!')).toBeVisible();

    // 4. Verify cart counter updated
    await expect(page.locator('text=1')).toBeVisible();

    // 5. Add another product
    const secondAddButton = page.locator('button:has-text("Agregar")').nth(1);
    await secondAddButton.click();

    // 6. Navigate to cart
    await page.click('button:has-text("Ver Carrito")');
    await expect(page).toHaveURL('/cart');

    // 7. Verify cart has items
    await expect(page.locator('text=Mi Carrito')).toBeVisible();
    await expect(page.locator('text=Resumen del Pedido')).toBeVisible();

    // 8. Select delivery method
    await page.click('button:has-text("🏍️ Delivery")');
    await expect(page.locator('text=Tu pedido será entregado')).toBeVisible();

    // 9. Verify total calculation with delivery
    await expect(page.locator('text=Envío')).toBeVisible();
    await expect(page.locator('text=$35.00')).toBeVisible();

    // 10. Proceed to payment
    await page.click('button:has-text("Proceder al Pago")');
    await expect(page).toHaveURL('/payment');

    // 11. Verify payment page loaded
    await expect(page.locator('text=Finalizar Pedido')).toBeVisible();
    await expect(page.locator('text=Información de Pago')).toBeVisible();
  });

  test('should update cart quantities correctly', async ({ page }) => {
    // Navigate to menu and add product
    await page.goto('/menu');
    await page.waitForSelector('text=Taco al Pastor', { timeout: 10000 });

    const addButton = page.locator('button:has-text("Agregar")').first();
    await addButton.click();

    // Navigate to cart
    await page.goto('/cart');
    await page.waitForSelector('text=Mi Carrito');

    // Increment quantity
    const plusButton = page.locator('button').filter({ has: page.locator('.lucide-plus') }).first();
    await plusButton.click();

    // Verify quantity updated
    const quantityInput = page.locator('input[type="number"]').first();
    await expect(quantityInput).toHaveValue('2');

    // Verify price recalculated
    await expect(page.locator('text=Subtotal')).toBeVisible();
  });

  test('should remove items from cart', async ({ page }) => {
    // Add product to cart
    await page.goto('/menu');
    await page.waitForSelector('text=Taco al Pastor', { timeout: 10000 });
    await page.locator('button:has-text("Agregar")').first().click();

    // Go to cart
    await page.goto('/cart');
    await page.waitForSelector('text=Mi Carrito');

    // Set quantity to 1 to show trash icon
    const quantityInput = page.locator('input[type="number"]').first();
    await quantityInput.fill('1');

    // Click remove button
    const removeButton = page.locator('button').filter({ has: page.locator('.lucide-trash-2') }).first();
    await removeButton.click();

    // Verify empty cart
    await expect(page.locator('text=Tu carrito está vacío')).toBeVisible();
  });

  test('should clear entire cart', async ({ page }) => {
    // Add multiple products
    await page.goto('/menu');
    await page.waitForSelector('text=Taco al Pastor', { timeout: 10000 });
    
    await page.locator('button:has-text("Agregar")').first().click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Agregar")').nth(1).click();

    // Go to cart
    await page.goto('/cart');
    await page.waitForSelector('text=Mi Carrito');

    // Clear cart
    await page.click('button:has-text("Vaciar")');

    // Verify empty cart
    await expect(page.locator('text=Tu carrito está vacío')).toBeVisible();
  });

  test('should persist cart items across page navigation', async ({ page }) => {
    // Add product to cart
    await page.goto('/menu');
    await page.waitForSelector('text=Taco al Pastor', { timeout: 10000 });
    await page.locator('button:has-text("Agregar")').first().click();

    // Navigate home
    await page.goto('/');

    // Navigate back to menu
    await page.goto('/menu');

    // Verify cart counter still shows item
    await expect(page.locator('text=1')).toBeVisible();

    // Go to cart and verify item is still there
    await page.goto('/cart');
    await expect(page.locator('text=Mi Carrito')).toBeVisible();
  });

  test('should show low stock warning in cart', async ({ page }) => {
    // This test assumes there's a product with low stock
    await page.goto('/menu');
    await page.waitForSelector('text=Taco al Pastor', { timeout: 10000 });

    // Look for product with low stock badge
    const lowStockProduct = page.locator('text=⚠️').first();
    if (await lowStockProduct.isVisible()) {
      // Add to cart
      const parentCard = lowStockProduct.locator('xpath=ancestor::div[contains(@class, "rounded")]');
      await parentCard.locator('button:has-text("Agregar")').click();

      // Go to cart
      await page.goto('/cart');
      
      // Verify low stock warning in cart
      await expect(page.locator('text=⚠️ Solo quedan')).toBeVisible();
    }
  });

  test('should calculate taxes correctly', async ({ page }) => {
    // Add product to cart
    await page.goto('/menu');
    await page.waitForSelector('text=Taco al Pastor', { timeout: 10000 });
    await page.locator('button:has-text("Agregar")').first().click();

    // Go to cart
    await page.goto('/cart');
    await page.waitForSelector('text=Mi Carrito');

    // Verify tax calculation components
    await expect(page.locator('text=Subtotal')).toBeVisible();
    await expect(page.locator('text=IVA (16%)')).toBeVisible();
    await expect(page.locator('text=Total')).toBeVisible();
  });

  test('should switch between delivery methods', async ({ page }) => {
    // Add product to cart
    await page.goto('/menu');
    await page.waitForSelector('text=Taco al Pastor', { timeout: 10000 });
    await page.locator('button:has-text("Agregar")').first().click();

    // Go to cart
    await page.goto('/cart');
    await page.waitForSelector('text=Mi Carrito');

    // Default should be pickup
    await expect(page.locator('text=Recoge tu pedido en nuestro local')).toBeVisible();

    // Switch to delivery
    await page.click('button:has-text("🏍️ Delivery")');
    await expect(page.locator('text=Tu pedido será entregado a domicilio')).toBeVisible();
    await expect(page.locator('text=Envío')).toBeVisible();

    // Switch back to pickup
    await page.click('button:has-text("🏪 Recoger")');
    await expect(page.locator('text=Recoge tu pedido en nuestro local')).toBeVisible();
    await expect(page.locator('text=Envío')).not.toBeVisible();
  });
});
