import express, { Application, Request, Response } from 'express';
import path from 'path';
import { createServer } from 'http';
import { config } from 'dotenv';

config();

const app: Application = express();
const port = process.env.PORT || 5000;
// const secret = process.env.SECRET || 'secret';

app.use(express.static('client/build'));
app.get('*', (req: Request, res: Response) => {
	res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

const server = createServer(app);

server.listen(port, async () => {
	console.log(`Server running on http://localhost:${port}`);
});
