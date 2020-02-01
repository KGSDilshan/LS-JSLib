/* Question level Globals */
var CURRENT_ROTATIONS = [];

/* Utility Functions */

/*
 * Pick a random Integer between a given min and max number
 *
 * @param {number} min
 * @param {number} max
 *
 * @return {number} rangedNumber
 */
function GetRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min)) + min;
}


function RemoveBlankSpace(arr) {
    tempArr = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[0] !== undefined && arr[0] !== null && arr[0].trim != "") {
            tempArr.push(arr[0].trim());
        }
    }

    return tempArr;
}


/* JS Cookie 3.0 */
/*
* Cookies.set
* Cookies.get
* Cookies.remove
*/
! function(e, t) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = e || self, function() {
        var n = e.Cookies,
            r = e.Cookies = t();
        r.noConflict = function() {
            return e.Cookies = n, r
        }
    }())
}(this, function() {
    "use strict";
    var e = {
        read: function(e) {
            return e.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
        },
        write: function(e) {
            return encodeURIComponent(e).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent)
        }
    };

    function t(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n) e[r] = n[r]
        }
        return e
    }
    return function n(r, o) {
        function i(e, n, i) {
            if ("undefined" != typeof document) {
                "number" == typeof(i = t({}, o, i)).expires && (i.expires = new Date(Date.now() + 864e5 * i.expires)), i.expires && (i.expires = i.expires.toUTCString()), n = r.write(n, e), e = encodeURIComponent(e).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
                var c = "";
                for (var u in i) i[u] && (c += "; " + u, !0 !== i[u] && (c += "=" + i[u].split(";")[0]));
                return document.cookie = e + "=" + n + c
            }
        }
        return Object.create({
            set: i,
            get: function(t) {
                if ("undefined" != typeof document && (!arguments.length || t)) {
                    for (var n = document.cookie ? document.cookie.split("; ") : [], o = {}, i = 0; i < n.length; i++) {
                        var c = n[i].split("="),
                            u = c.slice(1).join("=");
                        '"' === u[0] && (u = u.slice(1, -1));
                        try {
                            var f = e.read(c[0]);
                            if (o[f] = r.read(u, f), t === f) break
                        } catch (e) {}
                    }
                    return t ? o[t] : o
                }
            },
            remove: function(e, n) {
                i(e, "", t({}, n, {
                    expires: -1
                }))
            },
            withAttributes: function(e) {
                return n(this.converter, t({}, this.attributes, e))
            },
            withConverter: function(e) {
                return n(t({}, this.converter, e), this.attributes)
            }
        }, {
            attributes: {
                value: Object.freeze(o)
            },
            converter: {
                value: Object.freeze(r)
            }
        })
    }(e, {
        path: "/"
    })
});


/*
 * Run DD for a radio question. Selects a random answer from a radio question, and emulates the
 * submit button being pressed.
 *
 */
function PickRandomRadioAnswer() {
    // pick a random radio answer
    const answers = document.getElementsByClassName("answer-item");
    let checkedIndex = GetRandomInt(0, answers.length);
    let radioId = answers[checkedIndex].id.replace("javatbd", "answer");
    let isOther = false;
    let button;
    // if the selected answer is an "other" option, fill in the text
    if (radioId.indexOf("other") !== -1) {
        // TODO Numerical inputs need to be distinguished
        // select button for other option
        isOther = true;
        radioId = radioId.replace("other", "");
        document.getElementById(radioId + 'othertext').value='2000';
        button = document.getElementById("SOTH" + radioId.replace("answer", ""));
        button.checked = true;
    } else {
        button = document.getElementById(radioId);
        button.checked = true;
    }
    button.onclick();
    $('#movenextbtn, #movesubmitbtn').trigger('click');
}


/*
 * Run DD for an Array question. Selects random answers for each subquestion from an Array question,
 * and emulates the submit button being pressed.
 *
 */
