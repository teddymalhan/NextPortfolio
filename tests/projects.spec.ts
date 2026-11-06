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

test("PallasDB card crops its banner across the card's content width", async ({ page }) => {
  await page.goto("/");
  const card = page.locator('a[href="/projects/pallasdb"]');
  const image = card.getByRole("img", { name: "PallasDB" });
  await expectLoadedImage(image);

  const imageBox = await image.boundingBox();
  const headingBox = await card.getByRole("heading", { name: "PallasDB", exact: true }).boundingBox();
  if (!imageBox || !headingBox) throw new Error("PallasDB card has no layout box");
  expect(imageBox.x).toBeLessThan(headingBox.x);
  expect(imageBox.x + imageBox.width).toBeGreaterThan(headingBox.x + headingBox.width);
  expect(imageBox.y + imageBox.height).toBeLessThanOrEqual(headingBox.y);

  const presentation = await image.evaluate((element: HTMLImageElement) => ({
    fit: getComputedStyle(element).objectFit,
    sourceRatio: element.naturalWidth / element.naturalHeight,
  }));
  expect(presentation.fit).toBe("cover");
  expect(imageBox.width / imageBox.height).toBeLessThan(presentation.sourceRatio);
});

test("PallasDB detail displays the complete banner in a four-to-one area", async ({ page }) => {
  await page.goto("/projects/pallasdb");
  const image = page.getByRole("img", { name: "PallasDB", exact: true });
  await expectLoadedImage(image);
  const box = await image.boundingBox();
  if (!box) throw new Error("PallasDB detail banner has no layout box");
  expect(box.width / box.height).toBeCloseTo(4, 1);
  expect(await image.evaluate((element) => getComputedStyle(element).objectFit)).toBe("contain");
});
