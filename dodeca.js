function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function buy_fire_upgrades() {
    // click on the buy all button with ID "BuyAllFireButton"
    document.getElementById("fireMaxAllButton").click();
}

function buy_platinum_upgrades() {
    document.getElementById("platinumMaxAllButton").click();
}

function buy_uranium_upgrades() {
    document.getElementById("uraniumMaxAllButton").click();
}

function buy_dark_magic_upgrades() {
    const buttons = document.getElementsByClassName("darkMagicUpgrade");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].click();
    }
}

function buy_cyan_sigil_upgrades() {
    const buttons = document.getElementsByClassName("cyanSigilUpgrade");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].click();
    }
}

function buy_dragon_feed() {
    document.getElementById("dragonFeedButton").click();
}

function buy_upgrades() {
    buy_fire_upgrades();
    buy_platinum_upgrades();
    buy_uranium_upgrades();
    buy_cyan_sigil_upgrades();
    buy_dark_magic_upgrades();
    buy_dragon_feed();
}

const CHALLENGE_COMBINATIONS = [
    [3], [2, 3], [0, 2, 3], [0, 1, 2, 3]
]

// create a function to do the nth challenge (n is the parameter)
async function do_challenge(n) {
    console.log("Doing challenge " + n)

    const challenge_combo = CHALLENGE_COMBINATIONS[n];
    enable_challenge_combo(challenge_combo)
    start_challenge()

    // do 3 game loops
    for (let i = 0; i < 3; i++) {
        buy_upgrades();
        await delay(1000);
    }
    
    // end challenge
    stop_challenge()
}

function is_challenge_enabled(challenge_number) {
    const challenge_div = document.getElementsByClassName("magicChallenge")[challenge_number];
    const challenge_div_color = challenge_div.style.color;
    return challenge_div_color !== "white";
}

function enable_challenge(challenge_number) {
    if (!is_challenge_enabled(challenge_number)) {
        document.getElementsByClassName("magicChallenge")[challenge_number].click();
    }
}

function disable_challenge(challenge_number) {
    if (is_challenge_enabled(challenge_number)) {
        document.getElementsByClassName("magicChallenge")[challenge_number].click();
    }
}

function start_challenge() {
    // verify we are not yet in a challenge, then there is a text "You are not in any challenges!"
    if (document.getElementById("activeChallenges").innerText === "You are not in any challenges!") {
        // click on the challenge button
        document.getElementById("magicChallengeButton").click();
    }
}

function stop_challenge() {
    // verify we are not yet in a challenge, then there is a text "You are not in any challenges!"
    if (document.getElementById("activeChallenges").innerText !== "You are not in any challenges!") {
        // click on the challenge button
        document.getElementById("magicChallengeButton").click();
    }
}

function enable_challenge_combo(challenge_combo) {
    for (let i = 0; i < 4; i++) {
        if(challenge_combo.includes(i)) {
            enable_challenge(i)
        }
        else {
            disable_challenge(i)
        }
    }
}

async function do_challenges() {
    for (let i = 0; i < CHALLENGE_COMBINATIONS.length; i++) {
        await do_challenge(i);
    }
}

function can_befriend_dragon() {
    return !document.getElementById("dragonSpendTimeButton").disabled;
}

async function befriend_dragon() {
    console.log("Befriending dragon")

    // Wait until we can befriend the dragon
    while (!can_befriend_dragon()) {
        await delay(1000);
        buy_upgrades()
    }

    document.getElementById("dragonSpendTimeButton").click();
    while (!can_befriend_dragon()) {
        await delay(1000);
        buy_upgrades()
    }
}

async function idle_loop() {
    console.log("idle loop")
    for (let i = 0; i < 5; i++) {
        buy_upgrades()
        await delay(1000);
    }
}

async function game_loop() {
    // do 5 challenge loops
    for (let i = 0; i < 5; i++) {
        await do_challenges()
        await idle_loop()
    }

    await befriend_dragon()

    // call this function again in 1 second
    setTimeout(game_loop, 1000);
}

// start the game loop
await game_loop();