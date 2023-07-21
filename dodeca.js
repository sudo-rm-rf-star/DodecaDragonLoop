window.confirm = function () {
    return true;
};

let settings = {
    // setting to reset after X sigils, 0 to disable
    reset_sigils_after: {"name": "Reset sigils after", "value": 0, "type": "number"},
    disable_cyan_sigil_upgrades: {"name": "Disable cyan sigil upgrades", "value": false, "type": "boolean"},
}

// get settings from local storage if they exist
cached_settings = JSON.parse(localStorage.getItem('settings'));
// override default settings with cached settings for every setting that exists
for (let setting in cached_settings) {
    if (cached_settings.hasOwnProperty(setting)) {
        settings[setting].value = cached_settings[setting].value;
    }
}


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

// buy magic upgrades with class "magicUpgrade"
function buy_magic_upgrades() {
    const buttons = document.getElementsByClassName("magicUpgrade");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].click();
    }
}

function buy_dark_magic_upgrades() {
    const buttons = document.getElementsByClassName("darkMagicUpgrade");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].click();
    }
}

function buy_cyan_sigil_upgrades() {
    const disable_cyan_sigil_upgrades = settings.disable_cyan_sigil_upgrades.value
    if (disable_cyan_sigil_upgrades) return;

    const buttons = document.getElementsByClassName("cyanSigilUpgrade");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].click();
    }
}

function reset_progress_for_sigils() {
    const reset_sigils_after = settings.reset_sigils_after.value
    if (reset_sigils_after === 0) return;

    const sigils_to_get = parseInt(document.getElementById("cyanSigilsToGet").innerText);
    if (sigils_to_get >= reset_sigils_after) {
        document.getElementById("cyanSigilsToGet").parentElement.click();
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
    buy_magic_upgrades();
    buy_dark_magic_upgrades();
    buy_dragon_feed();
    reset_progress_for_sigils();
}

let CHALLENGE_COMBINATIONS = [
    [3], [2, 3], [0, 2, 3], [0, 1, 2, 3]
]

let challenge_cool_down = [0, 0, 0, 0];

function get_score(n) {
    const score = document.getElementById("magicScore" + (n + 1)).innerText.replaceAll(",", "").replaceAll(".", "")
    return parseFloat(score);
}

function should_do_challenge(score_before, score_after) {
    if (score_before === 0) return true;
    return score_after >= score_before * 1.1;
}

async function do_challenge(n) {

    if (challenge_cool_down[n] > 0) {
        challenge_cool_down[n] -= 1;
        return;
    }

    const score_before = get_score(n);
    // doing challenge, current score is
    console.log("doing challenge " + n + " with score " + score_before)

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
    const score_after = get_score(n);
    console.log("done challenge " + n + " with score " + score_after)

    if (!should_do_challenge(score_before, score_after)) {
        // console log why disabling
        console.log("Disabling challenge " + n + " because score after is " + score_after + " and score before is " + score_before)
        challenge_cool_down[n] = 5; // skip 5 loops
    } else {
        challenge_cool_down = [0, 0, 0, 0]
    }
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
        if (challenge_combo.includes(i)) {
            enable_challenge(i)
        } else {
            disable_challenge(i)
        }
    }
}

async function do_challenges() {
    for (let i = 0; i < CHALLENGE_COMBINATIONS.length; i++) {
        await do_challenge(i);
    }
}

async function idle_loop(mSecs = 5) {
    console.log("idle loop for " + mSecs + " seconds")
    for (let i = 0; i < mSecs; i++) {
        buy_upgrades()
        await delay(1000);
    }
}

// create settings window
function create_settings_window() { // Create the settings overlay and modal elements
    const settingsOverlay = document.createElement('div');
    settingsOverlay.classList.add('settings-overlay');
    settingsOverlay.style.display = 'flex';

    const settingsModal = document.createElement('div');
    settingsModal.classList.add('settings-modal');
    settingsModal.style.backgroundColor = '#fff'; // White background
    settingsModal.style.color = '#000'; // Black text color
    settingsModal.style.padding = '5px';
    settingsModal.style.borderRadius = '5px';
    settingsModal.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    settingsModal.style.display = 'flex';
    settingsModal.style.flexDirection = 'column';

    for (const setting in settings) {
        const settingLabel = document.createElement('label');
        settingLabel.textContent = settings[setting].name;
        settingLabel.style.marginBottom = '5px';

        const settingInput = document.createElement('input');
        if (settings[setting].type === 'boolean') {
            settingInput.type = 'checkbox'; // Use checkbox for boolean settings
            settingInput.style.position = 'relative' // Fix checkbox position
            settingInput.style.width = '15px';
            settingInput.style.height = '15px'
            settingInput.style.appearance = 'checkbox'
            settingInput.style.opacity = '1'


            if (typeof settings[setting].value !== 'boolean') {
                settings[setting].value = settings[setting].default;
            }

            settingInput.checked = settings[setting].value;
        } else {
            settingInput.type = 'number'; // Use number input for non-boolean settings
            settingInput.style.width = '50px';
            settingInput.value = settings[setting].value;
        }

        settingInput.addEventListener('change', () => {
            if (settings[setting].type === 'boolean') {
                settings[setting].value = settingInput.checked; // Update boolean settings
            } else {
                settings[setting].value = settingInput.value; // Update non-boolean settings
            }
            localStorage.setItem('settings', JSON.stringify(settings));
        });

        settingInput.style.marginLeft = '10px';

        settingLabel.appendChild(settingInput);
        settingsModal.appendChild(settingLabel);
    }


    settingsOverlay.appendChild(settingsModal);

// Style the settings overlay and modal for the bottom left position
    settingsOverlay.style.position = 'fixed';
    settingsOverlay.style.bottom = '60px';
    settingsOverlay.style.left = '10px';
    settingsModal.style.marginTop = 'auto';

// Append the settings overlay to the existing page
    document.body.appendChild(settingsOverlay);

// Add a button to open the settings window
    const settingsBtn = document.createElement('button');
    settingsBtn.textContent = 'Close Settings';
    settingsBtn.addEventListener('click', () => {
        if (settingsOverlay.style.display === 'flex') {
            settingsOverlay.style.display = 'none';
            settingsBtn.textContent = 'Open Settings';
        } else {
            settingsOverlay.style.display = 'flex';
            settingsBtn.textContent = 'Close Settings';
        }
    });

    // add button to reset to default
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset to default';
    resetBtn.addEventListener('click', () => {
    })
    settingsModal.appendChild(resetBtn);

// Style the settings button for the bottom left position
    settingsBtn.style.position = 'fixed';
    settingsBtn.style.bottom = '10px';
    settingsBtn.style.left = '10px';

    document.body.appendChild(settingsBtn);
}


async function game_loop() {
    // do 5 challenge loops
    for (let i = 0; i < 5; i++) {
        await do_challenges()
        await idle_loop()
    }

    // call this function again in 1 second
    setTimeout(game_loop, 1000);
}

// start the game loop
create_settings_window()
await game_loop();