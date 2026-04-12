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

app.get('/api/clients', auth, async (req: any, res) => {
  try {
    const clients = await prisma.client.findMany({ where: { userId: req.userId }, orderBy: { updatedAt: 'desc' } })
    return res.json(clients)
  } catch(e: any) { return res.status(500).json({ error: e.message }) }
})

app.post('/api/clients', auth, async (req: any, res) => {
  try {
    const { name, phone, cpf, email, address, city, state, legalArea, caseDesc, status, dealValue, source } = req.body
    if (!name || !phone || !legalArea) return res.status(400).json({ error: 'name, phone e legalArea obrigatórios' })
    const client = await prisma.client.create({ data: { userId: req.userId, name, phone, cpf, email, address, city, state, legalArea, caseDesc, status: status || 'NEW', dealValue: dealValue ? parseFloat(dealValue) : null, source } })
    return res.status(201).json(client)
  } catch(e: any) { return res.status(500).json({ error: e.message }) }
})

app.patch('/api/clients/:id', auth, async (req: any, res) => {
  try {
    const { id } = req.params
    const data = req.body
    if (data.dealValue) data.dealValue = parseFloat(data.dealValue)
    await prisma.client.updateMany({ where: { id, userId: req.userId }, data })
    const client = await prisma.client.findFirst({ where: { id, userId: req.userId } })
    return res.json(client)
  } catch(e: any) { return res.status(500).json({ error: e.message }) }
})

app.get('/api/documents', auth, async (req: any, res) => {
  try {
    const docs = await prisma.document.findMany({ where: { userId: req.userId }, include: { client: { select: { name: true } } }, orderBy: { createdAt: 'desc' } })
    return res.json(docs)
  } catch(e: any) { return res.status(500).json({ error: e.message }) }
})

app.post('/api/documents/generate', auth, async (req: any, res) => {
  try {
    const { clientId, type } = req.body
    const client = await prisma.client.findFirst({ where: { id: clientId, userId: req.userId } })
    if (!client) return res.status(404).json({ error: 'Cliente não encontrado' })
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    const doc = await prisma.document.create({ data: { userId: req.userId, clientId: client.id, type, title: `${type} — ${client.name}`, status: 'generated' } })
    return res.json({ document: doc, message: 'Documento gerado com sucesso' })
  } catch(e: any) { return res.status(500).json({ error: e.message }) }
})

// OAuth Meta
const META_APP_ID = process.env.META_APP_ID || ''
const META_APP_SECRET = process.env.META_APP_SECRET || ''
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const APP_URL = process.env.APP_URL || 'https://amusing-forgiveness-production-a787.up.railway.app'
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://juris-flow-henna.vercel.app'

app.get('/api/oauth/status', auth, async (req: any, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  return res.json({
    meta: { connected: !!user?.metaAccessToken, selectedAccount: user?.metaSelectedAccount, accounts: user?.metaAdAccounts ? JSON.parse(user.metaAdAccounts) : [] },
    google: { connected: !!user?.googleAccessToken },
  })
})

app.get('/api/oauth/meta/connect', auth, (req: any, res) => {
  const state = Buffer.from(JSON.stringify({ userId: req.userId })).toString('base64')
  const scope = 'ads_read,ads_management,instagram_basic,pages_read_engagement,business_management'
  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(APP_URL+'/api/oauth/meta/callback')}&scope=${scope}&state=${state}&response_type=code`
  return res.json({ url })
})

app.get('/api/oauth/meta/callback', async (req, res) => {
  const { code, state } = req.query
  if (!code) return res.redirect(`${FRONTEND_URL}/ads?error=meta_cancelled`)
  try {
    const { userId } = JSON.parse(Buffer.from(state as string, 'base64').toString())
    const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(APP_URL+'/api/oauth/meta/callback')}&client_secret=${META_APP_SECRET}&code=${code}`)
    const tokenData = await tokenRes.json() as any
    if (!tokenData.access_token) throw new Error('Token não recebido')
    const accountsRes = await fetch(`https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status,currency&access_token=${tokenData.access_token}`)
    const accountsData = await accountsRes.json() as any
    await prisma.user.update({ where: { id: userId }, data: { metaAccessToken: tokenData.access_token, metaAdAccounts: JSON.stringify(accountsData.data || []) } })
    return res.redirect(`${FRONTEND_URL}/ads?connected=meta&accounts=${accountsData.data?.length || 0}`)
  } catch(e: any) { return res.redirect(`${FRONTEND_URL}/ads?error=meta_failed&msg=${e.message}`) }
})

app.post('/api/oauth/meta/select-account', auth, async (req: any, res) => {
  const { accountId } = req.body
  await prisma.user.update({ where: { id: req.userId }, data: { metaSelectedAccount: accountId } })
  return res.json({ ok: true })
})

app.delete('/api/oauth/meta/disconnect', auth, async (req: any, res) => {
  await prisma.user.update({ where: { id: req.userId }, data: { metaAccessToken: null, metaAdAccounts: null, metaSelectedAccount: null } })
  return res.json({ ok: true })
})

app.get('/api/oauth/google/connect', auth, (req: any, res) => {
  const state = Buffer.from(JSON.stringify({ userId: req.userId })).toString('base64')
  const scope = encodeURIComponent('https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/userinfo.email')
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(APP_URL+'/api/oauth/google/callback')}&response_type=code&scope=${scope}&access_type=offline&state=${state}&prompt=consent`
  return res.json({ url })
})

app.get('/api/oauth/google/callback', async (req, res) => {
  const { code, state } = req.query
  if (!code) return res.redirect(`${FRONTEND_URL}/ads?error=google_cancelled`)
  try {
    const { userId } = JSON.parse(Buffer.from(state as string, 'base64').toString())
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code: code as string, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, redirect_uri: APP_URL+'/api/oauth/google/callback', grant_type: 'authorization_code' }) })
    const tokenData = await tokenRes.json() as any
    if (!tokenData.access_token) throw new Error('Token não recebido')
    await prisma.user.update({ where: { id: userId }, data: { googleAccessToken: tokenData.access_token, googleRefreshToken: tokenData.refresh_token } })
    return res.redirect(`${FRONTEND_URL}/ads?connected=google`)
  } catch { return res.redirect(`${FRONTEND_URL}/ads?error=google_failed`) }
})

app.delete('/api/oauth/google/disconnect', auth, async (req: any, res) => {
  await prisma.user.update({ where: { id: req.userId }, data: { googleAccessToken: null, googleRefreshToken: null } })
  return res.json({ ok: true })
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`JurisFlow rodando na porta ${PORT}`))
