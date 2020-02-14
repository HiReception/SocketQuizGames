import React, { Component } from "react";
import PropTypes from "prop-types";
import {Layer, Text, Rect, Group} from "react-konva";
var FontFaceObserver = require("fontfaceobserver");


export default class MoneyTreePanel extends Component {
	constructor(props) {
		super(props);

		this.state = {
			fontLoaded: false,
		};

		var font = new FontFaceObserver("Conduit");
		font.load().then(() => {
			this.setState({
				fontLoaded: true
			});
		});

	}

	splitLongString = (string, font, size, width) => {
		if (this.textScale(string, font, size, width) < 1) {
			if (string.includes(" ")) {
				var splitPoint = string.indexOf(" ", Math.floor(string.length/2));
				if (splitPoint == -1) {
					splitPoint = string.lastIndexOf(" ");
				}
				return string.substr(0, splitPoint) + "\n" + string.substr(splitPoint + 1);
			}
			return string;			
		} else {
			return string;
		}
	}

	textWidth = (text, font, size) => {
		var c=document.createElement("canvas");
		var cctx=c.getContext("2d");
		cctx.font = size + "px " + font;
		if (!text.includes("\n")) {
			return cctx.measureText(text).width;
		} else {
			var lineLengths = text.split("\n").map((l) => {
				return cctx.measureText(l).width;
			});
			return Math.max(...lineLengths);
		}
	}

	textScale = (text, font, size, width) => {
		const textWidth = this.textWidth(text, font, size);
		if (textWidth <= width) {
			return 1;
		} else {
			return width / textWidth;
		}
	}

	textVerticalSpacing = (text, height) => {
		if (text.includes("\n")) {
			return 0;
		} else {
			return height/4;
		}
	}

	textHorizontalSpacing = (text, font, size, width) => {
		const textWidth = this.textWidth(text, font, size);
		if (textWidth >= width) {
			return 0;
		} else {
			return (width - textWidth)/2;
		}
	}

	lifelineAvailable = (index) => {
		// get name of starting lifeline at this index
		const lifelineName = this.props.startingLifelines[index];
		// if it's the only one in the starting lifelines with this name, return whether the current available lifelines has any with this name
		if (this.props.startingLifelines.filter(l => l === lifelineName).length == 1) {
			return this.props.lifelinesAvailable.some(l => l === lifelineName);
		}
		// if there are multiple
		else {
			// find how many in earlier spots on the starting lifelines are the same name
			const numSameBefore = this.props.startingLifelines.slice(0,index).filter(l => l == lifelineName).length;
			// return whether the available lifelines have more of the same name than there are before this one
			return this.props.lifelinesAvailable.filter(l => l == lifelineName).length > numSameBefore;
		}
		
	}

