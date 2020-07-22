import User, { IUser } from '../models/User';
import { genSalt, hash } from 'bcrypt';

export enum Status {
	SUCCESS = 'SUCCESS',
	FAILURE = 'FAILURE',
}

export interface IUserData {
	email: string;
	password: string;
	salt?: string;
}

export default class UserController {
	static async createUser(data: IUserData): Promise<IUser> {
		await User.findOne(
			{ email: data.email },
			async (err: any, user: IUser | null) => {
				if (err) throw new Error(err);
				if (user) throw new Error('User already exists');
			}
		);

		data.salt = await genSalt();
		data.password = await hash(data.password, data.salt);
		const newUser = new User(data);
		await newUser.save();

		return newUser;
	}

	static async updateUser(email: string, password: string): Promise<Status> {
		let status = Status.SUCCESS;
		await User.findOneAndUpdate(
			{ email: email },
			{ password: password },
			{ new: true },
			(err: any) => {
				if (err) status = Status.FAILURE;
			}
		);
		return status;
	}

	static async deleteUser(email: string): Promise<Status> {
		let status = Status.SUCCESS;
		await User.findOneAndDelete({ email: email }, (err: any): void => {
			if (err) status = Status.FAILURE;
		});
		return status;
	}
}
