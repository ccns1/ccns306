import mongoose from 'mongoose';
import UserController, { Status } from '../controllers/UserController';
import { compare } from 'bcrypt';

test('Creating a user', async () => {
	const user = await UserController.createUser({
		email: 'testmail123@testmail.com',
		password: 'testpass',
	});

	expect(user.email).toBe('testmail123@testmail.com');
	expect(await compare('testpass', user.password)).toBe(true);
});

test('Updating a user', async () => {
	const status = await UserController.updateUser(
		'testmail123@testmail.com',
		'testpass2'
	);

	expect(status).toBe(Status.SUCCESS);
});

test('Deleting a user', async () => {
	const status = await UserController.deleteUser('testmail123@testmail.com');

	expect(status).toBe(Status.SUCCESS);
});

afterAll(async () => mongoose.connection.close());
