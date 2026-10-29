const action = document.querySelector('#action')
const status = document.querySelector('#status')

action.addEventListener('click', () => {
  const active = action.getAttribute('aria-pressed') !== 'true'

  action.setAttribute('aria-pressed', String(active))
  action.textContent = active ? 'Action complete' : 'Try action'
  status.textContent = active ? 'Example interaction activated.' : ''
})
