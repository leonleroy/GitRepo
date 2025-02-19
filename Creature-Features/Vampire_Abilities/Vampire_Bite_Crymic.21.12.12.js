
















async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
if(lastArg.hitTargets.length === 0) return {};
let tokenD = canvas.tokens.get(lastArg.tokenId);
let target = canvas.tokens.get(lastArg.hitTargets[0].id);
let itemD = await fromUuid(lastArg.itemUuid);
let gameRound = game.combat ? game.combat.round : 0;
let healType = "healing";
let damageType = "necrotic";
let damageTotal = lastArg.damageDetail.find(i=> i.type === damageType);
if(!damageTotal) return ui.notifications.error("Deal damage first");
let healAmount = Math.clamped(damageTotal.damage, 0, tokenD.actor.data.data.attributes.hp.max - tokenD.actor.data.data.attributes.hp.value);
await MidiQOL.applyTokenDamage([{damage: healAmount, type: healType}], healAmount, new Set([tokenD]), itemD, new Set());
let effectData = {
    label: itemD.name,
    icon: itemD.img,
    flags: { dae: { itemData: itemD.data, stackable: true, macroRepeat: "none", specialDuration: ["longRest"] } },
    origin: lastArg.uuid,
    disabled: false,
    duration: {seconds: 86400, hours: 24, startRound: gameRound, startTime: game.time.worldTime },
    changes: [{ key: "data.attributes.hp.max", mode: 2, value: -damageTotal.damage, priority: 20 }]
};
await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: [effectData] });
let healMessage = `<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">hits ${target.name} <span style="color:red">max hp -${damageTotal.damage}</span></div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div><div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${tokenD.id}">heals ${tokenD.name} <span style="color:green">+${healAmount}</span></div><img src="${tokenD.data.img}" width="30" height="30" style="border:0px"></div>`;
//await wait(400);
let chatMessage = await game.messages.get(args[0].itemCardId);
let content = await duplicate(chatMessage.data.content);
let searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
let replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${healMessage}`;
content = await content.replace(searchString, replaceString);
await chatMessage.update({ content: content });