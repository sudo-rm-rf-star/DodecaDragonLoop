window.confirm = function () {
    return true;
};

const settingsKey = "dodeca_settings";
const statisticsKey = "dodeca_statistics";
const sigils = ["cyan", "blue", "indigo", "violet", "pink", "red", "orange", "yellow"];
const red_to_yellow_sigils = ["red", "orange", "yellow"];
const cyan_to_pink_sigils = ["cyan", "blue", "indigo", "violet", "pink"];
const hedrons = ["Tetra", "Octa", "Dodeca"];
const ITERATION_SPEED_MS = 200;

let settings = {
    // setting to reset after X sigils, 0 to disable
    enabled: {"name": "Enabled", "value": true, "type": "boolean"},
    mine_gold_clicks: {"name": "Mine gold clicks/sec", "value": 1, "type": "number"},
    time_in_challenge: {"name": "Seconds per challenge", "value": 3, "type": "number"},
    reset_magic_cooldown: {"name": "Reset magic cooldown", "value": 1, "type": "number"},
    reset_sigils_cooldown: {"name": "Reset sigils cooldown", "value": 1, "type": "number"},
    reset_hedron_cooldown: {"name": "Reset hedron cooldown", "value": 15, "type": "number"},
    reset_magic_after: {"name": "Reset magic after", "value": 0, "type": "number"},
    resetAfter: {"name": "Reset sigils after", "value": 1, "type": "number"},
    spend_sigis_divider_exponent: {"name": "Spend sigils divider exponent", "value": 2, "type": "number"},
    spend_knowledge_divider_exponent: {"name": "Spend knowledge divider exponent", "value": 2, "type": "number"},
    disable_hell: {"name": "Disable hell", "value": false, "type": "boolean"},
    disable_reset: {"name": "Disable reset", "value": false, "type": "boolean"},
    disable_hedron_reset: {"name": "Disable hedron reset", "value": false, "type": "boolean"},

}

