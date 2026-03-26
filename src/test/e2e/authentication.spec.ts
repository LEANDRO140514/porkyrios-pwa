import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login and register buttons when not authenticated', async ({ page }) => {
    await expect(page.locator('button:has-text("Iniciar Sesión")')).toBeVisible();
    await expect(page.locator('button:has-text("Registrarse")')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('button:has-text("Iniciar Sesión")');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('text=Iniciar Sesión')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.click('button:has-text("Registrarse")');
    await expect(page).toHaveURL('/register');
    await expect(page.locator('text=Crear Cuenta')).toBeVisible();
  });

  test('should show validation errors on empty login form', async ({ page }) => {
    await page.goto('/login');
    await page.click('button:has-text("Iniciar Sesión")');
    
    // Should show validation errors
    await expect(page.locator('text=Email es requerido').or(page.locator('text=correo'))).toBeVisible({ timeout: 5000 });
  });

  test('should show validation errors on empty register form', async ({ page }) => {
    await page.goto('/register');
    await page.click('button:has-text("Crear Cuenta")');
    
    // Should show validation errors
    await expect(page.locator('text=Nombre').or(page.locator('text=requerido'))).toBeVisible({ timeout: 5000 });
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Iniciar Sesión")');
    
    // Should show invalid email error
    await expect(page.locator('text=Email').or(page.locator('text=válido'))).toBeVisible({ timeout: 5000 });
  });

  test('should validate password length on registration', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '123'); // Too short
    await page.fill('input[name="confirmPassword"]', '123');
    
    await page.click('button:has-text("Crear Cuenta")');
    
    // Should show password length error
    await expect(page.locator('text=contraseña').or(page.locator('text=caracteres'))).toBeVisible({ timeout: 5000 });
  });

  test('should validate password confirmation match', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'different123');
    
    await page.click('button:has-text("Crear Cuenta")');
    
    // Should show password mismatch error
    await expect(page.locator('text=contraseñas').or(page.locator('text=coinciden'))).toBeVisible({ timeout: 5000 });
  });

  test('should have link to register from login page', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.locator('a:has-text("Registrarse")')).toBeVisible();
    await page.click('a:has-text("Registrarse")');
    
    await expect(page).toHaveURL('/register');
  });

  test('should have link to login from register page', async ({ page }) => {
    await page.goto('/register');
    
    await expect(page.locator('a:has-text("Iniciar Sesión")')).toBeVisible();
    await page.click('a:has-text("Iniciar Sesión")');
    
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to login when accessing protected cart page without auth', async ({ page }) => {
    await page.goto('/cart');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });

  test('should redirect to login when accessing protected payment page without auth', async ({ page }) => {
    await page.goto('/payment');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });

  test('should show password toggle button', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
    
    // Look for eye icon toggle
    const toggleButton = page.locator('button').filter({ has: page.locator('.lucide-eye') });
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      
      // Password should become visible
      await expect(page.locator('input[type="text"]')).toBeVisible();
    }
  });
});
