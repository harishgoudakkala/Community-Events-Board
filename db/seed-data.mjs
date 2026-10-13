// 15 sample events. Dates are relative to "now" so the data always has a mix of
// past and upcoming events no matter when the app is first run.
//   days   : offset from today (negative = already happened)
//   at     : [hour, minute] in IST (Asia/Kolkata)
//   active : false = hidden from visitors

const IST_OFFSET_MIN = 330;

const pic = (seed) => `https://picsum.photos/seed/${seed}/800/450`;

const SAMPLE = [
  // ---- Upcoming + active (10) ----
  { title: "Sunday Jazz Night", category: "Music", city: "Hyderabad", days: 3, at: [19, 0], price: 499,
    description: "An easy Sunday evening with a live jazz quartet, small plates and a cosy courtyard setting. Doors open at 6:30 PM.", image: "jazz-night", active: true },
  { title: "Indie Rock Night", category: "Music", city: "Coimbatore", days: 5, at: [20, 0], price: 750,
    description: "Three local indie bands, one stage and a loud, friendly crowd. Earplugs available at the entrance.", image: "indie-rock", active: true },
  { title: "Unplugged Acoustic Night", category: "Music", city: "Coimbatore", days: 12, at: [18, 30], price: 350,
    description: "Singer-songwriters, acoustic guitars and chai. Come early to grab a seat close to the stage.", image: "acoustic", active: true },
  { title: "Carnatic Classical Evening", category: "Music", city: "Chennai", days: 16, at: [18, 0], price: 300,
    description: "A relaxed concert of Carnatic vocal and violin by rising young artists, followed by a short Q&A.", image: "carnatic", active: true },
  { title: "Wheel Throwing Pottery Workshop", category: "Workshop", city: "Bengaluru", days: 6, at: [10, 30], price: 1800,
    description: "A hands-on beginner session. Learn to centre clay, pull walls and shape a bowl you take home. All materials included.", image: "pottery", active: true },
  { title: "Street Photography Walk", category: "Workshop", city: "Chennai", days: 9, at: [6, 30], price: 900,
    description: "A guided early-morning walk through old Chennai with tips on light, framing and approaching strangers. Bring any camera or phone.", image: "photo-walk", active: true },
  { title: "Street Food Festival", category: "Food", city: "Chennai", days: 4, at: [17, 0], price: 150,
    description: "Forty stalls, regional specialities and live cooking demos. Entry covers the venue; food is paid at each stall.", image: "street-food", active: true },
  { title: "Heritage Charity Gala Dinner", category: "Food", city: "Mumbai", days: 21, at: [20, 0], price: 150000,
    description: "A seven-course tasting dinner by guest chefs in support of a children's education fund. Black tie optional, limited to 60 guests.", image: "gala-dinner", active: true },
  { title: "Sunrise 10K Run", category: "Sports", city: "Hyderabad", days: 7, at: [5, 30], price: 1200,
    description: "A flat, timed 10K around the lake with water stations, pacers and a finisher medal for everyone.", image: "run-10k", active: true },
  { title: "Kids Storytelling Morning", category: "Kids", city: "Hyderabad", days: 2, at: [10, 0], price: 0,
    description: "Puppets, songs and picture-book stories for ages 4 to 8. Free entry, parents welcome to stay.", image: "storytelling", active: true },

  // ---- Upcoming but inactive (2) ----
  { title: "Retro Night", category: "Music", city: "Coimbatore", days: 8, at: [20, 30], price: 600,
    description: "Hits from the 80s and 90s by a live band. Currently on hold while the venue is confirmed.", image: "retro-night", active: false },
  { title: "Pop-up Art Workshop", category: "Workshop", city: "Mumbai", days: 9, at: [15, 0], price: 1100,
    description: "Mixed-media painting for beginners. Postponed, new date to be announced.", image: "art-workshop", active: false },

  // ---- Past (3) ----
  { title: "Open Mic Night", category: "Music", city: "Hyderabad", days: -5, at: [19, 30], price: 200,
    description: "Poetry, comedy and music from first-time performers.", image: "open-mic", active: true },
  { title: "Diwali Food Carnival", category: "Food", city: "Mumbai", days: -12, at: [16, 0], price: 250,
    description: "Festive sweets, snacks and live music across three food courts.", image: "diwali-food", active: true },
  { title: "Junior Science Fair", category: "Kids", city: "Coimbatore", days: -20, at: [10, 0], price: 100,
    description: "Student exhibits, simple experiments and a robotics corner for school children.", image: "science-fair", active: false },
];

// Returns the ISO UTC timestamp for `days` from now at the given IST wall-clock time.
function istToIso(now, days, [hour, minute]) {
  const shifted = new Date(now.getTime() + days * 86400000 + IST_OFFSET_MIN * 60000);
  const utcMs =
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate(), hour, minute) -
    IST_OFFSET_MIN * 60000;
  return new Date(utcMs).toISOString();
}

export function buildSeedEvents(now = new Date()) {
  return SAMPLE.map((e) => ({
    title: e.title,
    category: e.category,
    city: e.city,
    startsAt: istToIso(now, e.days, e.at),
    price: e.price,
    description: e.description,
    imageUrl: pic(e.image),
    isActive: e.active ? 1 : 0,
  }));
}
