import express, { Application } from 'express';
import path from 'path';
import { createServer } from 'http';

const app: Application = express();
const port = process.env.PORT || 5000;

app.use(express.static('client/build'));
app.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

const server = createServer(app);

server.listen(port, async () => {
	console.log(`Server running on http://localhost:${port}`);
});
