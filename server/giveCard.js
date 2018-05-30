"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cards = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
var types = ["♠", "♥", "♣", "♦"];
function getRandom(pools, count) {
    var arr = [];
    for (var i = 0; i < count; i++) {
        var pool = pools[Math.floor(Math.random() * pools.length)];
        arr.indexOf(pool) == -1 ? arr.push(pool) : i--;
    }
    return arr;
}
exports.getRandom = getRandom;
function getRandomWithType(count) {
    var arr = [];
    for (var i = 0; i < count; i++) {
        var pool = cards[Math.floor(Math.random() * cards.length)];
        var type = types[Math.floor(Math.random() * types.length)];
        var result = pool + type;
        arr.indexOf(result) == -1 ? arr.push(result) : i--;
    }
    return arr;
}
exports.getRandomWithType = getRandomWithType;
module.exports = {
    getRandom: getRandom,
    getRandomWithType: getRandomWithType
};
//# sourceMappingURL=giveCard.js.map