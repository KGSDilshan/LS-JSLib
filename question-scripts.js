/* Question level Globals */
/*
    id: html id
    order: [arrayOfIndexes]
*/
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

/*
 * Repeat a string X times. Replacement for ES6's str.repeat function
 *
 *
 * @param {string} string
 * @param {number} times
 *
 * @return {string} resultant
 */
function RepeatStringNumTimes(string, times) {
    if (times < 0) {
        return "";
    }
    return ((times <= 1)  ? string : string + RepeatStringNumTimes(string, times - 1));
}

/*
 * Remove spaces and blanks from an array by creating a new array with those indicies removed
 *
 * @param {array} arr
 *
 * @return {arr} tempArr
 */
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
 * Stores answer options to avoid hitting on DD for given questions
 *
 * @param {HTML} <excludeDD>
 *
 */
function SetDDExclusions() {
    // store exclusions given in a cookie
    const exclusionObj = document.getElementsByTagName("excludeDD");
    if (exclusionObj.length < 1) {
        return;
    }
    const exclusions = exclusionObj[0].innerHTML.split(" ").join("").split("|");
    // each exclusions is formatted QuestionName,opt1,opt2,opt3,...
    for (let i = 0; i < exclusions.length; i++) {
        const exclusion = exclusions[i].trim().split(",");
        const qName = exclusion.splice(0, 1)[0];
        // store everything in a cookie
        let cookieVal = "";
        for (let j = 0; j < exclusion.length; j++) {
            cookieVal += exclusion[j].toString() + ",";
        }
        Cookies.set(qName, cookieVal);
    }
    $(exclusionObj).replaceWith("");
}

/*
 * Get indicies of answer options which have a visible relevance
 *
 * @param {Array} answers - HTML Object array of answer options
 *
 * @return {Array} validIndicies - Array of numbers containing valid indicies
 */
function GetRelevantAnswers(answers) {
    const validIndicies = [];
    let nonRelevant = document.getElementById("answer-relevance");
    if (nonRelevant) {
        nonRelevant = JSON.parse(nonRelevant.getAttribute("data-relv"));
    }
    for (let i = 0; i < answers.length; i++) {
        let seen = false;
        for (let j = 0; j < nonRelevant.length; j++) {
            const qnameData = "javatbd" + document.getElementById("fieldnames").value + nonRelevant[j];
            if (answers[i].id === qnameData) {
                seen = true;
                break;
            }
        }
        if (!seen) {
            validIndicies.push(i);
        }
    }
    return validIndicies;
}


/*
 * Run DD for a radio question. Selects a random answer from a radio question, and emulates the
 * submit button being pressed.
 *
 */
