window.confirm = function () {
    return true;
};

const settingsKey = "dodeca_settings";
const statisticsKey = "dodeca_statistics";
const sigils = ["cyan", "blue", "indigo", "violet", "pink"];
const ITERATION_SPEED_MS = 100;

let settings = {
    // setting to reset after X sigils, 0 to disable
    enabled: {"name": "Enabled", "value": true, "type": "boolean"},
    mine_gold_clicks: {"name": "Mine gold clicks/sec", "value": 1, "type": "number"},
    buy_miners: {"name": "Buy miners", "value": true, "type": "boolean"},
    time_in_challenge: {"name": "Seconds per challenge", "value": 3, "type": "number"},
    reset_cooldown: {"name": "Reset cooldown", "value": 3, "type": "number"},
    reset_magic_after: {"name": "Reset magic after", "value": 0, "type": "number"},
    reset_sigils_after: {"name": "Reset sigils after", "value": 1, "type": "number"},
    growth_rate_sigils: {"name": "Growth rate sigils", "value": 110, "type": "number"},
    growth_rate_knowledge: {"name": "Growth rate knowledge", "value": 110, "type": "number"},
    spend_sigils_cooldown: {"name": "Spend sigils cooldown", "value": 30, "type": "number"},
    spend_sigils_time: {"name": "Spend sigils time", "value": 10, "type": "number"},
    spend_sigis_divider_exponent: {"name": "Spend sigils divider exponent", "value": 2, "type": "number"},
    spend_knowledge_divider_exponent: {"name": "Spend knowledge divider exponent", "value": 2, "type": "number"},
    disable_hell: {"name": "Disable hell", "value": false, "type": "boolean"},
    disable_knowledge_upgrades: {"name": "Disable knowledge upgrades", "value": false, "type": "boolean"},

}

let statistics = {
    curGold: {"name": "Cur gold", "value": "0", "type": "string"},
    maxGold: {"name": "Max gold", "value": "0", "type": "string"},
    lastResetTime: {"name": "Last reset time", "value": new Date().getTime(), "type": "number", "visible": false},
    timeSinceLastReset: {"name": "Seconds since last reset", "value": 0, "type": "number"},
    timeForLastReset: {"name": "Seconds for last reset", "value": 0, "type": "number"},
    sigilLastReset: {"name": "Sigil last reset", "value": "none", "type": "string"},
    sigilNextReset: {"name": "Sigil next reset", "value": "none", "type": "string"},
    totalMagicResets: {"name": "Total magic resets", "value": 0, "type": "number", "visible": false},
    totalCyanResets: {"name": "Total cyan resets", "value": 0, "type": "number", "visible": false},
    totalBlueResets: {"name": "Total blue resets", "value": 0, "type": "number", "visible": false},
    totalIndigoResets: {"name": "Total indigo resets", "value": 0, "type": "number", "visible": false},
    totalVioletResets: {"name": "Total violet resets", "value": 0, "type": "number", "visible": false},
    totalPinkResets: {"name": "Total pink resets", "value": 0, "type": "number", "visible": false},
    curCyanSigils: {"name": "Cur cyan sigils", "value": 0, "type": "number", "visible": true},
    curBlueSigils: {"name": "Cur blue sigils", "value": 0, "type": "number", "visible": true},
    curIndigoSigils: {"name": "Cur indigo sigils", "value": 0, "type": "number", "visible": true},
    curVioletSigils: {"name": "Cur violet sigils", "value": 0, "type": "number", "visible": true},
    curPinkSigils: {"name": "Cur pink sigils", "value": 0, "type": "number", "visible": true},
    maxCyanSigils: {"name": "Max cyan sigils", "value": 0, "type": "number", "visible": false},
    maxBlueSigils: {"name": "Max blue sigils", "value": 0, "type": "number", "visible": false},
    maxIndigoSigils: {"name": "Max indigo sigils", "value": 0, "type": "number", "visible": false},
    maxVioletSigils: {"name": "Max violet sigils", "value": 0, "type": "number", "visible": false},
    maxPinkSigils: {"name": "Max pink sigils", "value": 0, "type": "number", "visible": false},
    spendSigilsCooldown: {"name": "Spend sigils cooldown", "value": 0, "type": "number"},
    spendSigilsTime: {"name": "Spend sigils time", "value": 0, "type": "number"},
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
    return document.getElementById("ach3x4").classList.contains("achievementUnlocked");
}

