const duration = document.querySelector('#duration')
const sessions = document.querySelector('#sessions')
const total = document.querySelector('#total')
const error = document.querySelector('#error')
const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function update() {
  const count = sessions.valueAsNumber
  const valid = Number.isInteger(count) && count >= 1 && count <= 100
  sessions.setAttribute('aria-invalid', String(!valid))
  error.textContent = valid ? '' : 'Enter a whole number from 1 to 100.'
  total.textContent = valid
    ? currency.format((Number(duration.value) / 60) * 120 * count)
    : '—'
}

duration.addEventListener('change', update)
sessions.addEventListener('input', update)
update()
