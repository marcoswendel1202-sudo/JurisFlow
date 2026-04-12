import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware'

const router = Router()
const prisma = new PrismaClient()

const META_APP_ID = process.env.META_APP_ID || ''
const META_APP_SECRET = process.env.META_APP_SECRET || ''
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const APP_URL = process.env.APP_URL || 'https://amusing-forgiveness-production-a787.up.railway.app'
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://juris-flow-henna.vercel.app'

// ── META OAuth ────────────────────────────────────────────────────────────────

// GET /api/oauth/meta/connect — redireciona para login do Facebook
router.get('/meta/connect', authMiddleware, (req: AuthRequest, res: Response) => {
  const state = Buffer.from(JSON.stringify({ userId: req.userId })).toString('base64')
  const scope = 'ads_read,ads_management,instagram_basic,pages_read_engagement,business_management'
  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${APP_URL}/api/oauth/meta/callback&scope=${scope}&state=${state}&response_type=code`
  return res.redirect(url)
})

// GET /api/oauth/meta/callback — recebe o code e troca pelo token
router.get('/meta/callback', async (req: Request, res: Response) => {
  const { code, state } = req.query
  if (!code) return res.redirect(`${FRONTEND_URL}/ads?error=meta_cancelled`)

  try {
    const { userId } = JSON.parse(Buffer.from(state as string, 'base64').toString())

    // Troca code por access_token
    const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${META_APP_ID}&redirect_uri=${APP_URL}/api/oauth/meta/callback&client_secret=${META_APP_SECRET}&code=${code}`)
    const tokenData = await tokenRes.json() as any
    if (!tokenData.access_token) throw new Error('Token não recebido')

    // Busca contas de anúncios disponíveis
    const accountsRes = await fetch(`https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status,currency&access_token=${tokenData.access_token}`)
    const accountsData = await accountsRes.json() as any

    // Salva token e contas no banco
    await prisma.user.update({
      where: { id: userId },
      data: {
        metaAccessToken: tokenData.access_token,
        metaAdAccounts: JSON.stringify(accountsData.data || [])
      }
    })

    return res.redirect(`${FRONTEND_URL}/ads?connected=meta&accounts=${accountsData.data?.length || 0}`)
  } catch (err: any) {
    return res.redirect(`${FRONTEND_URL}/ads?error=meta_failed`)
  }
})

// GET /api/oauth/meta/accounts — lista contas de anúncios do usuário
router.get('/meta/accounts', authMiddleware, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user?.metaAccessToken) return res.json({ connected: false, accounts: [] })

  try {
    const r = await fetch(`https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status,currency,spend_cap&access_token=${user.metaAccessToken}`)
    const d = await r.json() as any
    return res.json({ connected: true, accounts: d.data || [] })
  } catch {
    return res.json({ connected: false, accounts: [] })
  }
})

// POST /api/oauth/meta/select-account — advogado escolhe qual conta usar
router.post('/meta/select-account', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { accountId } = req.body
  await prisma.user.update({ where: { id: req.userId }, data: { metaSelectedAccount: accountId } })
  return res.json({ ok: true })
})

// DELETE /api/oauth/meta/disconnect
router.delete('/meta/disconnect', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.user.update({ where: { id: req.userId }, data: { metaAccessToken: null, metaAdAccounts: null, metaSelectedAccount: null } })
  return res.json({ ok: true })
})

// ── GOOGLE OAuth ──────────────────────────────────────────────────────────────

router.get('/google/connect', authMiddleware, (req: AuthRequest, res: Response) => {
  const state = Buffer.from(JSON.stringify({ userId: req.userId })).toString('base64')
  const scope = encodeURIComponent('https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/userinfo.email')
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${APP_URL}/api/oauth/google/callback&response_type=code&scope=${scope}&access_type=offline&state=${state}&prompt=consent`
  return res.redirect(url)
})

router.get('/google/callback', async (req: Request, res: Response) => {
  const { code, state } = req.query
  if (!code) return res.redirect(`${FRONTEND_URL}/ads?error=google_cancelled`)

  try {
    const { userId } = JSON.parse(Buffer.from(state as string, 'base64').toString())

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code: code as string, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, redirect_uri: `${APP_URL}/api/oauth/google/callback`, grant_type: 'authorization_code' })
    })
    const tokenData = await tokenRes.json() as any
    if (!tokenData.access_token) throw new Error('Token não recebido')

    await prisma.user.update({
      where: { id: userId },
      data: { googleAccessToken: tokenData.access_token, googleRefreshToken: tokenData.refresh_token }
    })

    return res.redirect(`${FRONTEND_URL}/ads?connected=google`)
  } catch {
    return res.redirect(`${FRONTEND_URL}/ads?error=google_failed`)
  }
})

router.get('/google/accounts', authMiddleware, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user?.googleAccessToken) return res.json({ connected: false, accounts: [] })
  return res.json({ connected: true })
})

router.delete('/google/disconnect', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.user.update({ where: { id: req.userId }, data: { googleAccessToken: null, googleRefreshToken: null } })
  return res.json({ ok: true })
})

// GET /api/oauth/status — status de todas as conexões do usuário
router.get('/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  return res.json({
    meta: { connected: !!user?.metaAccessToken, selectedAccount: user?.metaSelectedAccount, accounts: user?.metaAdAccounts ? JSON.parse(user.metaAdAccounts) : [] },
    google: { connected: !!user?.googleAccessToken },
    instagram: { connected: !!user?.metaAccessToken }
  })
})

export default router