function gets_automatic_challenge_rating() {
    return get_current_blue_sigils() >= 5;
}

function is_sigil_available(sigil) {
    return document.getElementById(`tab_${sigil}Sigils`).style.display !== "none";
}

function get_sigil_count(sigil) {
    return parseNumber(document.getElementById(`${sigil}Sigils`).innerText);
}

function get_available_sigils() {
    // for each sigil in sigils, check if sigil is available, start with last sigil
    let available_sigils = [];
    for (let i = sigils.length - 1; i >= 0; i--) {
        if (is_sigil_available(sigils[i])) {
            available_sigils.push(sigils[i]);
        }
    }

    return available_sigils
}


function gets_automatic_sigils() {
    const achiev = document.getElementById("ach13x0");
    if (achiev === null) return false;
    return document.getElementById("ach13x0").classList.contains("achievementUnlocked");
}

function gets_automatic_max_tomes() {
    const achiev = document.getElementById("ach14x1");
    if (achiev === null) return false;
    return document.getElementById("ach14x1").classList.contains("achievementUnlocked");
}

function gets_automatic_knowledge() {
    const achiev = document.getElementById("ach15x0");
    if (achiev === null) return false;
    return document.getElementById("ach15x0").classList.contains("achievementUnlocked");
}

function gets_automatic_knowledge_upgrades() {
    const achiev = document.getElementById("ach11x7");
    if (achiev === null) return false;
    return document.getElementById("ach11x7").classList.contains("achievementUnlocked");
}

function get_dragon_pet_requirement() {
    const dragonPetStuff = document.getElementById("dragonPetStuff");
    if (dragonPetStuff === null) return null;
    if (dragonPetStuff.style.display === "none") return null;
    if (dragonPetStuff.innerText.includes("You have petted your dragon sufficiently.")) return null;
    return document.getElementById("dragonPetRequirement").innerText
}

function get_new_sigil_after(sigil) {
    if (sigil === "violet") return 5000;
    return 50;
}

let currentSigilRotation = 0

function sigil_to_reset() {
    if (gets_automatic_sigils()) return "disabled"
    const available_sigils = get_available_sigils();
    // don't reset yet
    if (available_sigils.length === 0) return;
    if (statistics.timeSinceLastReset.value < settings.reset_cooldown.value) return;

    // sigil to reset
    if (available_sigils.length === 1) return available_sigils[0];
    if (get_sigil_count("pink") > 0) return available_sigils[currentSigilRotation % available_sigils.length];

    const dragon_pet_requirement = get_dragon_pet_requirement();
    if (!!dragon_pet_requirement && available_sigils[0] !== dragon_pet_requirement) return dragon_pet_requirement;

    const should_push_sigil = get_new_sigil_after(available_sigils[1]) < get_sigil_count(available_sigils[1])
    if (should_push_sigil) return available_sigils[0];
    const nextSigilIndex = currentSigilRotation % available_sigils.length;
    if (nextSigilIndex === 0) currentSigilRotation++;
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

function farm_plutonium() {
    if (document.getElementById("plutoniumConvertButton").disabled) return;
    document.getElementById("plutoniumConvertButton").click();
}

const plutonium_upgrade_order = [2, 1, 0, 3, 4]

function buy_plutonium_upgrades() {
    // plutoniumUpgrade
    const buttons = document.getElementsByClassName("plutoniumUpgrade");
    for (let i = 0; i < plutonium_upgrade_order.length; i++) {
        if (!buttons[plutonium_upgrade_order[i]].disabled) {
            buttons[plutonium_upgrade_order[i]].click();
            return;
        }
    }
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
    if (!disable_uranium_farm && uranium_to_get() > get_uranium_per_second() * 2) {
        document.getElementById("uraniumConvertButton").click();
    }
}

function farm_tomes() {
    document.getElementById("tomeCost").parentElement.click();
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

    if (!buttons[0].disabled) {
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
    if (!buttons[3].disabled && get_current_pink_sigil_power() > 10000000) {
        // Focus on the 4th indigo sigil upgrade
        buttons[3].click()
        return;
    }

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].click();
    }
}