function PickRandomRadioAnswer() {
    // pick a random radio answer
    const answers = document.getElementsByClassName("answer-item");

    // get Question ID of the current question
    const currentQname = document.getElementById("QNameNumData").dataset.code;
    let exclusiveOpts = Cookies.get(currentQname);
    let checkedIndex;
    // populate a list of valid codes
    const validIndicies = GetRelevantAnswers(answers);
    if (exclusiveOpts === undefined) {
        // randomize and pick an index out of that list
        validIndicies.sort(function() {
            return Math.random() - 0.5;
        });
        checkedIndex = validIndicies[0];
    } else {
        let foundOpt = true;
        exclusiveOpts = exclusiveOpts.trim().split(",");
        while (foundOpt == true) {
            validIndicies.sort(function() {
                return Math.random() - 0.5;
            });
            checkedIndex = validIndicies[0];
            // see if the checked index is in the list
            foundOpt = false;
            for (let i = 0; i < exclusiveOpts.length; i++) {
                if (checkedIndex === exclusiveOpts[i]) {
                    foundOpt = true;
                    break;
                }
            }
        }
    }
    let radioId = answers[checkedIndex].id.replace("javatbd", "answer");
    let button;
    // if the selected answer is an "other" option, fill in the text
    if (radioId.indexOf("other") !== -1) {
        // TODO Numerical inputs need to be distinguished
        // select button for other option
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
 * Run DD for a Multiple choice question. Selects a random answer from a multiple choice question,
 * and emulates the submit button being pressed.
 *
 */
function PickRandomMultiChoiceAnswer() {
    // pick a random radio answer
    const answers = document.getElementsByClassName("answer-item");
    const validIndicies = GetRelevantAnswers(answers);
    // randomize and pick an index out of that list
    validIndicies.sort(function() {
        return Math.random() - 0.5;
    });
    const checkedIndex = validIndicies[0];
    let multiId = answers[checkedIndex].id.replace("javatbd", "answer");
    // if the selected answer is an "other" option, fill in the text
    if (multiId.indexOf("other") !== -1) {
        // TODO Numerical inputs need to be distinguished
        // select button for other option
        multiId = multiId.replace("other", "");
        document.getElementById(multiId.replace("answer", "java") + 'other').value='2000';
        document.getElementById(multiId + 'other').value='2000';
        document.getElementById(multiId + 'othercbox').checked = true;
    } else {
        const button = document.getElementById(multiId).checked = true;
        button.checked = true;
    }
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
        const radios = answers[row].getElementsByClassName("answer-item");
        const checkedIndex = GetRandomInt(0, radios.length);
        let radioId = answers[row].id.replace("javatbd", "answer");
        const val = radios[checkedIndex].getElementsByClassName("radio").item(0).value;
        radioId += "-" + val.toString();
        const button = document.getElementById(radioId);
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
 * Run DD for a numberic input question. Writes, a random number of the input length, length
 *
 */
function EnterNumericText() {
    const answers = document.getElementsByClassName("answer-item");
    let maxLength = answers[0].getElementsByClassName("form-control")[0].maxLength;
    if (maxLength !== undefined) {
        maxLength = GetRandomInt(1, 4);
    }
    answers[0].getElementsByClassName("form-control")[0].value = GetRandomInt(0, parseInt(RepeatStringNumTimes("9", maxLength)));
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
        } else if (document.getElementsByClassName("multiple-opt").length > 0) {
            PickRandomMultiChoiceAnswer();
        } else if (document.getElementsByClassName("numeric").length > 0) {
            EnterNumericText();
        } else {
            $('#movenextbtn, #movesubmitbtn').trigger('click');
        }
    } else if (stop > 0) {
        Cookies.set("runDD", 0);
    } else if (run > 0) {
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
    const currentQname = document.getElementById("QNameNumData");
    currentQname = currentQName ? currentQname.dataset.code : null;
    if (rotTracker === undefined) {
        // initialize rotation tracker and add the current question to it
        Cookies.set('rotationTracker', currentQname)
    } else {
        // previous button can re-add the question, if the question is in, don't add it twice
        if (rotTracker.indexOf(currentQname) !== -1) {
            return;
        }
        rotTracker += "," + currentQname;
        Cookies.set('rotationTracker', rotTracker);
    }
}


/*
 * Clears the rotationTracker cookie. Abstract JS Cookie in the front end.
 *
 */
function StartRotationTracker() {
    Cookies.remove('rotationTracker');
}


/* HTML -> JS rotation scripts */
/*
 * Get the index of an ID rotation from the CURRENT_ROTATIONS array (which is storing item rotation order)
 *
 * @param {number} id
 * @return {number} index - if not found -1
 */
function GetRotationIndexById(id) {
    for (let index = 0; index < CURRENT_ROTATIONS.length; index++) {
        if (CURRENT_ROTATIONS[index].id == id) {
            return index;
        }
    }

    return -1;
}


/*
 * Execute <rot> or <rotul> tagged rotation. Creates an order, and rotates items in that order.
 * If useUl is true, use a list, else use inline rotation
 *
 * @param {Boolean} useUl
 *
 */
function ProcessRotation(useUl=false) {
    // randomize inline rotation
    const rotTags = useUl ? document.getElementsByTagName("ROTUL") : document.getElementsByTagName("ROT");
    while (rotTags.length > 0) {
        const htmlObj = rotTags[0];
        const htmlId = htmlObj.id;
        let storeRotation = false;
        // check if there exists an ID on this rotation
        if (htmlId !== "") {
            // item has an ID, see if a rotation order was stored for this item
            const index = GetRotationIndexById(htmlId);
            if (index == -1) {
                // if the item has no stored rotation item, mark it to store a rotation
                storeRotation = true;
            } else {
                RotateText(htmlObj, CURRENT_ROTATIONS[index].order, useUl);
                continue;
            }
        }
        // generate a random order, respecting anchors
        let options = htmlObj.innerHTML.split("\n").join("").split("|");
        options = options.filter(function(el) {
            return el;
        });
        const rotatingIndicies = [];
        for (let i = 0; i < options.length; i++) {
            if (!options[i].startsWith("$$")) {
                rotatingIndicies.push(i);
            }
        }
        rotatingIndicies.sort(function() {return Math.random() - 0.5});
        let rotatedArr = false;
        for (let i = 0; i < rotatingIndicies.length - 1; i++) {
            if (rotatingIndicies[i] > rotatingIndicies[i + 1]) {
                rotatedArr = true;
                break;
            }
        }
        // loop through options array
        for (let i = 0; i < options.length; i++) {
            // insert into rotatingIndicies, anchored options
            if (options[i].startsWith("$$")) {
                rotatingIndicies.splice(i, 0, i);
            }
        }

        if (storeRotation) {
            CURRENT_ROTATIONS.push({
                    id: htmlId,
                    order: rotatingIndicies,
                    rotated: rotatedArr,
            });
        }
        RotateText(htmlObj, rotatingIndicies, useUl);
    }
}


/*
 * Rotates items in text and answer options given a rotation order of the items
 *
 * @param {HTMLObj} htmlObj - rot tag object
 * @param {Array} order - array of indicies dictating an order to rotate things in
 * @param {Boolean} useUl - use list html or inline
 */
function RotateText(htmlObj, order, useUl) {
    let options = htmlObj.innerHTML.split("\n").join("").split("$$").join("").split("|");
    options = options.filter(function(el) {
        return el;
    });

    // arrange the options in the given order
    let temp = [];
    for (let i = 0; i < order.length; i++) {
        temp.push(options[order[i]]);
    }
    options = temp.filter(function(el) {
        return el;
    });

    const ansRotation = [];
    for (let i = 0; i < options.length; i++) {
        let content = options[i].match(/\[(.*?)\]/);
        if (content !== null) {
            content = content[1];
            options[i] = options[i].replace("[" + content + "]", "");
            content = content.split(" ").join("").split("\t").join("").split(",");
            for (let j = 0; j < content.length; j++) {
                ansRotation.push(content[j]);
            }
        }
    }

    // clear existing answer HTML objects and store them
    if (ansRotation.length > 0) {
        const ansList = document.getElementsByClassName("answers-list").item(0);
        const ans = document.getElementsByClassName("answer-item");
        const answerOptions = [];
        for (let i = ans.length - 1; i >= 0; i--) {
            answerOptions.push(ans.item(0));
            ansList.removeChild(ans.item(0));
        }
        temp = [];
        for (let i = 0; i < ansRotation.length; i++) {
            temp.push(answerOptions[ansRotation[i]]);
            answerOptions[ansRotation[i]] = undefined;
        }
        for (let i = 0; i < answerOptions.length; i++) {
            if (answerOptions[i] !== undefined) {
                temp.push(answerOptions[i]);
            }
        }
        for (let i = temp.length; i > 0; i--) {
            ansList.prepend(temp[i - 1]);
        }
    }

    // generate a results string for Question Text
    let result = useUl ? "<ul>" : "";
    const prefix = useUl ? "<li>" : "";
    const suffix = useUl ? "</li>" : "";
    for (let i = 0; i < options.length; i++) {
        if (options[i].trim() == '' && useUl) {
            continue;
        } else {
            result += prefix + options[i] + suffix;
        }
    }
    $(htmlObj).replaceWith(result);
}


/*
 * Run rotation on <rot> and <rotul> tags
 *
 */
function ProcessAllRotations() {
    // inline rotation
    ProcessRotation();
    // list rotation
    ProcessRotation(true);
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

    const ansList = document.getElementsByClassName("answers-list").item(0);
    const ans = document.getElementsByClassName("answer-item");

    const answerOptions = [];

    for (let i = ans.length - 1; i >= 0; i--) {
        answerOptions.push(ans.item(0));
        ansList.removeChild(ans.item(0));
    }
    // get a sub array of values between start and end
    const arrFlipped = answerOptions.slice(start, end + 1);
    const rotIndex = GetRotationIndexById(ansFlip[0].id);
    if (rotIndex != -1) {
        if (CURRENT_ROTATIONS[rotIndex].rotated) {
            // if the id exists, it's rotated before. Flip the answers.
            FlipArr(arrFlipped, ansList, answerOptions, start, end);
        } else {
            // repopulate ansOptions
            for (let i = 0; i < answerOptions.length; i++) {
                ansList.append(answerOptions[i]);
            }
        }
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
    const ans = document.getElementsByClassName("answer-item").item(parseInt(toInsert[1])).getElementsByClassName("label-text label-clickable").item(0);
    $("<br><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + toInsert[0] + "<p>").insertAfter($(ans));
    toInsert = document.getElementsByTagName("ansInsWord");
    $(toInsert).replaceWith("");
}


/* HTML tag based text parsing */
function SetpMode(value) {
    Cookies.set('pMode', (value).toString());
}


/*
 * Hide all data between given HTML tags
 *
 * @param {string} tagName
 */
function RemoveTagText(tagName) {
    const docTags = document.getElementsByTagName(tagName);
    while (docTags.length > 0) {
        docTags[0].parentNode.removeChild(docTags[0]);
    }
}

/*
 * Replace text based on mode.
 *
 * @param {HTML} <p-o>Phone only text</p-o>
 * @param {HTML} <e-o>Email only text</e-o>
 * @param {HTML} <t-o>Texting only text</t-o>
 * @param {HTML} <e-t>Email and Texting only text</e-t>
 */
function ParseModeText() {
    let mode = Cookies.get('pMode');
    if (parseInt(mode) == undefined) {
        return;
    }
    try {
        mode = parseInt(mode);
    } catch (err) {
        console.log("Couldn't convert pMode to int. pMode is: " + mode);
        return;
    }
    switch (mode) {
        case 2:
        case 4:
            // email/panel, hide all text and phone only tags
            RemoveTagText("P-O");
            RemoveTagText("T-O");
            break;
        case 3:
            // text, hide all email and phone only tags
            RemoveTagText("P-O");
            RemoveTagText("E-O");
            break;
        default:
            // Default to phone mode, hide all email and text tags
            RemoveTagText("E-T");
            RemoveTagText("E-O");
            RemoveTagText("T-O");
            break;
    };
}


/*
 * Store the CURRENT_ROTATIONS array into a cookie in a parsable string format
 *
 */
 function RotationsToCookie() {
     let toStore = "";
     for (let i = 0; i < CURRENT_ROTATIONS.length; i++) {
         const id = CURRENT_ROTATIONS[i].id.toString();
         const order = CURRENT_ROTATIONS[i].order.toString();
         const rotationStatus = CURRENT_ROTATIONS[i].rotated.toString();
         toStore += id + "|" + order + "|" + rotationStatus + "[NEXT]";
     }
     Cookies.remove("CRO");
     Cookies.set("CRO", toStore);
 }


/*
 * From a formatted string, populate the CURRENT_ROTATIONS array -> Store rotation orders cross question
 *
 */
 function RotationsFromString() {
    CURRENT_ROTATIONS = [];
    let data = Cookies.get("CRO");
    if (data === undefined) {
        return;
    }
    data = data.split("[NEXT]").filter(function(el) {
        return el;
    });
    for (let i = 0; i < data.length; i++) {
        const rotation = data[i].split("|");
        const identifier = rotation[0];
        let rotOrder = rotation[1].split(",");
        for (let j = 0; j < rotOrder.length; j++) {
            rotOrder[j] = parseInt(rotOrder[j]);
        }
        CURRENT_ROTATIONS.push({
            id: identifier,
            order: rotOrder,
            rotated: rotation[2] == "true",
        });
    }
 }

/*
 * Functions to execute per question. Functions appear in order of execution.
 */
$(document).ready(function()  {
    // if the survey is completed or terminated, then reset relevant cookies
    if (document.getElementsByClassName("completed-table").length > 0) {
        Cookies.remove("rotationTracker");
        Cookies.remove("CRO");
        Cookies.remove("runDD");
        return;
    }
    // restore CURRENT_ROTATIONS array
    RotationsFromString();
    // Dummy Data
    SetDDExclusions();
    RunDD();
    // Rotation tracker
    RotationTracker();
    // PMode substitutions, before doing any item rotation
    ParseModeText();
    // Question and Answer level rotation of text and options
    ProcessAllRotations();
    // Flip answer options
    AnswersFlip();
    // Insert text between options
    AnswerInsertWord();
    // store CURRENT_ROTATIONS array for use in next question
    RotationsToCookie();
    // remove margin on next button if mode is mobile
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        $("div#navigator-container").css("margin", "0px");
    }
});
