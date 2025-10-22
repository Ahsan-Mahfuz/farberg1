import app from './app'
import { config } from './config'
import { connectDB } from './config/db'

connectDB()

const PORT = config.port
const HOST = config.host

app.get('/', (_req, res) => {
  res.send('Staff reporting server is running perfectly!')
})

app.listen(PORT, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`)
})