function PickRandomArrayAnswer() {
    const answers = document.getElementsByClassName("radio-list");
    // pick an answer for each subquestiom
    for (let row = 0; row < answers.length; row++) {
        // hidden arr subquestion need not be answered
        if (answers[row].style.cssText == "display: none;") {
            continue;
        }
        let radios = answers[row].getElementsByClassName("answer-item");
        let checkedIndex = GetRandomInt(0, radios.length);
        let radioId = answers[row].id.replace("javatbd", "answer");
        let val = radios[checkedIndex].getElementsByClassName("radio").item(0).value;
        checkedIndex += 1;
        radioId += "-" + val.toString();
        let button = document.getElementById(radioId);
        button.checked = true;
        button.onclick();
    }
    $('#movenextbtn, #movesubmitbtn').trigger('click');
}


/*
 * Run DD for a shortanswer question. Writes, "Dummy Data" into a shorttext input field.
 *
 */
function EnterTextInShortText() {
    const answers = document.getElementsByClassName("answer-item");
    answers[0].getElementsByClassName("form-control")[0].value = "Dummy data";
    $('#movenextbtn, #movesubmitbtn').trigger('click');
}


/*
* Determine the status of DD execution (run, pause or stop), and if it's running, then
* run DD for that question type.
*
* @param {HTML} <runDD> - Runs DD for this and following questions
* @param {HTML} <pauseDD> - Stops DD for current question
* @param {HTML} <stopDD> - Stops DD for current and all remaining questions
*
*/
function RunDD() {
    const ddstatus = Cookies.get('runDD');
    const run = document.getElementsByTagName("runDD").length;
    const pause = document.getElementsByTagName("pauseDD").length;
    const stop = document.getElementsByTagName("stopDD").length;
    if (ddstatus == "1" && pause == 0 && stop == 0) {
        // run the correct DD function based on question class
        if ((document.getElementsByClassName("list-radio").length) > 0) {
            PickRandomRadioAnswer();
        } else if (document.getElementsByClassName("array-flexible-row").length > 0) {
            PickRandomArrayAnswer();
        } else if (document.getElementsByClassName("text-short").length > 0) {
            EnterTextInShortText();
        } else if (document.getElementsByClassName("boilerplate").length > 0) {
            $('#movenextbtn, #movesubmitbtn').trigger('click');
        } else {
            $('#movenextbtn, #movesubmitbtn').trigger('click');
        }
    } else if (stop > 0) {
        Cookies.set("runDD", 0);
    } else if (run > 0) {
        Cookies.remove('rotationTracker');
        Cookies.set('runDD', '1');
        RunDD();
    }
}


/* TODO: When QCODE is exposed to front end, use that instead of QID  */
/*
 * Stores the current question's ID in a cookie
 *
 */
function RotationTracker() {
    let rotTracker = Cookies.get('rotationTracker');
    const currentQid = document.getElementById("fieldnames").value.split("X")[2];
    if (rotTracker == undefined){
        // initialize rotation tracker and add the current question to it
        Cookies.set('rotationTracker', currentQid)
    } else {
        if (rotTracker.indexOf(currentQid) !== -1) {
            return;
        }
        rotTracker += "," + currentQid;
        Cookies.set('rotationTracker', rotTracker);
    }
}


/* HTML -> JS rotation scripts */

/*
 * Get the index of an ID rotation from the CURRENT_ROTATIONS array (which is storing item rotation order)
 *
 * @param {number} id
 * @return {number} index
 */
function GetRotationIndexById(id) {
    for (let index = 0; index < CURRENT_ROTATIONS.length; index++) {
        if (CURRENT_ROTATIONS[index].id == id) {
            return index;
        }
    }
}


/*
 * Check if a rotation is inline or a ul-list rotation
 *
 * @return {(bool|{rotations: htmlObj, useUl: Boolean})}
 */
function GetRotationType() {
    let rotations = document.getElementsByTagName("rot");
    let useUl = false;
    if (rotations.length == 0) {
        // if there doesn't exist a normal "rot" search for "rotul" instead
        rotations = document.getElementsByTagName("rotul");
        if (rotations.length > 0) {
            useUl = true;
        } else {
            return false;
        }
    }

    return {
        rotations: rotations[0],
        useUl: useUl
    };
}


