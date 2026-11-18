import { expect, test } from '@playwright/test';

function luminance(rgb) {
  const channels = rgb.match(/[\d.]+/g).slice(0, 3).map(value => {
    const srgb = Number(value) / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

for (const theme of ['light', 'dark']) {
  test(`status text meets 4.5:1 contrast in ${theme}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    if (theme === 'dark') await page.locator('#theme-toggle').click();

    const samples = await page.locator('#tags .sample-row > .ui-tag, .alerts-stack > .ui-alert').evaluateAll(elements =>
      elements.map(element => {
        const text = element.querySelector('.ui-alert__message') ?? element;
        return {
          variant: element.className,
          text: getComputedStyle(text).color,
          background: getComputedStyle(element).backgroundColor
        };
      })
    );
    expect(samples).toHaveLength(8);
    for (const sample of samples) {
      const values = [luminance(sample.text), luminance(sample.background)].sort((a, b) => b - a);
      expect((values[0] + 0.05) / (values[1] + 0.05), sample.variant).toBeGreaterThanOrEqual(4.5);
    }
  });
}

test('card action follows container size and leaves other buttons independent', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const card = page.locator('#cards .ui-card').first();
  const action = card.locator('.ui-card__action');
  const nearbyLink = page.locator('.hero__actions .ui-button--primary');

  const widths = () => card.evaluate(element => {
    const style = getComputedStyle(element);
    return {
      content: element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
      action: element.querySelector('.ui-card__action').getBoundingClientRect().width
    };
  });

  const wide = await widths();
  expect(wide.content).toBeGreaterThan(400);
  expect(wide.action).toBeLessThan(wide.content);
  const nearbyWidth = (await nearbyLink.boundingBox()).width;

  await card.evaluate(element => { element.style.inlineSize = '390px'; });
  const narrow = await widths();
  expect(narrow.action).toBeCloseTo(narrow.content, 0);
  expect((await nearbyLink.boundingBox()).width).toBe(nearbyWidth);
});

test('reduced motion removes button movement and transition duration', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const button = page.locator('#buttons .ui-button--primary').first();
  await button.hover();
  await expect(button).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  await expect(button).toHaveCSS('transition-duration', '0s, 0s');
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
});

test('vendor button toggles details and preserves the component button radius', async ({ page }) => {
  await page.goto('/');
  const legacy = page.locator('.legacy-action');
  const details = page.locator('#legacy-details');
  await expect(legacy).toHaveCSS('border-top-left-radius', '0px');
  await expect(page.locator('#buttons .ui-button--primary').first()).toHaveCSS('border-top-left-radius', '12px');
  await expect(details).toBeHidden();
  await legacy.focus();
  await page.keyboard.press('Enter');
  await expect(details).toBeVisible();
  await expect(legacy).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Space');
  await expect(details).toBeHidden();
});
