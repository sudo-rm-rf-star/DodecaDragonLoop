window.confirm = function () {
    return true;
};

const settingsKey = "dodeca_settings";
const statisticsKey = "dodeca_statistics";

let settings = {
    // setting to reset after X sigils, 0 to disable
    mine_gold_clicks: {"name": "Mine gold clicks/sec", "value": 1, "type": "number"},
    buy_miners: {"name": "Buy miners", "value": true, "type": "boolean"},
    time_in_challenge: {"name": "Seconds per challenge", "value": 3, "type": "number"},
    reset_cooldown: {"name": "Reset cooldown", "value": 0, "type": "number"},
    reset_magic_after: {"name": "Reset magic after", "value": 0, "type": "number"},
    reset_sigils_after: {"name": "Reset sigils after", "value": 1, "type": "number"},
    reset_cyan_sigils: {"name": "Reset cyan sigils", "value": true, "type": "boolean"},
    reset_blue_sigils: {"name": "Reset blue sigils", "value": true, "type": "boolean"},
    reset_indigo_sigils: {"name": "Reset indigo sigils", "value": true, "type": "boolean"},
    reset_violet_sigils: {"name": "Reset violet sigils", "value": true, "type": "boolean"},
    reset_pink_sigils: {"name": "Reset pinks sigils", "value": true, "type": "boolean"},
}

let statistics = {
    curGold: {"name": "Cur gold", "value": "0", "type": "string"},
    maxGold: {"name": "Max gold", "value": "0", "type": "string"},
    lastResetTime: {"name": "Last reset time", "value": new Date().getTime(), "type": "number", "visible": false},
    timeSinceLastReset: {"name": "Seconds since last reset", "value": 0, "type": "number"},
    timeForLastReset: {"name": "Seconds for last reset", "value": 0, "type": "number"},
    sigilLastReset: {"name": "Sigil last reset", "value": "none", "type": "string"},
    totalMagicResets : {"name": "Total magic resets", "value": 0, "type": "number"},
    totalCyanResets : {"name": "Total cyan resets", "value": 0, "type": "number"},
    totalBlueResets : {"name": "Total blue resets", "value": 0, "type": "number"},
    totalIndigoResets : {"name": "Total indigo resets", "value": 0, "type": "number"},
    totalVioletResets : {"name": "Total violet resets", "value": 0, "type": "number"},
    totalPinkResets : {"name": "Total pink resets", "value": 0, "type": "number"},
}

// get settings from local storage if they exist
cached_settings = JSON.parse(localStorage.getItem(settingsKey));
// override default settings with cached settings for every setting that exists
for (let setting in cached_settings) {
    if (cached_settings.hasOwnProperty(setting) && settings.hasOwnProperty(setting)) {
        if (settings[setting].type === "number") {
            settings[setting].value = parseInt(cached_settings[setting].value);
        }
        if (settings[setting].type === "boolean") {
            settings[setting].value = cached_settings[setting].value === true;
        }
    }
}

// get statistics from local storage if they exist
cached_statistics = JSON.parse(localStorage.getItem(statisticsKey));
// override default statistics with cached statistics for every statistic that exists
for (let statistic in cached_statistics) {
    if (cached_statistics.hasOwnProperty(statistic) && statistics.hasOwnProperty(statistic)) {
        if (statistics[statistic].type === "number") {
            statistics[statistic].value = parseInt(cached_statistics[statistic].value);
        }
        if (statistics[statistic].type === "string") {
            statistics[statistic].value = cached_statistics[statistic].value;
        }
    }
}

localStorage.setItem(settingsKey, JSON.stringify(settings));

function gets_automatic_magic() {
    return get_current_magic() > 1000000000;
}

function gets_automatic_challenge_rating() {
    return get_current_blue_sigils() >= 5;
}

