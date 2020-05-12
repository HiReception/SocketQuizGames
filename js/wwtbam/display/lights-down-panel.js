import React, { Component } from "react";

import PropTypes from "prop-types";
import {Layer, Stage, Rect} from "react-konva";
import MoneyTreePanel from "./money-tree-panel";


export default class LightsDownPanel extends Component {
	// TODO
	constructor(props) {
		super(props);
		this.state = {
			height: 0,
			width: 0,
			backgroundImage: null,
		};
	}

	updateDimensions = () => {
		this.setState({width: window.innerWidth, height: window.innerHeight});
	}

	componentWillMount = () => {
		this.updateDimensions();
		const bgImage = new window.Image();
		bgImage.src = "images/set-pink.png";
		bgImage.onload = () => {
			this.setState({
				backgroundImage: bgImage,
				backgroundNatHeight: bgImage.naturalHeight,
				backgroundNatWidth: bgImage.naturalWidth,
			});
		};
	}

	componentDidMount = () => {
		window.addEventListener("resize", this.updateDimensions);
	}
	componentWillUnmount = () => {
		window.removeEventListener("resize", this.updateDimensions);
	}

	render = () => {

		var { moneyTreeVisible, moneyTree, currentQuestionNo, startingLifelines, lifelinesAvailable } = this.props;
		var width = window.innerWidth;
		var height = window.innerHeight;

		const screenRatio = width / height;
		const backgroundRatio = this.state.backgroundNatWidth / this.state.backgroundNatHeight;

		var backgroundScale = 0;
		var backgroundOffsetX = 0, backgroundOffsetY = 0;
		if (this.state.backgroundNatHeight) {
			if (screenRatio > backgroundRatio) {
				backgroundScale = width / this.state.backgroundNatWidth;
				backgroundOffsetY = (this.state.backgroundNatHeight - height/backgroundScale)/2;
			} else {
				backgroundScale = height / this.state.backgroundNatHeight;
				backgroundOffsetX = (this.state.backgroundNatWidth - width/backgroundScale)/2;
			}
			backgroundScale = screenRatio > backgroundRatio ? width / this.state.backgroundNatWidth : height/this.state.backgroundNatHeight;
		}


		return (
			<Stage width={width} height={height}>
				{/* <Layer>
					<Rect x={0} y={0} height={height} width={width} fillPatternImage={this.state.backgroundImage}
						fillPatternScaleX={backgroundScale} fillPatternScaleY={backgroundScale}
						fillPatternOffsetX={backgroundOffsetX} fillPatternOffsetY={backgroundOffsetY}/>
				</Layer> */}
				{moneyTreeVisible ? (
					<MoneyTreePanel
						moneyTree={moneyTree}
						currentQuestionNo={currentQuestionNo}
						startingLifelines={startingLifelines}
						lifelinesAvailable={lifelinesAvailable} />
				) : null}
			</Stage>
		);
	}
}

LightsDownPanel.propTypes = {
	moneyTreeVisible: PropTypes.bool,
	moneyTree: PropTypes.array,
	currentQuestionNo: PropTypes.number,
	startingLifelines: PropTypes.array,
	lifelinesAvailable: PropTypes.array,
};