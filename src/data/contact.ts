export const contactInfo = {
  email: "admin@rasatobacco.com",
  phone: "+91 9090204008",
  phoneRaw: "+919090204008",
  whatsappNumber: "919090204008",
  whatsappUrl: "https://wa.me/919090204008",
  instagramHandle: "rasatobacco",
  instagramUrl:
    "https://www.instagram.com/rasatobacco?igsh=MTNwNGhlYWV2cjB4Yg==",
  address: {
    company: "RASA Tobacco Partners Pvt. Ltd.",
    line1: "Suite 312A, Suncity Trade Tower",
    line2: "Sector 21, Dundahera",
    line3: "Gurugram, Haryana — 122016",
  },
};

export const whatsappUrlFor = (message: string) =>
  `${contactInfo.whatsappUrl}?text=${encodeURIComponent(message)}`;

export const catalogueWhatsAppUrl = whatsappUrlFor(
  "Hi RASA! I would like to request the full product catalogue. Please share the available series, flavours, formats, and pricing.",
);

export const partnerWhatsAppUrl = whatsappUrlFor(
  "Hi RASA! I am interested in becoming a RASA partner. Please share the partnership details and next steps.",
);
