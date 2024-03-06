"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cards = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const types = ["♠", "♥", "♣", "♦"];
function getRandom(pools, count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
        let pool = pools[Math.floor(Math.random() * pools.length)];
        arr.push(pool);
    }
    return arr;
}
exports.getRandom = getRandom;
function getRandomWithType(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
        let pool = cards[Math.floor(Math.random() * cards.length)];
        let type = types[Math.floor(Math.random() * types.length)];
        let result = pool + type;
        arr.indexOf(result) === -1 ? arr.push(result) : i--;
    }
    return arr;
}
exports.getRandomWithType = getRandomWithType;
//# sourceMappingURL=giveCard.js.map