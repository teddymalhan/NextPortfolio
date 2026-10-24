import { expect, test } from "@playwright/test";

for (const [name, href, title] of [
  ["Hacker News", "https://news.ycombinator.com", "Hacker News"],
  ["X", "https://x.com/teddymalhan", "Teddy on X"],
]) {
  test(`${name} previews without replacing its clickable link`, async ({ page, context }) => {
    await context.route(`${href}**`, (route) => route.fulfill({ body: "Destination reached" }));
    await page.goto("/");
    const link = page.locator("#about").getByRole("link", { name, exact: true });
    await link.hover();
    await expect(page.locator("#about")).toHaveCSS("transform", "none");
    await link.hover();
    await expect(page.locator('[data-slot="hover-card-content"]')).toContainText(title);
    const image = page.locator('[data-slot="hover-card-content"]').getByRole("img");
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) =>
      element.complete && element.naturalWidth > 0
    )).toBe(true);
    await expect(link).toHaveCSS("cursor", "pointer");
    const popupPromise = page.waitForEvent("popup");
    await link.click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    await popup.close();
  });
}
