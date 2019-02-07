"use strict";

let Textbox = FunctionObject.new({
	active : false,
	slide : 0,
	displayed : "",
	character : 0,
	dialogue : [],
	details : null,
	response : null, // The selected option when a question is asked
	hoverResponse : null, // Which response the cursor is hovering over
	responsePosition : { x : 0, y : 0 }, // Used to allow for much more natural keyboard input
	style : "standard",
	styles : {
		"standard" : {
			height : 66,
			lineHeight : 16,
			lineSpacing : 0.44,
			padding : {
				horizontal : 12,
				vertical : 8
			},
			margin : {
				horizontal : 0,
				vertical : 10
			}
		},
		"standard (question)" : {
			height : 64,
			lineHeight : 16,
			lineSpacing : 0.44,
			responsesPerRow : 3,
			maxRows : 4,
			buttonProportion : 0.8,
			padding : {
				horizontal : 12,
				vertical : 8
			},
			margin : {
				horizontal : 0,
				vertical : 10
			}
		},
		"standard (list)": {
			height : 64,
			lineHeight : 16,
			lineSpacing : 0.44,
			responsesPerRow : 1,
			maxRows : 4,
			buttonProportion : 0.8,
			padding : {
				horizontal : 12,
				vertical : 8
			},
			margin : {
				horizontal : 0,
				vertical : 10
			}
		},
		"battle" : {
			height : 80,
			lineHeight : 18,
			lineSpacing : 0.7,
			padding : {
				horizontal : 12,
				vertical : 12
			},
			margin : {
				horizontal : 0,
				vertical : 0
			}
		},
		"battle (question)" : {
			height : 32,
			lineHeight : 10,
			lineSpacing : 0.7,
			responsesPerRow : 2,
			maxRows : 2,
			buttonProportion : 0.6,
			padding : {
				horizontal : 12,
				vertical : 12
			},
			margin : {
				horizontal : 0,
				vertical : 0
			}
		}
	},
	finished : null,
	standardInterval : "manual"/* 0.8 * Time.seconds */,
	pausing : false,
	after : null,
	scrollSpeed : 1 / (Time.framerate * 0.2),
	appearanceSpeed : 1 / (Time.framerate * 0.2),
	lowestVisibleLine : null,
	canvas : null,
	measurement : null,
	messages : 0,
	namedDialogue : {}, // Allows the textbox to remember the user's last response to dialogue like "Fight, Run, Bag, etc."
	commands : {
		formatting : {
			"colour" : {
				type : "string",
				default : "white"
			},
			"size" : {
				type : "number",
				default : function (style) {
					return (style || Textbox.currentStyle()).lineHeight;
				}
			},
			"weight" : {
				type : "string",
				default : function () {
					return Settings._("font => weight");
				}
			},
			"style" : {
				type : "string",
				default : ""
			}
		},
		entities : {
			"image" : {}
		}
	},
	setStyle : function (style) {
		Textbox.style = style;
	},
	currentStyle : function () {
		if (Textbox.dialogue.notEmpty()) {
			return Textbox.styles._(Textbox.dialogue.first().style);
		} else {
			return Textbox.styles._(Textbox.style);
		}
	},
	metrics : function (style) {
		var styleForMetrics = (arguments.length < 1 ? Textbox.currentStyle() : style);
		var textboxWidth = Settings._("screen dimensions => width"), textboxHeight = Settings._("screen dimensions => height");
		var metrics = {
			left : styleForMetrics.margin.horizontal,
			top : null, // Calculate top after height
			width : textboxWidth - styleForMetrics.margin.horizontal * 2,
			height : styleForMetrics.height,
			inner : {
				left : styleForMetrics.margin.horizontal + styleForMetrics.padding.horizontal,
				top : null,
				width : textboxWidth - (styleForMetrics.margin.horizontal + styleForMetrics.padding.horizontal) * 2,
				height : styleForMetrics.height - styleForMetrics.padding.vertical * 2
			}
		};
		metrics.top = textboxHeight - (styleForMetrics.margin.vertical + metrics.height) * Textbox.slide;
		if (Textbox.dialogue.notEmpty() && Textbox.dialogue.first().responses.notEmpty()) {
			metrics.response = {
				major : {
					height : Math.round((styleForMetrics.lineHeight + styleForMetrics.padding.vertical * 2) * styleForMetrics.buttonProportion)
				},
				minor : {
					height : Math.round((styleForMetrics.lineHeight + styleForMetrics.padding.vertical * 2) * styleForMetrics.buttonProportion * (2 / 3))
				}
			};
			metrics.top -= (Math.ceil(Math.min(Textbox.dialogue.first().minorResponses, styleForMetrics.maxRows * styleForMetrics.responsesPerRow) / styleForMetrics.responsesPerRow) * metrics.response.major.height + Math.ceil((Textbox.dialogue.first().responses.length - Textbox.dialogue.first().minorResponses) / styleForMetrics.responsesPerRow) * metrics.response.minor.height) * Textbox.slide;
		}
		metrics.inner.top = metrics.top + styleForMetrics.padding.vertical;
		return metrics;
	},
	currentIndex : function () {
		return Textbox.dialogue.last().id;
	},
	say : function (text, progress, trigger, pause, after, delayPreparation) {
		/*
			text : The text to display,
				The text is a normal JavaScript string, optionally containing certain command tags:
				<TAG-NAME-HERE: TAG-VALUE-HERE> makes all text after that tag have that value
				<TAG-NAME-HERE:> makes all text after that tag have the value of the previous tag (tags stack)
				<TAG-NAME-HERE::> makes all text after that tag have the default value for that tag

				<colour: COLOUR-NAME-HERE> will make all text after that tag coloured
				<size: SIZE-IN-PIXELS-HERE> will make all text after that tag a different size
				<weight: bold> will make all text after that tag bold
				<style: italic> will make all text after that tag italic
				<image: IMAGE-PATH-HERE> will display an inline image at that point in the text
			progress : How long to wait after displaying all the text before continuing ("manual" will require input from the user),
			trigger : A function to execute before continuing,
			pause : A condition to wait upon before finishing,
			after : A function to execute after pause has been satisfied
			delayPreparation : Used to make sure the style of the textbox is the correct one at any correct time
		*/
		var message = {}, styling = {}, entities = [], wrappedText = text;
		forevery(Textbox.commands.formatting, function (settings, command) {
			styling[command] = {};
		});
		if (text !== null) {
			text = "" + text.trim();
			var replacements = Settings._("text replacements").data;
			forevery(Settings._("text replacements"), function (replacement, original) {
				var wordReplacement = /^\w+$/.test(original);
				// Word replacements are not allowed to occur if they are part of a larger word — otherwise, matches inside a word may be replaced
				if (!wordReplacement) {
					text = text.replace(new RegExp("(\\\\)?(" + original + ")", "g"), function (match, escaped, text) {
						return escaped ? original : replacement;
					});
				} else {
					text = text.replace(new RegExp("(^|[^a-zA-Z0-9])(\\\\)?(" + original + ")(?:\\b)", "g"), function (match, start, escaped, text) {
						return start + (escaped ? original : replacement);
					});
				}
			});
			var regex, exclusive, position, value = null, previousValue, valueStack = [];
			forevery(Textbox.commands, function (subcommands, commandType) {
				forevery(subcommands, function (settings, command) {
					regex = new RegExp("<" + command + ": ?(.*?)>", "i");
					exclusive = text;
					forevery(Textbox.commands.formatting, function (__, exclude) {
						if (exclude === command)
							return;
						exclusive = exclusive.replace(new RegExp("<" + exclude + ": ?(.*?)>", "gi"), "");
					});
					while ((position = exclusive.search(regex)) > -1) {
						previousValue = value;
						value = regex.exec(exclusive)[1];
						if (commandType === "formatting") {
							if (value === "" && valueStack.notEmpty())
								value = valueStack.pop();
							else if (value === ":" || (value === "" && valueStack.empty()))
								value = "default";
							else if (previousValue)
								valueStack.push(previousValue);
							styling[command][position] = value;
							if (styling[command][position] !== "default") {
								switch (settings.type) {
									case "string":
										break;
									case "number":
										styling[command][position] = parseFloat(styling[command][position]);
										break;
								}
							}
						} else {
							var entity = {
								entity : value,
								position : position
							};
							entities.push(entity);
							if (command === "image")
								Sprite.load(value, function () {
									message.text = Textbox.wrap(text, styling, entities);
								}, function(entity){ return function () {
									entities.remove(entities.indexOf(entity));
								}; }(entity));
						}
						exclusive = exclusive.replace(regex, "");
					}
					text = text.replace(new RegExp(regex.source, "gi"), "");
				});
			});
			wrappedText = Textbox.wrap(text, styling, entities);
		}
		message = {
			id : Textbox.messages ++,
			text : wrappedText,
			style : Textbox.style,
			styling : styling,
			entities : entities,
			responses : [],
			progress : (arguments.length > 1 && progress !== null ? progress : "manual"),
			trigger : trigger,
			pause : pause,
			after : after
		};
		Textbox.active = true;
		Textbox.dialogue.push(message);
		if (Textbox.dialogue.length === 1 && !delayPreparation)
			Textbox.prepareNextMessage();
		return message.id;
	},
	speech : function (texts, progress, trigger, pause, after, delayPreparation) {
		// Textbox.say() that accepts arrays of text
		foreach(wrapArray(texts), function (text) {
			Textbox.say(text, progress, trigger, pause, after, delayPreparation);
		});
	},
	spiel : function (texts, trigger, pause, after, delayPreparation) {
		// Textbox.state() that accepts arrays of text
		foreach(wrapArray(texts), function (text) {
			Textbox.state(text, trigger, pause, after, delayPreparation);
		});
	},
	insertAfter : function (id, position) {
		var message = Textbox.messageWithId(id), position = Textbox.messageIndexForId(position);
		if (position !== null) {
			Textbox.remove(id);
			Textbox.dialogue.insert(position + 1, message);
			return id;
		} else
			return null;
	},
	messageWithId : function (id) {
		var found = null;
		foreach(Textbox.dialogue, function (message) {
			if (message.id === id) {
				found = message;
				return true;
			}
		});
		return found;
	},
	messageIndexForId : function (id) {
		var found = null;
		foreach(Textbox.dialogue, function (message, i) {
			if (message.id === id) {
				found = i;
				return true;
			}
		});
		return found;
	},
	state : function (text, trigger, pause, after, delayPreparation) {
		// Automatically progresses text. Useful for in battles.
		return Textbox.say(text, Textbox.standardInterval, trigger, pause, after, delayPreparation);
	},
	stateUntil : function (text, until) {
		return Textbox.say(text, until);
	},
	effect : function (trigger, pause, after) {
		return Textbox.say(null, Textbox.standardInterval, trigger, pause, after);
	},
	ask : function (query, responses, callback, minors, defaultResponse, hotkeys, name, hover, showTextImmediately) {
		if (!/ \((question|list)\)$/.test(Textbox.style)) {
			Textbox.style += " (question)";
		}
		var latest = Textbox.messageWithId(Textbox.say(query, null, null, null, null, true));
		Textbox.style = Textbox.style.replace(/ \((question|list)\)$/, "");
		responses = wrapArray(responses);
		if (arguments.length >= 4 && minors !== null && typeof minors !== "undefined")
			latest.responses = responses.concat(wrapArray(minors));
		else
			latest.responses = responses;
		latest.callback = callback;
		latest.minorResponses = responses.length;
		if (arguments.length >= 5 && defaultResponse !== null && typeof defaultResponse !== "undefined") {
			if (typeof defaultResponse === "number")
				latest.defaultResponse = Math.clamp(0, defaultResponse, latest.responses.length - 1);
			else if (latest.responses.contains(defaultResponse))
				latest.defaultResponse = latest.responses.indexOf(defaultResponse);
			else
				latest.defaultResponse = null;
		} else
			latest.defaultResponse = null;
		if (arguments.length >= 6 && hotkeys !== null && typeof hotkeys !== "undefined") {
			forevery(hotkeys, function (response, key, deletion) {
				if (typeof response === "number") {
					if (response < 0 || response >= latest.responses.length)
						deletion.push(key);
				} else {
					if (latest.responses.contains(response))
						hotkeys[key] = latest.responses.indexOf(response);
					else
						deletion.push(key);
				}
			});
			latest.hotkeys = hotkeys;
		} else
			latest.hotkeys = {};
		if (arguments.length >= 7 && name !== null && typeof name !== "undefined") {
			if (Textbox.namedDialogue.hasOwnProperty(name)) {
				if (latest.defaultResponse === null) {
					latest.defaultResponse = Textbox.namedDialogue[name];
					latest.defaultResponse = Math.clamp(0, latest.defaultResponse, latest.responses.length - 1);
				}
			} else {
				Textbox.namedDialogue[name] = null;
			}
			latest.name = name;
		}
		if (arguments.length >= 8 && hover !== null && typeof hover !== "undefined")
			latest.hover = hover;
		if (arguments.length >= 9 && showTextImmediately !== null && typeof showTextImmediately !== "undefined")
			latest.showTextImmediately = showTextImmediately;
		Textbox.prepareNextMessage();
		return latest.id;
	},
	list : function (query, responses, callback, minors, defaultResponse, hotkeys, name, hover, showTextImmediately) {
		var newStyle = Textbox.style.replace(/ \((question|list)\)$/, "") + " (list)";
		if (Textbox.styles.hasOwnProperty(newStyle)) {
			Textbox.style = newStyle;
		}
		return Textbox.ask(query, responses, callback, minors, defaultResponse, hotkeys, name, hover, showTextImmediately);
	},
	confirm : function (query, callback, defaultResponse, name, hover, showTextImmediately) {
		var hotkeys = {};
		hotkeys[Settings._("keys => secondary")] = "No";
		return Textbox.ask(query, ["No", "Yes"], function (response, i) {
			callback(response === "Yes");
		}, null, defaultResponse, hotkeys, name, hover, showTextImmediately);
	},
	remove : function (id) {
		var found = Textbox.messageIndexForId(id);
		if (found !== null)
			Textbox.dialogue.remove(found);
	},
	removeEffects : function (id) {
		var found = Textbox.messageIndexForId(id);
		if (found !== null) {
			Textbox.dialogue[found].trigger = null;
			Textbox.dialogue[found].pause = null;
			Textbox.dialogue[found].after = null;
			if (Textbox.dialogue[found].text === null)
				Textbox.remove(id);
		}
	},
	newStyleContext : function (style) {
		var styleContext = {};
		forevery(Textbox.commands.formatting, function (settings, command) {
			styleContext[command] = (typeof settings.default !== "function" ? settings.default : settings.default(style));
		});
		return styleContext;
	},
	updateStyleContext : function (styleContext, styling, position, style) {
		forevery(Textbox.commands.formatting, function (settings, command) {
			if (styling[command].hasOwnProperty(position)) {
				styleContext[command] = styling[command][position];
				if (styleContext[command] === "default")
					styleContext[command] = (typeof Textbox.commands.formatting[command].default !== "function" ? Textbox.commands.formatting[command].default : Textbox.commands.formatting[command].default(style));
			}
		});
	},
	wrap : function (text, styling, entities, _width) {
		var context = Textbox.canvas.getContext("2d");
		var style = Textbox.styles._(Textbox.style), metrics = Textbox.metrics(style), boundsWidth = (arguments.length < 4 ? metrics.inner.width : _width), styleContext = Textbox.newStyleContext(style);
		entities = entities.slice(0);
		for (var i = 0, width = 0, character, breakpoint = null, softBreakpoint = null; i < text.length; ++ i) {
			character = text[i];
			if (character === "\n") {
				breakpoint = softBreakpoint = null;
				width = 0;
			}
			while (entities.notEmpty() && entities.first().position === i) {
				var dimensions = Sprite.load(entities.shift().entity);
				if (dimensions) {
					width += dimensions.width;
				}
			}
			if (character === "\n")
				continue;
			if (/\s/.test(character))
				breakpoint = i;
			if (arguments.length < 4) {
				Textbox.updateStyleContext(styleContext, styling, i, style);
				context.font = Font.loadFromStyle(styleContext);
			}
			width += context.measureTextHD(text[i]).width;
			if (width > boundsWidth) {
				if (breakpoint) {
					text = text.substr(0, breakpoint) + "\n" + text.substr(breakpoint + 1);
					i = breakpoint;
					breakpoint = softBreakpoint = null;
					width = 0;
				} else if (softBreakpoint) {
					text = text.substr(0, softBreakpoint + 1) + "-\n" + text.substr(softBreakpoint + 1);
					i = softBreakpoint;
					breakpoint = softBreakpoint = null;
					width = 0;
				}
			} else if (width + context.measureTextHD("-").width <= boundsWidth) {
				softBreakpoint = i;
			}
		}
		return text;
	},
	splitAtPositions : function (string, positions, offset) {
		var strings = [], previousPosition = 0;
		foreach(positions, function (position) {
			if (position - offset <= string.length) {
				if (position - offset >= 0)
					strings.push(string.substring(previousPosition - offset, (previousPosition = position) - offset));
			} else
				return true;
		});
		strings.push(string.substring(previousPosition - offset));
		return strings;
	},
	heightsOfLines : function () {
		if (Textbox.dialogue.notEmpty() && Textbox.dialogue.first().text !== null) {
			var lines = Textbox.dialogue.first().text.split("\n"), partitionPositions = [], partitions, characters = 0;
			forevery(Textbox.dialogue.first().styling, function (details) {
				forevery(details, function (__, position) {
					partitionPositions.push(parseInt(position));
				});
			});
			partitionPositions.sort(function (a, b) { return a - b; });
			var style = Textbox.currentStyle(), styleContext = Textbox.newStyleContext(), lineHeights = [];
			foreach(lines, function (line, lineNumber) {
				partitions = Textbox.splitAtPositions(line, partitionPositions, characters);
				var maximumPartitionHeight = 0;
				foreach(partitions, function (part) {
					Textbox.measurement.innerHTML = "";
					Textbox.updateStyleContext(styleContext, Textbox.dialogue.first().styling, characters);
					Textbox.measurement.font = Font.loadFromStyle(styleContext);
					Textbox.measurement.appendChild(document.createTextNode(part));
					maximumPartitionHeight = Math.max(maximumPartitionHeight, Textbox.measurement.getBoundingClientRect().height);
					characters += part.length;
				});
				lineHeights.push(maximumPartitionHeight * (lineNumber > 0 ? 1 + style.lineSpacing : 1));
			});
			return lineHeights;
		}
		return [];
	},
	currentlyVisibleLines : function (descending) {
		if (Textbox.dialogue.notEmpty() && Textbox.dialogue.first().text !== null) {
			var metrics = Textbox.metrics(), style = Textbox.currentStyle(), lineHeights = Textbox.heightsOfLines(), visibleLines = 0, cumulativeHeight = lineHeights[Math.ceil(Textbox.lowestVisibleLine)] * (Textbox.lowestVisibleLine - Math.floor(Textbox.lowestVisibleLine)), totalHeight = sum(lineHeights, Textbox.lowestVisibleLine + 1);
			if (cumulativeHeight <= metrics.height - style.padding.vertical * 2) {
				visibleLines += Textbox.lowestVisibleLine - Math.floor(Textbox.lowestVisibleLine);
				for (var i = Math.floor(Textbox.lowestVisibleLine); (descending ? i < lineHeights.length : i >= 0); i += (descending ? 1 : -1)) {
					if ((cumulativeHeight += lineHeights[i]) <= metrics.height - style.padding.vertical * 2)
						++ visibleLines;
					else
						break;
				}
			}
			return {
				visibleLines : visibleLines,
				cumulativeHeight : cumulativeHeight,
				totalHeight : totalHeight
			};
		}
		return 0;
	},
	progress : function (automatic) {
		if (Textbox.dialogue.length === 0 || Textbox.pausing || Textbox.lowestVisibleLine !== Math.floor(Textbox.lowestVisibleLine) || (!automatic && (Textbox.dialogue.first().progress !== "manual" || Textbox.dialogue.first().text === null)))
			return;
		if (Textbox.dialogue.first().text === null || (Textbox.lowestVisibleLine === Textbox.dialogue.first().text.split("\n").length - 1 && Textbox.displayed.length === Textbox.dialogue.first().text.length)) {
			if (Textbox.dialogue.first().responses.length && !automatic) {
				var response;
				if (Textbox.hoverResponse !== null || (Input.controlScheme === "keyboard" && Textbox.response !== null)) {
					response = (Textbox.hoverResponse !== null ? Textbox.hoverResponse : Textbox.response);
					Textbox.canvas.classList.remove("hover");
					if (Textbox.dialogue.first().hasOwnProperty("name"))
						Textbox.namedDialogue[Textbox.dialogue.first().name] = response;
					Textbox.dialogue.first().callback(Textbox.dialogue.first().responses[response], response, response < Textbox.dialogue.first().minorResponses);
				} else
					return;
			}
			var returned = null;
			if (Textbox.dialogue.first().trigger)
				returned = Textbox.dialogue.first().trigger();
			if (returned !== null && typeof returned === "object" && !Textbox.dialogue.first().pause) {
				Textbox.dialogue.first().pause = function () { return returned.completed; };
			}
			if (Textbox.dialogue.first().pause) {
				Textbox.pausing = Textbox.dialogue.first().pause;
				if (Textbox.dialogue.first().after)
					Textbox.after = Textbox.dialogue.first().after;
			}
			Textbox.dialogue.shift();
			Textbox.displayed = "";
			Textbox.character = 0;
			Textbox.prepareNextMessage();
			Textbox.requestRedraw = true;
		} else {
			if (Textbox.displayed.split("\n").length - 1 > Textbox.lowestVisibleLine)
				Textbox.lowestVisibleLine += Math.clamp(0, Textbox.scrollSpeed, 1);
		}
	},
	prepareNextMessage : function () {
		if (Textbox.dialogue.notEmpty()) {
			if (Textbox.dialogue.first().text !== null) {
				if (Textbox.dialogue.first().responses.notEmpty()) {
					// Select default response
					Textbox.selectResponse(Textbox.dialogue.first().defaultResponse !== null ? Textbox.dialogue.first().defaultResponse : 0);
				}
				if (Textbox.dialogue.first().showTextImmediately)
					Textbox.character = Textbox.dialogue.first().text.length - 1;
				Textbox.lowestVisibleLine = 0;
				Textbox.lowestVisibleLine = Math.max(0, Textbox.currentlyVisibleLines(true).visibleLines - 1);
			}
		}
	},
	responsesOnRow : function (y) {
		if (arguments.length < 1)
			y = Textbox.responsePosition.y;
		var style = Textbox.currentStyle(), majorResponses = Textbox.dialogue.first().minorResponses, minorResponses = Textbox.dialogue.first().responses.length - Textbox.dialogue.first().minorResponses, majorRows = Math.ceil(majorResponses / style.responsesPerRow);
		return y < majorRows ? (majorResponses % style.responsesPerRow !== 0 && y === Math.floor(majorResponses / style.responsesPerRow) ? majorResponses % style.responsesPerRow : style.responsesPerRow) : (minorResponses % style.responsesPerRow !== 0 && y - majorRows === Math.floor(minorResponses / style.responsesPerRow) ? minorResponses % style.responsesPerRow : style.responsesPerRow);
	},
	selectResponse : function (response) {
		Textbox.response = response;
		var style = Textbox.currentStyle(), majorResponses = Textbox.dialogue.first().minorResponses;
		Textbox.responsePosition.y = (response < majorResponses ? Math.floor(response / style.responsesPerRow) : Math.ceil(majorResponses / style.responsesPerRow) + Math.floor((response - majorResponses) / style.responsesPerRow));
		Textbox.responsePosition.x = (response < majorResponses ? (response - Textbox.responsePosition.y * style.responsesPerRow + 0.5) : (response - majorResponses - (Textbox.responsePosition.y - Math.ceil(majorResponses / style.responsesPerRow)) * style.responsesPerRow + 0.5)) / Textbox.responsesOnRow();
		Textbox.requestRedraw = true;
	},
	selectAdjacent : function (direction) {
		if (Textbox.dialogue.length && Textbox.dialogue.first().responses.length) {
			if (Textbox.response === null)
				Textbox.response = 0;
			else {
				var style = Textbox.currentStyle(), majorResponses = Textbox.dialogue.first().minorResponses, minorResponses = Textbox.dialogue.first().responses.length - Textbox.dialogue.first().minorResponses, majorRows = Math.ceil(majorResponses / style.responsesPerRow), minorRows = Math.ceil(minorResponses / style.responsesPerRow);
				switch (direction) {
					case Directions.up:
						-- Textbox.responsePosition.y;
						break;
					case Directions.down:
						++ Textbox.responsePosition.y;
						break;
				}
				Textbox.responsePosition.y = Math.mod(Textbox.responsePosition.y, majorRows + minorRows);
				var responsesOnRow = Textbox.responsesOnRow();
				switch (direction) {
					case Directions.right:
						Textbox.responsePosition.x += 1 / responsesOnRow;
						break;
					case Directions.left:
						Textbox.responsePosition.x -= 1 / responsesOnRow;
					break;
				}
				Textbox.responsePosition.x = Math.mod(Textbox.responsePosition.x, 1);
				if (Textbox.responsePosition.y < Math.ceil(majorResponses / style.responsesPerRow)) {
					Textbox.response = Textbox.responsePosition.y * style.responsesPerRow + Math.round(Textbox.responsePosition.x * responsesOnRow - 0.5);
				} else {
					Textbox.response = majorResponses + (Textbox.responsePosition.y - Math.ceil(majorResponses / style.responsesPerRow)) * style.responsesPerRow + Math.round(Textbox.responsePosition.x * responsesOnRow - 0.5);
				}
			}
		}
		Textbox.requestRedraw = true;
	},
	key : function (keys) {
		if (Textbox.dialogue.length && Textbox.dialogue.first().responses.length) {
			if (Textbox.dialogue.first().hotkeys.hasOwnProperty(keys))
				Textbox.selectResponse(Textbox.dialogue.first().hotkeys[keys]);
		}
	},
	clear : function () {
		Textbox.dialogue = [];
		Textbox.displayed = "";
		Textbox.character = 0;
		Textbox.requestRedraw = true;
	}
}, {
	initialise : function () {
		_method(Textbox.styles);
		Textbox.measurement = document.createElement("div");
		Textbox.measurement.style.opacity = 0;
		Textbox.measurement.style.position = "absolute";
		document.body.appendChild(Textbox.measurement);
		Keys.addHandler(function (key, pressed, released) {
			if (pressed || released)
				Textbox.requestRedraw = true;
		}, Settings._("keys => tertiary"), true);
	},
	update : function () {
		if (Textbox.pausing && Textbox.pausing()) {
			if (Textbox.after)
				Textbox.after();
			Textbox.pausing = false;
			Textbox.after = null;
		}
		var slideBefore = Textbox.slide;
		if (Textbox.dialogue.notEmpty()) {
			var nullMessage = (Textbox.dialogue.first().text === null);
			if (Textbox.slide === 1 && !Textbox.pausing && !nullMessage) {
				if (Textbox.displayed.length < Textbox.dialogue.first().text.length) {
					var maxLength = 0;
					foreach(Textbox.dialogue.first().text.split("\n"), function (line, number) {
						if (number > Math.floor(Textbox.lowestVisibleLine))
							return true;
						maxLength += line.length + 1;
					});
					Textbox.character += Settings._("text speed");
					if (Textbox.character + 1 < Textbox.dialogue.first().text.length) {
						if (Textbox.dialogue.first().text[Textbox.character + 1] === "\n") // If the next character is a newline, display that immediately to prevent unresponsiveness
							++ Textbox.character;
					}
					Textbox.character = Math.clamp(0, Textbox.character, Math.min(maxLength, Textbox.dialogue.first().text.length));
					Textbox.displayed = Textbox.dialogue.first().text.substr(0, Math.floor(Textbox.character));
					Textbox.requestRedraw = true;
				}
			}
			if (Textbox.dialogue.first().responses.notEmpty() && Cursor.lastMoved <= 1)
				Textbox.requestRedraw = true;
			// Null text means no text is going to be displayed, and the Textbox is just being used to initiate an event
			if ((nullMessage || Textbox.displayed.length === Textbox.dialogue.first().text.length || Textbox.dialogue.first().text.split("\n").length - 1 === Textbox.lowestVisibleLine) && Textbox.finished === null) {
				Textbox.finished = performance.now();
			}
			if (((nullMessage && performance.now() >= Textbox.finished) || (Textbox.dialogue.first().progress !== "manual" && typeof Textbox.dialogue.first().progress === "number" && performance.now() >= Textbox.finished + Textbox.dialogue.first().progress)) && Textbox.finished !== null) {
				Textbox.progress(true);
				Textbox.finished = null;
			} else if (Textbox.dialogue.first().progress !== "manual" && typeof Textbox.dialogue.first().progress === "function" && Textbox.dialogue.first().progress() && Textbox.finished !== null) {
				Textbox.progress(true);
				Textbox.finished = null;
			}
			if (Textbox.slide < 1)
				Textbox.slide += Textbox.appearanceSpeed;
			if (Textbox.slide === 1 && Textbox.lowestVisibleLine !== Math.floor(Textbox.lowestVisibleLine))
				Textbox.lowestVisibleLine = Math.clamp(Math.floor(Textbox.lowestVisibleLine), Textbox.lowestVisibleLine + Textbox.scrollSpeed, Math.floor(Textbox.lowestVisibleLine) + 1);
		}
		if (Textbox.dialogue.empty() && Textbox.slide > 0)
			Textbox.slide = 0;
		Textbox.slide = Math.clamp(0, Textbox.slide, 1);
		if (Textbox.slide === 0)
			Textbox.active = false;
		if (slideBefore !== Textbox.slide)
			Textbox.requestRedraw = true;
	},
	drawing : {
		canvas : {
			selector : "#game-textbox",
			width : Settings._("screen dimensions => width"),
			height : Settings._("screen dimensions => height"),
			className : "centre clickthrough"
		},
		passive : true,
		draw : function (canvas) {
			var context = canvas.getContext("2d");
			// Clear the canvas
			context.clearRectHD(0, 0, canvas.width, canvas.height);
			if (Textbox.slide > 0) {
				// Draw the textbox
				var style = Textbox.currentStyle(), metrics = Textbox.metrics();
				context.fillStyle = "hsla(0, 0%, 0%, 0.8)";
				context.fillRectHD(metrics.left * Game.zoom, metrics.top * Game.zoom, metrics.width * Game.zoom, metrics.height * Game.zoom);
				if (Settings._("debug mode")) {
					context.fillStyle = "hsla(0, 0%, 100%, 0.2)";
					context.fillRectHD(metrics.inner.left * Game.zoom, metrics.inner.top * Game.zoom, metrics.inner.width * Game.zoom, metrics.inner.height * Game.zoom);
				}
				// Draw the text
				if (Textbox.dialogue.notEmpty() && Textbox.dialogue.first().text !== null) {
					var dialogue = Textbox.dialogue.first(), responses = dialogue.responses.length, majorResponses = dialogue.minorResponses, minorResponses = responses - dialogue.minorResponses;
					// Formatting
					context.textAlign = "left";
					context.textBaseline = "alphabetic";
					// Draw the actual characters
					var lines = Textbox.displayed.split("\n"), partitionPositions = [], partitions, characters = 0;
					forevery(Textbox.dialogue.first().styling, function (details) {
						forevery(details, function (__, position) {
							partitionPositions.push(parseInt(position));
						});
					});
					foreach(Textbox.dialogue.first().entities, function (entity) {
						partitionPositions.push(parseInt(entity.position)); // Add two partitions, to fit in the gap between the two
						partitionPositions.push(parseInt(entity.position));
					});
					partitionPositions.sort(function (a, b) { return a - b; });
					var position = {
						x : 0
					}, styleContext = Textbox.newStyleContext(), lineHeights = Textbox.heightsOfLines(), currentLineStatistics = Textbox.currentlyVisibleLines();
					lines = Textbox.displayed.split("\n");
					var entities = Textbox.dialogue.first().entities.slice(0);
					foreach(lines, function (line, lineNumber) {
						partitions = Textbox.splitAtPositions(line, partitionPositions, characters);
						foreach(partitions, function (part) {
							var partitionWidth, verticalPosition = metrics.top + metrics.height - (style.padding.vertical + currentLineStatistics.totalHeight + (currentLineStatistics.totalHeight < metrics.inner.height ? metrics.inner.height - currentLineStatistics.cumulativeHeight : 0)) + sum(lineHeights, lineNumber + 1);
							Textbox.updateStyleContext(styleContext, Textbox.dialogue.first().styling, characters);
							context.font = Font.loadFromStyle(styleContext);
							partitionWidth = context.measureTextHD(part).width;
							if (entities.notEmpty() && entities.first().position === characters) {
								if (Sprite.draw(Textbox.canvas, entities.first().entity, style.margin.horizontal + style.padding.horizontal + position.x, verticalPosition, true)) {
									position.x += Sprite.load(entities.first().entity).width;
								}
								entities.shift();
							}
							context.font = Font.loadFromStyle(styleContext, Game.zoom);
							context.fillStyle = styleContext.colour;
							context.fillTextHD(part, (style.margin.horizontal + style.padding.horizontal + position.x) * Game.zoom, verticalPosition * Game.zoom);
							position.x += partitionWidth;
							characters += part.length;
						});
						position.x = 0;
						characters += 1; // The newline character, which has been removed.
					});
					context.clearRectHD(0, 0, canvas.width, metrics.top * Game.zoom);
					context.clearRectHD(0, (metrics.top + metrics.height) * Game.zoom, canvas.width, canvas.height - (metrics.top - metrics.height) * Game.zoom);
					if (Textbox.displayed.length === dialogue.text.length) {
						context.textAlign = "center";
						context.textBaseline = "middle";
						var responseMetrics = {}, cursorIsOverAResponse = Cursor.inArea(canvas, metrics.left * Game.zoom, (metrics.top + metrics.height) * Game.zoom, metrics.width * Game.zoom, canvas.height - (metrics.top + metrics.height + style.margin.vertical) * Game.zoom);
						Textbox.hoverResponse = null;
						if (cursorIsOverAResponse)
							Textbox.canvas.classList.add("hover");
						else {
							Textbox.canvas.classList.remove("hover");
							if (dialogue.hasOwnProperty("hover"))
								dialogue.hover(null, null);
						}
						var responseOffset = 0, maxResponses = style.maxRows * style.responsesPerRow;
						if (majorResponses > maxResponses) {
							responseOffset = Math.max(0, Math.ceil(Math.min(majorResponses - maxResponses, Math.floor(Textbox.response - maxResponses / 2)) / style.responsesPerRow) * style.responsesPerRow);
						}
						for (var response = responseOffset, responsesOfKind, relativeResponse, selected, hovered, isMajor; response < responses; ++ response) {
							isMajor = response < majorResponses;
							if (!(response - responseOffset < maxResponses || response >= majorResponses) && isMajor) {
								continue;
							}
							responsesOfKind = isMajor ? majorResponses : minorResponses;
							relativeResponse = isMajor ? response - responseOffset : response - majorResponses;
							responseMetrics.width = Math.ceil(metrics.width / (responsesOfKind % style.responsesPerRow !== 0 && relativeResponse >= responsesOfKind - (responsesOfKind % style.responsesPerRow) ? responsesOfKind % style.responsesPerRow : style.responsesPerRow));
							responseMetrics.x = Math.ceil(metrics.left + (relativeResponse % style.responsesPerRow) * responseMetrics.width);
							responseMetrics.y = metrics.top + metrics.height + (isMajor ? Math.floor(relativeResponse / style.responsesPerRow) * metrics.response.major.height : Math.min(Math.ceil(majorResponses / style.responsesPerRow), style.maxRows) * metrics.response.major.height + Math.floor(relativeResponse / style.responsesPerRow) * metrics.response.minor.height);
							responseMetrics.height = (isMajor ? metrics.response.major : metrics.response.minor).height;
							selected = (hovered = Cursor.inArea(canvas, responseMetrics.x * Game.zoom, responseMetrics.y * Game.zoom, responseMetrics.width * Game.zoom, responseMetrics.height * Game.zoom) && Input.priority === "mouse") || (Input.controlScheme === "keyboard" && Textbox.response === response && (!cursorIsOverAResponse || Input.priority === "keyboard"));
							context.fillStyle = (selected ? "hsla(0, 0%, 100%, 0.8)" : "hsla(0, 0%, 0%, 0.6)");
							context.fillRectHD(responseMetrics.x * Game.zoom, responseMetrics.y * Game.zoom, responseMetrics.width * Game.zoom, responseMetrics.height * Game.zoom);
							var pixelDeficit = 0;
							do {
								context.font = Font.load((isMajor ? metrics.response.major : metrics.response.minor).height * 0.8 * Game.zoom - pixelDeficit);
								pixelDeficit += 1;
							} while (context.measureTextHD(dialogue.responses[response]).width > (responseMetrics.width - 4) * Game.zoom);
							context.fillStyle = (selected ? "black" : "white");
							context.fillTextHD(dialogue.responses[response], (responseMetrics.x + responseMetrics.width / 2) * Game.zoom, (responseMetrics.y + responseMetrics.height / 2) * Game.zoom);
							if (selected) {
								if (hovered)
									Textbox.hoverResponse = response;
								if (dialogue.hasOwnProperty("hover"))
									dialogue.hover(response, isMajor);
							}
						}
						if (responses > 0) {
							var bob = 0; // Math.sin((performance.now() % 500) / 500 * 2 * Math.PI) * 2.5
							var triangleWidth = 10, triangleHeight = 5;
							context.fillStyle = "hsla(0, 0%, 100%, 0.8)";
							if (responseOffset > 0) {
								context.beginPath();
								context.moveToHD((metrics.left + metrics.width / 2) * Game.zoom, (metrics.top + metrics.height - triangleHeight / 2 + bob) * Game.zoom);
								context.lineToHD((metrics.left + metrics.width / 2 + triangleWidth / 2) * Game.zoom, (metrics.top + metrics.height + triangleHeight / 2 + bob) * Game.zoom);
								context.lineToHD((metrics.left + metrics.width / 2 - triangleWidth / 2) * Game.zoom, (metrics.top + metrics.height + triangleHeight / 2 + bob) * Game.zoom);
								context.fill();
							}
							if (responseOffset + maxResponses < majorResponses) {
								var responseHeight = Math.ceil(Math.min(majorResponses, style.maxRows * style.responsesPerRow) / style.responsesPerRow) * metrics.response.major.height;
								context.beginPath();
								context.moveToHD((metrics.left + metrics.width / 2) * Game.zoom, (metrics.top + metrics.height + responseHeight + triangleHeight / 2 - bob) * Game.zoom);
								context.lineToHD((metrics.left + metrics.width / 2 + triangleWidth / 2) * Game.zoom, (metrics.top + metrics.height + responseHeight - triangleHeight / 2 - bob) * Game.zoom);
								context.lineToHD((metrics.left + metrics.width / 2 - triangleWidth / 2) * Game.zoom, (metrics.top + metrics.height + responseHeight - triangleHeight / 2 - bob) * Game.zoom);
								context.fill();
							}
						}
						if (Settings._("debug mode")) {
							context.fillStyle = "hsla(0, 100%, 50%, 0.8)";
							var majorResponses = dialogue.minorResponses;
							context.fillCircle((metrics.left + Textbox.responsePosition.x * metrics.width) * Game.zoom, (metrics.top + metrics.height + (Textbox.response < majorResponses ? Textbox.responsePosition.y + 0.5 : Math.ceil(majorResponses / style.responsesPerRow)) * metrics.response.major.height + (Textbox.response < majorResponses ? 0 : Textbox.responsePosition.y - Math.ceil(majorResponses / style.responsesPerRow) + 0.5) * metrics.response.minor.height) * Game.zoom, 3 * Game.zoom);
						}
					} else if (responses > 0) {
						context.fillStyle = "hsla(0, 0%, 0%, 0.6)";
						context.fillRectHD(0, (metrics.top + metrics.height) * Game.zoom, canvas.width, canvas.height - (metrics.top + metrics.height) * Game.zoom);
					}
					if (Textbox.details) {
						// The drawing function provided is expected to handle differing zoom levels (Game.zoom)
						Textbox.details(context, metrics.left, style.margin.vertical, metrics.width, (metrics.top - style.margin.vertical));
					}
				}
			}
		}
	}
});