/*
 * Get the text and answer options that are rotating for a given HTML rotation Object
 *
 * @param {HtmlObj} rotations
 * @return {object} {anchored : {item : string, index: number, ansOpts : [number array]}, options: [number array]}
 */
function GetRotatedItems(rotations) {
    // get filtered list items
    let options = rotations.innerHTML.split("\n").join("").split("|");
    options = options.filter(function(el) {
        return el && (el.trim() != '');
    });
    let anchored = [];
    for (let i = 0; i < options.length; i++) {
        let content = options[i].match(/\[(.*?)\]/);
        // store the rotation items, answers bound to them and index of item
        if (content != "" && content != null) {
            content = content[1];
            options[i] = options[i].replace("[" + content + "]", "");
            options[i] = [options[i], content, i];
        } else {
            content = [];
            options[i] = [options[i], content, i];
        }
        // get anchored items and their indexes
        if (options[i][0].startsWith("$$")) {
            options[i][0] = options[i][0].slice(2, options[i][0].length);
            anchored.push({item: options[i][0], index : i, ansOpts : options[i][1]});
            options[i] = undefined;
        }
    }
    options = options.filter(function(el) {
        return el && (el.toString().trim() != '');
    });

    return {
        anchored : anchored,
        options : options
    };
}


/*
 * Given an order, rotate the contents of a rotation list in that order.
 *
 * @param {number array} order
 */
function RotateItemsOrder(order) {
    // get rotation type, list or inline
    const rotType = GetRotationType();
    if (!rotType) {
        return;
    }
    let rotations = rotType.rotations;
    const useUl = rotType.useUl;
    const rotOpts = GetRotatedItems(rotations);
    let anchored = rotOpts.anchored;
    let options = rotOpts.options;

    let result = useUl ? "<ul>" : "";
    const prefix = useUl ? "<li>" : "";
    const suffix = useUl ? "</li>" : "";

    // clear existing answer HTML objects and store them
    let ansList = document.getElementsByClassName("answers-list").item(0);
    let ans = document.getElementsByClassName("answer-item");
    let answerOptions = [];
    for (let i = ans.length - 1; i >= 0; i--) {
        answerOptions.push(ans.item(0));
        ansList.removeChild(ans.item(0));
    }

    // rearrange stored HTML objects according to order given
    for (let i = 0; i < order.length; i++) {
        if (order[i] == anchored[0].index) {
            // there exists an anchored option at this question index
            result += prefix + anchored[0].item + suffix;
            let opts = anchored[0].ansOpts;
            if (opts.length > 0) {
                opts = opts.split(",");
                for (let k = 0; k < opts.length; k++) {
                    ansList.append(answerOptions[opts[parseInt(k)]]);
                    answerOptions[opts[parseInt(k)]] = undefined;
                }
            }
            anchored.splice(0, 1);
        } else {
            // get the correct answer option from the options list for this index
            let index;
            for (let j = 0; j < options.length; j++) {
                if (options[j][2] == order[i]) {
                    index = j;
                    break;
                }
            }
            let opts = options[index][1];
            if (opts.length > 0) {
                opts = opts.split(",");
                for (let j = 0; j < opts.length; j++) {
                    ansList.append(answerOptions[parseInt(opts[j])]);
                    answerOptions[parseInt(opts[j])] = undefined;
                }
            }
            result += prefix + options[index][0] + suffix;
        }
    }
    // push remaining answer options that aren't rotating into the answer list
    for (let i = 0; i < answerOptions.length; i++) {
        if (answerOptions[i] !== undefined) {
            ansList.append(answerOptions[i]);
        }
    }

    result += useUl ? "</ul>" : "";
    $(rotations).replaceWith(result);
}


/*
 * Randomize the order of items in rotation tags.
 *
 */
