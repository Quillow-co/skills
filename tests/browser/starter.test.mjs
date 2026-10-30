import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import test from 'node:test'

const viewports = [
  { name: 'small', width: 156, height: 156, introVisible: false },
  { name: 'medium', width: 336, height: 156, introVisible: true },
  { name: 'large', width: 336, height: 336, introVisible: true },
]

test('starter works in the host sandbox/CSP at every Quillow size', async (t) => {
  const files = new Map()
  const types = {
    'index.html': 'text/html',
    'app.mjs': 'text/javascript',
    'runtime.js': 'text/javascript',
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
        `<iframe title="Widget" sandbox="allow-scripts" referrerpolicy="no-referrer" src="${origin}/package/index.html" style="border:0;width:156px;height:156px"></iframe>`
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
        `style-src 'unsafe-inline' ${prefix} https://fonts.googleapis.com`,
        `img-src data: ${prefix}`,
        `font-src ${prefix} https://fonts.gstatic.com`,
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
  const action = frame.locator('#action')

  await action.waitFor()
  assert.equal(await action.getAttribute('aria-pressed'), 'false')
  await action.click()
  assert.equal(await action.getAttribute('aria-pressed'), 'true')
  assert.equal(await action.textContent(), 'Action complete')
  await action.focus()
  await page.keyboard.press('Enter')
  assert.equal(await action.getAttribute('aria-pressed'), 'false')
  await action.click()

  for (const viewport of viewports) {
    await page.locator('iframe').evaluate((element, size) => {
      element.style.width = `${size.width}px`
      element.style.height = `${size.height}px`
    }, viewport)

    assert.equal(
      await frame.locator('.block-intro').isVisible(),
      viewport.introVisible,
      `${viewport.name} intro visibility`
    )
    assert.equal(
      await frame.locator('body').evaluate(() => {
        return (
          document.documentElement.scrollWidth <= innerWidth &&
          document.documentElement.scrollHeight <= innerHeight
        )
      }),
      true,
      `${viewport.name} document overflow`
    )
    assert.equal(
      await frame.locator('body').evaluate(() => {
        return [...document.querySelectorAll('h1, h2, p, button')]
          .filter((element) => {
            const style = getComputedStyle(element)
            return style.display !== 'none' && style.visibility !== 'hidden'
          })
          .every((element) => {
            const rect = element.getBoundingClientRect()
            return (
              rect.left >= 0 &&
              rect.top >= 0 &&
              rect.right <= innerWidth &&
              rect.bottom <= innerHeight
            )
          })
      }),
      true,
      `${viewport.name} visible content bounds`
    )
    assert.equal(
      await action.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        return rect.width >= 40 && rect.height >= 40
      }),
      true,
      `${viewport.name} action target`
    )
    assert.equal(
      await frame.locator('body').evaluate(() => {
        return [...document.querySelectorAll('h1, h2, p, button')]
          .filter((element) => getComputedStyle(element).display !== 'none')
          .every(
            (element) =>
              Number.parseFloat(getComputedStyle(element).fontSize) >= 12
          )
      }),
      true,
      `${viewport.name} text size`
    )
  }

  // Emulate the deployed parent bridge after exercising the no-context fallback.
  await page.evaluate(() => {
    window.sdkReady = false
    window.addEventListener('message', (event) => {
      if (
        event.source === document.querySelector('iframe').contentWindow &&
        event.data?.protocol === 'quillow:custom-block' &&
        event.data?.type === 'ready'
      )
        window.sdkReady = true
    })
    document.querySelector('iframe').contentWindow.postMessage(
      {
        protocol: 'quillow:custom-block',
        version: 1,
        type: 'hello',
      },
      '*'
    )
  })
  await page.waitForFunction(() => window.sdkReady)

  const context = {
    theme: {
      mode: 'dark',
      cornerStyle: 'Sharp',
      fontStylesheet: null,
      variables: {
        '--quillow-text-color': '#eeeeee',
        '--quillow-surface-color': '#111111',
        '--quillow-accent-color': '#ffff00',
        '--quillow-accent-text-color': '#111111',
        '--quillow-radius': '0px',
        '--quillow-typography': 'Arial, sans-serif',
      },
    },
    layout: { size: '1:1', width: 336, height: 336, viewport: 'desktop' },
    environment: 'editor',
  }
  const sendContext = async () => {
    await page.evaluate((context) => {
      document.querySelector('iframe').contentWindow.postMessage(
        {
          protocol: 'quillow:custom-block',
          version: 1,
          type: 'context',
          context,
        },
        '*'
      )
    }, context)
    await expect(frame.locator('html')).toHaveAttribute(
      'data-quillow-size',
      context.layout.size
    )
    await expect(frame.locator('html')).toHaveAttribute(
      'data-quillow-theme',
      context.theme.mode
    )
  }
  await sendContext()
  // Host composition wins even when the fallback media query would choose large.
  await expect(frame.locator('.block-intro')).toBeHidden()
  await expect(frame.locator('.block-description')).toBeHidden()
  await expect(frame.locator('html')).toHaveCSS(
    'background-color',
    'rgb(17, 17, 17)'
  )
  await expect(action).toHaveCSS('background-color', 'rgb(255, 255, 0)')
  await expect(action).toHaveCSS('color', 'rgb(17, 17, 17)')
  await expect(action).toHaveCSS('border-radius', '0px')
  await expect(frame.locator('html')).toHaveCSS(
    'font-family',
    'Arial, sans-serif'
  )

  for (const [index, viewport] of viewports.entries()) {
    await page.locator('iframe').evaluate((element, size) => {
      element.style.width = `${size.width}px`
      element.style.height = `${size.height}px`
    }, viewport)
    context.layout = {
      size: ['1:1', '2:1', '2:2'][index],
      width: viewport.width,
      height: viewport.height,
      viewport: 'mobile',
    }
    context.theme.mode = 'light'
    context.theme.variables['--quillow-text-color'] = '#111111'
    context.theme.variables['--quillow-surface-color'] = '#ffffff'
    await sendContext()
    await expect(frame.locator('.block-intro')).toBeVisible({
      visible: viewport.introVisible,
    })
    await expect(action).toHaveAttribute('aria-pressed', 'true')
    assert.equal(
      await frame.locator('body').evaluate(() =>
        [...document.querySelectorAll('h1, h2, p, button')]
          .filter((element) => element.checkVisibility())
          .every((element) => {
            const rect = element.getBoundingClientRect()
            return (
              rect.left >= 0 &&
              rect.top >= 0 &&
              rect.right <= innerWidth &&
              rect.bottom <= innerHeight
            )
          })
      ),
      true,
      `${viewport.name} host composition bounds`
    )
    await expect(frame.locator('html')).toHaveAttribute(
      'data-quillow-viewport',
      'mobile'
    )
  }

  // Deterministic font stylesheet delivery, without an external network dependency.
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({
      contentType: 'text/css',
      body: '/* Host font stylesheet fixture */',
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  )
  context.theme.fontStylesheet =
    'https://fonts.googleapis.com/css2?family=Roboto'
  await sendContext()
  await expect(frame.locator('link[href*="fonts.googleapis.com"]')).toHaveCount(
    1
  )
  context.theme.fontStylesheet =
    'https://fonts.googleapis.com/css2?family=Inter'
  context.theme.variables['--quillow-typography'] = 'Georgia, serif'
  await sendContext()
  await expect(frame.locator('link[href*="family=Inter"]')).toHaveCount(1)
  await expect(frame.locator('link[href*="fonts.googleapis.com"]')).toHaveCount(
    1
  )
  await expect(frame.locator('html')).toHaveCSS('font-family', 'Georgia, serif')
  context.theme.fontStylesheet = null
  await sendContext()
  await expect(frame.locator('link[href*="fonts.googleapis.com"]')).toHaveCount(
    0
  )
  await expect(action).toHaveAttribute('aria-pressed', 'true')

  assert.deepEqual(errors, [])
  assert.deepEqual(failed, [])
})