let statistics = {
    curGold: {"name": "Cur gold", "value": "0", "type": "string"},
    curMagic: {"name": "Cur magic", "value": "0", "type": "string"},
    maxGold: {"name": "Max gold", "value": "0", "type": "string"},
    maxMagic: {"name": "Max magic", "value": "0", "type": "string"},
    lastMagicResetTime: {
        "name": "Last magic reset time",
        "value": new Date().getTime(),
        "type": "number",
        "visible": false
    },
    lastSigilResetTime: {
        "name": "Last sigil reset time",
        "value": new Date().getTime(),
        "type": "number",
        "visible": false
    },
    lastHedronResetTime: {"name": "Last reset time", "value": new Date().getTime(), "type": "number", "visible": false},
    timeSinceLastMagicReset: {"name": "Seconds since last magic reset", "value": 0, "type": "number"},
    timeSinceLastSigilReset: {"name": "Seconds since last sigil reset", "value": 0, "type": "number", "visible": true},
    timeSinceLastHedronReset: {"name": "Seconds since last hedron reset", "value": 0, "type": "number"},
    timeForLastMagicReset: {"name": "Seconds for last magic reset", "value": 0, "type": "number"},
    timeForLastSigilReset: {"name": "Seconds for last sigil reset", "value": 0, "type": "number"},
    timeForLastHedronReset: {"name": "Seconds for last hedron reset", "value": 0, "type": "number"},
    lastReset: {"name": "Last reset", "value": "none", "type": "string"},
    nextReset: {"name": "Next reset", "value": "none", "type": "string"},
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

const dataCache = {}

function getCachedData(key, fn) {
    if (dataCache[key] === undefined || dataCache[key].time < Date.now() - 1000) {
        dataCache[key] = {
            value: fn(),
            time: Date.now()
        }
    }

    return dataCache[key].value
}

const elementsCache = {};

function getElementById(id) {
    if (elementsCache[id] === undefined) {
        elementsCache[id] = document.getElementById(id);
    }

    return elementsCache[id];
}

function getElementsByClassName(className) {
    if (elementsCache[className] === undefined) {
        elementsCache[className] = document.getElementsByClassName(className);
    }

    return elementsCache[className];
}


function is_sigil_available(sigil) {
    return getElementById(`tab_${sigil}Sigils`).style.display !== "none"
}

function is_hedron_available(hedron) {
    return getElementById(`tab_holy${hedron}hedrons`).style.display !== "none"
}

function get_sigil_count(sigil) {
    const sigilCountElement = getElementById(`${sigil}Sigils`);
    if (sigilCountElement === null) return 0;
    return parseNumber(sigilCountElement.innerText);
}

function get_sigil_power(sigil) {
    return parseNumber(getElementById(`${sigil}SigilPower`).innerText);
}

function available_sigils_to_reset() {
    let available_sigils = [];
    for (let i = 0; i < sigils.length; i++) {
        if (gets_automatic_roy_sigils() && red_to_yellow_sigils.includes(sigils[i])) continue;
        if (gets_automatic_sigils() && cyan_to_pink_sigils.includes(sigils[i])) continue;
        if (is_sigil_available(sigils[i])) {
            available_sigils.push(sigils[i]);
        }
    }

    statistics.timeSinceLastSigilReset.visible = available_sigils.length > 0;
    statistics.timeForLastSigilReset.visible = available_sigils.length > 0;
    statistics.lastSigilResetTime.visible = available_sigils.length > 0;
    return available_sigils
}

function available_hedrons_to_reset() {
    // for each sigil in sigils, check if sigil is available, start with last sigil
    let available_hedrons = [];
    for (let i = 0; i < hedrons.length; i++) {
        if (gets_automatic_hedrons()) continue;
        if (is_hedron_available(hedrons[i])) {
            available_hedrons.push(hedrons[i]);
        }
    }

    statistics.timeSinceLastHedronReset.visible = available_hedrons.length > 0;
    statistics.timeForLastHedronReset.visible = available_hedrons.length > 0;
    statistics.lastHedronResetTime.visible = available_hedrons.length > 0;
    return available_hedrons
}

let achievementList = []

function has_achievement(id) {
    let hasAchievement = achievementList.includes(id);
    if (!hasAchievement) {
        const achievement = getElementById(id);
        hasAchievement = achievement !== null && achievement.classList.contains("achievementUnlocked");
        if (hasAchievement) achievementList.push(id);
    }

    return hasAchievement
}

const gets_automatic_miners = () => has_achievement("ach0x8");
const gets_automatic_fire_upgrades = () => has_achievement("ach6x2");
const gets_automatic_sigils = () => has_achievement("ach13x0");
const gets_automatic_uranium = () => has_achievement("ach5x3");
const gets_automatic_max_tomes = () => has_achievement("ach14x1");
const gets_automatic_knowledge = () => has_achievement("ach15x0");
const gets_automatic_knowledge_upgrades = () => has_achievement("ach11x7");
const has_automatic_max_all_blue_fire = () => has_achievement("ach13x4");
const gets_automatic_magic = () => has_achievement("ach3x4");
if (gets_automatic_magic()) statistics.timeSinceLastMagicReset.visible = false;
const gets_automatic_challenge_rating = () => has_achievement("ach7x1");
const gets_automatic_plutonium = () => has_achievement("ach15x3");
const gets_automatic_sigil_upgrades = () => has_achievement("ach20x0");
const gets_automatic_roy_sigils = () => has_achievement("ach23x2");
const gets_automatic_holyfire_upgrades = () => has_achievement("ach21x7");
const gets_automatic_hedrons = () => has_achievement("ach24x0");
const gets_automatic_planets = () => has_achievement("ach24x2");
const gets_automatic_cosmic_plague_upgrades = () => has_achievement("ach24x5");
const gets_automatic_nuclear_pasta = () => has_achievement("ach24x9");
const killed_all_bosses = () => has_achievement("ach24x11");

function get_dragon_pet_requirement() {
    const dragonPetStuff = getElementById("dragonPetStuff");
    if (dragonPetStuff === null) return null;
    if (dragonPetStuff.style.display === "none") return null;
    if (dragonPetStuff.innerText.includes("You have petted your dragon sufficiently.")) return null;
    return getElementById("dragonPetRequirement").innerText
}

function get_new_sigil_after(sigil) {
    if (sigil === "violet") return 5000;
    return 50;
}

let currentHedronRotation = 0
let currentSigilRotation = 0
// 5 seconds every 60 seconds
let tryToPushGoldAt = Date.now()
let tryToPushGoldUntil = Date.now()

function shouldTryToPushGold() {
    // give breathing room to push gold
    if (Date.now() > tryToPushGoldAt && Date.now() < tryToPushGoldUntil) {
        if (inHell) {
            tryToPushGoldAt += 5000
            tryToPushGoldUntil += 5000
        } else {
            return true;
        }
    }
    if (Date.now() > tryToPushGoldUntil) {
        tryToPushGoldAt = Date.now() + 60000
        tryToPushGoldUntil = Date.now() + 70000
    }
    return false;
}

function itemToReset() {
    if (shouldTryToPushGold()) return;
    if (!!resetHedron) return `holy${resetHedron}hedrons`;


    const hedron = choose_reset_hedron();
    if (!!hedron) return `holy${hedron}hedrons`;

    const sigil = choose_reset_sigil();
    if (!pushHedrons && !!sigil) return sigil + "Sigils";

    const magic = choose_reset_magic();
    if (!!magic) return "magic";
}

let hedronUpgradeCount = {
    "Tetra": 0,
    "Octa": 0,
    "Dodeca": 0
}
let hedronNextUpgradeCost = {
    "Tetra": 1,
    "Octa": 1,
    "Dodeca": 1
}
const pushFromToGold = {
    "Tetra": [
        [29, 30],
        [29, 30], [29, 30], [29, 30],
        [29, 30], [29, 30], [29, 30],
        [29, 30], [29, 30],
        [40, 45],
        [50, 55],
        [60, 80],
        [80, 90]
    ],
    "Octa": [
        [59, 60],
        [59, 60], [59, 60],
        [59, 60], [59, 60], [59, 60],
        [59, 60],
        [60, 83],
        [80, 90]
    ],
    "Dodeca": [
        [130, 140],
        [130, 140],
        [130, 140],
        [130, 140],
        [150, 163],
        [200, 300],
    ]
}

let pushHedrons = false
let resetAt = undefined;
let resetHedron = undefined;

function choose_reset_hedron() {
    const resetAfterSec = settings.reset_hedron_cooldown.value / 2; // ms
    if (settings.disable_hedron_reset.value || settings.reset_hedron_cooldown.value - resetAfterSec > statistics.timeSinceLastHedronReset.value) {
        pushHedrons = false;
        return;
    }

    let availableHedrons = available_hedrons_to_reset()
    let rotateHedrons = (hedronUpgradeCount["Octa"] >= 7 && !availableHedrons.includes("Dodeca"))
        || (hedronUpgradeCount["Dodeca"] > 4)
    if (availableHedrons.length === 0) return

    const curGold = parseExponent(get_current_gold())
    const nextHedron = rotateHedrons
        ? availableHedrons[currentHedronRotation % availableHedrons.length]
        : availableHedrons[availableHedrons.length - 1]
    const pushFromToPerUpgrade = pushFromToGold[nextHedron]
    const curUpgradeCount = hedronUpgradeCount[nextHedron]
    const [pushFrom, pushTo] = pushFromToPerUpgrade[Math.min(curUpgradeCount, pushFromToPerUpgrade.length - 1)]
    if (curGold.length === 3 && curGold[2] >= pushTo) {
        pushHedrons = false;
        resetAt = Date.now() + resetAfterSec * 1000; // push gold for 5 seconds
        resetHedron = nextHedron;
    }

    if (curGold.length === 3 && curGold[2] >= pushFrom) {
        pushHedrons = true;
    }
}

function choose_reset_sigil() {
    if (settings.reset_sigils_cooldown.value > statistics.timeSinceLastSigilReset.value) return;
    let available_sigils = available_sigils_to_reset();
    if (available_sigils.length === 0) return;
    const unlocked_red = available_sigils.includes("red")
    if (gets_automatic_sigils() && !unlocked_red) return;
    if (available_sigils.length === 1) return available_sigils[0];
    if (get_sigil_count("pink") > 0 && !unlocked_red) return available_sigils[currentSigilRotation % available_sigils.length];
    if (get_sigil_count("yellow") > 1) return available_sigils[currentSigilRotation % available_sigils.length];

    const dragon_pet_requirement = get_dragon_pet_requirement();
    if (!!dragon_pet_requirement && available_sigils[0] !== dragon_pet_requirement) return dragon_pet_requirement;

    // if there's an avaible sigil that is 0, push it or push the sigil before it
    const firstSigilWith0Count = sigils.find(sigil => get_sigil_count(sigil) === 0)
    const sigilBeforeFirstSigilWith0Count = sigils[sigils.indexOf(firstSigilWith0Count) - 1]
    const should_push_sigil = get_new_sigil_after(sigilBeforeFirstSigilWith0Count) < get_sigil_count(sigilBeforeFirstSigilWith0Count)
    if (should_push_sigil) return firstSigilWith0Count;
    if (!should_push_sigil && firstSigilWith0Count !== undefined) {
        available_sigils = available_sigils.slice(0, available_sigils.indexOf(firstSigilWith0Count) + 1)
    }

    const nextSigilIndex = currentSigilRotation % available_sigils.length;
    if (nextSigilIndex === 0) currentSigilRotation++;
    return available_sigils[currentSigilRotation % available_sigils.length];
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function buy_fire_upgrades() {
    if (gets_automatic_fire_upgrades()) return
    // click on the buy all button with ID "BuyAllFireButton"
    getElementById("fireMaxAllButton").click();
}

let lastClickedPlatinumUpgrade = Date.now()

function buy_platinum_upgrades() {
    if (lastClickedPlatinumUpgrade + 1000 > Date.now()) return;
    lastClickedPlatinumUpgrade = Date.now()
    const buttons = getElementsByClassName("platinumUpgrade");
    if (!buttons[4].disabled) {
        getElementById("platinumConvertButton").click();
        buttons[4].click()
        return;
    }

    if (!buttons[2].disabled) {
        buttons[2].click()
        return;
    }

    getElementById("platinumMaxAllButton").click();
}

function farm_plutonium() {
    if (gets_automatic_plutonium()) return
    if (getElementById("plutoniumConvertButton").disabled) return;
    getElementById("plutoniumConvertButton").click();
}

const plutonium_upgrade_order = [2, 1, 0, 3, 4]

function buy_plutonium_upgrades() {
    // plutoniumUpgrade
    const buttons = getElementsByClassName("plutoniumUpgrade");
    for (let i = 0; i < plutonium_upgrade_order.length; i++) {
        if (!buttons[plutonium_upgrade_order[i]].disabled) {
            buttons[plutonium_upgrade_order[i]].click();
            return;
        }
    }
}

let lastClickedHedronUpgrade = Date.now()

function buy_hedron_upgrades() {
    if (lastClickedHedronUpgrade + 1000 > Date.now()) return;
    lastClickedHedronUpgrade = Date.now()
    for (let i = 0; i < hedrons.length; i++) {
        let hedron = hedrons[i];
        const buttons = getElementsByClassName(`holy${hedron}hedronUpgrade`);
        for (let i = 0; i < buttons.length; i++) {
            let button = buttons[i]
            if (!button.disabled) {
                hedronNextUpgradeCost = get_upgrade_cost(button)
                button.click();
                return;
            } else {
                hedronUpgradeCount[hedron]++;
            }
        }
    }
}

function get_current_holyfire() {
    return parseNumber(getElementById("holyFire").innerText)
}

let lastClickHolyFireUpgrade = Date.now()

function buy_holyfire_upgrades() {
    if (gets_automatic_holyfire_upgrades()) return;
    if (lastClickHolyFireUpgrade + 1000 > Date.now()) return;
    lastClickHolyFireUpgrade = Date.now()
    const currentHolyFire = get_current_holyfire()
    const unlockedVoidMagic = unlocked_void_magic()
    if (currentHolyFire > 1e8 && !unlockedVoidMagic) {
        tryToPushGoldAt = Date.now()
        tryToPushGoldUntil = Date.now() + 5000
    }

    if (currentHolyFire > 1e7 && !unlockedVoidMagic) return;
    const buttons = getElementsByClassName("holyFireUpgrade");
    for (let i = 0; i < buttons.length; i++) {
        let button = buttons[i]
        if (!button.disabled) {
            button.click();
        }
    }
}


// voidMagicUpgrade
let lastClickVoidMagicUpgrade = Date.now()
let hasBoughtBloodEqualizer = false;

function buy_void_magic_upgrades() {
    if (lastClickVoidMagicUpgrade + 1000 < Date.now()) return;
    lastClickVoidMagicUpgrade = Date.now()
    const buttons = getElementsByClassName("voidMagicUpgrade");
    hasBoughtBloodEqualizer = buttons[6].disabled
    for (let i = 0; i < buttons.length; i++) {
        let button = buttons[i]
        if (!button.disabled) {
            button.click();
        }
    }
}

// oganessonUpgrade
function buy_oganesson_upgrades() {
    const buttons = getElementsByClassName("oganessonUpgrade");
    for (let i = 0; i < buttons.length; i++) {
        let button = buttons[i]
        if (!button.disabled) {
            button.click();
        }
    }
}

function get_upgrade_cost(button) {
    return getCachedData(button.innerText, () => {
        const buttonParts = button.innerText.split("\n")
        const buttonPart = buttonParts.find((part) => part.includes("Cost"))
        return parseNumber(buttonPart.split(" ")[1])
    })
}


function farm_uranium() {
    if (gets_automatic_uranium()) return
    getElementById("uraniumConvertButton").click();
}

function farm_tomes() {
    getElementById("tomeCost").parentElement.click();
}

let lastClickedUraniumUpgrade = Date.now()

function buy_uranium_upgrades() {
    if (lastClickedUraniumUpgrade + 1000 > Date.now()) return;
    lastClickedUraniumUpgrade = Date.now()
    const buttons = getElementsByClassName("uraniumUpgrade");
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

    getElementById("uraniumMaxAllButton").click();
}

// buy magic upgrades with class "magicUpgrade"
function buy_magic_upgrades() {
    const buttons = getElementsByClassName("magicUpgrade");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].click();
    }
}

