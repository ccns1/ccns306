import React, { useState, FormEvent, FunctionComponent } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { v1 as uuid } from 'uuid';

const Lobby: FunctionComponent<RouteComponentProps> = ({ history }) => {
	const [roomId, setRoomId] = useState('');

	const handleChange = (e: FormEvent<HTMLInputElement>): void => {
		setRoomId(e.currentTarget.value);
	};

	const create = (): void => {
		const id = uuid();
		history.push(`/room/${id}`);
	};

	const join = (): void => {
		if (roomId.length >= 6) history.push(`/room/${roomId}`);
		else window.alert('Room id must be at least six characters');
	};

	return (
		<>
			<button onClick={create}>Create room</button>
			<input
				type='text'
				placeholder='Enter room id'
				value={roomId}
				onChange={handleChange}
			/>
			<button onClick={join}>Join a room with id</button>
		</>
	);
};

export default Lobby;
