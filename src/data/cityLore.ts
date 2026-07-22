export type BuildingType = 'temple' | 'fort' | 'house';

export interface CityLore {
  id: string;
  type: BuildingType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  title: string;
  excerpt: string;
  color: string;
}

export const cityLoreData: CityLore[] = [
  {
    id: 'b1-temple-athena',
    type: 'temple',
    position: [0, 0, -10],
    rotation: [0, 0, 0],
    scale: 1.5,
    title: 'Temple of Athena',
    excerpt: 'The goddess of wisdom, grey-eyed Athena, stood by Odysseus in his darkest hours. It was she who pleaded his case before Zeus, and she who guided his son Telemachus to seek his father.',
    color: '#adc7e6', // Silver-blue
  },
  {
    id: 'b2-fort-troy',
    type: 'fort',
    position: [-15, 0, -5],
    rotation: [0, Math.PI / 4, 0],
    scale: 1.2,
    title: 'Ruins of Troy',
    excerpt: 'For ten long years the Achaeans laid siege to the great walls of Troy. It was Odysseus who devised the wooden horse, bringing the impenetrable city to ashes and ending the age of heroes.',
    color: '#f59e0b', // Amber gold
  },
  {
    id: 'b3-house-ithaca',
    type: 'house',
    position: [12, 0, -2],
    rotation: [0, -Math.PI / 6, 0],
    scale: 1.0,
    title: 'Palace of Ithaca',
    excerpt: 'Far across the wine-dark sea lay Ithaca. Here, the faithful Penelope wove her shroud by day and unraveled it by night, keeping the haughty suitors at bay while waiting for her king\'s return.',
    color: '#debb8c', // Warm linen
  },
  {
    id: 'b4-house-eumaeus',
    type: 'house',
    position: [18, 0, -12],
    rotation: [0, -Math.PI / 3, 0],
    scale: 0.8,
    title: 'Hut of Eumaeus',
    excerpt: 'The loyal swineherd Eumaeus welcomed a disguised Odysseus into his humble home, showing that honor and hospitality lived not just in great palaces, but in the hearts of true men.',
    color: '#8c7b64', // Earthy brown
  },
  {
    id: 'b5-temple-poseidon',
    type: 'temple',
    position: [-8, 0, -18],
    rotation: [0, Math.PI / 8, 0],
    scale: 1.3,
    title: 'Shrine of Poseidon',
    excerpt: 'The Earth-Shaker, Lord of the Sea, bore a deep grudge against Odysseus for blinding his son, the Cyclops. His wrath drove Odysseus to the ends of the earth.',
    color: '#0099b3', // Deep teal
  }
];
