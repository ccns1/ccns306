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
import socket from 'socket.io';

config();

interface IEmptyUser {
	email: null;
	password: null;
}

declare global {
	namespace Express {
		interface Request {
			user: IUser | IEmptyUser;
		}
	}
}

const app: Application = express();
const server = createServer(app);
const port = process.env.PORT || 5000;
const ACCESS_TOKEN_SECRET =
	process.env.ACCESS_TOKEN_SECRET || 'ACCESS_TOKEN_SECRET';
const io = socket(server);

const users: any = {};

const socketToRoom: any = {};

io.on('connection', (socket) => {
	socket.on('join room', (roomID) => {
		if (users[roomID]) {
			const length = users[roomID].length;
			if (length === 4) {
				socket.emit('room full');
				return;
			}
			users[roomID].push(socket.id);
		} else {
			users[roomID] = [socket.id];
		}
		socketToRoom[socket.id] = roomID;
		const usersInThisRoom = users[roomID].filter(
			(id: string) => id !== socket.id
		);

		socket.emit('all users', usersInThisRoom);
	});

	socket.on('sending signal', (payload) => {
		io.to(payload.userToSignal).emit('user joined', {
			signal: payload.signal,
			callerID: payload.callerID,
		});
	});

	socket.on('returning signal', (payload) => {
		io.to(payload.callerID).emit('receiving returned signal', {
			signal: payload.signal,
			id: socket.id,
		});
	});

	socket.on('disconnect', () => {
		const roomID = socketToRoom[socket.id];
		let room = users[roomID];
		if (room) {
			room = room.filter((id: string) => id !== socket.id);
			users[roomID] = room;
		}
	});
});

app.use(express.static('client/build'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers['authorization'];
	if (token == null) req.user = { email: null, password: null };
	else
		jwt.verify(token, ACCESS_TOKEN_SECRET, (err: any, user: any) => {
			if (err) req.user = { email: null, password: null };
			else req.user = user;
		});

	next();
};

app.post(
	'/api/authenticate',
	authenticateToken,
	(req: Request, res: Response) => {
		res.send(req.user);
	}
);

app.post(
	'/api/login',
	async (req: Request, res: Response): Promise<void> => {
		const user: IUser = req.body;
		const payload: IUserPayload = await UserController.createUser(user);
		if (payload.status == Status.ACCOUNT_NOT_FOUND) {
			const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET);
			res.json({ accessToken, user });
		} else if (payload.status == Status.ACCOUNT_FOUND && payload.user) {
			const match = await compare(user.password, payload.user.password);
			if (match) {
				const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET);
				res.json({ authorization: accessToken, user });
			} else
				res.json({
					message: 'Wrong password',
				});
		} else if (payload.status == Status.ERROR)
			res.json({
				message: 'Error',
			});
	}
);

app.get('*', (req: Request, res: Response): void => {
	res.sendFile(path.resolve('client', 'build', 'index.html'));
});

server.listen(port, async () => {
	console.log(`Server running on http://localhost:${port}`);
});
