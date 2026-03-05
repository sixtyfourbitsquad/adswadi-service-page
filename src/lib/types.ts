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

/** Google Ads detail: Weekly/Monthly each have Indian + International options */
export type GoogleAdsOption = { price: string; amount?: string };
export type GoogleAdsDetail = {
  weekly: { indian: GoogleAdsOption; international: GoogleAdsOption };
  monthly: { indian: GoogleAdsOption; international: GoogleAdsOption };
};

export type Config = {
  title: string;
  subtitle: string;
  services: ServiceItem[];
  payment: PaymentGateway;
  /** Indian Meta Agency page: 3 tiers with daily limit + weekly/monthly */
  metaAgencyIndian?: MetaAgencyIndian;
  /** International Meta Agency page: White Hat, Grey Hat, Black Hat */
  metaAgencyInternational?: MetaAgencyInternational;
  /** Google Ads Weekly/Monthly → Indian & International (values set in admin) */
  googleAdsDetail?: GoogleAdsDetail;
};
