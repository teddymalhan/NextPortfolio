import { expect, test } from "@playwright/test";
import { getProjectBySlug } from "../lib/projects";
import { explainTechnicalTerms } from "../lib/technical-terms";

const examples = [
  {
    slug: "cloudreaper-alerts",
    term: "EventBridge",
    title: "Amazon EventBridge",
    explanation: "its schedule starts a scan every 15 minutes",
  },
  {
    slug: "pallasdb",
    term: "SSTables",
    title: "SSTables",
    explanation: "immutable files containing sorted keys and values",
  },
  {
    slug: "argus",
    term: "Rank IC",
    title: "Rank IC",
    explanation: "compares rankings rather than raw values",
  },
  {
    slug: "digital-scorecards",
    term: "WebSocket",
    title: "WebSocket",
    explanation: "push dashboard updates without requiring a page refresh",
  },
];

for (const example of examples) {
  test(`${example.slug} explains ${example.term} on hover`, async ({ page }) => {
    await page.goto(`/projects/${example.slug}`);
    const trigger = page.getByRole("button", { name: example.term, exact: true }).first();
    const card = page.getByRole("tooltip", { name: example.title, exact: true });

    await trigger.scrollIntoViewIfNeeded();
    await expect(trigger.locator("xpath=ancestor::section")).toHaveCSS("transform", "none");
    await expect(card).not.toBeVisible();
    await trigger.hover();
    await expect(card).toBeVisible();
    await expect(card).toContainText(example.explanation);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const image = card.getByRole("img");
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) =>
      element.complete && element.naturalWidth > 0
    )).toBe(true);
    const imageBox = await image.boundingBox();
    const textBox = await card.locator("p").first().boundingBox();
    if (!imageBox || !textBox) throw new Error("Image or explanation has no layout box");
    expect(imageBox.y + imageBox.height).toBeLessThanOrEqual(textBox.y);

    // Reading the card must not dismiss it when leaving the inline term.
    await card.hover();
    await expect(card).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(card).not.toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
}

test("keyboard readers can open, dismiss, and move between explanations", async ({ page }) => {
  await page.goto("/projects/cloudreaper-alerts");
  const section = page.locator("#detection-and-delivery");
  const eventBridge = section.getByRole("button", { name: "EventBridge", exact: true });
  const lambda = section.getByRole("button", { name: "Lambda", exact: true });
  const card = page.getByRole("tooltip", { name: "Amazon EventBridge" });

  await eventBridge.focus();
  await expect(card).toBeVisible();
  const descriptionId = await eventBridge.getAttribute("aria-describedby");
  expect(descriptionId).toBeTruthy();
  await expect(page.locator(`[id="${descriptionId}"]`)).toContainText("starts a scan every 15 minutes");

  await page.keyboard.press("Escape");
  await expect(card).not.toBeVisible();
  await expect(eventBridge).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(card).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(lambda).toBeFocused();
  await expect(card).not.toBeVisible();
  await expect(page.getByRole("tooltip", { name: "AWS Lambda", exact: true })).toBeVisible();
});

test("only the first mention in a section is annotated without changing prose", async ({ page }) => {
  await page.goto("/projects/pallasdb");
  const section = page.locator("#distributed-operation");
  await expect(section.getByRole("button", { name: "Raft", exact: true })).toHaveCount(1);
  await expect(section.getByRole("button", { name: "HashiCorp Raft", exact: true })).toHaveCount(0);
  await expect(section.locator("p").first()).toHaveText(
    getProjectBySlug("pallasdb")!.sections.find(
      (content) => content.title === "Distributed operation"
    )!.paragraphs[0]
  );
  await section.getByRole("button", { name: "Raft", exact: true }).hover();
  await expect(page.getByRole("tooltip", { name: "Raft consensus" })).toContainText("keep cluster writes consistent");
});

test("switching terms shows the matching explanation, not stale content", async ({ page }) => {
  await page.goto("/projects/cloudreaper-alerts");
  const section = page.locator("#detection-and-delivery");
  await section.getByRole("button", { name: "EventBridge", exact: true }).hover();
  await expect(page.getByRole("tooltip", { name: "Amazon EventBridge" })).toBeVisible();
  await section.getByRole("button", { name: "SQS", exact: true }).hover();
  await expect(page.getByRole("tooltip", { name: "Amazon EventBridge" })).not.toBeVisible();
  await expect(page.getByRole("tooltip", { name: "Amazon SQS" })).toContainText("buffers CloudReaper's findings");
});

test.describe("touch explanations", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test("tap opens a readable card within the viewport and tapping outside dismisses it", async ({ page }) => {
    await page.goto("/projects/cloudreaper-alerts");
    const trigger = page.getByRole("button", { name: "EventBridge", exact: true });
    const card = page.getByRole("tooltip", { name: "Amazon EventBridge" });

    await trigger.tap();
    await expect(card).toBeVisible();
    await expect(card).toContainText("starts a scan every 15 minutes");
    const box = await card.boundingBox();
    if (!box) throw new Error("Touch explanation has no layout box");
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(844);

    await page.locator("#detection-and-delivery h2").tap();
    await expect(card).not.toBeVisible();
  });
});

