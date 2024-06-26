/**
 * Generates a regex pattern to be executed against a given string of text to find matches for the dice rolling format
 * @returns A new regular expression for executing
 */
const getDiceParsingRegex = () => /(?:(\d+)#)?(\d)([frt]{1})(?:(?:(kh)(\d+))|(?:(kl)(\d+)))?(?:([\+\-])?(\d+))?/g;

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
        staticModifier: regexMatch[8] == null ? null : {
            amount: parseInt(`${regexMatch[8] == "+" ? "" : "-"}${regexMatch[9]}`)
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

const calculateDiceRoll = (diceType, diceCount) => {
    const diceRolls = [];
    for (let i = 0; i < diceCount; i++) {
        diceRolls.push(
            rollDiceByType(diceType, diceCount)
        );
    }
    return diceRolls.sort();
}

const createDiceResult = (result, rolls, staticModifier, input) => {
    return { result, rolls, staticModifier, input };
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

    if (diceModel == null) return;

    // 1. Check for multiple dice roll (ex: 3#1f = 1f, 1f, 1f)
    if (diceModel.isMultipleRolls) {
        // 1.1. Make sure it's only an individual roll by itself (i.e. disallow 3#1f+4#1f)
        if (diceModel.match != word) return;

        const rolls = [];
        for (let i = 0; i < diceModel.multipleRollCount; i++) {
            const diceRolls = calculateDiceRoll(diceModel.diceType, diceModel.diceCount);
            rolls.push(
                createDiceResult(sum(diceRolls), diceRolls, diceModel.staticModifier?.amount, word.substring(2))
            );
        }
        return rolls;
    }

    // 2. Check for dice rolling maths
    if (diceModel.match != word) {
        // TODO:
        //  1. Process dice roll
        //  2. Remove match from start of word
        //  3. Check if first character of word is either '+' or '-'
        //  4. Remove first character
        //  5. Process remaining word and add/subtract from result
        //  6. Repeat process recursively
    }

    // 3. Process normal, individual dice roll by itself
    
}

export { parseDiceRoll }