function get_current_knowledge() {
    return parseNumber(document.getElementById("knowledge").innerText);
}

function spent_knowledge() {
    if (settings.disable_knowledge_upgrades.value) return;
    if (!gets_automatic_max_tomes()) farm_tomes()
    if (!gets_automatic_knowledge_upgrades()) buy_knowledge_upgrades()
}

function buy_knowledge_upgrades() {
    const buttons = document.getElementsByClassName("knowledgeUpgrade");

    const cur_knowledge = get_current_knowledge();
    if (!buttons[2].disabled && cur_knowledge.length === 1 && cur_knowledge[0] > 50000) {
        buttons[2].click()
        return;
    }

    for (let i = 0; i < buttons.length; i++) {
        if (i === 2) continue;
        const cost = parseNumber(document.getElementById(`knowledgeUpgrade${i + 1}Cost`).innerText);
        const knowledge_divider = 10 ** settings.spend_knowledge_divider_exponent.value;
        const max_spent_knowledge = get_current_knowledge() / knowledge_divider
        if (cost < max_spent_knowledge) buttons[i].click();

    }
}

function buy_tomes_upgrades() {
    const buttons = document.getElementsByClassName("tomeUpgrade");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].click();
    }
}

function buy_blue_fire_upgrades() {
    const buttons = document.getElementsByClassName("blueFireUpgrade");
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
    const reset_this_sigil = statistics.sigilNextReset.value === "cyan"
    const reset_sigils_after = settings.reset_sigils_after.value
    if (!reset_this_sigil || reset_sigils_after === 0) return;

    const sigils_to_get = parseInt(document.getElementById("cyanSigilsToGet").innerText);
    if (sigils_to_get >= reset_sigils_after) {
        document.getElementById("cyanSigilsToGet").parentElement.click();
        post_reset()
        statistics.totalCyanResets.value += 1;
        statistics.sigilLastReset.value = "cyan";
    }
}

function reset_progress_for_blue_sigils() {
    const reset_this_sigil = statistics.sigilNextReset.value === "blue"
    const reset_sigils_after = settings.reset_sigils_after.value
    if (!reset_this_sigil || reset_sigils_after === 0) return;

    const sigils_to_get = parseInt(document.getElementById("blueSigilsToGet").innerText);
    if (sigils_to_get >= reset_sigils_after) {
        document.getElementById("blueSigilsToGet").parentElement.click();
        post_reset()
        statistics.totalBlueResets.value += 1;
        statistics.sigilLastReset.value = "blue";
    }
}

function reset_progress_for_indigo_sigils() {
    const reset_this_sigil = statistics.sigilNextReset.value === "indigo"
    const reset_sigils_after = settings.reset_sigils_after.value
    if (!reset_this_sigil || reset_sigils_after === 0) return;

    const sigils_to_get = parseInt(document.getElementById("indigoSigilsToGet").innerText);
    if (sigils_to_get >= reset_sigils_after) {
        document.getElementById("indigoSigilsToGet").parentElement.click();
        post_reset()
        statistics.totalIndigoResets.value += 1;
        statistics.sigilLastReset.value = "indigo";
    }
}

function reset_progress_for_violet_sigils() {
    const reset_this_sigil = statistics.sigilNextReset.value === "violet"
    const reset_sigils_after = settings.reset_sigils_after.value
    if (!reset_this_sigil || reset_sigils_after === 0) return;

    const sigils_to_get = parseInt(document.getElementById("violetSigilsToGet").innerText);
    if (sigils_to_get >= reset_sigils_after) {
        document.getElementById("violetSigilsToGet").parentElement.click();
        post_reset()
        statistics.totalVioletResets.value += 1;
        statistics.sigilLastReset.value = "violet";
    }
}

