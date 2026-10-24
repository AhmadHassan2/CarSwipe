import {
  BodyStyle,
  Condition,
  Drivetrain,
  FuelType,
  ReportReason,
  SellerType,
  Transmission,
  VehicleStatus,
} from "@/generated/prisma/enums";

export const BODY_STYLE_LABELS: Record<BodyStyle, string> = {
  SEDAN: "Sedan",
  SUV: "SUV",
  COUPE: "Coupe",
  HATCHBACK: "Hatchback",
  TRUCK: "Truck",
  CONVERTIBLE: "Convertible",
  WAGON: "Wagon",
  MINIVAN: "Minivan",
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  AUTOMATIC: "Automatic",
  MANUAL: "Manual",
};

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  GASOLINE: "Gasoline",
  DIESEL: "Diesel",
  HYBRID: "Hybrid",
  PLUG_IN_HYBRID: "Plug-in hybrid",
  ELECTRIC: "Electric",
};

export const DRIVETRAIN_LABELS: Record<Drivetrain, string> = {
  FWD: "FWD",
  RWD: "RWD",
  AWD: "AWD",
  FOUR_WD: "4WD",
};

export const CONDITION_LABELS: Record<Condition, string> = {
  NEW: "New",
  USED: "Used",
  CERTIFIED: "Certified pre-owned",
};

export const SELLER_TYPE_LABELS: Record<SellerType, string> = {
  PRIVATE: "Private seller",
  DEALER: "Dealer",
};

export const STATUS_LABELS: Record<VehicleStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  PENDING: "Pending",
  SOLD: "Sold",
  REMOVED: "Removed",
};

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  SCAM: "Looks like a scam",
  MISLEADING: "Misleading details or price",
  INAPPROPRIATE: "Inappropriate content",
  DUPLICATE: "Duplicate listing",
  SOLD: "Vehicle already sold",
  OTHER: "Something else",
};

export const BODY_STYLES = Object.values(BodyStyle);
export const TRANSMISSIONS = Object.values(Transmission);
export const FUEL_TYPES = Object.values(FuelType);
export const DRIVETRAINS = Object.values(Drivetrain);
export const CONDITIONS = Object.values(Condition);
export const SELLER_TYPES = Object.values(SellerType);
export const REPORT_REASONS = Object.values(ReportReason);

export const MAKES = [
  "Acura",
  "Audi",
  "BMW",
  "Chevrolet",
  "Ford",
  "Genesis",
  "Honda",
  "Hyundai",
  "Jeep",
  "Kia",
  "Lexus",
  "Mazda",
  "Mercedes-Benz",
  "Nissan",
  "Porsche",
  "Ram",
  "Subaru",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
] as const;

export const MIN_YEAR = 1990;
export const MAX_YEAR = new Date().getFullYear() + 1;
export const PRICE_CEILING = 250_000;
export const MILEAGE_CEILING = 300_000;
