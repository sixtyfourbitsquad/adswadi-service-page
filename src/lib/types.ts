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

export type Config = {
  title: string;
  subtitle: string;
  services: ServiceItem[];
  payment: PaymentGateway;
};
