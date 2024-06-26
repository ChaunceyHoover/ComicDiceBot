# Comic's Dice Bot
Comic's custom dice rolling system, in discord bot format

## Overview
-   The three special dice which essentially work like (d12-6), (d18-9) and (d24-12)
	- Focus die = 1f = d12 - 6
	- Risk die = 1r = d18 - 9
	- Thrill die = 1t = d24 - 12
-   Multiple dice rolls for 1 value (5f = (d12-6) + (d12-6) + (d12-6) + (d12-6) + (d12-6) all added together for a final result)
-   Dice rolls with static modifiers (ex: 1f+5 = (d12-6) + 5 added together)
-   Multiple SEPARATE dice rolls (3#f = (d12-6), (d12-6), (d12-6) all shown separate)
-   Modifiers
    -   Keep Highest = Keep the highest value from the set of dice you rolled (ex: 3fkh2 = roll 3 focus die, keep highest 2, show all rolls but signify the two kept rolls)
    -   Keep Lowest = Same as above, but lowest values instead of highest