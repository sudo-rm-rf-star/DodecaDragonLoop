window.confirm = function () {
    return true;
};

const settingsKey = "dodeca_settings";
const statisticsKey = "dodeca_statistics";
const sigils = ["cyan", "blue", "indigo", "violet", "pink", "red", "orange", "yellow"];
const cyan_to_pink_sigils = ["cyan", "blue", "indigo", "violet", "pink"];
const ITERATION_SPEED_MS = 100;

let settings = {
    // setting to reset after X sigils, 0 to disable
    enabled: {"name": "Enabled", "value": true, "type": "boolean"},
    mine_gold_clicks: {"name": "Mine gold clicks/sec", "value": 1, "type": "number"},
    buy_miners: {"name": "Buy miners", "value": true, "type": "boolean"},
    time_in_challenge: {"name": "Seconds per challenge", "value": 3, "type": "number"},
    reset_cooldown: {"name": "Reset cooldown", "value": 3, "type": "number"},
    reset_magic_after: {"name": "Reset magic after", "value": 0, "type": "number"},
    resetAfter: {"name": "Reset sigils after", "value": 1, "type": "number"},
    spend_sigis_divider_exponent: {"name": "Spend sigils divider exponent", "value": 2, "type": "number"},
    spend_knowledge_divider_exponent: {"name": "Spend knowledge divider exponent", "value": 2, "type": "number"},
    disable_hell: {"name": "Disable hell", "value": false, "type": "boolean"},
    disable_reset: {"name": "Disable reset", "value": false, "type": "boolean"},

}

