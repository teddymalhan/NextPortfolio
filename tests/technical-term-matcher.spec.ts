import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { getAllProjects } from "../lib/projects";
import { prepareWriteup, type ExplainedText } from "../lib/technical-terms";
import { projectTermImages, termImagePaths } from "./technical-term-fixtures";

function annotations(parts: ExplainedText[]) {
  return parts.flatMap((part) => typeof part === "string" ? [] : [{ text: part.text, title: part.term.title }]);
}

for (const fixture of [
  {
    name: "longest aliases win over their shorter suffixes",
    text: "HashiCorp Raft, AWS Lambda, WebSockets.",
    expected: [
      { text: "HashiCorp Raft", title: "Raft consensus" },
      { text: "AWS Lambda", title: "AWS Lambda" },
      { text: "WebSockets", title: "WebSocket" },
    ],
  },
  {
    name: "matching ignores case but preserves the author's spelling",
    text: "rAfT + GrPc + wEbSoCkEtS",
    expected: [
      { text: "rAfT", title: "Raft consensus" },
      { text: "GrPc", title: "gRPC" },
      { text: "wEbSoCkEtS", title: "WebSocket" },
    ],
  },
  {
    name: "embedded words, digits and underscores are not term boundaries",
    text: "preRaft Rafted _Raft Raft_ Raft2 2Raft (Raft), gRPC! CLI-ish",
    expected: [
      { text: "Raft", title: "Raft consensus" },
      { text: "gRPC", title: "gRPC" },
      { text: "CLI", title: "Command-line interface (CLI)" },
    ],
  },
  {
    name: "whitespace, punctuation and non-term prose survive annotation",
    text: "  λ (rAfT) — AWS Lambda,\nCLI!\tWebSockets?  ",
    expected: [
      { text: "rAfT", title: "Raft consensus" },
      { text: "AWS Lambda", title: "AWS Lambda" },
      { text: "CLI", title: "Command-line interface (CLI)" },
      { text: "WebSockets", title: "WebSocket" },
    ],
  },
  { name: "ordinary prose needs no annotations", text: "An ordinary sentence.\n\n", expected: [] },
  { name: "empty paragraphs remain empty", text: "", expected: [] },
]) {
  test(fixture.name, () => {
    const { sections } = prepareWriteup([{ title: "Fixture", paragraphs: [fixture.text] }]);
    const parts = sections[0].paragraphs[0];
    expect(annotations(parts)).toEqual(fixture.expected);
    expect(parts.map((part) => typeof part === "string" ? part : part.text).join("")).toBe(fixture.text);
  });
}

test("first mentions deduplicate aliases across paragraphs, reset per section, and inventory images once", () => {
  const input = [
    { title: "First section", paragraphs: ["Raft then HashiCorp Raft. Lambda then AWS Lambda.", "HashiCorp Raft and AWS Lambda again."] },
    { title: "Next section", paragraphs: ["HashiCorp Raft and AWS Lambda, then Raft and Lambda."] },
  ];
  const prepared = prepareWriteup(input);
  expect(prepared.sections.map((section) => section.id)).toEqual(["first-section", "next-section"]);
  expect(prepared.sections.map((section) => section.paragraphs.map(annotations))).toEqual([
    [[{ text: "Raft", title: "Raft consensus" }, { text: "Lambda", title: "AWS Lambda" }], []],
    [[{ text: "HashiCorp Raft", title: "Raft consensus" }, { text: "AWS Lambda", title: "AWS Lambda" }]],
  ]);
  expect(prepared.sections.map((section) => section.paragraphs.map((parts) =>
    parts.map((part) => typeof part === "string" ? part : part.text).join("")
  ))).toEqual(input.map((section) => section.paragraphs));
  expect(prepared.termImageSources.sort()).toEqual(["/technical-terms/lambda.svg", "/technical-terms/raft.svg"]);
});

test("all four prepared writeups expose the independent expected image inventory", () => {
  const projects = getAllProjects();
  expect(projects.map((project) => project.slug).sort()).toEqual(Object.keys(projectTermImages).sort());
  for (const slug of Object.keys(projectTermImages) as (keyof typeof projectTermImages)[]) {
    expect(projects.find((project) => project.slug === slug)!.termImageSources.slice().sort(), slug)
      .toEqual(termImagePaths(slug).sort());
  }
});

test("every independently inventoried term asset is present and decodes as an image", async ({ page }) => {
  const files = Object.values(projectTermImages).flat().sort();
  const directory = join(process.cwd(), "public", "technical-terms");
  expect((await readdir(directory)).sort()).toEqual(files);
  const images = await Promise.all(files.map(async (file) => {
    const bytes = await readFile(join(directory, file));
    expect(bytes.byteLength, file).toBeGreaterThan(0);
    const type = file.endsWith(".svg") ? "image/svg+xml" : "image/png";
    return { file, source: `data:${type};base64,${bytes.toString("base64")}` };
  }));
  const decoded = await page.evaluate(async (assets) => Promise.all(assets.map(async ({ file, source }) => {
    const image = new Image();
    image.src = source;
    await image.decode();
    return { file, width: image.naturalWidth, height: image.naturalHeight };
  })), images);
  for (const image of decoded) {
    expect(image.width, image.file).toBeGreaterThan(0);
    expect(image.height, image.file).toBeGreaterThan(0);
  }
});
