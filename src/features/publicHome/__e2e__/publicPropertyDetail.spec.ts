import { expect, test } from '@playwright/test';

const property = {
  property: {
    id: '10000000-0000-4000-8000-000000000001',
    slug: 'fazenda-teste',
    title: 'Fazenda Teste',
    summary: 'Propriedade rural produtiva.',
    country: 'Brasil',
    state: 'Goiás',
    city: 'Goiânia',
    region: 'Centro-Oeste',
    pricePerHa: 20000,
    totalValue: 2000000,
    totalAreaHa: 100,
    productiveAreaHa: 70,
    preservedAreaHa: 20,
    rainfallMm: 1400,
    predominantSoil: 'Latossolo',
    riverFrontKm: 1,
    hasAirstrip: false,
    score: 85,
    areaPercent: 70,
    status: 'publicado',
    badges: [],
    currency: 'BRL',
    latitude: -16.68,
    longitude: -49.25,
    publicLocationPrecision: 'exact',
    images: [
      {
        id: 'image-1',
        url: 'https://example.com/farm.jpg',
        isCover: true,
        sortOrder: 0,
      },
    ],
    broker: {
      id: 'broker-1',
      name: 'Corretor Teste',
      whatsapp: '5562999999999',
    },
  },
  location: {
    country: 'Brasil',
    state: 'Goiás',
    city: 'Goiânia',
    region: 'Centro-Oeste',
    latitude: -16.68,
    longitude: -49.25,
    access: 'Rodovia',
    distanceToCity: '10 km',
  },
  images: [
    {
      id: 'image-1',
      url: 'https://example.com/farm.jpg',
      isCover: true,
      sortOrder: 0,
    },
  ],
  broker: { id: 'broker-1', name: 'Corretor Teste', whatsapp: '5562999999999' },
  landUse: [{ name: 'Lavoura', areaHa: 70 }],
  highlights: [],
  map: { precision: 'exact', latitude: -16.68, longitude: -49.25, layers: [] },
  climate: null,
  soils: [],
  documentation: [],
  infrastructure: [],
  waterResources: [],
  production: { systems: [], history: [] },
  dueDiligence: null,
  similarProperties: [],
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/public/properties/fazenda-teste', (route) =>
    route.fulfill({ json: property }),
  );
});

test('opens gallery, map and WhatsApp from a public farm', async ({ page }) => {
  await page.goto('/fazendas/brasil/goias/goiania/fazenda-teste');
  await expect(
    page.getByRole('heading', { name: 'Fazenda Teste' }),
  ).toBeVisible();
  await page.getByRole('button', { name: /Ver todas/i }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#map')).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Falar com corretor/i }),
  ).toHaveAttribute('href', /wa\.me/);
});

test('submits a visit request through the public API', async ({ page }) => {
  let submitted = false;
  await page.route('**/api/public/properties/contact', async (route) => {
    submitted = true;
    await route.fulfill({
      status: 201,
      json: { id: 'request-1', status: 'nova' },
    });
  });
  await page.goto('/fazendas/brasil/goias/goiania/fazenda-teste');
  await page.getByRole('button', { name: /Agendar visita online/i }).click();
  await page.getByLabel('Nome').fill('Cliente Teste');
  await page.getByLabel('Email').fill('cliente@example.com');
  await page.getByLabel('Telefone').fill('62999999999');
  await page.getByLabel('Data').fill('2030-01-10');
  await page.getByLabel(/Horário/i).fill('10:00');
  await page.getByRole('button', { name: /Confirmar agendamento/i }).click();
  await expect(page.getByText(/enviada com sucesso/i)).toBeVisible();
  expect(submitted).toBe(true);
});
