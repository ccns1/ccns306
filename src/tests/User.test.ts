import mongoose from 'mongoose';
import UserController, {
	Status,
	IUserPayload,
} from '../controllers/UserController';
import { compare } from 'bcrypt';

test('Creating a user', async (): Promise<void> => {
	const payload: IUserPayload = await UserController.createUser({
		email: 'testmail123@testmail.com',
		password: 'testpass',
	});

	if (payload.status == Status.ACCOUNT_NOT_FOUND && payload.user) {
		expect(payload.user.email).toBe('testmail123@testmail.com');
		expect(await compare('testpass', payload.user.password)).toBe(true);
	}
});

test('Finding a user', async (): Promise<void> => {
	const payload: IUserPayload = await UserController.findUser(
		'testmail123@testmail.com'
	);

	expect(payload.status).toBe(Status.ACCOUNT_FOUND);
});

test('Updating a user', async (): Promise<void> => {
	const payload: IUserPayload = await UserController.updateUser(
		'testmail123@testmail.com',
		'testpass2'
	);

	expect(payload.status).toBe(Status.ACCOUNT_UPDATED);
});

test('Deleting a user', async (): Promise<void> => {
	const payload: IUserPayload = await UserController.deleteUser(
		'testmail123@testmail.com'
	);

	expect(payload.status).toBe(Status.ACCOUNT_DELETED);
});

afterAll(async (): Promise<void> => await mongoose.connection.close());
