import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:3000")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Open the '/client/requests' page and verify the sign-in page is displayed.
        await page.goto("http://localhost:3000/client/requests")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # --> Assertions to verify final state
        
        # --> An unauthenticated visitor to /client/requests was redirected to the sign-in page.
        # Assert-outcome: passed
        # Assert: The browser was redirected to a login URL with the next parameter.
        await expect(page).to_have_url(re.compile("/login\\?next=%2Fclient%2Frequests"), timeout=15000), "The browser was redirected to a login URL with the next parameter."
        # Assert-outcome: passed
        # Assert: The sign-in button 'Continue with Google' is visible on the page.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/button").nth(0)).to_have_text("Continue with Google", timeout=15000), "The sign-in button 'Continue with Google' is visible on the page."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    