function get_available_sigils() {
    const [_, exp] = parseExponent(statistics.maxGold.value)
    let available_sigils = [];
    if (exp >= 300000 && settings.reset_pink_sigils.value) {
        available_sigils.push("pink");
    }
    if (exp >= 30000 && settings.reset_violet_sigils.value) {
        available_sigils.push("violet");
    }
    if (exp >= 16000 && settings.reset_indigo_sigils.value) {
        available_sigils.push("indigo");
    }
    if (exp >= 8000 && settings.reset_blue_sigils.value) {
        available_sigils.push("blue");
    }
    if (exp >= 2000 && settings.reset_cyan_sigils.value) {
        available_sigils.push("cyan");
    }
    return available_sigils
}

let currentSigilRotation = 0
function sigil_to_reset() {
    if(statistics.timeSinceLastReset.value < settings.reset_cooldown.value) return;
    const available_sigils = get_available_sigils();
    return available_sigils[currentSigilRotation % available_sigils.length];
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function is_auto_mine_enabled() {
    return document.getElementById("minerAutoBuyMaxButton").innerText === "Auto max all: On";
}

function buy_fire_upgrades() {
    // click on the buy all button with ID "BuyAllFireButton"
    document.getElementById("fireMaxAllButton").click();
}

function buy_platinum_upgrades() {
    const buttons = document.getElementsByClassName("platinumUpgrade");
    if (!buttons[4].disabled) {
        // Convert platinum: click on platinumConvertButton
        document.getElementById("platinumConvertButton").click();
        // Focus on the 5th platinum upgrade
        buttons[4].click()
        return;
    }

    if (!buttons[2].disabled) {
        buttons[2].click()
        return;
    }

    document.getElementById("platinumMaxAllButton").click();
}

function get_uranium_per_second() {
    // extraUraniumPerSecond is the ID
    return parseNumber(document.getElementById("extraUraniumPerSecond").innerText);
}

function uranium_to_get() {
    return parseNumber(document.getElementById("uraniumToGet").innerText);
}

let disable_uranium_farm = false;
function farm_uranium() {
    if(!disable_uranium_farm && uranium_to_get() > get_uranium_per_second() * 2) {
        document.getElementById("uraniumConvertButton").click();
    }
}

function buy_uranium_upgrades() {
    const buttons = document.getElementsByClassName("uraniumUpgrade");
    if (!buttons[2].disabled) {
        buttons[2].click()
        return;
    }

    if (!buttons[1].disabled) {
        buttons[1].click()
        return;
    }

    if(!buttons[0].disabled) {
        buttons[0].click()
        return;
    }

    if (!buttons[3].disabled && buttons[3].style.display !== "none") {
        buttons[3].click()
        return;
    }

    if (!buttons[4].disabled && buttons[4].style.display !== "none") {
        buttons[4].click()
        return;
    }

    disable_uranium_farm = true;
    document.getElementById("uraniumMaxAllButton").click();
}

// buy magic upgrades with class "magicUpgrade"
function buy_magic_upgrades() {
    const buttons = document.getElementsByClassName("magicUpgrade");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].click();
    }
}

const magicCosts = [2, 3, 8, 12, 30, 100, 300, 1500, 4000, 20000, 100000, 400000]
function next_magic_cost() {
    const buttons = document.getElementsByClassName("magicUpgrade");
    for (let i = 0; i < buttons.length; i++) {
        if (!buttons[i].disabled) {
            return magicCosts[i];
        }
    }
}

function buy_dark_magic_upgrades() {
    const buttons = document.getElementsByClassName("darkMagicUpgrade");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].click();
    }
}

function buy_cyan_sigil_upgrades() {
    const buttons = document.getElementsByClassName("cyanSigilUpgrade");
    if (!buttons[3].disabled && get_current_cyan_sigil_power() > 2000) {
        // Focus on the 4th platinum upgrade
        buttons[3].click()
        return;
    }

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].click();
    }
}

