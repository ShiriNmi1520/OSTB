const cards : Array<string> = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const types : Array<string> = ["♠", "♥", "♣", "♦"];

export function getRandom(pools : Array<string>, count : number): Array<string> {
	const arr : Array<string> = [];
	for (let i : number = 0; i < count; i++) {
		let pool : any = pools[Math.floor(Math.random() * pools.length)];
		arr.push(pool);
	}
	return arr;
}

export function getRandomWithType(count : number): Array<string> {
	const arr : Array<string> = [];
	for (let i : number = 0; i < count; i++) {
		let pool : string = cards[Math.floor(Math.random() * cards.length)];
		let type : string = types[Math.floor(Math.random() * types.length)];
		let result : string = pool + type;
		arr.indexOf(result) === -1 ? arr.push(result) : i--;
		}
		return arr;
}