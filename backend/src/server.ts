import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
const app = express()
app.use(cors({ origin: '*' }))
app.use(express.json())
app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'JurisFlow' }))
const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`JurisFlow rodando na porta ${PORT}`))
export default app