function buy_blue_sigil_upgrades() {
    const buttons = document.getElementsByClassName("blueSigilUpgrade");
    if (!buttons[3].disabled && get_current_blue_sigil_power() > 2000) {
        // Focus on the 4th blue sigil upgrade
        buttons[3].click()
        return;
    }

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].click();
    }
}

function buy_indigo_sigil_upgrades() {
    const buttons = document.getElementsByClassName("indigoSigilUpgrade");
    if (!buttons[3].disabled && get_current_indigo_sigil_power() > 2000) {
        // Focus on the 4th indigo sigil upgrade
        buttons[3].click()
        return;
    }

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].click();
    }
}

function buy_violet_sigil_upgrades() {
    const buttons = document.getElementsByClassName("violetSigilUpgrade");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].click();
    }
}

function buy_pink_sigil_upgrades() {
    const buttons = document.getElementsByClassName("pinkSigilUpgrade");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].click();
    }
}

function reset_progress_for_magic() {
    const reset_magic_after = settings.reset_magic_after.value
    const magic_to_get = parseNumber(document.getElementById("magicToGet").innerText);

    let should_reset = reset_magic_after !== 0 && magic_to_get >= reset_magic_after

    // if we can progress more than 1/10 of the way to the next magic upgrade, reset
    should_reset |= !gets_automatic_magic() && reset_magic_after === 0 && magic_to_get > next_magic_cost() / 10 + 1

    // if we don't have any more upgrades to buy, reset if our current magic is at least doubled
    should_reset |= !gets_automatic_magic() && reset_magic_after === 0 && magic_to_get > get_current_magic() * 2

    if (should_reset) {
        document.getElementById("magicToGet").parentElement.click();
        post_reset()
        statistics.totalMagicResets.value += 1;
    }
}

function post_reset() {
    statistics.timeForLastReset.value = Math.floor((Date.now() - statistics.lastResetTime.value) / 1000)
    statistics.lastResetTime.value = new Date().getTime();
    currentSigilRotation++
}

function get_dragon_cooldown() {
    // dragonTimeCooldown
    return parseNumber(document.getElementById("dragonTimeCooldown").innerText);
}

function spend_time_with_dragon() {
    // click on dragonSpendTimeButton
    document.getElementById("dragonSpendTimeButton").click();
}

function reset_progress_for_cyan_sigils() {
    const reset_this_sigil = sigil_to_reset() === "cyan"
    if(!reset_this_sigil) return;

    const reset_sigils_after = settings.reset_sigils_after.value
    const sigils_to_get = parseInt(document.getElementById("cyanSigilsToGet").innerText);
    if (sigils_to_get >= reset_sigils_after) {
        document.getElementById("cyanSigilsToGet").parentElement.click();
        post_reset()
        statistics.totalCyanResets.value += 1;
        statistics.sigilLastReset.value = "cyan";
    }
}

function reset_progress_for_blue_sigils() {
    const reset_this_sigil = sigil_to_reset() === "blue"
    if(!reset_this_sigil) return;

    const reset_sigils_after = settings.reset_sigils_after.value
    const sigils_to_get = parseInt(document.getElementById("blueSigilsToGet").innerText);
    if (sigils_to_get >= reset_sigils_after) {
        document.getElementById("blueSigilsToGet").parentElement.click();
        post_reset()
        statistics.totalBlueResets.value += 1;
        statistics.sigilLastReset.value = "blue";
    }
}

function reset_progress_for_indigo_sigils() {
    const reset_this_sigil = sigil_to_reset() === "indigo"
    if(!reset_this_sigil) return;

    const reset_sigils_after = settings.reset_sigils_after.value
    const sigils_to_get = parseInt(document.getElementById("indigoSigilsToGet").innerText);
    if (sigils_to_get >= reset_sigils_after) {
        document.getElementById("indigoSigilsToGet").parentElement.click();
        post_reset()
        statistics.totalIndigoResets.value += 1;
        statistics.sigilLastReset.value = "indigo";
    }
}

