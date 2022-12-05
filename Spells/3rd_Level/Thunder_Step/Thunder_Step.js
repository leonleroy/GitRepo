const MACRONAME = "Thunder_Step.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Total rewrite of what was a macro less, two step Thunder Step implementation.  
 * This is now just one step and is highly automated.
 * 
 * 12/04/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
//---------------------------------------------------------------------------------------------------
// Set standard variables
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const DAM_DICE = '3d10'
const DAM_TYPE = 'thunder'
const SAVE_TYPE = 'con'
const SAVE_DC = aActor.data.data.attributes.spelldc;
const ITEM_RANGE = jez.getRange(aItem, ["", "ft", "any"])
const MAX_DISTANCE = (ITEM_RANGE) ? ITEM_RANGE : 90
const VFX_DAMAGE = "modules/jb2a_patreon/Library/Generic/Marker/MusicMarker_01_Regular_GreenOrange_400x400.webm"
const VFX_OUT    = "modules/jb2a_patreon/Library/Generic/Impact/ImpactMusicNote01_01_Regular_GreenYellow_400x400.webm"
const VFX_OPACITY = 1.0;
const VFX_SCALE = 1.4;
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.trace(`${TAG}--- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-----------------------------------------------------------------------------------------------
    // Set function variables
    //
    const DAM_LOCATION = aToken.center
    //-----------------------------------------------------------------------------------------------
    // Pick a teleportation buddy
    //
    let bToken = await pickTeleportBuddy({traceLvl: 0});
    if (bToken && TL > 1) jez.trace(`${TAG} Our teleport buddy is ${bToken.name}`, bToken)
    else jez.trace(`${TAG} We have no teleport buddy.`)
    //-----------------------------------------------------------------------------------------------
    // Build list of tokens that can be damaged, exclude the caster and buddy
    //
    let damTokens = []
    let damageableTokens = await jez.inRangeTargets(aToken, 10, { direction: "o2t", chkMove: true, traceLvl:0 });
    if (TL > 1) jez.trace(`${TAG} ${damageableTokens.length} Damageable Token Objects`, damageableTokens);
    for (let i = 0; i < damageableTokens.length; i++) {
        if (damageableTokens[i].name !== bToken?.name) {
            if (TL > 2) jez.trace(`${TAG} Tokens`,
                `Candidate ${damageableTokens[i].name}`,damageableTokens[i],
                `Buddy     ${bToken?.name}             `,bToken)
            damTokens.push(damageableTokens[i])
            if (TL > 1) jez.trace(`${TAG} Damageable: ${damageableTokens[i]?.name}`);
        }
    }
    //-----------------------------------------------------------------------------------------------
    // Perform the teleport
    //
    if (TL > 2) jez.trace(`${TAG} ${aToken.name} before ==> {${aToken.x}, ${aToken.y}} center`, aToken.center)
    const  NEW_LOC = await doTeleport(aToken, bToken, {traceLvl: TL})
    if (!NEW_LOC) {
        jez.refundSpellSlot(aToken, L_ARG.spellLevel, { traceLvl: TL, quiet: false, spellName: aItem.name })
        msg = `No valid teleport location selected.`
        postResults(msg)
        return null
    }
    if (TL > 2) jez.trace(`${TAG} ${aToken.name} after ===> {${NEW_LOC?.x}, ${NEW_LOC?.y}} center`, NEW_LOC)
    //-----------------------------------------------------------------------------------------------
    // Fire off the damage element at the DAM_LOCATION
    //
    damageVFX(DAM_LOCATION)
    inflictDamage(damTokens, {traceLvl: TL})
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (bToken) msg = `With the rumble of thunder in a 300 foot area, <b>${aToken.name}</b> has  
    teleported away bringing <b>${bToken.name}</b> along and damaging creatures that had been within 
    10 feet.`
    else msg = `With the rumble of thunder in a 300 foot area, <b>${aToken.name}</b> has teleported 
    away, damaging creatures that had been within 10 feet.`
    postResults(msg)
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Pick a teleportation buddy, returning the buddy token object or null
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function pickTeleportBuddy(options = {}) {
    const FUNCNAME = "pickTeleportBuddy(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-----------------------------------------------------------------------------------------------
    // 
    //
    const queryTitle = "Select Willing Creature to Teleport";
    const queryText = "A willing creature may be selected from the list below.";
    let adjTokNames = [];
    let buddyObject = null
    //-----------------------------------------------------------------------------------------------
    // 
    //
    let ADJ_TOK_OBJS = await jez.inRangeTargets(aToken, 8, { direction: "o2t", chkSight: true });
    if (TL > 1)
        jez.trace(`${TAG} ${ADJ_TOK_OBJS.length} Adjacent Token Objects`, ADJ_TOK_OBJS);
    if (ADJ_TOK_OBJS.length === 0) {
        if (TL > 1)
            jez.trace(`${TAG} No effectable targets in range`, "i");
    }
    else {
        for (let i = 0; i < ADJ_TOK_OBJS.length; i++) {
            adjTokNames.push(ADJ_TOK_OBJS[i].name);
            if (TL > 1)
                jez.trace(`${TAG} Adjacent: ${adjTokNames[i]}`);
        }
    }
    if (TL > 1) jez.trace(`${TAG} ${adjTokNames.length} Potential Teleportation Buddies`);
    if (adjTokNames.length !== 0) { // Optionally pick teleportation buddy if one available
        const BUDDY_NAME = await jez.pickRadioListArray(queryTitle, queryText, jez.wait, adjTokNames.sort());
        if (TL > 1) jez.trace(`${TAG} Buddy selected`, BUDDY_NAME);
        if (BUDDY_NAME) {   // If we picked a buddy by name, loop through ADJ_TOK_OBJS for a match
            for (let i = 0; i < ADJ_TOK_OBJS.length; i++) {
                if (TL > 2) jez.trace(`${TAG} Checking ${BUDDY_NAME} against ${ADJ_TOK_OBJS[i].name}`);
                if (BUDDY_NAME === ADJ_TOK_OBJS[i].name) {
                    buddyObject = ADJ_TOK_OBJS[i]
                    break
                }
            }
        }
    }
    return buddyObject
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * requires Warpgate, Sequencer, and JB2A patreon module
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doTeleport(aToken, bToken, options = {}) {
    const FUNCNAME = "runVFX(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, 'aToken',aToken,
        'bToken',bToken, "options", options);
    //-----------------------------------------------------------------------------------------------
    // Pick spot for the active token
    //
    let destination = await teleport(aToken, aToken.center, MAX_DISTANCE)
    if (TL > 1) jez.trace(`${TAG} First teleport spot picked`, destination)
    if (!destination) return null
    //-----------------------------------------------------------------------------------------------
    // Pick spot for the buddy token, if any
    //
    if (!bToken) return(destination)
    let bDestination = await teleport(bToken, destination, 5)
    if (TL > 1) jez.trace(`${TAG} Second teleport spot picked`, bDestination)
    return(destination)
    //-----------------------------------------------------------------------------------------------
    // Local teleport function
    //
    async function teleport(token5e, origin, range) {
        if (TL > 1) jez.trace(`${TAG} origin ==>`, origin)
        let cachedDistance = 0;
        const checkDistance = async (crosshairs) => {
            while (crosshairs.inFlight) {
                //wait for initial render
                await jez.wait(100);
                const ray = new Ray(origin, crosshairs);
                const distance = canvas.grid.measureDistances([{ ray }], { gridSpaces: true })[0];
                //only update if the distance has changed
                if (cachedDistance !== distance) {
                    cachedDistance = distance;
                    if (distance > range) crosshairs.icon = 'Icons_JGB/Misc/Warning.webm';
                    else crosshairs.icon = token5e.data.img;
                    crosshairs.draw();
                    crosshairs.label = `${distance} ft`;
                }
            }
        }
        const SNAP = token5e.data.width % 2 === 0 ? 1 : -1
        if (TL > 1) jez.trace(`${TAG} SNAP`, SNAP)
        const location = await warpgate.crosshairs.show(
            {
                // swap between targeting the grid square vs intersection based on token5e's size
                interval: SNAP,
                size: token5e.data.width,
                icon: token5e.data.img,
                label: '0 ft.',
            },
            { show: checkDistance },
        );
        if (TL > 1) jez.trace(`${TAG} location ==>`, location)
        if (location.cancelled || cachedDistance > range) {
            return;
        }
        runVFX(token5e, location, { traceLvl: TL })
        return location
    }
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked each round by DAE
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function runVFX(token, location, options = {}) {
    const FUNCNAME = "runVFX(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,'token', token, 
        'location', location, "options", options);
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    const COLOR = 'dark_green'
    const seq = new Sequence().effect()
        .scale(.25)
        .endTime(400)
        .file(`jb2a.magic_signs.circle.02.conjuration.intro.${COLOR}`)
        .playbackRate(1.5)
        .waitUntilFinished(-500)
        .atLocation(token)
    seq.animation()
        .on(token)
        .fadeOut(500)
        .duration(500)
        .waitUntilFinished();
    seq.animation()
        .on(token)
        .teleportTo(location, { relativeToCenter: false })
        .snapToGrid()
        .waitUntilFinished();
    seq.animation()
        .on(token)
        .fadeIn(1000)
        .waitUntilFinished(-999);
    seq.effect()
        .file('jb2a.impact.003.blue')
        .atLocation(token)
    seq.effect()
        .scale(.25)
        .startTime(400)
        .file(`jb2a.magic_signs.circle.02.conjuration.outro.${COLOR}`)
        .atLocation(token)
    await seq.play();
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Play the damage VFX 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
 async function damageVFX(coords) {
    await jez.wait(1000)
    new Sequence()
        .effect()
        .file(VFX_DAMAGE)
        .attachTo(coords)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .duration(4000)
        // .name(VFX_NAME)          // Give the effect a uniqueish name
        .fadeIn(1000)            // Fade in for specified time in milliseconds
        .fadeOut(1000)           // Fade out for specified time in milliseconds
        .play()
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked each round by DAE
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function inflictDamage(targetTokens,  options={}) {
    const FUNCNAME = "doEach(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,'targetTokens',targetTokens,
        "options",options);
    //-----------------------------------------------------------------------------------------------
    // Some handy function variables and constant
    //
    const FLAVOR = "Does this provide flavor?"
    let failSaves = []  // Array to contain the tokens that failed their saving throws
    let madeSaves = []  // Array to contain the tokens that made their saving throws
    let damaged = [] 
    let madeNames = ""
    let failNames = ""
    //----------------------------------------------------------------------------------
    // Roll saves weeding out any immunes
    //
    let targetCount = targetTokens.length
    if (TL > 1) jez.trace(`${TAG} ${targetCount} Targeted Token`)
    msg = `Total of ${targetCount} target(s) within area of effect of ${aItem.name}<br>`
    for (let i = 0; i < targetCount; i++) {
        let tToken = targetTokens[i];
        let tActor = tToken?.actor;
        let save = (await tActor.rollAbilitySave(SAVE_TYPE,
            { flavor: FLAVOR, chatMessage: false, fastforward: true }));
        if (save.total < SAVE_DC) {
            failSaves.push(tToken)
            damaged.push(tToken)
            failNames += `+ <b>${tToken.name}</b> ${save.total} (${save._formula})<br>`
        } else {
            madeNames += `- <b>${tToken.name}</b> ${save.total} (${save._formula})<br>`
            damaged.push(tToken)
            madeSaves.push(tToken)
        }
    } 
    if (TL > 1) jez.trace(`${TAG} Results`,"Made Saves", madeSaves,"Failed Saves", failSaves)
    //----------------------------------------------------------------------------------
    // Roll the damage Dice
    //
    let damRoll = new Roll(`${DAM_DICE}`).evaluate({ async: false });
    if (TL > 1) jez.trace(`${TAG} Damage Rolled ${damRoll.total}`,damRoll)
    game.dice3d?.showForRoll(damRoll);
    //----------------------------------------------------------------------------------
    // Apply damage to those that failed saving throws
    //
    if (TL > 2) jez.trace(`${TAG} Applying damage to failed saves`)
    new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damRoll, DAM_TYPE, [], damRoll,
                                   {flavor: `Damage from ${aItem.name}`, itemCardId: args[0].itemCardId });
    const FULL_DAM = damRoll.total
    MidiQOL.applyTokenDamage([{damage:FULL_DAM, type:DAM_TYPE}], FULL_DAM, new Set(failSaves), aItem, new Set());
    //----------------------------------------------------------------------------------
    // Apply damage to those that made saving throws
    //
    if (TL > 2) jez.trace(`${TAG} Applying damage to made saves`)
    const HALF_DAM = Math.floor(damRoll.total/2)
    MidiQOL.applyTokenDamage([{damage:HALF_DAM, type:DAM_TYPE}], HALF_DAM, new Set(madeSaves), aItem, new Set());
    //----------------------------------------------------------------------------------
    // Add results to chat card
    //
    let chatMessage = await game.messages.get(args[args.length - 1].itemCardId);
    await jez.wait(100)
    let msg1 = "";
    if (madeNames) {
        msg1 = `<b><u>Successful Save</u></b><br>${madeNames}`
        await jez.wait(100)
        jez.addMessage(chatMessage, { color: "darkgreen", fSize: 14, msg: msg1, tag: "saves" })
    }
    if (failNames) {
        msg1 = `<b><u>Failed Save</u></b><br>${failNames}`
        await jez.wait(100)
        jez.addMessage(chatMessage, { color: "darkred", fSize: 14, msg: msg1, tag: "saves" })
    }
    await jez.wait(100)
    jez.addMessage(chatMessage, { color: "darkblue", fSize: 14, msg: msg, tag: "saves" })
 


    if (TL>3) jez.trace(`${TAG} More Detailed Trace Info.`)

    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}