const magicCosts = [2, 3, 8, 12, 30, 100, 300, 1500, 4000, 20000, 100000, 400000]

function getNextMagicCost() {
    const buttons = getElementsByClassName("magicUpgrade");
    for (let i = 0; i < buttons.length; i++) {
        if (!buttons[i].disabled) {
            return magicCosts[i];
        }
    }
}

function buy_dark_magic_upgrades() {
    const buttons = getElementsByClassName("darkMagicUpgrade");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].click();
    }
}

function get_current_knowledge() {
    return parseNumber(getElementById("knowledge").innerText);
}

function spent_knowledge() {
    if (!gets_automatic_max_tomes()) farm_tomes()
    if (!gets_automatic_knowledge_upgrades()) buy_knowledge_upgrades()
}

function buy_knowledge_upgrades() {
    const buttons = getElementsByClassName("knowledgeUpgrade");

    const cur_knowledge = get_current_knowledge();
    if (!buttons[2].disabled && cur_knowledge.length === 1 && cur_knowledge[0] > 50000) {
        buttons[2].click()
        return;
    }

    for (let i = 0; i < buttons.length; i++) {
        if (i === 2) continue;
        const cost = parseNumber(getElementById(`knowledgeUpgrade${i + 1}Cost`).innerText);
        const knowledge_divider = 10 ** settings.spend_knowledge_divider_exponent.value;
        const max_spent_knowledge = get_current_knowledge() / knowledge_divider
        if (cost < max_spent_knowledge) buttons[i].click();

    }
}

