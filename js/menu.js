import React from "react";
import axios from "axios";
const ReactDOM = require("react-dom");


class MainMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currentPage: "home",

			hostStartNew: true,
			hostTitle: "",
			hostGame: this.hostableGames[0].folder,
			hostPassword: "",
			hostCode: "",

			joinCode: "",
			joinName: "",

			displayCode: "",
			currentError: "",
		};
	}

	hostableGames = [
		{folder: "jeopardy", name: "Jeopardy!"},
		{folder: "genericquiz", name: "Generic Quiz"},
		{folder: "wof-board", name: "Wheel of Fortune"},
		{folder: "wwtbam-ff", name: "Fastest Finger First"}
	];

	minigames = [
		{folder: "tpir-plinko", name: "Plinko"},
		{folder: "wof-wheel", name: "WOF Wheel"},
		{folder: "tpir-wheel", name: "TPIR Big Wheel"},
	];

	availablePages = [
		{name: "home", heading: "Welcome to Trivle!"},
		{name: "host", heading: "Host a Game"},
		{name: "join", heading: "Join a Game"},
		{name: "display", heading: "Display a Game"},
		{name: "minigames", heading: "Minigames"}
	]

	goToPage = (pageName) => {
		if (this.availablePages.some((a) => a.name === pageName)) {
			this.setState({
				currentPage: pageName,
				currentError: "",
			});	
		}	
	}

	formSubmittable = () => {
		switch(this.state.currentPage) {
		case "host":
			if (this.state.hostStartNew) {
				return this.state.hostPassword.length > 0;
			} else {
				return this.state.hostCode.length > 0 && this.state.hostPassword.length > 0;
			}
		case "join":
			return this.state.joinCode.length > 0 && this.state.joinName.length > 0;
		case "display":
			return this.state.displayCode.length > 0;
		default:
			return false;
		}
	}
	

	setHostStartNew = (event) => {
		const mode = (event.target.value === "new");
		this.setState({
			hostStartNew: mode,
		});
	}

	setHostTitle = (event) => {
		this.setState({hostTitle: event.target.value});
	}

	setHostGame = (event) => {
		this.setState({hostGame: event.target.value});
	}

	setHostPassword = (event) => {
		this.setState({hostPassword: event.target.value});
	}

	setHostCode = (event) => {
		this.setState({hostCode: event.target.value});
	}



	setJoinCode = (event) => {
		this.setState({joinCode: event.target.value});
	}

	setJoinName = (event) => {
		this.setState({joinName: event.target.value});
	}



	setDisplayCode = (event) => {
		this.setState({displayCode: event.target.value});
	}


	submitHostNew = () => {
		this.setState({currentError: ""});
		axios.post("/host", {
			gametitle: this.state.hostTitle,
			format: this.state.hostGame,
			password: this.state.hostPassword,
		}).then(res => {
			if (res) {
				console.log("Response Received: ");
				console.log(res);
				window.location.href = res.data;
			}
			
		}).catch(err => {
			if (err) {
				this.setState({currentError: err.response.data});
			}
		});
	}

	submitHostResume = () => {
		this.setState({currentError: ""});
		axios.post("/hostresume", {
			gamecode: this.state.hostCode,
			password: this.state.hostPassword,
		}).then((res) => {
			if (res) {
				console.log("Response Received: ");
				console.log(res);
				window.location.href = res.data;
			}
			
		}).catch((err) => {
			if (err) {
				this.setState({currentError: err.response.data});
			}
		});
	}

	submitJoin = () => {
		this.setState({currentError: ""});
		axios.post("/play", {
			gamecode: this.state.joinCode,
			name: this.state.joinName,
		}).then(res => {
			if (res) {
				console.log("Response Received: ");
				console.log(res);
				window.location.href = res.data;
			}
			
		}).catch(err => {
			if (err) {
				this.setState({currentError: err.response.data});
			}
		});
	}

	submitDisplay = () => {
		this.setState({currentError: ""});
		axios.post("/display", {
			gamecode: this.state.displayCode,
		}).then(res => {
			if (res) {
				console.log("Response Received: ");
				console.log(res);
				window.location.href = res.data;
			}
			
		}).catch(err => {
			if (err) {
				this.setState({currentError: err.response.data});
			}
		});
	}



	render = () => {
		var error;
		var errorText;
		const {heading} = this.availablePages.find((a) => a.name === this.state.currentPage);

		var content;
		switch(this.state.currentPage) {
		case "home":
			content = (
				<div className="content">
					<a className="button" onClick={() => this.goToPage("host")}>Start a Game</a>
					<a className="button" onClick={() => this.goToPage("join")}>Play a Game</a>
					<a className="button" onClick={() => this.goToPage("display")}>Display a Game</a>
					<a className="button" onClick={() => this.goToPage("minigames")}>Minigames</a>
					<div className="subLink">
						<a href="about.html">ABOUT</a>
					</div>
				</div>
			);
			break;
		case "host":
			var form;
			if (this.state.hostStartNew) {
				form = (
					<div id="formDiv">
						<form onSubmit={this.submitHostNew}>
							<input type="text" value={this.state.hostTitle} onChange={this.setHostTitle}
								placeholder="Game Title (optional)" name="gametitle"/>
							<input type="password" value={this.state.hostPassword} onChange={this.setHostPassword}
								placeholder="Set a Password for Hosting" name="password"/>
							<p>Format of game:</p>
							<select value={this.state.hostGame} onChange={this.setHostGame} name="format">
								{this.hostableGames.map((g) => {
									return <option key={g.folder} value={g.folder}>{g.name}</option>;
								})}
							</select>
							
							<br/>
							<a className={this.formSubmittable() ? "button" : "button inactive"}
								onClick={this.formSubmittable() ? this.submitHostNew : null}>
								Let's Play!
							</a>
						</form>
					</div>
				);
			} else {
				form = (
					<div id="formDiv">
						<form onSubmit={this.submitHostResume}>
							<input type="text" value={this.state.hostCode} onChange={this.setHostCode}
								placeholder="Game Code" name="gamecode"/>
							<input type="password" value={this.state.hostPassword} onChange={this.setHostPassword}
								placeholder="Enter this game's password" name="password"/>
							
							<br/>
							<a className={this.formSubmittable() ? "button" : "button inactive"}
								onClick={this.formSubmittable() ? this.submitHostResume : null}>
								Let's Play!
							</a>
						</form>
					</div>
				);
			}
			if (this.state.currentError) {
				switch(this.state.currentError) {
				case "roomNotFound":
					errorText = "This game could not be found. Note that games which haven't been touched in over 24 hours are marked for eventual deletion.";
					break;
				case "wrongPassword":
					errorText = "The password you just entered doesn't match the one given when this game was created.";
					break;
				default:
					errorText = "Sorry, it looks like an unknown error has occurred. Please try again in a bit.";
					break;
				}
				error = (
					<div className="error">
						<p>{errorText}</p>
					</div>
				)
			}
			content = (
				<div className="content">
					<div className="errorDiv">
						{error}
					</div>
					<div className='host-radio-group'>
						<label className={this.state.hostStartNew ? "active" : ""}>
							<input type="radio" value="new"
								checked={this.state.hostStartNew}
								onChange={this.setHostStartNew}/>
							<p>New Game</p>
						</label>
						<label className={!this.state.hostStartNew ? "active" : ""}>
							<input type="radio" value="resume"
								checked={!this.state.hostStartNew}
								onChange={this.setHostStartNew}/>
							<p>Resume Game</p>
						</label>
					</div>
					{form}
					<div className="subLink">
						<a onClick={() => this.goToPage("home")}>BACK</a>
					</div>
				</div>
			);
			break;
		case "join":
			if (this.state.currentError) {
				switch(this.state.currentError) {
				case "roomNotFound":
					errorText = "This game could not be found. Note that games which haven't been touched in over 24 hours are marked for eventual deletion.";
					break;
				case "screenNameTaken":
					errorText = "Somebody else in this game is using that Screen Name. Please choose another one.";
					break;
				default:
					errorText = "Sorry, it looks like an unknown error has occurred. Please try again in a bit.";
					break;
				}
				error = (
					<div className="error">
						<p>{errorText}</p>
					</div>
				)
			}
			content = (
				<div className="content">
					<div id="errorDiv">
						{error}
					</div>
					<div id="formDiv">
						<form onSubmit={this.submitJoin}>
							<input type="text"
								autoComplete="off"
								autoCorrect="off"
								autoCapitalize="off"
								placeholder="Your Game Code"
								name="gamecode"
								id="gamecode-input"
								value={this.state.joinCode}
								onChange={this.setJoinCode}/>
							<br/>
							<input type="text" placeholder="Screen Name" name="name" id="name-input"
								value={this.state.joinName} onChange={this.setJoinName}/>
							<br/>
							<a className={this.formSubmittable() ? "button" : "button inactive"}
								onClick={this.formSubmittable() ? this.submitJoin : null}>
								Let's Play!
							</a>
						</form>
					</div>
					<div className="subLink">
						<a onClick={() => this.goToPage("home")}>BACK</a>
					</div>
				</div>
			);
			break;
		case "display":
			if (this.state.currentError) {
				switch(this.state.currentError) {
				case "roomNotFound":
					errorText = "This game could not be found. Note that games which haven't been touched in over 24 hours are marked for eventual deletion.";
					break;
				default:
					errorText = "Sorry, it looks like an unknown error has occurred. Please try again in a bit.";
					break;
				}
				error = (
					<div className="error">
						<p>{errorText}</p>
					</div>
				)
			}
			content = (
				<div className="content">
					<div id="errorDiv">
						{error}
					</div>
					<div id="formDiv">
						<form onSubmit={this.submitDisplay}>
							<input type="text"
								autoComplete="off"
								autoCorrect="off"
								autoCapitalize="off"
								placeholder="Your Game Code"
								name="gamecode"
								id="gamecode-input"
								value={this.state.displayCode}
								onChange={this.setDisplayCode}/>
							<br/>
							<a className={this.formSubmittable() ? "button" : "button inactive"}
								onClick={this.formSubmittable() ? this.submitDisplay : null}>
								Let's Play!
							</a>
						</form>
					</div>
					<div className="subLink">
						<a onClick={() => this.goToPage("home")}>BACK</a>
					</div>
				</div>
			);
			break;
		case "minigames":
			content = (
				<div className="content">
					{this.minigames.map((m) => {
						return (
							<a className="button" key={m.folder} href={"/" + m.folder + "/display"}>
								{m.name}
							</a>
						);
					})}
					<div className="subLink">
						<a onClick={() => this.goToPage("home")}>BACK</a>
					</div>
				</div>
			);
			break;
		}

		return (
			<div>
				<div id="logo">
					<object style={{width: "auto", height: "100%"}} data="logo-blackred.svg" type="image/svg+xml"></object>
				</div>
				<h1>{heading}</h1>
				{content}
			</div>
		);

		
	}
}

ReactDOM.render(<MainMenu/>, document.getElementById("container"));

