var React = require("react");

export default class DailyDoublePanel extends React.Component {
	render = () => {
		return (
			<div className="daily-double-panel">
				<div>
					<p className="daily">Daily</p>
					<p className="double">DOUBLE</p>
				</div>
			</div>
		);
	}
}