test("explanations remain usable in both themes with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  await page.goto("/projects/cloudreaper-alerts");
  const trigger = page.getByRole("button", { name: "EventBridge", exact: true });
  const card = page.getByRole("tooltip", { name: "Amazon EventBridge" });

  await trigger.hover();
  await expect(card).toBeVisible();
  await expect(page.locator("#detection-and-delivery")).toHaveCSS("opacity", "1");
  await expect(card).toHaveCSS("animation-name", "none");
  const lightColor = await card.evaluate((element) => getComputedStyle(element).color);

  await page.keyboard.press("Escape");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.mouse.move(0, 0);
  await trigger.hover();
  await expect(card).toBeVisible();
  await expect(card).toHaveCSS("animation-name", "none");
  const darkColor = await card.evaluate((element) => getComputedStyle(element).color);
  expect(darkColor).not.toBe(lightColor);
});

test("project images warm in the background without loading unrelated images", async ({ page }) => {
  const requestedImages = new Set<string>();
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/technical-terms/")) requestedImages.add(path);
  });

  await page.goto("/");
  await expect(page.locator('a[href="/projects/cloudreaper-alerts"]')).toBeVisible();
  expect([...requestedImages]).toEqual([]);

  const expectedImages = new Set<string>();
  for (const section of getProjectBySlug("cloudreaper-alerts")!.sections) {
    const seen = new Set<string>();
    for (const text of [...section.paragraphs, ...(section.bullets ?? [])]) {
      for (const part of explainTechnicalTerms(text, seen)) {
        if (typeof part !== "string") expectedImages.add(part.term.image.src);
      }
    }
  }

  await page.locator('a[href="/projects/cloudreaper-alerts"]').click();
  await expect(page).toHaveURL(/\/projects\/cloudreaper-alerts$/);
  await expect(page.getByRole("heading", { name: "CloudReaper Alerts", exact: true })).toBeVisible();
  await expect.poll(() => [...requestedImages].sort()).toEqual([...expectedImages].sort());
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

for (const interaction of ["hover", "focus"] as const) {
  test(`${interaction} bypasses a stalled background image without blocking the description`, async ({ page }) => {
    const requestedImages: string[] = [];
    const { promise: stalled, resolve: releaseBackground } = Promise.withResolvers<void>();
    await page.route("**/technical-terms/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      requestedImages.push(path);
      if (path === "/technical-terms/ec2.svg") await stalled;
      await route.continue();
    });

    try {
      await page.goto("/projects/cloudreaper-alerts", { waitUntil: "load" });
      await expect(page.getByRole("heading", { name: "CloudReaper Alerts", exact: true })).toBeVisible();
      await expect.poll(() => requestedImages).toEqual(["/technical-terms/ec2.svg"]);

      const trigger = page.getByRole("button", { name: "SQS", exact: true });
      await trigger[interaction]();
      const card = page.getByRole("tooltip", { name: "Amazon SQS", exact: true });
      await expect(card).toBeVisible();
      await expect(card).toContainText("buffers CloudReaper's findings");
      await expect.poll(() => card.getByRole("img").evaluate((image: HTMLImageElement) =>
        image.complete && image.naturalWidth > 0
      )).toBe(true);
      expect([...new Set(requestedImages)]).toEqual([
        "/technical-terms/ec2.svg",
        "/technical-terms/sqs.svg",
      ]);
    } finally {
      releaseBackground();
    }
  });
}

test("leaving a project stops its queued image downloads", async ({ page }) => {
  const requestedImages: string[] = [];
  const { promise: stalled, resolve: releaseBackground } = Promise.withResolvers<void>();
  await page.route("**/technical-terms/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    requestedImages.push(path);
    if (path === "/technical-terms/ec2.svg") await stalled;
    await route.continue();
  });

  try {
    await page.goto("/projects/cloudreaper-alerts");
    await expect.poll(() => requestedImages).toEqual(["/technical-terms/ec2.svg"]);
    await page.getByRole("button", { name: "Back to home" }).click();
    await expect(page).toHaveURL("/");
    releaseBackground();
    await page.locator('a[href="/projects/pallasdb"]').click();
    await expect(page).toHaveURL(/\/projects\/pallasdb$/);
    await expect.poll(() => requestedImages.includes("/technical-terms/serf.svg")).toBe(true);
    expect(requestedImages.filter((path) =>
      ["/technical-terms/cli.svg", "/technical-terms/cloudformation.svg", "/technical-terms/eventbridge.svg"].includes(path)
    )).toEqual([]);
  } finally {
    releaseBackground();
  }
});

test.describe("term image coverage", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  for (const { slug } of examples) {
    test(`${slug} displays a working image for every explained term`, async ({ page }) => {
      const project = getProjectBySlug(slug)!;
      const images = new Map<string, { text: string; title: string }>();
      for (const section of project.sections) {
        const seen = new Set<string>();
        for (const text of [...section.paragraphs, ...(section.bullets ?? [])]) {
          for (const part of explainTechnicalTerms(text, seen)) {
            if (typeof part !== "string") {
              images.set(part.term.image.src, { text: part.text, title: part.term.title });
            }
          }
        }
      }

      await page.goto(`/projects/${slug}`);
      for (const { text, title } of images.values()) {
        const trigger = page.getByRole("button", { name: text, exact: true }).first();
        await trigger.scrollIntoViewIfNeeded();
        await trigger.focus();
        const card = page.getByRole("tooltip", { name: title, exact: true });
        const image = card.getByRole("img");
        await expect(card).toBeVisible();
        await expect.poll(() => image.evaluate((element: HTMLImageElement) =>
          element.complete && element.naturalWidth > 0
        )).toBe(true);
        await page.keyboard.press("Escape");
        await expect(card).not.toBeVisible();
      }
    });
  }
});
