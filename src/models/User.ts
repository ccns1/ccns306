import mongoose, { Schema, Document, Model, model } from 'mongoose';
import { config } from 'dotenv';

config();

const uri: string = process.env.MONGOOSE_URI || '';

mongoose.connect(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false,
});

export interface IUser extends Document {
	email: string;
	name: string;
	password: string;
}

export const UserSchema: Schema = new Schema({
	email: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	password: { type: String, required: true },
});

const User: Model<IUser> = model<IUser>('User', UserSchema);

export default User;
