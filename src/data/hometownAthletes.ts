export interface Athlete {
  name: string;
  sport: string;
  type: string;
}

export const hometownAthletes: Record<string, Athlete[]> = {
  "California": [
    { name: "Chloe Kim", sport: "Snowboarding", type: "Olympics" },
    { name: "Oksana Masters", sport: "Para Nordic Skiing", type: "Paralympics" },
    { name: "Nathan Chen", sport: "Figure Skating", type: "Olympics" },
    { name: "Declan Farmer", sport: "Para Ice Hockey", type: "Paralympics" },
    { name: "Katie Ledecky", sport: "Swimming", type: "Olympics" }
  ],
  "Texas": [
    { name: "Simone Biles", sport: "Gymnastics", type: "Olympics" },
    { name: "Brittany Bowe", sport: "Speed Skating", type: "Olympics" },
    { name: "Jarryd Wallace", sport: "Para Athletics", type: "Paralympics" },
    { name: "Mallory Weggemann", sport: "Para Swimming", type: "Paralympics" }
  ],
  "Florida": [
    { name: "Caeleb Dressel", sport: "Swimming", type: "Olympics" },
    { name: "Brad Snyder", sport: "Para Swimming / Paratriathlon", type: "Paralympics" },
    { name: "Noah Lyles", sport: "Athletics", type: "Olympics" }
  ],
  "Ohio": [
    { name: "LeBron James", sport: "Basketball", type: "Olympics" },
    { name: "Grace Norman", sport: "Paratriathlon", type: "Paralympics" },
    { name: "Kaitlin Hawayek", sport: "Figure Skating", type: "Olympics" }
  ],
  "Nevada": [
    { name: "David Wise", sport: "Freestyle Skiing", type: "Olympics" },
    { name: "Kiley McKinnon", sport: "Freestyle Skiing", type: "Olympics" }
  ],
  "Colorado": [
    { name: "Mikaela Shiffrin", sport: "Alpine Skiing", type: "Olympics" },
    { name: "Lindsey Vonn", sport: "Alpine Skiing", type: "Olympics" },
    { name: "Thomas Walsh", sport: "Para Alpine Skiing", type: "Paralympics" }
  ],
  "Maryland": [
    { name: "Michael Phelps", sport: "Swimming", type: "Olympics" },
    { name: "Tatyana McFadden", sport: "Para Athletics", type: "Paralympics" },
    { name: "Becca Meyers", sport: "Para Swimming", type: "Paralympics" }
  ],
  "Oklahoma": [
    { name: "Bart Conner", sport: "Gymnastics", type: "Olympics" },
    { name: "Shannon Miller", sport: "Gymnastics", type: "Olympics" },
    { name: "Jeremy Campbell", sport: "Para Athletics", type: "Paralympics" }
  ],
  "Illinois": [
    { name: "Evan Lysacek", sport: "Figure Skating", type: "Olympics" },
    { name: "Kendall Gretsch", sport: "Para Nordic Skiing / Paratriathlon", type: "Paralympics" }
  ],
  "Wisconsin": [
    { name: "Jessie Diggins", sport: "Cross-Country Skiing", type: "Olympics" }, 
    { name: "Josh Pauls", sport: "Para Ice Hockey", type: "Paralympics" },
    { name: "Gwen Jorgensen", sport: "Triathlon", type: "Olympics" }
  ],
  "Minnesota": [
    { name: "Sunisa Lee", sport: "Gymnastics", type: "Olympics" },
    { name: "Aaron Pike", sport: "Para Nordic Skiing / Para Athletics", type: "Paralympics" },
    { name: "John Shuster", sport: "Curling", type: "Olympics" }
  ],
  "New York": [
    { name: "Erin Jackson", sport: "Speed Skating", type: "Olympics" },
    { name: "Rico Roman", sport: "Para Ice Hockey", type: "Paralympics" }
  ]
};
