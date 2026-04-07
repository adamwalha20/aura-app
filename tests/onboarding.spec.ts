import { test, expect } from '@playwright/test';

/**
 * Aura E2E Test Suite
 * Covers the full signup and onboarding journey.
 */
test.describe('Aura Onboarding Flow', () => {

  test('should complete the full signup and onboarding journey successfully', async ({ page }) => {
    const uniqueId = Math.floor(Math.random() * 1000000);
    const testEmail = `seeker_${uniqueId}@aura.sanctuary`;
    const testName = `Aura Seeker ${uniqueId}`;

    // 1. Navigate to the landing/auth page
    await page.goto('/');
    await expect(page).toHaveTitle(/Aura/);

    // 2. Switch to Sign Up mode
    await page.click('button:has-text("Create One")');

    // 3. Fill the Signup Form
    await page.fill('input[placeholder="Elena Vance"]', testName);
    await page.fill('input[placeholder="aura@sanctuary.com"]', testEmail);
    await page.fill('input[placeholder="••••••••"]', 'AuraPeace2026!');

    // 4. Submit Signup
    await page.click('button:has-text("Create Sanctuary")');

    // 5. Onboarding Step 1: Intentions
    // Wait for the Intentions screen to manifest
    await expect(page.locator('h2:has-text("Set Your Intentions")')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("Mindfulness")');
    await page.click('button:has-text("Productivity")');
    await page.click('button:has-text("Continue Journey")');

    // 6. Onboarding Step 2: Essence
    await expect(page.locator('h2:has-text("Your Personal Canvas")')).toBeVisible();
    // Select Skin Type
    await page.click('button:has-text("Normal")');
    // Select Style Vibe
    await page.click('button:has-text("Minimalist")');
    await page.click('button:has-text("Continue Journey")');

    // 7. Onboarding Step 3: Rhythm
    await expect(page.locator('h2:has-text("Your Daily Rhythm")')).toBeVisible();
    await page.click('button:has-text("Morning (6AM - 12PM)")');

    // 8. Finalize Onboarding
    await page.click('button:has-text("Finalize My Aura")');

    // 9. Dashboard Verification
    // The screen should transition to the main sanctuary dashboard
    await expect(page.locator('h2:has-text("Good morning")')).toBeVisible({ timeout: 20000 });

    // 10. Profile Verification
    // We navigate to the Profile tab because the user's name is displayed there
    await page.click('button:has-text("person")');

    // Verify user profile persistence
    await expect(page.locator(`text=${testName}`)).toBeVisible();
    await expect(page.locator('text=LEVEL 1')).toBeVisible();
    await expect(page.getByText(/XP/)).toBeVisible();
  });

});
