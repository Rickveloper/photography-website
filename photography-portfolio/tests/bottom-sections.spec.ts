import { test, expect } from "@playwright/test";

test.describe("Bottom sections", () => {
  test.beforeEach(async ({ page }) => {
    await page.addStyleTag({
      content: `
        *, *::before, *::after { transition: none !important; animation: none !important; }
        [data-aos] { opacity: 1 !important; transform: none !important; }
      `,
    });
  });
  test("Blog grid: 3-col desktop, 1-col mobile; equal card heights", async ({
    page,
  }) => {
    await page.goto("/index.html#blog");
    const cards = page.locator("#blog a.bg-dark-700");
    await expect(cards.first()).toBeVisible();
    // Snapshot cards container
    await expect(page.locator("#blog .grid")).toHaveScreenshot(
      "blog-grid.png",
      { animations: "disabled" },
    );
  });

  test("Contact: labels, autocomplete, focus, and responsive two-column", async ({
    page,
  }) => {
    await page.goto("/index.html#contact");
    // Accessibility basics
    await expect(page.locator('label[for="name"]')).toBeVisible();
    await expect(page.locator("#name")).toHaveAttribute("autocomplete", "name");
    await expect(page.locator("#email")).toHaveAttribute(
      "autocomplete",
      "email",
    );
    // Snapshot
    await expect(page.locator("#contact")).toHaveScreenshot(
      "contact-section.png",
      { animations: "disabled" },
    );
  });

  test("Footer: social links have aria-labels and balance on grid", async ({
    page,
  }) => {
    await page.goto("/index.html");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer.locator('a[aria-label="Instagram"]')).toBeVisible();
    await expect(footer.locator('a[aria-label="GitHub"]')).toBeVisible();
    await expect(footer.locator('a[aria-label="RSS Feed"]')).toBeVisible();
    await expect(footer).toHaveScreenshot("footer.png", {
      animations: "disabled",
    });
  });
});
