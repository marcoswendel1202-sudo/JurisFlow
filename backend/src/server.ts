import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const app = express()
const prisma = new PrismaClient()

app.use(cors({ origin: '*' }))
app.use(express.json())

app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'JurisFlow' }))

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, oabNumber, oabState } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Campos obrigatórios' })
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ error: 'E-mail já cadastrado' })
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { name, email, password: hash, oabNumber, oabState }, select: { id: true, name: true, email: true, oabNumber: true, oabState: true } })
    const jwt = await import('jsonwebtoken')
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })
    return res.status(201).json({ user, token })
  } catch(e: any) { return res.status(500).json({ error: e.message }) }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' })
    const bcrypt = await import('bcryptjs')
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' })
    const jwt = await import('jsonwebtoken')
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })
    return res.json({ user: { id: user.id, name: user.name, email: user.email, oabNumber: user.oabNumber, oabState: user.oabState }, token })
  } catch(e: any) { return res.status(500).json({ error: e.message }) }
})

function auth(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Token não fornecido' })
  try {
    const jwt = require('jsonwebtoken')
    const p = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    req.userId = p.userId
    next()
  } catch { return res.status(401).json({ error: 'Token inválido' }) }
}

app.get('/api/clients', auth, async (req: any, res) => {
  try {
    const clients = await prisma.client.findMany({ where: { userId: req.userId }, orderBy: { updatedAt: 'desc' } })
    return res.json(clients)
  } catch(e: any) { return res.status(500).json({ error: e.message }) }
})

app.post('/api/clients', auth, async (req: any, res) => {
  try {
    const { name, phone, cpf, email, address, city, state, legalArea, caseDesc, status, dealValue, source } = req.body
    if (!name || !phone || !legalArea) return res.status(400).json({ error: 'name, phone e legalArea são obrigatórios' })
    const client = await prisma.client.create({ data: { userId: req.userId, name, phone, cpf, email, address, city, state, legalArea, caseDesc, status: status || 'NEW', dealValue: dealValue ? parseFloat(dealValue) : null, source } })
    return res.status(201).json(client)
  } catch(e: any) { return res.status(500).json({ error: e.message }) }
})

app.patch('/api/clients/:id', auth, async (req: any, res) => {
  try {
    const client = await prisma.client.updateMany({ where: { id: req.params.id, userId: req.userId }, data: req.body })
    return res.json(client)
  } catch(e: any) { return res.status(500).json({ error: e.message }) }
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`JurisFlow rodando na porta ${PORT}`))
