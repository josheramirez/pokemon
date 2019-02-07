"use strict";

let Move = {
	category : {
		physical : q = 0,
		special : ++ q,
		status : ++ q,
		none : ++ q,
		all : ++ q
	},
	target : {
		self : q = 0,
		directOpponent : ++ q,
		directTarget : ++ q,
		adjacentAlly : ++ q,
		adjacentOpponent : ++ q,
		farAlly : ++ q,
		farOpponent : ++ q
	},
	targets : {
		// Filled right after Move object declaration
	},
	action : {
		damage : q = 0,
		inflict : ++ q,
		status : ++ q,
		recoil : ++ q,
		weather : ++ q,
		trap : ++ q,
		fn : ++ q,
		message : ++ q
	},
	amount : {
		standard : q = 0,
		fixed : ++ q,
		percentage : ++ q,
		OHKO : ++ q
	},
	context : {
		user : {
			health : q = 0
		},
		target : {
		},
		move : {
			damage : q = 0
		}
	},
	Struggle : {
		number : -1,
		PP : Infinity,
		PPUps : 0
	},
	maximumPP : function (move, PPUps) {
		return Moves[move].PP * (1 + 0.2 * PPUps);
	},
	use : function (move, stage, mover, target, inception) {
		let moveName = move;
		move = Moves._(move);
		if (target instanceof pokemon)
			target = mover.trainer.battle.placeOfPokemon(target);
		var letant = {},
			affectsEntireSideOrBothSides = [Battles.side.near, Battles.side.far, Battles.side.both].contains(target),
			targetPokemon = (target !== NoPokemon && !affectsEntireSideOrBothSides ? mover.trainer.battle.pokemonInPlace(target) : NoPokemon),
			affected = (targetPokemon !== NoPokemon ? mover.trainer.battle.affectedByMove(mover, targetPokemon, move).filter(onlyPokemon) : []),
			completelyFailed = true,
			statedFailureReason = false,
			finalStage = (stage === move.effects.use.length - 1),
			animationEffect = null,
			stateEffect = null,
			modifiedMove = false;
		// If the move won't hit anything, try aiming for a different target
		if (!affectsEntireSideOrBothSides && stage === 0 && affected.empty()) {
			var newTarget = mover.trainer.battle.targetsForMove(mover, move, true);
			if (newTarget.notEmpty()) {
				target = newTarget[0].place;
				targetPokemon = newTarget[0].poke;
				affected = mover.trainer.battle.affectedByMove(mover, targetPokemon, move).filter(onlyPokemon);
			}
		}
		if (!mover.trainer.battle.process) {
			if (finalStage && (!move.classification.contains("_") || moveName === "Struggle")) {
				if (affected.notEmpty() || affectsEntireSideOrBothSides)
					animationEffect = Textbox.state(mover.name() + " used " + moveName + (!affectsEntireSideOrBothSides && move.affects === Move.targets.directTarget && affected.notEmpty() ? " on " + (targetPokemon !== mover ? targetPokemon.name() : mover.selfPronoun()) : "") + "!", function () { return Move.animate(mover, move, stage, targetPokemon, letant); });
				else
					Textbox.state(mover.name() + " tried to use " + moveName + "...");
			} else
				animationEffect = Textbox.effect(function () { return Move.animate(mover, move, stage, targetPokemon, letant); });
			// Makes sure any Display states after the move has been used takes into consideration any movements by any of the Pokémon
			if (targetPokemon !== NoPokemon || affectsEntireSideOrBothSides) {
				Move.renderAnimation(mover, move, stage, targetPokemon, letant);
				var displayRendered = Display.state.save();
				stateEffect = Textbox.effect(function (displayRendered) { return function () { Display.state.load(displayRendered); }; }(displayRendered));
			}
		}
		if (move.effects.hasOwnProperty("letant") && (targetPokemon !== NoPokemon || affectsEntireSideOrBothSides)) {
			var letantData = move.effects.letant(mover, targetPokemon !== NoPokemon ? targetPokemon : target);
			if (typeof letantData === "object")
				letant = letantData;
		}
		if (!letant.hasOwnProperty("failed") || !letant.failed) {
			if (affected.notEmpty()) {
				var missEffect = false;
				foreach(affected, function (targeted) {
					var failed = false, accuracy, evasion;
					if (mover.trainer.battle.triggerEvent(Triggers.move, {
						move : move,
						affected : true
					}, mover, targeted).contains(true)) {
						failed = true;
						statedFailureReason = true;
					} else if (targeted.effectiveness(move.type, move.classification, mover, move.category) === 0) {
						if (!mover.trainer.battle.process) Textbox.state("It doesn't affect " + targeted.name() + "!");
						failed = true;
						statedFailureReason = true;
						missEffect = true;
					} else {
						if (!move.classification.contains("_")) {
							accuracy = (mover.battler.statLevel.accuracy === 0 ? 1 : mover.battler.statLevel.accuracy > 0 ? 1 + (1 / 3) * mover.battler.statLevel.accuracy : 3 / (Math.abs(mover.battler.statLevel.accuracy) + 3));
							evasion = (targeted.battler.statLevel.evasion === 0 ? 1 : targeted.battler.statLevel.evasion > 0 ? 1 + (1 / 3) * targeted.battler.statLevel.evasion : 3 / (Math.abs(targeted.battler.statLevel.evasion) + 3));
						} else {
							accuracy = 1;
							evasion = 1;
						}
						var hit = (!finalStage || (move.hasOwnProperty("accuracy") ? move.accuracy * (accuracy / evasion) >= mover.trainer.battle.random.point() : true));
						if (hit) {
							if (move.effects.use[stage].targets && targeted.battler.protected && !move.piercing) {
								if (!mover.trainer.battle.process) Textbox.state(targeted.name() + " protected " + targeted.selfPronoun() + ".");
								failed = true;
								statedFailureReason = true;
								missEffect = true;
							} else if (move.effects.use[stage].targets && targeted.invulnerable && !move.despite.contains(targeted.invulnerable)) { // Dig, Fly, etc.
								if (!mover.trainer.battle.process) Textbox.state(targeted.name() + " cannot be found!");
								failed = true;
								statedFailureReason = true;
								missEffect = true;
							} else {
								// Actually use the move
								var response = move.effects.use[stage].effect(mover, targeted, letant, 1);
								if (response) {
									if (response.hasOwnProperty("failed") && response.failed)
										failed = true;
									if (response.hasOwnProperty("reason")) {
										if (!mover.trainer.battle.process) Textbox.state(response.reason);
										statedFailureReason = true;
									}
									if (response.hasOwnProperty("modifiedMove") && response.modifiedMove)
										modifiedMove = true;
								}
							}
						} else {
							if (accuracy <= evasion)
								if (!mover.trainer.battle.process) Textbox.state(mover.name() + " missed " + targeted.name() + "!");
							else
								if (!mover.trainer.battle.process) Textbox.state(targeted.name() + " evaded the attack!");
							failed = true;
							statedFailureReason = true;
							missEffect = true;
						}
					}
					if (missEffect && move.effects.hasOwnProperty("miss"))
						move.effects.miss(mover, targeted);
					if (failed) {
						if (move.effects.hasOwnProperty("fail"))
							move.effects.fail(mover, targeted);
						return {
							succeeded : false
						};
					} else
						completelyFailed = false;
				});
			} else if (affectsEntireSideOrBothSides) {
				var response = move.effects.use[stage].effect(mover, target, letant), failed = false;
				if (response) {
					if (response.hasOwnProperty("failed") && response.failed)
						failed = true;
					if (response.hasOwnProperty("modifiedMove") && response.modifiedMove)
						modifiedMove = true;
				}
				if (failed) {
					if (move.effects.hasOwnProperty("fail"))
						move.effects.fail(mover, targeted);
					return {
						succeeded : false
					};
				} else
					completelyFailed = false;
			} else if (!mover.trainer.battle.process) {
				Textbox.state("There was no target for " + mover.name() + " to hit...");
			}
		}
		if (completelyFailed) {
			if (!mover.trainer.battle.process) {
				if (!statedFailureReason)
					Textbox.state("But it failed!");
				if (animationEffect !== null)
					Textbox.removeEffects(animationEffect);
				if (stateEffect !== null) {
					Textbox.remove(mover);
					battler.resetDisplay(mover.battler);
					// Currently commented out because it resets Dive / Dig / etc.
					// foreach(affected, function (targeted) {
					// 	battler.resetDisplay(targeted.battler);
					// });
					var displayRendered = Display.state.save();
					Textbox.effect(function (displayRendered) { return function () { Display.state.load(displayRendered); }; }(displayRendered));
				}
			}
		} else {
			mover.trainer.battle.survey();
		}
		return {
			succeeded : !completelyFailed,
			modifiedMove : modifiedMove
		};
	},
	renderAnimation : function (mover, move, stage, target, letant, track, last) {
		if (move.animation.length - 1 < stage || move.animation[stage].length === 0)
			return;
		var events = JSONCopy(move.animation[stage], true), from = Display.state.save();
		var affectsEntireSideOrBothSides = (target === Battles.side.far || target === Battles.side.near);
		foreach(events.sort(function (a, b) {
			let aLast, bLast;
			if (a.hasOwnProperty("time"))
				aLast = a.time;
			else
				aLast = a.to;
			if (b.hasOwnProperty("time"))
				bLast = b.time;
			else
				bLast = b.to;
			return aLast - bLast;
		}), function (event) {
			if (event.hasOwnProperty("time")) {
				event.animation({
					display : mover.battler.display
				}, !affectsEntireSideOrBothSides ? {
					display : target.battler.display
				} : null, {
					display : View
				}, letant);
			} else {
				event.transition({
					display : mover.battler.display,
					from : Display.pokemonInState(mover, from).battler.display
				}, !affectsEntireSideOrBothSides ? {
					display : target.battler.display,
					from : Display.pokemonInState(target, from).battler.display
				} : null, {
					display : View,
					from : JSONCopy(View)
				}, letant, 1);
			}
		});
		View.reset();
	},
	animate : function (mover, move, stage, target, letant, track, last) {
		if (arguments.length < 6) {
			track = {
				completed : false,
				progress : 0
			};
			if (!Settings._("animated moves") || move.animation.length - 1 < stage || move.animation[stage].length === 0) {
				track.completed = true;
				return track;
			}
			last = 0; // The shortest length an animation can be (100 = 1 second)
		}
		var affectsEntireSideOrBothSides = (target === Battles.side.far || target === Battles.side.near);
		var start = move.animation[stage][track.progress].hasOwnProperty("time") ? move.animation[stage][track.progress].time : move.animation[stage][track.progress].from;
		if (arguments.length < 6 && start > 0) {
			setTimeout(function () { Move.animate(mover, move, stage, target, letant, track, last); }, Time.second * start / 100);
			return track;
		}
		if (move.animation[stage][track.progress].hasOwnProperty("time")) {
			last = Math.max(move.animation[stage][track.progress].time, last);
			move.animation[stage][track.progress].animation({
				display : Display.pokemonInState(mover).battler.display
			}, !affectsEntireSideOrBothSides ? {
				display : Display.pokemonInState(target).battler.display
			} : null, {
				display : View
			}, letant);
		} else {
			last = Math.max(move.animation[stage][track.progress].to, last);
			Move.transition(mover, move, stage, target, letant, track.progress, 0, Display.state.save(Display.state.current));
		}
		++ track.progress;
		var completed = (track.progress === move.animation[stage].length);
		if (completed) {
			setTimeout(function () { View.reset(); track.completed = true; }, Time.second * ((last - start) / 100));
		}
		else {
			var startOfNext = move.animation[stage][track.progress].hasOwnProperty("time") ? move.animation[stage][track.progress].time : move.animation[stage][track.progress].from;
			setTimeout(function () { Move.animate(mover, move, stage, target, letant, track, last); }, Time.second * (startOfNext - start) / 100);
		}
		return track;
	},
	transition : function (mover, move, stage, target, letant, start, progress, from) {
		var affectsEntireSideOrBothSides = (target === Battles.side.far || target === Battles.side.near);
		// There are 100 "duration steps" for every second
		var duration = (move.animation[stage][start].to - move.animation[stage][start].from) / 100, frames = duration * Time.framerate;
		move.animation[stage][start].transition({
			display : Display.pokemonInState(mover).battler.display,
			from : Display.pokemonInState(mover, from).battler.display
		}, !affectsEntireSideOrBothSides ? {
			display : Display.pokemonInState(target).battler.display,
			from : Display.pokemonInState(target, from).battler.display
		} : null, {
			display : View,
			from : JSONCopy(View)
		}, letant, Math.min(1, progress));
		if (progress < 1)
			setTimeout(function () { Move.transition(mover, move, stage, target, letant, start, progress + 1 / frames, from); }, Time.refresh);
		else {
			View.reset();
		}
	},
	damage : function (attacker, target, move, power, type, noCritical) {
		move = Moves._(move);
		var weather = attacker.trainer.battle.weather.current, multiTarget = (attacker.trainer.battle.style === "double");
		power = power || move.power;
		if (arguments.length < 5)
			type = move.type;
		var modifiers = {
			critical : (attacker.trainer.battle.random.chance(attacker.battler.statLevel.critical <= 0 ? 16 : attacker.battler.statLevel.critical === 1 ? 8 : attacker.battler.statLevel.critical === 2 ? 2 : 1) ? 1.5 : 1),
			multiTarget : (multiTarget ? 0.75 : 1),
			weather : ((weather === "intense sunlight" && type === "Fire") || (weather === "rain" && type === "Water") ? 1.5 : (weather === "intense sunlight" && type === "Water") || (weather === "rain" && type === "Fire") ? 0.5 : 1),
			sandstorm : (weather === "sandstorm" && target.ofType("Rock") ? 1.5 : 1),
			STAB : (attacker.ofType(type) ? 1.5 : 1),
			burn : (type === Move.category.physical && attacker.status === "burned" ? 0.5 : 1),
			abilities :  product(attacker.trainer.battle.triggerEvent(Triggers.damage, {
				classification : move.classification,
				type : type,
				contact : move.contact
			}, attacker, attacker))
		};
		if (noCritical)
			modifiers.critical = 1;
		var min = (target.effectiveness(type, move.classification, null, move.category) > 0 ? 1 : 0);
		return {
			damage : Math.min(target.health, Math.max(1, Math.floor(Math.floor(Math.floor((Math.floor((2 * attacker.level * modifiers.critical) / 5 + 2) * power * (move.category === Move.category.physical ? attacker.stats.attack(modifiers.critical === 1 || attacker.battler.statLevel.attack >= 0) : attacker.stats["special attack"](modifiers.critical === 1 || attacker.battler.statLevel["special attack"] >= 0))) / (move.category === Move.category.physical ? target.stats.defence(modifiers.critical === 1 || target.battler.statLevel.defence <= 0) : target.stats["special defence"](modifiers.critical === 1 || target.battler.statLevel["special defence"] <= 0) * modifiers.sandstorm)) / 50 + 2) * modifiers.STAB * modifiers.weather * modifiers.multiTarget * modifiers.burn * target.effectiveness(type, move.classification, null, move.category) * (Math.floor(attacker.trainer.battle.random.number(85, 100)) / 100))) * modifiers.abilities),
			effectiveness : target.effectiveness(type, move.classification, attacker, move.category),
			critical : (modifiers.critical > 1),
			category : move.category,
			infiltrates : move.infiltrates || move.classification.contains("Sound"),
			cause : attacker,
			targets : move.targets
		};
	},
	exactDamage : function (attacker, target, move, damage, type) {
		if (arguments.length === 1)
			return {
				damage : arguments[0],
				effectiveness : 1,
				critical : false,
				category : Move.category.none,
				infiltrates : true,
				cause : NoPokemon,
				targets : Move.target.none
			};
		move = Moves._(move);
		if (arguments.length < 5)
			type = move.type;
		return {
			damage : damage,
			effectiveness : (target.effectiveness(type, move.classification) !== 0 ? 1 : 0),
			critical : false,
			category : move.category,
			infiltrates : move.infiltrates || move.classification.contains("Sound"),
			cause : attacker,
			targets : move.targets
		};
	},
	percentageDamage : function (poke, fraction) {
		return Move.exactDamage(Math.max(1, Math.ceil(poke.stats.health() * fraction)));
	},
	effectiveness : function (attacking, defending, flags) {
		var types = Types;
		if (arguments.length >= 3 && flags.contains("inverse"))
			types = InverseTypes;
		if (types[attacking].hasOwnProperty("strong") && types[attacking].strong.contains(defending))
			return 2;
		if (types[attacking].hasOwnProperty("weak") && types[attacking].weak.contains(defending))
			return 0.5;
		if (types[attacking].hasOwnProperty("ineffective") && types[attacking].ineffective.contains(defending))
			return 0;
		return 1;
	}
};
Move.targets = {
	// A preset list of all the common combinations of targets moves may use
	everyone : [Move.target.self, Move.target.directOpponent, Move.target.adjacentAlly, Move.target.adjacentOpponent, Move.target.farAlly, Move.target.farOpponent],
	allButUser : [Move.target.directOpponent, Move.target.adjacentAlly, Move.target.adjacentOpponent, Move.target.farAlly, Move.target.farOpponent],
	directOpponent : [Move.target.directOpponent],
	adjacentToUser : [Move.target.directOpponent, Move.target.adjacentAlly, Move.target.adjacentOpponent],
	opponents : [Move.target.directOpponent, Move.target.adjacentOpponent, Move.target.farOpponent],
	allies : [Move.target.self, Move.target.adjacentAlly, Move.target.farAlly],
	self : [Move.target.self],
	directTarget : [Move.target.directTarget],
	opponentAndAdjacent : [Move.target.directOpponent, Move.target.adjacentOpponent],
	selfAndAdjacent : [Move.target.self, Move.target.adjacentAlly],
	adjacentAlly : [Move.target.adjacentAlly],
	selfAndTarget : [Move.target.self, Move.target.directTarget],
	noone : [],
	closeBy : [Move.target.self, Move.target.directOpponent, Move.target.adjacentAlly, Move.target.adjacentOpponent],

	 // Special constants
	party : {},
	opposingSide : {},
	alliedSide : {},
	bothSides : {}
};