	render = () => {
		var width = window.innerWidth;
		var height = window.innerHeight;

		const { moneyTree, currentQuestionNo, startingLifelines } = this.props;
		
		var fontFamily = "Copperplate Gothic";


		var panelWidth = width / 2;
		var panelStart = width - panelWidth;
		var panelGapHeight = height / 20;
		var panelContentHeight = height - (2*panelGapHeight);
		var lifelineSectionHeight = 0.2 * panelContentHeight;
		var treeSectionHeight = 0.75 * panelContentHeight;
		var lifelineSpacerHeight = 0.05 * panelContentHeight;

		var lifelineSectionSpacingWidth = 0.05 * panelWidth;
		var lifelineSectionContentWidth = panelWidth - 2*lifelineSectionSpacingWidth;
		var lifelineSpacingRatio = 5;

		var lifelineWidth = lifelineSectionContentWidth / (startingLifelines.length + (startingLifelines.length - 1) / lifelineSpacingRatio);
		var lifelineSpacing = lifelineWidth / lifelineSpacingRatio;

		var treeRowHeight = treeSectionHeight / moneyTree.length;
		var treeRowSpacingHeight = 0.1 * treeRowHeight;
		var treeRowFontSize = treeRowHeight - 2*treeRowSpacingHeight;

		var treeRowNumberWidth = 0.1 * panelWidth;
		var treeRowDiamondGapWidth = 0.05 * panelWidth;
		var treeRowValueWidth = 0.65 * panelWidth;
		var treeRowPaddingWidth = 0.05 * panelWidth;
		



		return (
			<Layer>

				<Rect x={panelStart} y={0} width={panelWidth} height={height} fill="blue" />


				<Group x={panelStart + lifelineSectionSpacingWidth} y={panelGapHeight} height={lifelineSectionHeight} width={lifelineSectionContentWidth}>
					{startingLifelines.map((lifeline, index) => {
						const splitName = this.splitLongString(lifeline, fontFamily, lifelineSectionHeight/2, lifelineWidth);
						return (
							<Group key={index} x={((lifelineWidth + lifelineSpacing) * index)} y={0}
								height={lifelineSectionHeight} width={lifelineWidth}>
								<Rect x={0} y={0} height={lifelineSectionHeight} width={lifelineWidth}
									fill={this.lifelineAvailable(index) ? "black" : "grey"} />

								<Text x={0}
									y={this.textVerticalSpacing(splitName, lifelineSectionHeight)} wrap="none"
									fontSize={lifelineSectionHeight/2} fontFamily={fontFamily}
									fill={this.lifelineAvailable(index) ? "white" : "black"} align="center"
									scaleX={this.textScale(splitName, fontFamily, lifelineSectionHeight/2, lifelineWidth)}
									text={splitName}/>
							</Group>
						);
					})}
				</Group>

				{moneyTree.map((level, index) => {
					const currentQuestion = currentQuestionNo == index + 2;
					return (
						<Group key={index} x={panelStart} y={panelGapHeight + lifelineSectionHeight + lifelineSpacerHeight + treeRowHeight * (moneyTree.length - 1 - index)}
							height={treeRowHeight} width={panelWidth}>
							<Rect x={0} y={0} height={treeRowHeight} width={panelWidth} visible={currentQuestion} fill="orange" />

							<Text x={treeRowPaddingWidth}
								y={treeRowSpacingHeight}
								height={treeRowFontSize} wrap="none" fontStyle={"bold"}
								fontSize={treeRowFontSize} fontFamily={fontFamily}
								fill={currentQuestion ? "black" : (level.safeHaven || index == moneyTree.length - 1) ? "white" : "orange"}
								align="right"
								scaleX={this.textScale((index + 1).toString(), fontFamily, treeRowFontSize/2, treeRowNumberWidth)}
								text={(index + 1).toString()}/>

							<Text x={treeRowPaddingWidth + treeRowNumberWidth + treeRowDiamondGapWidth}
								y={treeRowSpacingHeight}
								height={treeRowFontSize} wrap="none" fontStyle={"bold"}
								fontSize={treeRowFontSize} fontFamily={fontFamily}
								fill={currentQuestion ? "black" : (level.safeHaven || index == moneyTree.length - 1) ? "white" : "orange"}
								align="left"
								scaleX={this.textScale(level.textValue, fontFamily, treeRowFontSize/2, treeRowValueWidth)}
								text={level.textValue}/>


							<Rect
								x={treeRowPaddingWidth + treeRowNumberWidth - treeRowDiamondGapWidth/4} y={treeRowHeight / 2}
								width={treeRowDiamondGapWidth / 3} height={treeRowDiamondGapWidth / 3} visible={currentQuestionNo >= index + 2}
								fill="white" rotation={-45}/>
						</Group>
					);
				})}
			</Layer>
		);
		
	}
}

MoneyTreePanel.propTypes = {
	moneyTree: PropTypes.array,
	currentQuestionNo: PropTypes.number,
	startingLifelines: PropTypes.array,
	lifelinesAvailable: PropTypes.array,
};