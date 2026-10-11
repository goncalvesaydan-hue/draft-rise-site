import { test, expect } from "@playwright/test";
test("without remote configuration there is no demo login or accessible intake", async ({
  page,
  request,
}) => {
  await page.goto("/acesso");
  await expect(
    page.getByText("Estamos a preparar o questionário online."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Restaurante Maré" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Contactar a Draft & Rise" }),
  ).toBeVisible();
  expect((await request.get("/api/intakes")).status()).toBe(503);
  expect(
    (
      await request.post("/api/session", {
        headers: { origin: "http://127.0.0.1:3201" },
        data: { identity: "team" },
      })
    ).status(),
  ).toBe(503);
  expect(
    (
      await request.post("/api/auth/request", {
        headers: { origin: "http://127.0.0.1:3201" },
        data: { email: "fake@example.test" },
      })
    ).status(),
  ).toBe(503);
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Iniciar questionário", exact: true }),
  ).toBeVisible();
});
