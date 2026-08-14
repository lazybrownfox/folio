/**
 * Single source of truth for the work: the index rows on the home page and the
 * case-study pages under /work/<slug> read from here.
 *
 * A project only gets a page when it has something to show — three or four
 * visuals and text that explains a decision. Everything else stays an index
 * row with its hover reveal (`study` undefined), and is shared on request.
 */

export type WorkImage = {
  src: string;
  alt: string;
  /** Optional video source; `src` is then used as its poster. */
  video?: string;
  /** CSS aspect-ratio of the video (e.g. "452 / 928") so it is never cropped. */
  videoAspect?: string;
  fit?: "cover" | "contain";
  bg?: string;
  position?: string;
  caption?: string;
};

export type CaseSection = {
  heading: string;
  body: string;
  images: WorkImage[];
};

export type CaseStudy = {
  /** One sentence under the title: what the project is, in plain terms. */
  subtitle: string;
  services: string[];
  sector: string;
  year?: string;
  hero: WorkImage;
  sections: CaseSection[];
  /** Closing line before the next-project rail. */
  outro?: string;
};

export type Work = {
  slug: string;
  name: string;
  tag: string;
  role: string;
  /** Index-row backdrop + fallback; images[0] is the one that floods the section. */
  images: WorkImage[];
  fit?: "cover" | "contain";
  bg?: string;
  study?: CaseStudy;
};

const PHONE_BG = "#0a0d12";
const SLIDE_BG = "#f2f1ee";
const SLIDE_LIGHT = "#ffffff";

