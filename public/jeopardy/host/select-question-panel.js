const React = require("react");
const PropTypes = require("prop-types");
import CategoryGroup from "./category-group";


// panel showing which categories and clues are unasked
// (with buttons to show them)
class SelectQuestionPanel extends React.Component {
	render() {
		const catGroups = [];
		for (let i = 0; i < this.props.round.categories.length; i++) {
			catGroups.push((
				<CategoryGroup
					catNo={i}
					category={this.props.round.categories[i]}
					key={i}
					values={this.props.round.values.amounts}
					callback={this.props.callback}
					prefix={this.props.prefix}
					suffix={this.props.suffix}/>
			));
		}
		return (
			<div className='select-question-panel'>
				{catGroups}
			</div>
		);
	}
}

SelectQuestionPanel.propTypes = {
	round: PropTypes.object,
	callback: PropTypes.func,
	prefix: PropTypes.string,
	suffix: PropTypes.string,
};

module.exports = SelectQuestionPanel;