function buy_tomes_upgrades() {
    const buttons = getElementsByClassName("tomeUpgrade");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].click();
    }
}

function buy_blue_fire_upgrades() {
    if (has_automatic_max_all_blue_fire()) return;
    const buttons = getElementsByClassName("blueFireUpgrade");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].click();
    }
}

function choose_reset_magic() {
    if (settings.reset_magic_cooldown.value > statistics.timeSinceLastMagicReset.value) return;
    if(gets_automatic_magic()) return;


    // if we can progress more than 1/10 of the way to the next magic upgrade, reset
    const nextMagicCost = getNextMagicCost()
    const magicToGet = parseNumber(getElementById("magicToGet").innerText);
    const currentMagic = parseNumber(getCurrentMagic());
    if(magicToGet === 0) return;

    if(nextMagicCost && magicToGet >= Math.floor(nextMagicCost / 10) + 1) return "magic";
    if(magicToGet > currentMagic * 2) return "magic";
}

function post_reset(resetItem) {
    resetAt = undefined
    resetHedron = undefined
    if (resetItem.includes("magic")) {
        statistics.timeForLastMagicReset.value = Math.floor((Date.now() - statistics.lastMagicResetTime.value) / 1000)
        statistics.lastMagicResetTime.value = new Date().getTime();
    }
    if (resetItem.includes("Sigils")) {
        currentSigilRotation++;
        statistics.timeForLastSigilReset.value = Math.floor((Date.now() - statistics.lastSigilResetTime.value) / 1000)
        statistics.lastSigilResetTime.value = new Date().getTime();
    }
    if (resetItem.includes("hedrons")) {
        currentHedronRotation++;
        statistics.timeForLastHedronReset.value = Math.floor((Date.now() - statistics.lastHedronResetTime.value) / 1000)
        statistics.lastHedronResetTime.value = new Date().getTime();
    }
}

