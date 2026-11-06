import { expect, test, type Page } from "@playwright/test";
import { termImagePaths } from "./technical-term-fixtures";

declare global {
  interface Window {
    __termPreloads: HTMLImageElement[];
  }
}

async function observePreloads(page: Page) {
  await page.addInitScript(() => {
    const NativeImage = window.Image;
    window.__termPreloads = [];
    function TrackedImage(width?: number, height?: number) {
      const image = new NativeImage(width, height);
      window.__termPreloads.push(image);
      return image;
    }
    TrackedImage.prototype = NativeImage.prototype;
    Object.setPrototypeOf(TrackedImage, NativeImage);
    window.Image = TrackedImage as unknown as typeof Image;
  });
}

const examples = [
  { slug: "cloudreaper-alerts", term: "EventBridge", title: "Amazon EventBridge", explanation: "its schedule starts a scan every 15 minutes" },
  { slug: "pallasdb", term: "SSTables", title: "SSTables", explanation: "immutable files containing sorted keys and values" },
  { slug: "argus", term: "Rank IC", title: "Rank IC", explanation: "compares rankings rather than raw values" },
  { slug: "digital-scorecards", term: "WebSocket", title: "WebSocket", explanation: "push dashboard updates without requiring a page refresh" },
];

for (const example of examples) {
  test(`${example.slug} explains ${example.term} on hover`, async ({ page }) => {
    await page.goto(`/projects/${example.slug}`);
    const trigger = page.getByRole("button", { name: example.term, exact: true }).first();
    const card = page.getByRole("tooltip", { name: example.title, exact: true });

    await expect(card).not.toBeVisible();
    await trigger.hover();
    await expect(card).toBeVisible();
    await expect(card).toContainText(example.explanation);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    if (example.slug === "cloudreaper-alerts") {
      const image = card.getByRole("img");
      await expect(image).toBeVisible();
      await expect.poll(() => image.evaluate((element: HTMLImageElement) =>
        element.complete && element.naturalWidth > 0
      )).toBe(true);
      const descriptionId = await trigger.getAttribute("aria-describedby");
      const description = page.locator(`[id="${descriptionId}"]`);
      const imageBox = await image.boundingBox();
      const textBox = await description.boundingBox();
      if (!imageBox || !textBox) throw new Error("Image or explanation has no layout box");
      expect(imageBox.y + imageBox.height).toBeLessThanOrEqual(textBox.y);
      await card.hover();
      await expect(card).toBeVisible();
    }

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

test("only the first canonical mention in each section is annotated without changing prose", async ({ page }) => {
  await page.goto("/projects/pallasdb");
  const section = page.locator("#distributed-operation");
  await expect(section.getByRole("button", { name: "Raft", exact: true })).toHaveCount(1);
  await expect(section.getByRole("button", { name: "HashiCorp Raft", exact: true })).toHaveCount(0);
  await expect(section.locator("p").first()).toHaveText(
    "The gRPC API exposes Get, Put, Delete, and server-streaming Range operations over Protocol Buffers. In cluster mode, the leader applies writes to the storage engine as Raft commands."
  );
  await expect(page.locator("#overview").getByRole("button", { name: "Raft", exact: true })).toHaveCount(1);
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
    const viewport = page.viewportSize();
    if (!box || !viewport) throw new Error("Touch explanation or viewport has no dimensions");
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    await page.locator("#detection-and-delivery h2").tap();
    await expect(card).not.toBeVisible();
  });
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
  await page.locator('a[href="/projects/cloudreaper-alerts"]').click();
  await expect(page).toHaveURL(/\/projects\/cloudreaper-alerts$/);
  await expect.poll(() => [...requestedImages].sort()).toEqual(termImagePaths("cloudreaper-alerts").sort());
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

for (const interaction of ["hover", "focus", "tap"] as const) {
  test.describe(`${interaction} image intent`, () => {
    if (interaction === "tap") test.use({ hasTouch: true });

    test("bypasses a stalled background image without blocking the description", async ({ page }) => {
      const requestedImages = new Set<string>();
      const { promise: stalled, resolve: releaseBackground } = Promise.withResolvers<void>();
      let blockedImage: string | undefined;
      await page.route("**/technical-terms/**", async (route) => {
        const path = new URL(route.request().url()).pathname;
        requestedImages.add(path);
        if (!blockedImage) {
          blockedImage = path;
          await stalled;
        }
        await route.continue();
      });
      try {
        await page.goto("/projects/cloudreaper-alerts", { waitUntil: "load" });
        await expect.poll(() => requestedImages.size).toBe(1);
        const target = blockedImage === "/technical-terms/sqs.svg"
          ? { term: "EventBridge", title: "Amazon EventBridge", image: "/technical-terms/eventbridge.svg", description: "starts a scan every 15 minutes" }
          : { term: "SQS", title: "Amazon SQS", image: "/technical-terms/sqs.svg", description: "buffers CloudReaper's findings" };
        await page.getByRole("button", { name: target.term, exact: true })[interaction]();
        const card = page.getByRole("tooltip", { name: target.title, exact: true });
        await expect(card).toBeVisible();
        await expect(card).toContainText(target.description);
        await expect.poll(() => card.getByRole("img").evaluate((image: HTMLImageElement) =>
          image.complete && image.naturalWidth > 0
        )).toBe(true);
        expect([...requestedImages].sort()).toEqual([blockedImage, target.image].sort());
      } finally {
        releaseBackground();
      }
    });
  });
}

test("intent promotes an existing background image instead of creating another preload", async ({ page }) => {
  await observePreloads(page);
  const { promise: stalled, resolve: releaseBackground } = Promise.withResolvers<void>();
  let blockedImage: string | undefined;
  await page.route("**/technical-terms/**", async (route) => {
    if (!blockedImage) {
      blockedImage = new URL(route.request().url()).pathname;
      await stalled;
    }
    await route.continue();
  });
  const imageTerms: Record<string, string> = {
    "ec2.svg": "EC2", "cli.svg": "CLI", "cloudformation.svg": "CloudFormation",
    "eventbridge.svg": "EventBridge", "lambda.svg": "Lambda", "cloudtrail.svg": "CloudTrail",
    "sqs.svg": "SQS", "dead-letter-queue.svg": "dead-letter queue",
    "secrets-manager.svg": "AWS Secrets Manager", "terraform.svg": "Terraform",
  };
  try {
    await page.goto("/projects/cloudreaper-alerts");
    await expect.poll(() => blockedImage).toBeTruthy();
    await expect.poll(() => page.evaluate(() => window.__termPreloads.map((image) => image.fetchPriority))).toEqual(["low"]);
    const file = blockedImage!.split("/").pop()!;
    await page.getByRole("button", { name: imageTerms[file], exact: true }).first().focus();
    await expect(page.getByRole("tooltip")).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.__termPreloads.map((image) => image.fetchPriority))).toEqual(["high"]);
    releaseBackground();
    await expect.poll(() => page.evaluate(() => window.__termPreloads.map((image) => new URL(image.src).pathname).sort()))
      .toEqual(termImagePaths("cloudreaper-alerts").sort());
  } finally {
    releaseBackground();
  }
});

test("a failed background image does not strand the remaining queue", async ({ page }) => {
  const requestedImages = new Set<string>();
  let failedImage: string | undefined;
  await page.route("**/technical-terms/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    requestedImages.add(path);
    if (!failedImage) {
      failedImage = path;
      await route.abort("failed");
    } else {
      await route.continue();
    }
  });
  await page.goto("/projects/cloudreaper-alerts");
  await expect.poll(() => [...requestedImages].sort()).toEqual(termImagePaths("cloudreaper-alerts").sort());
});

