// https://hackmd.io/@akrigline/ByHFgUZ6u/%2FojFSOsrNTySh9HbzTE3Orw
console.log(`
██████████████████████████████████████████
███▄─▄█▄─▄▄─█░▄▄░▄█▀▀▀▀▀██▄─▄███▄─▄█▄─▄─▀█
█─▄█─███─▄█▀██▀▄█▀█████████─██▀██─███─▄─▀█
▀▄▄▄▀▀▀▄▄▄▄▄▀▄▄▄▄▄▀▀▀▀▀▀▀▀▄▄▄▄▄▀▄▄▄▀▄▄▄▄▀▀`)

/*************************************************************************************
 * Register the module with Developer Mode
 *************************************************************************************/
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(jez.ID);
});

/*************************************************************************************
 * Create a Class for our Module to hold all my nifty functions
 *************************************************************************************/
class jez {
    static ID = 'jez-lib';
    static TEMPLATES = {
        TODOLIST: `modules/${this.ID}/templates/todo-list.hbs`
    }
    static contents() {
        let functions = `
  addMessage(chatMessage, msgParm) -- add text message to specified chat message.
  log(...parms) -- depending on developer mode debug flag writes messages to console.    
  postMessage(msgParm) -- post a new message to the game chat, optioanlly with parms.
  wait(ms) -- async call to waith for ms milliseconds`
        console.log("")
        console.log("Jez-lib includes a number of functions.")
        console.log(functions)
        console.log("")
    }

    /***************************************************************************************************
     * TRC
     *  
     * DEPRICATED 7/2022 -- Use trace instead
     * 
     * This is a variation on the log function that requires the first parameter to be an integer that
     * will be compared to the second parameter, presumably a global in the calling macro.  
     * 
     * jez.trc(1, trcLvl, "Post this message to the console", variable)
     ***************************************************************************************************/
    static trc(level, threshold, ...parms) {
        return  // Forced silence 11.17.22
        if (level > threshold) return false
        return jez.writeTrcLog(" T R C ", ...parms)
    }
    /***************************************************************************************************
     * Trace
     * 
     * This is a variation on the log function that requires the first parameter to be an integer that
     * will be compared to the second parameter, presumably a global in the calling macro.  
     *
     * Example 
     * const FUNCNAME = 'addCondition(effectName, targets, options)'
     * const FNAME = FUNCNAME.split("(")[0] 
     * ...
     * if (TL>2) jez.trace(`${FNAME} | Post this message to the console`, variable)
     ***************************************************************************************************/
    static trace(...parms) {
        return jez.writeTrcLog(" Trace ", ...parms)
    }
    /***************************************************************************************************
     * Log
     * 
     * Call the writeTrcLog function with prefix "jez-log" and all passed arguments
     * 
     * Ex: jez.log("Post this message to the console", variable)
     ***************************************************************************************************/
    static log(...parms) {
        return jez.writeTrcLog("jez-log", ...parms)
    }
    /***************************************************************************************************
     * Write Trace/Log to console
     * 
     * If passed an odd number of arguments, put the first on a line by itself in the log,
     * otherwise print them to the log seperated by a colon.  
     * 
     * If more than two arguments, add numbered continuation lines. 
     * 
     * Ex: jez.log("jez-log","Post this message to the console", variable)
     ***************************************************************************************************/
    static writeTrcLog(prefix, ...parms) {

        //if (game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID) === false) return (true)
        let numParms = parms.length;    // Number of parameters received
        let i = 0;                      // Loop counter
        let lines = 1;                  // Line counter 

        if (numParms % 2) {  // Odd number of arguments
            console.log(prefix, '|', parms[i++])
            for (i; i < numParms; i = i + 2) console.log(prefix, '|', ` (${lines++})`, parms[i], ":", parms[i + 1]);
        } else {            // Even number of arguments
            console.log(prefix, '|', parms[i], ":", parms[i + 1]);
            i = 2;
            for (i; i < numParms; i = i + 2) console.log(prefix, '|', ` (${lines++})`, parms[i], ":", parms[i + 1]);
        }
        return true
    }

    /***************************************************************************************************
     * Post a new chat message -- msgParm should be a string for a simple message or an object with 
     * some or all of these fields set below for the chat object.  
     * 
     * Example Calls:
     *  jez.postMessage("Hi there!")
     *  jez.postMessage({color:"purple", fSize:18, msg:"Bazinga", title:"Sheldon says..." })
     *  jez.PostMessage({color:"purple", fSize:18, msg:"Bazinga", title:"Sheldon says...", token:aToken})
     ***************************************************************************************************/
    static async postMessage(msgParm) {
        const FUNCNAME = "postMessage(msgParm)";
        // jez.log(`--- Starting ${FUNCNAME} ---`,msgParm);
        let typeOfParm = typeof (msgParm)
        let chatCard = msgParm
        let speaker = null              // The speaking Token
        if (typeOfParm === "object") {
            if (msgParm?.token) {       // If a speaking token is defined it must be a Token5e
                // jez.log("msgParm.token?.constructor.name", msgParm.token?.constructor.name)
                if (msgParm.token?.constructor.name !== "Token5e") {
                    let msg = `Coding error. Speaking Token (${msgParm?.token?.name}) is a 
                               ${msgParm.token?.constructor.name} must be a Token5e`
                    return jez.badNews(msg, "e")
                }
            }
            const CHAT = {
                title: msgParm?.title || "Generic Chat Message",
                fSize: msgParm?.fSize || 12,
                color: msgParm?.color || "black",
                icon: msgParm?.icon || "icons/vtt-512.png",
                msg: msgParm?.msg || "Maybe say something useful...",
                token: msgParm?.token || null       // Token5e that is speaking
            }
            speaker = CHAT.token
            // jez.log("speaker", speaker)
            chatCard = `
            <div class="dnd5e chat-card item-card midi-qol-item-card">
                <header class="card-header flexrow">
                    <img src="${CHAT.icon}" title="${CHAT.title}" width="36" height="36">
                    <h3 class="item-name">${CHAT.title}</h3>
                </header>
                <div class="card-buttons">
                    <p style="color:${CHAT.color};font-size:${CHAT.fSize}px">
                        ${CHAT.msg}</p>
                </div>
            </div>`
        }
        //await ChatMessage.create({ content: chatCard });
        const RC = await ChatMessage.create({
            //speaker: ChatMessage.getSpeaker(controlledToken),
            speaker: speaker ? ChatMessage.getSpeaker(speaker) : null,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            content: chatCard
        });

        await jez.wait(100);
        await ui.chat.scrollBottom();
        // jez.log(`-------------- Finished ${FUNCNAME}-----------`);
        return (RC);
    }