function get_dragon_cooldown() {
    // dragonTimeCooldown
    return parseNumber(getElementById("dragonTimeCooldown").innerText);
}

function spend_time_with_dragon() {
    // click on dragonSpendTimeButton
    getElementById("dragonSpendTimeButton").click();
}


function resetProgress() {
    const resetItem = statistics.nextReset.value
    if (!resetItem) return;

    const resetAfter = settings.resetAfter.value
    const disableReset = settings.disable_reset.value
    if (!resetItem || resetAfter === 0 || disableReset || (resetAt && resetAt > Date.now())) return;

    const toGetElement = getElementById(resetItem + "ToGet")
    if (toGetElement === null) return;
    const itemCount = parseNumber(toGetElement.innerText);
    if (itemCount >= resetAfter) {
        toGetElement.parentElement.click();
        post_reset(resetItem)
        statistics.lastReset.value = resetItem;
    }
}

function buy_dragon_feed() {
    const dragon_feed_requirement = get_dragon_pet_requirement()
    if (dragon_feed_requirement === null) return;
    const cur_sigils = get_sigil_count(dragon_feed_requirement)
    if (cur_sigils < 500) return;
    getElementById("dragonFeedButton").click();
}

function pet_dragon() {
    const dragon_pet_button = getElementById("dragonPetButton")
    if (dragon_pet_button.disabled) return;
    getElementById("dragonPetButton").click();
}


function buy_sigil_upgrades() {
    if (gets_automatic_sigil_upgrades()) return;

    for (let i = 0; i < sigils.length; i++) {
        const sigil = sigils[i]
        const buttons = getElementsByClassName(sigil + "SigilUpgrade");
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].click();
        }
    }

    buy_max_sigil_upgrades()
}

let EASY_CHALLENGE_COMBOS = [
    [0], [0, 1], [0, 1, 3], [0, 1, 2, 3]
]

let HARD_CHALLENGE_COMBOS = [
    [3], [2, 3], [0, 2, 3], [0, 1, 2, 3]
]

let challenge_cool_down = [0, 0, 0, 0];

function get_score(n) {
    const score = getElementById("magicScore" + (n + 1)).innerText.replaceAll(",", "").replaceAll(".", "")
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
    return getElementById("gold").innerText
}

function getCurrentMagic() {
    return getElementById("magic").innerText
}

const get_gold_per_second = () => parseNumber(getElementById("goldPerSecond").innerText)

function get_knowledge_cost(level, sigil) {
    set_trade_level(level)
    const sigilIndex = sigils.indexOf(sigil)
    const knowledge_trade_cost_ranges = getElementsByClassName("knowledgeTradeCostRange");
    const knowledge_trade_cost_range = knowledge_trade_cost_ranges[sigilIndex].innerText.split(" - ");
    return parseNumber(knowledge_trade_cost_range[1])
}

let chooseTradeLevelAt;

function choose_trade_level() {
    if (Date.now() < chooseTradeLevelAt) return;
    chooseTradeLevelAt = Date.now() + 10000;
    // get max of knowledgeLevelInput
    const knowledge_level_input = getElementById("knowledgeLevelInput");
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
    const knowledge_level_input = getElementById("knowledgeLevelInput");
    const knowledge_level_range = getElementById("knowledgeLevelRange");
    knowledge_level_input.value = level
    knowledge_level_range.value = level
    knowledge_level_input.dispatchEvent(new Event('input', {bubbles: true}));
    knowledge_level_range.dispatchEvent(new Event('input', {bubbles: true}));

}

function buy_knowledge_trade() {
    if (gets_automatic_knowledge()) return;
    const knowledge_trades = getElementsByClassName("knowledgeTradeDiv");
    for (let i = knowledge_trades.length - 1; i >= 0; i--) {
        const knowledge_trade = knowledge_trades[i];
        choose_trade_level()
        knowledge_trade.getElementsByTagName("button")[0].click();
    }
}

const mine_gold_button = get_mine_gold_button()

function mine_gold(loop) {
    const goldPerSec = get_gold_per_second();
    const goldPerClick = parseNumber(getElementById("goldPerClick").innerText);
    const loopsPerSecond = 1000 / ITERATION_SPEED_MS;
    const goldPerSecByClick = goldPerClick * settings.mine_gold_clicks.value;
    const clickCount = Math.floor(settings.mine_gold_clicks.value / loopsPerSecond);

    if(goldPerSec > 1e308) return;
    if(goldPerSec > 10 * goldPerSecByClick) return;

    if (clickCount > 0) {
        for (let i = 0; i < clickCount; i++) {
            mine_gold_button.click();
        }
    }
    if (loop % loopsPerSecond === 0) {
        for (let i = 0; i < settings.mine_gold_clicks.value; i++) {
            mine_gold_button.click();
        }
    }
}

function buy_miners() {
    if (gets_automatic_miners()) return;
    const minerCostElement = getElementById("minerCost");
    const minerCost = parseNumber(minerCostElement.innerText);
    const currentGold = parseNumber(get_current_gold());
    if (10 * minerCost < currentGold) minerCostElement.parentElement.click()
}

function has_dragon() {
    const unlock_dragon_button = getElementById("unlockDragonButton");
    return unlock_dragon_button.style.display === "none";
}

function unlock_dragon() {
    if (has_dragon()) return;
    getElementById("unlockDragonButton").click();
}

