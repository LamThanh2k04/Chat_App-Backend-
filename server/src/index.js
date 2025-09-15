import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/DB/index.js';
import http from 'http';
import { Server } from 'socket.io';
import router from './routers/index.js';
import { attachIO } from './middleware/attachIO.js';
import { handleSocket } from './socket/socketHandle.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.send('Hello World1111!');
})
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
app.use(attachIO(io));
app.use(router)
handleSocket(io);
await connectDB();
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});