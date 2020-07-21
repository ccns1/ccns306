import mongoose from 'mongoose';
import User, { IUser } from './User';

beforeAll(
	async () =>
		await User.findOneAndDelete(
			{ email: 'testmail123@testmail.com' },
			(err: any) => {
				if (err) fail(err);
			}
		)
);

test('Writing and reading to database', async () => {
	const user = new User({
		email: 'testmail123@testmail.com',
		name: 'Test Name',
		password: 'testpass',
	});
	await user.save();

	await User.findOne(
		{ email: 'testmail123@testmail.com' },
		(err: any, user: IUser | null) => {
			if (err) fail(err);
			if (user) {
				expect(user.name).toBe('Test Name');
				expect(user.password).toBe('testpass');
			}
		}
	);

	await User.findOneAndUpdate(
		{ email: 'testmail123@testmail.com' },
		{ password: 'testpass2' },
		{ new: true },
		(err: any, user: IUser | null) => {
			if (err) fail(err);
			if (user) {
				expect(user.name).toBe('Test Name');
				expect(user.password).toBe('testpass2');
			}
		}
	);

	await User.findOneAndDelete(
		{ email: 'testmail123@testmail.com' },
		(err: any) => {
			if (err) fail(err);
		}
	);
});

afterAll(() => mongoose.connection.close());
