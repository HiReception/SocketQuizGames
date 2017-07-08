var React = require("react");
var PropTypes = require("prop-types");
import ClueButton from "./clue-button";


export default class CategoryGroup extends React.Component {
	render = () => {
		var clueButtons = [];
		// only show the category name if there are any clues left in it
		var showCategoryName = this.props.category.clues.some(function(clue) {
			return clue.active;
		});
		for (var i = 0; i < this.props.category.clues.length; i++) {
			clueButtons.push((
					<ClueButton
						clue={this.props.category.clues[i]}
						key={i}
						value={this.props.values[i]}
						prefix={this.props.prefix}
						suffix={this.props.suffix}/>
				));
		}

		if (showCategoryName) {
			var header = (
				<div className="category-header">
						<p className="category-header">{this.props.category.name}</p>
				</div>
			);
			
			return (
				<div className="category-group">
					{header}
					<div className="category-clue-group">
						{clueButtons}
					</div>
				</div>
			);
		} else {
			return (
				<div className="category-group">
					<div className="category-header">
					</div>
					<div className="category-clue-group">
						{clueButtons}
					</div>
				</div>
			);
		}
		
	}
}

CategoryGroup.propTypes = {
	category: PropTypes.object,
	values: PropTypes.array,
	prefix: PropTypes.string,
	suffix: PropTypes.string,
};