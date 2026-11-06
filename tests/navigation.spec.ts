import { expect, test } from "@playwright/test";

test("project Back restores the homepage reading position", async ({ page }) => {
  await page.goto("/");
  const cardTitle = page.getByRole("heading", { name: "PallasDB", exact: true });
  await cardTitle.scrollIntoViewIfNeeded();
  const savedPosition = await page.evaluate(() => window.scrollY);
  await cardTitle.click();
  await expect(page).toHaveURL(/\/projects\/pallasdb$/);
  await expect(page.getByRole("heading", { level: 1, name: "PallasDB" })).toBeVisible();

  await page.getByRole("button", { name: "Back to home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(cardTitle).toBeVisible();
  await expect.poll(async () => Math.abs(await page.evaluate(() => window.scrollY) - savedPosition)).toBeLessThan(3);
});

test("direct detail entry can return home without saved navigation state", async ({ page }) => {
  await page.goto("/projects/pallasdb");
  await page.getByRole("button", { name: "Back to home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1, name: /i'm teddy/ })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test("command navigation and mobile navigation reach their sections", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Search website/ }).click();
  const dialog = page.getByRole("dialog", { name: "Search Portfolio" });
  await dialog.getByRole("combobox").fill("Projects");
  await dialog.getByRole("option", { name: "Projects", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeInViewport();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  const mobile = page.getByRole("navigation", { name: "Mobile navigation" });
  await mobile.getByRole("button", { name: "about me", exact: true }).click();
  await expect(page.getByRole("button", { name: "Open menu", exact: true })).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#about")).toBeInViewport();
});

test("modified project clicks retain native new-tab behavior", async ({ page, context }) => {
  await page.goto("/");
  const opened = context.waitForEvent("page");
  await page.getByRole("heading", { name: "PallasDB", exact: true }).click({ modifiers: [process.platform === "darwin" ? "Meta" : "Control"] });
  const detail = await opened;
  await expect(detail).toHaveURL(/\/projects\/pallasdb$/);
  await expect(page).toHaveURL(/\/$/);
  await detail.close();
});
