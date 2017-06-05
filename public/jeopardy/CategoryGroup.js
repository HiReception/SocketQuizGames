const React = require("react");
const PropTypes = require("prop-types");
const ClueButton = require("./ClueButton");

class CategoryGroup extends React.Component {
	render() {
		const clueButtons = [];
		for (let i = 0; i < this.props.category.clues.length; i++) {
			clueButtons.push((
				<ClueButton
					active={this.props.category.clues[i].active}
					catNo={this.props.catNo}
					clueNo={i}
					key={i}
					value={this.props.values[i]}
					callback={this.props.callback}
					prefix={this.props.prefix}
					suffix={this.props.suffix}/>
			));
		}

		return (
			<div className='category-group'>
				<div className='category-header'>
					<p className='category-header'>{this.props.category.name}</p>
				</div>
				<div className='category-clue-group'>
					{clueButtons}
				</div>
			</div>
		);
	}
}

CategoryGroup.propTypes = {
	catNo: PropTypes.number,
	category: PropTypes.object,
	values: PropTypes.array,
	callback: PropTypes.func,
	prefix: PropTypes.string,
	suffix: PropTypes.string,
};

module.exports = CategoryGroup;
