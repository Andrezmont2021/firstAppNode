import express, { Application, Request, Response } from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors';

import apiV1 from './routes/v1'
import connectToMongoDB from './db/connection'

dotenv.config()

const PORT = process.env.PORT
const app: Application = express()

// parse application/json
app.use(express.json())

// Include cors
app.use(cors({
    origin: ['http://localhost']
}))

// Set the app to the routes V1
apiV1(app)

app.use((_req: Request, res: Response) => {
    res.status(404).send('NOT FOUND, CHECK YOUR ENDPOINT URL')
})

connectToMongoDB().then((isConnected) => {
    if (isConnected) {
        console.log('Connected to mongo DB')
    } else {
        console.log('Error: cannot connect to mongo DB')
    }
})

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT)
})
