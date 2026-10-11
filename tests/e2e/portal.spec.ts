import { test, expect } from "@playwright/test";
const origin = "http://127.0.0.1:3200";
test("landing, saving, reload, validation, submission and team view", async ({
  page,
}) => {
  await page.goto("/questionario");
  await expect(
    page.getByRole("heading", {
      name: "O próximo passo começa no seu dia a dia.",
    }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/execution/evidence/inicio-desktop.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Iniciar questionário" }).click();
  await page.getByRole("button", { name: "Restaurante Maré" }).click();
  await page.getByRole("link", { name: /Restaurante Maré/ }).click();
  await page.getByLabel("Responsável pelo projeto").fill("Inês de Teste");
  await expect(page.getByRole("status")).toContainText("Guardado");
  await page.reload();
  await expect(page.getByLabel("Responsável pelo projeto")).toHaveValue(
    "Inês de Teste",
  );
  await page.getByRole("button", { name: "8 Revisão" }).click();
  await page.getByRole("button", { name: "Enviar informações" }).click();
  await expect(
    page.getByRole("alert", { name: "Problemas no questionário" }),
  ).toContainText("campos obrigatórios");
  await page.getByRole("button", { name: "2 Objetivos" }).click();
  await page.getByLabel("Receber reservas", { exact: true }).check();
  await expect(page.getByRole("status")).toContainText("Guardado");
  await page.getByRole("button", { name: "6 O seu setor" }).click();
  await expect(
    page.getByText(
      "Identificadores das mesas e capacidade mínima e máxima de cada uma.",
    ),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/execution/evidence/formulario-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "8 Revisão" }).click();
  await page.getByRole("button", { name: "Enviar informações" }).click();
  await expect(
    page.getByRole("heading", { name: "O seu próximo passo já começou." }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Descarregar ficha Markdown" }).click();
  expect((await download).suggestedFilename()).toMatch(/^REC-.*\.md$/);
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await page.getByRole("button", { name: "Equipa de projeto" }).click();
  await expect(page.getByText("Submetidas", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: /Restaurante Maré/ }).click();
  await expect(
    page.getByRole("heading", { name: "Informação pronta para analisar." }),
  ).toBeVisible();
  await page.goto("/equipa/notificacoes");
  await expect(
    page.getByText("Capturada localmente", { exact: true }),
  ).toHaveCount(2);
});
test("API authorization, origin, conflict and cross-client isolation", async ({
  request,
}) => {
  expect((await request.get("/api/intakes")).status()).toBe(401);
  expect(
    (
      await request.post("/api/session", { data: { identity: "client-b" } })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/session", {
        headers: { Origin: origin },
        data: { identity: "client-b" },
      })
    ).status(),
  ).toBe(200);
  expect((await request.get("/api/intakes/mare")).status()).toBe(404);
  expect((await request.get("/api/intakes/mare/export")).status()).toBe(404);
  expect((await request.get("/api/notifications")).status()).toBe(403);
  const i = (await (await request.get("/api/intakes/forma")).json()).intake;
  expect(
    (
      await request.put("/api/intakes/forma/draft", {
        headers: { Origin: origin },
        data: { revision: i.revision, answers: i.answers },
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await request.put("/api/intakes/forma/draft", {
        headers: { Origin: origin },
        data: { revision: i.revision, answers: i.answers },
      })
    ).status(),
  ).toBe(409);
  expect(
    (
      await request.put("/api/intakes/forma/draft", {
        headers: { Origin: "https://untrusted.example" },
        data: { revision: 1, answers: {} },
      })
    ).status(),
  ).toBe(403);
});
test("mobile layout and failed save never show saved", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/questionario");
  await expect(
    page.getByRole("link", { name: "Iniciar questionário" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "docs/execution/evidence/inicio-mobile.png",
    fullPage: true,
  });
  await page.goto("/acesso");
  await page.getByRole("button", { name: "Estúdio Forma" }).click();
  await page.getByRole("link", { name: /Estúdio Forma/ }).click();
  await page.getByLabel("Responsável pelo projeto").fill("Miguel de Teste");
  await expect(page.getByRole("status")).toContainText("Guardado");
  await page.route("**/api/intakes/forma/draft", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Falha de rede simulada." }),
    }),
  );
  await page.getByLabel("Telefone do responsável").fill("000000000");
  await expect(page.getByRole("status")).toContainText(
    "Não foi possível guardar",
  );
  await expect(page.getByLabel("Telefone do responsável")).toHaveValue(
    "000000000",
  );
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Primeiro, a sua empresa." }),
  ).toBeVisible();
  await page.unroute("**/api/intakes/forma/draft");
  await page.getByRole("button", { name: "Tentar guardar novamente" }).click();
  await expect(page.getByRole("status")).toContainText("Guardado");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "docs/execution/evidence/formulario-mobile.png",
    fullPage: true,
  });
});

test("keyboard access and automated accessibility on home and form", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.goto("/questionario");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Saltar para o conteúdo" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  const home = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    home.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
  await page.goto("/acesso");
  await page.getByRole("button", { name: "Estúdio Forma" }).click();
  await page.getByRole("link", { name: /Estúdio Forma/ }).click();
  await expect(page.getByLabel("Nome da empresa")).toBeVisible();
  const form = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    form.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
  await page.setViewportSize({ width: 320, height: 720 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
});

test("two tabs cannot silently overwrite each other", async ({
  page,
  context,
}) => {
  await page.goto("/acesso");
  await page.getByRole("button", { name: "Estúdio Forma" }).click();
  await page.getByRole("link", { name: /Estúdio Forma/ }).click();
  await expect(page.getByLabel("Responsável pelo projeto")).toBeVisible();
  const second = await context.newPage();
  await second.goto("/cliente/forma/preencher/1");
  await expect(second.getByLabel("Responsável pelo projeto")).toBeVisible();
  await page
    .getByLabel("Responsável pelo projeto")
    .fill("Alteração na primeira janela");
  await expect(page.getByRole("status")).toContainText("Guardado");
  await second
    .getByLabel("Responsável pelo projeto")
    .fill("Alteração na segunda janela");
  await expect(
    second.getByRole("alert", { name: "Problemas no questionário" }),
  ).toContainText("mudou noutra sessão");
  await expect(second.getByLabel("Responsável pelo projeto")).toHaveValue(
    "Alteração na segunda janela",
  );
  await page.reload();
  await expect(page.getByLabel("Responsável pelo projeto")).toHaveValue(
    "Alteração na primeira janela",
  );
  await second.close();
});

test("institutional navigation stays intact after visiting the questionnaire", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Iniciar questionário", exact: true }),
  ).toBeVisible();
  const before = await page
    .locator(".hero h1")
    .evaluate((el) => ({
      font: getComputedStyle(el).fontFamily,
      size: getComputedStyle(el).fontSize,
      color: getComputedStyle(el).color,
    }));
  await page
    .getByRole("link", { name: "Iniciar questionário", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "O próximo passo começa no seu dia a dia.",
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page
    .getByRole("link", { name: "Draft & Rise — página inicial", exact: true })
    .click();
  await expect(page.locator(".hero h1")).toBeVisible();
  const after = await page
    .locator(".hero h1")
    .evaluate((el) => ({
      font: getComputedStyle(el).fontFamily,
      size: getComputedStyle(el).fontSize,
      color: getComputedStyle(el).color,
    }));
  expect(after).toEqual(before);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page
    .getByRole("navigation", { name: "Navegação móvel" })
    .getByRole("link", { name: "Iniciar questionário" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "O próximo passo começa no seu dia a dia.",
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
