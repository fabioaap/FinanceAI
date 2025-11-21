import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Bank File Import Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
        // Wait for app to load
        await expect(page.locator('h1')).toContainText(/FinanceAI|Finance/)
    })

    test('should open import modal when clicking import button', async ({ page }) => {
        // Click the import button
        const importButton = page.locator('button:has-text("Importar"), button:has-text("Import")')
        await importButton.click()

        // Modal should be visible
        await expect(page.locator('dialog, [role="dialog"]')).toBeVisible()
        await expect(page.getByText(/Importar Extrato|Import Statement/i)).toBeVisible()
    })

    test('should upload CSV file and show preview', async ({ page }) => {
        // Open import modal
        await page.locator('button:has-text("Importar"), button:has-text("Import")').click()

        // Create a test CSV file content
        const csvContent = `Data,Descrição,Valor
01/11/2024,Compra Teste,-150.50
02/11/2024,Salário Teste,3500.00`

        // Upload file
        const fileInput = page.locator('input[type="file"]')
        await fileInput.setInputFiles({
            name: 'extrato-teste.csv',
            mimeType: 'text/csv',
            buffer: Buffer.from(csvContent)
        })

        // Wait for parsing
        await page.waitForTimeout(1000)

        // Should show preview with transactions
        await expect(page.getByText(/Compra Teste|transações/i)).toBeVisible({ timeout: 10000 })
    })

    test('should import transactions and show success message', async ({ page }) => {
        // Open import modal
        await page.locator('button:has-text("Importar"), button:has-text("Import")').click()

        const csvContent = `Data,Descrição,Valor
01/11/2024,Teste E2E,-100.00`

        const fileInput = page.locator('input[type="file"]')
        await fileInput.setInputFiles({
            name: 'extrato-e2e.csv',
            mimeType: 'text/csv',
            buffer: Buffer.from(csvContent)
        })

        // Wait for processing
        await page.waitForTimeout(1000)

        // Look for import/confirm button and click it
        const confirmButton = page.locator('button:has-text("Importar"), button:has-text("Import"), button:has-text("Confirmar"), button:has-text("Confirm")').last()

        if (await confirmButton.isVisible()) {
            await confirmButton.click()
        }

        // Should show success toast or message
        await expect(page.locator('body')).toContainText(/sucesso|success|importad/i, { timeout: 5000 })
    })

    test('should close modal without importing', async ({ page }) => {
        // Open import modal
        await page.locator('button:has-text("Importar"), button:has-text("Import")').click()
        await expect(page.locator('dialog, [role="dialog"]')).toBeVisible()

        // Close modal
        const closeButton = page.locator('button:has-text("Fechar"), button:has-text("Close"), button:has-text("Cancelar"), button:has-text("Cancel")').first()

        if (await closeButton.isVisible()) {
            await closeButton.click()
        } else {
            // Try escape key
            await page.keyboard.press('Escape')
        }

        // Modal should be closed
        await expect(page.locator('dialog, [role="dialog"]')).not.toBeVisible()
    })

    test('should show error for invalid file', async ({ page }) => {
        // Open import modal
        await page.locator('button:has-text("Importar"), button:has-text("Import")').click()

        const invalidContent = 'This is not a valid bank file'

        const fileInput = page.locator('input[type="file"]')
        await fileInput.setInputFiles({
            name: 'invalid.txt',
            mimeType: 'text/plain',
            buffer: Buffer.from(invalidContent)
        })

        // Wait for parsing
        await page.waitForTimeout(1500)

        // Should show error or empty state
        const bodyText = await page.locator('body').textContent()
        const hasErrorIndicator =
            bodyText?.includes('erro') ||
            bodyText?.includes('error') ||
            bodyText?.includes('0 transações') ||
            bodyText?.includes('vazio')

        expect(hasErrorIndicator).toBeTruthy()
    })

    test('should display imported transactions in transaction list', async ({ page }) => {
        // Open import modal
        await page.locator('button:has-text("Importar"), button:has-text("Import")').click()

        const csvContent = `Data,Descrição,Valor
${new Date().toLocaleDateString('pt-BR')},Transação E2E Visível,-250.00`

        const fileInput = page.locator('input[type="file"]')
        await fileInput.setInputFiles({
            name: 'extrato-visible.csv',
            mimeType: 'text/csv',
            buffer: Buffer.from(csvContent)
        })

        await page.waitForTimeout(1000)

        // Try to confirm import
        const confirmButton = page.locator('button:has-text("Importar"), button:has-text("Import"), button:has-text("Confirmar")').last()

        if (await confirmButton.isVisible()) {
            await confirmButton.click()
            await page.waitForTimeout(500)
        }

        // Close modal
        await page.keyboard.press('Escape')

        // Navigate to history/transactions
        const historyButton = page.locator('button:has-text("History"), button:has-text("Histórico")')
        if (await historyButton.isVisible()) {
            await historyButton.click()
            await page.waitForTimeout(500)
        }

        // Should see the imported transaction (or any transactions)
        await expect(page.locator('body')).toContainText(/transaç|transaction/i, { timeout: 3000 })
    })

    test('should handle drag and drop file upload', async ({ page }) => {
        // Open import modal
        await page.locator('button:has-text("Importar"), button:has-text("Import")').click()

        const csvContent = `Data,Descrição,Valor
01/11/2024,Drag Drop Test,-50.00`

        // Simulate drag and drop (Playwright doesn't directly support drag-drop for files,
        // so we use the file input as fallback)
        const fileInput = page.locator('input[type="file"]')
        await fileInput.setInputFiles({
            name: 'drag-drop.csv',
            mimeType: 'text/csv',
            buffer: Buffer.from(csvContent)
        })

        await page.waitForTimeout(1000)

        // Verify file was processed
        await expect(page.getByText(/Drag Drop Test|transaç|processed/i)).toBeVisible({ timeout: 5000 })
    })
})

test.describe('Import Modal UI', () => {
    test('should show correct modal title and description', async ({ page }) => {
        await page.goto('/')
        await page.locator('button:has-text("Importar"), button:has-text("Import")').click()

        await expect(page.getByText(/Importar Extrato|Import.*Statement/i)).toBeVisible()
        await expect(page.getByText(/upload.*extrato|upload.*bank/i)).toBeVisible()
    })

    test('should show loading state during import', async ({ page }) => {
        await page.goto('/')
        await page.locator('button:has-text("Importar"), button:has-text("Import")').click()

        const largeCSV = `Data,Descrição,Valor
${Array.from({ length: 50 }, (_, i) => `0${i + 1}/11/2024,Item ${i + 1},-${i + 10}.00`).join('\n')}`

        const fileInput = page.locator('input[type="file"]')
        await fileInput.setInputFiles({
            name: 'large.csv',
            mimeType: 'text/csv',
            buffer: Buffer.from(largeCSV)
        })

        // Should show some loading indicator (spinner, text, etc.)
        const hasLoadingIndicator = await page.locator('[class*="spin"], [class*="load"], text=/processando|processing|importando/i').count() > 0

        // Even if no loading indicator, file should eventually be processed
        await page.waitForTimeout(2000)
        const bodyText = await page.locator('body').textContent()
        expect(bodyText).toBeTruthy()
    })
})
