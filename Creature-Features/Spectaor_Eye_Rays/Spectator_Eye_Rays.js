const MACRONAME = "Spectator_Eye_Rays.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * This macro implements the Spectator's eye rays, in that this one fires
 * rays at up to 2 targets, if less than 2 are selected the extra is directed at the first target 
 * that is the one with index value 0 (I don't know which that will be...)
 * 
 * 10/30/22 0.1 Creation of Macro from Gauth_Eye_Rays.0.1.js
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Token (aToken)
let aToken;
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
let aActor = aToken.actor;
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const RAY_TYPE_COUNT = 4
const RAY_COUNT = 2
const RAY_NAME_ARRAY = [ "Confusion Ray", "Paralyzing Ray", "Fear Ray", "Wounding Ray" ]
let rayArray = []
const DELAY = 1500  // Time between ray attacks
const SAVE_DC = aActor.data.data.attributes.spelldc;
const GAME_RND = game.combat ? game.combat.round : 0;
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`=== Finished === ${MACRONAME} ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function preCheck() {
    if (args[0].targets.length === 0)       // If not exactly one target 
        return jez.badNews(`Must target at least one target.  ${args[0]?.targets?.length} were targeted.`, "w");
    return (true)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
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
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //----------------------------------------------------------------------------------
    if (!await preCheck()) return (false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    console.log (`===> tToken`,tToken)
    let tActor = tToken?.actor;
    //-----------------------------------------------------------------------------------------------
    // Build target array, from the targeted tokens, need 3 for this attack
    //
    let targetArray = []
    targetArray.push(args[0].targets[0]._object)    // First entry has to be at index 0.
    // If we have a second target, push that into array, otherwise add first again
    if (args[0].targets[1]) targetArray.push(args[0].targets[1]._object)
    else targetArray.push(args[0].targets[0]._object)
    //-----------------------------------------------------------------------------------------------
    // Randomly assign a unique ray to each of the targets
    //
    let rolledRay
    for (let i = 0; i < RAY_COUNT; i++) {
        rolledRay = rollRay()
        while (rayArray.includes(rolledRay)) {
            if (rayArray.length === RAY_TYPE_COUNT) return jez.badNews(`${TAG} Ran out of ray types`,'e')
            rolledRay = rollRay()
          }
        rayArray.push(rolledRay)
    }
    function rollRay() { return (Math.floor(Math.random() * RAY_TYPE_COUNT)) }
    //-----------------------------------------------------------------------------------------------
    // Log Assignments for Debugging Purposes
    //
    // if (TL > 2) for (let i = 0; i < targetArray.length; i++) 
    //     jez.trace(`${TAG} ${i+1} ${targetArray[i].name} ---targed by--- ${RAY_NAME_ARRAY[rayArray[i]]}`)
    //-----------------------------------------------------------------------------------------------
    // Step through the targets firing off appropriate function versus each of them
    //
    for (let i = 0; i < targetArray.length; i++) {
        if (TL > 0) jez.trace(`${TAG} -------------------------------------------`)
        if (TL > 0) jez.trace(`${TAG} Fire Ray #${i + 1} ${RAY_NAME_ARRAY[rayArray[i]]} at ${targetArray[i].name}`)
        let options, overTime
        let rayName
        switch (rayArray[i]) {  // Jez, testing hack, add plus integer to move down list
         /* Confusion Ray. The target must succeed on a DC 13 Wisdom saving throw, or it can't take reactions until the 
            end of its next turn. On its turn, the target can't move, and it uses its action to make a melee or ranged 
            attack against a randomly determined creature within range. If the target can't attack, it does nothing on 
            its turn. */
            case 0: 
                rayName = "Confusion Ray"
                let confusionRayDesc = `No reactions, can't move, must use action to make a melee or ranged 
                attack against random creature, if nothing attackable do nothing.`
                options = {
                    RayName: rayName,
                    VFXColor: "rainbow02",
                    ceDesc: confusionRayDesc,
                    traceLvl: TL,
                    saveType: "wis",
                    icon: aItem.img,
                    effectName: rayName,
                    specDur: ["turnEnd", "newDay", "longRest", "shortRest"],
                    changes: [
                        { key: `flags.gm-notes.notes`, mode: jez.ADD, value: confusionRayDesc, priority: 20 },
                        // Notice: Value needs to be a string, integer zero ends up being a null when applied
                        { key: `data.attributes.movement.walk`, mode: jez.DOWNGRADE, value: "0", priority: 20 },
                        { key: `data.attributes.movement.swim`, mode: jez.DOWNGRADE, value: "0", priority: 20 },
                        { key: `data.attributes.movement.fly`, mode: jez.DOWNGRADE, value: "0", priority: 20 },
                        { key: `data.attributes.movement.climb`, mode: jez.DOWNGRADE, value: "0", priority: 20 },
                        { key: `data.attributes.movement.burrow`, mode: jez.DOWNGRADE, value: "0", priority: 20 },
                        { key: `macro.CE`, mode: jez.CUSTOM, value: "Reactions - None", priority: 20 },
                    ]
                }
                msg = await jez.fireRay(targetArray[i], aToken, options);
                break;
         /* Paralyzing Ray. The target must succeed on a DC 13 Constitution saving throw or be paralyzed for 1 minute. The 
            target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. */
            case 1:
                rayName = "Paralyzing Ray"
                overTime = `turn=end,label=Save against Paralyzing Ray,saveDC=${SAVE_DC},saveAbility=con,saveRemove=true,saveMagic=true,rollType=save`
                options = {
                    RayName: rayName,
                    VFXColor: "green",
                    ceDesc: `Paralyized for up to a minute by ${aToken.name}'s ${rayName}, end of round DC ${SAVE_DC} CON save to end early`,
                    traceLvl: TL,
                    saveType: "con",
                    rounds: 10,
                    icon: "systems/dnd5e/icons/spells/beam-jade-2.jpg",
                    effectName: rayName,
                    changes: [
                        { key: `macro.CE`, mode: jez.CUSTOM, value: "Paralyzed", priority: 20 },
                        { key: `flags.midi-qol.OverTime`, mode: jez.MULTIPLY, value: overTime, priority: 20 },
                    ],
                }
                msg = await jez.fireRay(targetArray[i], aToken, options);
                break;
         /* Fear Ray. The target must succeed on a DC 13 Wisdom saving throw or be frightened for 1 minute. 
            The target can repeat the saving throw at the end of each of its turns, with disadvantage if 
            the spectator is visible to the target, ending the effect on itself on a success. */
            case 2:
                rayName = "Fear Ray"
                overTime = `turn=end,label=Save against Paralyzing Ray,saveDC=${SAVE_DC},saveAbility=con,saveRemove=true,saveMagic=true,rollType=save`
                options = {
                    RayName: rayName,
                    VFXColor: "yellow",
                    ceDesc: `Frightened by ${aToken.name}'s ${rayName}`,
                    traceLvl: TL,
                    saveType: "con",
                    rounds: 10,
                    icon: "systems/dnd5e/icons/spells/beam-jade-2.jpg",
                    effectName: rayName,
                    changes: [
                        { key: `macro.CE`, mode: jez.CUSTOM, value: "Frightened", priority: 20 },
                        { key: `flags.midi-qol.OverTime`, mode: jez.MULTIPLY, value: overTime, priority: 20 },
                    ],   
                }
                msg = await jez.fireRay(targetArray[i], aToken, options);
                break;
         /* Wounding Ray. The target must make a DC 13 Constitution saving throw, taking 16 (3d10) necrotic damage 
            on a failed save, or half as much damage on a successful one. */
            case 3:
                rayName = "Wounding Ray"
                options = {
                    RayName: rayName,
                    VFXColor: "green",
                    ceDesc: `${tToken.name} damaged by ${aToken.name}'s ${rayName}`,
                    traceLvl: TL,
                    saveType: "dex",
                    damageRoll: "3d10",
                    damageType: "necrotic",
                    effectName: false,
                    aItem: aItem
                }
                msg = await jez.fireRay(targetArray[i], aToken, options);
                break;
            /*case 4:
                rayName = "Paralyzing Ray"
                overTime = `turn=end,label=Save against Paralyzing Ray,saveDC=${SAVE_DC},saveAbility=con,saveRemove=true,saveMagic=true,rollType=save`
                options = {
                    RayName: rayName,
                    VFXColor: "rainbow01",
                    ceDesc: `Paralyized for up to a minute by ${aToken.name}'s ${rayName}, end of round DC ${SAVE_DC} CON save to end early`,
                    traceLvl: TL,
                    saveType: "con",
                    icon: "systems/dnd5e/icons/spells/beam-jade-2.jpg",
                    effectName: rayName,
                    changes: [
                        { key: `macro.CE`, mode: jez.CUSTOM, value: "Paralyzed", priority: 20 },
                        { key: `flags.midi-qol.OverTime`, mode: jez.MULTIPLY, value: overTime, priority: 20 },
                    ],
                    specDur: ["newDay", "longRest", "shortRest"],
                    rounds: 10,
                }
                msg = await jez.fireRay(targetArray[i], aToken, options);
                break;
            case 5:
                rayName = "Sleep Ray"
                options = {
                    RayName: rayName,
                    VFXColor: "purple",
                    ceDesc: `Unconscious for up to a minute from ${aToken.name}'s ${rayName}, ends early if damaged or awoken by another.`,
                    traceLvl: TL,
                    saveType: "con",
                    icon: "systems/dnd5e/icons/spells/beam-sky-2.jpg",
                    effectName: rayName,
                    changes: [
                        { key: `macro.CE`, mode: jez.CUSTOM, value: "Unconscious", priority: 20 },
                    ],
                    specDur: ["isDamaged", "newDay", "longRest", "shortRest"],
                    rounds: 10,
                }
                msg = await jez.fireRay(targetArray[i], aToken, options);
                break;*/
            default: return jez.badNews(`${TAG} Illegal ray value: ${i}`)
          }
        postResults(msg)
        await jez.wait(DELAY)
    }
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 3) jez.trace(`${TAG} More Detailed Trace Info.`)
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}