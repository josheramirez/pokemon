"use strict";

foreach([Pokedex, Moves, Items, Abilities], function (obj) {
	_method(obj);
});

// Calculate the inverse type chart
let InverseTypes = {};
forevery(Types, function (effectivenesses, type) {
	InverseTypes[type] = {};
	if (effectivenesses.hasOwnProperty("strong")) {
		InverseTypes[type].weak = effectivenesses.strong;
	}
	if (effectivenesses.hasOwnProperty("weak") || effectivenesses.hasOwnProperty("ineffective")) {
		InverseTypes[type].strong = [];
		if (effectivenesses.hasOwnProperty("weak"))
			InverseTypes[type].strong = InverseTypes[type].strong.concat(effectivenesses.weak);
		if (effectivenesses.hasOwnProperty("ineffective"))
		InverseTypes[type].strong = InverseTypes[type].strong.concat(effectivenesses.ineffective);
	}
});

// Work out the pre-evolutions for each Pokémon
forevery(Pokedex, function (poke, name) {
	if (!poke.hasOwnProperty("preevolutions"))
			poke.preevolutions = [];
	if (!poke.hasOwnProperty("egg cycles"))
			poke["egg cycles"] = 1;
	foreach(poke.evolutions, function (evo) {
		var into = Pokedex._(evo.species);
		if (!into.hasOwnProperty("preevolutions"))
			into.preevolutions = [];
		var details = {
			species : name
		};
		forevery(evo, function (value, key) {
			if (key !== "species") {
				details[key] = value;
			}
		});
		into.preevolutions.push(details);
	});
});

// Calculate the lowest possible level for each Pokémon
forevery(Pokedex, function (poke, name) {
	var tested = [];
	var lowestLevelFoundAt = function (speciesName, lowerBound) {
		if (!tested.contains(speciesName)) {
			var preevolutions = Pokedex._(speciesName).preevolutions;
			if (preevolutions.notEmpty()) {
				var upperBound = 100;
				foreach(preevolutions, function (preevo) {
					if (preevo.method === "level") {
						if (preevo.hasOwnProperty("level")) {
							upperBound = Math.min(upperBound, preevo.level + lowerBound);
						} else {
							upperBound = Math.min(upperBound, lowestLevelFoundAt(preevo.species, lowerBound + 1));
						}
					} else {
						upperBound = Math.min(upperBound, lowestLevelFoundAt(preevo.species, lowerBound));
					}
				});
				return upperBound;
			} else {
				return lowerBound + 1;
			}
		} else return 100; // There is an evolutionary loop, and technically you shouldn't ever be able to get the Pokémon via this path as you need to evolve it from itself first. The only way to get the Pokémon via this path is to capture it in a location first.
	};
	poke.lowestPossibleLevel = lowestLevelFoundAt(name, 0);
});

// Add Struggle as a special move
Move.Struggle.move = "Struggle";

// Sort out items
forevery(Items, function (category) {
	var standard = (category.hasOwnProperty("standard") ? category.standard : {});
	forevery(category, function (item, name) {
		if (item === standard)
			return;
		forevery(standard, function (value, key) {
			if (!item.hasOwnProperty(key))
				item[key] = value;
		});
		item.paths = {
			convert (contracted, includeFiletype) {
				contracted = contracted.replace("{name}", item.fullname);
				contracted = contracted.replace("{id}", item.id); // Compatibility with pokéngine
				contracted = contracted.replace(/\{filetype=[a-z0-9]+\}/, (includeFiletype ? "." + contracted.match(/\{filetype=([a-z0-9]+)\}/)[1] : ""));
				contracted = contracted.replace("{animation}", Sprite.shouldAnimate(contracted) ? "animated" : "static");
				return contracted;
			},
			icon (includeFiletype) {
				return [Settings._("paths => items => image"), Settings._("paths => items => special").replace("{special}", "fallback")].map(path => item.paths.convert(path), includeFiletype);
			}
		};
		item.fullname = name + (["Berry", "Ball"].contains(item.category) ? " " + item.category : "");
		try {
			if (item.hasOwnProperty("effect") && typeof item.effect === "string") {
				item.effect = eval(item.effect);
			}
			if (item.hasOwnProperty("targets") && typeof item.targets === "string") {
				item.targets = eval(item.targets);
			}
		} catch (syntaxError) {
			console.warn(`The item ${item.fullname} had an invalid effect or targets property.`);
		}
		if (!item.hasOwnProperty("effects"))
			item.effects = [];
	});
});

// Add paths to scenes
Scenes.__(function (scene, name) {
	scene.paths = {
		sprite : function (includeFiletype) {
			var contracted = Settings._("paths => scenes => image");
			contracted = contracted.replace("{name}", name);
			contracted = contracted.replace(/\{filetype=[a-z0-9]+\}/, (includeFiletype ? "." + contracted.match(/\{filetype=([a-z0-9]+)\}/)[1] : ""));
			return contracted;
		}
	};
});