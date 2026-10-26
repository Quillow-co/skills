import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import test from 'node:test'

test('starter works in the host sandbox/CSP at small and wide sizes', async (t) => {
  const files = new Map()
  const types = {
    'index.html': 'text/html',
    'app.mjs': 'text/javascript',
    'style.css': 'text/css',
  }

  for (const name of Object.keys(types)) {
    files.set(
      `/package/${name}`,
      await readFile(
        new URL(
          `../../skills/quillow-custom-block/templates/starter/${name}`,
          import.meta.url
        )
      )
    )
  }

  let origin

  const server = createServer((request, response) => {
    if (request.url === '/') {
      response.writeHead(200, { 'Content-Type': 'text/html' })
      response.end(
        `<iframe title="Widget" sandbox="allow-scripts" referrerpolicy="no-referrer" src="${origin}/package/index.html" style="border:0;width:280px;height:280px"></iframe>`
      )

      return
    }

    if (!files.has(request.url)) {
      response.writeHead(404)
      response.end()

      return
    }

    const prefix = `${origin}/package/`

    response.writeHead(200, {
      'Content-Type': types[request.url.split('/').at(-1)],
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': [
        'sandbox allow-scripts',
        "default-src 'none'",
        `script-src 'unsafe-inline' ${prefix}`,
        `style-src 'unsafe-inline' ${prefix}`,
        `img-src data: ${prefix}`,
        `font-src ${prefix}`,
        "connect-src 'none'",
        "worker-src 'none'",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'none'",
        'frame-ancestors https: http://localhost:* http://127.0.0.1:*',
      ].join('; '),
    })
    response.end(files.get(request.url))
  })

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  t.after(() => new Promise((resolve) => server.close(resolve)))
  origin = `http://127.0.0.1:${server.address().port}`

  const browser = await chromium.launch()
  t.after(() => browser.close())

  const page = await browser.newPage()
  const errors = []
  const failed = []

  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text())
    }
  })
  page.on('requestfailed', (request) => failed.push(request.url()))
  await page.goto(origin)

  const frame = page.frameLocator('iframe')
  await frame.locator('#sessions[aria-invalid="false"]').waitFor()
  assert.equal(await frame.locator('#total').textContent(), '$120.00')

  await frame.locator('#duration').selectOption('90')
  await frame.locator('#sessions').fill('3')
  assert.equal(await frame.locator('#total').textContent(), '$540.00')

  for (const value of ['', '0', '1.5', '101']) {
    await frame.locator('#sessions').fill(value)
    assert.equal(
      await frame.locator('#sessions').getAttribute('aria-invalid'),
      'true'
    )
    assert.equal(await frame.locator('#total').textContent(), '—')
  }
  await frame.locator('#sessions').fill('2')
  assert.equal(await frame.locator('#total').textContent(), '$360.00')

  await frame.locator('#duration').focus()
  await page.keyboard.press('Tab')
  assert.equal(
    await frame
      .locator('#sessions')
      .evaluate((element) => element === document.activeElement),
    true
  )
  for (const [width, height] of [
    [280, 280],
    [640, 360],
  ]) {
    await page.locator('iframe').evaluate(
      (element, size) => {
        element.style.width = `${size[0]}px`
        element.style.height = `${size[1]}px`
      },
      [width, height]
    )
    assert.equal(
      await frame
        .locator('body')
        .evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true
    )
    assert.equal(
      await frame
        .locator('input')
        .evaluate((element) => getComputedStyle(element).minHeight),
      '44px'
    )
  }

  assert.deepEqual(errors, [])
  assert.deepEqual(failed, [])
})
