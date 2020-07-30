import React, {
	useState,
	FormEvent,
	FunctionComponent,
	SetStateAction,
	Dispatch,
} from 'react';
import './Form.css';
const port = process.env.PORT || 5000;

interface FormProps {
	setAuthorization: Dispatch<SetStateAction<string>>;
	setUser: Dispatch<SetStateAction<{ email: string; password: string }>>;
}

const Form: FunctionComponent<FormProps> = ({ setAuthorization, setUser }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const changeEmail = (e: FormEvent<HTMLInputElement>) => {
		setEmail(e.currentTarget.value);
	};

	const changePass = (e: FormEvent<HTMLInputElement>) => {
		setPassword(e.currentTarget.value);
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		const user = { email, password };

		fetch(`http://localhost:${port}/api/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(user),
		})
			.then((res) => res.json())
			.then((data) => {
				setAuthorization(data.authorization);
				setUser(data.user);
			});
	};

	return (
		<form onSubmit={handleSubmit} className='LogForm'>
			<input
				placeholder='email'
				className='LogForm-input'
				type='email'
				name='email'
				value={email}
				onChange={changeEmail}
				required
			/>
			<br />
			<input
				placeholder='password'
				className='LogForm-input'
				type='password'
				name='password'
				value={password}
				onChange={changePass}
				minLength={6}
				required
			/>
			<br />
			<button type='submit' className='LogForm-button'>
				Sign In
			</button>
		</form>
	);
};

export default Form;