function reset_progress_for_pink_sigils() {
    const reset_this_sigil = statistics.sigilNextReset.value === "pink"
    const reset_sigils_after = settings.reset_sigils_after.value
    if (!reset_this_sigil || reset_sigils_after === 0) return;

    const sigils_to_get = parseInt(document.getElementById("pinkSigilsToGet").innerText);
    if (sigils_to_get >= reset_sigils_after) {
        document.getElementById("pinkSigilsToGet").parentElement.click();
        post_reset()
        statistics.totalPinkResets.value += 1;
        statistics.sigilLastReset.value = "pink";
    }
}

function buy_dragon_feed() {
    const dragon_feed_requirement = get_dragon_pet_requirement()
    if (dragon_feed_requirement === null) return;
    const cur_sigils = get_sigil_count(dragon_feed_requirement)
    if (cur_sigils < 500) return;
    document.getElementById("dragonFeedButton").click();
}

function pet_dragon() {
    const dragon_pet_button = document.getElementById("dragonPetButton")
    if (dragon_pet_button.disabled) return;
    document.getElementById("dragonPetButton").click();
}


function buy_sigil_upgrades() {
    buy_cyan_sigil_upgrades();
    buy_blue_sigil_upgrades();
    buy_indigo_sigil_upgrades();
    buy_violet_sigil_upgrades();
    buy_pink_sigil_upgrades();
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
    unlock_more_dark_magic_upgrade()
    unlock_blood()
    buy_miners()
    buy_dragon_feed();
    pet_dragon()
    buy_fire_upgrades();
    buy_platinum_upgrades();
    farm_uranium()
    buy_uranium_upgrades();
    buy_magic_upgrades();
    buy_dark_magic_upgrades();
    buy_sigil_upgrades()
    spent_knowledge()
    buy_knowledge_trade();
    buy_tomes_upgrades()
    buy_blue_fire_upgrades();
    reset_progress_for_magic();
    reset_progress_for_cyan_sigils();
    reset_progress_for_blue_sigils()
    reset_progress_for_indigo_sigils()
    reset_progress_for_violet_sigils()
    reset_progress_for_pink_sigils()
    farm_plutonium()
    buy_plutonium_upgrades()
}

let EASY_CHALLENGE_COMBOS = [
    [0], [0, 1], [0, 1, 3], [0, 1, 2, 3]
]

let HARD_CHALLENGE_COMBOS = [
    [3], [2, 3], [0, 2, 3], [0, 1, 2, 3]
]

let challenge_cool_down = [0, 0, 0, 0];

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
    str = str.replaceAll(",", "")
    return parseFloat(str);
}

function parseExponent(str) {
    str = str.replaceAll(",", "").replaceAll(".", "")
    const split = str.split("e")
    return split.map((x) => parseFloat(x) || 1)
}

function compareExponent(a, b) {
    if (a.length === b.length) {
        // verify for each number that the exponent is the same
        for (let i = a.length - 1; i >= 0; i--) {
            if (a[i] !== b[i]) return a[i] - b[i]
        }
    }

    return a.length - b.length
}

function get_current_gold() {
    return document.getElementById("gold").innerText
}

function get_current_magic() {
    return parseNumber(document.getElementById("magic").innerText)
}

function get_current_tomes() {
    return parseNumber(document.getElementById("tomes").innerText);
}