function RotateItems() {
    // get rotation type, list or inline
    const rotType = GetRotationType();
    if (!rotType) {
        return;
    }
    let rotations = rotType.rotations;
    const useUl = rotType.useUl;

    // get rotation object, or create one if one doesn't exist
    if (rotations.id != "") {
        // rotation has an ID, generate an object for it if one doesn't exist
        if (CURRENT_ROTATIONS.length == 0) {
            CURRENT_ROTATIONS.push({id: rotations.id, rotated: false});
        } else {
            for (let i = 0; i < CURRENT_ROTATIONS.length; i++) {
                if (CURRENT_ROTATIONS[i].id == rotations.id && CURRENT_ROTATIONS[i].order) {
                    // if a rotation with the ID exists, we should match that rotation's order
                    RotateItemsOrder(CURRENT_ROTATIONS[i].order);
                    RotateItems();
                    return;
                } else if (i == CURRENT_ROTATIONS.length - 1) {
                    CURRENT_ROTATIONS.push({id: rotations.id, rotated: false});
                    break;
                }
            }
        }
    }
    const rotOpts = GetRotatedItems(rotations);
    let anchored = rotOpts.anchored;
    let options = rotOpts.options;

    let result = useUl ? "<ul>" : "";
    const prefix = useUl ? "<li>" : "";
    const suffix = useUl ? "</li>" : "";
    let ansList = document.getElementsByClassName("answers-list").item(0);
    let ans = document.getElementsByClassName("answer-item");
    let answerOptions = [];
    let order = [];
    for (let i = ans.length - 1; i >= 0; i--) {
        answerOptions.push(ans.item(0));
        ansList.removeChild(ans.item(0));
    }
    let counter = 0;
    while ((options.length + anchored.length) != 0) {
        // if there exist an anchored item at this question index
        if (anchored.length > 0) {
            if (anchored[0].index == counter) {
                result += prefix + anchored[0].item + suffix;
                let opts = anchored[0].ansOpts;
                if (opts.length > 0) {
                    opts = opts.split(",");
                    for (let i = 0; i < opts.length; i++) {
                        ansList.append(answerOptions[opts[parseInt(i)]]);
                        answerOptions[opts[parseInt(i)]] = undefined;
                    }
                }
                order.push(anchored[0].index);
                anchored.splice(0, 1);
                counter++;
                continue;
            }
        }
        // pick a random answer option and insert it into this index
        let index = Math.floor(Math.random() * options.length);
        order.push(options[index][2]);
        let opts = options[index][1];
        if (opts.length > 0) {
            opts = opts.split(",");
            for (let i = 0; i < opts.length; i++) {
                ansList.append(answerOptions[parseInt(opts[i])]);
                answerOptions[parseInt(opts[i])] = undefined;
            }
        }
        result += prefix + options[index][0] + suffix;
        options.splice(index, 1);
        counter++;
	}

    // populate the answer options that aren't rotating
    for (let i = 0; i < answerOptions.length; i++) {
        if (answerOptions[i] != undefined) {
            ansList.append(answerOptions[i]);
        }
    }
    // log rotation order of this question if an ID exists for it
    if (rotations.id != "") {
        for (let i = 0; i < order.length; i++) {
            if (order[i] != i) {
                CURRENT_ROTATIONS[GetRotationIndexById(rotations.id)].rotated = true;
                CURRENT_ROTATIONS[GetRotationIndexById(rotations.id)].order = order;
                break;
            }
        }
    }
    result += useUl ? "</ul>" : "";
    $(rotations).replaceWith(result);
    RotateItems();
}


/* HTML -> JS Answer option manipulation */
/*
 * Populate answer options for a question and reflect answer options between a start and an ending index.
 *
 * @param {HTMLObj} arrFlipped - sub array of only flipping answers
 * @param {HTMLObj} ansList - HTML Object to hold all question answers
 * @param {HTMLObj} answerOptions - Full array containing all question answers
 * @param {number} start
 * @param {number} end
 *
 */
