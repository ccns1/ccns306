import User, { IUser } from '../models/User';
import { genSalt, hash } from 'bcrypt';

export enum Status {
	SUCCESS = 'SUCCESS',
	FAILURE = 'FAILURE',
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
		let status: Status = Status.SUCCESS;

		await User.findOne(
			{ email: data.email },
			(err: any, user: IUser | null): void => {
				if (err) throw new Error(err);
				if (user) {
					newUser = user;
					status = Status.FAILURE;
				}
			}
		);

		if (status == Status.SUCCESS) {
			data.salt = await genSalt();
			data.password = await hash(data.password, data.salt);
			newUser = new User(data);
			await newUser.save();
		}

		return { user: newUser, status };
	}

	static async findUser(email: string): Promise<IUserPayload> {
		let foundUser: IUser | null = null;
		let status: Status = Status.SUCCESS;

		await User.findOne(
			{ email: email },
			(err: any, user: IUser | null): void => {
				if (err) throw new Error(err);
				if (user) {
					foundUser = user;
					status = Status.FAILURE;
				}
			}
		);

		return { user: foundUser, status };
	}

	static async updateUser(
		email: string,
		password: string
	): Promise<IUserPayload> {
		let newUser: IUser | null = null;
		let status = Status.SUCCESS;

		await User.findOneAndUpdate(
			{ email: email },
			{ password: password },
			{ new: true },
			(err: any, user: IUser | null): void => {
				if (err) status = Status.FAILURE;
				if (user) newUser = user;
				else status = Status.FAILURE;
			}
		);
		return { user: newUser, status };
	}

	static async deleteUser(email: string): Promise<IUserPayload> {
		let deletedUser: IUser | null = null;
		let status = Status.SUCCESS;

		await User.findOneAndDelete(
			{ email: email },
			(err: any, user: IUser | null): void => {
				if (err) status = Status.FAILURE;
				if (user) deletedUser = user;
				else status = Status.FAILURE;
			}
		);
		return { user: deletedUser, status };
	}
}
