const WORD_LISTS = {
  1: ["tank", "radar", "artillery", "base", "squad", "missile", "armor", "turret", "laser", "shield", "drone", "scout", "bunker", "platoon", "cannon", "rocket", "medic", "sniper", "ambush", "defend", "attack", "combat", "force", "patrol"],
  2: ["Tank", "RadarX", "DeltaForce", "Alpha", "Bravo", "Charlie", "Missile", "Armor", "Turret", "Laser", "Shield", "Drone", "Scout", "Bunker", "Platoon", "Cannon", "Rocket", "Medic", "Sniper", "Ambush", "Defend", "Attack", "Combat", "Force", "Patrol", "tank", "radar", "artillery"],
  3: ["Squad5", "Tank99", "Base1", "Sector7", "Unit42", "v2.0", "M4A1", "F16", "B52", "AK47", "C4", "MP5", "Level9", "Zone3", "Area51", "tank", "radar", "artillery", "Tank", "RadarX", "DeltaForce", "123", "456", "789", "0"],
  4: ["(8+9)", "[tank-01]", "{cmd-9}", "!alert!", "v2.0", "M4A1", "C4", "MP5", "Level9", "Zone3", "Area51", "tank", "radar", "artillery", "Tank", "RadarX", "DeltaForce", "123", "456", "789", "0", "A-10", "F-22", "B-2", "AC-130", "UH-60", "AH-64", "CH-47", "SR-71", "U-2", "RQ-4"]
};

function getRandomWord(mode) {
  const list = WORD_LISTS[mode] || WORD_LISTS[1];
  return list[Math.floor(Math.random() * list.length)];
}
