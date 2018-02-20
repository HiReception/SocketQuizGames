var React = require("react");
var PropTypes = require("prop-types");
import CategoryGroup from "./category-group";
import {Group} from "react-konva";

// panel showing which categories and clues are unasked (with buttons to show them)
export default class SelectQuestionPanel extends React.Component {
	componentDidMount = () => {
		//textFit($("div.category-header"), {multiLine: false});
		//textFit($("div.clue-button"));
	}

	render = () => {
		const {height, width, round, prefix, suffix} = this.props;
		const catWidth = width / round.categories.length;
		var catGroups = round.categories.map((c,i) => (
			<CategoryGroup
				category={c}
				key={i}
				left={catWidth * i}
				width={catWidth}
				height={height}
				values={round.values.amounts}
				prefix={prefix}
				suffix={suffix}/>
		));

		return (
			<Group>
				{catGroups}
			</Group>
		);
	}
	
}

SelectQuestionPanel.propTypes = {
	round: PropTypes.object,
	prefix: PropTypes.string,
	suffix: PropTypes.string,
	height: PropTypes.number,
	width: PropTypes.number,
};