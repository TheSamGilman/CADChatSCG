import { expect, test } from "@playwright/test";

test("clicking the cube opens its review panel", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();

  // The cube sits at the centre of the canvas; retry until the scene is ready to receive clicks.
  await expect(async () => {
    await canvas.click();
    await expect(page.getByRole("heading", { name: "Cube" })).toBeVisible({
      timeout: 1_000,
    });
  }).toPass({ timeout: 15_000 });
});
