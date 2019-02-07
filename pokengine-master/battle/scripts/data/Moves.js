"use strict";

let Moves = {
	Confused : {
		type : "Typeless",
		category : Move.category.physical,
		classification : ["_", "special"],
		power : 40,
		contact : true,
		affects : Move.targets.self,
		targets : Move.targets.self,
		effects : {
			use : [
				{
					effect : function (self) {
						self.battler.battle.damage(self, Move.damage(self, self, "Confused"));
					},
					targets : true
				}
			]
		}
	},
	"Struggle" : {
		status : "incomplete",
		description : "",
		type : "Normal",
		category : Move.category.physical,
		classification : ["_", "special"],
		PP : 1,
		power : 50,
		contact : true,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						self.battler.battle.damage(target, Move.damage(self, target, "Struggle"), null, "Typeless");
						self.recoil("Struggle", self.stats.health() / 4);
					},
					targets : true
				}
			]
		}
	},
	"Tackle" : {
		status : "incomplete",
		description : "A physical attack in which the user charges and slams into the target with its whole body.",
		type : "Normal",
		category : Move.category.physical,
		PP : 35,
		power : 50,
		accuracy : 1,
		contact: true,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						self.battler.battle.damage(target, Move.damage(self, target, "Tackle"));
					},
					targets : true
				}
			]
		},
		animation : [[
			{
				start : 0,
				duration : 30,
				transition : function (self, target, view, letant, progress) {
					self.display.position.x = self.from.position.x + (-20 - self.from.position.x) * progress;
					self.display.angle = self.from.angle + (-0.3 - self.from.angle) * progress;
				}
			},
			{
				delay : 10,
				duration : 10,
				transition : function (self, target, view, letant, progress) {
					self.display.position.x = self.from.position.x + (140 - self.from.position.x) * progress;
					self.display.position.z = self.from.position.z + (95 - self.from.position.z) * progress;
					self.display.angle = self.from.angle + (0.5 - self.from.angle) * progress;
				}
			},
			{
				delay : -5,
				duration : 10,
				transition : function (self, target, view, letant, progress) {
					target.display.position.x = target.from.position.x + (-50 - target.from.position.x) * progress;
					target.display.position.z = target.from.position.z + (-20 - target.from.position.z) * progress;
					target.display.angle = target.from.angle + (-0.2 - target.from.angle) * progress;
				}
			},
			{
				delay : 5,
				duration : 30,
				transition : function (self, target, view, letant, progress) {
					self.display.position.x = self.from.position.x + (0 - self.from.position.x) * progress;
					self.display.position.z = self.from.position.z + (0 - self.from.position.z) * progress;
					self.display.angle = self.from.angle + (0 - self.from.angle) * progress;
				}
			},
			{
				delay : 10,
				duration : 50,
				transition : function (self, target, view, letant, progress) {
					target.display.position.x = target.from.position.x + (0 - target.from.position.x) * progress;
					target.display.position.z = target.from.position.z + (0 - target.from.position.z) * progress;
					target.display.angle = target.from.angle + (0 - target.from.angle) * progress;
				}
			}
		]]
	},
	"Attract" : {
		"description" : "If it is the opposite gender of the user, the target becomes infatuated and less likely to attack.",
		"type" : "Normal",
		"category" : Move.category.status,
		"PP" : 15,
		"accuracy" : 1,
		"contact" : false,
		"piercing" : false,
		"infiltrating" : true,
		"snatchable" : false,
		"copyable" : true,
		"critratio" : 0,
		"priority" : 0,
		"affects" : Move.targets.directTarget,
		"targets" : Move.targets.adjacentToUser,
		"effects" : {
			"use" : [
				{
					"effect" : function (self, target, letant, repetitions) {
						if (!self.battler.battle.infatuate(target, self)) {
							return {
								failed : true
							};
						}
					},
					"targets" : true
				}
			]
		},
		"despite" : [],
		"classification" : ["Mental", "Normal"],
		"notes" : "",
		"animation" : [
			[]
		]
	},
	"Roar" : {
		status : "incomplete",
		description : "",
		type : "Normal",
		category : Move.category.status,
		snatchable : true,
		classification : ["Sound"],
		PP : 20,
		priority : -6,
		contact: false,
		piercing : true,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						if (!target.battler.trapped.contains("Ingrain")) {
							if (self.battler.battle.isWildBattle()) {
								if (self.level > target.level) {
									self.battler.battle.finish();
									var after = function () {
										self.battler.battle.end({
											"outcome" : "draw"
										});
									};
									if (!self.battler.battle.process) {
										Textbox.state(self.name() + " blew " + target.name() + " away!", after);
									} else {
										after();
									}
								} else {
									if (!self.battler.battle.process) Textbox.state(self.name() + "'s Roar doesn't scare " + target.name() + "!");
									return {
										failed : true
									};
								}
							} else {
								var others = target.trainer.healthyEligiblePokemon(true);
								if (others.notEmpty()) {
									foreach(others, function (poke, i, deletion) {
										if (poke === target)
											deletion.push(i);
									});
									self.battler.battle.swap(target, others[self.battler.battle.random.int(0, others.length - 1)], true);
								} else
								return {
									failed : true
								};
							}
						} else {
							return {
								failed : true,
								reason : target.name() + " is trapped in place and can't be blown away!"
							};
						}
					},
					targets : true
				}
			]
		}
	},
	"Wrap" : {
		status : "incomplete",
		description : "",
		type : "Normal",
		category : Move.category.physical,
		PP : 20,
		power : 15,
		accuracy : 0.9,
		contact: true,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						self.battler.battle.damage(target, Move.damage(self, target, "Wrap"));
						if (!target.fainted()) {
							if (!self.battler.battle.process) Textbox.state(target.name() + " was wrapped by " + self.name() + "!");
							target.battler.trapped.pushIfNotAlreadyContained("Wrap");
							if (!self.battler.battle.moveHasEffect("Wrap", target)) {
								var turns = self.battler.battle.random.int(2, 5), effects = [];
								for (var i = 0, effect; i <= turns; ++ i) {
									self.battler.battle.moveHaveEffect("Wrap", i + 0.5, target, effect = {
										user : self,
										freed : (i === turns)
									});
									effects.push(effect);
								}
								foreach(effects, function (effect) {
									effect.family = effects;
								});
							}
						}
					},
					targets : true
				}
			],
			effect : function (target, data) {
				if (data.user.battler.battling && !data.freed) {
					if (!target.battler.battle.process) Textbox.state(target.name() + " is hurt by " + target.possessivePronoun() + " Wrap.");
					target.battler.battle.damage(target, Move.percentageDamage(target, 1 / 16));
					return [];
				} else {
					if (!target.battler.battle.process) Textbox.state(target.name() + " was freed from " + target.possessivePronoun() + " Wrap.");
					target.battler.trapped.removeElementsOfValue("Wrap");
					return data.family;
				}
			}
		},
	},
	"Disable" : {
		status : "incomplete",
		description : "",
		type : "Normal",
		category : Move.category.status,
		snatchable : true,
		PP : 20,
		accuracy : 1,
		contact: false,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						if (target.battler.previousMoves.length === 0) {
							return {
								failed : true
							};
						} else {
							var which = null, alreadyDisabledAMove = false;
							foreach(target.currentMoves(), function (move) {
								if (move.disabled) {
									alreadyDisabledAMove = true;
									return true;
								}
								if (move.move === target.battler.previousMoves.last()[(target.battler.previousMoves.last().hasOwnProperty("via") ? "via" : "move")])
									which = move.number;
							});
							if (!alreadyDisabledAMove && which !== null && !target.currentMoves()[which].disabled) {
								if (!self.battler.battle.process) Textbox.state(self.name() + " disabled " + target.name() + "'s " + target.currentMoves()[which].move + ".");
								target.currentMoves()[which].disabled = 4;
							} else {
								return {
									failed : true
								};
							}
						}
					},
					targets : true
				}
			]
		}
	},
	"Counter" : {
		status : "incomplete",
		description : "",
		type : "Fighting",
		category : Move.category.physical,
		PP : 20,
		accuracy : 1,
		priority : -5,
		contact: true,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						if (self.battler.damaged[Move.category.physical] === 0)
							return {
								failed : true
							};
						else
							self.battler.battle.damage(target, Move.exactDamage(self, target, "Counter", self.battler.damaged[Move.category.physical] * 2));
					},
					targets : true
				}
			]
		}
	},
	"Feint" : {
		status : "incomplete",
		description : "",
		type : "Normal",
		category : Move.category.physical,
		PP : 10,
		power : 30,
		accuracy : 1,
		priority : 2,
		contact: false,
		piercing : true,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						self.battler.battle.damage(target, Move.damage(self, target, "Feint"));
						target.battler.protected = false;
					},
					targets : true
				}
			]
		}
	},
	"Pursuit" : {
		status : "incomplete",
		description : "",
		type : "Dark",
		category : Move.category.physical,
		PP : 20,
		power : 40,
		accuracy : 1,
		priority : 7,
		contact: true,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						var damage = (target.switching ? Move.damage(self, target, "Pursuit", 80) : Move.damage(self, target, "Pursuit"));
						self.battler.battle.damage(target, damage);
					},
					targets : true
				}
			]
		}
	},
	"Rain Dance" : {
		status : "complete",
		description : "The user summons a heavy rain that falls for five turns, powering up Water-type moves.",
		type : "Water",
		category : Move.category.status,
		PP : 5,
		priority : 0,
		contact: false,
		affects : Move.targets.bothSides,
		targets : Move.targets.bothSides,
		effects : {
			use : [
				{
					effect : function (self, target) {
						if (!self.battler.battle.process) {
							Textbox.state(self.name() + " brought down a rainstorm!");
						}
						self.battler.battle.changeWeather("rain", 5);
					},
					targets : true
				}
			]
		}
	},
	"Magnitude" : {
		status : "incomplete",
		description : "",
		type : "Ground",
		category : Move.category.physical,
		PP : 30,
		accuracy : 1,
		contact: false,
		despite : ["Dig"],
		affects : Move.targets.adjacentToUser,
		targets : Move.targets.adjacentToUser,
		effects : {
			letant : function (self) {
				var letant = {
					magnitude : self.battler.battle.random.chooseWeighted({value : 4, probability: 0.05}, {value : 5, probability: 0.1}, {value : 6, probability: 0.2}, {value : 7, probability: 0.3}, {value : 8, probability: 0.2}, {value : 9, probability: 0.1}, {value : 10, probability: 0.05})
				};
				if (!self.battler.battle.process) Textbox.state("It's Magnitude " + letant.magnitude + "!");
				return letant;
			},
			use : [
				{
					effect : function (self, target, letant) {
						self.battler.battle.damage(target, Move.damage(self, target, "Magnitude", ((letant.magnitude !== 10 ? (letant.magnitude - 3) * 20 - 10 : 150)) * (target.invulnerable === "Dig" ? 2 : 1)));
					},
					targets : true
				}
			]
		},
		animation : [[
		{
			start : 0,
			duration : 100,
			transition : function (self, target, view, progress, letant) {
				View.position.x = random(-letant.magnitude, letant.magnitude);
				View.position.y = random(-letant.magnitude, letant.magnitude);
			}
		}
		]]
	},
	"Synthesis" : {
		status : "incomplete",
		description : "",
		type : "Grass",
		category : Move.category.status,
		snatchable : true,
		PP : 5,
		contact: false,
		affects : Move.targets.self,
		targets : Move.targets.self,
		effects : {
			use : [
				{
					effect : function (self) {
						self.battler.battle.healPercentage(self, (self.battler.battle.weather.current === "clear skies" ? 0.5 : self.battler.battle.weather.current === "intense sunlight" ? 2 / 3 : 0.25), self);
					},
					targets : true
				}
			]
		}
	},
	"Protect" : {
		status : "incomplete",
		description : "",
		type : "Normal",
		category : Move.category.status,
		snatchable : true,
		classification : ["special"],
		PP : 10,
		contact: false,
		priority : 4,
		affects : Move.targets.self,
		targets : Move.targets.self,
		effects : {
			use : [
				{
					effect : function (self) {
						var sequence = 1;
						for (var i = self.battler.previousMoves.length - 1; i >= 0; -- i) {
							if (!self.battler.previousMoves[i].failed && self.battler.previousMoves[i].move === "Protect")
								++ sequence;
							else
								break;
						}
						if (chance(sequence))
							self.battler.protected = true;
						else
							return {
								failed : true
							};
						},
						targets : true
					}
				]
			}
		},
	"Substitute" : {
		status : "incomplete",
		description : "",
		type : "Normal",
		category : Move.category.status,
		snatchable : true,
		PP : 10,
		contact: false,
		affects : Move.targets.self,
		targets : Move.targets.self,
		effects : {
			use : [
				{
					effect : function (self) {
						if (!self.battler.substitute) {
							var sacrificed = Math.floor(self.stats.health() / 4);
							if (self.health <= sacrificed) {
								return {
									failed : true
								};
							}
							if (!self.battler.battle.process) Textbox.state(self.name() + " created a Substitute.");
							self.battler.battle.damage(self, Move.exactDamage(self, self, "Substitute", sacrificed));
							self.battler.substitute = sacrificed;
						} else {
							return {
								failed : true
							};
						}
					},
					targets : true
				}
			]
		}
	},
	"Transform" : {
		status : "incomplete",
		description : "",
		type : "Normal",
		category : Move.category.status,
		snatchable : true,
		classification : ["special"],
		PP : 10,
		contact: false,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						if (target.battler.substitute > 0 || target.battler.transform.transformed) {
							return {
								failed : true
							};
						}
						self.battler.transform = {
							transformed : true,
							species : target.species,
							IVs : JSONCopy(target.IVs),
							moves : JSONCopy(target.moves),
							shiny : target.shiny,
							ability : target.ability,
							"form(e)" : target["form(e)"],
							mega : target.mega,
							gender : target.gender
						};
						self.battler.statLevel = JSONCopy(target.battler.statLevel);
						foreach(self.battler.transform.moves, function (move) {
							move.PP = 5;
							move.PPUps = 0;
						});
						if (!self.battler.battle.process) {
							var display = Display.state.save(), speciesName = target.currentSpecies().replace(/ \(\w+\)$/, "");
							Textbox.state(self.name() + " transformed itself into " + article(speciesName) + " " + speciesName + ".", /*transform animation, has finishing transforming, */function () { Display.state.load(display); });
						}
					},
					targets : true
				}
			]
		}
	},
	"Sketch" : {
		status : "incomplete",
		description : "",
		type : "Normal",
		category : Move.category.status,
		snatchable : true,
		classification : ["special"],
		PP : 1,
		contact: false,
		piercing : true,
		infiltrating : true,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						if (self.battler.transform.transformed || target.battler.previousMoves.empty() || target.battler.previousMoves.last().failed || target.battler.previousMoves.last()[(target.battler.previousMoves.last().hasOwnProperty("via") ? "via" : "move")].classification.contains("special"))
							return {
								failed : true
							};
						else {
							self.forget(self.battler.previousMoves.last().move);
							if (!self.learn(target.battler.previousMoves.last().move)) {
								self.learn("Sketch");
								return {
									failed : true
								};
							}
						}
					},
					targets : true
				}
			]
		}
	},
	"Heal Block" : {
		status : "incomplete",
		description : "",
		type : "Grass",
		category : Move.category.status,
		snatchable : true,
		PP : 15,
		accuracy : 1,
		contact: false,
		affects : Move.targets.opposingSide,
		targets : Move.targets.opposingSide,
		effects : {
			letant : function (self, target) {
				if (!self.battler.battle.hasEffectOnSide("Heal Block", target)) {
					if (!self.battler.battle.process) Textbox.state(self.name() + " put a Heal Block into effect.");
					self.battler.battle.bringIntoEffect("Heal Block", Moves._("Heal Block"), Battles.when.afterFiveTurns, target);
				} else {
					return {
						failed : true
					};
				}
			},
			use : [
				{
					effect : function (self, target) {
					},
					targets : true
				}
			]
		},
		uponTrigger : {
			event : Triggers.health,
			oneself : true,
			action : function (data, target) {
				if (data.change > 0) {
					if (!target.battler.battle.process) Textbox.state("The Heal Block prevents healing!");
					return true;
				}
			}
		}
	},
	"Absorb" : {
		status : "incomplete",
		description : "",
		type : "Grass",
		category : Move.category.special,
		PP : 25,
		power : 20,
		accuracy : 1,
		contact: false,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						var damage = Move.damage(self, target, "Absorb");
						self.battler.battle.damage(target, damage);
						self.battler.battle.heal(self, damage.damage / 2, self);
					},
					targets : true
				}
			]
		}
	},
	"Guillotine" : {
		status : "incomplete",
		description : "",
		type : "Normal",
		category : Move.category.physical,
		PP : 5,
		contact: true,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						if (self.level >= target.level && (self.level - target.level + 30) / 100 >= self.battler.battle.random.point()) {
							if (!self.battler.battle.process) Textbox.state("It's a one-hit knockout!");
							self.battler.battle.damage(target, Move.exactDamage(self, target, "Guillotine", target.health));
						} else return {
							failed : true
						};
					},
					targets : true
				}
			]
		}
	},
	"Dragon Rage" : {
		status : "incomplete",
		description : "",
		type : "Dragon",
		category : Move.category.special,
		PP : 10,
		accuracy : 1,
		contact: false,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						self.battler.battle.damage(target, Move.exactDamage(self, target, "Dragon Rage", 40));
						self.battler.battle.flinch(target);
					},
					targets : true
				}
			]
		}
	},
	"Perish Song" : {
		status : "incomplete",
		description : "",
		type : "Normal",
		category : Move.category.status,
		snatchable : true,
		classification : ["Sound"],
		PP : 5,
		contact: false,
		piercing : true,
		infiltrating : true,
		despite : ["Dig", "Dive", "Fly"],
		affects : Move.targets.everyone,
		targets : Move.targets.everyone,
		effects : {
			letant : function (self) {
				if (!self.battler.battle.process) Textbox.state("All Pokémon who hear the song will perish in 3 turns!");
			},
			use : [
				{
					effect : function (self, target) {
						if (!self.battler.battle.moveHasEffect("Perish Song", target)) {
							self.battler.battle.moveHaveEffect("Perish Song", Battles.when.endOfThisTurn, target, {count : 3});
							self.battler.battle.moveHaveEffect("Perish Song", Battles.when.endOfNextTurn, target, {count : 2});
							self.battler.battle.moveHaveEffect("Perish Song", Battles.when.endOfTurnAfterNext, target, {count : 1});
							self.battler.battle.moveHaveEffect("Perish Song", Battles.when.inThreeTurns, target, {count : 0});
						} else
						return {
							failed : true
						};
					},
					targets : false
				}
			],
			effect : function (target, data) {
				if (!target.battler.battle.process) Textbox.state(target.name() + "'s Perish Count fell to " + data.count + ".");
				if (data.count === 0)
					target.battler.battle.damage(target, Move.percentageDamage(target, 1));
				return [];
			}
		}
	},
	"Take Down" : {
		status : "incomplete",
		description : "",
		type : "Normal",
		category : Move.category.physical,
		PP : 20,
		power : 90,
		accuracy : 0.85,
		contact: true,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						var damage = Move.damage(self, target, "Take Down");
						self.battler.battle.damage(target, damage);
						self.recoil("Take Down", damage.damage / 4);
					},
					targets : true
				}
			]
		}
	},
	"Yawn" : {
		status : "incomplete",
		description : "",
		type : "Normal",
		category : Move.category.status,
		snatchable : true,
		PP : 10,
		contact: true,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						self.battler.battle.moveHaveEffect("Yawn", Battles.when.endOfNextTurn, target);
					},
					targets : true
				}
			],
			effect : function (target) {
				if (target.status === "none") {
					if (!target.battler.battle.process) Textbox.state(target.name() + " yawned and fell asleep.");
					target.battler.battle.inflict(target, "asleep");
				}
			}
		}
	},
	"Future Sight" : {
		status : "incomplete",
		description : "",
		type : "Psychic",
		category : Move.category.special,
		PP : 10,
		power : 120,
		accuracy : 1,
		contact: false,
		piercing : true,
		despite : ["Dig", "Dive", "Fly"],
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						if (!self.battler.battle.moveHasEffect("Future Sight", target)) {
							if (!self.battler.battle.process) Textbox.state(self.name() + " has foreseen an attack!");
							self.battler.battle.moveHaveEffect("Future Sight", Battles.when.endOfTurnAfterNext, target, {self : self});
						} else
						return {
							failed : true
						};
					},
					targets : true
				}
			],
			effect : function (target, data) {
				if (!target.battler.battle.process) Textbox.state(target.name() + " took the Future Sight attack!");
				target.battler.battle.damage(target, Move.damage(data.self, target, "Future Sight", null, Moves._("Future Sight").type, true));
			}
		}
	},
	"Jump Kick" : {
		status : "incomplete",
		description : "",
		type : "Fighting",
		category : Move.category.physical,
		PP : 10,
		power : 100,
		accuracy : 0.95,
		contact: true,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						self.battler.battle.damage(target, Move.damage(self, target, "Jump Kick"));
					},
					targets : true
				}
			],
			miss : function (self, target) {
				self.crash(self.stats.health() / 2);
			}
		}
	},
	"Hyper Voice" : {
		status : "incomplete",
		description : "",
		type : "Normal",
		category : Move.category.special,
		classification : ["Sound"],
		PP : 10,
		power : 90,
		accuracy : 1,
		contact: false,
		affects : Move.targets.opponentAndAdjacent,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						self.battler.battle.damage(target, Move.damage(self, target, "Hyper Voice"));
					},
					targets : true
				}
			]
		}
	},
	"Hyper Beam" : {
		status : "incomplete",
		description : "",
		type : "Normal",
		category : Move.category.special,
		PP : 5,
		power : 150,
		accuracy : 0.9,
		contact : false,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						self.battler.battle.damage(target, Move.damage(self, target, "Hyper Beam"));
						self.battler.recharging = 1;
					},
					targets : true
				}
			]
		}
	},
	"Solar Beam" : {
		status : "incomplete",
		description : "",
		type : "Grass",
		category : Move.category.special,
		PP : 10,
		power : 120,
		accuracy : 1,
		contact : false,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						if (self.battler.battle.weather.current === "intense sunlight") {
							Move.use("Solar Beam", ++ self.battler.moveStage, self, target, true);
							return;
						}
						if (!self.battler.battle.process) Textbox.state(self.name() + " began absorbing sunlight.");
					},
					targets : false
				},
				{
					effect : function (self, target) {
						self.battler.battle.damage(target, Move.damage(self, target, "Solar Beam"));
					},
					targets : true
				}
			]
		}
	},
	"Fly" : {
		status : "incomplete",
		description : "",
		type : "Flying",
		category : Move.category.physical,
		PP : 15,
		power : 90,
		accuracy : 0.95,
		contact : true,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						if (!self.battler.battle.process) Textbox.state(self.name() + " flew up high.");
						self.invulnerable = "Fly";
					},
					targets : false
				},
				{
					effect : function (self, target) {
						self.battler.battle.damage(target, Move.damage(self, target, "Fly"));
						self.invulnerable = null;
					},
					targets : true
				}
			],
			fail : function (self, target) {
				self.invulnerable = null;
			}
		},
		animation : [
		[
		{
			start : 0,
			duration : 30,
			transition : function (self, target, view, letant, progress) {
				self.display.position.x = self.from.position.x + (30 - self.from.position.y) * progress;
				self.display.position.y = self.from.position.y + ((Battle.canvas.height / Game.zoom / 2) - self.from.position.y) * progress;
				self.display.position.z = self.from.position.z + (30 - self.from.position.z) * progress;
			}
		}
		],
		[
		{
			time : 0,
			animation : function (self, target) {
				self.display.position.x = 140;
				self.display.position.z = 150;
			}
		},
		{
			delay : 0,
			duration : 30,
			transition : function (self, target, view, letant, progress) {
				self.display.position.y = self.from.position.y + (20 - self.from.position.y) * progress;
				self.display.position.z = self.from.position.z + (115 - self.from.position.z) * progress;
			}
		},
		{
			delay : -5,
			duration : 10,
			transition : function (self, target, view, letant, progress) {
				target.display.position.x = target.from.position.x + (-50 - target.from.position.x) * progress;
				target.display.position.z = target.from.position.z + (-20 - target.from.position.z) * progress;
				target.display.angle = target.from.angle + (-0.2 - target.from.angle) * progress;
			}
		},
		{
			delay : 0,
			duration : 30,
			transition : function (self, target, view, letant, progress) {
				self.display.position.x = self.from.position.x + (0 - self.from.position.x) * progress;
				self.display.position.y = self.from.position.y + (0 - self.from.position.y) * progress;
				self.display.position.z = self.from.position.z + (0 - self.from.position.z) * progress;
			}
		},
		{
			delay : 10,
			duration : 30,
			transition : function (self, target, view, letant, progress) {
				target.display.position.x = target.from.position.x + (0 - target.from.position.x) * progress;
				target.display.position.z = target.from.position.z + (0 - target.from.position.z) * progress;
				target.display.angle = target.from.angle + (0 - target.from.angle) * progress;
			}
		}
		]
		]
	},
	"Dive" : {
		status : "incomplete",
		description : "",
		type : "Water",
		category : Move.category.physical,
		PP : 10,
		power : 80,
		accuracy : 1,
		contact : true,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						if (!self.battler.battle.process) Textbox.state(self.name() + " dived into the water.");
						self.invulnerable = "Dive";
					},
					targets : false
				},
				{
					effect : function (self, target) {
						self.battler.battle.damage(target, Move.damage(self, target, "Dive"));
						self.invulnerable = null;
					},
					targets : true
				}
			],
			fail : function (self, target) {
				self.invulnerable = null;
			}
		},
		animation : [
		[
		{
			start : 0,
			duration : 30,
			transition : function (self, target, view, letant, progress) {
				self.display.height = self.from.height + (0 - self.from.height) * progress;
			}
		}
		],
		[
		{
			start : 0,
			duration : 30,
			transition : function (self, target, view, letant, progress) {
				self.display.height = self.from.height + (1 - self.from.height) * progress;
			}
		}
		]
		]
	},
	"Dig" : {
		status : "incomplete",
		description : "",
		type : "Ground",
		category : Move.category.physical,
		PP : 10,
		power : 90,
		accuracy : 1,
		contact : true,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						if (!self.battler.battle.process) Textbox.state(self.name() + " burrowed into the ground.");
						self.invulnerable = "Dig";
					},
					targets : false
				},
				{
					effect : function (self, target) {
						self.battler.battle.damage(target, Move.damage(self, target, "Dig"));
						self.invulnerable = null;
					},
					targets : true
				}
			],
			fail : function (self, target) {
				self.invulnerable = null;
			}
		},
		animation : [
		[
		{
			start : 0,
			duration : 30,
			transition : function (self, target, view, letant, progress) {
				self.display.height = self.from.height + (0 - self.from.height) * progress;
			}
		}
		],
		[
		{
			start : 0,
			duration : 30,
			transition : function (self, target, view, letant, progress) {
				self.display.height = self.from.height + (1 - self.from.height) * progress;
			}
		}
		]
		]
	},
	"Pin Missile" : {
		status : "incomplete",
		description : "",
		type : "Bug",
		category : Move.category.physical,
		PP : 20,
		power : 25,
		accuracy : 0.95,
		contact : false,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target, letant, repetitions) {
						var finalRepetition = !(target !== NoPokemon && !target.fainted() && (repetitions < 2 || (repetitions <= 3 && self.battler.battle.random.chance(3)) || (repetitions <= 5 && self.battler.battle.random.chance(6))));
						if (finalRepetition)
							if (!self.battler.battle.process) Textbox.state("Hit " + target.name() + " " + quantityWord(repetitions) + "!");
						self.battler.battle.damage(target, Move.damage(self, target, "Pin Missile"), finalRepetition);
						if (!finalRepetition) {
							Moves._("Pin Missile").effects.use[0].effect(self, target, letant, ++ repetitions); // Not the standard Move.use() form, so that it can take advantage of repetitions
						}
					},
					targets : true
				}
			]
		}
	},
	"Supersonic" : {
		status : "incomplete",
		description : "",
		type : "Normal",
		category : Move.category.status,
		snatchable : true,
		classification : ["Sound"],
		PP : 20,
		accuracy : 0.55,
		contact : false,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						self.battler.battle.confuse(target);
					},
					targets : true
				}
			]
		}
	},
	"Spikes" : {
		status : "incomplete",
		description : "",
		type : "Ground",
		category : Move.category.status,
		snatchable : true,
		classification : ["hazard"],
		PP : 20,
		contact : false,
		affects : Move.targets.opposingSide,
		targets : Move.targets.opposingSide,
		effects : {
			use : [
				{
					effect : function (self, target) {
						if (!self.battler.battle.process) Textbox.state(self.name() + " scattered sharp spikes around the far side.");
						if (!self.battler.battle.placeHazard("Spikes", 3, target)) {
							if (!self.battler.battle.process) Textbox.state("But they were already layered so deep that it didn't make a difference!");
							return {
								failed : true
							};
						}
					},
					targets : true
				}
			],
			hazard : function (target, stack) {
				if (target.effectiveness(Moves._("Spikes").type, Moves._("Spikes").classification, null, Move.category.physical) > 0) {
					if (!target.battler.battle.process) Textbox.state("The sharp spikes hurt " + target.name() + "!");
					self.battler.battle.damage(target, { damage : Math.floor(target.stats.health() / (8 - 2 * (stack - 1))) });
				}
			}
		}
	},
	"Ingrain" : {
		status : "incomplete",
		description : "",
		type : "Grass",
		category : Move.category.status,
		snatchable : true,
		classification : ["hazard"],
		PP : 20,
		contact : false,
		affects : Move.targets.self,
		effects : {
			use : [
				{
					effect : function (self) {
						if (!self.battler.battle.moveHasEffect("Ingrain", self)) {
							if (!self.battler.battle.process) Textbox.state(self.name() + " rooted " + self.selfPronoun() + " firmly.");
							self.battler.grounded = true;
							self.battler.trapped.pushIfNotAlreadyContained("Ingrain");
							self.battler.battle.moveHaveRepeatingEffect("Ingrain", Battles.when.endOfTurn, self);
						} else
						return {
							failed : true
						};
					},
					targets : true
				}
			],
			effect : function (self) {
				if (!self.battler.battle.process) Textbox.state(self.name() + " recovered some of " + self.possessivePronoun() + " health through " + self.possessivePronoun() + " ingrained roots!");
				self.battler.battle.healPercentage(self, 1 / 16, self);
			}
		}
	},
	"Curse" : {
		status : "incomplete",
		description : "",
		type : "Ghost",
		category : Move.category.status,
		snatchable : true,
		PP : 10,
		contact : false,
		affects : Move.targets.directTarget,
		targets : Move.targets.adjacentToUser,
		effects : {
			use : [
				{
					effect : function (self, target) {
						if (self.ofType("Ghost")) {
							if (!self.battler.battle.moveHasEffect("Curse", self)) {
								if (!self.battler.battle.process) Textbox.state(target.name() + " was put under an evil Curse!");
								self.battler.battle.damage(self, Move.exactDamage(self, self, "Curse", Math.floor(self.stats.health() / 2)));
								self.battler.battle.moveHaveRepeatingEffect("Curse", Battles.when.endOfThisTurn, target);
							} else
							return {
								failed : true
							};
						} else {
							self.battler.battle.stat(self, "speed", -1, self);
							self.battler.battle.stat(self, "attack", 1, self);
							self.battler.battle.stat(self, "defence", 1, self);
						}
					},
					targets : true
				}
			],
			effect : function (target) {
				if (!target.battler.battle.process) Textbox.state(target.name() + " lost a quarter of " + target.possessivePronoun() + " health to " + target.possessivePronoun() + " curse!");
				target.battler.battle.damage(target, Move.percentageDamage(target, 1 / 4));
			}
		}
	},
	"Metronome" : {
		status : "incomplete",
		description : "",
		type : "Normal",
		category : Move.category.status,
		snatchable : true,
		classification : ["special"],
		PP : 10,
		contact : false,
		affects : Move.targets.self,
		effects : {
			use : [
				{
					effect : function (self) {
						var moves = [], choice, targets;
						forevery(Moves, function (move, name) {
							if (!move.classification.contains("special"))
								moves.push(name);
						});
						choice = self.battler.battle.random.chooseFromArray(moves);
						self.battler.previousMove = choice;
						targets = self.battler.battle.targetsForMove(self, _(Moves, choice), true);
						targets.sort(function (targetA, targetB) {
							return self.battler.battle.distanceBetween(self, targetA.poke) - self.battler.battle.distanceBetween(self, targetB.poke);
						});
						if (targets.notEmpty()) {
							self.battler.moveStage = 0;
							self.battler.previousTarget = targets.first().poke;
							var used = Move.use(choice, self.battler.moveStage, self, targets.first().place, true); // Pick the closest target (this shouldn't be an ally unless it's a friendly move)
							self.battler.previousMoves.push({
								move : choice,
								failed : used.succeeded,
								via : "Metronome"
							});
							return {
								modifiedMove : true
							};
						} else
						return {
							failed : true
						};
					},
					targets : true
				}
			]
		}
	}
};

