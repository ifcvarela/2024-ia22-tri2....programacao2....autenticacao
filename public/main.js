const form = document.querySelector('form')
const btLogout = document.querySelector('#btLogout')

console.log(form)

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: form.username.value,
      password: form.password.value
    })
  })
  const result = await response.json()
  if (response.status === 401) {
    alert('Usuário ou senha inválidos')
    return
  }
  localStorage.setItem('token', result.token)
  console.log(result)
})

btLogout.addEventListener('click', async () => {
  const response = await fetch(`/logout/${localStorage.getItem('token')}`, { method: 'POST' })
  if (response.status == 401)
      return alert("Usuário já não estava logado")
  const result = await response.json()
  console.log(result)
  alert("Usuaário deslogado com sucesso")
})