function has_fire_upgrade() {
    const fire_upgrade = getElementById("buyFireUpgradesButton");
    return fire_upgrade.style.display === "none";
}

function unlock_fire_upgrade() {
    if (has_fire_upgrade()) return;
    getElementById("buyFireUpgradesButton").click();
}

function has_alchemy_upgrade() {
    // unlockAlchemyButton
    const alchemy_upgrade = getElementById("unlockAlchemyButton");
    return alchemy_upgrade.style.display === "none";
}

function unlock_alchemy_upgrade() {
    if (has_alchemy_upgrade()) return;
    getElementById("unlockAlchemyButton").click();
}

function has_magic_upgrade() {
    const magic_upgrade = getElementById("unlockMagicButton");
    return magic_upgrade.style.display === "none";
}

function unlock_magic_upgrade() {
    if (has_magic_upgrade()) return;
    getElementById("unlockMagicButton").click();

}

function has_more_magic_upgrade() {
    return getElementById("moreMagicUpgradesButton").style.display === "none";
}

function unlock_more_magic_upgrade() {
    if (has_more_magic_upgrade()) return;
    getElementById("moreMagicUpgradesButton").click();
}


let hasMorePlatinumAndUraniumUpgrades = false

function has_more_platinum_and_uranium_upgrades() {
    if (!hasMorePlatinumAndUraniumUpgrades) {
        const more_pu_upgrades = getElementById("morePUupgradesButton");
        hasMorePlatinumAndUraniumUpgrades = more_pu_upgrades.style.display === "none";
    }

    return hasMorePlatinumAndUraniumUpgrades
}


function unlock_more_platinum_and_uranium_upgrades() {
    if (has_more_platinum_and_uranium_upgrades()) return;
    getElementById("morePUupgradesButton").click();
}

let hasDarkMagicUpgrade = false

function has_dark_magic_upgrade() {
    if (!hasDarkMagicUpgrade) {
        const dark_magic_upgrade = getElementById("unlockDarkMagicUpgradesButton");
        hasDarkMagicUpgrade = dark_magic_upgrade.style.display === "none";
    }

    return hasDarkMagicUpgrade
}

function unlock_dark_magic_upgrade() {
    if (has_dark_magic_upgrade()) return;
    getElementById("unlockDarkMagicUpgradesButton").click();
}

let hasMoreDarkMagicUpgrades = false

function has_more_dark_magic_upgrade() {
    if (!hasMoreDarkMagicUpgrades) {
        const more_dark_magic_upgrade = getElementById("moreDarkMagicUpgradesButton");
        hasMoreDarkMagicUpgrades = more_dark_magic_upgrade.style.display === "none";
    }

    return hasMoreDarkMagicUpgrades;
}

function unlock_more_dark_magic_upgrade() {
    if (has_more_dark_magic_upgrade()) return;
    getElementById("moreDarkMagicUpgradesButton").click();
}

let hasBloodUpgrade = false

function has_blood_upgrade() {
    if (!hasBloodUpgrade) {
        const blood_upgrade = getElementById("unlockBloodButton");
        hasBloodUpgrade = blood_upgrade.style.display === "none";
    }

    return hasBloodUpgrade;
}

function unlock_blood() {
    if (has_blood_upgrade()) return;
    getElementById("unlockBloodButton").click();
}

function selectHellLayer(level) {
    // select nth option in #hellLayer
    const hell_layer = getElementById("hellLayer");
    hell_layer.selectedIndex = level;
    hell_layer.dispatchEvent(new Event('change'));
}


let inHell = false;

function enterHell(level) {
    inHell = true;
    selectHellLayer(level)
    const enterHellButton = getElementById("enterHellButton");
    if (enterHellButton.innerText === "Exit hell") return;
    enterHellButton.click();
    post_reset("hell")
}

function exitHell() {
    inHell = false;
    const enterHellButton = getElementById("enterHellButton");
    if (enterHellButton.innerText === "Enter hell") return;
    enterHellButton.click();
}

function get_upgrade_dragon_button() {
    const buttons = getElementsByClassName("upgradeDragonButton");
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].style.display !== "none") {
            return buttons[i];
        }
    }

    return null;
}

function upgrade_dragon() {
    const upgradeDragonsButton = getCachedData("upgradeDragonsButton", get_upgrade_dragon_button)
    if (upgradeDragonsButton !== null) upgradeDragonsButton.click();
}

function unlocked_challenges() {
    // check if tab_magicChallenges has display none
    const tab_magicChallenges = getElementById("tab_magicChallenges");
    return tab_magicChallenges.style.display !== "none";
}

function unlocked_void_magic() {
    const tab_voidMagic = getElementById("tab_voidMagic");
    return tab_voidMagic.style.display !== "none";
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
    const challenge_div = getElementsByClassName("magicChallenge")[challenge_number];
    const challenge_div_color = challenge_div.style.color;
    return challenge_div_color !== "white";
}

function enable_challenge(challenge_number) {
    if (!is_challenge_enabled(challenge_number)) {
        getElementsByClassName("magicChallenge")[challenge_number].click();
    }
}

function disable_challenge(challenge_number) {
    if (is_challenge_enabled(challenge_number)) {
        getElementsByClassName("magicChallenge")[challenge_number].click();
    }
}

function start_challenge() {
    // verify we are not yet in a challenge, then there is a text "You are not in any challenges!"
    if (getElementById("activeChallenges").innerText === "You are not in any challenges!") {
        // click on the challenge button
        getElementById("magicChallengeButton").click();
    }
}

