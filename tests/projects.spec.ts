import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

async function expectLoadedImage(image: Locator) {
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate((element: HTMLImageElement) =>
        element.complete && element.naturalWidth > 0
      )
    )
    .toBe(true);
}

test("PallasDB card eagerly loads a full-bleed banner", async ({ page }) => {
  await page.goto("/");

  const card = page.locator('a[href="/projects/pallasdb"]');
  const image = card.getByRole("img", { name: "PallasDB" });
  const imageFrame = image.locator("..");

  await expect(image).toHaveAttribute("loading", "eager");
  await expect(image).toHaveClass(/object-cover/);
  await expectLoadedImage(image);

  const [imageBox, frameBox] = await Promise.all([
    image.boundingBox(),
    imageFrame.boundingBox(),
  ]);

  if (!imageBox || !frameBox) {
    throw new Error("PallasDB card banner has no layout box");
  }

  expect(imageBox.width).toBe(frameBox.width);
  expect(imageBox.height).toBe(frameBox.height);
});

test("PallasDB detail page preserves the banner aspect ratio", async ({ page }) => {
  await page.goto("/projects/pallasdb");

  const image = page.getByRole("img", { name: "PallasDB" });
  const imageFrame = image.locator("..");

  await expectLoadedImage(image);
  await expect(image).toHaveClass(/object-contain/);
  await expect
    .poll(() => imageFrame.evaluate((element) => getComputedStyle(element).aspectRatio))
    .toBe("4 / 1");

  const [imageBox, frameBox] = await Promise.all([
    image.boundingBox(),
    imageFrame.boundingBox(),
  ]);

  if (!imageBox || !frameBox) {
    throw new Error("PallasDB detail banner has no layout box");
  }

  expect(imageBox.width).toBe(frameBox.width);
  expect(imageBox.height).toBe(frameBox.height);
});

test("theme toggle changes a system theme on every click", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");

  const root = page.locator("html");
  const toggle = page
    .getByRole("button", { name: /Switch to (light|dark) theme/ })
    .first();

  await expect(root).toHaveClass(/dark/);
  for (const shouldBeDark of [false, true, false, true, false]) {
    await toggle.click();
    if (shouldBeDark) {
      await expect(root).toHaveClass(/dark/);
    } else {
      await expect(root).not.toHaveClass(/dark/);
    }
  }
});
