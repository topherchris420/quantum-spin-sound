import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const page = readFileSync(new URL("../src/pages/Index.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");

test("home page uses showcased-site layout sections", () => {
  for (const token of [
    "showcase-hero",
    "signal-runway",
    "lab-deck",
    "performance-grid",
    "Spin the field",
  ]) {
    assert.match(page, new RegExp(token));
  }
});

test("showcase layout has responsive visual system", () => {
  for (const token of [
    ".showcase-hero",
    ".signal-runway",
    ".lab-deck",
    ".performance-grid",
    "@media (max-width: 760px)",
  ]) {
    assert.match(styles, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