const get_current_cyan_sigils = () => parseNumber(document.getElementById("cyanSigils").innerText)
const get_current_blue_sigils = () => parseNumber(document.getElementById("blueSigils").innerText)
const get_current_indigo_sigils = () => parseNumber(document.getElementById("indigoSigils").innerText)
const get_current_violet_sigils = () => parseNumber(document.getElementById("violetSigils").innerText)
const get_current_pink_sigils = () => parseNumber(document.getElementById("pinkSigils").innerText)
const get_current_cyan_sigil_power = () => parseNumber(document.getElementById("cyanSigilPower").innerText)
const get_current_blue_sigil_power = () => parseNumber(document.getElementById("blueSigilPower").innerText)
const get_current_indigo_sigil_power = () => parseNumber(document.getElementById("indigoSigilPower").innerText)
const get_current_violet_sigil_power = () => parseNumber(document.getElementById("violetSigilPower").innerText)
const get_current_pink_sigil_power = () => parseNumber(document.getElementById("pinkSigilPower").innerText)
const get_gold_per_second = () => parseNumber(document.getElementById("goldPerSecond").innerText)


function reset_trade_level() {
    const knowledge_level_input = document.getElementById("knowledgeLevelInput");
    const reset_knowledge_level = knowledge_level_input.parentElement.nextElementSibling.nextElementSibling.children[0]
    reset_knowledge_level.click()
}

function get_knowledge_cost(level, sigil) {
    set_trade_level(level)
    const sigilIndex = sigils.indexOf(sigil)
    const knowledge_trade_cost_ranges = document.getElementsByClassName("knowledgeTradeCostRange");
    const knowledge_trade_cost_range = knowledge_trade_cost_ranges[sigilIndex].innerText.split(" - ");
    return parseNumber(knowledge_trade_cost_range[1])
}

let chooseTradeLevelAt;

function choose_trade_level() {
    if (Date.now() < chooseTradeLevelAt) return;
    chooseTradeLevelAt = Date.now() + 10000;
    // get max of knowledgeLevelInput
    const knowledge_level_input = document.getElementById("knowledgeLevelInput");
    const max_level = knowledge_level_input.max;
    const min_level = knowledge_level_input.min;
    const spend_sigils_divider = 10 ** settings.spend_sigis_divider_exponent.value
    const max_cyan_sigils_to_spent = get_current_cyan_sigils() / spend_sigils_divider
    const max_blue_sigils_to_spent = get_current_blue_sigils() / spend_sigils_divider
    const max_indigo_sigils_to_spent = get_current_indigo_sigils() / spend_sigils_divider
    const max_violet_sigils_to_spent = get_current_violet_sigils() / spend_sigils_divider
    const max_pink_sigils_to_spent = get_current_pink_sigils() / spend_sigils_divider

    for (let i = max_level; i >= min_level; i--) {
        set_trade_level(i)
        // if exponent is /100 of the max exponent, then we can buy it
        const should_choose_level = get_knowledge_cost(i, "cyan") <= max_cyan_sigils_to_spent
            && get_knowledge_cost(i, "blue") <= max_blue_sigils_to_spent
            && get_knowledge_cost(i, "indigo") <= max_indigo_sigils_to_spent
            && get_knowledge_cost(i, "violet") <= max_violet_sigils_to_spent
            && get_knowledge_cost(i, "pink") <= max_pink_sigils_to_spent

        if (should_choose_level) {
            return;
        }
    }
}

function set_trade_level(level) {
    const knowledge_level_input = document.getElementById("knowledgeLevelInput");
    const knowledge_level_range = document.getElementById("knowledgeLevelRange");
    knowledge_level_input.value = level
    knowledge_level_range.value = level
    knowledge_level_input.dispatchEvent(new Event('input', {bubbles: true}));
    knowledge_level_range.dispatchEvent(new Event('input', {bubbles: true}));

}

function buy_knowledge_trade() {
    if (gets_automatic_knowledge()) return;
    const knowledge_trades = document.getElementsByClassName("knowledgeTradeDiv");
    for (let i = knowledge_trades.length - 1; i >= 0; i--) {
        const knowledge_trade = knowledge_trades[i];
        // const before_trade = knowledge_trade.innerHTML
        // if(can_spend_sigils()) {
        choose_trade_level()
        knowledge_trade.getElementsByTagName("button")[0].click();
        // const after_trade = knowledge_trade.innerHTML
        // if(before_trade !== after_trade) {
        //     increment_trade_level()
        // }
        // }
    }
}

let canSpendSigilsAt = Date.now()
let canSpendSigilsUntil = Date.now() + settings.spend_sigils_time.value * 1000;

