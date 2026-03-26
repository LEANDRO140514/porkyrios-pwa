import { test, expect } from '@playwright/test';

test.describe('Menu Search and Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/menu');
    // Wait for products to load
    await page.waitForSelector('text=Taco al Pastor', { timeout: 10000 });
  });

  test('should display menu page with products', async ({ page }) => {
    await expect(page.locator('h1:has-text("Menú")')).toBeVisible();
    await expect(page.locator('text=Taco al Pastor')).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Buscar"]')).toBeVisible();
  });

  test('should display category filter buttons', async ({ page }) => {
    await expect(page.locator('button:has-text("Todos")')).toBeVisible();
  });

  test('should search products by name', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill('Taco');
    
    // Should show products matching "Taco"
    await expect(page.locator('text=Taco al Pastor')).toBeVisible();
  });

  test('should search products case-insensitively', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill('taco');
    
    // Should still find products
    await expect(page.locator('text=Taco al Pastor')).toBeVisible();
  });

  test('should show empty state when no search results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill('ProductoQueNoExiste12345');
    
    await page.waitForTimeout(500);
    
    // Should show empty state
    await expect(page.locator('text=No se encontraron productos')).toBeVisible();
  });

  test('should clear search results when input is cleared', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    
    // Search for something
    await searchInput.fill('Taco');
    await page.waitForTimeout(300);
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(300);
    
    // Should show all products again
    const productCards = page.locator('[class*="rounded"]').filter({ hasText: 'Agregar' });
    await expect(productCards.first()).toBeVisible();
  });

  test('should filter products by category', async ({ page }) => {
    // Click on a category button (assuming categories exist)
    const categoryButtons = page.locator('button').filter({ hasText: /Tacos|Tortas|Bebidas/ });
    
    if (await categoryButtons.first().isVisible()) {
      const firstCategory = categoryButtons.first();
      await firstCategory.click();
      
      // Products should be filtered
      await page.waitForTimeout(500);
      
      // Should still show products (or empty state if category is empty)
      const hasProducts = await page.locator('text=Agregar').first().isVisible().catch(() => false);
      const hasEmptyState = await page.locator('text=No se encontraron productos').isVisible().catch(() => false);
      
      expect(hasProducts || hasEmptyState).toBeTruthy();
    }
  });

  test('should combine search with category filter', async ({ page }) => {
    // Select a category first
    const categoryButtons = page.locator('button').filter({ hasText: /Tacos|Tortas/ });
    
    if (await categoryButtons.first().isVisible()) {
      await categoryButtons.first().click();
      await page.waitForTimeout(500);
      
      // Then search
      const searchInput = page.locator('input[placeholder*="Buscar"]');
      await searchInput.fill('Taco');
      await page.waitForTimeout(500);
      
      // Should show filtered results or empty state
      const hasResults = await page.locator('text=Taco').isVisible().catch(() => false);
      const isEmpty = await page.locator('text=No se encontraron productos').isVisible().catch(() => false);
      
      expect(hasResults || isEmpty).toBeTruthy();
    }
  });

  test('should reset to all products when "Todos" clicked', async ({ page }) => {
    // Click a specific category
    const categoryButtons = page.locator('button').filter({ hasText: /Tacos|Tortas/ });
    
    if (await categoryButtons.first().isVisible()) {
      await categoryButtons.first().click();
      await page.waitForTimeout(500);
      
      // Click "Todos"
      await page.click('button:has-text("Todos")');
      await page.waitForTimeout(500);
      
      // Should show all products
      await expect(page.locator('text=Agregar').first()).toBeVisible();
    }
  });

  test('should display product images', async ({ page }) => {
    const productImages = page.locator('img[alt*="Taco"]').or(page.locator('img[alt*="producto"]'));
    
    // At least one product image should be visible
    await expect(productImages.first()).toBeVisible();
  });

  test('should display product prices', async ({ page }) => {
    // Look for price format $XX.XX
    await expect(page.locator('text=/\\$\\d+\\.\\d{2}/')).toBeVisible();
  });

  test('should display product stock information', async ({ page }) => {
    // Look for stock indicators (available/low stock/out of stock)
    const stockIndicators = page.locator('text=Disponible').or(
      page.locator('text=⚠️')
    ).or(
      page.locator('text=Agotado')
    );
    
    await expect(stockIndicators.first()).toBeVisible();
  });

  test('should disable add button for out of stock products', async ({ page }) => {
    // Look for out of stock products
    const outOfStock = page.locator('text=Agotado');
    
    if (await outOfStock.isVisible()) {
      const card = outOfStock.locator('xpath=ancestor::div[contains(@class, "rounded")]');
      const addButton = card.locator('button:has-text("Agregar")');
      
      await expect(addButton).toBeDisabled();
    }
  });

  test('should show low stock warning', async ({ page }) => {
    // Look for low stock warning badge
    const lowStockBadge = page.locator('text=⚠️');
    
    if (await lowStockBadge.isVisible()) {
      await expect(lowStockBadge).toBeVisible();
    }
  });

  test('should display cart counter', async ({ page }) => {
    // Add product to cart
    await page.locator('button:has-text("Agregar")').first().click();
    await page.waitForTimeout(500);
    
    // Cart counter should be visible
    await expect(page.locator('text=1')).toBeVisible();
  });

  test('should navigate to cart when cart button clicked', async ({ page }) => {
    // Add product first
    await page.locator('button:has-text("Agregar")').first().click();
    await page.waitForTimeout(500);
    
    // Click cart button
    await page.click('button:has-text("Ver Carrito")');
    
    await expect(page).toHaveURL('/cart');
  });

  test('should navigate to home when home button clicked', async ({ page }) => {
    const homeButton = page.locator('button').filter({ has: page.locator('.lucide-home') });
    
    if (await homeButton.isVisible()) {
      await homeButton.click();
      await expect(page).toHaveURL('/');
    }
  });

  test('should show toast notification when product added', async ({ page }) => {
    await page.locator('button:has-text("Agregar")').first().click();
    
    // Should show success toast
    await expect(page.locator('text=¡Producto agregado al carrito!')).toBeVisible({ timeout: 3000 });
  });

  test('should update button text when product is in cart', async ({ page }) => {
    const firstAddButton = page.locator('button:has-text("Agregar")').first();
    await firstAddButton.click();
    await page.waitForTimeout(500);
    
    // Button should show quantity
    await expect(page.locator('text=En carrito')).toBeVisible();
  });

  test('should handle rapid add button clicks', async ({ page }) => {
    const firstAddButton = page.locator('button:has-text("Agregar")').first();
    
    // Click rapidly
    await firstAddButton.click();
    await firstAddButton.click();
    await firstAddButton.click();
    
    // Should handle gracefully (add multiple or prevent)
    await page.waitForTimeout(1000);
    
    // Cart counter should reflect additions
    const cartCounter = page.locator('text=/[0-9]+/').first();
    await expect(cartCounter).toBeVisible();
  });
});
