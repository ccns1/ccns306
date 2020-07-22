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
	password: string;
	salt: string;
}

export const UserSchema: Schema = new Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	salt: { type: String, required: true },
});

const User: Model<IUser> = model<IUser>('User', UserSchema);

export default User;