let statistics = {
    curGold: {"name": "Cur gold", "value": "0", "type": "string"},
    maxGold: {"name": "Max gold", "value": "0", "type": "string"},
    lastResetTime: {"name": "Last reset time", "value": new Date().getTime(), "type": "number", "visible": false},
    timeSinceLastReset: {"name": "Seconds since last reset", "value": 0, "type": "number"},
    timeForLastReset: {"name": "Seconds for last reset", "value": 0, "type": "number"},
    lastReset: {"name": "Sigil last reset", "value": "none", "type": "string"},
    nextReset: {"name": "Sigil next reset", "value": "none", "type": "string"},
    totalMagicResets: {"name": "Total magic resets", "value": 0, "type": "number", "visible": false},
    curCyanSigils: {"name": "Cur cyan sigils", "value": 0, "type": "number", "visible": true},
    curBlueSigils: {"name": "Cur blue sigils", "value": 0, "type": "number", "visible": true},
    curIndigoSigils: {"name": "Cur indigo sigils", "value": 0, "type": "number", "visible": true},
    curVioletSigils: {"name": "Cur violet sigils", "value": 0, "type": "number", "visible": true},
    curPinkSigils: {"name": "Cur pink sigils", "value": 0, "type": "number", "visible": true},
    curRedSigils: {"name": "Cur red sigils", "value": 0, "type": "number", "visible": true},
    curOrangeSigils: {"name": "Cur orange sigils", "value": 0, "type": "number", "visible": true},
    curYellowSigils: {"name": "Cur yellow sigils", "value": 0, "type": "number", "visible": true},
    maxCyanSigils: {"name": "Max cyan sigils", "value": 0, "type": "number", "visible": false},
    maxBlueSigils: {"name": "Max blue sigils", "value": 0, "type": "number", "visible": false},
    maxIndigoSigils: {"name": "Max indigo sigils", "value": 0, "type": "number", "visible": false},
    maxVioletSigils: {"name": "Max violet sigils", "value": 0, "type": "number", "visible": false},
    maxPinkSigils: {"name": "Max pink sigils", "value": 0, "type": "number", "visible": false},
    maxRedSigils: {"name": "Max red sigils", "value": 0, "type": "number", "visible": false},
    maxOrangeSigils: {"name": "Max orange sigils", "value": 0, "type": "number", "visible": false},
    maxYellowSigils: {"name": "Max yellow sigils", "value": 0, "type": "number", "visible": false},
    optimizedHellLevel: {"name": "Optimized hell level", "value": 0, "type": "number", "visible": false},
    optimizedHellLevelAt: {"name": "Optimized hell level at", "value": 0, "type": "number", "visible": false},
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


function is_sigil_available(sigil) {
    return document.getElementById(`tab_${sigil}Sigils`).style.display !== "none"
}

function get_sigil_count(sigil) {
    return parseNumber(document.getElementById(`${sigil}Sigils`).innerText);
}

function get_sigil_power(sigil) {
    return parseNumber(document.getElementById(`${sigil}SigilPower`).innerText);
}

function available_sigils_to_reset() {
    // for each sigil in sigils, check if sigil is available, start with last sigil
    let available_sigils = [];
    for (let i = sigils.length - 1; i >= 0; i--) {
        // don't reset cyan to pink sigils if automatic sigils is enabled
        if (gets_automatic_sigils() && cyan_to_pink_sigils.includes(sigils[i])) continue;
        if (is_sigil_available(sigils[i])) {
            available_sigils.push(sigils[i]);
        }
    }

    return available_sigils
}

function has_achievement(id) {
    const achievement = document.getElementById(id);
    return achievement !== null && achievement.classList.contains("achievementUnlocked");
}

const gets_automatic_sigils = () => has_achievement("ach13x0");
const gets_automatic_uranium = () => has_achievement("ach5x3");
const gets_automatic_max_tomes = () => has_achievement("ach14x1");
const gets_automatic_knowledge = () => has_achievement("ach15x0");
const gets_automatic_knowledge_upgrades = () => has_achievement("ach11x7");
const has_automatic_max_all_blue_fire = () => has_achievement("ach13x4");
const gets_automatic_magic = () => has_achievement("ach3x4");
const gets_automatic_challenge_rating = () => has_achievement("ach7x1");
const gets_automatic_plutonium = () => has_achievement("ach15x3");

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
// 5 seconds every 60 seconds
let dontResetForBlueFireAt = Date.now() + 5000
let dontResetForBlueFireUntil = Date.now()  + 10000

function itemToReset() {
    const available_sigils = available_sigils_to_reset();

    // don't reset yet
    if (available_sigils.length === 0) return;
    if (statistics.timeSinceLastReset.value < settings.reset_cooldown.value) return;

    const unlocked_red = available_sigils.includes("red")
    if (unlocked_red) {
        if (Date.now() > dontResetForBlueFireAt && Date.now() < dontResetForBlueFireUntil) return;
        if (Date.now() > dontResetForBlueFireUntil) {
            dontResetForBlueFireAt = Date.now() + 60000
            dontResetForBlueFireUntil = Date.now() + 65000
        }
    }

    if(choose_tetrahedron()) return "holyTetrahedrons"
    return choose_sigil(available_sigils) + "Sigils";
}

function unlocked_holyTetrahedrons() {
    return document.getElementById("tab_holyTetrahedrons").style.display !== "none";
}

function choose_tetrahedron() {
    if(!unlocked_holyTetrahedrons()) return false

    const cur_gold = parseExponent(get_current_gold())
    if(cur_gold.length < 3) return false

    if(cur_gold[2] > 30) return true
}

function choose_sigil(available_sigils) {
    const unlocked_red = available_sigils.includes("red")
    if (gets_automatic_sigils() && !unlocked_red) return;
    if (available_sigils.length === 1) return available_sigils[0];
    if (get_sigil_count("pink") > 0 && !unlocked_red) return available_sigils[currentSigilRotation % available_sigils.length];
    if (get_sigil_power("yellow") > 4000) return available_sigils[currentSigilRotation % available_sigils.length];

    const dragon_pet_requirement = get_dragon_pet_requirement();
    if (!!dragon_pet_requirement && available_sigils[0] !== dragon_pet_requirement) return dragon_pet_requirement;

    // if there's an avaible sigil that is 0, push it or push the sigil before it
    const firstSigilWith0Count = sigils.find(sigil => get_sigil_count(sigil) === 0)
    const sigilBeforeFirstSigilWith0Count = sigils[sigils.indexOf(firstSigilWith0Count) - 1]
    const should_push_sigil = get_new_sigil_after(sigilBeforeFirstSigilWith0Count) < get_sigil_count(sigilBeforeFirstSigilWith0Count)
    if (should_push_sigil) return firstSigilWith0Count;
    if (!!firstSigilWith0Count) return sigilBeforeFirstSigilWith0Count

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
    if(gets_automatic_plutonium()) return
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

// holyTetrahedronUpgrade
function buy_holy_tetrahedron_upgrades() {
    const buttons = document.getElementsByClassName("holyTetrahedronUpgrade");
    for (let i = 0; i < buttons.length; i++) {
        if (!buttons[i].disabled) {
            buttons[i].click();
            return;
        }
    }
}

function farm_uranium() {
    if (gets_automatic_uranium()) return
    document.getElementById("uraniumConvertButton").click();
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

function get_current_knowledge() {
    return parseNumber(document.getElementById("knowledge").innerText);
}

function spent_knowledge() {
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
    if (has_automatic_max_all_blue_fire()) return;
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



function resetProgress() {
    const resetItem = statistics.nextReset.value
    const resetAfter = settings.resetAfter.value
    const disableReset = settings.disable_reset.value
    if(resetAfter === 0 || disableReset) return;


    const toGetElement = document.getElementById(resetItem + "ToGet")
    if(toGetElement === null) return;
    const itemCount = parseNumber(toGetElement.innerText);
    if (itemCount >= resetAfter) {
        toGetElement.parentElement.click();
        post_reset()
        statistics.lastReset.value = resetItem;
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
    for(let i = 0; i < sigils.length; i++) {
        const sigil = sigils[i]
        const buttons = document.getElementsByClassName(sigil + "SigilUpgrade");
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].click();
        }
    }

    buy_max_sigil_upgrades()
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
    resetProgress()
    farm_plutonium()
    buy_plutonium_upgrades()
    buy_holy_tetrahedron_upgrades()
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

const get_gold_per_second = () => parseNumber(document.getElementById("goldPerSecond").innerText)

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

    for (let i = max_level; i >= min_level; i--) {
        set_trade_level(i)
        let should_choose_level = true
        for (let j = 0; j < cyan_to_pink_sigils.length; j++) {
            const sigil = cyan_to_pink_sigils[j]
            if (get_knowledge_cost(i, sigil) > get_sigil_count(sigil) / spend_sigils_divider) {
                should_choose_level = false;
                break;
            }
        }
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
        choose_trade_level()
        knowledge_trade.getElementsByTagName("button")[0].click();
    }
}

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
        if (get_sigil_count("cyan") < 1) {
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

function capitalize(string) {
    return string[0].toUpperCase() + string.slice(1);
}

function buy_max_sigil_upgrades() {
    const sigilResetAutomation = document.getElementById("sigilResetAutomation");
    if (sigilResetAutomation === null || sigilResetAutomation.style.display === "none") return;
    const button = sigilResetAutomation.nextElementSibling
    if (button === null || button.disabled) return;
    button.click()

    // for all colors in sigils
    for (let i = 0; i < sigils.length; i++) {
        let sigil = sigils[i];
        const maxUpgrades = document.getElementById(`max${capitalize(sigil)}SigilUpgradesButton`);
        if (maxUpgrades !== null && !maxUpgrades.disabled) {
            maxUpgrades.click()
        }
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

    statistics.curCyanSigils.value = get_sigil_count("cyan")
    statistics.curBlueSigils.value = get_sigil_count("blue")
    statistics.curVioletSigils.value = get_sigil_count("violet")
    statistics.curPinkSigils.value = get_sigil_count("pink")
    statistics.curIndigoSigils.value = get_sigil_count("indigo")
    statistics.curRedSigils.value = get_sigil_count("red")
    statistics.curOrangeSigils.value = get_sigil_count("orange")
    statistics.curYellowSigils.value = get_sigil_count("yellow")
    statistics.maxBlueSigils.value = Math.max(statistics.maxBlueSigils.value, statistics.curBlueSigils.value)
    statistics.maxCyanSigils.value = Math.max(statistics.maxCyanSigils.value, statistics.curCyanSigils.value)
    statistics.maxVioletSigils.value = Math.max(statistics.maxVioletSigils.value, statistics.curVioletSigils.value)
    statistics.maxPinkSigils.value = Math.max(statistics.maxPinkSigils.value, statistics.curPinkSigils.value)
    statistics.maxIndigoSigils.value = Math.max(statistics.maxIndigoSigils.value, statistics.curIndigoSigils.value)
    statistics.maxRedSigils.value = Math.max(statistics.maxRedSigils.value, statistics.curRedSigils.value)
    statistics.maxOrangeSigils.value = Math.max(statistics.maxOrangeSigils.value, statistics.curOrangeSigils.value)
    statistics.maxYellowSigils.value = Math.max(statistics.maxYellowSigils.value, statistics.curYellowSigils.value)
    statistics.nextReset.value = itemToReset()

    // update value of each stat
    for (const stat in statistics) {
        // if value is null, hide the stat
        let statElement = document.getElementById(stat)
        if (statistics[stat].value === 0 || statistics[stat].value === Infinity) {
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

const optimizeHellCooldown = 1000 * 60;
async function optimize_blood_level() {
    if (statistics.optimizedHellLevelAt.value + optimizeHellCooldown > Date.now()) return statistics.optimizedHellLevel.value
    let maxBloodPerSec = 0
    let bestBloodLevel = 0
    const hellLevels = get_hell_levels()
    const maxLevel = hellLevels.length - 1
    const minLevel = hellLevels.length === 5 ? 3 : 0
    for (let i = maxLevel; i >= minLevel; i--) {
        enterHell(i)
        await idle_loop(2)
        if (get_blood_per_seconds() > maxBloodPerSec) {
            maxBloodPerSec = get_blood_per_seconds()
            bestBloodLevel = i
        }
        exitHell()
    }

    // don't go into hell
    if (get_current_blood() > 600 * maxBloodPerSec || maxBloodPerSec) bestBloodLevel = -1
    statistics.optimizedHellLevel.value = bestBloodLevel
    statistics.optimizedHellLevelAt.value = Date.now()

    return bestBloodLevel;
}

async function farm_blood() {
    if (!unlocked_blood()) return;
    if (settings.disable_hell.value) return;
    const bestBloodLevel = await optimize_blood_level();
    if (bestBloodLevel === -1) {
        // don't farm
        exitHell()
        return;
    }

    enterHell(bestBloodLevel)
    await idle_loop(10);
    exitHell()
    await idle_loop(60)
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

