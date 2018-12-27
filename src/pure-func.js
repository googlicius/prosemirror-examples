/**
 * Make ID
 * @param {number} length 
 * @param {Array<string>} excepts 
 */
export function makeid(length, excepts = []) {
    length = length || 5;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    if (excepts.includes(text)) {
        return makeid(length, excepts);
    }

    return text;
}