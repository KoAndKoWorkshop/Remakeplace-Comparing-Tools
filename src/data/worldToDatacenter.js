const worldToDatacenter = {
  Aegis: 'Elemental',
  Atomos: 'Elemental',
  Carbuncle: 'Elemental',
  Garuda: 'Elemental',
  Gungnir: 'Elemental',
  Kujata: 'Elemental',
  Tonberry: 'Elemental',
  Typhon: 'Elemental',

  Alexander: 'Gaia',
  Bahamut: 'Gaia',
  Durandal: 'Gaia',
  Fenrir: 'Gaia',
  Ifrit: 'Gaia',
  Ridill: 'Gaia',
  Tiamat: 'Gaia',
  Ultima: 'Gaia',

  Anima: 'Mana',
  Asura: 'Mana',
  Chocobo: 'Mana',
  Hades: 'Mana',
  Ixion: 'Mana',
  Masamune: 'Mana',
  Pandaemonium: 'Mana',
  Titan: 'Mana',

  Belias: 'Meteor',
  Mandragora: 'Meteor',
  Ramuh: 'Meteor',
  Shinryu: 'Meteor',
  Unicorn: 'Meteor',
  Valefor: 'Meteor',
  Yojimbo: 'Meteor',
  Zeromus: 'Meteor',

  Adamantoise: 'Aether',
  Cactuar: 'Aether',
  Faerie: 'Aether',
  Gilgamesh: 'Aether',
  Jenova: 'Aether',
  Midgardsormr: 'Aether',
  Sargatanas: 'Aether',
  Siren: 'Aether',

  Balmung: 'Crystal',
  Brynhildr: 'Crystal',
  Coeurl: 'Crystal',
  Diabolos: 'Crystal',
  Goblin: 'Crystal',
  Malboro: 'Crystal',
  Mateus: 'Crystal',
  Zalera: 'Crystal',

  Halicarnassus: 'Dynamis',
  Maduin: 'Dynamis',
  Marilith: 'Dynamis',
  Seraph: 'Dynamis',
  Cuchulainn: 'Dynamis',
  Golem: 'Dynamis',
  Kraken: 'Dynamis',
  Rafflesia: 'Dynamis',

  Behemoth: 'Primal',
  Excalibur: 'Primal',
  Exodus: 'Primal',
  Famfrit: 'Primal',
  Hyperion: 'Primal',
  Lamia: 'Primal',
  Leviathan: 'Primal',
  Ultros: 'Primal',

  Cerberus: 'Chaos',
  Louisoix: 'Chaos',
  Moogle: 'Chaos',
  Omega: 'Chaos',
  Phantom: 'Chaos',
  Ragnarok: 'Chaos',
  Sagittarius: 'Chaos',
  Spriggan: 'Chaos',

  Alpha: 'Light',
  Lich: 'Light',
  Odin: 'Light',
  Phoenix: 'Light',
  Raiden: 'Light',
  Shiva: 'Light',
  Twintania: 'Light',
  Zodiark: 'Light',

  Bismarck: 'Materia',
  Ravana: 'Materia',
  Sephirot: 'Materia',
  Sophia: 'Materia',
  Zurvan: 'Materia'
}

export function getDatacenterByWorld(worldName) {
  const cleanWorld = String(worldName || '').trim()
  return worldToDatacenter[cleanWorld] || 'Other'
}

export { worldToDatacenter }