function FlipArr(arrFlipped, ansList, answerOptions, start, end) {
    arrFlipped.reverse();
    for (let i = 0; i < answerOptions.length; i++) {
        ansList.append((i >= start && i <= end) ? (arrFlipped[i - start]) : answerOptions[i]);
    }
}


/*
 * Randomly (50% chance) flip the answer options for an array question between a starting and ending
 * index. If the flip tag contains an ID, only flip the array if a rotation exists for it.
 *
 * @param {HTML}  <ansFlip data-ans="startIndex, endIndex">
 */
function AnswersFlip() {
    const ansFlip = document.getElementsByTagName("ansFlip");
    if (ansFlip.length == 0) {
        return;
    }
    let data = ansFlip[0].getAttribute("data-ans");
    data = data.replace("(", "").replace(")", "").trim().split(",");
    const start = parseInt(data[0]);
    const end = parseInt(data[1]);

    let ansList = document.getElementsByClassName("answers-list").item(0);
    let ans = document.getElementsByClassName("answer-item");

    let answerOptions = [];

    for (let i = ans.length - 1; i >= 0; i--) {
        answerOptions.push(ans.item(0));
        ansList.removeChild(ans.item(0));
    }
    // get a sub array of values between start and end
    let arrFlipped = answerOptions.slice(start, end + 1);
    if (ansFlip[0].id != "" && CURRENT_ROTATIONS[GetRotationIndexById(ansFlip[0].id)].rotated) {
        FlipArr(arrFlipped, ansList, answerOptions, start, end);
    } else if (GetRandomInt(0, 100) >= 50) {
        FlipArr(arrFlipped, ansList, answerOptions, start, end);
    } else {
        // repopulate ansOptions
        for (let i = 0; i < answerOptions.length; i++) {
            ansList.append(answerOptions[i]);
        }
    }
}


/*
 * Insert text betwen answer options at a given index
 *
 * @param {HTML} <ansInsWord>word,X</ansInsWord>
 */
function AnswerInsertWord() {
    let toInsert = document.getElementsByTagName("ansInsWord");
    if (toInsert.length < 1) {
        return;
    }
    toInsert = toInsert[0].innerText.split(",");
    let ans = document.getElementsByClassName("answer-item").item(parseInt(toInsert[1])).getElementsByClassName("label-text label-clickable").item(0);
    $("<br><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + toInsert[0] + "<p>").insertAfter($(ans));
    toInsert = document.getElementsByTagName("ansInsWord");
    $(toInsert).replaceWith("");
}


/* HTML tag based text parsing */
function SetpMode(value) {
    Cookies.set('pMode', (value).toString());
}


/*
 * Replace text based on mode.
 *
 * @param {HTML} <p-o>Phone only text</p-o>
 * @param {HTML} <e-t>Email and Texting only text</e-t>
 */
function ParseModeText() {
    // <p-o></p-o> = Phone only
    // <e-t></e-t> = Email and Text
    let mode = Cookies.get('pMode');
    if (parseInt(mode) == undefined) {
        return;
    }
    try {
        mode = parseInt(mode);
    } catch (err) {
        console.log("Couldn't convert pMode to int. pMode is: " + mode);
        return
    }
    switch (mode) {
        case 1:
            // phone mode, hide all email and text tags
            let ettags = document.getElementsByTagName("E-T");
            for (let i = 0; i < ettags.length; i++) {
                ettags[i].parentNode.removeChild(ettags[i]);
            }
            break;
        case 2:
        case 3:
            // email/text mode, hide all phone tags
            let ptags = document.getElementsByTagName("P-O");
            for (let i = 0; i < ptags.length; i++) {
                ptags[i].parentNode.removeChild(ptags[i]);
            }
            break;
    };
}


/*
 * Functions to execute per question. Functions appear in order of execution.
 */
$(document).ready(function()  {
    // Dummy Data
    RunDD();
    // Rotation tracker
    RotationTracker();
    // PMode substitutions
    ParseModeText();
    // Question and Answer level rotation of text and options
    RotateItems();
    // Flip answer options
    AnswersFlip();
    // Insert text between options
    AnswerInsertWord();
});
