var React = require("react");
var PropTypes = require("prop-types");

export default class PuzzleBoardGrid extends React.Component {
	
	render = () => {
		var boardRows = this.props.currentBoard.map(function(row, rowIndex) { 
			var rowCells = Array.prototype.map.call(row, function(cell, cellIndex) {
				var classModifier = "";
				if (cell === "@") {
					classModifier = " invisible";
				} else if (cell === " ") {
					classModifier = " shaded";
				} else if (cell === "_") {
					classModifier = " blank";
				}
				return <div className={"puzzle-board-cell" + classModifier} key={cellIndex}>{cell}</div>;
			});
			return <div key={rowIndex} className="puzzle-board-row">{rowCells}</div>;
		});
		return <div className="current-board-panel">{boardRows}</div>;
	}
}

PuzzleBoardGrid.propTypes = {
	currentBoard: PropTypes.array
};