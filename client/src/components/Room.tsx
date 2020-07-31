import React, {
	useEffect,
	useRef,
	useState,
	MutableRefObject,
	FunctionComponent,
} from 'react';
import io from 'socket.io-client';
import Peer, { Instance } from 'simple-peer';
import styled from 'styled-components';
import { RouteComponentProps } from 'react-router-dom';

interface IPeerRef {
	peerID: string;
	peer: Instance;
}

interface MatchParams {
	roomID: string;
}

const Container = styled.div`
	padding: 20px;
	display: flex;
	height: 100vh;
	width: 90%;
	margin: auto;
	flex-wrap: wrap;
`;

const StyledVideo = styled.video`
	height: 40%;
	width: 50%;
`;

const Video = (props: any) => {
	const ref = useRef() as MutableRefObject<HTMLVideoElement>;

	useEffect(() => {
		props.peer.on('stream', (stream: MediaStream) => {
			ref.current.srcObject = stream;
		});
		// eslint-disable-next-line
	}, []);

	return <StyledVideo playsInline autoPlay ref={ref} />;
};

const videoConstraints = {
	height: window.innerHeight / 2,
	width: window.innerWidth / 2,
};

const Room: FunctionComponent<RouteComponentProps<MatchParams>> = (props) => {
	const [peers, setPeers] = useState<Instance[]>([]);
	const socketRef = useRef(io.connect('/'));
	const userVideo = useRef() as MutableRefObject<HTMLVideoElement>;
	const peersRef = useRef([]) as MutableRefObject<IPeerRef[]>;
	const roomID = props.match.params.roomID;

	useEffect(() => {
		// socketRef.current = io.connect('/');
		navigator.mediaDevices
			.getUserMedia({ video: videoConstraints, audio: true })
			.then((stream: MediaStream) => {
				userVideo.current.srcObject = stream;
				socketRef.current.emit('join room', roomID);
				socketRef.current.on('all users', (users: any[]) => {
					const peers: Instance[] = [];
					users.forEach((userID: string) => {
						const peer = createPeer(userID, socketRef.current.id, stream);
						peersRef.current.push({
							peerID: userID,
							peer,
						});
						peers.push(peer);
					});
					setPeers(peers);
				});

				socketRef.current.on('user joined', (payload: any) => {
					const peer: Instance = addPeer(
						payload.signal,
						payload.callerID,
						stream
					);
					peersRef.current.push({
						peerID: payload.callerID,
						peer,
					});

					setPeers((users: Instance[]): Instance[] => [...users, peer]);
				});

				socketRef.current.on('receiving returned signal', (payload: any) => {
					const item = peersRef.current.find(
						(p: IPeerRef) => p.peerID === payload.id
					);
					if (item) item.peer.signal(payload.signal);
				});
			})
			.catch((err) => {
				console.log(err);
			});
		// eslint-disable-next-line
	}, []);

	function createPeer(
		userToSignal: string,
		callerID: string,
		stream: MediaStream
	) {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream,
		});

		peer.on('signal', (signal) => {
			socketRef.current.emit('sending signal', {
				userToSignal,
				callerID,
				signal,
			});
		});

		return peer;
	}

	function addPeer(incomingSignal: any, callerID: string, stream: MediaStream) {
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream,
		});

		peer.on('signal', (signal) => {
			socketRef.current.emit('returning signal', { signal, callerID });
		});

		peer.signal(incomingSignal);

		return peer;
	}

	return (
		<Container>
			<StyledVideo muted ref={userVideo} autoPlay playsInline />
			{peers.map((peer, index) => {
				return <Video key={index} peer={peer} />;
			})}
		</Container>
	);
};

export default Room;