export const WORKS: Work[] = [
  {
    slug: "parions-sport",
    name: "Parions Sport",
    tag: "product · gaming",
    role: "Product design · accessibility",
    images: [
      {
        src: "/work/video/posters/fdj.jpg",
        alt: "Parions Sport live betting interface",
        video: "/work/video/fdj.mp4",
        videoAspect: "452 / 928",
        fit: "contain",
        bg: PHONE_BG,
      },
    ],
    study: {
      subtitle:
        "Live sports betting, where the match itself keeps interrupting the interface.",
      services: ["Product design", "Accessibility · RGAA 4", "AI-assisted ideation"],
      sector: "Gaming",
      hero: {
        src: "/work/video/posters/fdj.jpg",
        alt: "Parions Sport live betting list",
        video: "/work/video/fdj.mp4",
        videoAspect: "452 / 928",
        fit: "contain",
        bg: PHONE_BG,
        caption: "Live list — prototype recording",
      },
      sections: [
        {
          heading: "A list that is never still",
          body: "Everything on this screen carries a clock. Odds move, matches start, a stream plays at the top, promotions rotate. The list has to stay readable while all of that changes underneath it. The unit is the match card — competition, kick-off, two teams, three prices — repeated with enough air that the eye can skip a card it does not care about, which is most of them.",
          images: [
            {
              src: "/work/shots/fdj-live.jpg",
              alt: "Match cards with competition, kick-off time and three odds",
              fit: "contain",
              bg: PHONE_BG,
              caption: "The match card, repeated: the only stable thing on the screen.",
            },
          ],
        },
        {
          heading: "When a goal lands, the card says so",
          body: "A goal changes the value of every price on that card. Rather than leave stale odds sitting there, the card takes the event: the goal is announced across it and the three prices dim while they are recomputed, then the card returns to normal. The interface admits it does not know for a second — which is far cheaper than being confidently wrong about money.",
          images: [
            {
              src: "/work/shots/fdj-goal.jpg",
              alt: "A goal notification taking over a live match card, odds dimmed",
              fit: "contain",
              bg: PHONE_BG,
              caption: "Goal announced, prices suspended, card restored once valid.",
            },
          ],
        },
        {
          heading: "Dense, dark, and still accessible",
          body: "A dark, information-dense gaming product is exactly where accessibility gets dropped. Designing to RGAA 4 meant contrast on every price and label, state carried by more than colour alone, and touch targets that survive a thumb on a moving list. The constraints were applied during exploration — including the AI-assisted rounds — rather than audited at the end, which is the only way they survive contact with a deadline.",
          images: [
            {
              src: "/work/shots/fdj-list.jpg",
              alt: "Betting list with promotions and upcoming matches",
              fit: "contain",
              bg: PHONE_BG,
              caption: "Promotions and upcoming matches share the same reading rhythm.",
            },
          ],
        },
      ],
    },
  },
  {
    slug: "france-tv",
    name: "France TV",
    tag: "product · design system · broadcast",
    role: "Product design · design system",
    images: [
      {
        src: "/work/video/posters/ftv.jpg",
        alt: "France Télévisions Outre-mer portal app",
        video: "/work/video/ftv.mp4",
        videoAspect: "592 / 1280",
        fit: "contain",
        bg: PHONE_BG,
      },
    ],
    study: {
      subtitle:
        "Notifications for France Télévisions' Outre-mer portal — many territories, one Olympic summer, and a reader who mostly wants news from their own island.",
      services: ["Product design", "Design system", "Component specification"],
      sector: "Public broadcast",
      year: "2024",
      hero: {
        src: "/work/video/posters/ftv.jpg",
        alt: "1ère app — Olympics notification opt-in",
        video: "/work/video/ftv.mp4",
        videoAspect: "592 / 1280",
        fit: "contain",
        bg: PHONE_BG,
        caption: "Splash to opt-in — prototype recording",
      },
      sections: [
        {
          heading: "One portal, many territories",
          body: "The 1ère portal gathers news, live radio and television for the Outre-mer networks in a single app. The catch is that “the news” is not one feed: a reader in Guyane has little use for Martinique’s alerts, and everyone shares a handful of national moments. Personalisation here is not a growth feature, it is the basic condition for the app to be usable at all.",
          images: [
            {
              src: "/work/shots/ftv-home.jpg",
              alt: "Home feed of the Outre-mer portal with headline articles",
              fit: "contain",
              bg: PHONE_BG,
              caption: "À la une, en continu, tv, radio — one portal per territory.",
            },
          ],
        },
        {
          heading: "Preferences as a screen, not a settings dump",
          body: "One default territory, secondary territories added as needed, then events kept in their own group — plain toggles, with the current state readable at a glance. The failure case lives in the same screen: if system notifications are off nothing here can work, so the screen says so and offers the way to device settings instead of silently doing nothing.",
          images: [
            {
              src: "/work/shots/ftv-notifs.jpg",
              alt: "Notification preferences: default territory, secondary territories, events",
              fit: "contain",
              bg: PHONE_BG,
              caption: "Default territory, secondary territories, events — and the recovery path.",
            },
          ],
        },
        {
          heading: "Asking once, at the right moment",
          body: "For Paris 2024 the ask is a single modal: what you will receive, why it matters now, and two honest exits. An opt-in is an event, not a permanent nag — and whatever is chosen here stays editable in the notifications screen, so declining costs the reader nothing.",
          images: [
            {
              src: "/work/shots/ftv-optin.jpg",
              alt: "Olympics notification opt-in modal with accept and decline",
              fit: "contain",
              bg: PHONE_BG,
              caption: "One ask, two exits, reversible afterwards.",
            },
          ],
        },
        {
          heading: "Player rules, written down",
          body: "Product work like this only holds if the components are specified rather than described. The player carries a live “Direct” tag, and the progress bar behaves differently when it is present: what is drawn, what truncates, which timing labels stay. Documented that way, the rule survives handoff and the next team that touches it.",
          images: [
            {
              src: "/work/ftv-player-spec.jpg",
              alt: "Player specification: progress bar with and without the live Direct tag",
              fit: "contain",
              bg: SLIDE_BG,
              caption: "Player specification — the Direct tag and its progress bar.",
            },
          ],
        },
      ],
    },
  },
  {
    slug: "sncf",
    name: "SNCF · station UX",
    tag: "technical UI",
    role: "Information design · technical UI",
    images: [{ src: "/work/sncf.jpg", alt: "SNCF passenger information work" }],
    study: {
      subtitle:
        "Departure boards, status rules and train composition for stations — an interface read at thirty metres, in a hurry, usually by someone who is already late.",
      services: ["Information design", "Technical UI", "Design tokens"],
      sector: "Rail",
      year: "2019–22",
      hero: {
        src: "/work/sncf/folio-ux-16.png",
        alt: "Travellers reading departure and arrival boards in a station concourse",
        fit: "contain",
        bg: SLIDE_BG,
        caption: "The real reading conditions: distance, crowd, glare, hurry.",
      },
      sections: [
        {
          heading: "The brief was the station, not the screen",
          body: "The programme started as three commitments — adapt to a rail market opening to competition, be more accessible, support travellers in every situation. Nothing about pixels. But the departure board is where those promises are kept or broken: it has roughly four seconds to say whether the train exists, when it leaves and where to stand.",
          images: [
            {
              src: "/work/sncf.jpg",
              alt: "Programme framing slides: adapt, support, be accessible",
              fit: "contain",
              bg: SLIDE_BG,
              caption: "Three commitments that all land on the same screen.",
            },
          ],
        },
        {
          heading: "A palette built for distance",
          body: "These screens hang above a concourse: glare, oblique viewing angles, people reading while walking. The scale runs from blue-900 down to blue-50, with a single cyan accent held in reserve for live information — anything that moves, updates or is about to happen. Because the accent is rare, it carries meaning instead of decoration.",
          images: [
            {
              src: "/work/sncf/folio-ux-23.png",
              alt: "Colour scale from blue-900 to blue-50 with a cyan live accent",
              fit: "contain",
              bg: "#0f0f3b",
              caption: "One ramp, one accent, reserved for what is live.",
            },
          ],
        },
        {
          heading: "Status is the whole design",
          body: "A row is never just a destination and a time. It is on time, approaching, delayed, cancelled or replaced by a coach — and each state has to survive glare, colour blindness and a glance from across the hall. So state is carried three times over: a mark, a colour and a word. A cancellation breaks the row’s entire promise, so the destination is struck through and the platform slot is emptied rather than left showing a number nobody should walk to.",
          images: [
            {
              src: "/work/sncf/info-train.png",
              alt: "Departure and arrival rows carrying status marks",
              fit: "contain",
              bg: "#0f0f3b",
              caption: "Departures in blue, arrivals in green — same status vocabulary.",
            },
          ],
        },
        {
          heading: "Which carriage, and where to stand",
          body: "Composition strips map the train onto the platform: numbered carriages, occupancy, the train number repeated so it can be matched with the board overhead. It is the piece that turns “the train is here” into “walk that way” — the difference between information and help.",
          images: [
            {
              src: "/work/sncf/train.png",
              alt: "Train composition strips with numbered carriages and occupancy",
              fit: "contain",
              bg: "#0f0f3b",
              caption: "Composition and occupancy, in both reading contexts.",
            },
          ],
        },
      ],
      outro:
        "The departures board on the home page is a live rebuild of this work, running in your browser — statuses, split-flap and clock included.",
    },
  },
  {
    slug: "brevo",
    name: "Brevo",
    tag: "systems · ops",
    role: "Design ops · systems",
    images: [{ src: "/work/brevo.jpg", alt: "Brevo design ops work" }],
  },
  {
    slug: "cityscoot",
    name: "Cityscoot",
    tag: "product · mobility",
    role: "Product design · mobile flows",
    images: [
      {
        src: "/work/cityscoot.jpg",
        alt: "Cityscoot app onboarding and booking screens",
        fit: "contain",
        bg: "#f5f4ef",
      },
    ],
    fit: "contain",
    bg: "#f5f4ef",
    study: {
      subtitle:
        "Free-floating scooter sharing in Paris: find one nearby, book it, ride — three steps that all happen on a pavement, one-handed.",
      services: ["Product design", "Mobile flows", "Component library"],
      sector: "Mobility",
      hero: {
        src: "/work/cityscoot.jpg",
        alt: "Cityscoot onboarding screen and map with a selected scooter",
        fit: "contain",
        bg: "#f5f4ef",
        caption: "Onboarding, then the map — the app is really one screen.",
      },
      sections: [
        {
          heading: "Everything happens on the map",
          body: "Finding a scooter, checking it and paying for it are not three destinations in a menu — they are one continuous move on a map. The sheet slides up over it with the address, the walking time, the remaining range, the plate and the payment method, and commits with a single button. Nothing sends you elsewhere and back.",
          images: [
            {
              src: "/work/rebuilt/cityscoot-mapflow.svg",
              alt: "Booking flow: find, book, ride — map, vehicle sheet and confirmation",
              fit: "contain",
              bg: "#f5f4ef",
            },
          ],
        },
        {
          heading: "The markers carry the fleet",
          body: "One pin component, four readings: available, low battery, reserved, out of service. Colour does the sorting at a glance and the count takes over when the map zooms out and pins merge. The touch target stays at 44 px whatever the scale, because the map is used while standing in the street, not at a desk.",
          images: [
            {
              src: "/work/rebuilt/cityscoot-markers.svg",
              alt: "Map marker states, clustering behaviour and pin template",
              fit: "contain",
              bg: "#f5f4ef",
            },
          ],
        },
        {
          heading: "A small library, in the product’s own voice",
          body: "Buttons, fields, filters and the anatomy of the vehicle sheet, with the palette that separates action from availability from low battery. The labels are written in the first person — « Je réserve mon Cityscoot » — so the interface speaks the way the brand does rather than in verbs from a component library.",
          images: [
            {
              src: "/work/rebuilt/cityscoot-components.svg",
              alt: "Interface elements: buttons, inputs, filters, colours and sheet anatomy",
              fit: "contain",
              bg: "#f5f4ef",
            },
          ],
        },
      ],
      outro:
        "The source files for this project are long gone. The three panels above are honest reconstructions, redrawn as vector from the surviving screens — the work is real, only the files were lost.",
    },
  },
  {
    slug: "cosmo-connected",
    name: "CosmoConnected",
    tag: "product · connected mobility",
    role: "Product design · mobile app",
    images: [
      {
        src: "/work/video/posters/cosmoconnected.jpg",
        alt: "COSMO Connected app pairing flow",
        video: "/work/video/cosmoconnected.mp4",
        videoAspect: "498 / 1080",
        fit: "contain",
        bg: PHONE_BG,
      },
    ],
    study: {
      subtitle:
        "Pairing a connected light with a phone — the part of a hardware product where people quietly give up.",
      services: ["Product design", "Onboarding", "Mobile app"],
      sector: "Connected mobility",
      hero: {
        src: "/work/video/posters/cosmoconnected.jpg",
        alt: "COSMO Connected onboarding and pairing flow",
        video: "/work/video/cosmoconnected.mp4",
        videoAspect: "498 / 1080",
        fit: "contain",
        bg: PHONE_BG,
        caption: "The full pairing flow — prototype recording",
      },
      sections: [
        {
          heading: "Which device is in your hand?",
          body: "The range covers several products, and a pairing flow that guesses will fail for the wrong reason — leaving the user convinced the hardware is broken. So the first question is the plain one, asked once, in the words printed on the box.",
          images: [
            {
              src: "/work/shots/cosmo-device.jpg",
              alt: "Device selection screen asking which Cosmo product is being paired",
              fit: "contain",
              bg: PHONE_BG,
              caption: "Ask first, in the words on the box.",
            },
          ],
        },
        {
          heading: "Bluetooth, without the anxiety",
          body: "Searching, found, connected — then “click to test”. That last step is the one that matters: the user confirms the pairing with their own eyes, by seeing the light react, instead of trusting a spinner that claims success. When a device fails to appear, the screen says what to check rather than looping.",
          images: [
            {
              src: "/work/shots/cosmo-connected.jpg",
              alt: "Connection screen confirming the device is connected, with a test action",
              fit: "contain",
              bg: PHONE_BG,
              caption: "Confirmation you can see, not a spinner you must believe.",
            },
          ],
        },
        {
          heading: "The physical half of the flow",
          body: "Half of this onboarding happens with two hands on a bike: mounting the unit, aligning it, checking visibility. Those steps are drawn rather than photographed, because line art stays legible on a phone held in the street, in daylight, at arm’s length.",
          images: [
            {
              src: "/work/shots/cosmo-install.jpg",
              alt: "Line-art illustration of the light unit clipping onto its saddle mount, above the installation screen heading",
              fit: "contain",
              bg: PHONE_BG,
              caption: "Drawn, not photographed — legibility beats realism outdoors.",
            },
          ],
        },
        {
          heading: "Then the remote, the same way",
          body: "The handlebar remote reuses the pattern exactly: same sequence, same wording, same confirmation. Learning the flow once should be enough to add any device in the range — including the ones that did not exist when it was designed.",
          images: [
            {
              src: "/work/shots/cosmo-remote.jpg",
              alt: "Remote control pairing confirmation screen",
              fit: "contain",
              bg: PHONE_BG,
              caption: "One pattern, reused for every device.",
            },
          ],
        },
      ],
    },
  },
  {
    slug: "akt",
    name: "AKT",
    tag: "product · fintech",
    role: "Product design · fintech",
    images: [
      {
        src: "/work/akt.jpg",
        alt: "akt.io fintech app",
        video: "/work/video/akt.mp4",
        videoAspect: "768 / 1280",
        fit: "contain",
        bg: PHONE_BG,
      },
    ],
    study: {
      subtitle:
        "A euro-and-crypto account — and the release where the entire product turned dark.",
      services: ["Product design", "Design system", "Theming"],
      sector: "Fintech",
      year: "2022",
      hero: {
        src: "/work/akt.jpg",
        alt: "akt.io switching from light to dark theme",
        video: "/work/video/akt.mp4",
        videoAspect: "768 / 1280",
        fit: "contain",
        bg: PHONE_BG,
        caption: "The switch to dark, announced in-product — prototype recording",
      },
      sections: [
        {
          heading: "Two kinds of money, one balance",
          body: "The account holds euros and crypto at the same time, so the dashboard has to answer “how much do I have” before it answers “in what”. A single total leads, the split follows as cards, and the day’s movement is stated twice — in euros and in percent — because that is how people actually check.",
          images: [
            {
              src: "/work/akt/image-77.png",
              alt: "Dashboard with total balance, euro and crypto cards and transaction history",
              fit: "contain",
              bg: PHONE_BG,
              caption: "Total first, composition second, movement in both units.",
            },
          ],
        },
        {
          heading: "Market data without the theatre",
          body: "The asset screen holds a price history, a buy, a sell and the tabs that separate market data from your own performance. A chart in a wallet is decoration unless it answers a question, so the line keeps a readable range, a labelled value on the crosshair and timeframes that run from a day to everything.",
          images: [
            {
              src: "/work/akt/image-78.png",
              alt: "Asset screen with balance, buy and sell actions and price history chart",
              fit: "contain",
              bg: PHONE_BG,
              caption: "Buy, sell, and a chart that answers a question.",
            },
          ],
        },
        {
          heading: "A theme is a system question",
          body: "Dark mode shipped as an event: announced inside the product, with a way to decline and no consequence for saying no. Behind the modal it is design-system work — every token needs a dark counterpart, including chart lines, gradient cards and disabled states, which are precisely the parts of a fintech interface that break quietly when a palette is inverted.",
          images: [
            {
              src: "/work/shots/akt-darkmode.jpg",
              alt: "In-app modal announcing dark mode with accept and decline options",
              fit: "contain",
              bg: PHONE_BG,
              caption: "Announced, optional, reversible.",
            },
          ],
        },
      ],
    },
  },
  {
    slug: "black-sales",
    name: "Black Sales",
    tag: "branding",
    role: "Brand identity",
    images: [{ src: "/work/blacksails.jpg", alt: "Black Sales brand identity" }],
  },
  {
    slug: "ple",
    name: "Plé",
    tag: "branding · audio",
    role: "Brand identity",
    images: [
      { src: "/work/ple-cover.jpg", alt: "Plé brand image" },
      {
        src: "/work/ple.jpg",
        alt: "Plé identity — logo and tagline",
        fit: "contain",
        bg: "#1a1714",
      },
    ],
    study: {
      subtitle:
        "An identity for audio fiction — « aujourd’hui, les séries s’écoutent ».",
      services: ["Brand identity", "Art direction", "Product concept"],
      sector: "Audio",
      hero: {
        src: "/work/ple-cover.jpg",
        alt: "Plé brand image — a phone outline drawn over a listener",
        caption: "The phone drawn as a frame: the story happens through it, not on it.",
      },
      sections: [
        {
          heading: "A name you can say out loud",
          body: "The premise fits in a sentence: series are something you listen to now. The mark takes it literally — a play triangle cut into a yellow tile, sitting next to a short, spoken name — because the identity is judged at its smallest size first: an app icon, a cover thumbnail, a screen glanced at while walking.",
          images: [
            {
              src: "/work/ple.jpg",
              alt: "Plé logotype, tagline and play mark on black",
              fit: "contain",
              bg: "#1a1714",
              caption: "Mark, name and line — the whole brand in one slide.",
            },
          ],
        },
        {
          heading: "What it looks like as a product",
          body: "A brand for audio fiction has to survive a library, a player and an episode page before it means anything. These concept screens put the mark under that pressure: covers side by side, a player that stays legible in one hand, and an episode list where the typography does the sorting.",
          images: [
            {
              src: "/work/rebuilt/ple-app.svg",
              alt: "Plé app concept screens: library, player and series page",
              fit: "contain",
              bg: "#1f1917",
            },
          ],
        },
      ],
    },
  },
  {
    slug: "plume",
    name: "Plume",
    tag: "branding · mobility",
    role: "Brand identity",
    images: [
      { src: "/work/plume-cover.jpg", alt: "Plume brand image" },
      {
        src: "/work/plume-slide.jpg",
        alt: "Plume identity — last-mile mobility",
        fit: "contain",
        bg: PHONE_BG,
      },
    ],
    study: {
      subtitle:
        "« Le trait d’union » — a last-mile identity for folding scooters, between companies and public transport.",
      services: ["Brand identity", "Art direction"],
      sector: "Mobility",
      hero: {
        src: "/work/plume-cover.jpg",
        alt: "Plume brand image",
        caption: "Brand image — the person first, the object folded away.",
      },
      sections: [
        {
          heading: "A hyphen, not a vehicle",
          body: "The brand does not sell a scooter; it sells the missing link between a train station and an office, and between small towns and the cities they commute to. That positioning decides the whole register: the object is folded, carried, taken up an escalator — so the imagery stays on the person and the movement, and the mark keeps out of the way. It sits small over the photograph, lower case, in the same weight as the sentence it introduces.",
          images: [
            {
              src: "/work/plume-trait-union.jpg",
              alt: "Plume positioning slide: a commuter carrying a folded scooter on an escalator",
              fit: "contain",
              bg: SLIDE_LIGHT,
              caption: "The positioning slide — the mark, then the sentence.",
            },
          ],
        },
        {
          heading: "Useful before desirable",
          body: "The second promise is protection, not performance: useful first, so you are safe and free to move. Keeping the claim that plain rules out the whole vocabulary of speed and gear that this category usually reaches for — no dynamic angles, no product hero shots, no urban-warrior tone. Light, bright, and about the person.",
          images: [
            {
              src: "/work/plume-utile.jpg",
              alt: "Plume slide: sunlit figure stretching, with the “useful first” line",
              fit: "contain",
              bg: SLIDE_LIGHT,
              caption: "« Utile, d’abord » — the second half of the statement.",
            },
          ],
        },
      ],
    },
  },
  {
    slug: "beroe",
    name: "beroé",
    tag: "branding",
    role: "Brand identity",
    images: [{ src: "/work/beroe.jpg", alt: "beroé brand identity" }],
    fit: "contain",
    bg: "#cfcfcf",
  },
  {
    slug: "snatch",
    name: "Snatch",
    tag: "open-source · Rust CLI",
    role: "Logo · developer tool",
    images: [
      {
        src: "/work/snatch.jpg",
        alt: "Snatch open-source CLI logo",
        fit: "contain",
        bg: "#0a2a55",
      },
    ],
    fit: "contain",
    bg: "#0a2a55",
  },
  {
    slug: "perceptron",
    name: "perceptron",
    tag: "open-source · Erlang",
    role: "Logo · open source",
    images: [
      {
        src: "/work/mlp.jpg",
        alt: "perceptron open-source Erlang logo",
        fit: "contain",
        bg: "#082a4f",
      },
    ],
    fit: "contain",
    bg: "#082a4f",
  },
];

/** Projects with a case-study page, in index order. */
export const STUDIES = WORKS.filter((w) => w.study);

export const bySlug = (slug: string) => WORKS.find((w) => w.slug === slug);