function reset_progress_for_violet_sigils() {
    const reset_this_sigil = sigil_to_reset() === "violet"
    if(!reset_this_sigil) return;

    const reset_sigils_after = settings.reset_sigils_after.value
    const sigils_to_get = parseInt(document.getElementById("violetSigilsToGet").innerText);
    if (sigils_to_get >= reset_sigils_after) {
        document.getElementById("violetSigilsToGet").parentElement.click();
        post_reset()
        statistics.totalVioletResets.value += 1;
        statistics.sigilLastReset.value = "violet";
    }
}

function reset_progress_for_pink_sigils() {
    const reset_this_sigil = sigil_to_reset() === "pink"
    if(!reset_this_sigil) return;

    const reset_sigils_after = settings.reset_sigils_after.value
    const sigils_to_get = parseInt(document.getElementById("pinkSigilsToGet").innerText);
    if (sigils_to_get >= reset_sigils_after) {
        document.getElementById("pinkSigilsToGet").parentElement.click();
        post_reset()
        statistics.totalPinkResets.value += 1;
        statistics.sigilLastReset.value = "pink";
    }
}

function buy_dragon_feed() {
    document.getElementById("dragonFeedButton").click();
}

function pet_dragon() {
    document.getElementById("dragonPetButton").click();
}

function buy_upgrades() {
    update_statistics()
    unlock_dragon()
    upgrade_dragon()
    unlock_fire_upgrade()
    unlock_alchemy_upgrade()
    unlock_magic_upgrade()
    unlock_more_magic_upgrade()
    unlock_more_platinum_and_uranium_upgrades()
    unlock_dark_magic_upgrade()
    buy_miners()
    buy_dragon_feed();
    pet_dragon()
    buy_fire_upgrades();
    buy_platinum_upgrades();
    farm_uranium()
    buy_uranium_upgrades();
    buy_magic_upgrades();
    buy_dark_magic_upgrades();
    buy_cyan_sigil_upgrades();
    buy_blue_sigil_upgrades();
    buy_indigo_sigil_upgrades();
    buy_violet_sigil_upgrades();
    buy_pink_sigil_upgrades();
    reset_progress_for_magic();
    reset_progress_for_cyan_sigils();
    reset_progress_for_blue_sigils()
    reset_progress_for_indigo_sigils()
    reset_progress_for_violet_sigils()
    reset_progress_for_pink_sigils()
}

let EASY_CHALLENGE_COMBOS = [
    [0], [0, 1], [0, 1, 3], [0, 1, 2, 3]
]

let HARD_CHALLENGE_COMBOS = [
    [3], [2, 3], [0, 2, 3], [0, 1, 2, 3]
]

let challenge_cool_down = [0, 0, 0, 0];
let reset_cool_down = 5;

function get_score(n) {
    const score = document.getElementById("magicScore" + (n + 1)).innerText.replaceAll(",", "").replaceAll(".", "")
    return parseFloat(score);
}

function get_mine_gold_button() {
    const buttons = document.getElementsByTagName("button");
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].innerText === "Mine gold") {
            return buttons[i];
        }
    }
}

function parseNumber(str) {
    str = str.replaceAll(",", "").replaceAll(".", "")
    return parseFloat(str);
}

function parseExponent(str) {
    str = str.replaceAll(",", "").replaceAll(".", "")
    if (!str.includes("e")) {
        return [parseFloat(str), 0]
    }

    const split = str.split("e")
    return [parseInt(split[0] || 1), parseInt(split[1])]
}

function compareExponent(a, b) {
    if (a[1] === b[1]) {
        return a[0] - b[0]
    }

    return a[1] - b[1]
}

function get_current_gold() {
    return document.getElementById("gold").innerText
}

function get_current_magic() {
    const magic = document.getElementById("magic").innerText.replaceAll(",", "").replaceAll(".", "")
    return parseFloat(magic);
}

