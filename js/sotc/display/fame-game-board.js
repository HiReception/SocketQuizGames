const React = require("react");
const PropTypes = require("prop-types");

export default class FameGameBoard extends React.Component {
	render = () => {
		const numRows = Math.ceil(Math.sqrt(this.props.board.length));
		const optionsPerRow = Math.ceil(this.props.board.length / numRows);
		const rows = [...Array(numRows).keys()].map(i => this.props.board.slice(i * optionsPerRow, (i + 1) * optionsPerRow));
		return (
			<div className="fame-game-board-panel">
				<div className="fame-game-board-ctr">
					{rows.map((r, ri) => (
						<div className="option-row" key={ri}>
							{r.map((o,i) => (
								<FameGameOption key={i} faceImage={o.face.image} prizeImage={o.prize.image} selected={o.selected}/>
							))}
						</div>
					))}
				</div>
			</div>
		);
	}
}

FameGameBoard.propTypes = {
	board: PropTypes.array,
};

class FameGameOption extends React.Component {
	render = () => {
		
		return (
			<div className="board-option-shell">
				<div className={`board-option${this.props.selected ? " selected" : ""}`}>
					<div className="option-face">
						<div className="option-face-image" style={{backgroundImage: `url(${this.props.faceImage})`}}>
						</div>
					</div>
					<div className="option-side left"></div>
					<div className="option-side right"></div>
					<div className="option-prize">
						<div className="option-prize-image" style={{backgroundImage: `url(${this.props.prizeImage})`}}></div>
					</div>
				</div>
			</div>
		);
	}
	
}

FameGameOption.propTypes = {
	faceImage: PropTypes.string,
	prizeImage: PropTypes.string,
	selected: PropTypes.bool,
};