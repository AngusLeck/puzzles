import { expect, test, type Page } from "@playwright/test";

/**
 * End-to-end smoke tests against the built site (see playwright.config.ts).
 * They exercise the real pointer interactions: drag-to-slot, tile bank,
 * typing, solving, hints, persistence and routing.
 */

async function open(page: Page, hash: string, theme = "light") {
  // Only seed the theme when the player has no preference yet, so persistence tests can reload.
  await page.addInitScript((t) => {
    if (!localStorage.getItem("puzzles-theme")) localStorage.setItem("puzzles-theme", t);
  }, theme);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/" + hash);
  await page.waitForTimeout(400);
  return errors;
}

const tile = (page: Page, text: string) => page.locator(`.tile:text-is("${text}")`);
const slot = (page: Page, id: string) => page.locator(`.slot[data-slot-id="${id}"]`);

async function dragTo(page: Page, from: ReturnType<typeof tile>, to: ReturnType<typeof slot>) {
  const a = await from.boundingBox();
  const b = await to.boundingBox();
  if (!a || !b) throw new Error("missing box");
  const sx = a.x + a.width / 2;
  const sy = a.y + a.height / 2;
  const tx = b.x + b.width / 2;
  const ty = b.y + b.height / 2;
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  // A few intermediate moves so the drag threshold and physics both run.
  for (let i = 1; i <= 8; i++) {
    await page.mouse.move(sx + ((tx - sx) * i) / 8, sy + ((ty - sy) * i) / 8);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(120);
  await page.mouse.up();
  await page.waitForTimeout(300);
}

test("list shows released puzzles and routes to a puzzle", async ({ page }) => {
  const errors = await open(page, "");
  await expect(page.getByRole("heading", { name: "Puzzles" })).toBeVisible();
  const cards = page.locator(".puzzleCard");
  expect(await cards.count()).toBeGreaterThan(10);
  await cards.first().click();
  await expect(page).toHaveURL(/#\/cryptic-1$/);
  await expect(page.locator(".slot")).toHaveCount(5);
  await page.getByRole("button", { name: "Back to puzzles" }).click();
  await expect(page.getByRole("heading", { name: "Puzzles" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("unknown routes fall back to the list and clear the hash", async ({ page }) => {
  await open(page, "#/nope");
  await expect(page.getByRole("heading", { name: "Puzzles" })).toBeVisible();
  expect(new URL(page.url()).hash).toBe("");
});

test("tile bank mints tiles; dragging one into a slot snaps; solving celebrates and persists", async ({
  page,
}) => {
  const errors = await open(page, "#/cryptic-1");
  await page.getByRole("button", { name: "Tile bank" }).click();
  await page.locator('.bankKeys .key:text-is("I")').click();
  await expect(page.locator(".tile")).toHaveCount(1);
  await page.getByRole("button", { name: "Tile bank" }).click(); // close so the slot row is clear
  await page.waitForTimeout(500);
  await dragTo(page, tile(page, "I"), slot(page, "s1"));
  await expect(tile(page, "I")).toHaveAttribute("data-slotted", "1");

  // Type the rest by selecting the next slot.
  await slot(page, "s2").dispatchEvent("pointerdown");
  await page.keyboard.type("diom");
  await expect(page.getByTestId("solved-banner")).toBeVisible();
  await expect(page.getByTestId("solved-banner")).toContainText("no hints");
  await expect(page.locator(".tile.locked")).toHaveCount(5);

  // The clue stays readable: banner sits below the prompt, not over it.
  const banner = await page.getByTestId("solved-banner").boundingBox();
  const prompt = await page.getByTestId("prompt-panel").boundingBox();
  expect(banner!.y).toBeGreaterThanOrEqual(prompt!.y + prompt!.height - 1);

  await page.reload();
  await page.waitForTimeout(400);
  await expect(page.locator(".tile.locked")).toHaveCount(5);
  await page.getByRole("button", { name: "Back to puzzles" }).click();
  await expect(page.locator(".puzzleCard").first()).toContainText("Solved");
  expect(errors).toEqual([]);
});

test("a wrong answer shakes the board, pops the wrong tile out and counts a mistake", async ({
  page,
}) => {
  await open(page, "#/cryptic-2");
  await slot(page, "s1").dispatchEvent("pointerdown");
  await page.keyboard.type("coffin");
  await page.waitForTimeout(600);
  await expect(page.locator(".tile[data-slotted]")).toHaveCount(4); // I and N ejected
  await page.getByRole("button", { name: "Back to puzzles" }).click();
  await expect(page.locator(".puzzleCard", { hasText: "Stew on this!" })).toContainText(
    "1 mistake",
  );
});

test("hints reveal in ladder order, highlight the prompt, and stay reviewable", async ({
  page,
}) => {
  await open(page, "#/cryptic-1");
  await page.getByRole("button", { name: "Get a hint" }).click();
  const btn = page.getByRole("button", { name: /Definition hint/ });
  await btn.click();
  await expect(page.getByRole("button", { name: "Reveal definition hint?" })).toBeVisible();
  await page.getByRole("button", { name: "Reveal definition hint?" }).click();
  await expect(page.getByTestId("hint-toast")).toContainText("definition");
  await expect(page.locator(".promptText mark")).toHaveText("as they say");
  await page.getByTestId("hint-toast").click();
  await expect(page.locator(".promptText mark")).toHaveCount(0);
  await page.getByRole("button", { name: "Get a hint" }).click();
  await expect(page.locator(".revealedHint")).toHaveCount(1);
  await expect(page.getByRole("button", { name: /Definition hint · 0 left/ })).toBeDisabled();
});

test("connections: fixed tiles deal loose and drag into rows", async ({ page }) => {
  const errors = await open(page, "#/connections-1");
  await expect(page.locator(".tile")).toHaveCount(16);
  await expect(page.locator(".tile[data-slotted]")).toHaveCount(0);
  await page.waitForTimeout(900); // let the dealt tiles settle before measuring them
  // On a phone the deal is crowded, so grab whichever tile is topmost under NAVY's centre.
  const box = await tile(page, "NAVY").boundingBox();
  const picked = await page.evaluate(
    ([x, y]) => document.elementFromPoint(x, y)?.closest(".tile")?.textContent ?? "NAVY",
    [box!.x + box!.width / 2, box!.y + box!.height / 2],
  );
  await dragTo(page, tile(page, picked), slot(page, "r1c1"));
  await expect(tile(page, picked)).toHaveAttribute("data-slotted", "1");
  expect(errors).toEqual([]);
});

test("theme cycles and persists", async ({ page }) => {
  await open(page, "");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: /Theme/ }).click(); // light -> dark
  await expect(html).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
});
