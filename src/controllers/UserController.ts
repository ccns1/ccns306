import User, { IUser } from '../models/User';
import { genSalt, hash } from 'bcrypt';

export enum Status {
	ACCOUNT_FOUND = 'ACCOUNT_FOUND',
	ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
	ACCOUNT_UPDATED = 'ACCOUNT_UPDATED',
	ACCOUNT_DELETED = 'ACCOUNT_DELETED',
	ERROR = 'ERROR',
}

export interface IUserPayload {
	user: IUser | null;
	status: Status;
}

export interface IUserData {
	email: string;
	password: string;
	salt?: string;
}

export default class UserController {
	static async createUser(data: IUserData): Promise<IUserPayload> {
		let newUser: IUser | null = null;
		let status: Status = Status.ACCOUNT_NOT_FOUND;

		await User.findOne(
			{ email: data.email },
			(err: any, user: IUser | null): void => {
				if (err) status = Status.ERROR;
				if (user) {
					newUser = user;
					status = Status.ACCOUNT_FOUND;
				}
			}
		);

		if (status == Status.ACCOUNT_NOT_FOUND) {
			data.salt = await genSalt();
			data.password = await hash(data.password, data.salt);
			newUser = new User(data);
			await newUser.save();
		}

		return { user: newUser, status };
	}

	static async findUser(email: string): Promise<IUserPayload> {
		let foundUser: IUser | null = null;
		let status: Status = Status.ACCOUNT_FOUND;

		await User.findOne(
			{ email: email },
			(err: any, user: IUser | null): void => {
				if (err) status = Status.ERROR;
				if (user) foundUser = user;
				else status = Status.ACCOUNT_NOT_FOUND;
			}
		);

		return { user: foundUser, status };
	}

	static async updateUser(
		email: string,
		password: string
	): Promise<IUserPayload> {
		let newUser: IUser | null = null;
		let status = Status.ACCOUNT_UPDATED;

		await User.findOneAndUpdate(
			{ email: email },
			{ password: password },
			{ new: true },
			(err: any, user: IUser | null): void => {
				if (err) status = Status.ERROR;
				if (user) newUser = user;
				else status = Status.ACCOUNT_NOT_FOUND;
			}
		);
		return { user: newUser, status };
	}

	static async deleteUser(email: string): Promise<IUserPayload> {
		let deletedUser: IUser | null = null;
		let status = Status.ACCOUNT_DELETED;

		await User.findOneAndDelete(
			{ email: email },
			(err: any, user: IUser | null): void => {
				if (err) status = Status.ERROR;
				if (user) deletedUser = user;
				else status = Status.ACCOUNT_NOT_FOUND;
			}
		);
		return { user: deletedUser, status };
	}
}