function get_current_cyan_sigils() {
    const cyan_sigils = document.getElementById("cyanSigils").innerText.replaceAll(",", "").replaceAll(".", "")
    return parseFloat(cyan_sigils);
}

function get_current_blue_sigils() {
    const blue_sigils = document.getElementById("blueSigils").innerText.replaceAll(",", "").replaceAll(".", "")
    return parseFloat(blue_sigils);
}

function get_current_cyan_sigil_power() {
    const cyan_sigil_power = document.getElementById("cyanSigilPower").innerText.replaceAll(",", "").replaceAll(".", "")
    return parseFloat(cyan_sigil_power);
}

function get_current_blue_sigil_power() {
    const blue_sigil_power = document.getElementById("blueSigilPower").innerText.replaceAll(",", "").replaceAll(".", "")
    return parseFloat(blue_sigil_power);
}

function get_current_indigo_sigil_power() {
    const indigo_sigil_power = document.getElementById("indigoSigilPower").innerText.replaceAll(",", "").replaceAll(".", "")
    return parseFloat(indigo_sigil_power);
}

function get_current_violet_sigil_power() {
    const violet_sigil_power = document.getElementById("violetSigilPower").innerText.replaceAll(",", "").replaceAll(".", "")
    return parseFloat(violet_sigil_power);
}

function get_gold_per_second() {
    const gold_per_second = document.getElementById("goldPerSecond").innerText.replaceAll(",", "").replaceAll(".", "")
    return parseFloat(gold_per_second);
}

const mine_gold_button = get_mine_gold_button()

async function mine_gold() {
    const mine_gold = settings.mine_gold_clicks.value
    for (let i = 0; i < mine_gold; i++) {
        mine_gold_button.click();
    }
}

async function mine_starting_gold() {
    while (get_gold_per_second() < 20) {
        mine_gold_button.click();
        buy_miners()
        await delay(10)
    }
}

function buy_miners() {
    const buy_miners = settings.buy_miners.value
    if (!buy_miners || is_auto_mine_enabled()) return;
    document.getElementById("buyMinerButton").nextElementSibling.click();
}

function has_dragon() {
    const unlock_dragon_button = document.getElementById("unlockDragonButton");
    return unlock_dragon_button.style.display === "none";
}

function unlock_dragon() {
    if (has_dragon()) return;
    document.getElementById("unlockDragonButton").click();
}

function has_fire_upgrade() {
    const fire_upgrade = document.getElementById("buyFireUpgradesButton");
    return fire_upgrade.style.display === "none";
}

function unlock_fire_upgrade() {
    if (has_fire_upgrade()) return;
    document.getElementById("buyFireUpgradesButton").click();
}

function has_alchemy_upgrade() {
    // unlockAlchemyButton
    const alchemy_upgrade =  document.getElementById("unlockAlchemyButton");
    return alchemy_upgrade.style.display === "none";
}

function unlock_alchemy_upgrade() {
    if (has_alchemy_upgrade()) return;
    document.getElementById("unlockAlchemyButton").click();
}

function has_magic_upgrade() {
    const magic_upgrade = document.getElementById("unlockMagicButton");
    return magic_upgrade.style.display === "none";
}

function unlock_magic_upgrade() {
    if (has_magic_upgrade()) return;
    document.getElementById("unlockMagicButton").click();

}

function has_more_magic_upgrade() {
    const more_magic_upgrade = document.getElementById("moreMagicUpgradesButton");
    return more_magic_upgrade.style.display === "none";
}

function unlock_more_magic_upgrade() {
    if (has_more_magic_upgrade()) return;
    document.getElementById("moreMagicUpgradesButton").click();
}

function has_more_platinum_and_uranium_upgrades() {
    const more_pu_upgrades = document.getElementById("morePUupgradesButton");
    return more_pu_upgrades.style.display === "none";
}