forevery(Moves, function (move) {
	if (!move.hasOwnProperty("priority"))
		move.priority = 0;
	if (!move.hasOwnProperty("classification"))
		move.classification = [];
	if (!move.hasOwnProperty("despite"))
		move.despite = [];
	if (!move.hasOwnProperty("targets")) // The choice of Pokémon the user has to attack
		move.targets = move.affects;
	if (!move.hasOwnProperty("piercing")) // Hits through Protect
		move.piercing = false;
	if (!move.hasOwnProperty("infiltrating")) // Hits through Substitute
		move.infiltrating = false;
	if (!move.hasOwnProperty("animation")) {
		move.animation = [];
		foreach(move.effects.use, function () {
			move.animation.push([]);
		});
	}
	else {
		var lastEnd = 0;
		foreach(move.animation, function (animation) {
			foreach(animation, function (stage) {
				if (stage.hasOwnProperty("delay"))
					stage.from = lastEnd + stage.delay;
				if (stage.hasOwnProperty("start")) {
					stage.from = stage.start;
				}
				/*if (stage.hasOwnProperty("from")) {
					stage.time = stage.from;
				}*/
				if (stage.hasOwnProperty("duration")) {
					stage.to = stage.from + stage.duration;
				}
				lastEnd = stage.hasOwnProperty("time") ? stage.time : stage.to;
			});
		});
	}
	move.classification.push(move.type);
});