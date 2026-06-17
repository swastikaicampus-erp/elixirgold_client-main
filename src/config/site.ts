export const siteConfig = {
  name: "ELIXIR GOLD",
  title: "ELIXIR GOLD LIVE DESK",
  description: "Live gold and silver rates with city-based pricing",
  contact: {
    // phone: "+91-9555573555",
    // email: "inbox.elixir@gmail.com",
  },
  workingHours: "11:00 AM - 8:00 PM",
  socials: {
    facebook: "#", // Add your Facebook link here
  },
  footer: {
    copyright: "© 2024 All Rights Reserved. ELIXIR GOLD", // Updated to 2024
  },
  api: {
    streamUrl: "https://bcast.kanhajewellers.in:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/kanha",
    refreshMs: 1000,
  },
  services: [
    {
      title: "Silver Assaying",
      image: "/static/download.jpg",
    },
    {
      title: "Gold & Silver Melting",
      image: "/static/download-1.jpg",
    },
    {
      title: "Spot Bullion Trading",
      image: "/static/download-2.jpg",
    },
    {
      title: "Jewellery Calculator Support",
      image: "/static/download.avif",
    },
  ],
  branches: [
    {
      name: "Gwalior",
      title: "GWALIOR BRANCH",
      address: "Elixir Gold, Srinath Complex, Mor Gali, Sarafa, Lashkar, Gwalior, (MP) 474001",
      // email: "inbox.elixir@gmail.com",
      // phone: "9555573555",
      // loginUrl: "http://elixirgold.co.in/elixirgwl/login",
    },
    {
      name: "Etawah",
      title: "ETAWAH BRANCH",
      address: "ELIXIR GOLD, 1ST FLOOR, RAMESHWARAM MARKET, SARAFA BAZAR, HOMEGANJ, ETAWAH (UP)",
      // email: "inbox.elixir@gmail.com",
      // phone: "9555573555",
      // loginUrl: "http://elixirgold.co.in/elixiretawah/login.php",
    },
    {
      name: "Jhansi",
      title: "JHANSI BRANCH",
      address: "JHANSI",
      // email: "inbox.elixir@gmail.com",
      // phone: "9555573555",
      // loginUrl: "#",
    },
  ],
  adminPortals: [
    {
      name: "Gwalior Admin",
      href: "http://elixirgold.co.in/elixirgwl/login",
    },
    {
      name: "Etawah Admin",
      href: "http://elixirgold.co.in/elixiretawah/login.php",
    },
    {
      name: "Dehradun Admin",
      href: "http://elixirgold.co.in/elixiretawah/login.php",
    },
  ],

  sliderImage: [
    '/zlataky-cz-fqUBQejVYDM-unsplash.jpg',
    '/vaibhav-nagare-e8LrvEAZqYM-unsplash.jpg'
  ]
};
