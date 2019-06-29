var React = require("react");
var PropTypes = require("prop-types");
const io = require("socket.io-client");
import PlayerListing from "./player-listing";
import {Layer, Stage} from "react-konva";

export default class DisplayContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			buzzersOpen: false,
			players: [],
			height: 0,
			width: 0,
			playerAnswering: {},
		};
	}

	updateDimensions = () => {
		this.setState({width: window.innerWidth, height: window.innerHeight});
	}

	onNewState = (state) => {
		this.setState(state);
	}

	componentWillMount = () => {
		this.updateDimensions();
	}

	componentDidMount = () => {
		this.props.socket.on("new game state", this.onNewState);
		window.addEventListener("resize", this.updateDimensions);
	}

	componentWillUnmount = () => {
		this.props.socket.removeListener("new game state", this.onNewState);
		window.removeEventListener("resize", this.updateDimensions);
	}

	render = () => {
		const {height, width, players, playerAnswering} = this.state;
		const nonHiddenPlayers = players.filter(p => !p.hidden);

		const playerHeight = Math.min(0.1 * height, height / nonHiddenPlayers.length);
		const firstPlayerTop = (height - (nonHiddenPlayers.length * playerHeight)) / 2;
		const list = nonHiddenPlayers.map((p, i) => (
			// light this display up if they are answering the question
			<PlayerListing
				player={p}
				key={i}
				height={playerHeight}
				width={width}
				top={firstPlayerTop + (i * playerHeight)}
				answering={playerAnswering.id === p.id}
			/>
		));
		const playerPanel = <Layer>{list}</Layer>;

		return (
			<Stage height={height} width={width}>
				{playerPanel}
			</Stage>
		);
	}
}

DisplayContainer.propTypes = {
	socket: PropTypes.instanceOf(io.Socket),
};