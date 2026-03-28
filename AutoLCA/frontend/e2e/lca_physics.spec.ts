import { test, expect } from '@playwright/test';

test.describe('Triya.io Physics & Mass Balance Rigidity', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the local dev environment
    await page.goto('http://localhost:3000');
    // Dismiss the Initial Guide Modal
    await page.getByRole('button', { name: 'Start Modelling' }).click();
  });

  test('Scientific Proof: Lead Aerospace Template Cycles Correctly', async ({ page }) => {
    // 1. Open Industry Archetypes Browser
    await page.getByRole('button', { name: 'Browse Industry Archetypes' }).click();
    
    // 2. Select Aerospace Titanium
    await page.getByText('Aerospace: Titanium Supply Chain').click();
    
    // 3. Verify Circular Edge (Swarf Recycling Loop) renders
    const cyclicEdge = page.locator('svg > g.react-flow__edges > path.react-flow__edge-circular');
    await expect(cyclicEdge).toBeVisible();
    await expect(page.getByText('Titanium Swarf Recycling')).toBeVisible();
  });

  test('Thermodynamic Law Enforcer: Sum of Transfer Rates > 1.0 Prohibits LCIA', async ({ page }) => {
    // 1. Select the CNC Milling Node (A3 in template)
    // We'll just click the node with text "CNC Machining"
    await page.getByText('5-Axis CNC Machining').click();
    
    // 2. Open Expert Mode (Analyst / Expert)
    await page.getByRole('button', { name: 'Analyst / Expert' }).click();
    
    // 3. Navigate to MFA Rules tab
    await page.getByRole('button', { name: 'Configure Mass Transfer Coefficients' }).click();
    
    // 4. Locate the Transfer Rate inputs
    // We expect two outputs: Bracket and Swarf.
    // We force a violation: Enter 0.6 into Bracket and 0.5 into Swarf (Sum = 1.1)
    const transferInputs = page.locator('input[step="0.01"]');
    await transferInputs.first().fill('0.6');
    await transferInputs.last().fill('0.5');

    // 5. ASSERT: Red "Mass Balance Violation" warning appears in the Expert Terminal Header
    const violationWarning = page.getByText('⚠️ MASS BALANCE VIOLATION');
    await expect(violationWarning).toBeVisible();
    await expect(violationWarning).toHaveClass(/text-red-400/);

    // 6. ASSERT: The Execute LCIA Computation button in the Left Panel is strictly disabled
    const executeButton = page.getByRole('button', { name: 'PROHIBITED: MASS BALANCE VIOLATION' });
    await expect(executeButton).toBeDisabled();
    
    // 7. ASSERT: Left Panel shows the warning context
    await expect(page.getByText('Computation locked. Resolve mass balance errors')).toBeVisible();

    // 8. CORRECTION: Set back to valid state (0.1 + 0.9 = 1.0)
    await transferInputs.first().fill('0.1');
    await transferInputs.last().fill('0.9');
    
    // 9. ASSERT: Button back to active state
    const restoredButton = page.getByRole('button', { name: 'Execute LCIA Computation' });
    await expect(restoredButton).toBeEnabled();
  });
});
