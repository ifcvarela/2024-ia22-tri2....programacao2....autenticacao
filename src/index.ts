import express, { RequestHandler } from 'express'
import * as userServices from './services/user.services'
import { randomUUID } from 'crypto'

const port = 4000
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

// Check if user is logged middleware
const middlewareLogged: RequestHandler = (req, res, next) => {
  const token = req.params.token
  if (!token)
    return res.status(404).json({ error: "Token não informado" })
  if (!logged[token])
    return res.status(401).json({ error: "Token inválido" })
  next()
}

// TOKEN CREATE :: LOGIN
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

// TOKEN CHECK :: VALIDATE
app.get("/token/:token", (req, res) => {
  const token = req.params.token
  if (!token)
    return res.status(401).json({ error: "Token não informado" })
  if (!logged[token])
    return res.status(401).json({ error: "Token inválido" })
  return res.json({ ...logged[token], password: undefined })
})

// TOKEN DELETE :: LOGOUT
app.delete("/token/:token", (req, res) => {
  const token = req.params.token
  if (!token)
    return res.status(401).json({ error: "Token não informado" })
  if (!logged[token])
    return res.status(401).json({ error: "Token inválido" })
  delete logged[token]
  return res.status(204).send()
})

// LISTAR USUÁRIOS SOMENTE SE ESTIVER LOGADO
app.get("/users/:token", middlewareLogged, async (req, res) => {
  const users = await userServices.getAllUsers()
  return res.json(users)
})

app.listen(port, () => console.log(`⚡ Server is running on port ${port}`))