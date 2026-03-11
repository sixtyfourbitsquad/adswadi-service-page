export type SubCategory = {
  name: string;
  price: string;
  /** Admin-set amount for payment QR (e.g. "4999"). Used when user clicks Pay for this option. */
  amount?: string;
};

export type ServiceItem = {
  id: string;
  name: string;
  slug: string;
  image: string;
  /** Single price string, or for Meta ads: subCategories with weekly/monthly */
  price?: string;
  /** Admin-set amount for payment QR (e.g. "9999"). When user clicks Pay, this value is used to generate QR. */
  amount?: string;
  subCategories?: SubCategory[];
};

export type PaymentGateway = {
  qrImageUrl: string;
  upiId: string;
  upiName: string;
  whatsappNumber: string;
};

/** One tier on Indian Meta Agency page: daily limit label + weekly/monthly options */
export type MetaAgencyIndianTier = {
  dailyLimit: string;
  weekly: { price: string; amount?: string };
  monthly: { price: string; amount?: string };
};

/** Indian Meta Agency detail page: 3 tiers (e.g. 5K, 20K, 30K), each with Weekly/Monthly */
export type MetaAgencyIndian = {
  tiers: MetaAgencyIndianTier[];
  needMoreLabel?: string;
};

/** One category on International Meta Agency page (e.g. White Hat) */
export type MetaAgencyInternationalCategory = {
  name: string;
  price: string;
  amount?: string;
};

/** International Meta Agency detail page: White Hat, Grey Hat, Black Hat */
export type MetaAgencyInternational = {
  categories: MetaAgencyInternationalCategory[];
};

/** Hero banner & Pay Now CTA (between subtitle and Our Services) – admin controllable */
export type HeroBanner = {
  enabled: boolean;
  imageUrl: string;
  buttonText: string;
  /** Display name shown on payment page (e.g. "Banner Special Offer") */
  serviceName: string;
  /** Amount for UPI QR (e.g. "9999") – same as other Pay buttons */
  amount: string;
};

/** Indian or International option for Google Agency (price + amount for QR) */
export type GoogleAgencyOption = {
  price: string;
  amount?: string;
};

/** Google Agency Weekly page: Indian + International */
export type GoogleAgencyWeekly = {
  indian: GoogleAgencyOption;
  international: GoogleAgencyOption;
};

/** Google Agency Monthly page: Indian + International */
export type GoogleAgencyMonthly = {
  indian: GoogleAgencyOption;
  international: GoogleAgencyOption;
};

export type Config = {
  title: string;
  subtitle: string;
  /** Optional hero banner + Pay Now button (admin toggle) */
  heroBanner?: HeroBanner;
  services: ServiceItem[];
  payment: PaymentGateway;
  /** Indian Meta Agency page: 3 tiers with daily limit + weekly/monthly */
  metaAgencyIndian?: MetaAgencyIndian;
  /** International Meta Agency page: White Hat, Grey Hat, Black Hat */
  metaAgencyInternational?: MetaAgencyInternational;
  /** Google Agency – Weekly: Indian & International options (legacy) */
  googleAgencyWeekly?: GoogleAgencyWeekly;
  /** Google Agency – Monthly: Indian & International options (legacy) */
  googleAgencyMonthly?: GoogleAgencyMonthly;
  /** Google Agency – direct to payment: Indian option */
  googleAgencyIndian?: GoogleAgencyOption;
  /** Google Agency – direct to payment: International option */
  googleAgencyInternational?: GoogleAgencyOption;
};
