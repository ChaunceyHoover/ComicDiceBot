/**
 * Generates a regex pattern to be executed against a given string of text to find matches for the dice rolling format
 * @returns A new regular expression for executing
 */
const getDiceParsingRegex = () => /(?:(\d+)#)?(\d+)([frt]{1})(?:(?:(kh)(\d+))|(?:(kl)(\d+)))?(?:([\+\-])?(\d+))?/g;

/**
 * Generates a random number between `min` and `max`, inclusive
 * @param {number} min Inclusive minimum number
 * @param {number} max Inclusive maximum number
 * @returns Random number between `min` and `max`, inclusive
 */
const getRandomInt = (min, max) => {
    const minNum = Math.ceil(min),
          maxNum = Math.floor(max);
    return Math.floor(Math.random() * (maxNum - minNum + 1) + minNum);
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
        isMultipleRolls: regexMatch[1] == undefined ? false : true,
        multipleRollCount: regexMatch[1] == undefined ? undefined : parseInt(regexMatch[1]),
        diceCount: regexMatch[2],
        diceType: regexMatch[3],
        keepXDice: regexMatch[4] == null && regexMatch[6] == null ? undefined : {
            highest: regexMatch[4] != null,
            count: parseInt(regexMatch[5] ?? regexMatch[7])
        },
        staticModifier: regexMatch[8] == null ? null : parseInt(`${regexMatch[8] == "+" ? "" : "-"}${regexMatch[9]}`)
    };
}


/**
 * Rolls a custom dice of a given type
 * @param {string} diceType Lowercase letter representing the type of dice to roll
 * @returns A number representing the result of the dice roll
 */
const rollDiceByType = (diceType) => {
    switch (diceType) {
        case 'f':
            return getRandomInt(1, 12) - 6;  // d12 - 6
        case 'r':
            return getRandomInt(1, 18) - 9;  // d18 - 9
        case 't':
            return getRandomInt(1, 24) - 12; // d24 - 12
        default:
            throw `Unknown dice type: [${diceType}]`;
    }
}

/**
 * Returns an array containing the results of rolling the given dice type `diceCount` time(s)
 * @param {string} diceType A single character representing the type of dice to roll
 * @param {number} diceCount The amount of dice to roll
 * @returns An array containing the result of every dice roll of the given dice type
 */
const calculateDiceRoll = (diceType, diceCount) => {
    const diceRolls = [];
    for (let i = 0; i < diceCount; i++) {
        diceRolls.push(
            rollDiceByType(diceType)
        );
    }
    return diceRolls;
}

/**
 * Maps data to a standardized model
 * @param {number} result The sum of all the dice rolls
 * @param {Array<number>} rolls Array of all the dice rolls
 * @param {number} staticModifier The static amount to be added to the final result
 * @param {boolean} isMultipleRolls Truthiness of if the result is multiple individual rolls or one single roll
 * @param {string} input The original dice roll text
 * @returns An object containing all of the passed parameters
 */
const createDiceResultModel = (result, rolls, staticModifier, isMultipleRolls, input) => {
    return { result, rolls, staticModifier, isMultipleRolls, input };
}

/**
 * Translates a given dice roll if it matches the custom format and turns it into an appropriate number
 * @param {string} word A single word from a message sent on Discord
 * @returns A translated dice roll with the resulting value
 */
const parseDiceRoll = (word) => {
    word = word.toLowerCase();
    const diceModel = translateMatchToDiceModel(getDiceParsingRegex().exec(word));
    const sum = (arr) => arr.reduce((a, b) => a + b);

    if (diceModel == null) return null;

    // 1. Check for multiple dice roll (ex: 3#1f = 1f, 1f, 1f)
    if (diceModel.isMultipleRolls) {
        // 1.1. Make sure it's only an individual roll by itself (i.e. disallow 3#1f+4#1f)
        if (diceModel.match != word) return;

        const rolls = [];
        for (let i = 0; i < diceModel.multipleRollCount; i++) {
            const diceRolls = calculateDiceRoll(diceModel.diceType, diceModel.diceCount);
            rolls.push(
                createDiceResultModel(sum(diceRolls), diceRolls, diceModel.staticModifier, diceModel.isMultipleRolls, word.substring(2))
            );
        }
        return rolls;
    }

    // 2. Process individual dice roll by itself
    const diceRoll = calculateDiceRoll(diceModel.diceType, diceModel.diceCount);
    let totalRollsValue = [
        createDiceResultModel(sum(diceRoll), diceRoll, diceModel.staticModifier, false, word)
    ];

    // 3. Check for dice maths (i.e. adding/subtracting multiple dice rolls together)
    if (diceModel.match != word) {
        let newWord = word.substring(diceModel.match.length);
        let symbol = newWord.charAt(0);

        let nextDiceRoll = parseDiceRoll(newWord.substring(1));
        
        if (nextDiceRoll.isMultipleRolls) return null; // cannot mix individual and multiple rolls

        // Check if result is being added or subtracted
        if (symbol == '-')
            nextDiceRoll.result = nextDiceRoll.result * -1; 

        totalRollsValue = totalRollsValue.concat(nextDiceRoll);
    }

    return totalRollsValue;
}

export { parseDiceRoll }