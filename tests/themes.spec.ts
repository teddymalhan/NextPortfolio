import { expect, test } from "@playwright/test";

test("theme toggle changes a system theme on every repeated click", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const root = page.locator("html");
  const toggle = page.getByRole("button", { name: /Switch to (light|dark) theme/ }).first();
  await expect(root).toHaveClass(/dark/);
  for (const shouldBeDark of [false, true, false, true]) {
    await toggle.click();
    if (shouldBeDark) await expect(root).toHaveClass(/dark/);
    else await expect(root).not.toHaveClass(/dark/);
    await expect(toggle).toHaveAccessibleName(shouldBeDark ? "Switch to light theme" : "Switch to dark theme");
  }
});

for (const theme of ["light", "dark"] as const) {
  test(`explanations remain readable and keyboard-operable in ${theme} mode with reduced motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme });
    await page.goto("/projects/cloudreaper-alerts");
    await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
    const trigger = page.getByRole("button", { name: "EventBridge", exact: true });
    const card = page.getByRole("tooltip", { name: "Amazon EventBridge", exact: true });
    await trigger.focus();
    await expect(card).toBeVisible();
    const id = await trigger.getAttribute("aria-describedby");
    const description = page.locator(`[id="${id}"]`);
    await expect(description).toHaveText("An AWS service for routing events and scheduling work. In CloudReaper, its schedule starts a scan every 15 minutes without an always-running server.");
    await expect.poll(() => card.evaluate((element, descriptionId) => {
      const text = document.getElementById(descriptionId!);
      if (!text) return false;
      const cardBox = element.getBoundingClientRect();
      const textBox = text.getBoundingClientRect();
      return textBox.x >= cardBox.x && textBox.y >= cardBox.y
        && textBox.right <= cardBox.right && textBox.bottom <= cardBox.bottom
        && text.scrollWidth <= text.clientWidth;
    }, id)).toBe(true);
    await expect.poll(() => card.evaluate((element) => element.getAnimations({ subtree: true })
      .filter((animation) => animation.playState === "running").length)).toBe(0);
    await page.keyboard.press("Escape");
    await expect(card).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(card).toBeVisible();
  });
}
