export interface Game {
  id: string;
  name: string;
  image: string;
  provider: string;
  category: string[];
}

export const games: Game[] = [
  { id: "1", name: "Fortune Dragon", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/618a2538-6d0a-469b-cd15-1b4c6007aa00/gamecover", provider: "PGSoft", category: ["recomendados", "pgsoft", "mais-jogados"] },
  { id: "2", name: "Cash Mania", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/fb31d7c7-9823-4c27-28a9-2f514ab13500/gamecover", provider: "PGSoft", category: ["recomendados", "pgsoft"] },
  { id: "3", name: "Wild Ape", image: "https://mediumrare.imgix.net/7fb4fbfab2d369897dce91e13c3c3b1a493f9d7037b8a13a11cac9138d68c339?&dpr=2&format=auto&auto=format&q=50", provider: "PGSoft", category: ["recomendados", "pgsoft"] },
  { id: "4", name: "Fortune Tiger", image: "https://mediumrare.imgix.net/50823c8863f61bdc3465d578bb4b6bf50deb0fe240c645955b95aa87823b1d4c?&dpr=2&format=auto&auto=format&q=50", provider: "PGSoft", category: ["recomendados", "pgsoft", "mais-jogados"] },
  { id: "5", name: "Fortune Ox", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/9db13e8a-86d4-4277-e9c5-bbb8fd414200/gamecover", provider: "PGSoft", category: ["recomendados", "pgsoft", "mais-jogados"] },
  { id: "6", name: "Fortune Mouse", image: "https://mediumrare.imgix.net/2b8a8366f476adb46de2856d45e78aeb08a3e38ae8df605cdfc712f439bd1c15?&dpr=2&format=auto&auto=format&q=50", provider: "PGSoft", category: ["recomendados", "pgsoft"] },
  { id: "7", name: "Fortune Rabbit", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/00d5f254-4a0b-4e25-b645-c8add9d1da00/gamecover", provider: "PGSoft", category: ["recomendados", "pgsoft", "mais-jogados"] },
  { id: "8", name: "Ganesha Gold", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/83b26607-b61f-4249-5bca-ef57c10d6200/gamecover", provider: "PGSoft", category: ["pgsoft"] },
  { id: "9", name: "Double Fortune", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/7c09bae0-446e-4849-d02a-ac1e71ea1d00/gamecover", provider: "PGSoft", category: ["pgsoft"] },
  { id: "10", name: "Mahjong Ways", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/7ed497fe-86ba-473a-5735-9030e6eb1d00/gamecover", provider: "PGSoft", category: ["pgsoft", "mais-jogados"] },
  { id: "11", name: "Treasures of Aztec", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/9a1bbfcb-b7b1-431d-0aef-fb3f13d6f900/gamecover", provider: "PGSoft", category: ["pgsoft"] },
  { id: "12", name: "Speed Roulette", image: "https://media.ttfileserver.com/376/pragmatic-live/300x300/23255.png", provider: "Pragmatic", category: ["pragmatic-ao-vivo"] },
  { id: "13", name: "Lightning Roulette", image: "https://media.ttfileserver.com/376/pragmatic-live/300x300/23236.png", provider: "Pragmatic", category: ["pragmatic-ao-vivo", "mais-jogados"] },
  { id: "14", name: "Sweet Bonanza", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/ba407654-aec1-4107-8389-7af5bf84da00/gamecover", provider: "Pragmatic", category: ["pragmatic-play", "recomendados", "mais-jogados"] },
  { id: "15", name: "Gates of Olympus", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/6acbdb7c-7bca-464d-0798-23f185276e00/gamecover", provider: "Pragmatic", category: ["pragmatic-play", "recomendados", "mais-jogados"] },
  { id: "16", name: "Starlight Princess", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/503b4b8d-4018-4e70-283c-d70a4afe3400/gamecover", provider: "Pragmatic", category: ["pragmatic-play"] },
  { id: "17", name: "Sugar Rush", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/461921ad-6272-48e5-131f-8e8bc4d15c00/gamecover", provider: "Pragmatic", category: ["pragmatic-play"] },
  { id: "18", name: "The Dog House", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/b9368250-cc9f-4837-7f59-249dd3ea6800/gamecover", provider: "Pragmatic", category: ["pragmatic-play"] },
  { id: "19", name: "Big Bass Bonanza", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/7b5d4c0e-81ae-41ce-1033-a751bc0d0500/gamecover", provider: "Pragmatic", category: ["pragmatic-play"] },
  { id: "20", name: "Fruit Party", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/0f319f1b-131c-4d19-1f18-75373931b800/gamecover", provider: "Pragmatic", category: ["pragmatic-play"] },
  { id: "21", name: "Wild West Gold", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/ce0e3554-ac0f-4417-c5d2-b8e23fdd3300/gamecover", provider: "Pragmatic", category: ["pragmatic-play"] },
  { id: "22", name: "Baccarat", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/1368e9d5-77bb-4a69-c01d-3e3ef4650f00/gamecover", provider: "Ezugi", category: ["ezugi"] },
  { id: "23", name: "Roulette", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/d1d383a1-d1aa-4967-d553-bdd498e3b600/gamecover", provider: "Ezugi", category: ["ezugi"] },
  { id: "24", name: "Blackjack", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/519bf111-d6cb-442b-96c5-0b8d982c0a00/gamecover", provider: "Ezugi", category: ["ezugi"] },
  { id: "25", name: "Dragon Tiger", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/3047a9fc-ea0b-4988-f2ab-e6c783c01500/gamecover", provider: "Ezugi", category: ["ezugi"] },
  { id: "26", name: "Andar Bahar", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/fd896f67-64f3-4874-3b2b-5a201e361c00/gamecover", provider: "Ezugi", category: ["ezugi"] },
  { id: "27", name: "Aviador", image: "/images/aviator.png", provider: "Spribe", category: ["crash-games", "recomendados", "mais-jogados"] },
  { id: "28", name: "Mines", image: "/images/mines.jpg", provider: "Spribe", category: ["crash-games"] },
  { id: "29", name: "Plinko", image: "/images/plinko.webp", provider: "Spribe", category: ["crash-games"] },
  { id: "30", name: "Dice", image: "/images/dice.webp", provider: "Spribe", category: ["crash-games"] },
  { id: "31", name: "Hi-Lo", image: "/images/hilo.jpg", provider: "Spribe", category: ["crash-games"] },
  { id: "32", name: "Spaceman", image: "https://imagedelivery.net/OUTngZrupQp0X-PFiPzvuA/0431900c-a364-45d9-44e3-ee503f810200/gamecover", provider: "Pragmatic", category: ["crash-games"] },
];

export const providers = [
  { name: "PGSoft", image: "/images/pgsoft.png" },
  { name: "Pragmatic Play", image: "/images/pragmatic.png" },
  { name: "Evolution", image: "/images/evolution.png" },
  { name: "Ezugi", image: "/images/ezugi.png" },
  { name: "Playtech", image: "/images/playtech.png" },
];

export const winningEntries = [
  { user: "Jog***r123", game: "Fortune Tiger", amount: "R$ 2.450,00" },
  { user: "Bet***456", game: "Gates of Olympus", amount: "R$ 1.890,00" },
  { user: "Luc***789", game: "Sweet Bonanza", amount: "R$ 3.200,00" },
  { user: "Vin***012", game: "Fortune Dragon", amount: "R$ 980,00" },
  { user: "Mar***345", game: "Aviador", amount: "R$ 5.100,00" },
  { user: "Car***678", game: "Fortune Ox", amount: "R$ 1.350,00" },
  { user: "Ana***901", game: "Lightning Roulette", amount: "R$ 4.200,00" },
  { user: "Ped***234", game: "Fortune Rabbit", amount: "R$ 760,00" },
  { user: "Raf***567", game: "Mines", amount: "R$ 2.100,00" },
  { user: "Jul***890", game: "Plinko", amount: "R$ 1.550,00" },
];
