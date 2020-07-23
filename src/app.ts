import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer } from 'http';
import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import bodyParser from 'body-parser';
import { IUser } from './models/User';
import UserController, {
	IUserPayload,
	Status,
} from './controllers/UserController';
import { compare } from 'bcrypt';

config();

declare global {
	namespace Express {
		interface Request {
			user: IUser;
		}
	}
}

const app: Application = express();
const port = process.env.PORT || 5000;
const ACCESS_TOKEN_SECRET =
	process.env.ACCESS_TOKEN_SECRET || 'ACCESS_TOKEN_SECRET';

app.use(express.static('client/build'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers['authorization'];
	if (token == null) return res.sendStatus(401);

	jwt.verify(token, ACCESS_TOKEN_SECRET, (err: any, user: any) => {
		if (err) res.sendStatus(403);
		req.user = user;
		next();
	});
};

app.post('/', authenticateToken, (req: Request, res: Response) => {
	res.send(req.user);
});

app.post(
	'/api/login',
	async (req: Request, res: Response): Promise<void> => {
		const user: IUser = req.body;
		const payload: IUserPayload = await UserController.findUser(user.email);
		if (payload.status == Status.SUCCESS && payload.user) {
			const match = await compare(user.password, payload.user.password);
			if (match) {
				const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET);
				res.json({ accessToken });
			} else
				res.json({
					status: payload.status,
					message: 'Wrong password',
				});
		} else
			res.json({
				status: payload.status,
				message: 'Login failed',
			});
	}
);

app.post(
	'/api/signup',
	async (req: Request, res: Response): Promise<void> => {
		const user: IUser = req.body;
		const payload: IUserPayload = await UserController.createUser(user);
		if (payload.status == Status.SUCCESS) {
			const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET);
			res.json({ accessToken });
		} else
			res.json({
				status: payload.status,
				message: 'Account could not be created',
			});
	}
);

app.get('*', (req: Request, res: Response): void => {
	res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

const server = createServer(app);

server.listen(port, async () => {
	console.log(`Server running on http://localhost:${port}`);
});
