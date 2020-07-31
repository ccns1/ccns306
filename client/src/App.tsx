import React, {
	FunctionComponent,
	useEffect,
	useState,
	createContext,
} from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Lobby from './components/Lobby';
import Room from './components/Room';
import Form from './components/Form';

const port = process.env.PORT || 5000;

export const AuthenticationContext = createContext({
	authorization: '',
	user: { email: '', password: '' },
});

const App: FunctionComponent = () => {
	const [user, setUser] = useState({ email: '', password: '' });
	const [authorization, setAuthorization] = useState('');

	useEffect(() => {
		fetch(`http://localhost:${port}/api/authenticate`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				authorization: authorization,
			},
			body: '',
		})
			.then((res) => res.json())
			.then((foundUser) => setUser(foundUser));
		// eslint-disable-next-line
	}, []);

	return (
		<AuthenticationContext.Provider value={{ user, authorization }}>
			<BrowserRouter>
				<Switch>
					<AuthenticationContext.Consumer>
						{(value) => {
							if (value.user.email === '' || value.user.email === null)
								return (
									<Form setAuthorization={setAuthorization} setUser={setUser} />
								);
							else
								return (
									<>
										<Route path='/' exact component={Lobby} />
										<Route path='/room/:roomID' component={Room} />
									</>
								);
						}}
					</AuthenticationContext.Consumer>
				</Switch>
			</BrowserRouter>
		</AuthenticationContext.Provider>
	);
};

export default App;
