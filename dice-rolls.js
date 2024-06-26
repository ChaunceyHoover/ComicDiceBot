/**
 * Generates a regex pattern to be executed against a given string of text to find matches for the dice rolling format
 * @returns A new regular expression for executing
 */
const getDiceParsingRegex = () => /(\d+#)?(\d)([frt]{1})((?:kh\d+|kl\d+))?(?:([\+\-])?(\d+))?/g;

/**
 * Generates a random number between `min` and `max`, inclusive
 * @param {number} min Inclusive minimum number
 * @param {number} max Inclusive maximum number
 * @returns Random number between `min` and `max`, inclusive
 */
const getRandomInt = (min, max) => {
    const min = Math.ceil(min),
          max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Translates a dice parsing regex result into an more usable model
 * @param {RegExpMatchArray} regexMatch The result of an attempt dice roll regex match
 * @returns A model that translates the regex matches into human-readable code
 */
const translateMatchToDiceModel = (regexMatch) => {
    if (regexMatch == null) return null;

    return {
        match: regexMatch[0],
        diceCount: regexMatch[1],
        isIndividualRolls: regexMatch[2] == undefined ? false : true,
        diceType: regexMatch[3],
        keepXDice: regexMatch[4] == null ? undefined : {
            highest: regexMatch[4].substring(0, 2) == "kh",
            count: parseInt(regexMatch[4].substring(2))
        },
        staticModifier: regexMatch[5] == null ? null : {
            amount: parseInt(`${regexMatch[5] == "+" ? "" : "-"}${regexMatch[6]}`)
        }
    };
}

/**
 * Calculates the total sum of all dice being rolled
 * @param {string} diceType A single letter representing the dice being rolled
 * @param {number} diceCount An integer representing how many dice are being rolled
 * @returns The result of the total number of dice of the given type added together
 */
const rollDiceByType = (diceType, diceCount) => {
    switch (diceType) {
        case 'f':
            return diceCount * (getRandomInt(1, 12) - 6);  // d12 - 6
        case 'r':
            return diceCount * (getRandomInt(1, 18) - 9);  // d18 - 9
        case 't':
            return diceCount * (getRandomInt(1, 24) - 12); // d24 - 12
        default:
            throw `Unknown dice type: [${diceType}]`;
    }
}

/**
 * Calculates each individual dice roll from a given `DiceModel` and returns each roll in an array 
 * @param {DiceModel} model The model to interpret
 * @returns A sorted array of numbers representing all the dice rolls from the model
 */
const calculateModelValue = (model) => {
    const diceRolls = [];
    for (let i = 0; i < model.diceCount; i++) {
        diceRolls.push(
            rollDiceByType(model.diceType, model.diceCount) + (model.staticModifier != null ? model.staticModifier.amount : 0)
        );
    }
    

}

const parseDiceRoll = (word) => {
    const parsedMatch = translateMatchToDiceModel(getDiceParsingRegex().exec(word));

    if (parsedMatch.match != word) {
        // TODO:
        //  1. Remove match from start of word
        //  2. Check if first character is either + or -
        //  3. Remove first character 
        //  4. Repeat process recursively with remaining string, return result from roll
    }

    const rolls = calculateModelValue(parsedMatch);
}

export { parseDiceRoll }