function unlock_more_platinum_and_uranium_upgrades() {
    if(has_more_platinum_and_uranium_upgrades()) return;
    document.getElementById("morePUupgradesButton").click();
}

function has_dark_magic_upgrade() {
    const dark_magic_upgrade = document.getElementById("unlockDarkMagicUpgradesButton");
    return dark_magic_upgrade.style.display === "none";
}

function unlock_dark_magic_upgrade() {
    if (has_dark_magic_upgrade()) return;
    document.getElementById("unlockDarkMagicUpgradesButton").click();
}


function upgrade_dragon() {
    const buttons = document.getElementsByClassName("upgradeDragonButton");
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].style.display !== "none") {
            buttons[i].click();
        }
    }
}

function unlocked_challenges() {
    // check if tab_magicChallenges has display none
    const tab_magicChallenges = document.getElementById("tab_magicChallenges");
    return tab_magicChallenges.style.display !== "none";
}

function should_do_challenge(score_before, score_after) {
    if (score_before === 0) return true;
    return score_after >= score_before * 1.1;
}

async function do_challenge(n) {
    const time_in_challenges = settings.time_in_challenge.value
    if (!unlocked_challenges() || time_in_challenges === 0 || gets_automatic_challenge_rating()) return;

    if (challenge_cool_down[n] > 0) {
        challenge_cool_down[n] -= 1;
        return;
    }

    const score_before = get_score(n);
    const challenge_combo = get_dragon_stage_counter() === "V" ? HARD_CHALLENGE_COMBOS[n] : EASY_CHALLENGE_COMBOS[n];
    enable_challenge_combo(challenge_combo)
    start_challenge()

    for (let i = 0; i < time_in_challenges; i++) {
        buy_upgrades();
        await mine_gold()
        await delay(1000);
    }

    // end challenge
    stop_challenge()
    const score_after = get_score(n);

    if (!should_do_challenge(score_before, score_after)) {
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

function get_dragon_stage_counter() {
    const dragon_stage_counter = document.getElementById("dragonStageCounter");
    return dragon_stage_counter.innerText;
}

async function do_challenges() {
    if(get_current_cyan_sigils() < 1) {
        const dragon_cd = get_dragon_cooldown()
        await idle_loop(dragon_cd)
    }

    for (let i = 0; i < HARD_CHALLENGE_COMBOS.length; i++) {
        await do_challenge(i);
    }
}

async function idle_loop(mSecs = 5) {
    for (let i = 0; i < mSecs; i++) {
        if (settings.mine_gold_clicks.value > 0) {
            await mine_gold()
        }

        buy_upgrades()
        await delay(1000);
    }
}

function add_setting(settingsModal, setting) {
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
            settingInput.min = "0";
            settingInput.value = settings[setting].value;
        }

        settingInput.addEventListener('change', () => {
            if (settings[setting].type === 'boolean') {
                settings[setting].value = settingInput.checked; // Update boolean settings
            } else {
                settings[setting].value = settingInput.value; // Update non-boolean settings
            }
            localStorage.setItem(settingsKey, JSON.stringify(settings));
        });

        settingInput.style.marginLeft = '10px';

        settingLabel.appendChild(settingInput);
        settingsModal.appendChild(settingLabel);
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
        add_setting(settingsModal, setting);
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
        localStorage.removeItem(settingsKey);
        window.location.reload();
    })
    settingsModal.appendChild(resetBtn);

// Style the settings button for the bottom left position
    settingsBtn.style.position = 'fixed';
    settingsBtn.style.bottom = '10px';
    settingsBtn.style.left = '10px';

    document.body.appendChild(settingsBtn);
}

