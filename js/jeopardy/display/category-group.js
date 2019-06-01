var React = require("react");
var PropTypes = require("prop-types");
import ClueButton from "./clue-button";
import {Group, Rect, Text} from "react-konva";
import gf from "./general_functions";

export default class CategoryGroup extends React.Component {
	render = () => {
		const fontFamily = "Oswald Bold";
		const fontStyle = "";
		const totalCluesHeight = (5/6) * this.props.height;
		const headerHeight = this.props.height - totalCluesHeight;
		const headerTextHeightMargin = 0.2 * headerHeight;
		const headerTextHeight = (headerHeight - 2 * headerTextHeightMargin) / 2;
		const headerTextWidthMargin = 0.1 * this.props.width;
		const headerTextWidth = this.props.width - 2*headerTextWidthMargin;
		const clueHeight = totalCluesHeight / this.props.category.clues.length;

		const splitCategory = gf.splitLongString(this.props.category.name.toUpperCase(), fontFamily, headerTextHeight, headerTextWidth);
		const clueButtons = this.props.category.clues.map((c, i) => (
			<ClueButton
				clue={c}
				key={i}
				height={clueHeight}
				width={this.props.width}
				top={i * clueHeight + headerHeight}
				value={this.props.values[i]}
				prefix={this.props.prefix}
				suffix={this.props.suffix}/>
		));
		// only show the category name if there are any clues left in it
		const showCategoryName = this.props.category.clues.some((clue) => clue.active);


		return (
			<Group x={this.props.left} y={0}>
				<Rect width={this.props.width} height={this.props.height} x={0} y={0} fill="#0B1885" stroke="black" strokeWidth={2}/>
				<Text x={headerTextWidthMargin + gf.textHorizontalSpacing(splitCategory, fontFamily, headerTextHeight, headerTextWidth, fontStyle)}
					y={headerTextHeightMargin + gf.textVerticalSpacing(splitCategory, headerTextHeight)}
					height={headerTextHeight * 2} wrap="none" textAlign="center"
					fontSize={headerTextHeight} fontFamily={fontFamily} fontStyle={fontStyle}
					fill="white" align="center"
					scaleX={gf.textScale(splitCategory, fontFamily, headerTextHeight, headerTextWidth, fontStyle)}
					text={splitCategory} visible={showCategoryName}/>
				{clueButtons}
			</Group>
		);
		
	}
}

CategoryGroup.propTypes = {
	category: PropTypes.object,
	values: PropTypes.array,
	prefix: PropTypes.string,
	suffix: PropTypes.string,
	height: PropTypes.number,
	width: PropTypes.number,
	left: PropTypes.number,
};