function stop_challenge() {
    // verify we are not yet in a challenge, then there is a text "You are not in any challenges!"
    if (getElementById("activeChallenges").innerText !== "You are not in any challenges!") {
        // click on the challenge button
        getElementById("magicChallengeButton").click();
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
    const dragon_stage_counter = getElementById("dragonStageCounter");
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
        buy_upgrades(i)
        await delay(ITERATION_SPEED_MS);
    }
}

function capitalize(string) {
    return string[0].toUpperCase() + string.slice(1);
}

function buy_max_sigil_upgrades() {
    const sigilResetAutomation = getElementById("sigilResetAutomation");
    if (sigilResetAutomation === null || sigilResetAutomation.style.display === "none") return;
    const button = sigilResetAutomation.nextElementSibling
    if (button === null || button.disabled) return;
    button.click()

    // for all colors in sigils
    for (let i = 0; i < sigils.length; i++) {
        let sigil = sigils[i];
        const maxUpgrades = getElementById(`max${capitalize(sigil)}SigilUpgradesButton`);
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

function updateStatistics() {
    const curGold = get_current_gold()
    statistics.curGold.value = curGold
    const maxGold = statistics.maxGold.value
    if (compareExponent(parseExponent(curGold), parseExponent(maxGold)) > 0) {
        statistics.maxGold.value = curGold
    }

    // curMagic && maxMagic
    const curMagic = getCurrentMagic()
    statistics.curMagic.value = curMagic
    const maxMagic = statistics.maxMagic.value
    if (compareExponent(parseExponent(curMagic), parseExponent(maxMagic)) > 0) {
        statistics.maxMagic.value = curMagic
    }

    statistics.timeSinceLastMagicReset.value = Math.floor((Date.now() - statistics.lastMagicResetTime.value) / 1000)
    statistics.timeSinceLastSigilReset.value = Math.floor((Date.now() - statistics.lastSigilResetTime.value) / 1000)
    statistics.timeSinceLastHedronReset.value = Math.floor((Date.now() - statistics.lastHedronResetTime.value) / 1000)
    statistics.nextReset.value = itemToReset()

    localStorage.setItem(statisticsKey, JSON.stringify(statistics));
}

function updateStatisticsModal() {
    for (const stat in statistics) {
        // if value is null, hide the stat
        let statElement = getElementById(stat)
        if (statistics[stat].value === 0 || statistics[stat].value === Infinity || statistics[stat].visible === false) {
            statElement.parentElement.style.display = 'none';
            continue;
        }

        // if value is not null and stat is hidden, show the stat
        if (statElement.parentElement.style.display === 'none' && statistics[stat].visible !== false) {
            statElement.parentElement.style.display = 'flex';
        }

        statElement.textContent = statistics[stat].value;
    }
}

function unlocked_blood() {
    return getElementById('tab_blood').style.display !== 'none'
}

function get_hell_levels() {
    let hellLayer = getElementById("hellLayer")
    return hellLayer.children
}

function get_blood_per_seconds() {
    return parseNumber(getElementById('bloodPerSecond').innerText)
}

function get_current_blood() {
    return parseNumber(getElementById('blood').innerText)
}

function unlock_void_magic() {
    const unlockVoidMagicButton = getElementById('unlockVoidMagicUpgradesButton')
    if (unlockVoidMagicButton.style.display === 'none') return
    unlockVoidMagicButton.click()
}

function unlock_planets() {
    const unlockPlanetsButton = getElementById('unlockPlanetsButton')
    if (unlockPlanetsButton.style.display === 'none') return
    unlockPlanetsButton.click()
}

function form_planets() {
    if (gets_automatic_planets()) return
    // class formPlanetButton
    const buttons = document.getElementsByClassName('formPlanetButton')
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].click()
    }
}

// has tab_cosmicPlague
function unlocked_cosmic_plague() {
    return getElementById('tab_cosmicPlague').style.display !== 'none'
}

function get_spores() {
    if (!unlocked_cosmic_plague()) return
    getElementById('sporeCost').parentElement.click()
}

function get_plagueUpgrades() {
    if (!unlocked_cosmic_plague() || gets_automatic_cosmic_plague_upgrades()) return
    const buttons = document.getElementsByClassName('plagueUpgrade')
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].click()
    }
}

function form_supercluser() {
    getElementById('superclusterCost').parentElement.click()
}

function unlocked_hypergods() {
    return getElementById('tab_omniversalHypergods').style.display !== 'none'
}

function fight_hypergod() {
    if (!unlocked_hypergods()) return;
    if(killed_all_bosses()) return;
    getElementById('hypergodButton').click()

}

function unlocked_essences() {
    return getElementById('tab_lightEssence').style.display !== 'none'
}

function unlock_essences() {
    if (unlocked_essences()) return
    getElementById('unlockEssencesButton').click()
}

