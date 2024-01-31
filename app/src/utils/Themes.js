const AllThemes = [
  { id: "MYPVQccHhAQ", img: "cafe.png", name: "Cafe 1", category: ["Default", "Cafe"] },
  { id: "0L38Z9hIi5s", img: "cafe2.png", name: "Cafe 2", category: ["Default", "Cafe"] },
  { id: "fX7k3W-2BMM", img: "ghibli.png", name: "Ghibli", category: ["Default", "Anime"] },
  { id: "HGl75kurxok", img: "ghibli.png", name: "Anime", category: ["Default", "Anime"] },
  { id: "lTRiuFIWV54", img: "ani1.png", name: "Lofi 1", category: ["Default", "Lofi"] },
  { id: "jfKfPfyJRdk", img: "ani1.png", name: "Lofi Stream", category: ["Default", "Lofi"]},
  { id: "4vIQON2fDWM", img: "library2.png", name: "Library", category: ["Default", "Library"] },
  { id: "YQc4WT0yDH4", img: "library.png", name: "Bookstore", category: ["Default", "Library"] },
  { id: "UGRWG6wxXAw", img: "rain.png", name: "Rain", category: ["Default", "Rain"]}
];

const AllCategories = [
  "Cafe:0",
  "Rain:1",
  "Anime:2",
  "Lofi:3",
  "Nature:4",
  "Others:5",
]
AllCategories.sort((a, b) => {return a.localeCompare(b)}); //sort

export { AllCategories, AllThemes };