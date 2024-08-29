import express from 'express'
import * as userServices from './services/user.services'
import { randomUUID } from 'crypto'

const port = 3000
const app = express()

app.use(express.json())
app.use(express.static(__dirname + '/../public'))

type user = { id: number, name: string, email: string, username: string, password: string }
const logged: { [token: string]: user } = {}

const isAlreadyLogged = (username: string) => {
  for (const token in logged)
    if (logged[token].username === username)
      return token
  return false
}

// CREATE::LOGIN
app.post("/token", async (req, res) => {
  const { username, password } = req.body
  const tokenAlread = isAlreadyLogged(username)
  if (tokenAlread)
    return res.status(401).json({
      error: "Usuário já está logado", 
      token: tokenAlread
    })
  const user = await userServices.findUserByLoginPassword(username, password)
  if (!user)
    return res.status(401).json({ error: "Usuário ou senha inválidos" })
  const token = randomUUID()
  logged[token] = user
  return res.json({ token })
})

// READ::CHECK
app.get("/token/:token", (req, res) => {
  const token = req.params.token
  if (!token)
    return res.status(401).json({ error: "Token não informado" })
  if (!logged[token])
    return res.status(401).json({ error: "Token inválido" })
  return res.json({ ...logged[token], password: undefined })
})

// DELETE::LOGOUT
app.delete("/token/:token", (req, res) => {
  const token = req.params.token
  if (!token)
    return res.status(401).json({ error: "Token não informado" })
  if (!logged[token])
    return res.status(401).json({ error: "Token inválido" })
  delete logged[token]
  return res.status(204).send()
})

app.listen(port, () => console.log(`⚡ Server is running on port ${port}`))