import { expect, test } from "@playwright/test";

for (const [name, href, title, imageName, description] of [
  ["Hacker News", "https://news.ycombinator.com", "Hacker News", "Hacker News logo", "Technology news and discussions from the startup and engineering community."],
  ["X", "https://x.com/teddymalhan", "Teddy on X", "X logo", "Follow @teddymalhan for posts and conversations about technology."],
]) {
  test(`${name} previews without replacing its clickable link`, async ({ page, context }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await context.route(`${href}**`, (route) => route.fulfill({ body: "Destination reached" }));
    await page.goto("/");
    const link = page.locator("#about").getByRole("link", { name, exact: true });
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("target", "_blank");
    await link.scrollIntoViewIfNeeded();
    await link.hover();
    await expect(page.getByText(description, { exact: true })).toBeVisible();
    await expect(page.getByText(title, { exact: true }).last()).toBeVisible();
    const image = page.getByRole("img", { name: imageName, exact: true });
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) =>
      element.complete && element.naturalWidth > 0
    )).toBe(true);
    const popupPromise = page.waitForEvent("popup");
    await link.click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    await popup.close();
  });
}
