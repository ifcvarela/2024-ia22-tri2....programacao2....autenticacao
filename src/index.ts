import express from 'express'
const app = express()

app.use(express.json())
app.use(express.static(__dirname + '/../public'))

const port = 3000

type User = {
  username: string
  password: string
}

const registredUsers: User[] = [
  {
    username: "daniel",
    password: "123123"
  },
  {
    username: "admin",
    password: "admin"
  }
]

const logedUsers: User[] = [
  // 
]

const findUser = (username: string, password: string) => {
  return registredUsers.find(user => user.username === username && user.password === password)
}

const findUserByToken = (token: string) => {
  const pos = parseInt(token)
  return logedUsers[pos]
}

const userAlreadyLoged = (username: string, password: string) => {
  return logedUsers.find(user => user.username === username && user.password === password)
}

const deleteToken = (token: string) => {
  const pos = parseInt(token)
  delete logedUsers[pos]
}

app.get("/check/:token", (req, res) => {
  const { token } = req.params
  const user = findUserByToken(token)
  if (!user)
    return res.status(401).json({ error: "Token inválido" })
  return res.json({ message: "Usuário logado" })
})

app.post("/login", (req, res) => {
  const { username, password } = req.body
  if (userAlreadyLoged(username, password))
    return res.status(401).json({ error: "Usuário já está logado" })
  const user = findUser(username, password)
  if (!user)
    return res.status(401).json({ error: "Usuário não encontrado" })
  logedUsers.push(user)
  const token = logedUsers.length - 1
  return res.json({ token })
})

app.post("/logout/:token", (req, res) => {
  const { token } = req.params
  const user = findUserByToken(token)
  if (!user)
    return res.status(401).json({ error: "Token inválido" })
  deleteToken(token)
  return res.json({ message: "Usuário deslogado" })
})

app.listen(port, () => console.log(`⚡ Server is running on port ${port}`))