test("leaving a project cancels its pending preload and stops its queued downloads", async ({ page }) => {
  await observePreloads(page);
  const requestedImages = new Set<string>();
  const { promise: stalled, resolve: releaseBackground } = Promise.withResolvers<void>();
  let blockedImage: string | undefined;
  await page.route("**/technical-terms/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    requestedImages.add(path);
    if (!blockedImage) {
      blockedImage = path;
      await stalled;
    }
    await route.continue();
  });
  try {
    await page.goto("/projects/cloudreaper-alerts");
    await expect.poll(() => requestedImages.size).toBe(1);
    await page.getByRole("button", { name: "Back to home" }).click();
    await expect(page).toHaveURL("/");
    await expect.poll(() => page.evaluate(() => window.__termPreloads.every((image) => !image.hasAttribute("src")))).toBe(true);
    releaseBackground();
    await page.locator('a[href="/projects/pallasdb"]').click();
    await expect(page).toHaveURL(/\/projects\/pallasdb$/);
    const pallasImages = termImagePaths("pallasdb");
    await expect.poll(() => [...requestedImages].filter((path) => pallasImages.includes(path)).sort()).toEqual(pallasImages.sort());
    expect([...requestedImages].filter((path) => termImagePaths("cloudreaper-alerts").includes(path))).toEqual([blockedImage]);
  } finally {
    releaseBackground();
  }
});