function can_spend_sigils() {
    if (Date.now() > canSpendSigilsUntil) {
        canSpendSigilsAt = Date.now() + settings.spend_sigils_cooldown.value * 1000;
        canSpendSigilsUntil = Date.now() + settings.spend_sigils_cooldown.value * 1000 + settings.spend_sigils_time.value * 1000;
    }

    return Date.now() > canSpendSigilsAt && Date.now() < canSpendSigilsUntil;
}

let lastCurrentKnowledge = 0;

const mine_gold_button = get_mine_gold_button()

function mine_gold() {
    const mine_gold = settings.mine_gold_clicks.value
    for (let i = 0; i < mine_gold; i++) {
        mine_gold_button.click();
    }
}

async function mine_starting_gold() {
    while (get_gold_per_second() < 20) {
        mine_gold_button.click();
        buy_miners()
        await delay(ITERATION_SPEED_MS)
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
    const alchemy_upgrade = document.getElementById("unlockAlchemyButton");
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
    if (has_more_platinum_and_uranium_upgrades()) return;
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

function has_more_dark_magic_upgrade() {
    const more_dark_magic_upgrade = document.getElementById("moreDarkMagicUpgradesButton");
    return more_dark_magic_upgrade.style.display === "none";
}

function unlock_more_dark_magic_upgrade() {
    if (has_more_dark_magic_upgrade()) return;
    document.getElementById("moreDarkMagicUpgradesButton").click();
}

function has_blood_upgrade() {
    const blood_upgrade = document.getElementById("unlockBloodButton");
    return blood_upgrade.style.display === "none";
}

function unlock_blood() {
    if (has_blood_upgrade()) return;
    document.getElementById("unlockBloodButton").click();
}

function selectHellLayer(level) {
    // select nth option in #hellLayer
    const hell_layer = document.getElementById("hellLayer");
    hell_layer.selectedIndex = level;
    hell_layer.dispatchEvent(new Event('change'));
}


function enterHell(level) {
    selectHellLayer(level)
    const enterHellButton = document.getElementById("enterHellButton");
    if (enterHellButton.innerText === "Exit hell") return;
    enterHellButton.click();
    post_reset()
}

function exitHell() {
    const enterHellButton = document.getElementById("enterHellButton");
    if (enterHellButton.innerText === "Enter hell") return;
    enterHellButton.click();
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

    if (challenge_cool_down[n] > 0) {
        challenge_cool_down[n] -= 1;
        return;
    }

    const score_before = get_score(n);
    const challenge_combo = get_dragon_stage_counter() === "V" ? HARD_CHALLENGE_COMBOS[n] : EASY_CHALLENGE_COMBOS[n];
    enable_challenge_combo(challenge_combo)
    start_challenge()
    await idle_loop(time_in_challenges)
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
    const time_in_challenges = settings.time_in_challenge.value
    if (!unlocked_challenges() || time_in_challenges === 0 || gets_automatic_challenge_rating()) return;
    for (let i = 0; i < 5; i++) {
        if (get_current_cyan_sigils() < 1) {
            const dragon_cd = get_dragon_cooldown()
            await idle_loop(dragon_cd)
        }

        for (let i = 0; i < HARD_CHALLENGE_COMBOS.length; i++) {
            await do_challenge(i);
        }

        await idle_loop(3)
    }
}

async function idle_loop(seconds) {
    const loopCount = (seconds * 1000) / ITERATION_SPEED_MS;
    for (let i = 0; i < loopCount; i++) {
        buy_upgrades()
        if (i * ITERATION_SPEED_MS % 1000 === 0) {
            mine_gold()
        }
        await delay(ITERATION_SPEED_MS);
    }
}

function can_buy_max_sigil_upgrades() {
    const sigilResetAutomation = document.getElementById("sigilResetAutomation");
    if (sigilResetAutomation === null) return false;
    const button = sigilResetAutomation.nextElementSibling
    if (button === null || button.disabled || button.style.display === "none") return false;
    return true;
}

function buy_max_sigil_upgrades() {
    const sigilResetAutomation = document.getElementById("sigilResetAutomation");
    if (sigilResetAutomation === null || sigilResetAutomation.style.display === "none") return;
    const button = sigilResetAutomation.nextElementSibling
    if (button === null || button.disabled) return;
    button.click()

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

function update_statistics(x) {
    // update seconds since last reset
    statistics.timeSinceLastReset.value = Math.floor((Date.now() - statistics.lastResetTime.value) / 1000)

    const curGold = get_current_gold()
    statistics.curGold.value = curGold
    const maxGold = statistics.maxGold.value
    if (compareExponent(parseExponent(curGold), parseExponent(maxGold)) > 0) {
        statistics.maxGold.value = curGold
    }

    statistics.curCyanSigils.value = get_current_cyan_sigils()
    statistics.curBlueSigils.value = get_current_blue_sigils()
    statistics.curVioletSigils.value = get_current_violet_sigils()
    statistics.curPinkSigils.value = get_current_pink_sigils()
    statistics.curIndigoSigils.value = get_current_indigo_sigils()
    statistics.maxBlueSigils.value = Math.max(statistics.maxBlueSigils.value, statistics.curBlueSigils.value)
    statistics.maxCyanSigils.value = Math.max(statistics.maxCyanSigils.value, statistics.curCyanSigils.value)
    statistics.maxVioletSigils.value = Math.max(statistics.maxVioletSigils.value, statistics.curVioletSigils.value)
    statistics.maxPinkSigils.value = Math.max(statistics.maxPinkSigils.value, statistics.curPinkSigils.value)
    statistics.maxIndigoSigils.value = Math.max(statistics.maxIndigoSigils.value, statistics.curIndigoSigils.value)
    statistics.sigilNextReset.value = sigil_to_reset()
    statistics.spendSigilsCooldown.value = Math.max(0, Math.round((canSpendSigilsAt - Date.now()) / 1000))
    if (statistics.spendSigilsCooldown.value === 0) {
        statistics.spendSigilsTime.value = Math.max(0, Math.round((canSpendSigilsUntil - Date.now()) / 1000))
    } else {
        statistics.spendSigilsTime.value = 0
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

function unlocked_blood() {
    return document.getElementById('tab_blood').style.display !== 'none'
}

function get_hell_levels() {
    let hellLayer = document.getElementById("hellLayer")
    return hellLayer.children
}

function get_blood_per_seconds() {
    return parseNumber(document.getElementById('bloodPerSecond').innerText)
}

function get_current_blood() {
    return parseNumber(document.getElementById('blood').innerText)
}

async function optimize_blood_level() {
    let maxBloodPerSec = 0
    let bestBloodLevel = 0
    for (let i = get_hell_levels().length - 1; i >= 0; i--) {
        enterHell(i)
        await idle_loop(3)
        if (get_blood_per_seconds() > maxBloodPerSec) {
            maxBloodPerSec = get_blood_per_seconds()
            bestBloodLevel = i
        }
        exitHell()
    }

    // 10 minutes of farming
    if (get_current_blood() > 600 * maxBloodPerSec) return -1;

    return bestBloodLevel;
}

async function farm_blood() {
    if (!unlocked_blood()) return;
    if (settings.disable_hell.value) return;
    const bestBloodLevel = await optimize_blood_level();
    if (bestBloodLevel === -1) {
        // don't farm
        exitHell()
        await idle_loop(60);
        return;
    }

    for (let i = 0; i < 10; i++) {
        enterHell(bestBloodLevel)
        await idle_loop(6);
        exitHell()
        await idle_loop(6);
    }
}

async function game_loop() {
    while (settings.enabled.value) {
        await mine_starting_gold()
        await do_challenges() // do 5 challenge loops, 75 seconds in total
        await farm_blood() // 30 seconds + 3 seconds for each level attempted
        await idle_loop(5)
        spend_time_with_dragon()
    }
}

// start the game loop
create_settings_window()
create_statistics_window()
await game_loop();