    /***************************************************************************************************
     * addMessage to specified chatMessage.  This presumes it is a Midi-QoL style HTML chat card.
     * chatMessage frequently obtained like so:
     *  let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
     *  
     * Example Calls:
     *  jez.addMessage(chatMessage, "Hi there!")
     *  jez.addMessage(chatMessage,{color:"purple",fSize:14,msg:"Bazinga, Sheldon Wins!",tag:"saves"})
     * 
     * If msgParm is provided as an object
     * @typedef  {Object} msgParm
     * @property {number} fSize   - Font Size, 12 matches typical Foundry font
     * @property {string} color   - Name or hex code, https://www.w3schools.com/tags/ref_colornames.asp
     * @property {string} msg     - Actual text to be posted into chat
     * @property {string} tag     - Tag mapping into HTML from: saves, attack, damage, hits, other   
     ***************************************************************************************************/
    static async addMessage(chatMessage, msgParm) {
        const FUNCNAME = "postChatMessage(chatMessage, msgParm)";
        // jez.log(`-------------- Starting ${FUNCNAME} -----------`);
        const allowedTags = ["saves", "attack", "damage", "hits", "other"]
        //-----------------------------------------------------------------------------------------------
        // chatMessage must be a ChatMessage object
        //
        if (chatMessage?.constructor.name !== "ChatMessage") {
            let errMsg = `Coding error: message (${chatMessage}) is a ${chatMessage?.constructor.name},
                must be ChatMessage.`
            return jez.badNews(errMsg, "e")
        }
        //-----------------------------------------------------------------------------------------------
        // chatMsg will be a simple string unless msgParm is an object
        //
        let chatTag = "saves"   // Default value
        let chatMsg = msgParm;
        if (typeof (msgParm) === "object") {
            const CHAT = {
                fSize: msgParm?.fSize || 14,
                color: msgParm?.color || "purple",
                msg: msgParm?.msg || "Maybe say something useful...",
                tag: msgParm?.tag || "saves-display"
            }
            chatMsg = `<div class="card-buttons"><p style="color:${CHAT.color};font-size:${CHAT.fSize}px">${CHAT.msg}</p></div>`
            if (!allowedTags.includes(CHAT.tag)) {
                return jez.badNews(`Coding error. ${CHAT.tag} is not a defined anchor word`, "e")
            }
            chatTag = CHAT.tag
        }
        // jez.log("chatMsg", chatMsg)
        //-----------------------------------------------------------------------------------------------
        // Put correct suffix on the chatTag
        //
        switch (chatTag) {
            case "saves":
            case "hits": chatTag += "-display"; break;
            case "attack":
            case "damage":
            case "other": chatTag += "-roll"; break;
        }
        // jez.log("chatTag", chatTag)
        //-----------------------------------------------------------------------------------------------
        // Add our new text to the HTML using a RegEx which needs to be built
        //
        const searchString = `<div class="end-midi-qol-${chatTag}">`;
        const regExp = new RegExp(searchString, "g");
        const replaceString = `<div class="end-midi-qol-${chatTag}">${chatMsg}`;
        let content = await duplicate(chatMessage.data.content);
        content = await content.replace(regExp, replaceString);
        await chatMessage.update({ content: content });

        await jez.wait(100);
        await ui.chat.scrollBottom();
        // jez.log(`-------------- Finished ${FUNCNAME}-----------`);
        return;
    }
    /***************************************************************************************************
     * getRange
     * 
     * Obtain the range defined on specified item as long as the units are in allowed units
     ***************************************************************************************************/
    static getRange(itemD, allowedUnits) {
        let range = itemD.data.range?.value;
        let unit = itemD.data.range?.units;
        // jez.log("range", range, "unit", unit);
        if (!allowedUnits.includes(unit)) {
            let msg = `Unit ${unit} not in allowed units`
            // jez.log(msg, allowedUnits);
            return jez.badNews(msg, 'w')
        }
        return (range);
    }
    /***************************************************************************************************
     * inRange
     *
     * Check to see if two entities are in range with 4 foot added
     * to allow for diagonal measurement to "corner" adjacancies
     ***************************************************************************************************/
    static inRange(token1, token2, maxRange) {
        //----------------------------------------------------------------------------------------------
        // Tokens need to be Token5e not TokenDocument5e, so check and convert if needed.
        //
        let t1 = {}
        if (token1.constructor.name === "TokenDocument5e") t1 = token1._object
        else t1 = token1
        let t2 = {}
        if (token2.constructor.name === "TokenDocument5e") t2 = token2._object
        else t2 = token2
        //----------------------------------------------------------------------------------------------
        // Determine the 5e distance between tokens
        //
        let distance = jez.getDistance5e(t1, t2)
        //----------------------------------------------------------------------------------------------
        // Return result 
        //
        if (distance > maxRange) {
            let msg = `jez.inRange: Distance between ${token1.name} and ${token2.name} is ${distance}`
            // jez.log(msg);
            return (false);
        }
        return (true);
    }
    /***************************************************************************************************
     * getDistance in the wierd D&D 5e alternate world where diagonals are 5-10-5 distances
     * 
     * Logic taken from Vance Cole's macro: https://github.com/VanceCole/macros/blob/master/distance.js
     *
     * Return distance between two placeables
     ***************************************************************************************************/
    static getDistance5e(one, two) {
        let gs = canvas.grid.size;
        // let d1 = Math.abs((one.x - two.x) / gs); // This gets middle of top left square of token
        // let d2 = Math.abs((one.y - two.y) / gs);
        let d1 = Math.abs((one.center.x - two.center.x) / gs); // This gets middle (center) of token
        let d2 = Math.abs((one.center.y - two.center.y) / gs);
        let maxDim = Math.max(d1, d2);
        let minDim = Math.min(d1, d2);
        let dist = (maxDim + Math.floor(minDim / 2)) * canvas.scene.data.gridDistance;
        return dist;
    }
    /***************************************************************************************************
     * tokensInRange
     * 
     * Function that returns an array of the tokens that are within a specified range -or- null if no
     * tokens are in range from the specified token. Exclude the origin token.
     ***************************************************************************************************/
    static async tokensInRange(sel, range) {
        let inRangeTokens = [];
        let toFarCnt, inRangeCnt = 0
        let toFar = ""
        let fudge = 4 //fudge factor to allow diagonals to work better
        //----------------------------------------------------------------------------------------------
        // Check the types of parameters passed 
        //
        if (sel?.constructor.name !== "Token5e")
            return jez.badNews(`Selection (${sel}) is a ${sel?.constructor.name} must be a Token5e`, "e")
        if (typeof (range) !== "number")
            return jez.badNews(`Range (${range}) is a ${typeof (range)} must be a number`, "e")
        //----------------------------------------------------------------------------------------------
        // Perform the interesting bits
        //
        canvas.tokens.placeables.forEach(token => {
            let d = canvas.grid.measureDistance(sel, token);
            d = d.toFixed(1);
            if (sel === token) { // Skip the origin token
                // jez.log(` Skipping the origin token, ${sel.name}`, "sel", sel, "token", token)
            } else {
                // jez.log(` Considering ${token.name} at ${d} distance`);
                if (d > range + fudge) {
                    // jez.log(`  ${token.name} is too far away`);
                    if (toFarCnt++) { toFar += ", " };
                    toFar += token.name;
                    // jez.log(`  To Far #${toFarCnt} ${token.name} is ${d} feet. To Fars: ${toFar}`);
                } else {
                    // jez.log(`  ${token.name} is in range`);
                    inRangeTokens.push(token);
                    inRangeCnt++;
                    // jez.log(`  In Range #${inRangeCnt} ${token.name} is ${d} feet. In Ranges:`, inRangeTokens);
                }
            }
        });
        if (!inRangeCnt) return (null)
        return (inRangeTokens)
    }
    /***************************************************************************************
     * Create and process check box dialog, passing array onto specified callback function
     * 11/09/22 Added code to allow this function to be await'ed (synchronicity!)
     * 
     * Font Awesome Icons: https://fontawesome.com/icons
     * 
     * const queryTitle = "Select Item in Question"
     * const queryText = "Pick one from following list"
     * pickCallBack = call back function
     * queryOptions array of strings to be offered as choices, perhaps pre-sorted 
     * 
     * Sample Call:
     *   const queryTitle = "Select Item in Question"
     *   const queryText = "Pick one from the list" 
     *   pickCheckListArray(queryTitle, queryText, pickRadioCallBack, actorItems.sort());
     ***************************************************************************************/
    static async pickCheckListArray(queryTitle, queryText, pickCallBack, queryOptions) {
        const FUNCNAME = "jez.pickFromList(queryTitle, queryText, ...queryOptions)";
        // jez.log("---------Starting ---${FUNCNAME}-------------------------------------------",
        //     `queryTitle`, queryTitle,
        //     `queryText`, queryText,
        //     `pickCallBack`, pickCallBack,
        //     `queryOptions`, queryOptions);
        let msg = ""
        if (pickCallBack && typeof (pickCallBack) != "function")
            return jez.badNews(`pickCallBack invalid pickCallBack, ${typeof (pickCallBack)}`, 'e')
        if (!queryTitle || !queryText || !queryOptions) {
            msg = `pickFromList arguments should be (queryTitle, queryText, pickCallBack, [queryOptions]),
but yours are: ${queryTitle}, ${queryText}, ${pickCallBack}, ${queryOptions}`;
            return jez.badNews(msg, "e")
        }
        let template = `
<div>
<label>${queryText}</label>
<div class="form-group" style="font-size: 14px; padding: 5px; border: 2px solid silver; margin: 5px;">
`   // Back tick on its on line to make the console output better formatted
        for (let option of queryOptions) {
            template += `<input type="checkbox" id="${option}" name="selectedLine" value="${option}"> <label for="${option}">${option}</label><br>
`   // Back tick on its on line to make the console output better formatted
        }
        template += `</div></div>`
        let selections = []
        //------------------------------------------------------------------------------------
        //
        const myPromise = await new Promise((myResolve, myReject) => {  // Added to allow synchronicity
            new Dialog({
                title: queryTitle,
                content: template,
                buttons: {
                    ok: {
                        icon: '<i class="fas fa-check"></i>',
                        label: 'Selected Only',
                        callback: async (html) => {
                            html.find("[name=selectedLine]:checked").each(function () {
                                selections.push($(this).val())
                            })
                            if (pickCallBack) await pickCallBack(selections)  // Changed for synchronicity
                            // myResolve("Picked ok")          // Added for synchronicity
                            myResolve(selections)          // Added for synchronicity
                        },
                    },
                    all: {
                        icon: '<i class="fas fa-check-double"></i>',
                        label: 'All Displayed',
                        callback: async (html) => {
                            if (pickCallBack) await pickCallBack(queryOptions)// Changed for synchronicity
                            // myResolve("Picked all")         // Added for synchronicity
                            myResolve(queryOptions)         // Added for synchronicity
                        },
                    },
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: 'Cancel',
                        callback: async (html) => {
                            if (pickCallBack) await pickCallBack(null)        // Changed for synchronicity
                            // myResolve("Picked cancel")      // Added for synchronicity
                            myResolve(null)      // Added for synchronicity
                        },
                    },
                },
                default: 'cancel',
            }).render(true)
        })                                                  // Added for synchronicity
        return (myPromise);                                 // changed for synchronicity
    }
    /***************************************************************************************
     * Create and process selection dialog, passing it onto specified callback function
     * 
     * const queryTitle = "Select Item in Question"
     * const queryText = "Pick one from drop down list"
     * pickCallBack = call back function
     * queryOptions array of strings to be offered as choices
     ***************************************************************************************/
    static async pickFromListArray(queryTitle, queryText, pickCallBack, queryOptions) {
        // const FUNCNAME = "jez.pickFromList(queryTitle, queryText, ...queryOptions)";
        // let msg = ""
        if (typeof (pickCallBack) != "function")
            return jez.badNews(`pickFromList invalid pickCallBack, ${typeof (pickCallBack)}`, 'e')
        if (!queryTitle || !queryText || !queryOptions)
            return jez.badNews(`pickFromList arguments should be (queryTitle, queryText, pickCallBack, [queryOptions]),
               but yours are: ${queryTitle}, ${queryText}, ${pickCallBack}, ${queryOptions}`, 'e')

        let template = `
    <div>
    <div class="form-group">
        <label>${queryText}</label>
        <select id="selectedOption">`
        for (let option of queryOptions) {
            template += `<option value="${option}">${option}</option>`
        }
        template += `</select>
    </div></div>`

        new Dialog({
            title: queryTitle,
            content: template,
            buttons: {
                ok: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'OK',
                    callback: async (html) => {
                        const selectedOption = html.find('#selectedOption')[0].value
                        // jez.log('selected option', selectedOption)
                        pickCallBack(selectedOption)
                    },
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancel',
                    callback: async (html) => {
                        // jez.log('canceled')
                        pickCallBack(null)
                    },
                },
            },
            default: 'cancel',
        }).render(true)

        // jez.log(`--------Finished ${FUNCNAME}----------------------------------------`)
        return;
    }
    /***************************************************************************************
     * Create and process radio button dialog, passing it onto specified callback function
     * 11/28/22 Added code to allow this function to be await'ed (synchronicity!)
     * 
     * Returns the selection
     * 
     * const queryTitle = "Select Item in Question"
     * const queryText = "Pick one from following list"
     * pickCallBack = call back function
     * queryOptions array of strings to be offered as choices, perhaps pre-sorted
     * 
     * Sample Call:
     *   const queryTitle = "Select Item in Question"
     *   const queryText = "Pick one from the list" 
     *   pickRadioListArray(queryTitle, queryText, pickRadioCallBack, actorItems.sort());
     ***************************************************************************************/
    static async pickRadioListArray(queryTitle, queryText, pickCallBack, queryOptions) {
        // async function pickRadioListArray(queryTitle, queryText, pickCallBack, queryOptions) {
        const FUNCNAME = "jez.pickFromList(queryTitle, queryText, ...queryOptions)";
        // jez.log("---------Starting ---${FUNCNAME}-------------------------------------------",
        // `queryTitle`, queryTitle,
        // `queryText`, queryText,
        // `pickCallBack`, pickCallBack,
        // `queryOptions`, queryOptions);
        let msg = ""
        if (typeof (pickCallBack) != "function")
            return jez.badNews(`pickFromList invalid pickCallBack, it is a ${typeof (pickCallBack)}`, 'e')
        if (!queryTitle || !queryText || !queryOptions)
            return jez.badNews(`pickFromList args should be (queryTitle, queryText, pickCallBack, [queryOptions]),
               mot: ${queryTitle}, ${queryText}, ${pickCallBack}, ${queryOptions}`, 'e')

        let template = `
        <div>
        <label>${queryText}</label>
        <div class="form-group" style="font-size: 14px; padding: 5px; border: 2px solid silver; margin: 5px;">
        `   // Back tick on its on line to make the console output better formatted
        for (let option of queryOptions) {
            template += `<input type="radio" id="${option}" name="selectedLine" value="${option}"> <label for="${option}">${option}</label><br>
        `   // Back tick on its on line to make the console output better formatted
        }
        template += `</div></div>`
        // jez.log(template)
        //------------------------------------------------------------------------------------
        //
        const myPromise = await new Promise((myResolve, myReject) => {  // Added to allow synchronicity
            new Dialog({
                title: queryTitle,
                content: template,
                buttons: {
                    ok: {
                        icon: '<i class="fas fa-check"></i>',
                        label: 'OK',
                        callback: async (html) => {
                            // jez.log("html contents", html)
                            const SELECTED_OPTION = html.find("[name=selectedLine]:checked").val();
                            // jez.log("Radio Button Selection", SELECTED_OPTION)
                            // jez.log('selected option', SELECTED_OPTION)
                            await pickCallBack(SELECTED_OPTION) // Changed for synchronicity
                            myResolve(SELECTED_OPTION)              // Added for synchronicity
                        },
                    },
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: 'Cancel',
                        callback: async (html) => {
                            await pickCallBack(null)        // Changed for synchronicity
                            myResolve(null)      // Added for synchronicity
                        },
                    },
                },
                default: 'cancel',
            }).render(true)
        })                                                  // Added for synchronicity
        return (myPromise);                                 // changed for synchronicity
    }
    /***************************************************************************************************
     * getSize of passed token and return an object with information about that token's size.   
     * If a problem occurs getting the size, false will be returned.  
     *  
     * Example Call:
     *  let sizeObj = jez.getSize(tToken)
     * 
     * The returned object will be composed of:
     * @typedef  {Object} CreatureSizes
     * @property {integer} value  - Numeric value of size: 1 is tiny to 6 gargantuan
     * @property {string}  str    - Short form for size generally used in FoundryVTT data 
     * @property {string}  string - Spelled out size all lower case
     * @property {string}  String - Spelled out size with the first letter capitalized   
     ***************************************************************************************************/
    static async getSize(token1) {
        class CreatureSizes {
            constructor(size) {
                this.str = size;
                switch (size) {
                    case "tiny": this.value = 1; this.string = "tiny"; this.String = "Tiny"; break;
                    case "sm": this.value = 2; this.string = "small"; this.String = "Small"; break;
                    case "med": this.value = 3; this.string = "medium"; this.String = "Medium"; break;
                    case "lg": this.value = 4; this.string = "large"; this.String = "Large"; break;
                    case "huge": this.value = 5; this.string = "huge"; this.String = "Huge"; break;
                    case "grg": this.value = 6; this.string = "gargantuan"; this.String = "Gargantuan"; break;
                    default: this.value = 0;  // Error Condition
                }
            }
        }
        let token1SizeString = token1.document._actor.data.data.traits.size;
        let token1SizeObject = new CreatureSizes(token1SizeString);
        let token1Size = token1SizeObject.value;  // Returns 0 on failure to match size string
        if (!token1Size) jez.badNews(`Size of ${token1.name}, ${token1SizeString} failed to parse.`, 'e')
        return (token1SizeObject)
    }
    /*************************************************************************************
     * wait for parm milliseconds.
     * 
     * ex: await jez.wait(1000) // Wait for 1 second
     *************************************************************************************/
    static async wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
    /***************************************************************************************************
     * Return a random, darkish color name (string)
     ***************************************************************************************************/
    // COOL-THING: Pick a random (dark) color name 
    static randomDarkColor() {
        let colorArray = ["Blue", "BlueViolet", "Brown", "Crimson", "DarkBlue", "DarkMagenta", "DarkRed",
            "FireBrick", "ForestGreen", "Maroon", "MidnightBlue", "Olive", "Purple", "RebeccaPurple",
            "RoyalBlue", "SaddleBrown", "SlateBlue", "SteelBlue", "Teal"];
        // Returns a random integer from 0 to (colorArray.length - 1):
        let index = Math.floor(Math.random() * colorArray.length);
        return (colorArray[index])
    }

    /***************************************************************************************************
     * Get token5e object based on ID passed
     ***************************************************************************************************/
    static getTokenById(tokenId) {
        if ((typeof (tokenId) != "string") || (tokenId.length !== 16))
            jez.badNews(`Parameter jez.getTokenById(tokenId) is not an ID: ${tokenId}`, 'e')
        return (canvas.tokens.placeables.find(ef => ef.id === tokenId));
    }
    /***************************************************************************************************
    * Return casting stat string based on input: Token5e, TokenID, Actor5e
    ***************************************************************************************************/
    static getCastStat(subject) {
        let actor5e = null
        if (typeof (subject) === "object") { // Hopefully we have a Token5e or Actor5e
            if (subject.constructor.name === "Token5e") actor5e = subject.actor
            else if (subject.constructor.name === "Actor5e") actor5e = subject
            else return jez.badNews(`Subject is type '${typeof (subject)}' must be Token5e or Actor5e`, 'e')
        } else if ((typeof (subject) === "string") && (subject.length === 16)) actor5e = jez.getTokenById(subject).actor
        else {
            let msg = `Subject in jez.getCastStat(subject) is not a Token5e, Actor5e, or Token.id: ${subject}`
            return jez.badNews(msg, 'e')
        }
        return (actor5e.data.data.attributes.spellcasting)
    }
    /***************************************************************************************************
     * Return spell save DC string based on input: Token5e, TokenID, Actor5e
     ***************************************************************************************************/
    static getSpellDC(subject) {
        let actor5e = null
        if (typeof (subject) === "object") { // Hopefully we have a Token5e or Actor5e
            if (subject.constructor.name === "Token5e") actor5e = subject.actor
            else if (subject.constructor.name === "Actor5e") actor5e = subject
            else return jez.badNews(`jez.getCastStat(subject) subject type '${typeof (subject)}' not Token5e or Actor5e`, 'e')
        }
        else if ((typeof (subject) === "string") && (subject.length === 16)) actor5e = jez.getTokenById(subject).actor
        else return jez.badNews(`jez.getCastStat(subject) parm is not a Token5e, Actor5e, or Token.id: ${subject}`, 'e')
        return (actor5e.data.data.attributes.spelldc)
    }
    /***************************************************************************************************
    * Return casting stat mod integer based on input: Token5e, TokenID, Actor5e and stat string
    ***************************************************************************************************/
    static getStatMod(subject, statParm) {
        let actor5e = null
        let stat = ""
        const STAT_ARRAY = ["str", "dex", "con", "int", "wis", "cha"]   // Allowed stat strings
        //----------------------------------------------------------------------------------------------
        // Validate the subject parameter, stashing it into "actor5e"
        //
        if (typeof (subject) === "object") { // Hopefully we have a Token5e or Actor5e
            if (subject.constructor.name === "Token5e") actor5e = subject.actor
            else if (subject.constructor.name === "Actor5e") actor5e = subject
            else return jez.badNews(`jez.getStatMod(...) parm is type '${typeof (subject)}' must be a Token5e or Actor5e`, 'e')
        } else if ((typeof (subject) === "string") && (subject.length === 16)) actor5e = jez.getTokenById(subject).actor
        else {
            let msg = `getStatMod(subject,statParm) subject parm is not a Token5e, Actor5e, or Token.id: ${subject}`
            return (msg, 'e')
        }
        //----------------------------------------------------------------------------------------------
        // Validate the statParm parameter and stash it into "stat"
        //
        if ((typeof (statParm) !== "string") || (statParm.length !== 3))
            return jez.badNews(`jez.getStatMod(subject, statParm) statParm is invalid: ${statParm}`, 'e')
        stat = statParm.toLowerCase();
        if (!STAT_ARRAY.includes(stat))
            return jez.badNews(`jez.getStatMod(subject, statParm) statParm is invalid: ${statParm}`, 'e')
        //----------------------------------------------------------------------------------------------
        // Fetch and return that modifier
        //
        return (actor5e.data.data.abilities[stat].mod)
    }
    /***************************************************************************************************
    * Return casting modifier integer based on input: Token5e, TokenID, Actor5e
    ***************************************************************************************************/
    static getCastMod(subject) {
        let stat = jez.getCastStat(subject)
        if (!stat) return (false)
        return (jez.getStatMod(subject, stat))
    }
    /***************************************************************************************************
    * Return proficency modifier
    ***************************************************************************************************/
    static getProfMod(subject) {
        let actor5e = null
        if (typeof (subject) === "object") { // Hopefully we have a Token5e or Actor5e
            if (subject.constructor.name === "Token5e") actor5e = subject.actor
            else if (subject.constructor.name === "Actor5e") actor5e = subject
            else return jez.badNews(`jez.getProfMod(subject) parm is '${typeof (subject)}' must be Token5e or Actor5e`, 'e')
        } else if ((typeof (subject) === "string") && (subject.length === 16)) actor5e = jez.getTokenById(subject).actor
        else return jez.badNews(`jez.getProfMod(subject) parm is not Token5e, Actor5e, or Token.id: ${subject}`, 'e')
        return (actor5e.data.data.attributes.prof)
    }
    /***************************************************************************************************
     * Obtain and return the character level of the passed token, actor or token.id
     * 
     * From crymic's viscious mockery spell:
     *  let getClass = Object.keys(aActor.classes);
     *  let level = aActor.classes[getClass].data.data.levels;
     * Maybe that is a cool way to do the same thing?
     ***************************************************************************************************/
    static getCharLevel(subject) {
        let trcLvl = 0
        //----------------------------------------------------------------------------------------------
        // Convert the passed parameter to Actor5e
        //
        let actor5e = null
        if (typeof (subject) === "object") { // Hopefully we have a Token5e or Actor5e
            if (subject.constructor.name === "Token5e") actor5e = subject.actor
            else if (subject.constructor.name === "Actor5e") actor5e = subject
            else return jez.badNews(`jez.getCharLevel(subject) parm is type '${typeof (subject)}' not Token5e or Actor5e`, 'e')
        }
        else if ((typeof (subject) === "string") && (subject.length === 16)) actor5e = jez.getTokenById(subject).actor
        else return jez.badNews(`Parameter passed to jez.getCharacterLevel(subject) parm is not Token5e, Actor5e, or Token.id: ${subject}`, 'e')
        //----------------------------------------------------------------------------------------------
        // Find the Actor5e's character level.
        //
        // actor.data.data.classes -- Deprecated 9.x
        // actor.data.document?._classes -- as of 9.x
        //
        let charLevel = 0
        // PC's can have multiple classes, add them all up
        jez.trc(3, trcLvl, "*** actor5e.data.document", actor5e.data.document)
        jez.trc(3, trcLvl, "*** actor5e.data.document?._classes", actor5e.data.document?._classes)
        if (actor5e.data.document?._classes) {
            jez.trc(3, trcLvl, "==> Found data in actor5e.data.document?._classes", actor5e.data.document?._classes)
            for (const CLASS in actor5e.data.document?._classes) {
                jez.trc(4, trcLvl, "Type of levels", jez.typeOf(actor5e.data.document._classes?.[CLASS]?.data?.data?.levels))
                let level = parseInt(actor5e.data.document._classes?.[CLASS]?.data?.data?.levels)
                jez.trc(4, trcLvl, "level", level)
                charLevel += level
            }
        }
        else {
            jez.trc(0, trcLvl, "==> Trying for classes actor5e.classes", actor5e.classes)
            for (const CLASS in actor5e.classes) {
                jez.trc(4, trcLvl, "Type of levels", jez.typeOf(actor5e.classes?.[CLASS]?.data?.data?.levels))
                let level = parseInt(actor5e.classes?.[CLASS]?.data?.data?.levels)
                jez.trc(4, trcLvl, "level", level)
                charLevel += level
            }
        }
        // NPC's don't have classes, use CR instead
        if (!charLevel) charLevel = actor5e.data.data.details.cr
        return (charLevel)
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Obtain and return the character class level of the passed token, actor or token.id.
     * 
     * className should be a string such as: wizard, druid, etc (case insensitive)
     * 
     * If the subject is an NPC the subject's level will be returned on the assumption that NPCs are 
     * pure characters of the named class. 
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static getClassLevel(subject, className, options = {}) {
        const FUNCNAME = "getClassLevel(subject, className, options={})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `jez.${FNAME} |`
        const TL = options.traceLvl ?? 0
        if (TL > 0) jez.trace(`${TAG} --- Starting ---`);
        if (TL > 1) jez.trace(`${TAG} --- Starting with ---`,
            'subject', subject, 'className', className, 'options', options);
        //----------------------------------------------------------------------------------------------
        // Convert the passed parameter to Actor5e
        //
        let actor5e = null
        if (typeof (subject) === "object") { // Hopefully we have a Token5e or Actor5e
            if (subject.constructor.name === "Token5e") actor5e = subject.actor
            else if (subject.constructor.name === "Actor5e") actor5e = subject
            else return jez.badNews(`jez.getClassLevel(...) subject received '${typeof (subject)}' not 
            Token5e or Actor5e`, 'e')
        }
        else if ((typeof (subject) === "string") && (subject.length === 16)) actor5e = jez.getTokenById(subject).actor
        else return jez.badNews(`Parameter passed to jez.getCharacterLevel(subject) parm is not 
            Token5e, Actor5e, or Token.id: ${subject}`, 'e')
        //----------------------------------------------------------------------------------------------
        // Find the Actor5e's character level.
        //
        // actor.data.data.classes -- Deprecated 9.x
        // actor.data.document?._classes -- as of 9.x
        //
        let charLevel = 0
        let targetClassName = className.toLowerCase()
        let classLevel = 0
        // PC's can have multiple classes, add them all up
        if (TL > 1) jez.trace(`${TAG} *** actor5e.data.document`, actor5e.data.document)
        if (TL > 1) jez.trace(`${TAG} *** actor5e.data.document?._classes`, actor5e.data.document?._classes)
        if (actor5e.data.document?._classes) {
            if (TL > 1) jez.trace(`${TAG} ==> Found data in actor5e.data.document?._classes`, actor5e.data.document?._classes)
            for (const CLASS in actor5e.data.document?._classes) {
                let level = parseInt(actor5e.data.document._classes?.[CLASS]?.data?.data?.levels)
                if (TL > 2) jez.trace(`${TAG} Class: ${CLASS} Level: ${level}`)
                if (CLASS === targetClassName) classLevel += level
                charLevel += level
            }
        }
        else {
            if (TL > 0) jez.trace(`${TAG} ==> Trying for classes actor5e.classes`, actor5e.classes)
            for (const CLASS in actor5e.classes) {
                let level = parseInt(actor5e.classes?.[CLASS]?.data?.data?.levels)
                if (TL > 2) jez.trace(`${TAG} Class: ${CLASS} Level: ${level}`)
                if (CLASS === targetClassName) classLevel += level
                charLevel += level
            }
        }
        // NPC's don't have classes, use CR instead (and hope they are pure classes)
        if (!charLevel) {
            charLevel = actor5e.data.data.details.cr
            classLevel = charLevel
        }
        return (classLevel)
    }



    /***************************************************************************************
     * Function to delete all copies of a named item of a given type from actor
     *
     * Parameters
     *  - itemName: A string naming the item to be found in actor's inventory
     *  - subject: actor, token, or token Id to be searched
     *  - type: type of item to be deleted, e.g. spell, weapon 
     ***************************************************************************************/
    static async deleteItems(itemName, type, subject) {
        let itemFound = null
        let message = ""
        let actor5e = null
        //----------------------------------------------------------------------------------------------
        // Validate the subject parameter, stashing it into "actor5e" variable
        //
        if (typeof (subject) === "object") {                   // Hopefully we have a Token5e or Actor5e
            if (subject.constructor.name === "Token5e") actor5e = subject.actor
            else {
                if (subject.constructor.name === "Actor5e") actor5e = subject
                else {
                    message = `Object passed to jez.deleteItems(...) is type 
                        '${typeof (subject)}' must be a Token5e or Actor5e`
                    return jez.badNews(message, "e")
                }
            }
        } else {
            if ((typeof (subject) === "string") && (subject.length === 16))
                actor5e = jez.getTokenById(subject).actor
            else {
                message = `Subject parm passed to jez.deleteItems(...) is not a Token5e, 
                    Actor5e, or Token.id: ${subject}`
                return jez.badNews(message, "e")
            }
        }
        //----------------------------------------------------------------------------------------------
        // Validate that Type is a string.
        //
        if (typeof (type) != "string") {
            message = `Type parm passed to jez.deleteItems(...) is '${typeof (type)}'.  It
                must be a string identifying a FoundryVTT item type (e.g. spell, weapon).`
            return jez.badNews(message, "e")
        }
        //----------------------------------------------------------------------------------------------
        // Look for matches and delete them.  Generating a message for each deletion
        //
        while (itemFound = actor5e.items.find(item => item.data.name === itemName &&
            item.type === type)) {
            await itemFound.delete();
            message = `Deleted ${type}: "${itemName}"`      // Set notification message
            jez.badNews(message, "i");
        }
    }
    /***************************************************************************************************
     * Define static constants for use by other functions.  They are accessed like..
     * 
     * console.log(jez.ADD + jez.OVERRIDE) // 7
     ***************************************************************************************************/
    static get CUSTOM() { return 0 }
    static get MULTIPLY() { return 1 }
    static get ADD() { return 2 }
    static get DOWNGRADE() { return 3 }
    static get UPGRADE() { return 4 }
    static get OVERRIDE() { return 5 }
    static get DAEFLAG_FAMILIAR_NAME() { return "familiar_name" }
    static get ACTOR_UPDATE_MACRO() { return "ActorUpdate" }
    static get TOKEN_REFRESH_MACRO() { return "TokenRefresh" }
    static get UPDATE_EMBEDDED_MACRO() { return "UpdateEmbeddedDocuments" }
    static get CREATE_EMBEDDED_MACRO() { return "CreateEmbeddedDocuments" }
    static get DELETE_EMBEDDED_MACRO() { return "DeleteEmbeddedDocuments" }
    static get DELETE_EFFECT_MACRO() { return "DeleteEffect" }
    static get GRAPPLE_ESCAPE_MACRO() { return "GrappleEscape" }
    /***************************************************************************************************
     * Set the Familiar name into the DAE Flag
     ***************************************************************************************************/
    static async familiarNameSet(actor5e, name) {
        return (await DAE.setFlag(actor5e, jez.DAEFLAG_FAMILIAR_NAME, name));
    }
    /***************************************************************************************************
     * Get the Familiar name from the DAE Flag, return empty string if not found
     ***************************************************************************************************/
    static async familiarNameGet(actor5e) {
        let currentName = await DAE.getFlag(actor5e, jez.DAEFLAG_FAMILIAR_NAME);
        // jez.log("currentName", currentName)
        if (!currentName) currentName = ""
        return (currentName)
    }
    /***************************************************************************************************
     * Get the Familiar name from the DAE Flag, return empty string if not found
     ***************************************************************************************************/
    static async familiarNameUnset(actor5e) {
        return (await DAE.unsetFlag(actor5e, jez.DAEFLAG_FAMILIAR_NAME));
    }
    /***************************************************************************************************
     * Retrieve and return the spell school string formatted for jb2a from the passed item or false if 
     * none found.
     ***************************************************************************************************/
    static getSpellSchool(item) {
        let school = item?.data?.school
        if (!school) return (false)
        switch (school) {
            case "abj": school = "abjuration"; break
            case "con": school = "conjuration"; break
            case "div": school = "divination"; break
            case "enc": school = "enchantment"; break
            case "evo": school = "evocation"; break
            case "ill": school = "illusion"; break
            case "nec": school = "necromancy"; break
            case "trs": school = "transmutation"; break
            default: school = false
        }
        return (school)
    }
    /***************************************************************************************************
     * Return a random supported color for spell rune
     ***************************************************************************************************/
    static getRandomRuneColor() {
        let allowedColorArray = ["blue", "green", "pink", "purple", "red", "yellow"];
        // Returns a random integer from 0 to (allowedColorArray.length):
        let index = Math.floor(Math.random() * (allowedColorArray.length));
        return (allowedColorArray[index])
    }
    /***************************************************************************************************
    * Run a 3 part spell rune VFX on indicated token  with indicated rune, Color, scale, and opacity
    * may be optionally specified.
    * 
    * If called with an array of target tokens, it will recursively apply the VFX to each token 
    * 
    * Typical calls: 
    *  jez.runRuneVFX(tToken, jez.getSpellSchool(aItem))
    *  jez.runRuneVFX(args[0].targets, jez.getSpellSchool(aItem), jez.getRandomRuneColor())
    ***************************************************************************************************/
    static async runRuneVFX(target, school, color, scale, opacity) {
        school = school || "enchantment"            // default school is enchantment \_(ツ)_/
        color = color || jez.getRandomRuneColor()   // If color not provided get a random one
        scale = scale || 1.2                        // If scale not provided use 1.0
        opacity = opacity || 1.0                    // If opacity not provided use 1.0
        // jez.log("runRuneVFX(target, school, color, scale, opacity)","target",target,"school",school,"scale",scale,"opacity",opacity)
        if (Array.isArray(target)) {                // If function called with array, do recursive calls
            for (let i = 0; i < target.length; i++) jez.runRuneVFX(target[i], school, color, scale, opacity);
            return (true)                           // Stop this invocation after recursive calls
        }
        //-----------------------------------------------------------------------------------------------
        // Build names of video files needed
        // 
        const INTRO = `jb2a.magic_signs.rune.${school}.intro.${color}`
        const BODY = `jb2a.magic_signs.rune.${school}.loop.${color}`
        const OUTRO = `jb2a.magic_signs.rune.${school}.outro.${color}`
        //-----------------------------------------------------------------------------------------------
        // Change TokenDocument5e to Token5e
        // 
        //let t1 = {}
        //if (token1.constructor.name === "TokenDocument5e") t1 = token1._object
        //else t1 = token1
        //-----------------------------------------------------------------------------------------------
        // Play the VFX
        // 
        new Sequence()
            .effect()
            .file(INTRO)
            .atLocation(target)
            .scaleToObject(scale)
            .opacity(opacity)
            .waitUntilFinished(-500)
            .effect()
            .file(BODY)
            .atLocation(target)
            .scaleToObject(scale)
            .opacity(opacity)
            .duration(3000)
            .waitUntilFinished(-500)
            .effect()
            .file(OUTRO)
            .atLocation(target)
            .scaleToObject(scale)
            .opacity(opacity)
            .play();
    }
    /***************************************************************************************************
     * Move the movingToken up to the number of spaces specified as move away from the amchorToken if 
     * move is a positive value, toward if negative, after a delay in milliseconds.
     * 
     * If the path foro the movement is obstructed for movement, a message is posted to the chat log and '
     * a false is returned.
     ***************************************************************************************************/
    static async moveToken(anchorToken, movingToken, move, delay, options = {}) {
        const FUNCNAME = "moveToken(anchorToken, movingToken, move, delay, options={})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `jez.lib ${FNAME} |`
        const TL = options.traceLvl ?? 0
        if (TL > 0) jez.trace(`${TAG} --- Starting ---`);
        if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,
            "anchorToken ==>", anchorToken,
            'movingToken ==>', movingToken,
            'move        ==>', move,
            'delay       ==>', delay,
            "options     ==>", options);
        //---------------------------------------------------------------------------------------------------
        // Set Function specific variables
        //
        let moveArray = [-3, -2, -1, 0, 1, 2, 3]
        const GRID_UNIT = canvas.scene.data.grid;
        let distBetweenTokens = jez.getDistance5e(anchorToken, movingToken);
        delay = delay || 10
        //----------------------------------------------------------------------------------------------
        // Store the X & Y coordinates of the two tokens
        // 
        const X = movingToken.center.x;                                 // Nab the X coord for target token
        const Y = movingToken.center.y;                                 // Nab the Y coord for target token
        //----------------------------------------------------------------------------------------------
        // Adjust move distance if necessary because tokens are already too close.
        // 
        if (distBetweenTokens <= 5 && move < 0) return (true)       // Bail if adjacent && Pull
        if (move === -3 && distBetweenTokens < 20) move = -2        // 4 spaces apart, can move 3
        if (move === -2 && distBetweenTokens < 15) move = -1        // 3 spaces apart, can move 2
        if (move === -1 && distBetweenTokens < 10) move = 0         // 2 spaces apart, can move 1
        if (move === 0) return (true)                               // Move = 0 is the trivial case
        if (TL > 2) jez.trace(`${TAG} After adjusting distance, move ==>`, move)
        //----------------------------------------------------------------------------------------------
        // Validity check on move
        // 
        if (!moveArray.includes(move))
            return jez.badNews(`Move distance requested, ${move} not supported by ${FUNCNAME}`);
        let squareCorner = moveSpaces(move, { traceLvl: TL })
        if (!squareCorner) {
            jez.postMessage({
                color: jez.randomDarkColor(), fSize: 14, icon: movingToken.data.img,
                title: `${movingToken.name} path obstructed`,
                msg: `${movingToken.name} path obstructed for the intended movement of ${move} spaces.
                 GM needs to adjudicate the result.`,
                token: movingToken
            })
            return (false)
        }
        if (TL > 2) jez.trace(`${TAG} Square Corner`, squareCorner)
        await jez.wait(delay)
        //----------------------------------------------------------------------------------------------
        // Obtain the code for TokenUpdate which must be runAsGM enabled.
        // 
        const TokenUpdate = game.macros.find(i => i.name === "TokenUpdate");
        if (!TokenUpdate) return jez.badNews(`REQUIRED: Missing TokenUpdate GM Macro!`, "e");
        let AdvancedMacros = getProperty(TokenUpdate.data.flags, "advanced-macros");
        if (!AdvancedMacros) return jez.badNews(`REQUIRED: Macro requires AdvancedMacros Module!`, 'e');
        else if (!AdvancedMacros.runAsGM) return jez.badNews(`REQUIRED: TokenUpdate "Execute As GM" must be checked.`, 'e');
        await TokenUpdate.execute(movingToken.id, squareCorner);
        // Following line dies with a permission error for normal players.
        // await movingToken.document.update(squareCorner)
        return (true)
        //----------------------------------------------------------------------------------------------
        // Count of spaces to move 1, 2 or 3, return the squarecorner of destination or false if the 
        // path was obstructed.
        //----------------------------------------------------------------------------------------------
        function moveSpaces(count, options = {}) {
            const FUNCNAME = "moveSpaces(count, options={})";
            const FNAME = FUNCNAME.split("(")[0]
            const TAG = `jez.lib ${FNAME} |`
            const TL = options.traceLvl ?? 0
            if (TL > 0) jez.trace(`${TAG} --- Starting ---`);
            if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,
                "count   ==>", count,
                "options ==>", options);
            //---------------------------------------------------------------------------------------------------
            // Set Function specific variables
            //
            let dist = [];
            let minDist = 99999999999;
            let maxDist = 0;
            let minIdx = 0;
            let maxIdx = 0;
            //---------------------------------------------------------------------------------------------------
            // Build array of potential squares
            //
            let destSqrArray = buildSquareArray(Math.abs(count), { traceLvl: TL });
            //---------------------------------------------------------------------------------------------------
            // Add distance between the coords to array
            //
            for (let i = 1; i < destSqrArray.length; i++)
                destSqrArray[i].dist = canvas.grid.measureDistance(destSqrArray[i], anchorToken.center);
            if (TL > 2) jez.trace(`${TAG} Destination Square Array`, destSqrArray);
            //---------------------------------------------------------------------------------------------------
            // Add path clear (or not) to the array
            //
            for (let i = 1; i < destSqrArray.length; i++) {
                let ray = new Ray(movingToken.center, destSqrArray[i])
                destSqrArray[i].clear = true
                let badLoM = canvas.walls.checkCollision(ray)
                if (TL > 2) jez.trace(`${TAG} badLoM`, badLoM);
                if (badLoM) destSqrArray[i].clear = false
            }
            if (TL > 2) jez.trace(`${TAG} Destination Square Array`, destSqrArray);
            //---------------------------------------------------------------------------------------------------
            // Find the greatest move square
            //
            for (let i = 1; i < destSqrArray.length; i++) {
                if (destSqrArray[i].dist < minDist) { minDist = destSqrArray[i].dist; minIdx = i; }
                if (destSqrArray[i].dist > maxDist) { maxDist = destSqrArray[i].dist; maxIdx = i; }
            }
            if (TL > 2) jez.trace(`${TAG} Max & Min Distances`,
                "minDist ==>", minDist, "minIdx  ==>", minIdx,
                "maxDist ==>", maxDist, "maxIdx  ==>", maxIdx);
            //---------------------------------------------------------------------------------------------------
            // Get index of maximum move in appropriate direction
            //
            let index = minIdx                  // Assume pull, pick closest space
            if (count > 0) index = maxIdx       // Change to furthest if pushing
            //---------------------------------------------------------------------------------------------------
            // If path is obstructed, return false
            //
            if (!destSqrArray[index].clear) return (false)
            //---------------------------------------------------------------------------------------------------
            // Calculate and return the square corner
            //
            let fudge = GRID_UNIT / 2;
            if (movingToken.data.width > 1) fudge = GRID_UNIT / 2 * movingToken.data.width;
            let squareCorner = {};
            squareCorner.x = destSqrArray[index].x - fudge;
            squareCorner.y = destSqrArray[index].y - fudge;
            return squareCorner;
        }
        function buildSquareArray(size, options = {}) {
            const FUNCNAME = "buildSquareArray(size, options={})";
            const FNAME = FUNCNAME.split("(")[0]
            const TAG = `jez.lib ${FNAME} |`
            const TL = options.traceLvl ?? 0
            if (TL > 0) jez.trace(`${TAG} --- Starting ---`);
            if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,
                'size    ==>', size,
                "options ==>", options);
            //---------------------------------------------------------------------------------------------------
            // Set Function specific variables
            //
            let destSqrArray = [];     // destination Square array
            if (size === 0) return destSqrArray;
            //----------------------------------------------------------------------------------------------
            // Size = 1 is a one space move where 8 surrounding spaces will be considered.
            // The spaces considered are as shown in this "nifty" character graphics "drawing." 
            // 
            //       +---+---+---+
            //       | 1 | 2 | 3 |
            //       +---+---+---+
            //       | 4 | 5 | 6 |
            //       +---+---+---+
            //       | 7 | 8 | 9 |
            //       +---+---+---+
            //----------------------------------------------------------------------------------------------
            if (size === 1) {
                for (let i = 1; i < 10; i++) destSqrArray[i] = {};
                destSqrArray[1].y = destSqrArray[2].y = destSqrArray[3].y = Y - GRID_UNIT;
                destSqrArray[4].y = destSqrArray[5].y = destSqrArray[6].y = Y;
                destSqrArray[7].y = destSqrArray[8].y = destSqrArray[9].y = Y + GRID_UNIT;
                destSqrArray[1].x = destSqrArray[4].x = destSqrArray[7].x = X - GRID_UNIT;
                destSqrArray[2].x = destSqrArray[5].x = destSqrArray[8].x = X;
                destSqrArray[3].x = destSqrArray[6].x = destSqrArray[9].x = X + GRID_UNIT;
                return destSqrArray;
            }
            //----------------------------------------------------------------------------------------------
            // Sie = 2 is a two space move where 12 spaces may be solution.
            // The spaces considered are as shown in this "nifty" character graphics "drawing."
            //
            //            +----+----+----+
            //            |  1 |  2 |  3 |    
            //       +----+----+----+----+----+
            //       | 12 |    |    |    |  4 | 
            //       +----+----+----+----+----+
            //       | 11 |    | xx |    |  5 |
            //       +----+----+----+----+----+
            //       | 10 |    |    |    |  6 |
            //       +----+----+----+----+----+
            //            |  9 |  8 |  7 |  
            //            +----+----+----+
            //----------------------------------------------------------------------------------------------
            if (size === 2) {
                for (let i = 1; i <= 12; i++) destSqrArray[i] = {};
                destSqrArray[1].y = destSqrArray[2].y = destSqrArray[3].y = Y - 2 * GRID_UNIT;
                destSqrArray[4].y = destSqrArray[12].y = Y - GRID_UNIT;
                destSqrArray[5].y = destSqrArray[11].y = Y;
                destSqrArray[6].y = destSqrArray[10].y = Y + GRID_UNIT;
                destSqrArray[7].y = destSqrArray[8].y = destSqrArray[9].y = Y + 2 * GRID_UNIT;
                destSqrArray[10].x = destSqrArray[11].x = destSqrArray[12].x = X - 2 * GRID_UNIT;
                destSqrArray[1].x = destSqrArray[9].x = X - GRID_UNIT;
                destSqrArray[2].x = destSqrArray[8].x = X;
                destSqrArray[3].x = destSqrArray[7].x = X + GRID_UNIT;
                destSqrArray[4].x = destSqrArray[5].x = destSqrArray[6].x = X + 2 * GRID_UNIT;
                return destSqrArray;
            }
            //----------------------------------------------------------------------------------------------
            // Sie = 3 is a three space move where 16 spaces may be the solution.
            // The spaces considered are as shown in this "nifty" character graphics "drawing."
            // 
            //                 +----+----+----+
            //                 |  1 |  2 |  3 | 
            //            +----+----+----+----+----+
            //            |  4 |    |    |    |  5 | 
            //       +----+----+----+----+----+----+----+
            //       |  6 |    |    |    |    |    |  7 | 
            //       +----+----+----+----+----+----+----+
            //       |  8 |    |    | XX |    |    |  9 | 
            //       +----+----+----+----+----+----+----+
            //       | 10 |    |    |    |    |    | 11 | 
            //       +----+----+----+----+----+----+----+
            //            | 12 |    |    |    | 13 |    
            //            +----+----+----+----+----+
            //                 | 14 | 15 | 16 |   
            //                 +----+----+----+
            //----------------------------------------------------------------------------------------------
            if (size === 3) {
                for (let i = 1; i <= 16; i++) destSqrArray[i] = {};
                // Find y coords
                destSqrArray[1].y = destSqrArray[2].y = destSqrArray[3].y = Y - 3 * GRID_UNIT;
                destSqrArray[4].y = destSqrArray[5].y = Y - 2 * GRID_UNIT;
                destSqrArray[6].y = destSqrArray[7].y = Y - 1 * GRID_UNIT;
                destSqrArray[8].y = destSqrArray[9].y = Y - 0 * GRID_UNIT;
                destSqrArray[10].y = destSqrArray[11].y = Y + 1 * GRID_UNIT;
                destSqrArray[12].y = destSqrArray[13].y = Y + 2 * GRID_UNIT;
                destSqrArray[14].y = destSqrArray[15].y = destSqrArray[16].y = Y + 3 * GRID_UNIT;
                // Find x coords
                destSqrArray[6].x = destSqrArray[8].x = destSqrArray[10].x = X - 3 * GRID_UNIT;
                destSqrArray[4].x = destSqrArray[12].x = X - 2 * GRID_UNIT;
                destSqrArray[1].x = destSqrArray[14].x = X - 1 * GRID_UNIT;
                destSqrArray[2].x = destSqrArray[15].x = X - 0 * GRID_UNIT;
                destSqrArray[3].x = destSqrArray[16].x = X + 1 * GRID_UNIT;
                destSqrArray[5].x = destSqrArray[13].x = X + 2 * GRID_UNIT;
                destSqrArray[7].x = destSqrArray[9].x = destSqrArray[11].x = X + 3 * GRID_UNIT;
                return destSqrArray;
            }
        }
    }
    /***************************************************************************************************
     * getRace
     *
     * Return the race of the passed Actor5e, Token5e, or TokenDocument5e.  The value will be a lowercase
     * string, which may be empty.  It is taken from a user input field, so garbage may be present.  
     * 
     * If passed a parm not of a supported type, return FALSE
     ***************************************************************************************************/
    static getRace(entity) {
        let objType = entity.constructor.name
        let subject = null
        if (objType === "Actor5e")          // perhaps entity is actor5e?  
            subject = entity                // point subject at the actor5e
        if (objType === "Token5e")          // maybe it is a Token5e?
            subject = entity.actor          // point subject at the actor5e
        if (objType === "TokenDocument5e")   // Maybe it is a TokenDocument5e
            subject = entity._actor         // point subject at the actor5e
        if (subject === null) return (false) // garbage in, return false
        // jez.log(`------ Get Race Call ------`, `Object '${objType}'`, entity, `Subject ${subject.name}`, 
        //subject, `subject.data.type`, subject.data.type)
        let isNPC, targetType;
        if (subject.data.type === "npc") isNPC = true; else isNPC = false;
        if (isNPC) {
            targetType = subject.data.data.details.type.value.toLowerCase()
            if (targetType === "custom") targetType = subject.data.data.details.type.custom.toLowerCase()
        }
        else targetType = subject.data.data.details.race.toLowerCase()
        return (targetType)
    }

    /***************************************************************************************************
     * Following are my "item" handling functions.  All of them intended to deal with items on a token's
     * actor.
     * 
     * - itemAddToActor
     * - itemDeleteFromActor
     * - itemFindOnActor
     * - itemUpdateOnActor
     ***************************************************************************************************/

    /***************************************************************************************************
     * Copy the item named as "ItemName" from the items directory to the token named as token5e.  Since 
     * we control the items directory, going to assume the wisdom to make ItemName unique is exercised.
     ***************************************************************************************************/
    static async itemAddToActor(token5e, ItemName) {
        // jez.log(`Copy ${ItemName} from the Items directory to ${token5e.name}`)
        let itemObj = game.items.getName(ItemName)
        if (!itemObj) {
            let msg = `Failed to find ${ItemName} in the Items Directory`
            jez.badNews(msg, "e");
            return (false)
        }
        return (token5e.actor.createEmbeddedDocuments("Item", [itemObj.data]))
    }
    /***************************************************************************************************
    * Delete specified item (string matching name) from specified token5e.  Return true on success, 
    * false on failure. If a third parameter "itemType" is passed limit the search to items of that
    * type.
    * 
    * This function is similar to jez.deleteItems, but only deletes one copy of the item.
    ***************************************************************************************************/
    static async itemDeleteFromActor(token5e, itemName, itemType) {
        // Random wait mitigates a race error caused by a DAE bug that executes each macro.execute for
        // each line in an effect.  I have opened an issue on gitlab.
        // https://gitlab.com/tposney/dae/-/issues/319
        // await jez.wait(Math.floor(Math.random() * 500))  // Fixed in DAE 0.10.22, installed 07/27/22
        // Back to our normally scheduled program.
        let getItem = await jez.itemFindOnActor(token5e, itemName, itemType);
        if (!getItem) return (false);
        return (await getItem.delete());
    }
    /***************************************************************************************************
     * Search the specified Token5e's actor for the named item.  Return false if not found, return
     * the item if found.  If a third parameter "itemType" is passed limit the search to items of that
     * type.
     *
     * Some known itemTypes: backpack, class, consumable, equipment, feat, loot, spell, tool, weapon
     ***************************************************************************************************/
    static async itemFindOnActor(token5e, itemName, itemType) {
        // jez.log("itemFindOnActor(token5e, itemName, itemType)", "token5e", token5e, "itemName", itemName, "itemType", itemType)
        let foundItem = false
        if (!itemType) foundItem = token5e.actor.items.find(i => i.name === itemName);
        else foundItem = token5e.actor.items.find(i => i.name === itemName && i.type === itemType);
        // jez.log("foundItem", foundItem)
        return (foundItem);
    }
    /***************************************************************************************************
     * For the item named as itemName, optionally of the specified itemType on the token5e update the 
     * item as specified in the itemUpdate object.  
     * 
     * Special case, if data.description.value is not specified in the update object, then this function
     * will strip out anything set off in bold surrounded by double percent symbols. 
     ***************************************************************************************************/
    static async itemUpdateOnActor(token5e, itemName, itemUpdate, itemType) {
        //----------------------------------------------------------------------------------------------
        // jez.log(`Searching for ${itemName} on ${token5e.name}`)
        //let aActorItem = token5e.actor.data.items.getName(itemName)
        let aActorItem = await jez.itemFindOnActor(token5e, itemName, itemType)
        if (!aActorItem) {
            let msg = `Failed to find ${itemName} on ${token5e.name}`
            jez.badNews(msg, "e");
            return (false)
        }
        //----------------------------------------------------------------------------------------------
        // If the passed update, doesn't change the value of the decription, then pull out the comments.
        //
        if (!itemUpdate?.data?.description?.value) {
            //-----------------------------------------------------------------------------------------------
            // Remove the don't change this message assumed to be embedded in the item description.  It 
            // should be of the form: <p><strong>%%.*%%</strong></p> optionally followed by white space
            //
            const searchString = `<p><strong>.*%%.*%%</strong></p>[\s\n\r]*`;
            const regExp = new RegExp(searchString, "g");
            const replaceString = ``;
            let content = await duplicate(aActorItem.data.data.description.value);
            content = await content.replace(regExp, replaceString);
            // jez.log('content', content)
            itemUpdate.data = { 'description.value': content } // Drop in altered description
            // jez.log("itemUpdate", itemUpdate)
        }
        return (await aActorItem.update(itemUpdate))
    }

    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Function to run jez.pairEffects inside a runAsGM wrapper.  Accepts same arguments as 
     * jez.pairEffects, though it flips subject to subject.id to avoid problems with the wrapper call not
     * liking complex objects passed to it.
     *
     * Arguments are one of two formats:
     *  subject1: any types supported by jez.getActor5eDataObj (actor5e, token5e, token5e.id, actor5e.id)
     *  effectName1: string that names effects on respective subject
     *  subject2 are Types supported by jez.getActor5eDataObj (actor5e, token5e, token5e.id, actor5e.id)
     *  effectName2: string that names effects on respective subject
     * 
     * ALTERNATIVELY, effect.uuid mode takes two arguments
     *  effectUuid1: 16 character string that identifies effect
     *  effectUuid2: 16 character string that identifies effect
     *********1*********2*********3*********4*********5*********6*********7*********8*********9**********/
    static pairEffectsAsGM(...args) {
        const FUNCNAME = "jez.pairEffectsAsGM(...args)"
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `${FNAME} |`
        const TL = 0
        if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
        if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`);
        //-----------------------------------------------------------------------------------------------
        // Process the args to see what we have.  Two is effect.uuid mode, Four is older, others are bad
        //
        if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`${TAG} args[${i}]`, args[i]);
        if (args.length !== 2 && args.length !== 4)
            return jez.badNews(`Bad Argument count (${args.length}) provided to ${FNAME}`)
        let uuidMode = false                    // False indicates subject & effect pairs
        if (args.length === 2) uuidMode = true  // True indicates uuid call approach
        //-----------------------------------------------------------------------------------------------
        // Load up the runAsGM wrapper, quit if can not be found
        //
        const GM_PAIR_EFFECTS = jez.getMacroRunAsGM("PairEffects")
        if (!GM_PAIR_EFFECTS) return
        //-----------------------------------------------------------------------------------------------
        // If we are in uuidMode, call the runAsGM wrapper macro with the two arguments and quit
        //
        if (uuidMode) {
            let effectUuid1 = args[0]
            let effectUuid2 = args[1]
            if (TL > 1) jez.trace(`${TAG} Running in uuidMode`);
            GM_PAIR_EFFECTS.execute(effectUuid1, effectUuid2)
            return
        }
        //-----------------------------------------------------------------------------------------------
        // Must have four arguments.  If the subjects are Token5e or Actor5e objects, need to change them
        // to token.id or actor.id values.
        //
        if (TL > 1) jez.trace(`${TAG} Running in 4 Argument mode`);
        let subject1 = getSubjectId(args[0])
        let effectName1 = args[1]
        let subject2 = getSubjectId(args[2])
        let effectName2 = args[3]
        if (!subject1 || !subject2) return  // subject will be false if could not be parsed
        if (TL > 1) jez.trace(`${TAG} Subject Id's: ${subject1}, ${subject2}`);
        function getSubjectId(subject) {
            const TAG = `${FNAME} getSubjectId |`
            if (typeof (subject) === "object") {                   // Hopefully we have a Token5e or Actor5e
                if (subject.constructor.name === "Token5e") return (subject.id)
                if (subject.constructor.name === "Actor5e") return (subject.uuid)
                return jez.badNews(`${TAG} subject (${subject.name}) is object but not Token5e or Actor5e`)
            }
            if ((typeof (subject) === "string") && (subject.length === 16)) return (subject)
            return jez.badNews(`${TAG} subject (${subject}) could not be parsed`)
        }
        //-----------------------------------------------------------------------------------------------
        // If we are in uuidMode, call the runAsGM wrapper macro with the two arguments and quit
        //
        if (TL > 1) jez.trace(`${TAG} Inputs to GM_PAIR_EFFECTS.execute`,
            'subject1', subject1,
            'effectName1', effectName1,
            'subject2', subject2,
            'effectName2', effectName2)
        GM_PAIR_EFFECTS.execute(subject1, effectName1, subject2, effectName2)
    }
    /**************************************************************************************************************
     * Add a macro execute line calling the macro "Remove_Paired_Effect" which must exist in the macro folder to
     * named effect on the pair of tokens supplied.
     *
     * Note: This operates on effect by name which can result in unexpected results if multiple effects on a an
     * actor have the same name.  Not generally an issue, but it might be.
     *
     * subject1 & subject2 are types supported by jez.getActor5eDataObj (actor5e, token5e, token5e.id, actor5e.id)
     * effectName1 & effectName2 are strings that name effects on their respective token actors.
     * 
     * ***ALTERNATIVELY***
     * 
     * Can be called with just two arguments, UUID's for the effects to be paired.  This approach is recommended.
     **************************************************************************************************************/
    static async pairEffects(...args) {
        const FUNCNAME = "jez.pairEffects(...args)"
        const TL = 2;
        const TAG = `jez.pairEffects |`
        if (TL > 0) jez.trace(`${TAG} === Called ${FUNCNAME} ===`)
        if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`${TAG} args[${i}]`, args[i]);
        if (args.length !== 2 && args.length !== 4)
            return jez.badNews(`Bad Argument count (${args.length}) provided to ${FUNCNAME}`)
        let subject1 = args[0]
        let effectName1 = args[1]
        let subject2 = args[2]
        let effectName2 = args[3]
        let effectUuid1 = args[0]
        let effectUuid2 = args[1]
        let effectData1
        let effectData2
        let actor1 = null
        let actor2 = null
        let uuidMode = false                    // False indicates subject & effect pairs
        if (args.length === 2) uuidMode = true  // True indicates uuid call approach
        //---------------------------------------------------------------------------------------------------------
        // Make sure the macro that will be called later exists.  Throw an error and return if not
        //
        let pairingMacro = game.macros.find(i => i.name === "Remove_Paired_Effect");
        if (!pairingMacro) return jez.badNews("REQUIRED: Remove_Paired_Effect macro is missing.", "e");
        //---------------------------------------------------------------------------------------------------------
        // Execute with two or four arguments
        //
        if (uuidMode) {
            //---------------------------------------------------------------------------------------------------------
            // Grab the effect data from the first token if we were handed a name and not a data object
            // UUID will be of the form: Scene.MzEyYTVkOTQ4NmZk.Token.pcAVMUbbnGZ1lz4h.ActiveEffect.1u3e6c1os77qhwha
            if (TL > 2) jez.trace(`${TAG} effectUuid1`, effectUuid1)
            if (jez.isEffectUUID(effectUuid1)) {
                effectData1 = await fromUuid(effectUuid1)
                if (TL > 2) jez.trace(`${TAG} effectData1 from UUID`, effectData1)
            } else return jez.badNews(`effectData1 must be a UUID`, "error")
            //---------------------------------------------------------------------------------------------------------
            // Grab the effect data from the second token
            //
            if (TL > 2) jez.trace(`${TAG} effectUuid2`, effectUuid2)
            if (jez.isEffectUUID(effectUuid2)) {
                effectData2 = await fromUuid(effectUuid2)
                if (TL > 2) jez.trace(`${TAG} effectData2 from UUID`, effectData2)
            } else return jez.badNews(`effectData1 must be a UUID`, "error")
        }
        else {
            //---------------------------------------------------------------------------------------------------------
            // Convert subject1 and subject2 into actor objects, throw an error and return if conversion fails
            //
            actor1 = await jez.getActor5eDataObj(subject1)
            if (!actor1) return jez.badNews("First subject not a token, actor, tokenId or actorId", "e")
            actor2 = await jez.getActor5eDataObj(subject2)
            if (!actor2) return jez.badNews("Second subject not a token, actor, tokenId or actorId", "e")
            //---------------------------------------------------------------------------------------------------------
            // Grab the effect data from the first token if we were handed a name and not a data object
            //
            if (TL > 2) jez.trace(`${TAG} effectName1`, effectName1)
            effectData1 = effectName1
            if (effectName1?.constructor.name !== "ActiveEffect5e") {
                if (TL > 2) jez.trace(`${TAG} Seeking ${effectName1} in actor1.effects`, actor1.effects)
                effectData1 = await actor1.effects.find(i => i.data.label === effectName1);
                if (TL > 2) jez.trace(`${TAG} effectData1`, effectData1)
                if (!effectData1)
                    return jez.badNews(`${effectName1} not found on ${actor1.name}.  Effects not paired.`, "warn")
            }
            //---------------------------------------------------------------------------------------------------------
            // Grab the effect data from the second token
            //
            if (TL > 2) jez.trace(`${TAG} effectName2`, effectName2)
            effectData2 = effectName2
            if (effectName2?.constructor.name !== "ActiveEffect5e") {
                if (TL > 2) jez.trace(`${TAG} Seeking ${effectName2} in actor2.effects`, actor2.effects)
                effectData2 = await actor2.effects.find(i => i.data.label === effectName2);
                if (TL > 2) jez.trace(`${TAG} effectData2`, effectData2)
                if (!effectData2)
                    return jez.badNews(`${effectName2} not found on ${actor2.name}.  Effects not paired.`, "warn")
            }
        }
        //---------------------------------------------------------------------------------------------------------
        // Add the actual pairings
        //
        if (TL > 2) jez.trace(`${TAG} *************`, 'actor1', actor1, 'actor2', actor2, 'effectData1', effectData1, 'effectData2', effectData2)
        await addPairing(effectData2, actor1, effectData1)
        await addPairing(effectData1, actor2, effectData2)
        //---------------------------------------------------------------------------------------------------------
        // Define a function to do the actual pairing
        //
        async function addPairing(effectChanged, tokenPaired, effectPaired) {
            let TL = 0
            if (TL > 2) jez.trace(`${TAG} addPairing(effectChanged, tokenPaired, effectPaired)`,
                "effectChanged", effectChanged, "tokenPaired", tokenPaired, "effectPaired", effectPaired)
            let value = `Remove_Paired_Effect ${tokenPaired?.id} ${effectPaired.uuid}`
            if (uuidMode) value = `Remove_Paired_Effect ${effectPaired.uuid}`
            effectChanged.data.changes.push({ key: `macro.execute`, mode: jez.CUSTOM, value: value, priority: 20 })
            return (await effectChanged.update({ changes: effectChanged.data.changes }))
        }
        return (true)
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Function to return the Actor5e data associated with the passed parameter.
     *
     * Parameters
     *  - subject: actor, token, token.id, actor.uuid to be searched (actor.id allowed as a legacy
     *             option, but warning issued as it fetches actor in side bar for unlinked token)
     *  - options: object that can set traceLvl
     *********1*********2*********3*********4*********5*********6*********7*********8*********9**********/
    static async getActor5eDataObj(subject, options = {}) {
        const FUNCNAME = "getActor5eDataObj(subject, options={})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `jez.${FNAME} |`
        const TL = options.traceLvl ?? 0
        if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
        if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
        //-----------------------------------------------------------------------------------------------
        // function variables
        //
        let actor5e = null
        //----------------------------------------------------------------------------------------------
        // Validate the subject parameter, stashing it into "actor5e" variable, returning false if bad
        //
        if (typeof (subject) === "object") {                   // Hopefully we have a Token5e or Actor5e
            if (subject.constructor.name === "Token5e") {
                actor5e = subject.actor
                return (actor5e)
            }
            else {
                if (subject.constructor.name === "Actor5e") {
                    actor5e = subject
                    return (actor5e)
                }
                else return jez.badNews(`${TAG} subject "${typeof (subject)}" not Token5e or Actor5e`, "e")
            }
        }
        else {                  // subject is not an object maybe it is a char string? 
            // 
            if (TL > 2) jez.trace(`${TAG} subject '${subject}' might be a UUID?`)
            if ((typeof (subject) === "string") && (subject.length > 16)) {
                // Unlinked Actor UUID:  Scene.MzEyYTVkOTQ4NmZk.Token.yibY6FvT68UOu8LI
                // Linked Actor UUID:    Actor.SWpOylFL0LiqEzWN
                const ATOMS = subject.split('.')
                if (ATOMS[0] === "Scene" && ATOMS[2] === "Token") { // Unlinked UUID
                    if (TL > 2) jez.trace(`${TAG} Process unlinked UUID: ${subject}`)
                    let tokenDocument5e = await fromUuid(subject)
                    if (TL > 2) jez.trace(`${TAG} tokenDocument5e`, tokenDocument5e)
                    actor5e = tokenDocument5e._actor
                    if (TL > 2) jez.trace(`${TAG} actor5e`, actor5e)
                    if (actor5e) return actor5e
                }
                if (ATOMS[0] === "Actor") {                          // Linked UUID
                    if (TL > 2) jez.trace(`${TAG} Process linked UUID: ${subject}`)
                    actor5e = await fromUuid(subject)
                    if (actor5e) return actor5e
                }
            }
            // 
            if (TL > 2) jez.trace(`${TAG} subject '${subject}' might be an 16 character id?`)
            if ((typeof (subject) === "string") && (subject.length === 16)) {
                actor5e = jez.getTokenById(subject)?.actor// Maybe string is a token id?
                if (actor5e) return (actor5e)             // Subject is a token ID 
                actor5e = canvas.tokens.placeables.find(ef => ef.data.actorId === subject).actor
                if (actor5e) {                            // Subject is an actorID embedded in a scene token 
                    jez.badNews(`${TAG} '${subject}' is an actor.id, indeterminent for unlinked tokens`, "w")
                    return (actor5e)
                }
                actor5e = game.actors.get(subject)        // Maybe string is an actor id?
                if (actor5e) {                            // Subject is an actor ID 
                    jez.badNews(`${TAG} '${subject}' is an actor.id, indeterminent for unlinked tokens`, "w")
                    return (actor5e)
                }
                return jez.badNews(`${TAG} subject looks like an id but does not map to a token or actor: ${subject}`, "e")
            }
            else {                                        // Oh fudge, subject is something unrecognized
                return jez.badNews(`${TAG} subject not Token5e, Actor5e, Token.id, or Actor.id: ${subject}`, "e")
            }
        }
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Function to return the Effect data object identified by arguments
     *
     * Parameters
     *  - effect: either a string naming the effect, an id or a uuid 
     *    e.g. 52 character string: Actor.i9vqeZXzvIcdZ3BU.ActiveEffect.DmvGS7OsCz3HoggP
     *  - subject: identifies the actor with effect in question, supported by getActor5eDataObj
     *    i.e. Objects: actor5e, token5e; 16 character Strings: token5e.id, actor5e.id
     *    this parameter is required if given a named effect or an id, otherwise not used 
     *********1*********2*********3*********4*********5*********6*********7*********8*********9**********/
    static async getEffectDataObj(effect, subject) {
        let mes = ""
        let effectUuid = ""
        const FUNCNAME = "getEffectDataObj(effect, subject)"
        // jez.log(`-------------- Starting --- ${FUNCNAME} -----------------`);
        // jez.log(`PARAMATERS`, "effect", effect, "subject", subject )
        //----------------------------------------------------------------------------------------------
        // If we were not given a "subject" parameter, the effect must be a UUID, validate this.
        //
        if (!subject) {
            if ((typeof (effect) === "string") && (effect.length === 52)) {
                // tokenize the effect and validate
                let tokens = effect.split(".")
                if (tokens.length != 4) {
                    mes = `BAD NEWS: ${FUNCNAME}'s effect tokenized to ${tokens.length} elements`
                    return jez.badNews(mes, "e")
                }
                if (tokens[1].length != 16) {
                    mes = `BAD NEWS: Second token of ${FUNCNAME}'s effect was invalid length (tokens[1].length)`
                    return jez.badNews(mes, "e")

                }
                if (tokens[2] != "ActiveEffect") {
                    mes = `BAD NEWS: Third token of ${FUNCNAME}'s effect was not 'ActiveEffect'`
                    return jez.badNews(mes, "e")
                }
                if (tokens[3].length != 16) {
                    mes = `BAD NEWS: Forth token of ${FUNCNAME}'s effect was invalid length (tokens[1].length)`
                    return jez.badNews(mes, "e")
                }
                effectUuid = effect
            }
            else {
                mes = `BAD NEWS: effect is not a valid UUID and no subject provided.`
                return jez.badNews(mes, "e")
            }
        }
        else {  // Must have been passed a subject, so see if parameters are valid
            //------------------------------------------------------------------------------------------
            // Obtain an Actor5e data object from subject
            //
            let actor5e = await jez.getActor5eDataObj(subject)
            if (!actor5e) return jez.badNews(`actor data obj not found for ${FUNCNAME} subject`, 'e')
            //------------------------------------------------------------------------------------------
            // effect needs to be an id (16 character string) or a string providing name of effect
            //
            if (typeof (effect) != "string")
                return jez.badNews(`${FUNCNAME}'s effect needs to be a string, is a ${typeof (effect)}`, "e")
            //------------------------------------------------------------------------------------------
            // Assemble a UUID (which may have a name string embedded in place of an actual id)
            //
            effectUuid = `Actor.${actor5e.id}.ActiveEffect.${effect}`
        }
        //----------------------------------------------------------------------------------------------
        // Now that things are validated, fetch the actor's data
        //
        // jez.log(`effectUuid`, effectUuid)
        let tokens = effectUuid.split(".")
        const ACTOR_ID = tokens[1]
        let actor5e = await jez.getActor5eDataObj(ACTOR_ID)
        if (!actor5e) {
            mes = `BAD NEWS: ${FUNCNAME} could not find actor from ID ${ACTOR_ID}`
            return jez.badNews(mes, "e")
        }
        //----------------------------------------------------------------------------------------------
        // 
        //
        // jez.log(`Seeking effect "${tokens[3]}" within`, actor5e.effects)
        let effectData = await actor5e.effects.find(i => i.id === tokens[3] || i.data.label === tokens[3]);
        //let effectData = await actor5e.effects.find(i => i.name === tokens[3]);
        if (!effectData) {
            mes = `BAD NEWS: ${FUNCNAME} could not find "${tokens[3]}" on ${actor5e.name}`
            return jez.badNews(mes, "e")
        }
        return (effectData)
    }

    /*********1*********2*********3*********4*********5*********6*********7*********8*********9******
     * Accept a string and find the substring passed with it.  Return an object that has count and
     * an updated string with the substring replaced. 
     * 
     * Inputs
     * @param {String} string the string that will be searched and updated
     * @param {String} substring the substring that will be sought and replaced
     * @param {String} newSubstring the string that will replace occurrences of substring
     * @param {String} wrapChar a string, usually a special character that wraps the substring
     *
     * Return Object:
     * @typedef  {Object} replaceSubStr
     * @property {number} count  - Count of times substring appears in string
     * @property {string} string - Updated string with substring replaced by newSubstring
     *
     * Example Calls:
     * 1. testString = "rocket RoCKEt hi Rocket This is a roc ket. ROCKET's engine Rocketeer Sprocket"
     *    result = replaceSubString(testString, "ROCKET", "%TOKENNAME%")
     *    console.log(result.count, result.string)
     *    ==> 4 "%TOKENNAME% %TOKENNAME% hi %TOKENNAME% This is a roc ket. %TOKENNAME%'s engine Rocketeer Sprocket"
     *
     * 2. testString = "rocket RoCKEt hi Rocket This is a roc ket. ROCKET's engine Rocketeer Sprocket"
     *    result = replaceSubString(testString, "ROCKET", "%TOKENNAME%").string
     *    console.log(result)
     *    ==> %TOKENNAME% %TOKENNAME% hi %TOKENNAME% This is a roc ket. %TOKENNAME%'s engine Rocketeer Sprocket
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*****/
    static replaceSubString(string, substring, newSubstring, wrapChar = "") {
        // jez.log("replaceSubString(string, substring, newSubstring)","string",string,"substring",substring,"newSubstring",newSubstring,"wrapChar",wrapChar)
        let returnObj = {}
        let re = new RegExp(`${wrapChar}\\b${substring}\\b${wrapChar}`, 'gi');
        returnObj.count = (string.match(re, newSubstring) || []).length
        returnObj.string = string.replace(re, newSubstring)
        return (returnObj)
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Pop the passed string (message) onto the console and as ui notification and return false.
     * 
     * This function can accept one or two arguments
     * message: required string that will be used as the error message
     * badness: optional severity indicator.  It can be an integer (1, 2, or 3) or a string that begins 
     *          with a i, w, or e (technically, the code is much more permissive but this is intent.)
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static badNews(message, badness = 2) {
        if (typeof message !== "string") {
            let msg = `The message paramater passed to badNews must be a string.  Bad, bad, programmer.`
            console.log(msg, message)
            ui.notifications.error(`ERROR: ${msg}`, msg)
            return (false)
        }
        if (typeof badness === "string") {
            switch (badness.toLowerCase().at(0)) {
                case "i": badness = 1; break
                case "w": badness = 2; break
                default: badness = 3
            }
        }
        if (badness < 2) {
            ui.notifications.info(`INFO: ${message}`)
            console.log(`jez.BadNews | ${message}`)
        }
        else if (badness === 2) {
            ui.notifications.warn(`WARN: ${message}`)
            console.warn(`jez.BadNews | ${message}`)
        }
        else {
            ui.notifications.error(`ERROR: ${message}`)
            console.error(`jez.BadNews | ${message}`)
        }
        return (false)
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Search the passed array for items of a given name and type. Return the number of matches
     * 
     * The passed array should be an array of Item5e objects that contain, at a minimum these fields:
     * @typedef  {Object} Item5e
     * @property {string} name  - Count of times substring appears in string
     * @property {string} type - Updated string with substring replaced by newSubstring
     * 
     * Typical Calls
     * =============
     * let matches = 0
     * let nameOfItem = "Longsword"
     * let typeOfItem = "weapon"
     * matches = itemMgmt_itemCount(game.items.contents, nameOfItem, typeOfItem)     // matches in sidebar
     * matches = itemMgmt_itemCount(tActor.items.contents, nameOfItem, typeOfItem)   // matches on actor
     * if (matches > 1) {
     *    msg = `Item for "${nameOfItem}" of type "${typeOfItem}" not unique in Item Directory.`
     *    return jez.badNews(msg,"w")
     * }
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static itemMgmt_itemCount(array, name, type) {
        // jez.log(array)
        let count = 0
        for (const ITEM of array) if ((ITEM.name === name) && (ITEM.type === type)) count++
        return (count)
    }

    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * jez.selectItemOnActor(...)
     * 
     * Series of 3 dialogs to select an Item from selected actor and then find all of the actors that 
     * have that item, building a data object that is passed to the nextFunction (passed in as a 
     * parameter).
     * 
     * Inputs
     * @arg {object} sToken - a Token5e data object representing the source token to be read
     * @arg {object} prompts - An object containing a number of strings, any of which may be omitted
     * @arg {function} nextFunction - Called at successful conclusion and passed selection object
     * 
     * NextFunction contents
     * @typedef  {Object} promptObj
     * @property {string} title1 - Dialog title for first pop-up dialog
     * @property {string} text1  - Dialog text for first pop-up dialog
     * @property {string} title2 - Dialog title for second pop-up dialog
     * @property {string} text2  - Dialog text for second pop-up dialog
     * @property {string} title3 - Dialog title for third pop-up dialog
     * @property {string} text3  - Dialog text for third pop-up dialog 
     * 
     * Default value for dialogs
     * Title1 = "What type of thing?"
     * Text1  = "Please, pick one from list below."
     * Title2 = "Which specific item should be acted upon?"
     * Text2  = `Pick one item from list of "${itemType}" item(s)`
     * Title3 = "Select Actor(s) to have their item acted upon."
     * Text3  = `Choose the actor(s) to have their ${itemSelected} of type ${itemType} acted upon.`
     * 
     * The nextFunction is called with a selObj that will contain the following
     * @typedef  {Object} selObj
     * @property {object} sToken - a Token5e data object representing the source token to be read
     * @property {array} actorsIdsToUpdate - array of actor IDs for the actor selected in dialogs
     * @property {string} itemSelected - string naming the item being acted upon
     * @property {type} itemType - string naming the type of object (e.g. spell, weapon) targeted
     * 
     * Execution can be aborted from each dialog by selecting cancel or the X button.  If that is the 
     * case a false if returned.
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static async selectItemOnActor(sToken, prompts, nextFunction) {
        let typesFound = []
        //--------------------------------------------------------------------------------------------
        // Set up our variables for this function
        //
        let sActor = sToken.actor
        //--------------------------------------------------------------------------------------------
        // Read through all of the targets items to find all of the types represented
        //
        for (let i = 0; i < sActor.items.contents.length; i++) {
            // jez.log(`${i} ${sActor.items.contents[i].data.type} ${sActor.items.contents[i].data.name}`)
            if (!typesFound.includes(sActor.items.contents[i].data.type))
                typesFound.push(sActor.items.contents[i].data.type);
        }
        // jez.log(`Found ${typesFound.length} types}`, typesFound.sort())
        //--------------------------------------------------------------------------------------------
        // Pop a dialog to select the type of thing to be operated on
        //
        const Q_TITLE = prompts.title1 ?? "What type of thing?";
        const Q_TEXT = prompts.text1 ?? "Please, pick one from list below.";
        if (typesFound.length > 9) await jez.pickFromListArray(Q_TITLE, Q_TEXT, typeCallBack, typesFound.sort());
        else await jez.pickRadioListArray(Q_TITLE, Q_TEXT, typeCallBack, typesFound.sort());
        /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
         * typeCallBack
         *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
        async function typeCallBack(itemType) {
            const FUNCNAME = "typeCallBack(itemType)";
            // jez.log(`--- Starting --- ${FUNCNAME} ---`,"itemType",itemType);
            let msg = `typeCallBack: Type "${itemType}" was selected in the dialog`;
            console.log(msg);
            let itemsFound = [];
            //--------------------------------------------------------------------------------------------
            // If cancel button was selected on the preceding dialog, null is returned.
            //
            if (itemType === null)
                return (false);
            //--------------------------------------------------------------------------------------------
            // If nothing was selected call preceding function and terminate this one
            //
            if (!itemType) {
                // jez.log("itemType",itemType)
                console.log("No selection passed to typeCallBack(itemType), trying again.");
                jez.selectItemOnActor(sToken, prompts, nextFunction);
                return (false);
            }
            //--------------------------------------------------------------------------------------------
            // Find all the item of type "itemType"
            //
            for (let i = 0; i < sActor.items.contents.length; i++) {
                // jez.log(`${i} ${sActor.items.contents[i].data.type} ${sActor.items.contents[i].data.name}`)
                if (sActor.items.contents[i].data.type === itemType)
                    itemsFound.push(sActor.items.contents[i].data.name);
            }
            // jez.log(`Found ${itemsFound.length} ${itemType}(s)`, itemsFound.sort())
            //--------------------------------------------------------------------------------------------
            // From the Items found, ask which item should trigger opening a sheet.
            //
            const Q_TITLE = prompts.title2 ?? "Which specific item should be acted upon?";
            const Q_TEXT = prompts.text2 ?? `Pick one item from list of "${itemType}" item(s)`;
            if (itemsFound.length > 9) await jez.pickFromListArray(Q_TITLE, Q_TEXT, itemCallBack, itemsFound.sort());
            else await jez.pickRadioListArray(Q_TITLE, Q_TEXT, itemCallBack, itemsFound.sort());
            // jez.log(`--- Finished --- ${FUNCNAME} ---`);
            /*********1*********2*********3*********4*********5*********6*********7*********8*********9******
             * itemCallBack
             *********1*********2*********3*********4*********5*********6*********7*********8*********9*****/
            function itemCallBack(itemSelected) {
                let msg = `itemCallBack: Item named "${itemSelected}" was selected in the dialog`;
                console.log(msg);
                let actorFullWithItem = [];
                //--------------------------------------------------------------------------------------------
                // If cancel button was selected on the preceding dialog, null is returned ==> Terminate
                //
                if (itemSelected === null)
                    return (false);
                //--------------------------------------------------------------------------------------------
                // If nothing was selected call preceding function and terminate this one
                //
                if (!itemSelected) {
                    console.log("No selection passed to itemCallBack(itemSelected), trying again.");
                    typeCallBack(itemType);
                    return (false);
                }
                //--------------------------------------------------------------------------------------------
                // Search all actors in the actor directory for our item/type combos
                //
                let allActors = game.actors;
                for (let entity of allActors) {
                    let itemFound = entity.items.find(item => item.data.name === itemSelected && item.type === itemType);
                    if (itemFound)
                        actorFullWithItem.push(`${entity.name} (${entity.id})`);
                }
                //--------------------------------------------------------------------------------------------
                // From the Items found, ask which item should trigger opening a sheet.
                //
                const Q_TITLE = prompts.title3 ?? "Select Actor(s) to have their item acted upon.";
                const Q_TEXT = prompts.text3 ?? `Choose the actor(s) to have their ${itemSelected} of type ${itemType} acted upon.`;
                jez.pickCheckListArray(Q_TITLE, Q_TEXT, pickCheckCallBack, actorFullWithItem);
            // jez.log(`*** Ending pickCheckListArray`);
            /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
             * pickCheckCallBack
             *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
            /*async*/ function pickCheckCallBack(selection) {
                    let actorsIdsToUpdate = [];
                    let selectionString = "";
                    //--------------------------------------------------------------------------------------------
                    // If cancel button was selected on the preceding dialog, null is returned.
                    //
                    // jez.log("selection", selection)
                    if (selection === null) return (false);
                    //--------------------------------------------------------------------------------------------
                    // If nothing was selected (empty array), call preceding function and terminate this one
                    //
                    if (selection.length === 0) {
                        console.log("No selection passed to pickCheckCallBack(selection), trying again.");
                        itemCallBack(itemSelected); // itemSelected is a global that is passed to preceding func
                        return (false);
                    }
                    //--------------------------------------------------------------------------------------------
                    // Write function start with number selected to console.log
                    //
                    let msg = `pickCheckCallBack: ${selection.length} actor(s) selected in the dialog`;
                    console.log(msg);
                    //--------------------------------------------------------------------------------------------
                    // Build a string with <br> embedded between entries, other than last
                    //
                    for (let i = 0; i < selection.length; i++) {
                        if (selectionString)
                            selectionString += "<br>";
                        selectionString += selection[i];
                    }
                    //----------------------------------------------------------------------------------------------
                    // Build an array of the actor IDs that might be updated
                    // Selection lines are of this form: Lecherous Meat Bag, Medium (eYstNJefUUgrHk8Q)
                    //
                    // jez.log('selection', selection)
                    for (let i = 0; i < selection.length; i++) {
                        // jez.log(`${i + 1} ${selection[i]}`)
                        let actorArray = []; // Array for actors seperated by "(", there will be 2 or more
                        actorArray = selection[i].split("(");
                        let actorId = actorArray[actorArray.length - 1].slice(0, -1); // Chop off last character a ")"
                        actorsIdsToUpdate.push(actorId); // Stash the actual actorId from the selection line
                    }
                    //----------------------------------------------------------------------------------------------
                    // Build object to be returned to calling function
                    //
                    // jez.log(`--- Loading Data ---`,"sToken",sToken,"actorsIdsToUpdate",actorsIdsToUpdate,"itemSelected",itemSelected,"itemType",itemType)
                    let selObj = {
                        sToken: sToken,
                        idArray: actorsIdsToUpdate,
                        itemName: itemSelected,
                        itemType: itemType
                    }
                    // jez.log(`--- Passing Data ---`,"selObj.sToken",selObj.sToken,"selObj.idArray",selObj.idArray,"selObj.itemName",selObj.itemName,"selObj.itemType",selObj.itemType)
                    nextFunction(selObj)    // Call teh nextFunction (passed to this function with our selection object
                }
            }
        }
    }

    /***************************************************************************************************
    * Function to play a VFX explosion at the specified location.  Built for summoning with warpgate
    * 
    * Template can be coordinates (e.g. {x: 875, y: 805}) or anything else accepted by sequencer
    * 
    * Supported colors: "Blue", "Green", "Orange", "Purple", "Yellow", "*"
    * 
    * @typedef  {Object} optionObj
    * @property {string} color - one of the supported colors
    * @property {number} opactity - real number defining opacity, defaults to 1.0
    * @property {number} scale - real number defining scale, defaults to 1.0
    * 
    * Anticipated VFX files include
    * 
    * All of them start their fike path with: modules/jb2a_patreon/Library/Generic/  this will be 
    * prepended to the string passed in for VFX file to make that easier, if string starts with a "~"
    *
    * ~Explosion colors = ["Blue", "Green", "Orange", "Purple", "Yellow", "*"]; 
    * ~Explosion/Explosion_01_Blue_400x400.webm etc...
    * Use: ~Explosion/Explosion_01_${color}_400x400.webm
    *
    * Portal colors = ["Bright_Blue", "Dark_Blue", "Dark_Green", "Dark_Purple", "Dark_Red", 
    *                 "Dark_RedYellow", "Dark_Yellow", "Bright_Green", "Bright_Orange", 
    *                 "Bright_Purple", "Bright_Red", "Bright_Yellow" ]
    * ~Portals/Portal_Bright_Blue_H_400x400.webm
    * Example: ~Portals/Portal_${color}_H_400x400.webm
    *
    * Energy colors = ["Blue", "BluePink", "GreenOrange", "OrangePurple", "*"]
    * ~Energy/SwirlingSparkles_01_Regular_Blue_400x400.webm
    * Use: ~Energy/SwirlingSparkles_01_Regular_${color}_400x400.webm
    ***************************************************************************************************/
    static async vfxPreSummonEffects(location, optionObj = {}) {
        const FUNCNAME = "jez.vfxPreSummonEffects(location, optionObj)";
        const FNAME = FUNCNAME.split("(")[0]
        const TL = optionObj?.traceLvl ?? 0
        const REQUIRED_MODULE = "sequencer"
        let color
        if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
        if (TL > 1) jez.trace(`--- Called --- ${FUNCNAME} ---`, "location", location, "optionObj", optionObj);
        //-----------------------------------------------------------------------------------------------
        // Depending on TL print out the dataObj to the console
        //
        if (TL > 2) {
            jez.trace(`${FNAME} |`)
            for (let key in optionObj) jez.trace(`${FNAME} | optionObj.${key}`, optionObj[key])
        }
        //-----------------------------------------------------------------------------------------------
        // Make sure that sequencer module is active
        //
        if (!game.modules.get(REQUIRED_MODULE))
            return jez.badNews(`${FNAME} | ${REQUIRED_MODULE} must be active.  Please fix!`, "error")
        else if (TL > 2) jez.trace(`${FNAME} | Found ${REQUIRED_MODULE} continuing...`)
        //-------------------------------------------------------------------------------------------------
        // Do some color validation (New Method -- implied by optionObj.allowedColors being set
        //
        if (optionObj.allowedColors) {
            if (TL > 3) jez.trace("optionObj.allowedColors", optionObj.allowedColors)
            if (optionObj.allowedColors.includes(optionObj?.color)) color = optionObj?.color
            else color = "*"
            if (TL > 3) jez.trace("Color selected", color)
        }
        //-------------------------------------------------------------------------------------------------
        // Do some color validation (Old Method -- implied by optionObj.allowedColors not being set
        //
        if (!optionObj.allowedColors) {
            const EXPLOSION_COLORS = ["Blue", "Green", "Orange", "Purple", "Yellow", "*"];
            const PORTAL_COLORS = ["Bright_Blue", "Dark_Blue", "Dark_Green", "Dark_Purple", "Dark_Red",
                "Dark_RedYellow", "Dark_Yellow", "Bright_Green", "Bright_Orange",
                "Bright_Purple", "Bright_Red", "Bright_Yellow", "*"]
            const SPARKLE_COLORS = ["Blue", "BluePink", "GreenOrange", "OrangePurple", "*"]
            let colors = null
            let introVFX = optionObj?.introVFX ?? '~Explosion/Explosion_*_${color}_400x400.webm'
            if (TL > 3) jez.trace("optionObj?.introVFX", optionObj?.introVFX)
            if (introVFX.includes("Explosion")) colors = EXPLOSION_COLORS
            else if (introVFX.includes("Portal")) colors = PORTAL_COLORS
            else if (introVFX.includes("SwirlingSparkles")) colors = SPARKLE_COLORS
            if (colors) {
                if (TL > 3) jez.trace("colors", colors)
                if (colors.includes(optionObj?.color)) color = optionObj?.color
                else color = "*"
            }
            else color = optionObj?.color ?? "*"
            if (TL > 3) jez.trace("Color selected", color)
        }
        //------------------------------------------------------------------------------------------------
        // Set Default values if not already done
        //
        if (!optionObj.vfxFile)
            optionObj.vfxFile = '~Explosion/Explosion_*_${color}_400x400.webm' // default VFX file
        //-------------------------------------------------------------------------------------------------
        // Build the VFX file name
        //
        let vfxFile = optionObj?.vfxFile
        const VFX_DIR = 'modules/jb2a_patreon/Library/Generic'
        if (vfxFile.charAt(0) === '~') vfxFile = `${VFX_DIR}/${vfxFile.substring(1)}`
        if (TL > 3) jez.trace("VFX with prefix", vfxFile)
        vfxFile = vfxFile.replace("${color}", color)
        if (TL > 3) jez.trace("VFX with color ", vfxFile)
        //-------------------------------------------------------------------------------------------------
        // Set the other adjustable values
        //
        const SCALE = optionObj?.scale ?? 1.0
        const OPACITY = optionObj?.opacity ?? 1.0
        const DURATION = optionObj?.duration ?? 1000
        new Sequence()
            .effect()
            .file(vfxFile)
            .atLocation(location)
            .center()
            .scale(SCALE)
            .opacity(OPACITY)
            .duration(DURATION)
            .fadeIn(DURATION / 3)
            .play()
    }
    /***************************************************************************************************
     * Function to play a VFX effect at the specified location.  Built for summoning with warpgate
     * Template can be coordinates (e.g. {x: 875, y: 805}) or anything else accepted by sequencer
     *
     * Supported colors: "Blue", "Black", "Green", "Purple", "Grey", "*"
     *
     * @typedef  {Object} optionObj
     * @property {string} color - one of the supported colors
     * @property {number} opactity - real number defining opacity, defaults to 1.0
     * @property {number} scale - real number defining scale, defaults to 1.0
     * 
     * Anticipated VFX files include
     * 
     * All of them start their fike path with: modules/jb2a_patreon/Library/Generic/  this will be 
     * prepended to the string passed in for VFX file to make that easier, if string starts with a "~"
     *
     * ~Smoke colors = ["Blue", "Black", "Green", "Purple", "Grey", "*"]; 
     * ~Smoke/SmokePuff01_01_Regular_Blue_400x400.webm etc...
     *  Example: ~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm
     *
     * Portal colors = ["Bright_Blue", "Dark_Blue", "Dark_Green", "Dark_Purple", "Dark_Red", 
     *                  "Dark_RedYellow", "Dark_Yellow", "Bright_Green", "Bright_Orange", 
     *                  "Bright_Purple", "Bright_Red", "Bright_Yellow" ]
     * ~Portals/Portal_Bright_Blue_H_NoBG_400x400.webm etc...
     * Example: ~Portals/Portal_${color}_H_400x400.webm
     *
     * Firework colors = [ "BluePink", "Green", "GreenOrange", "GreenRed", "Orange", "OrangeYellow", 
     *  "Yellow", "*"]
     * ~Fireworks/Firework01_02_Regular_GreenOrange_600x600.webm
     * Example: ~Fireworks/Firework*_02_Regular_$color}_600x600.webm
     ***************************************************************************************************/
    static async vfxPostSummonEffects(template, optionObj = {}) {
        const FUNCNAME = "jez.vfxPostSummonEffects(location, optionObj)";
        const FNAME = FUNCNAME.split("(")[0]
        const TL = optionObj?.traceLvl ?? 0
        const REQUIRED_MODULE = "sequencer"
        let color
        if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
        if (TL > 1) jez.trace(`--- Called --- ${FUNCNAME} ---`, "location", location, "optionObj", optionObj);
        //-----------------------------------------------------------------------------------------------
        // Depending on TL print out the dataObj to the console
        //
        if (TL > 2) {
            jez.trace(`${FNAME} |`)
            for (let key in optionObj) jez.trace(`${FNAME} | optionObj.${key}`, optionObj[key])
        }
        //-----------------------------------------------------------------------------------------------
        // Make sure that sequencer module is active
        //
        if (!game.modules.get(REQUIRED_MODULE))
            return jez.badNews(`${FNAME} | ${REQUIRED_MODULE} must be active.  Please fix!`, "error")
        else if (TL > 2) jez.trace(`${FNAME} | Found ${REQUIRED_MODULE} continuing...`)
        //-------------------------------------------------------------------------------------------------
        // Do some color validation (Old Method -- implied by optionObj.allowedColors not being set
        //
        if (optionObj.allowedColors) {
            if (TL > 3) jez.trace("optionObj.allowedColors", optionObj.allowedColors)
            if (optionObj.allowedColors.includes(optionObj?.color)) color = optionObj?.color
            else color = "*"
            if (TL > 3) jez.trace("Color selected", color)
        }
        //-------------------------------------------------------------------------------------------------
        // Do some color validation (Old Method -- implied by optionObj.allowedColors not being set
        //
        if (!optionObj.allowedColors) {
            if (TL > 3) jez.trace("optionObj.allowedColors not being set, tryimg old method")
            const SMOKE_COLORS = ["Blue", "Black", "Green", "Purple", "Grey", "*"];
            const PORTAL_COLORS = ["Bright_Blue", "Dark_Blue", "Dark_Green", "Dark_Purple", "Dark_Red",
                "Dark_RedYellow", "Dark_Yellow", "Bright_Green", "Bright_Orange",
                "Bright_Purple", "Bright_Red", "Bright_Yellow", "*"]
            const FIREWORK_COLORS = ["BluePink", "Green", "GreenOrange", "GreenRed", "Orange", "OrangeYellow",
                "Yellow", "*"]
            let colors = null
            let outroVFX = optionObj?.outroVFX ?? '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm'
            if (TL > 3) jez.trace("optionObj?.outroVFX", optionObj?.outroVFX)
            if (outroVFX.includes("Smoke")) colors = SMOKE_COLORS
            else if (outroVFX.includes("Portal")) colors = PORTAL_COLORS
            else if (outroVFX.includes("Fireworks")) colors = FIREWORK_COLORS
            if (colors) {
                if (TL > 3) jez.trace("colors", colors)
                if (colors.includes(optionObj?.color)) color = optionObj?.color
                else color = "*"
            }
            else color = optionObj?.color ?? "*"
            if (TL > 3) jez.trace("Color selected", color)
        }
        //------------------------------------------------------------------------------------------------
        // Set Default values if not already done
        //
        if (!optionObj.vfxFile)
            optionObj.vfxFile = '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm' // default VFX file
        //-------------------------------------------------------------------------------------------------
        // Build the VFX file name
        //
        if (TL > 3) jez.trace("Build the VFX file")
        let vfxFile = optionObj?.vfxFile
        if (TL > 4) jez.trace("vfxFile", vfxFile)
        const VFX_DIR = 'modules/jb2a_patreon/Library/Generic'
        if (TL > 4) jez.trace("VFX_DIR", VFX_DIR)
        if (vfxFile.charAt(0) === '~') vfxFile = `${VFX_DIR}/${vfxFile.substring(1)}`
        if (TL > 3) jez.trace("VFX with prefix", vfxFile, "color", color)
        vfxFile = vfxFile.replace("${color}", color)
        if (TL > 3) jez.trace("VFX with color ", vfxFile)
        //-------------------------------------------------------------------------------------------------
        // Evaluate the vfxFile name which may have a wildcard down to a single file so duration can be
        // accurately fetched.
        //
        if (TL > 3) jez.trace("Evaluate the vfxFile", vfxFile)
        const FILE_NAME = await fetchFileName(vfxFile)
        async function fetchFileName(path) {
            let matches = await FilePicker.browse("data", path, { wildcard: true })
            let files = matches.files
            // Returns a random integer from 0 to files.length-1:
            let sel = Math.floor(Math.random() * files.length);
            if (TL > 2) jez.trace(`fetchFileName | ${sel} of ${files.length}: ${files[sel]}`)
            return (files[sel])
        }
        //-------------------------------------------------------------------------------------------------
        // Get the duration of the VFX we are going to play so the last 1/3 can be faded.
        // COOL-THING: Obtains the duration of a VFX file.
        //
        const TEXTURE = await loadTexture(FILE_NAME);
        const DURATION = TEXTURE.baseTexture.resource.source.duration;
        if (TL > 2) jez.trace(`${DURATION} second duration for ${FILE_NAME}`)
        //-------------------------------------------------------------------------------------------------
        // Set the other adjustable values
        //
        const SCALE = optionObj?.scale ?? 1.0
        const OPACITY = optionObj?.opacity ?? 1.0
        new Sequence()
            .effect()
            .file(FILE_NAME)
            .atLocation(template)
            .center()
            .scale(SCALE)
            .opacity(OPACITY)
            .fadeOut(DURATION * 1000 / 3)   // Fade the image for 1/3 of its duration
            .play()
    }
    /***************************************************************************************************
     * Modify an existing concentrating effect to contain a DAE effect line of the form:
     *   macro.execute custom <macroName> <argument[1]> <argument[2]> ...
     * 
     * macroName should be a string that names an existing macro to be called by DAE when the effect 
     * is removed with the arguments provided.
     * 
     * argArray should be an array of arguments to pass to macroName as a string with a single space
     * between each.
     ***************************************************************************************************/
    static async modConcentratingEffect(aToken, macroName, argArray) {
        let argValue = ""
        const EFFECT = "Concentrating"
        // Make sure the macro to be called exists
        if (!game.macros.getName(macroName)) return (jez.badNews(`Cannot locate ${macroName} macro.`))
        // Search the passed token to find the effect, return if it doesn't
        let effect = await aToken.actor.effects.find(i => i.data.label === EFFECT);
        if (!effect) return (jez.badNews(`Unable to find ${EFFECT} on ${aToken.name}`))
        // Build the value string from the argArray
        for (const element of argArray) argValue += `${element} `
        // Define the desired modification to concentartion effect. 
        effect.data.changes.push(
            { key: `macro.execute`, mode: jez.CUSTOM, value: `${macroName} ${argValue}`, priority: 20 }
        )
        // Apply the modification to existing effect
        await effect.update({ 'changes': effect.data.changes });
    }

    /***************************************************************************************************
     * Return a type string that differentiates object objects from array objects which are the same 
     * thing when looked at with the normal typeof function.
     * 
     * This uses the object prototype, which seemingly exists for all variables and a few add on bits
     * of magic to return the same type of string returned by typeof, but with a bit more precision.
     * 
     * Object.prototype.toString.call(fruits); // [object Array]
     * Object.prototype.toString.call(user); // [object Object]
     * 
     * This was derived from: https://attacomsian.com/blog/javascript-check-variable-is-object
     * 
     * Example results
     *   jez.typeOf("John")                  // string
     *   jez.typeOf("3.14")                  // number
     *   jez.typeOf("NaN")                   // number
     *   jez.typeOf("false")                 // boolean
     *   jez.typeOf("[1,2,3,4]")             // array
     *   jez.typeOf("{name:'John', age:34}") // object
     *   jez.typeOf("new Date()")            // date
     *   jez.typeOf("function () {}")        // function
     *   jez.typeOf("null")                  // null
     ***************************************************************************************************/
    static typeOf(arg) {
        return Object.prototype.toString.call(arg).split(" ")[1].slice(0, -1).toLowerCase()
    }

    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Somewhat simple minded object comparison function based on one found online.
     * https://medium.com/geekculture/object-equality-in-javascript-2571f609386e
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static isEqual(obj1, obj2) {
        // jez.log("jez.isEqual(obj1, obj2)","obj1",obj1,"obj1 type",typeof(obj1),"obj2",obj2,"obj2 type",typeof(obj2))
        if (!obj1 && !obj2) {
            // jez.log("obj1 & obj2 are falsey, return true")
            return true
        } else if (!obj1 || !obj2) {
            // jez.log("one of obj1 & obj2 are falsey, return false")
            return false
        }
        // jez.log("continue")
        let obj1Type = jez.typeOf(obj1)
        let obj2Type = jez.typeOf(obj2)
        if (obj1Type != obj2Type) return false

        if (!(obj1Type === "object" || obj1Type === "array")) {
            // If either obj are neither object nor array  perform strict comparison
            return obj1 === obj2
        }
        var props1 = Object.getOwnPropertyNames(obj1);
        // jez.log("props1",props1)
        var props2 = Object.getOwnPropertyNames(obj2);
        // jez.log("props2",props2)

        if (props1.length != props2.length) {
            // jez.log("length mismatch, return false")
            return false;
        }
        for (var i = 0; i < props1.length; i++) {
            let val1 = obj1[props1[i]];
            let val2 = obj2[props1[i]];
            let isObjects = isObject(val1) && isObject(val2);
            if (((isObjects && !jez.isEqual(val1, val2)) || (!isObjects && val1 !== val2))
                && !(!val1 && !val2)) {
                // jez.log("Not sure what this case is, return false")
                return false;
            }   // jez.log("Alternative result, continue")
        }
        // jez.log("made it, return true")
        return true;

        function isObject(object) {
            // jez.log("==> object",object)
            return object != null && typeof object === 'object';
        }
    }

    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Test to see if the received string links to a run as GM macro.  Return the macro or false.
     * 
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static getMacroRunAsGM(macroName) {
        if (typeof macroName !== "string")
            return jez.badNews(`isMacroRunAsGM() received non-string paramater.  Bad, bad, programmer.`, 'e')
        const ACTOR_UPDATE = game.macros?.getName(macroName);
        if (!ACTOR_UPDATE) return jez.badNews(`Cannot locate ${macroName} GM Macro`, "Error");
        if (!ACTOR_UPDATE.data.flags["advanced-macros"].runAsGM)
            return jez.badNews(`${macroName} -- Execute as GM box, needs to be checked.`, "Error");
        return (ACTOR_UPDATE)
    }

    /***************************************************************************************************
     * Test to see is the passed argument is a Token5e object. Return true it is; otherwise false
    ***************************************************************************************************/
    static isActor5e(obj) {
        if (obj?.constructor.name === "Actor5e") return (true)
        return (false)
    }
    /***************************************************************************************************
     * Test to see is the passed argument is a Token5e object. Return true it is; otherwise false
     ***************************************************************************************************/
    static isToken5e(obj) {
        if (obj?.constructor.name === "Token5e") return (true)
        return (false)
    }

    /***************************************************************************************************
     * Use the UPDATE_EMBEDDED_MACRO to update embedded documents as GM. 
     * 
     * type:    a string that names the type of document, e.g. "Token"
     * updates: an array of objects that define the changes to be made.  Following snippet is example
     *         let updates = [];
     *         updates.push({
     *             _id: tok.id,
     *             height: newWidth,
     *             width: newWidth
     *         });
     ***************************************************************************************************/
    static async updateEmbeddedDocs(type, updates) {
        const UPDATE_EMBEDDED_MACRO = jez.getMacroRunAsGM(jez.UPDATE_EMBEDDED_MACRO)
        if (!UPDATE_EMBEDDED_MACRO) return false
        await UPDATE_EMBEDDED_MACRO.execute(type, updates)
        return true
    }

    static async createEmbeddedDocs(type, updates) {
        const CREATE_EMBEDDED_MACRO = jez.getMacroRunAsGM(jez.CREATE_EMBEDDED_MACRO)
        if (!CREATE_EMBEDDED_MACRO) return false
        let CEMreturn = await CREATE_EMBEDDED_MACRO.execute(type, updates)
        return CEMreturn
    }

    static async deleteEmbeddedDocs(type, ids, options = {}) {
        const FUNCNAME = "jez.deleteEmbeddedDocs(type, ids, options={})";
        const FNAME = FUNCNAME.split("(")[0]
        const TL = options?.traceLvl ?? 0
        if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
        if (TL > 1) jez.trace(`--- Called --- ${FUNCNAME} ---`, "type", type, "ids", ids, "options", options);
        const DELETE_EMBEDDED_MACRO = jez.getMacroRunAsGM(jez.DELETE_EMBEDDED_MACRO)
        if (!DELETE_EMBEDDED_MACRO) return false
        if (TL > 2) jez.trace(`${FNAME} | Calling DELETE_EMBEDDED_MACRO`, DELETE_EMBEDDED_MACRO);
        let CEMreturn = await DELETE_EMBEDDED_MACRO.execute(type, ids)
        return CEMreturn
    }

    static async deleteEffectAsGM(UUID, options = {}) {
        const FUNCNAME = "jez.deleteEffect(uuid, options={})";
        const FNAME = FUNCNAME.split("(")[0]
        const TL = options?.traceLvl ?? 0
        if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
        if (TL > 1) jez.trace(`--- Called --- ${FUNCNAME} ---`, "UUID", UUID, "options", options);
        const A = jez.DELETE_EFFECT_MACRO
        const DELETE_EFFECT_MACRO = jez.getMacroRunAsGM(jez.DELETE_EFFECT_MACRO)
        if (!DELETE_EFFECT_MACRO) return false
        if (TL > 2) jez.trace(`${FNAME} | Calling DELETE_EFFECT_MACRO`, DELETE_EFFECT_MACRO);
        await DELETE_EFFECT_MACRO.execute(UUID)
    }

    /***************************************************************************************************
     * Use the ACTOR_UPDATE_MACRO to update an Actor as GM. 
     * 
     * token: is a Token5e or an id for such an object
     * updates: object defining the changes to be made.  Here is an example:
     *          { "data.bonuses.mwak.damage": bonus, "data.traits.size": SIZE_ARRAY[ogSizeValue - 1] }
     ***************************************************************************************************/
    static async actorUpdate(token, updates) {
        let tokenId = token
        if (jez.isToken5e(token)) tokenId = token.id
        const ACTOR_UPDATE = jez.getMacroRunAsGM(jez.ACTOR_UPDATE_MACRO)
        if (!ACTOR_UPDATE) return false
        await ACTOR_UPDATE.execute(tokenId, updates);
        return true
    }

    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Create a tile in the current scene with properties defined by tileProps object. 
     * 
     * Example
     * -------
     * let tileProps = {
     *     x: template.center.x - GRID_SIZE / 2,    // X coordinate is center of the template
     *     y: template.center.y - GRID_SIZE / 2,    // Y coordinate is center of the template
     *     img: "modules/jb2a_patreon/Library/Generic/Fire/GroundCrackLoop_03_Regular_Orange_600x600.webm",
     *     width: GRID_SIZE * 3,                   // VFX should occupy 2 tiles across
     *     height: GRID_SIZE * 3                   // ditto
     * };
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static async tileCreate(tileProps) {
        const FUNCNAME = "jez.tileCreate(tileProps)";
        const TRACE_LEVEL = 0
        jez.trc(3, TRACE_LEVEL, `--- Starting --- ${FUNCNAME} ---`);
        jez.trc(4, TRACE_LEVEL, "Parameters", "tileProps", tileProps)
        // let newTile = await Tile.create(tileProps)   // Depricated
        // Following line throws a permission error for non-GM acountnts running this code.
        // let newTile = await game.scenes.current.createEmbeddedDocuments("Tile", [tileProps]);  // FoundryVTT 9.x
        let existingTiles = game.scenes.current.tiles.contents
        let newTile = await jez.createEmbeddedDocs("Tile", [tileProps])
        jez.trc(3, "jez.createEmbeddedDocs returned", newTile);
        if (newTile) {
            let returnValue = newTile[0].data._id
            jez.trc(2, `--- Finished --- ${FUNCNAME} --- Generated:`, returnValue);
            return returnValue; // If newTile is defined, return the id.
        }
        else {   // newTile will be undefined for players, so need to fish for a tile ID
            let gameTiles = null
            let i = 1
            let delay = 2
            await jez.wait(3)           // wait for a very short time and see if a new tile has appeared
            for (i = 1; i < 40; i++) {
                jez.trc(3, TRACE_LEVEL, `Seeking new tile, try ${i} at ${delay * i} ms after return`)
                gameTiles = game.scenes.current.tiles.contents
                if (gameTiles.length > existingTiles.length) break
                await jez.wait(delay)   // wait for a very short time and see if a new tile has appeared
            }
            if (i === 40) return jez.badNews(`Could not find new tile, sorry about that`, "warn")
            jez.trc(3, TRACE_LEVEL, "Seemingly, the new tile has id", gameTiles[gameTiles.length - 1].id)
            let returnValue = gameTiles[gameTiles.length - 1].id
            jez.trc(2, TRACE_LEVEL, `--- Finished --- ${FUNCNAME} --- Found:`, returnValue);
            return returnValue
        }
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Delete a tile identified by tileId
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static async tileDelete(tileId, options = {}) {
        const FUNCNAME = "jez.tileDelete(tileId, options={})";
        const FNAME = FUNCNAME.split("(")[0]
        const TL = options?.traceLvl ?? 0
        if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
        if (TL > 1) jez.trace(`--- Called --- ${FUNCNAME} ---`, "tileId", tileId, "options", options);
        return await jez.deleteEmbeddedDocs("Tile", [tileId], { traceLvl: TL })
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * If the token-mold module is active, check to see if renaming is enabled.  If it is, turn it off 
     * for a bit and then turn it back on. The bit is determined f=by the optional argument.
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static async suppressTokenMoldRenaming(delay = 500, options = {}) {
        const FUNCNAME = `jez.suppressTokenMoldRenaming(delay = 500, options = {})`
        const FNAME = FUNCNAME.split("(")[0]
        const TL = options?.traceLvl ?? 0
        // --------------------------------------------------------------------------------------------
        // Log call, dependent on traceLvl setting in options
        //
        if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
        if (TL > 1) jez.trace(`--- Called --- ${FNAME} ---`, "delay", delay, "options", options);
        // --------------------------------------------------------------------------------------------
        // Proceed
        //
        if (game.modules.get("token-mold")) {
            if (TL > 0) jez.trace(`${FNAME} | Found token-mold, checking renaming`)
            if (!game.users.find(ef => ef.id === game.userId).isGM) {              // Bailout if not GM
                if (TL > 0) jez.trace(`${FNAME} | Current player is not GM, skipping supression`)
                return
            }
            // Grab the current Tokenmold settings
            let tokenMoldSettings = game.settings.get("Token-Mold", "everyone");
            if (tokenMoldSettings.name.use === true) {
                // Toggle renaming off
                tokenMoldSettings.name.use = false
                await game.settings.set("Token-Mold", "everyone", tokenMoldSettings)
                if (TL > 1) jez.trace(`${FNAME} | Renaming was enabled, suppressing for ${delay / 1000} seconds.`)
                // Wait for passed amount of time before restoring
                await jez.wait(delay)
                // Toggle renaming on
                tokenMoldSettings.name.use = true
                await game.settings.set("Token-Mold", "everyone", tokenMoldSettings)
                if (TL > 1) jez.trace(`${FNAME} | Renaming has been re-enabled.`)
            }
            else if (TL > 1) jez.trace(`${FNAME} | Renaming was already diaabled, did nothing.`)
        }
        else if (TL > 0) jez.trace(`${FNAME} | token-mold module not found`)
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Determines if the passed argument "looks like" an effect's UUID, returning a boolean result.
     * effectUUID will be like: 
     *     Scene.MzEyYTVkOTQ4NmZk.Token.pcAVMUbbnGZ1lz4h.ActiveEffect.1u3e6c1os77qhwha
     *          or 
     *     Actor.NWUxMzMyNjVkYmM4.ActiveEffect.LigDCCx3Ud4LavLV
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static isEffectUUID(string) {
        let trcLvl = 4
        if (typeof string !== "string") return false            // Must be a string
        jez.trc(2, trcLvl, "Type - Ok")
        // ---------------------------------------------------------------------------------------------
        // If we have an actor's UUID, process it, returning result
        //
        if (string.includes("Actor")) {
            jez.trc(2, trcLvl, `Actor UUID | Processing ${string} as an Actor`)
            if (string.length !== 52) return false                  // Must be 75 characters long
            jez.trc(2, trcLvl, "Actor UUID | Length - Ok")
            let stringArray = string.split(".")                     // Must be delimited by period characters
            jez.trc(2, trcLvl, "Actor UUID | Token count", stringArray.length)
            if (stringArray.length !== 4) return false              // Must contain 4 parts
            jez.trc(2, trcLvl, "Actor UUID | Count of tokens - Ok")
            if (stringArray[0] !== "Actor") return false           // First part must be "Actor"
            jez.trc(2, trcLvl, "Actor UUID | Actor - Ok")
            if (stringArray[1].length !== 16) return false         // Second part must be 16 characters
            jez.trc(2, trcLvl, "Actor UUID | Length 1 - Ok")
            if (stringArray[2] !== "ActiveEffect") return false    // Third part must be "ActiveEffect"
            jez.trc(2, trcLvl, "Actor UUID | ActiveEffect - Ok")
            if (stringArray[3].length !== 16) return false         // Second part must be 16 characters
            jez.trc(2, trcLvl, "Actor UUID | Length 2 - Ok")
            return true
        }
        if (string.includes("Token")) {
            jez.trc(2, trcLvl, `Token | Processing ${string} as an Actor`)
            if (string.length !== 75) return false                  // Must be 75 characters long
            jez.trc(2, trcLvl, "Token UUID | Length - Ok")
            let stringArray = string.split(".")                     // Must be delimited by period characters
            jez.trc(2, trcLvl, "Token UUID | Token count", stringArray.length)
            // for (let i = 0; i < stringArray.length; i++) jez.trc(2, trcLvl, `stringArray[${i}]`, stringArray[i]);
            if (stringArray.length !== 6) return false              // Must contain 6 parts
            jez.trc(2, trcLvl, "Token UUID | Count of tokens - Ok")
            if (stringArray[0] !== "Scene") return false           // First part must be "Scene"
            jez.trc(2, trcLvl, "Token UUID | Scene - Ok")
            if (stringArray[1].length !== 16) return false         // Second part must be 16 characters
            jez.trc(2, trcLvl, "Token UUID | Length 1 - Ok")
            if (stringArray[2] !== "Token") return false           // Third part must be "Token"
            jez.trc(2, trcLvl, "Token UUID | Token - Ok")
            if (stringArray[3].length !== 16) return false         // Forth part must be 16 characters
            jez.trc(2, trcLvl, "Token UUID | Length 2 - Ok")
            if (stringArray[4] !== "ActiveEffect") return false    // Fifth part must be "ActiveEffect"
            jez.trc(2, trcLvl, "Token UUID | ActiveEffect - Ok")
            if (stringArray[5].length !== 16) return false         // Sixth part must be 16 characters
            jez.trc(2, trcLvl, "Token UUID | Length 3 - Ok")
            return true
        }
    }

    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Determines if the passed argument "looks like" an actor's UUID, returning a boolean result.
     * An Actor UUID should be one of the following general formats
     * 
     * | Actor Type | Example Value                                 |
     * |-----------:|-----------------------------------------------|
     * | Linked     | Actor.8D0C9nOodjwHDGQT                        |
     * | Unlinked   | Scene.MzEyYTVkOTQ4NmZk.Token.Snu5Wo5FRsogPmGO |
     * 
     * Example Call
     *  const TL = 2
     *  let targetUuid = args[args.length - 1].targetUuids[0]
     *  if (!isActorUUID(targetUuid, {traceLvl:TL})) return false
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static isActorUUID(string, options = {}) {
        const FUNCNAME = 'jez.isActorUUID(string, options={})'
        const FNAME = FUNCNAME.split("(")[0]
        const TL = options?.traceLvl ?? 1

        if (TL > 1) jez.trace(`${FNAME} | Is passed string an Actor UUID?`, string)
        if (typeof string !== "string") return false            // Must be a string
        if (TL > 2) jez.trace(`${FNAME} | Argument passed in is a string`, string)
        // ---------------------------------------------------------------------------------------------
        // If we have an actor's UUID, process it, returning result
        //
        if (string.includes("Actor")) {
            if (TL > 2) jez.trace(`${FNAME} | Processing ${string} as an Actor`)
            if (string.length !== 22) return false                  // Must be 75 characters long
            if (TL > 2) jez.trace(`${FNAME} | Length of ${string} - Ok`)
            let stringArray = string.split(".")                     // Must be delimited by period characters
            if (stringArray.length !== 2) return false              // Must contain 4 parts
            if (TL > 2) jez.trace(`${FNAME} | Count of tokens, ${stringArray.length} - Ok`)
            if (stringArray[0] !== "Actor") return false           // First part must be "Actor"
            if (TL > 2) jez.trace(`${FNAME} | First token is "Actor" - Ok`)
            if (stringArray[1].length !== 16) return false         // Second part must be 16 characters
            if (TL > 2) jez.trace(`${FNAME} | ID token length (${stringArray[1].length}) - Ok`)
            if (TL > 1) jez.trace(`${FNAME} | linked Actor UUID confirmed!`)
            return true
        }
        if (string.includes("Token")) {
            if (TL > 2) jez.trace(`${FNAME} | Processing ${string} as a Token actor`)
            if (string.length !== 45) return false                  // Must be 75 characters long
            if (TL > 2) jez.trace(`${FNAME} | Length of ${string} - Ok`)
            let stringArray = string.split(".")                     // Must be delimited by period characters
            if (stringArray.length !== 4) return false              // Must contain 4 parts
            if (TL > 2) jez.trace(`${FNAME} | Count of tokens, ${stringArray.length} - Ok`)
            if (stringArray[0] !== "Scene") return false           // First part must be "Scene"
            if (TL > 2) jez.trace(`${FNAME} | First token is "Scene" - Ok`)
            if (stringArray[1].length !== 16) return false         // Second part must be 16 characters
            if (TL > 2) jez.trace(`${FNAME} | Second token length ${stringArray[1].length} - Ok`)
            if (stringArray[2] !== "Token") return false           // First part must be "Token"
            if (TL > 2) jez.trace(`${FNAME} | Third token is "Token" - Ok`)
            if (stringArray[3].length !== 16) return false         // Second part must be 16 characters
            if (TL > 2) jez.trace(`${FNAME} | Forth token length (${stringArray[1].length}) - Ok`)
            if (TL > 1) jez.trace(`${FNAME} | Token actor UUID confirmed!`)
            return true
        }
        if (TL > 0) jez.trace(`${FNAME} | Argument "${string}" lacks keyword "Actor" or "Token`)
        return (false)
    }

    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Lifted from the MidiSRD module, just adding some documentation upon adding to jezlib
     * 
     * @param {Token} source Source of range distance (usually)
     * @param {Number} maxRange range of crosshairs
     * @param {String} icon Crosshairs Icon
     * @param {String} name Name to use for out of range error message
     * @param {Object} tokenData {width} -- Optional
     * @param {Number} snap - Optional snap position:  
     *                      2: half grid intersections, 
     *                      1: on grid intersections, 
     *                      0: no snap, 
     *                     -1: grid centers (default), 
     *                     -2: half grid centers
     * @param {Object} options {traceLvl: 0} -- Optional to specify trace level, if used preceding args
     *                                          all must be specified
     * @returns 
     * 
     * Example Calls
     *  const TEXTURE = texture || sourceItem.img
     *  const MAX_RANGE = jez.getRange(aItem, ALLOWED_UNITS) ?? 30
     *  let { x, y } = await jez.warpCrosshairs(aToken,MAX_RANGE,TEXTURE,aItem.name,{},-1,{traceLvl: 5})
     *  let { x, y } = await jez.warpCrosshairs(aToken,MAX_RANGE,TEXTURE,aItem.name,{},-1)
     *  let { x, y } = await jez.warpCrosshairs(aToken,MAX_RANGE,TEXTURE)
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static async warpCrosshairs(source, maxRange, icon, name = "Spell", tokenData = {}, snap = -1, options = {}) {
        const sourceCenter = source.center;
        let cachedDistance = 0;
        const FUNCNAME = 'warpCrosshairs(source, maxRange, icon, name, tokenData, snap, options={})'
        const FNAME = FUNCNAME.split("(")[0]
        const TL = options?.traceLvl ?? 0
        // --------------------------------------------------------------------------------------------
        // Log call, dependent on traceLvl setting in options
        //
        if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
        if (TL > 1) jez.trace(`--- Called --- ${FNAME} ---`, "source", source, "maxRange", maxRange,
            "icon", icon, "name", name, "tokenData", tokenData, "snap", snap, "options", options);
        // --------------------------------------------------------------------------------------------
        // Define checkDistance function
        //
        const checkDistance = async (crosshairs) => {
            while (crosshairs.inFlight) {
                //wait for initial render
                await jez.wait(100);
                const ray = new Ray(sourceCenter, crosshairs);
                const distance = canvas.grid.measureDistances([{ ray }], { gridSpaces: true })[0]

                //only update if the distance has changed
                if (cachedDistance !== distance) {
                    cachedDistance = distance;
                    if (distance > maxRange) crosshairs.icon = 'Icons_JGB/Misc/Warning.webm'
                    else crosshairs.icon = icon
                    crosshairs.draw()
                    crosshairs.label = `${distance}/${maxRange} ft`
                }
            }
        }
        // --------------------------------------------------------------------------------------------
        // Perform the actual task
        //
        const location = await warpgate.crosshairs.show(
            // { size: tokenData.width, icon: source.data.img, label: '0 ft.', interval: snap },
            { size: tokenData.width, icon: icon, label: '0 ft.', interval: snap },
            { show: checkDistance })
        if (TL > 1) jez.trace(`${FNAME} | Location`, location)
        // --------------------------------------------------------------------------------------------
        // Return our results
        //
        if (location.cancelled) {
            if (TL > 0) jez.trace(`${FNAME} | Cancelled`)
            return false;
        }
        if (cachedDistance > maxRange) return jez.badNews(`${name} maximum range is ${maxRange} ft.`, 'warn')
        if (TL > 0) jez.trace(`${FNAME} | Returning`, location)
        return location
    }

    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
     * Function to spawn in a token at a position to be selected within this function.  Key calls are
     * made to: 
     *  (1) jez.warpCrosshairs() which rides on warpgate.crosshairs.show()
     *  (2) jez.suppressTokenMoldRenaming which does what its name suggests
     *  (3) warpgate.spawnAt() to perform the actual summon
     * 
     * This funcion will return the id of the summoned token or false if an error occurs.
     * 
     * MINION is a string defining the name of the MINION
     * aToken token5e data object for the reference token (from which range is measured)
     * ARGS is a whopper of an object that can contain multiple values, read code or README
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
    static async spawnAt(MINION, aToken, aActor, aItem, ARGS) {
        // async function spawnAt(MINION, aToken, aActor, aItem, ARGS) {
        const FUNCNAME = "jez.spawnAt(MINION, ARGS)";
        const FNAME = FUNCNAME.split("(")[0]
        const TL = ARGS?.traceLvl ?? 0
        const REQUIRED_MODULE = "warpgate"
        if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
        if (TL > 1) jez.trace(`--- Called --- ${FUNCNAME} ---`, "MINION", MINION, "ARGS", ARGS);
        if (TL > 3) {
            jez.trace(`${FNAME} |`)
            for (let key in ARGS) jez.trace(`${FNAME} | ARGS.${key}`, ARGS[key])
        }
        //-----------------------------------------------------------------------------------------------------------------------------------
        // Create the defVal object 
        //
        let defVal = {
            allowedColorsIntro: null,
            allowedColorsOutro: null,
            allowedUnits: ["", "ft", "any"],
            colorIntro: "*",
            colorOutro: "*",
            defaultRange: 30,
            duration: 1000,                     // Duration of the introVFX
            img: "icons/svg/mystery-man.svg",   // Image to use on the summon location cursor
            introTime: 1000,                    // Amount of time to wait for Intro VFX
            introVFX: '~Explosion/Explosion_*_${color}_400x400.webm', // default introVFX file
            minionName: `${aToken.name}'s ${MINION}`,
            name: "Summoning",                  // Name of action (message only), typically aItem.name
            opacity: 1,                         // Opacity for the VFX
            options: { controllingActor: aActor }, // Aledgedly hides an open character sheet
            outroVFX: '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm', // default outroVFX file
            scale: 0.7,                         // Scale for the VFX
            snap: -1,                           // Snap value passed to jez.warpCrosshairs
            source: { center: { x: 315, y: 385 } },  // Coords for source (within center), typically aToken
            suppressTokenMold: 2000,            // Time (in ms) to suppress TokenMold's renaming setting
            templateName: `%${MINION}%`,
            traceLvl: 0,
            // updates: {
            //     actor: { name: `${aToken.name}'s ${MINION}` },
            //     token: { name: `${aToken.name}'s ${MINION}` },
            // },
            waitForSuppress: 100,               // Time (in ms) to wait of for Suppression to being
            width: 1                            // Width of token to be summoned
        }
        //-----------------------------------------------------------------------------------------------------------------------------------
        // Create dataObj (data object) from the passed ARGS and the defVal object 
        //
        let dataObj = {
            allowedColorsIntro: ARGS.allowedColorsIntro ?? defVal.allowedColorsIntro,
            allowedColorsOutro: ARGS.allowedColorsOutro ?? defVal.allowedColorsOutro,
            allowedUnits: ARGS.allowedUnits ?? defVal.allowedUnits,
            colorIntro: ARGS.colorIntro ?? defVal.colorIntro,
            colorOutro: ARGS.colorOutro ?? defVal.colorOutro,
            defaultRange: ARGS.defaultRange ?? defVal.defaultRange,
            img: ARGS.img ?? defVal.img,
            duration: ARGS.duration ?? defVal.duration,
            img: ARGS.img ?? defVal.img,
            introTime: ARGS.introTime ?? defVal.introTime,
            introVFX: ARGS.introVFX ?? defVal.introVFX,
            minionName: ARGS.minionName ?? defVal.minionName,
            name: ARGS.name ?? defVal.name,
            opacity: ARGS.opacity ?? defVal.opacity,
            options: ARGS.options ?? defVal.options,
            outroVFX: ARGS.outroVFX ?? defVal.outroVFX,
            scale: ARGS.scale ?? defVal.scale,
            snap: ARGS.snap ?? defVal.snap, // This may be changed later based on width
            source: ARGS.source ?? defVal.source,
            suppressTokenMold: ARGS.suppressTokenMold ?? defVal.suppressTokenMold,
            templateName: ARGS.templateName ?? defVal.templateName,
            traceLvl: ARGS.traceLvl ?? defVal.templateName,
            updates: 'updates' in ARGS ? ARGS.updates : defVal.updates,
            waitForSuppress: ARGS.waitForSuppress ?? defVal.waitForSuppress,
            width: ARGS.width ?? defVal.width,
        }
        //-----------------------------------------------------------------------------------------------------------------------------------
        // Second Pass on defaults, using inputs that may have been passed into our function. 
        // The callbacks need to be recomputed based on varous inputs now established.
        //
        defVal.callbacks = {
            pre: async (template) => {
                jez.vfxPreSummonEffects(template, {
                    allowedColors: dataObj.allowedColorsIntro,
                    color: dataObj.colorIntro,
                    opacity: dataObj.opacity,
                    scale: dataObj.scale,
                    traceLvl: dataObj.traceLvl,
                    vfxFile: dataObj.introVFX
                });
                await jez.wait(dataObj.introTime);
            },
            post: async (template) => {
                jez.vfxPostSummonEffects(template, {
                    allowedColors: dataObj.allowedColorsOutro,
                    color: dataObj.colorOutro,
                    opacity: dataObj.opacity,
                    scale: dataObj.scale,
                    traceLvl: dataObj.traceLvl,
                    vfxFile: dataObj.outroVFX
                });
                // await jez.wait(dataObj.outroVFX);
            }
        }
        defVal.updates = {
            actor: { name: dataObj.minionName },
            token: { name: dataObj.minionName, disposition: aToken.data.disposition },
        }
        if (TL > 3) {
            jez.trace(`${FNAME} |`)
            for (let key in defVal) jez.trace(`${FNAME} | defVal.${key}`, defVal[key])
        }
        //-----------------------------------------------------------------------------------------------------------------------------------
        // If not provided with ARGS.allowedColors, build the array of allowed color values based on
        // the introVFX / outroVFX names with special treatment for known types defaulting to a "*"
        //
        if (!dataObj.allowedColorsIntro) {
            if (dataObj.introVFX.startsWith("~Explosion/Explosion_"))
                dataObj.allowedColorsIntro = ["Blue", "Green", "Orange", "Purple", "Yellow", "*"];
            else if (dataObj.introVFX.startsWith("~Portals/Portal_"))
                dataObj.allowedColorsIntro = ["Bright_Blue", "Dark_Blue", "Dark_Green", "Dark_Purple",
                    "Dark_Red", "Dark_RedYellow", "Dark_Yellow", "Bright_Green", "Bright_Orange",
                    "Bright_Purple", "Bright_Red", "Bright_Yellow", "*"];
            else if (dataObj.introVFX.startsWith("~Energy/SwirlingSparkles"))
                dataObj.allowedColorsIntro = ["Blue", "BluePink", "GreenOrange", "OrangePurple", "*"];
            else dataObj.allowedColorsIntro = ["*"];
        }
        if (!dataObj.allowedColorsOutro) {
            if (dataObj.introVFX.startsWith("~Smoke/SmokePuff"))
                dataObj.allowedColorsOutro = ["Blue", "Black", "Green", "Purple", "Grey", "*"];
            else if (dataObj.introVFX.startsWith("~Portals/Portal_"))
                dataObj.allowedColorsOutro = ["Bright_Blue", "Dark_Blue", "Dark_Green", "Dark_Purple",
                    "Dark_Red", "Dark_RedYellow", "Dark_Yellow", "Bright_Green", "Bright_Orange",
                    "Bright_Purple", "Bright_Red", "Bright_Yellow", "*"];
            else if (dataObj.introVFX.startsWith("~Fireworks/Firework"))
                dataObj.allowedColorsOutro = ["BluePink", "Green", "GreenOrange", "GreenRed", "Orange",
                    "OrangeYellow", "Yellow", "*"];
            else dataObj.allowedColorsOutro = ["*"];
        }
        //-----------------------------------------------------------------------------------------------------------------------------------
        // If ARGS.snap is null, set snap to appropriate value based on width. Odd width should have 
        // snap = -1 to center the summon in a square, even width should be 1 to place on an intersection
        //
        if (!ARGS.snap) dataObj.snap = (dataObj.width % 2 === 0) ? 1 : -1
        //-----------------------------------------------------------------------------------------------
        // Second Pass on dataObj.  Update callbacks to reflect new default and make sure token mold is
        // suppressed for longed than the introVFX 
        //
        dataObj.callbacks = ARGS.callbacks ?? defVal.callbacks
        dataObj.updates = ARGS.updates ?? defVal.updates
        dataObj.suppressTokenMold = Math.max(dataObj.introTime + 500, dataObj.suppressTokenMold)
        //-----------------------------------------------------------------------------------------------------------------------------------
        // Depending on TL print out the dataObj to the console
        //
        if (TL > 2) {
            jez.trace(`${FNAME} |`)
            for (let key in dataObj) jez.trace(`${FNAME} | dataObj.${key}`, dataObj[key])
        }
        //-----------------------------------------------------------------------------------------------------------------------------------
        // Make sure that warpgate module is active
        //
        if (!game.modules.get(REQUIRED_MODULE)) return jez.badNews(`${FNAME} | ${REQUIRED_MODULE} must be active.  Please fix!`, "error")
        else if (TL > 1) jez.trace(`${FNAME} | Found ${REQUIRED_MODULE} continuing...`)
        //-----------------------------------------------------------------------------------------------------------------------------------
        // Make sure that dataObj.templateName exists in actor directory and stash its data object
        //
        let summonData = await game.actors.getName(dataObj.templateName)
        if (!summonData) return jez.badNews(`${FNAME} | Could not find ${dataObj.templateName} in Actor directory, please fix`, "error")
        else if (TL > 1) jez.trace(`${FNAME} | Found ${summonData} continuing...`, summonData)
        //-----------------------------------------------------------------------------------------------------------------------------------
        // Get and set maximum sumoning range
        //
        const MAX_RANGE = jez.getRange(aItem, dataObj.allowedUnits) ?? dataObj.defaultRange
        if (TL > 1) jez.trace(`${FNAME} | Set MAX_RANGE`, MAX_RANGE);
        //-----------------------------------------------------------------------------------------------------------------------------------
        // Obtain location for spawn
        //
        let { x, y } = await jez.warpCrosshairs(dataObj.source, MAX_RANGE, dataObj.img, dataObj.name,
            { width: dataObj.width }, dataObj.snap, { traceLvl: TL })
        if (!x || !y) return jez.badNews(`Selected out of range.`, 'w')
        if (TL > 1) jez.trace(`${FNAME} | Set location for spawn to ${x}, ${y}`);
        //-----------------------------------------------------------------------------------------------------------------------------------
        // Suppress Token Mold for a wee bit
        //
        jez.suppressTokenMoldRenaming(dataObj.suppressTokenMold)
        await jez.wait(dataObj.waitForSuppress)
        //-----------------------------------------------------------------------------------------------------------------------------------
        // Execute the summon
        //
        if (TL > 3) jez.trace("Calling warpgate.spawnAt(...)", "x", x, "y", y,
            "dataObj.templateName", dataObj.templateName, "dataObj.updates", dataObj.updates,
            "dataObj.callbacks", dataObj.callbacks, "dataObj.options", dataObj.options)
        return (await warpgate.spawnAt({ x, y }, dataObj.templateName, dataObj.updates, dataObj.callbacks, dataObj.options));
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
     * Cancel (drop, delete) concentrating effect if any on passed token's actor
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
    static async dropConcentrating(token5e, options = {}) {
        const FUNCNAME = "doOn(options={})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `jez.${FNAME} |`
        const TL = options.traceLvl ?? 0
        if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
        if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, 'token5e', token5e, 'options', options);
        //-------------------------------------------------------------------------------------------------------------------------------
        // Function Variables
        //
        const EFFECT_NAME = "Concentrating"
        //-------------------------------------------------------------------------------------------------------------------------------
        // Seach the token to find the just added concentrating effect
        //
        await jez.wait(50)
        const EFFECT = await token5e.actor.effects.find(ef => ef.data.label === EFFECT_NAME) ?? null;
        //-------------------------------------------------------------------------------------------------------------------------------
        // Define the desired modification to existing effect. 
        //    
        if (EFFECT) await jez.deleteEffectAsGM(EFFECT.uuid, { traceLvl: TL })
    }

    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********
     * Obtain and return Token5e or PrototypeTokenData object associated with the uuid passed into this 
     * function. UUID is assumed to look like one of the following:
     * 
     *   Linked Actor Item  : Actor.lZ487ouiBiQs3lql.Item.fyhrudodjr8ooucb
     *   Unlinked Actor Item: Scene.MzEyYTVkOTQ4NmZk.Token.lZ487ouiBiQs3lql.Item.fyhrudodjr8ooucb
     * 
     * This function works by starting on the left and processing the UUID until a result is found so 
     * shorter UUIDs like these, also work:
     * 
     *   Linked Actor  : Actor.lZ487ouiBiQs3lql
     *   Unlinked Actor: Scene.MzEyYTVkOTQ4NmZk.Token.lZ487ouiBiQs3lql
     * 
     * Return: Token5e or PrototypeTokenData object.  If function fails, return false
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static async getTokenObjFromUuid(uuid, optionObj = {}) {
        const FUNCNAME = "getTokenObjFromUuid(uuid, optionObj = {})";
        const FNAME = FUNCNAME.split("(")[0]
        const TL = optionObj?.traceLvl ?? 0
        if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
        if (TL > 1) jez.trace(`--- Called --- ${FUNCNAME} ---`, "uuid", uuid, "optionObj", optionObj);
        let sUuid = null    // Sought after UUID
        let sToken = null   // Sought Token5e data object
        //-----------------------------------------------------------------------------------------------
        // Split the UUID up into tokens.  Bail out if odd number of tokens found
        //
        if (TL > 2) jez.trace(`${FNAME} | Our UUID of interest`, uuid);
        const UUID_ARRAY = uuid.split(".")
        let length = UUID_ARRAY.length
        if (TL > 4) for (let i = 0; i < length; i++)
            jez.trace(`${FNAME} | Part ${i} of uuid`, UUID_ARRAY[i]);
        if (length % 2) return jez.badNews(`${FNAME} | Passed UUID has odd number of tokens: ${uuid}`, "e")
        //-----------------------------------------------------------------------------------------------
        // Build the sought for UUID (sUuid)
        //
        if (UUID_ARRAY[0] === "Actor") {        // Apparently dealing with a linked Actor UUID
            if (UUID_ARRAY[1].length !== 16)
                return jez.badNews(`${FNAME} | Second token wrong length: ${uuid}`, "e")
            sUuid = `${UUID_ARRAY[0]}.${UUID_ARRAY[1]}`
        }
        else if (UUID_ARRAY[0] === "Scene") {   // Apparently dealing with an unlinked Actor UUID
            if (UUID_ARRAY[1].length !== 16)
                return jez.badNews(`${FNAME} | Second token (${UUID_ARRAY[1]}) wrong length: ${uuid}`, "e")
            if (UUID_ARRAY[2] !== "Token")
                return jez.badNews(`${FNAME} | Third token (${UUID_ARRAY[2]}) not "Token": ${uuid}`, "e")
            if (UUID_ARRAY[3].length !== 16)
                return jez.badNews(`${FNAME} | Forth token (${UUID_ARRAY[3]}) wrong length: ${uuid}`, "e")
            sUuid = `${UUID_ARRAY[0]}.${UUID_ARRAY[1]}.${UUID_ARRAY[2]}.${UUID_ARRAY[3]}`
        }
        if (!sUuid) return jez.badNews(`${FNAME} | Received UUID not parsed: ${uuid}`, "e");
        //-----------------------------------------------------------------------------------------------
        // Obtain the sought after token data (sToken) data object, looking different places for different
        // object types that can be found.
        //
        let oDataObj = await fromUuid(sUuid)    // Retrieves data object for the UUID
        if (oDataObj?.constructor.name === "TokenDocument5e") {
            if (TL > 2) jez.trace(`${FNAME} | Found a TokenDocument5e, must be unlinked caster`, oDataObj);
            sToken = oDataObj._object           // Nab the Token5e out of aTokenDocument5e
        }
        else if (oDataObj?.constructor.name === "Actor5e") {
            if (TL > 2) jez.trace(`${FNAME} | Found a Actor5e, must be linked caster`, oDataObj);
            sToken = oDataObj.data.token        // PrototypeTokenData object
        }
        else return jez.badNews(`${FNAME} | Obtained neither TokenDocument5e nor Actor5e from ${oDataObj}`, "e")
        if (TL > 4) jez.trace(`${FNAME} | sToken`, sToken)
        if (TL > 2) jez.trace(`${FNAME} | sToken.name`, sToken.name)
        return (sToken)
    }

    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Find all the tokens in range of the origin following exclusion rules described in the options
     * object.  The return is either an object containing Token5e objects that met the criteria or 
     * false if none did.
     * 
     * Arguments
     * ---------
     * origin : Token5e object defining the origin of the effect.
     * RANGE  : Distance, usually in feet, defining maximum range for this list.
     * opts   : optional Object that can have multiple attributes as described below.
     * 
     * Options Attributes (first value is  default)
     * exclude  : string  - self, friendly, none 
     * direction: string  - t2o, o2t  (target to origin or vice versa for 1-way obstuctions)
     * chkMove  : boolean - false, true (check for wall blocking movement)
     * chkSight : boolean - false, true (check for wall blocking light)
     * chkHear  : boolean - false, true (check for wall blocking sound)
     * chkSpeed : boolean - false, true (does the target have any movement?)
     * chkBlind : boolean - false, true (does the target have blinded condition?)
     * chkDeaf  : boolean - false, true (does the target have deafened condition?)
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static async inRangeTargets(origin, RANGE, opts = {}) {
        const FUNCNAME = "jez.inRangeTargets(origin, RANGE, opts = {})";
        const FNAME = FUNCNAME.split("(")[0]
        const TL = opts?.traceLvl ?? 0
        let potTargs = []
        let potTargNames = []
        const TAG = `${FNAME} |`
        const GRID_SIZE = game.scenes.viewed.data.grid
        const GRID_DISTANCE = game.scenes.viewed.data.gridDistance
        if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
        if (TL > 1) jez.trace(`--- Called --- ${FUNCNAME} ---`, "origin", origin, "RANGE", RANGE,
            "opts", opts);
        if (TL > 3) for (let key in opts) jez.trace(`${FNAME} | opts.${key}`, opts[key])
        //-----------------------------------------------------------------------------------------------
        // Setup option values to use, invalid input results in default quietly being used 
        //
        const EV = ["self", "friendly", "none"]
        const DV = ["t2o", "o2t"]
        let optVal = {
            exclude: (EV.includes(opts?.exclude?.toLowerCase())) ? opts?.exclude.toLowerCase() : "self",
            direction: (DV.includes(opts?.direction?.toLowerCase())) ? opts?.direction.toLowerCase() : "t2o",
            chkMove: (opts?.chkMove === true) ? true : false,
            chkSight: (opts?.chkSight === true) ? true : false,
            chkHear: (opts?.chkHear === true) ? true : false,
            chkSpeed: (opts?.chkSpeed === true) ? true : false,
            chkBlind: (opts?.chkBlind === true) ? true : false,
            chkDeaf: (opts?.chkDeaf === true) ? true : false,
        }
        if (TL > 3) for (let key in optVal) jez.trace(`${FNAME} | optVal.${key}`, optVal[key])
        //-----------------------------------------------------------------------------------------------
        //
        //
        canvas.tokens.placeables.forEach(token => {
            //-------------------------------------------------------------------------------------------
            // Define FUDGE for this token so that distance will be checked against an outer square and 
            // not just at the center of the token being checked
            //
            const WIDTH = token.w // The number of screen units wide the token is 
            const TOKEN_SIZE = Math.round(GRID_DISTANCE * WIDTH / GRID_SIZE)
            const FUDGE = (TOKEN_SIZE - 5) / 2
            if (TL > 4) jez.trace(`${TAG} ${token.name} size is ${TOKEN_SIZE} feet, fudge is ${FUDGE}`)
            //-------------------------------------------------------------------------------------------
            // Check distance
            //
            if (!(optVal.exclude === "none") && (origin.name === token.name)) return;   // Active token 
            if (TL > 4) jez.trace(`${TAG} ${token.name} distance is ${jez.getDistance5e(origin, token)}`)
            if (jez.getDistance5e(origin, token) > RANGE + FUDGE) return;               // Out of range 
            //-------------------------------------------------------------------------------------------
            // Maybe check if the target token has same disposition as the caster
            //
            if (optVal.exclude === "friendly") {
                if (origin.data.disposition === token.data.disposition) {
                    if (TL > 2)
                        jez.trace(`${TAG} ${token.name} same disposition as the origin (${origin.data.disposition}), skipping.`)
                    return  // Line of Movement
                }
            }
            //-------------------------------------------------------------------------------------------
            // Define the ray between the two locations
            //
            let ray = null
            if (optVal.direction === "t2o") ray = new Ray(token.center, origin.center)
            else ray = new Ray(origin.center, token.center)
            //-------------------------------------------------------------------------------------------
            // Maybe check if the target token can move to other, that is does a wall block path?
            //
            if (optVal.chkMove) {
                let badLoM = canvas.walls.checkCollision(ray)
                if (TL > 2 && badLoM)
                    jez.trace(`${TAG} ${token.name} movement path blocked (${optVal.direction}), skipping.`)
                if (badLoM) return  // Line of Movement
            }
            //-------------------------------------------------------------------------------------------
            // Maybe check if the target token can see to other, that is does a wall block sight?
            //
            if (optVal.chkSight) {
                let badLoS = canvas.walls.checkCollision(ray, { type: "sight", mode: "any" })
                if (TL > 2 && badLoS)
                    jez.trace(`${TAG} ${token.name} vision path blocked (${optVal.direction}), skipping.`)
                if (badLoS) return  // Line of Sight
            }
            //-------------------------------------------------------------------------------------------
            // Maybe check if the target token can hear to other location, does a wall block sound?
            //
            if (optVal.chkHear) {
                let badLoS = canvas.walls.checkCollision(ray, { type: "sound", mode: "any" })
                if (TL > 2 && badLoS)
                    jez.trace(`${TAG} ${token.name} sound path blocked (${optVal.direction}), skipping.`)
                if (badLoS) return  // Line of Sound
            }
            //-------------------------------------------------------------------------------------------
            // Maybe check if the target token has any movement, is its movement speed zero?
            //
            if (optVal.chkSpeed) {
                let mObj = token.actor.data.data.attributes.movement
                if (!(mObj.burrow > 0 || mObj.climb > 0 || mObj.fly > 0 || mObj.swim > 0 || mObj.walk > 0)) {
                    if (TL > 2) jez.trace(`${TAG} ${token.name} has no movement, skipping.`)
                    return
                }
            }
            //-------------------------------------------------------------------------------------------
            // Maybe check if the target token is binded, has that effect
            //
            if (optVal.chkBlind)
                if (jezcon.hasCE("Blinded", token.actor.uuid, { traceLvl: 0 })) {
                    if (TL > 2) jez.trace(`${TAG} ${token.name} is blind, skipping.`)
                    return
                }
            //-------------------------------------------------------------------------------------------
            // Maybe check if the target token is deafened, has that effect 
            //
            if (optVal.chkDeaf)
                if (jezcon.hasCE("Deafened", token.actor.uuid, { traceLvl: 0 })) {
                    if (TL > 2) jez.trace(`${TAG} ${token.name} is deaf, skipping.`)
                    return
                }
            //-------------------------------------------------------------------------------------------
            // Populate our results arrays
            //
            potTargs.push(token)                    // Add this token to potential targets array
            potTargNames.push(`${token.name} {${token.id}}`)
        });
        if (TL > 0) jez.trace(`${TAG} potTargs`, potTargs)
        for (let i = 0; i < potTargs.length; i++)
            if (TL > 1) jez.trace(`${TAG} ${i + 1}) ${potTargNames[i]} is a potential victim.`)
        if (TL > 2) jez.trace(`--- Finished --- ${FNAME} ---`);
        return potTargs;
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********
    * Process the subject passed returning an Actor5e if possible. 
    * 
    * Inputs
    *   subject: Actor5e, Token5e, or token id
    *   fname: Name of the function calling this
    * 
    * Output
    *   Returns either false or an actor5e data object
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static subjectToActor(subject, fname) {
        let actor5e
        if (!subject) return jez.badNews(`${fname} subject false must be Token5e, Actor5e, or Token.id`, "e")
        if (typeof (subject) === "object") { // Presumably we have a Token5e or Actor5e
            if (subject.constructor.name === "Token5e") actor5e = subject.actor
            else if (subject.constructor.name === "Actor5e") actor5e = subject
            else return jez.badNews(`${fname} subject is type '${typeof (subject)}' not Token5e or Actor5e`, "e")
        } else
            if ((typeof (subject) === "string") && (subject.length === 16))
                actor5e = jez.getTokenById(subject).actor
            else
                return jez.badNews(`${fname} subject is not a Token5e, Actor5e, or Token.id: ${subject}`, "e")
        return actor5e
    }
    /***************************************************************************************************
     * Function that returns the convenientDescription from effectName of the subject
     ***************************************************************************************************/
    static async getCEDesc(subject, effectName, optionObj = {}) {
        const FUNCNAME = "getCEDesc(subject, effect, optionObj={})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `jez.${FNAME} |`
        const TL = optionObj?.traceLvl ?? 0
        if (TL === 1) jez.trace(`--- Called ${FNAME} ---`);
        if (TL > 1) jez.trace(`--- Called ${FUNCNAME} ---`, "subject", subject, "effectName", effectName,
            "optionObj", optionObj);
        //-----------------------------------------------------------------------------------------------
        // Convert subject into actor5e data object
        //
        let actor5e = jez.subjectToActor(subject, FNAME)
        if (TL > 2) jez.trace(`${TAG} actor5e`, actor5e)
        if (!actor5e) jez.badNews(`${TAG} Can not continue`, "e")
        //-----------------------------------------------------------------------------------------------
        // Grab the data object from the subject for effectName, trying up to 20 times, chilling 10ms 
        // after each attempt.
        //
        let effect
        for (let i = 1; i <= 20; i++) {
            effect = actor5e.effects.find(i => i.data.label === effectName);
            if (effect) break
            console.log(`Attempt #`, i)
            await jez.wait(20)
        }
        if (TL > 2) jez.trace(`${TAG} actor5e effect`, effect)
        if (!effect) return jez.badNews(`"${effectName}" not found on subject`, "i")
        //-----------------------------------------------------------------------------------------------
        // return the convienetDescription
        //
        return effect.data.flags.convenientDescription
    }
    /***************************************************************************************************
     * Function that sets the convenientDescription to description on effectName of the subject
     ***************************************************************************************************/
    static async setCEDesc(subject, effectName, description, optionObj = {}) {
        const FUNCNAME = "setCEDesc(subject, effect, description, optionObj={})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `jez.${FNAME} |`
        const TL = optionObj?.traceLvl ?? 0
        if (TL === 1) jez.trace(`--- Called ${FNAME} ---`);
        if (TL > 1) jez.trace(`--- Called ${FUNCNAME} ---`, "subject", subject, "effectName", effectName,
            "description", description, "optionObj", optionObj);
        //-----------------------------------------------------------------------------------------------
        // Chill for a little bit to make sure the effect being modified has settled down
        //
        await jez.wait(150)
        //-----------------------------------------------------------------------------------------------
        // Convert subject into actor5e data object
        //
        let actor5e = jez.subjectToActor(subject, FNAME)
        if (TL > 2) jez.trace(`${TAG} actor5e`, actor5e)
        if (!actor5e) jez.badNews(`${TAG} Can not continue`, "e")
        //-----------------------------------------------------------------------------------------------
        // Grab the data object from the subject for effectName
        //
        let effect = actor5e.effects.find(i => i.data.label === effectName);
        if (TL > 2) jez.trace(`${TAG} actor5e effect`, effect)
        if (!effect) return jez.badNews(`"${effectName}" not found on subject`, "i")
        //-----------------------------------------------------------------------------------------------
        // modify the description
        //
        effect.data.flags = { convenientDescription: description }
        if (TL > 2) jez.trace(`${TAG} effect.data.flags`, effect.data.flags)
        await effect.data.update({ 'flags': effect.data.flags });
        if (TL > 2) jez.trace(`${TAG} effect.data`, effect.data)
        await effect.update({ 'changes': effect.data.changes });
        if (TL > 2) jez.trace(`${TAG} effect`, effect)
    }
    /***************************************************************************************************
     * Call CEDescUpdate(...), a Run as GM wrapper for setCEDesc(...) 
     ***************************************************************************************************/
    static async setCEDescAsGM(subject, effectName, description, optionObj = {}) {
        const FUNCNAME = "setCEDescAsGM(subject, effect, description, optionObj={})";
        const FNAME = FUNCNAME.split("(")[0]
        const TL = optionObj?.traceLvl ?? 0
        if (TL === 1) jez.trace(`--- Called ${FNAME} ---`);
        if (TL > 1) jez.trace(`--- Called ${FUNCNAME} ---`, "subject", subject, "effectName", effectName,
            "description", description, "optionObj", optionObj);
        //-----------------------------------------------------------------------------------------------
        // Make sure our Run as GM Macro exists and has appropriate permission
        //
        const CEDescUpdate = game.macros?.getName("CEDescUpdate");
        if (!CEDescUpdate) return jez.badNews(`Cannot locate CEDescUpdate GM Macro`, "e");
        if (!CEDescUpdate.data.flags["advanced-macros"].runAsGM)
            return jez.badNews(`CEDescUpdate "Execute as GM" needs to be checked.`, "e");
        //-----------------------------------------------------------------------------------------------
        // Call the Macro with arguments
        //
        CEDescUpdate.execute(subject, effectName, description);
        // CEDescUpdate.execute(subject, effectName, description, optionObj);
    }

    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Fires a Beholder type eye ray at the target, effects controlled by passed options.
     * 
     * Many options exist, peak into code for what is available.
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static async fireRay(TARGET_TOKEN, ACTIVE_TOKEN, OPTIONS = {}) {
        const FUNCNAME = "fireRay(TARGET_TOKEN, options = {})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `jez.${FNAME} |`
        const TL = OPTIONS.traceLvl ?? 0
        if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
        if (TL > 1) jez.trace(`${TAG} --- Starting ${FNAME} ---`, "TARGET_TOKEN", TARGET_TOKEN,
            "ACTIVE_TOKEN", ACTIVE_TOKEN, "OPTIONS", OPTIONS);
        //-----------------------------------------------------------------------------------------------
        // Read OPTIONS obj, stashing contents into local variables or setting to default values
        //
        const RAY_NAME = OPTIONS.RayName ?? "Devour Magic"
        const VFX_COLOR = OPTIONS.VFXColor ?? "*"
        let ceDesc = OPTIONS.ceDesc ?? `Randomly selected magic item affected by ${ACTIVE_TOKEN.name}'s ${RAY_NAME}`
        const SAVE_TYPE = OPTIONS.saveType ?? "dex";
        const SAVE_DC = OPTIONS.saveDC ?? ACTIVE_TOKEN.actor.data.data.attributes.spelldc
        const EFFECT_ICON = OPTIONS.icon ?? "systems/dnd5e/icons/skills/yellow_26.jpg"
        const EFFECT_NAME = OPTIONS.effectName ?? false
        const DAMAGE_ROLL = OPTIONS.damageRoll ?? false
        const DAMAGE_TYPE = OPTIONS.damageType ?? false
        const ACTIVE_ITEM = OPTIONS.aItem ?? null
        const PUSH_BACK = OPTIONS.pushBack ?? 0
        const CHANGES = OPTIONS.changes ?? [{ key: `flags.gm-notes.notes`, mode: jez.ADD, value: ceDesc, priority: 20 }]
        const SPEC_DUR = OPTIONS.specDur ?? ["turnStartSource", "newDay", "longRest", "shortRest"]
        const ROUNDS = OPTIONS.rounds ?? 2
        //-----------------------------------------------------------------------------------------------
        // Set additional local variables
        //
        const FLAVOR = `Attempt <b>DC${SAVE_DC} ${SAVE_TYPE} save`;
        let saved = true                                            // Success/Failure of save
        const GAME_RND = game.combat ? game.combat.round : 0;
        let msg = ""
        //------------------------------------------------------------------------------------------------
        // Launch an appropriate RayVXF from the source to the target
        //
        VFXRay(ACTIVE_TOKEN, TARGET_TOKEN, VFX_COLOR, { traceLvl: TL })
        //-----------------------------------------------------------------------------------------------
        // Roll an appropriate saving throw for our target
        //
        let saveObj = (await TARGET_TOKEN.actor.rollAbilitySave(SAVE_TYPE, { flavor: FLAVOR, chatMessage: true, fastforward: true }));
        let saveRoll = saveObj.total
        if (TL > 1) jez.trace(`${TAG} ${TARGET_TOKEN.name} rolled a ${saveRoll}`);
        if (saveRoll < SAVE_DC) saved = false
        //-----------------------------------------------------------------------------------------------
        // If save was failed, and an effect name supplied apply an appropriate effect to TARGET_TOKEN
        //
        if (EFFECT_NAME) {
            if (!saved) {
                if (TL > 1) jez.trace(`${TAG} ${TARGET_TOKEN.name} - Failed & Effect Named`);
                let effectData = [
                    {
                        label: EFFECT_NAME,
                        icon: EFFECT_ICON,
                        origin: ACTIVE_TOKEN.actor.uuid,
                        disabled: false,
                        duration: { rounds: ROUNDS, seconds: ROUNDS * 6, startRound: GAME_RND, startTime: game.time.worldTime },
                        flags: {
                            dae: { specialDuration: SPEC_DUR },
                            convenientDescription: ceDesc,
                            core: { statusId: true }
                        },
                        // changes: [{ key: `flags.gm-notes.notes`, mode: jez.ADD, value: ceDesc, priority: 20 }],
                        changes: CHANGES,
                    }];
                jez.log("effectData", effectData)
                MidiQOL.socket().executeAsGM("createEffects", { actorUuid: TARGET_TOKEN.actor.uuid, effects: effectData });
            }
            else ceDesc = `Unaffected.`    // No effect on a save
        }
        //-----------------------------------------------------------------------------------------------
        // If damage roll indicated by settings of options parameter, roll and apply some damage
        //
        if (DAMAGE_ROLL && DAMAGE_TYPE) {
            if (TL > 1) jez.trace(`${TAG} Need to apply ${DAMAGE_ROLL} ${DAMAGE_TYPE} damage to ${TARGET_TOKEN.name}`);
            // Roll some damage
            let damageRoll = new Roll(`${DAMAGE_ROLL}`).evaluate({ async: false });
            if (TL > 1) jez.trace(`${TAG} Damage Rolled ${damageRoll.total}`, damageRoll)
            game.dice3d?.showForRoll(damageRoll);
            // Apply full damage to target, if it failed its save, otherwise half
            if (!saved) {
                new MidiQOL.DamageOnlyWorkflow(ACTIVE_TOKEN.actor, TARGET_TOKEN, damageRoll, DAMAGE_TYPE, [], damageRoll,
                    { flavor: "No Workie", itemCardId: "new" /*args[0].itemCardId*/ });
                MidiQOL.applyTokenDamage([{ damage: damageRoll.total, type: DAMAGE_TYPE }], damageRoll.total,
                    new Set([TARGET_TOKEN]), ACTIVE_ITEM, new Set());
                ceDesc = `It took ${damageRoll.total} ${DAMAGE_TYPE} damage.`
            }
            else {
                let halfdam = Math.floor(damageRoll.total / 2)
                new MidiQOL.DamageOnlyWorkflow(ACTIVE_TOKEN.actor, TARGET_TOKEN, damageRoll, DAMAGE_TYPE, [], damageRoll,
                    { flavor: "No workie", itemCardId: "new" /*args[0].itemCardId*/ });
                MidiQOL.applyTokenDamage([{ damage: halfdam, type: DAMAGE_TYPE }], halfdam,
                    new Set([TARGET_TOKEN]), ACTIVE_ITEM, new Set());
                ceDesc = `It took ${halfdam} ${DAMAGE_TYPE} damage.`
            }

        }
        //-----------------------------------------------------------------------------------------------
        // If push back indicated by settings of options parameter, push the target back 15.  
        //
        if (PUSH_BACK && !saved) {
            let distance = 0
            // Values of 1,2,3 are fine, just use as count of spaces to push back
            const ALLOWED_PUSH_BACK = [3, 2, 1, 0, -1, -2, -3]
            if (ALLOWED_PUSH_BACK.includes(PUSH_BACK)) distance = PUSH_BACK
            // Other values should be distance in feet, so divide by 5 and make an integer
            else distance = Math.ceil(PUSH_BACK / 5)
            if (TL > 2) jez.trace(`${TAG}`, `distance  ==>`, distance, 'PUSH_BACK ==>', PUSH_BACK)
            if (!ALLOWED_PUSH_BACK.includes(distance))
                return jez.badNews(`${TAG} Unsupported knockback distance, ${distance}`, "e")
            if (TL > 1) jez.trace(`${TAG} Pushback ${TARGET_TOKEN.name} ${distance} spaces from ${ACTIVE_TOKEN.name}`,
                "ACTIVE_TOKEN", ACTIVE_TOKEN, "TARGET_TOKEN", TARGET_TOKEN)
            jez.moveToken(ACTIVE_TOKEN, TARGET_TOKEN, distance, 750)
        }
        //-----------------------------------------------------------------------------------------------
        // Post an appropriate message
        //
        if (saved) msg = `<b>${TARGET_TOKEN.name}</b> saved versus <b>${RAY_NAME}</b>; rolling a 
        ${saveRoll} ${SAVE_TYPE.toUpperCase()} save vs ${SAVE_DC} DC. ${ceDesc}`
        else msg = `<b>${TARGET_TOKEN.name}</b> failed to save versus <b>${RAY_NAME}</b>; rolling a 
        ${saveRoll} ${SAVE_TYPE.toUpperCase()} save vs ${SAVE_DC} DC. ${ceDesc}`
        if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
        return (msg);
        /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
        * Run VFX from the aToken to the provded tToken, using the provided color.
        *
        * Colors expected to be used:
        *  DevourMagicRay: rainbow02
        *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
        async function VFXRay(aToken, tToken, color, options = {}) {
            const FUNCNAME = "VFXRay(tToken, color, options = {})";
            const FNAME = FUNCNAME.split("(")[0]
            const TAG = `jez.lib ${FNAME} |`
            const TL = options.traceLvl ?? 0
            if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
            if (TL > 1) jez.trace(`${TAG} --- Starting ${FNAME} ---`, "tToken", tToken, "color", color,
                "options", options);
            //-----------------------------------------------------------------------------------------------
            new Sequence()
                .effect()
                //.file("jb2a.scorching_ray.01.rainbow02")
                .file(`jb2a.scorching_ray.01.${color}`)
                .atLocation(aToken)
                .stretchTo(tToken)
                .play()
        }
    }
    /***************************************************************************************************
     * Add/Remove/Toggle combat state, defined by ACTION, for the tokens specified by SUBJECT.
     * 
     * ACTTION can be: "Add", "Remove", or "Toggle"
     * 
     * SUBJECT can be an atomic value or an array of any of these data types:
     *  - Token5e Data Object
     *  - TokenDocument5e Data Object
     *  - Token ID
     *  - Token Document UUID
     * 
     * Options has one defined field:
     *  - traceLvl: Trace Level for this function call.
     *
     ***************************************************************************************************/
    static async combatAddRemove(ACTION, SUBJECT, options = {}) {
        const FUNCNAME = "jez.combatAddRemove(ACTION, SUBJECT, options = {})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `jez.lib ${FNAME} |`
        const TL = options.traceLvl ?? 0
        const ALLOWED_ACTIONS = ["Add", "Remove", "Toggle"]
        if (TL === 2) jez.trace(`${TAG} --- Starting --- ${FNAME} ---`);
        if (TL > 2) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,
            "ACTION  ==>", ACTION, "SUBJECT ==>", SUBJECT, "options ==>", options);
        //----------------------------------------------------------------------------------------------
        // Grab the RunAsGM Macros
        //
        const GM_TOGGLE_COMBAT = jez.getMacroRunAsGM("ToggleCombatAsGM")
        if (!GM_TOGGLE_COMBAT) { return false }
        //----------------------------------------------------------------------------------------------
        // Validate ACTION is one of allowed actions
        //
        if (!ALLOWED_ACTIONS.includes(ACTION))
            if (TL > 2) jez.trace(`${TAG} Action Choosen:`, ACTION)
            else return jez.badNews(`${TAG} Unsupported Action, ${ACTION}, must be in:`, ALLOWED_ACTIONS)
        //----------------------------------------------------------------------------------------------
        // Validate SUBJECT received, it can be a single or array of the following types:
        // Token5e data object, token.document.uuid, token.id (all must be same type)
        //
        if (jez.typeOf(SUBJECT) === "array")   // Processing an array of critters
            for (let i = 0; i < SUBJECT.length; i++) processOneEntity(ACTION, SUBJECT[i], { traceLvl: TL })
        else processOneEntity(ACTION, SUBJECT, { traceLvl: TL })
        //----------------------------------------------------------------------------------------------
        // Release any selected (controlled) objects to keep them from being affected by this macro
        // This is needed as toggleCombat() will affect all controlled tokens.
        //
        await canvas.tokens.releaseAll()
        //----------------------------------------------------------------------------------------------
        // Process a single entity, may need to call for each element of an array
        //
        async function processOneEntity(ACTION, SUBJECT, options = {}) {
            const FUNCNAME = "processOneEntity(ACTION, SUBJECT, options = {})";
            const FNAME = FUNCNAME.split("(")[0]
            const TAG = `jez.lib ${FNAME} |`
            const TL = options.traceLvl ?? 0
            if (TL === 2) jez.trace(`${TAG} --- Starting --- ${FNAME} ---`);
            if (TL > 2) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,
                "ACTION  ==>", ACTION, "SUBJECT ==>", SUBJECT, "options ==>", options);
            //----------------------------------------------------------------------------------------------
            // Set Boolean Flow Control constants based on Action setting
            //
            const COMBAT_ADD = (ACTION === "Add") ? true : false;
            const COMBAT_REM = (ACTION === "Remove") ? true : false;
            const COMBAT_TOG = (ACTION === "Toggle") ? true : false;
            //----------------------------------------------------------------------------------------------
            // Determine the type of Subject
            //
            // let subjectType = jez.typeOf(SUBJECT)
            let subjectType = ""
            if (jez.typeOf(SUBJECT) === "object") {
                if (SUBJECT?.constructor?.name === "Token5e") subjectType = `Token5e`
                if (SUBJECT?.constructor?.name === "TokenDocument5e") subjectType = `TokenDocument5e`
            } else if (jez.typeOf(SUBJECT) === "string") {
                if (SUBJECT.length === 16) subjectType = `token.id`
                else if (SUBJECT.length === 45) subjectType = `token.document.uuid`
                else subjectType = `Garbage`
            } else subjectType = `Garbage`
            if (TL > 0) jez.trace(`${TAG} Processing ${subjectType}`, SUBJECT)
            if (subjectType === 'Garbage') return jez.badNews(`Seemingly passed some icky junk: ${SUBJECT}`)
            //----------------------------------------------------------------------------------------------
            // Need to convert SUBJECT into a _token.document.uuid
            //
            let subjectDocumentUuid = ""
            let dToken
            switch (subjectType) {
                case 'Token5e':
                    subjectDocumentUuid = SUBJECT.document.uuid
                    dToken = SUBJECT
                    break;
                case 'TokenDocument5e':
                    subjectDocumentUuid = SUBJECT.uuid
                    dToken = SUBJECT._object
                    break;
                case 'token.id':
                    dToken = await canvas.tokens.placeables.find(ef => ef.id === SUBJECT)
                    subjectDocumentUuid = dToken.document.uuid
                    break;
                case 'token.document.uuid':
                    subjectDocumentUuid = SUBJECT
                    let dTokenDocument5e = await fromUuid(SUBJECT)
                    dToken = dTokenDocument5e._object
                    break;
                default:
                    return jez.badNews(`This should not happen! Choked on ${SUBJECT}`)
            }
            if (TL > 0) jez.trace(`${TAG} token.document.uuid ${subjectDocumentUuid}`, dToken)
            //----------------------------------------------------------------------------------------------
            // Determine if the subject is currently in combat
            //
            let inCombat = false
            if (dToken?.combatant?.id) inCombat = true
            if (TL <= 1) jez.trace(`${TAG} ${dToken.name} in combat?`, inCombat)
            if (TL > 1) jez.trace(`${TAG} Adding to combat`,
                "inCombat ==>", inCombat,
                "dToken.name ==>", dToken.name,
                "COMBAT_ADD ==>", COMBAT_ADD,
                "COMBAT_REM ==>", COMBAT_REM,
                "COMBAT_TOG ==>", COMBAT_TOG,
                "subjectDocumentUuid ==>", subjectDocumentUuid)
            //----------------------------------------------------------------------------------------------
            // Toggle combat if not in combat and Action is Add
            //
            if (COMBAT_ADD && !inCombat) await GM_TOGGLE_COMBAT.execute(subjectDocumentUuid)
            //----------------------------------------------------------------------------------------------
            // Toggle combat if not in combat and Action is Remove
            //
            if (COMBAT_REM && inCombat) await GM_TOGGLE_COMBAT.execute(subjectDocumentUuid)
            //----------------------------------------------------------------------------------------------
            // Toggle combat if Action is Toggle
            //
            if (COMBAT_TOG) await GM_TOGGLE_COMBAT.execute(subjectDocumentUuid)
        }
    }
    /***************************************************************************************************
     * Roll initatives for passed token(s) (SUBJECT) this can be an atomic value or an array of any of 
     * these data types:
     *  - Token5e Data Object
     *  - TokenDocument5e Data Object
     *  - Token ID
     *  - Token Document UUID
     * 
     * Options has three defined fields:
     *  - traceLvl: Trace Level for this function call.
     *  - formula: forumla passed to Roll function, if not using default, this might be a "20" if
     *    forcing the initiative roll result.
     * - reroll: Boolean that if true will force a roll for combatants regardless of having an initiative
     *   default is false.
     * 
     * This function will roll initiative for the tokens that are in combat and don't currently have an
     * initiative value. 
     ***************************************************************************************************/
    static async combatInitiative(SUBJECT, options = {}) {
    // async function combatInitiative(SUBJECT, options = {}) {
        const FUNCNAME = "combatInitiative(SUBJECT, options = {})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `jez.lib ${FNAME} |`
        const TL = options.traceLvl ?? 0
        const REROLL = options.reroll ?? false
        let formula = options.formula ?? null  // Used to force a roll result, e.g. 20
        if (TL === 2) jez.trace(`${TAG} --- Starting --- ${FNAME} ---`);
        if (TL > 2) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,
            "SUBJECT ==>", SUBJECT, "options ==>", options, 'TL', TL, 'REROLL', REROLL);
        //----------------------------------------------------------------------------------------------
        // Define Variables
        //
        let combatantIds = []
        //----------------------------------------------------------------------------------------------
        // Grab the RunAsGM Macros
        //
        const GM_ROLL_INITIATIVE = jez.getMacroRunAsGM("RollInitiativeAsGM")
        if (!GM_ROLL_INITIATIVE) { return false }
        //----------------------------------------------------------------------------------------------
        // If input Formula is a number, flip it to a string
        //
        if (typeof formula === 'number') formula = formula.toString();
        //----------------------------------------------------------------------------------------------
        // Validate SUBJECT received, it can be a single or array of the following types:
        // Token5e data object, Token Document obj, token.document.uuid, token.id (all must be same type)
        // and build array of combatant Ids.
        //
        if (jez.typeOf(SUBJECT) === "array")   // Processing an array of critters
            for (let i = 0; i < SUBJECT.length; i++) {
                combatantIds.push(await processOneEntity(SUBJECT[i], { traceLvl: TL, reroll: REROLL }))
            }
        else {
            combatantIds.push(await processOneEntity(SUBJECT, { traceLvl: TL, reroll: REROLL }))
        }
        //----------------------------------------------------------------------------------------------
        // Make call to roll initiatives
        //
        if (TL > 2) jez.trace(`${TAG} Call GM_ROLL_INITIATIVE`,'combatantIds',combatantIds,'formula',formula)
        await GM_ROLL_INITIATIVE.execute(combatantIds, formula)
        //----------------------------------------------------------------------------------------------
        // Process a single entity, may need to call for each element of an array
        //
        async function processOneEntity(SUBJECT, options = {}) {
            const FUNCNAME = "processOneEntity(SUBJECT, options = {})";
            const FNAME = FUNCNAME.split("(")[0]
            const TAG = `jez-lib ${FNAME} |`
            const TL = options.traceLvl ?? 0
            const REROLL = options.reroll ?? false
            if (TL === 2) jez.trace(`${TAG} --- Starting --- ${FNAME} ---`);
            if (TL > 2) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,
                "SUBJECT ==>", SUBJECT, "options ==>", options, 'TL', TL, 'REROLL', REROLL);
            //----------------------------------------------------------------------------------------------
            // Determine the type of Subject
            //
            // let subjectType = jez.typeOf(SUBJECT)
            let subjectType = ""
            if (jez.typeOf(SUBJECT) === "object") {
                if (SUBJECT?.constructor?.name === "Token5e") subjectType = `Token5e`
                if (SUBJECT?.constructor?.name === "TokenDocument5e") subjectType = `TokenDocument5e`
            } else if (jez.typeOf(SUBJECT) === "string") {
                if (SUBJECT.length === 16) subjectType = `token.id`
                else if (SUBJECT.length === 45) subjectType = `token.document.uuid`
                else subjectType = `Garbage`
            } else subjectType = `Garbage`
            if (TL > 0) jez.trace(`${TAG} Processing ${subjectType}`, SUBJECT)
            if (subjectType === 'Garbage') return jez.badNews(`Seemingly passed some icky junk: ${SUBJECT}`)
            //----------------------------------------------------------------------------------------------
            // Need to extract a combatantId from SUBJECT data
            //
            let combatantId
            let initiative
            switch (subjectType) {
                case 'Token5e':
                    if (!SUBJECT?.combatant?.id) return (null)
                    combatantId = SUBJECT?.combatant?.id
                    initiative = SUBJECT?.combatant?.data?.initiative
                    break;
                case 'TokenDocument5e':
                    if (!SUBJECT?.combatant?.id) return (null)
                    combatantId = SUBJECT?.combatant?.id
                    initiative = SUBJECT?.combatant?.data?.initiative
                    break;
                case 'token.id':
                    let dToken = await canvas.tokens.placeables.find(ef => ef.id === SUBJECT)
                    if (!dToken?.combatant?.id) return (null)
                    combatantId = dToken?.combatant?.id
                    initiative = dToken?.combatant?.data?.initiative
                    break;
                case 'token.document.uuid':
                    let dTokenDocument5e = await fromUuid(SUBJECT)
                    if (!dTokenDocument5e?.combatant?.id) return (null)
                    combatantId = dTokenDocument5e?.combatant?.id
                    initiative = dTokenDocument5e?.combatant?.data?.initiative
                    break;
                default:
                    return jez.badNews(`This should not happen! Choked on ${SUBJECT}`)
            }
            if (initiative && !REROLL) {
                if (TL > 2) jez.trace(`${TAG} Skipping ${dToken.name} already has an initiatve ${initiative} value and REROLL not specified`)
                return (null)
            }
            if (TL > 0) jez.trace(`${TAG} combatantId`, combatantId)
            if (TL > 2) jez.trace(`${TAG} Returning combatantId (${combatantId}) to roll initiatve`)
            return (combatantId)
        }
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Refund a spellSlot and post appropriate message.  This function recognizes warlocks and uses their
     * pact slots instead of normal spell slots.  
     * 
     * It checks to make sure that the refunded slot will not put the actor above their max, but it can
     * refund a spell slot that wasn't actually used.  Unless specified, it posts a chat card explaining
     * what it has done.
     * 
     * Inputs:
     * ------
     * token5e: Token5e data object whose actor should receive the refund
     * SPELL_LEVEL: level of spell to refund.  Often this should be: args[args.length - 1].spellLevel
     * options: data object with three potential members:
     *  1. traceLvl: Trace level for execution, typically TL or 0, defaults to 0
     *  2. quiet: Boolean that supresses the chatcard when true, defaults to false
     *  3. spellName: Name of spell for chatcard, defaults to blank 
     * 
     * Sample Call
     * -----------
     * const LAST_ARG = args[args.length - 1]
     * jez.refundSpellSlot(aActor, LAST_ARG.spellLevel, {traceLvl:TL, quiet:false, spellName:aItem.name})
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static async refundSpellSlot(token5e, SPELL_LEVEL, options = {}) {
        const FUNCNAME = "doEach(options={})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `jez.lib ${FNAME} |`
        const TL = options.traceLvl ?? 0
        const QUIET = options.quiet ?? false
        const SPELL_NAME = options.spellName ?? ""
        const VERSION = Math.floor(game.VERSION);
        if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
        if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "token5e", token5e,
            "SPELL_LEVEL", SPELL_LEVEL, "options", options);
        //-----------------------------------------------------------------------------------------------
        // Define some values
        //
        let actor5e = token5e.actor
        const ACTOR_DATA = actor5e.data.data
        const CASTING_STAT = ACTOR_DATA.attributes.spellcasting
        if (TL > 2) jez.trace(`${TAG} Actor Data`, `ACTOR_DATA`, ACTOR_DATA, `CASTING_STAT`, CASTING_STAT)
        let spellUpdate = {};
        let spellSlot;
        let spellSlotMsg = ""
        //-----------------------------------------------------------------------------------------------
        // Handle warlocks a bit special
        //
        if ((actor5e._classes?.warlock) && (CASTING_STAT === "cha")) {
            if (TL > 1) jez.trace(`${TAG} Processing as warlock`)
            spellSlot = "pact";
            spellSlotMsg = "Pact"
        }
        else {
            if (TL > 1) jez.trace(`${TAG} Processing as not warlock`)
            spellSlot = "spell" + SPELL_LEVEL;
            spellSlotMsg = `Level ${SPELL_LEVEL}`
        }
        //-----------------------------------------------------------------------------------------------
        // Make sure we are not already at max spell slots. If we are just return.
        //
        const MAX_SLOTS = ACTOR_DATA.spells[spellSlot].max
        if (TL > 2) jez.trace(`${TAG} Max slots for ${spellSlot}`, MAX_SLOTS)
        if (ACTOR_DATA.spells[spellSlot].value >= ACTOR_DATA.spells[spellSlot].max)
            return false
        //-----------------------------------------------------------------------------------------------
        // Get spell slot data
        //
        if (TL > 2) jez.trace(`${TAG} spellSlot`, spellSlot)
        let currentSlot = ACTOR_DATA.spells[spellSlot].value;
        if (TL > 2) jez.trace(`${TAG} currentSlot`, currentSlot)
        spellUpdate[`${VERSION > 9 ? "system" : "data"}.spells.${spellSlot}.value`] = currentSlot + 1;
        await actor5e.update(spellUpdate);
        //-----------------------------------------------------------------------------------------------
        // Build and post message if not in QUIET mode
        //
        const TITLE = (SPELL_NAME) ? `Refunded ${SPELL_NAME} Slot` : 'Refunded Spell Slot'
        let msg = `Refunded <b>${spellSlotMsg}</b> spell slot to <b>${token5e.name}</b>. If spell was cast 
    without using a spell slot, please manually correct available spells.`
        if (!QUIET) {
            if (TL > 1) jez.trace(`${TAG} ${msg}`)
            jez.postMessage({
                color: jez.randomDarkColor(), fSize: 14, icon: 'Icons_JGB/Misc/Jez.png',
                msg: msg, title: TITLE, token: null
            })
        } else if (TL > 1) jez.trace(`${TAG} Quiet!`, msg)
        return true
    }

    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
     * isNPC(actorUuid) - Returns true if the identified actor is a NPC, false otherwise
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
    static async isNPC(actorUuid, options = {}) {
        const FUNCNAME = "isNPC(actorUuid, options = {})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `jez.${FNAME} |`
        const TL = options.traceLvl ?? 0
        if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
        if (TL > 1) jez.trace(`${TAG} --- Starting ${FUNCNAME}`, 'actorUuid', actorUuid, "options", options);
        //-------------------------------------------------------------------------------------------------------------------------------
        // Function variables
        //
        const ACTOR_DATA = await fromUuid(actorUuid)
        if (TL > 1) jez.trace(`${TAG} Data Accessed`, 'ACTOR_DATA', ACTOR_DATA)
        const IS_NPC = (jez.isActor5e(ACTOR_DATA)) ? false : true
        if (TL > 1) jez.trace(`${TAG} IS_NPC`, IS_NPC)
        //-------------------------------------------------------------------------------------------------------------------------------
        //
        return IS_NPC
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
     * isPC(actorUuid) - Returns true if the identified actor is a PC (not a NPC), false otherwise
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
    static async isPC(actorUuid, options = {}) {
        const FUNCNAME = "isPC(actorUuid, options = {})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `jez.${FNAME} |`
        const TL = options.traceLvl ?? 0
        if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
        if (TL > 1) jez.trace(`${TAG} --- Starting ${FUNCNAME}`, 'actorUuid', actorUuid, "options", options);
        //-------------------------------------------------------------------------------------------------------------------------------
        // Function variables
        //
        const ACTOR_DATA = await fromUuid(actorUuid)
        if (TL > 1) jez.trace(`${TAG} Data Accessed`, 'ACTOR_DATA', ACTOR_DATA)
        const IS_PC = (jez.isActor5e(ACTOR_DATA)) ? true : false
        // const IS_PC = (ACTOR_DATA?._actor?.type === "character") ? true : false
        if (TL > 1) jez.trace(`${TAG} IS_PC`, IS_PC)
        //-------------------------------------------------------------------------------------------------------------------------------
        //
        return IS_PC
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
     * resourceSpend((actor5eUuid, resourceName, aItemUuid) - For PCs, decrement resource, verifying it exists and at least a value of 1.
     * 
     * Inputs Required:
     *  - actor5eUuid: Actor UUID e.g. 'Actor.qvVZIQGyCMvDJFtG' (linked) or 'Scene.MzEyYTVkOTQ4NmZk.Token.HNjb9QaxP5K1V1NG' (unlinked)
     *  - resourceName: String that must match (exactly) one of a PC's predefined resource slots
     *  - aItemUuid: Item UUID on the calling macro, e.g. "Scene.MzEyYTVkOTQ4NmZk.Token.HNjb9QaxP5K1V1NG.Item.9vm3k6d26nbuqezf"
     *  - options: Two supported option fields.
     * 
     * Options
     *  - traceLvl: Integer controlling verbosity of logging.  Default is 0 which is silent
     *  - quiet: boolean value.  Default is false which enables display of error messages.  True suppresses them.
     *  
     * Return values:
     *  - -1:    actor is a NPC making this irrelevant
     *  - True:  PC actor's resource successfully decrimented
     *  - False: Resource was not found (not set on actor)
     *  - Zero:  PC actor's resource was already zero (or below), and could not be decrimented
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
    static async resourceSpend(actor5eUuid, resourceName, aItemUuid, options = {}) {
        const FUNCNAME = "resourceSpend(actor5eUuid, resourceName, options = {})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `jez.${FNAME} |`
        const TL = options.traceLvl ?? 0
        const QUIET = options.quiet ?? false
        if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
        if (TL > 1) jez.trace(`${TAG} --- Starting ${FUNCNAME}`, 'actor5eUuid', actor5eUuid, 'resourceName', resourceName,
            'aItemUuid', aItemUuid, "options", options);
        //-------------------------------------------------------------------------------------------------------------------------------
        // Function variables
        //
        let aItem = await fromUuid(aItemUuid)
        let actor5e = await fromUuid(actor5eUuid)
        if (TL > 1) jez.trace(`${TAG} Data Accessed`, 'aItem  ', aItem, 'actor5e', actor5e)
        const IS_NPC = await jez.isNPC(actor5eUuid, { traceLvl: 0 })
        const RESOURCE_NAME = resourceName
        //-------------------------------------------------------------------------------------------------------------------------------
        //
        if (IS_NPC) {
            if (TL > 2) jez.trace(`${TAG} Processing ${actor5e.name} as NPC`)
            const ITEM_USES = await jez.getItemUses(aItem, { traceLvl: TL })
            if (TL > 2) jez.trace(`${TAG} Resource Values for NPC: ${actor5e.name}`, "ITEM_USES", ITEM_USES)
            if (ITEM_USES.max) return false // If max charges isn't set, this item is not set up correctly
            if (!QUIET) jez.badNews(`Make sure limited daily uses are configured for ${aItem.name}.`, 'i')
            return -1;
        }
        //-------------------------------------------------------------------------------------------------------------------------------
        // Set variables for this function
        //
        let resourceSlot = null
        const ACTOR_DATA = await actor5e.getRollData();
        let usesVal, usesMax
        //-------------------------------------------------------------------------------------------------------------------------------
        // Figure our which slot has our resource and get the current and maximum value
        //
        if (TL > 2) jez.trace(`${TAG} Processing ${actor5e.name} as PC`)
        let resourceList = [{ name: "primary" }, { name: "secondary" }, { name: "tertiary" }];
        let resourceValues = Object.values(ACTOR_DATA.resources);
        let resourceTable = mergeObject(resourceList, resourceValues);
        let findResourceSlot = resourceTable.find(i => i.label.toLowerCase() === RESOURCE_NAME.toLowerCase());
        if (!findResourceSlot) {
            if (!QUIET) jez.badNews(`${RESOURCE_NAME} Resource is missing on ${aToken.name}, Please add it.`, 'i');
            return false
        }
        resourceSlot = findResourceSlot.name;
        usesVal = ACTOR_DATA.resources[resourceSlot].value;
        usesMax = ACTOR_DATA.resources[resourceSlot].max;
        if (TL > 2) jez.trace(`${TAG} Resource Values for PC: ${actor5e.name}`, "resourceList     ", resourceList,
            "resourceTable    ", resourceTable, "findResourceSlot ", findResourceSlot,
            'usesVal          ', usesVal, 'usesMax          ', usesMax)
        if (usesVal < 1) {
            console.log(`There are no ${RESOURCE_NAME} charges available.`)
            if (!QUIET) jez.badNews(`There are no ${RESOURCE_NAME} charges available.`, 'i');
            console.log(`There are no ${RESOURCE_NAME} charges available.`)
            return 0
        }
        //-------------------------------------------------------------------------------------------------------------------------------
        // Decrement our resource 
        //
        let updates = {};
        let resources = `data.resources.${resourceSlot}.value`;
        updates[resources] = usesVal - 1;
        await actor5e.update(updates);
        return true
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
     * resourceRefund (actor5eUuid, resourceName, aItemUuid) - For PCs, increment the verified resource but not past max.
     * 
     * Inputs Required:
     *  - actor5eUuid: Actor UUID e.g. 'Actor.qvVZIQGyCMvDJFtG' (linked) or 'Scene.MzEyYTVkOTQ4NmZk.Token.HNjb9QaxP5K1V1NG' (unlinked)
     *  - resourceName: String that must match (exactly) one of a PC's predefined resource slots
     *  - aItemUuid: Item UUID on the calling macro, e.g. "Scene.MzEyYTVkOTQ4NmZk.Token.HNjb9QaxP5K1V1NG.Item.9vm3k6d26nbuqezf"
     *  - options: Two supported option fields.
     * 
     * Options
     *  - traceLvl: Integer controlling verbosity of logging.  Default is 0 which is silent
     *  - quiet: boolean value.  Default is false which enables display of error messages.  True suppresses them.
     *  
     *  Return values:
     *  - -1:    actor is a NPC making this irrelevant
     *  - True:  PC actor's resource successfully incremented
     *  - False: resource was not found (not set on actor)
     *  - Zero:  actor's resource was already at (or above) max
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
    static async resourceRefund(actor5eUuid, resourceName, aItemUuid, options = {}) {
        const FUNCNAME = "resourceRefund(actor5eUuid, resourceName, aItemUuid, options = {})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `jez.${FNAME} |`
        const TL = options.traceLvl ?? 0
        const QUIET = options.quiet ?? false
        if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
        if (TL > 1) jez.trace(`${TAG} --- Starting ${FUNCNAME}`, 'actor5eUuid', actor5eUuid, 'resourceName', resourceName,
            'aItemUuid', aItemUuid, "options", options);
        //-------------------------------------------------------------------------------------------------------------------------------
        // Function variables
        //
        let aItem = await fromUuid(aItemUuid)
        let actor5e = await fromUuid(actor5eUuid)
        if (TL > 1) jez.trace(`${TAG} Data Accessed`, 'aItem  ', aItem, 'actor5e', actor5e)
        const IS_NPC = await jez.isNPC(actor5eUuid, { traceLvl: 0 })
        const RESOURCE_NAME = resourceName
        //-------------------------------------------------------------------------------------------------------------------------------
        //
        if (IS_NPC) {
            if (TL > 2) jez.trace(`${TAG} Processing ${actor5e.name} as NPC`)
            const ITEM_USES = await jez.getItemUses(aItem, { traceLvl: TL })
            if (TL > 2) jez.trace(`${TAG} Resource Values for NPC: ${actor5e.name}`, "ITEM_USES", ITEM_USES)
            if (ITEM_USES.max) return false
            if (!QUIET) jez.badNews(`Make sure limited daily uses are configured for ${aItem.name}.`, 'i')
            return -1;
        }
        //-------------------------------------------------------------------------------------------------------------------------------
        //
        let resourceSlot = null
        const ACTOR_DATA = await actor5e.getRollData();
        let usesVal, usesMax
        //-------------------------------------------------------------------------------------------------------------------------------
        // Figure our which slot has our resource and get the current and maximum value
        //
        if (TL > 2) jez.trace(`${TAG} Processing ${actor5e.name} as PC`)
        let resourceList = [{ name: "primary" }, { name: "secondary" }, { name: "tertiary" }];
        let resourceValues = Object.values(ACTOR_DATA.resources);
        let resourceTable = mergeObject(resourceList, resourceValues);
        let findResourceSlot = resourceTable.find(i => i.label.toLowerCase() === RESOURCE_NAME.toLowerCase());
        if (!findResourceSlot) {
            if (!QUIET) jez.badNews(`${RESOURCE_NAME} Resource is missing on ${actor5e.name}, Please add it.`);
            return false
        }
        resourceSlot = findResourceSlot.name;
        usesVal = ACTOR_DATA.resources[resourceSlot].value;
        usesMax = ACTOR_DATA.resources[resourceSlot].max;
        if (TL > 2) jez.trace(`${TAG} Resource Values for PC: ${actor5e.name}`, "resourceList     ", resourceList,
            "resourceTable    ", resourceTable, "findResourceSlot ", findResourceSlot,
            'usesVal          ', usesVal, 'usesMax          ', usesMax)
        if (usesVal >= usesMax) {
            if (!QUIET) jez.badNews(`Already at maximum ${RESOURCE_NAME} charges.`);
            return 0
        }
        // }
        //-------------------------------------------------------------------------------------------------------------------------------
        // Increment our resource 
        //
        let updates = {};
        let resources = `data.resources.${resourceSlot}.value`;
        updates[resources] = usesVal + 1;
        await actor5e.update(updates);
        return true
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
     * resourceAvail(actorUuid, actor5eUuid, aItemUuid) - Checks the availaibility of named resource on passed actor. 
     * 
     * Inputs Required:
     *  - actor5eUuid: Actor UUID e.g. 'Actor.qvVZIQGyCMvDJFtG' (linked) or 'Scene.MzEyYTVkOTQ4NmZk.Token.HNjb9QaxP5K1V1NG' (unlinked)
     *  - resourceName: String that must match (exactly) one of a PC's predefined resource slots
     *  - aItemUuid: Item UUID on the calling macro, e.g. "Scene.MzEyYTVkOTQ4NmZk.Token.HNjb9QaxP5K1V1NG.Item.9vm3k6d26nbuqezf"
     *  - options: Two supported option fields.
     * 
     * Options
     *  - traceLvl: Integer controlling verbosity of logging.  Default is 0 which is silent
     *  - quiet: boolean value.  Default is false which enables display of error messages.  True suppresses them.
     * 
     * Return values:
     *  - Positive integer: 1 or more charges is available on a PC/NPC
     *  - Zero: 0 charges are available on a PC/NPC
     *  - False: named resource does not exist on a PC/NPC
     *  - -1: The actor is a NPC and none of the above passed tests
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
    static async resourceAvail(actor5eUuid, resourceName, aItemUuid, options = {}) {
        const FUNCNAME = "resourceAvail(actor5eUuid, resourceName, options = {})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `jez.${FNAME} |`
        const TL = options.traceLvl ?? 0
        const QUIET = options.quiet ?? false
        if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
        if (TL > 1) jez.trace(`${TAG} --- Starting ${FUNCNAME}`, 'actor5eUuid', actor5eUuid, 'resourceName', resourceName,
            'aItemUuid', aItemUuid, "options", options);
        //-------------------------------------------------------------------------------------------------------------------------------
        // Function variables
        //
        let aItem = await fromUuid(aItemUuid)
        let actor5e = await fromUuid(actor5eUuid)
        if (TL > 1) jez.trace(`${TAG} Data Accessed`, 'aItem  ', aItem, 'actor5e', actor5e)
        const IS_NPC = await jez.isNPC(actor5eUuid, { traceLvl: 0 })
        const RESOURCE_NAME = resourceName
        //-------------------------------------------------------------------------------------------------------------------------------
        //
        if (IS_NPC) {
            if (TL > 2) jez.trace(`${TAG} Processing ${actor5e.name} as NPC`)
            const ITEM_USES = await jez.getItemUses(aItem, { traceLvl: TL })
            if (TL > 2) jez.trace(`${TAG} Resource Values for NPC: ${actor5e.name}`, "ITEM_USES", ITEM_USES)
            // ITEM_USES: { max: 3, per: "day", value: 3 }
            if (ITEM_USES?.value > 0) return ITEM_USES.value
            if (ITEM_USES?.value <= 0) return 0
            if (ITEM_USES.max) return false // If max charges isn't set, this item is not set up correctly
            if (!QUIET) jez.badNews(`Make sure limited daily uses are configured for ${aItem.name}.`, 'i')
            return -1;
        }
        //-------------------------------------------------------------------------------------------------------------------------------
        // Set variables for this function
        //
        let resourceSlot = null
        const ACTOR_DATA = await actor5e.getRollData();
        let usesVal, usesMax
        //-------------------------------------------------------------------------------------------------------------------------------
        // Figure our which slot has our resource and get the current and maximum value
        //
        if (TL > 2) jez.trace(`${TAG} Processing ${actor5e.name} as PC`)
        let resourceList = [{ name: "primary" }, { name: "secondary" }, { name: "tertiary" }];
        let resourceValues = Object.values(ACTOR_DATA.resources);
        let resourceTable = mergeObject(resourceList, resourceValues);
        let findResourceSlot = resourceTable.find(i => i.label.toLowerCase() === RESOURCE_NAME.toLowerCase());
        if (!findResourceSlot) {
            if (!QUIET) jez.badNews(`${RESOURCE_NAME} Resource is missing on ${actor5e.name}, Please add it.`);
            return false
        }
        resourceSlot = findResourceSlot.name;
        usesVal = ACTOR_DATA.resources[resourceSlot].value;
        usesMax = ACTOR_DATA.resources[resourceSlot].max;
        if (TL > 2) jez.trace(`${TAG} Resource Values for PC: ${actor5e.name}`, "resourceList     ", resourceList,
            "resourceTable    ", resourceTable, "findResourceSlot ", findResourceSlot,
            'usesVal          ', usesVal, 'usesMax          ', usesMax)
        if (usesVal < 1) {
            if (!QUIET) jez.badNews(`There are no ${RESOURCE_NAME} charges available.`);
            return 0
        }
        //-------------------------------------------------------------------------------------------------------------------------------
        // Decrement our resource 
        //
        return usesMax
    }
} // END OF class jez
Object.freeze(jez);