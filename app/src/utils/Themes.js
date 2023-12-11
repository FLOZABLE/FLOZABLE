const AllThemes = [
  { id: "MYPVQccHhAQ", img: "cafe.png", name: "Coffee Shop", category: ["Default"] },
  { id: "YQc4WT0yDH4", img: "library.png", name: "Bookstore", category: ["Default"] },
  { id: "0L38Z9hIi5s", img: "cafe2.png", name: "Cafe", category: ["Default"] },
  { id: "HGl75kurxok", img: "ghibli.png", name: "Anime", category: ["Default"] },
  { id: "lTRiuFIWV54", img: "ani1.png", name: "Lofi", category: ["Default"] },
  { id: "4vIQON2fDWM", img: "library2.png", name: "Library", category: ["Default"] },
];

const AllCategories = [
  "Cafe:0",
  "Rain:1",
  "Anime:2",
]
AllCategories.sort((a, b) => {return a.localeCompare(b)}); //sort

export { AllCategories, AllThemes };