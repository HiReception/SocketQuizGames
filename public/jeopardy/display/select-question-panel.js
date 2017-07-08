var React = require("react");
var PropTypes = require("prop-types");
import CategoryGroup from "./category-group";

// panel showing which categories and clues are unasked (with buttons to show them)
export default class SelectQuestionPanel extends React.Component {
	componentDidMount = () => {
		//textFit($("div.category-header"), {multiLine: false});
		//textFit($("div.clue-button"));
	}
	render = () => {
		var catGroups = [];
		for (var i = 0; i < this.props.round.categories.length; i++) {
			catGroups.push((
				<CategoryGroup
					category={this.props.round.categories[i]}
					key={i}
					values={this.props.round.values.amounts}
					prefix={this.props.prefix}
					suffix={this.props.suffix}/>));
		}

		return (
			<div className="select-question-panel">
				{catGroups}
			</div>
		);
	}
	
}

SelectQuestionPanel.propTypes = {
	round: PropTypes.object,
	prefix: PropTypes.string,
	suffix: PropTypes.string,
};