function create_statistics_window() {
    // Create the statistics overlay and modal elements
    const statisticsOverlay = document.createElement('div');
    statisticsOverlay.classList.add('statistics-overlay');
    statisticsOverlay.style.display = 'flex';

    const statisticsModal = document.createElement('div');
    statisticsModal.classList.add('statistics-modal');
    statisticsModal.style.backgroundColor = '#fff'; // White background
    statisticsModal.style.color = '#000'; // Black text color
    statisticsModal.style.padding = '5px';
    statisticsModal.style.borderRadius = '5px';
    statisticsModal.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    statisticsModal.style.display = 'flex';
    statisticsModal.style.flexDirection = 'column';

    for (const stat in statistics) {
        const statLabel = document.createElement('label');
        statLabel.textContent = statistics[stat].name;
        statLabel.style.marginBottom = '5px';

        const statValue = document.createElement('span');
        statValue.textContent = statistics[stat].value;
        statValue.style.marginLeft = '10px';

        statLabel.appendChild(statValue);
        statisticsModal.appendChild(statLabel);
        statValue.id = stat;
        if (statistics[stat].visible === false) {
            statLabel.style.display = 'none';
        }
    }

    statisticsOverlay.appendChild(statisticsModal);

    const removeHistoryBtn = document.createElement('button');
    removeHistoryBtn.textContent = 'Remove History';
    removeHistoryBtn.addEventListener('click', () => {
        localStorage.removeItem(statisticsKey);
        window.location.reload();
    });

    statisticsModal.appendChild(removeHistoryBtn);

    statisticsOverlay.appendChild(statisticsModal);

    // Style the statistics overlay and modal for the bottom right position
    statisticsOverlay.style.position = 'fixed';
    statisticsOverlay.style.bottom = '60px';
    statisticsOverlay.style.right = '10px';
    statisticsModal.style.marginTop = 'auto';

    // Append the statistics overlay to the existing page
    document.body.appendChild(statisticsOverlay);

    // Add a button to open/close the statistics window
    const statisticsBtn = document.createElement('button');
    statisticsBtn.textContent = 'Close Statistics';
    statisticsBtn.addEventListener('click', () => {
        if (statisticsOverlay.style.display === 'flex') {
            statisticsOverlay.style.display = 'none';
            statisticsBtn.textContent = 'Open Statistics';
        } else {
            statisticsOverlay.style.display = 'flex';
            statisticsBtn.textContent = 'Close Statistics';
        }
    });

    // Style the statistics button for the bottom right position
    statisticsBtn.style.position = 'fixed';
    statisticsBtn.style.bottom = '10px';
    statisticsBtn.style.right = '10px';

    document.body.appendChild(statisticsBtn);
}

function update_statistics() {
    // update seconds since last reset
    statistics.timeSinceLastReset.value = Math.floor((Date.now() - statistics.lastResetTime.value) / 1000)

    const curGold = get_current_gold()
    statistics.curGold.value = curGold
    const maxGold = statistics.maxGold.value
    if (compareExponent(parseExponent(curGold), parseExponent(maxGold)) > 0) {
        statistics.maxGold.value = curGold
    }

    // update value of each stat
    for (const stat in statistics) {
        // if value is null, hide the stat
        let statElement = document.getElementById(stat)
        if (statistics[stat].value === 0) {
            statElement.parentElement.style.display = 'none';
            continue;
        }

        // if value is not null and stat is hidden, show the stat
        if (statElement.parentElement.style.display === 'none' && statistics[stat].visible !== false) {
            statElement.parentElement.style.display = 'flex';
        }

        statElement.textContent = statistics[stat].value;
    }

    // save statistics to local storage
    localStorage.setItem(statisticsKey, JSON.stringify(statistics));
}


async function game_loop() {
    await mine_starting_gold()

    // do 5 challenge loops, 75 seconds in total
    for (let i = 0; i < 5; i++) {
        await do_challenges()
        await idle_loop(3)
    }

    spend_time_with_dragon()
    // call this function again in 1 second
    setTimeout(game_loop, 1000);
}

// start the game loop
create_settings_window()
create_statistics_window()
await game_loop();

