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
		const headerBorderV = 0.1 * headerHeight;
		const headerBorderH = 0.01 * headerHeight;
		const headerTextBoxHeight = headerHeight - 2*headerBorderV;
		const headerTextBoxWidth = this.props.width - 2*headerBorderH;
		const headerTextHeightMargin = 0.1 * headerTextBoxHeight;
		const headerTextHeight = (headerTextBoxHeight - 2 * headerTextHeightMargin) / 2;
		const headerTextWidthMargin = 0.1 * headerTextBoxWidth;
		const headerTextWidth = headerTextBoxWidth - 2*headerTextWidthMargin;
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
				<Rect width={this.props.width} height={this.props.height} x={0} y={0} fill="black" stroke="black" strokeWidth={2}/>
				<Rect width={this.props.width} height={headerHeight} x={0} y={0} fill="black"/>
				<Rect width={headerTextBoxWidth} height={headerTextBoxHeight} x={headerBorderH} y={headerBorderV} fill="#0B1885"/>
				<Text x={headerBorderH + headerTextWidthMargin + gf.textHorizontalSpacing(splitCategory, fontFamily, headerTextHeight, headerTextWidth, fontStyle)}
					y={headerBorderV + headerTextHeightMargin + gf.textVerticalSpacing(splitCategory, headerTextHeight)}
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