function buy_essence_upgrades() {
    if (!unlocked_essences()) return
    const lightButtons = document.getElementsByClassName('lightEssenceUpgrade')
    const darkButtons = document.getElementsByClassName('darkEssenceUpgrade')
    for (let i = 0; i < lightButtons.length; i++) {
        lightButtons[i].click()
    }

    for (let i = 0; i < darkButtons.length; i++) {
        darkButtons[i].click()
    }

    if (!unlocked_death_essence()) return
    // focus on 3rd and 5th upgrade
    const deathUpgradeCosts = document.getElementsByClassName('deathEssenceUpgradeCost')
    const uraniumUpgradeCost = parseNumber(deathUpgradeCosts[2].innerText)
    const essenceUpgradeCost = parseNumber(deathUpgradeCosts[4].innerText)
    const deathButtons = document.getElementsByClassName('deathEssenceUpgrade')
    for (let i = 0; i < deathButtons.length; i++) {
        const upgradeCost = parseNumber(deathUpgradeCosts[i].innerText)
        if(i === 4) deathButtons[i].click()
        if(i === 2 && 5 * upgradeCost < essenceUpgradeCost) deathButtons[i].click()
        if(5 * upgradeCost < essenceUpgradeCost && 3 * upgradeCost < uraniumUpgradeCost) deathButtons[i].click()
    }

    if (!unlocked_finality_essence()) return
    const finalityButtons = document.getElementsByClassName('finalityEssenceUpgrade')
    for (let i = 0; i < finalityButtons.length; i++) {
        finalityButtons[i].click()
    }
}

function unlocked_death_essence() {
    return getElementById('tab_deathEssence').style.display !== 'none'
}

function unlocked_finality_essence() {
    return getElementById('tab_finalityEssence').style.display !== 'none'
}

function unlock_death_essence() {
    if (unlocked_death_essence()) return
    getElementById('unlockDeathEssenceButton').click()
}

function can_unlock_nuclear_pasta() {
    return getElementById('unlockNuclearPastaButton').style.display !== 'none'
}

function unlocked_nuclear_pasta() {
    return getElementById('tab_nuclearPasta').style.display !== 'none'
}

function unlock_nuclear_pasta() {
    if (!can_unlock_nuclear_pasta() || unlocked_nuclear_pasta()) return
    getElementById('unlockNuclearPastaButton').click()
}

function gain_nuclear_pasta() {
    if (!unlocked_nuclear_pasta()) return
    if(gets_automatic_nuclear_pasta()) return
    getElementById('nuclearPastaCost').parentElement.nextElementSibling.click()
}

function unlocked_finality_cubes() {
    // tab_finalityCubes
    return getElementById('tab_finalityCubes').style.display !== 'none'
}

function gain_and_upgrade_finality_cubes() {
    if (!unlocked_finality_cubes()) return
    const gainMaxButton = getElementById('finalityCubeCost').parentElement.nextElementSibling
    const boostFinalityCubeButton = gainMaxButton.nextElementSibling
    const boostFinalityBoostButton = boostFinalityCubeButton.nextElementSibling
    gainMaxButton.click()
    boostFinalityCubeButton.click()
    boostFinalityBoostButton.click()
}

let unlockedLasagna = false;
let unlockedAntispaghetti = false;
function buy_nuclear_pasta_upgrades() {
    if (!unlocked_nuclear_pasta()) return
    const buttons = document.getElementsByClassName('nuclearPastaUpgrade')
    if(buttons[0].disabled) unlockedLasagna = true;
    if(buttons[1].disabled) unlockedAntispaghetti = true;

    for (let i = 0; i < buttons.length; i++) {
        if(buttons[i].disabled) continue;
        buttons[i].click()
    }
}

function getNuclearPastaState() {
    // nuclearPastaState
    return getElementById('nuclearPastaState').innerText
}

function extendNuclearPasta() {
    if (!unlocked_nuclear_pasta()) return;
    // extend state if paste
    if (getNuclearPastaState() === 'Spaghetti') {
        getElementById('extendNuclearPastaButton').click()
    }

    if(unlockedAntispaghetti && getNuclearPastaState() === 'Lasagna') {
        getElementById('extendNuclearPastaButton').click()
    }
}

const optimizeHellCooldown = 1000 * 60;

async function optimize_blood_level() {
    if (unlocked_void_magic()) return 4;
    if (statistics.optimizedHellLevelAt.value + optimizeHellCooldown > Date.now()) return statistics.optimizedHellLevel.value
    let maxBloodPerSec = 0
    let bestBloodLevel = 0
    const hellLevels = get_hell_levels()
    const maxLevel = hellLevels.length - 1
    const minLevel = get_sigil_count('red') > 0 ? 3 : 0
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
    if (parseExponent(get_current_gold()).length < 3 && hedronUpgradeCount["Tetra"] < 7) return;
    if (hasBoughtBloodEqualizer) return;
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

function buy_upgrades(loop) {
    updateStatistics()
    updateStatisticsModal()
    mine_gold(loop)
    buy_miners()
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
    resetProgress()
    farm_plutonium()
    buy_plutonium_upgrades()
    buy_hedron_upgrades()
    buy_holyfire_upgrades()
    unlock_void_magic()
    buy_void_magic_upgrades()
    unlock_planets()
    form_planets()
    form_supercluser()
    get_spores()
    get_plagueUpgrades()
    fight_hypergod()
    buy_oganesson_upgrades()
    unlock_essences()
    buy_essence_upgrades()
    unlock_death_essence()
    unlock_nuclear_pasta()
    gain_nuclear_pasta()
    buy_nuclear_pasta_upgrades()
    extendNuclearPasta()
    gain_and_upgrade_finality_cubes()
}

async function game_loop() {
    while (settings.enabled.value) {
        stop_challenge()
        exitHell()
        buy_upgrades(0)
        await do_challenges()
        await farm_blood()
        await idle_loop(5)
        spend_time_with_dragon()
    }
}

// start the game loop
create_settings_window()
create_statistics_window()
await game_loop();

