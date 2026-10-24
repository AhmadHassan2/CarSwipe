import type {
  BodyStyle,
  Condition,
  Drivetrain,
  FuelType,
  Transmission,
  VehicleStatus,
} from "../../src/generated/prisma/enums";

/**
 * Demo inventory. Photos are free-to-use Unsplash images (Unsplash License)
 * chosen to show the same make and model as the listing; they are
 * representative stock photos, not pictures of the specific vehicle, and the
 * listings are flagged `isDemo` in the UI.
 */
export type SeedVehicle = {
  seller: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  price: number;
  mileage: number;
  bodyStyle: BodyStyle;
  transmission: Transmission;
  fuelType: FuelType;
  drivetrain: Drivetrain;
  engine?: string;
  horsepower?: number;
  exteriorColour?: string;
  interiorColour?: string;
  owners?: number;
  condition?: Condition;
  status?: VehicleStatus;
  features?: string[];
  description: string;
  history?: string;
  /** Unsplash photo ids. A single photo gets two detail crops generated from it. */
  photos: string[];
  daysAgo: number;
};

export const VEHICLES: SeedVehicle[] = [
  // BMW
  {
    seller: "northline", make: "BMW", model: "M4", year: 2022, trim: "Competition xDrive",
    price: 94900, mileage: 21500, bodyStyle: "COUPE", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "3.0L twin-turbo inline-6", horsepower: 503, exteriorColour: "Toronto Red", interiorColour: "Black Merino leather", owners: 1, condition: "CERTIFIED",
    features: ["M Carbon bucket seats", "Harman Kardon audio", "Head-up display", "Adaptive M suspension", "Parking assistant", "Heated steering wheel"],
    description: "One-owner M4 Competition with xDrive, serviced at BMW since new. Winter tires on separate rims included. Certified with extended warranty available.",
    history: "No accidents reported. Full BMW service history.", photos: ["1617531653332-bd46c24f2068"], daysAgo: 2,
  },
  {
    seller: "marcus", make: "BMW", model: "M4", year: 2019, trim: "Competition",
    price: 58900, mileage: 48000, bodyStyle: "COUPE", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "RWD",
    engine: "3.0L twin-turbo inline-6", horsepower: 444, exteriorColour: "Mineral Grey", interiorColour: "Black", owners: 2,
    features: ["Carbon roof", "Adaptive LED headlights", "Harman Kardon audio", "Heated seats", "Rear-view camera"],
    description: "Garage-kept and never tracked. Summer car only, stored every winter. Recent brakes and Michelin Pilot Sport 4S tires.",
    photos: ["1580273916550-e323be2ae537", "1614026480209-cd9934144671"], daysAgo: 6,
  },
  {
    seller: "lakeshore", make: "BMW", model: "M5", year: 2020, trim: "Competition",
    price: 82500, mileage: 39000, bodyStyle: "SEDAN", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "4.4L twin-turbo V8", horsepower: 617, exteriorColour: "Alpine White", interiorColour: "Black / Silverstone", owners: 1,
    features: ["Bowers & Wilkins audio", "Soft-close doors", "Ventilated front seats", "Driving Assistant Professional", "Rear sunshades"],
    description: "Executive sedan with supercar pace. Ontario vehicle, clean history, and both keys. Freshly detailed and ceramic coated.",
    photos: ["1555215695-3004980ad54e"], daysAgo: 4,
  },
  {
    seller: "priya", make: "BMW", model: "430i", year: 2019, trim: "xDrive Coupe",
    price: 33900, mileage: 67000, bodyStyle: "COUPE", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "2.0L turbo inline-4", horsepower: 248, exteriorColour: "Estoril Blue", interiorColour: "Black Dakota leather", owners: 1,
    features: ["M Sport package", "Heated seats", "Navigation", "Apple CarPlay", "Rear-view camera"],
    description: "My daily driver for five years. Highway kilometres, oil changed every 10,000 km. Includes a set of winter tires.",
    photos: ["1502877338535-766e1452684a"], daysAgo: 11,
  },
  {
    seller: "liam", make: "BMW", model: "M2", year: 2020, trim: "Competition",
    price: 64900, mileage: 28000, bodyStyle: "COUPE", transmission: "MANUAL", fuelType: "GASOLINE", drivetrain: "RWD",
    engine: "3.0L twin-turbo inline-6", horsepower: 405, exteriorColour: "Long Beach Blue", interiorColour: "Black", owners: 1,
    features: ["6-speed manual", "M Sport brakes", "Harman Kardon audio", "Heated seats"],
    description: "Six-speed manual M2 Competition, increasingly hard to find. Never winter driven. No modifications.",
    photos: ["1603386329225-868f9b1ee6c9"], daysAgo: 9,
  },
  {
    seller: "northline", make: "BMW", model: "750i", year: 2021, trim: "xDrive",
    price: 68500, mileage: 42000, bodyStyle: "SEDAN", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "4.4L twin-turbo V8", horsepower: 523, exteriorColour: "Bernina Grey", interiorColour: "Cognac Nappa leather", owners: 1, condition: "CERTIFIED",
    features: ["Executive Lounge seating", "Massage seats", "Panoramic sky lounge roof", "Gesture control"],
    description: "Flagship comfort at a fraction of the original sticker. BMW Certified with remaining factory warranty.",
    photos: ["1601362840469-51e4d8d58785"], daysAgo: 15,
  },

  // Mercedes-Benz
  {
    seller: "northline", make: "Mercedes-Benz", model: "G 63", year: 2016, trim: "AMG",
    price: 109900, mileage: 88000, bodyStyle: "SUV", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "FOUR_WD",
    engine: "5.5L twin-turbo V8", horsepower: 563, exteriorColour: "Iridium Silver", interiorColour: "Black designo leather", owners: 2,
    features: ["Three locking differentials", "Harman Kardon audio", "Heated & ventilated seats", "Sunroof"],
    description: "Iconic G-Wagen with the AMG V8. Undercoated yearly. Recent service including transfer case fluid.",
    photos: ["1520031441872-265e4ff70366"], daysAgo: 7,
  },
  {
    seller: "marcus", make: "Mercedes-Benz", model: "C 63", year: 2017, trim: "AMG S Coupe",
    price: 54900, mileage: 61000, bodyStyle: "COUPE", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "RWD",
    engine: "4.0L twin-turbo V8", horsepower: 503, exteriorColour: "Selenite Grey Magno", interiorColour: "Black / yellow stitching", owners: 2,
    features: ["AMG Performance exhaust", "Burmester audio", "Panoramic roof", "Head-up display"],
    description: "Matte grey C 63 S Coupe with the yellow accent stripe shown. Paint protection film on the full front end.",
    photos: ["1514316454349-750a7fd3da3a"], daysAgo: 13,
  },
  {
    seller: "steeltown", make: "Mercedes-Benz", model: "CLA 45", year: 2018, trim: "AMG 4MATIC",
    price: 33500, mileage: 72000, bodyStyle: "SEDAN", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "2.0L turbo inline-4", horsepower: 375, exteriorColour: "Mountain Grey", interiorColour: "Black", owners: 2,
    features: ["AMG Performance seats", "Harman Kardon audio", "Panoramic roof", "Rear-view camera"],
    description: "Compact AMG with a big turbo four. Safety certified and ready to go. Financing available OAC.",
    photos: ["1570733577524-3a047079e80d"], daysAgo: 20,
  },
  {
    seller: "danielle", make: "Mercedes-Benz", model: "GLE 43", year: 2018, trim: "AMG Coupe",
    price: 52900, mileage: 79000, bodyStyle: "SUV", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "3.0L twin-turbo V6", horsepower: 385, exteriorColour: "Polar White", interiorColour: "Black", owners: 1,
    features: ["Air suspension", "Harman Kardon audio", "360° camera", "Heated seats", "Power tailgate"],
    description: "Family hauler that still feels quick. Always parked underground. Two sets of tires on rims.",
    photos: ["1590362891991-f776e747a588"], daysAgo: 5,
  },
  {
    seller: "lakeshore", make: "Mercedes-Benz", model: "AMG GT", year: 2018, trim: "Coupe",
    price: 99800, mileage: 25000, bodyStyle: "COUPE", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "RWD",
    engine: "4.0L twin-turbo V8", horsepower: 469, exteriorColour: "Solarbeam Yellow", interiorColour: "Black Nappa leather", owners: 1,
    features: ["AMG Dynamic Plus", "Burmester audio", "Carbon trim", "Keyless-Go"],
    description: "Low-kilometre AMG GT in a rare factory colour. Clean history, all books and keys.",
    photos: ["1605559424843-9e4c228bf1c2"], daysAgo: 3,
  },
  {
    seller: "northline", make: "Mercedes-Benz", model: "AMG GT R", year: 2020, trim: "Coupe",
    price: 179900, mileage: 11000, bodyStyle: "COUPE", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "RWD",
    engine: "4.0L twin-turbo V8", horsepower: 577, exteriorColour: "Selenite Grey Magno", interiorColour: "Black / yellow stitching", owners: 1,
    features: ["Rear-axle steering", "Adjustable coilovers", "Carbon ceramic brakes", "AMG Track Pace"],
    description: "Track-bred GT R with carbon ceramics. Collector owned, 11,000 km. Delivered with full PPF.",
    photos: ["1618843479313-40f8afb4b4d8"], daysAgo: 1,
  },
  {
    seller: "peel", make: "Mercedes-Benz", model: "AMG GT", year: 2017, trim: "S Coupe",
    price: 89900, mileage: 34000, bodyStyle: "COUPE", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "RWD",
    engine: "4.0L twin-turbo V8", horsepower: 515, exteriorColour: "Iridium Silver", interiorColour: "Red Pepper leather",
    features: ["Panoramic glass roof", "Burmester audio", "AMG Ride Control", "Heated seats"],
    description: "GT S with the red interior. Fresh service and brakes. History report available on request.",
    photos: ["1616788494707-ec28f08d05a1"], daysAgo: 18,
  },

  // Audi
  {
    seller: "lakeshore", make: "Audi", model: "R8", year: 2020, trim: "V10 performance quattro",
    price: 189500, mileage: 14000, bodyStyle: "COUPE", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "5.2L naturally aspirated V10", horsepower: 602, exteriorColour: "Tango Red", interiorColour: "Black", owners: 1,
    features: ["Carbon exterior package", "Bang & Olufsen audio", "Virtual cockpit", "Laser lights"],
    description: "The last of the naturally aspirated V10s. Audi Canada vehicle with balance of warranty.",
    photos: ["1502161254066-6c74afbf07aa"], daysAgo: 8,
  },
  {
    seller: "peel", make: "Audi", model: "R8", year: 2017, trim: "V10 plus",
    price: 139900, mileage: 31000, bodyStyle: "COUPE", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "5.2L naturally aspirated V10", horsepower: 610, exteriorColour: "Daytona Grey", interiorColour: "Black",
    features: ["Carbon ceramic brakes", "Bang & Olufsen audio", "Carbon side blades"],
    description: "V10 plus with bronze wheels and a sport exhaust. Accident-free.",
    photos: ["1603584173870-7f23fdae1b7a"], daysAgo: 25,
  },
  {
    seller: "marcus", make: "Audi", model: "S5", year: 2016, trim: "Coupe Technik",
    price: 26900, mileage: 98000, bodyStyle: "COUPE", transmission: "MANUAL", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "3.0L supercharged V6", horsepower: 333, exteriorColour: "Solar Orange", interiorColour: "Black", owners: 2,
    features: ["6-speed manual", "Bang & Olufsen audio", "Navigation", "Heated seats"],
    description: "Supercharged V6 with a manual. Water pump and thermostat done at 90,000 km.",
    photos: ["1504215680853-026ed2a45def"], daysAgo: 30,
  },
  {
    seller: "danielle", make: "Audi", model: "Q5", year: 2019, trim: "45 TFSI Progressiv",
    price: 31900, mileage: 74000, bodyStyle: "SUV", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "2.0L turbo inline-4", horsepower: 248, exteriorColour: "Glacier White", interiorColour: "Black leather", owners: 1,
    features: ["Panoramic sunroof", "Heated seats", "Power tailgate", "Apple CarPlay", "Blind-spot monitoring"],
    description: "Reliable family SUV, always dealer serviced. New brakes and battery this year.",
    photos: ["1517524008697-84bbe3c3fd98"], daysAgo: 10,
  },
  {
    seller: "lakeshore", make: "Audi", model: "Q8", year: 2021, trim: "55 TFSI Technik",
    price: 69900, mileage: 41000, bodyStyle: "SUV", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "3.0L turbo V6 mild hybrid", horsepower: 335, exteriorColour: "Glacier White", interiorColour: "Black Valcona leather", owners: 1, condition: "CERTIFIED",
    features: ["Air suspension", "Bang & Olufsen audio", "Head-up display", "Matrix LED headlights", "Massage seats"],
    description: "Audi Certified Q8 with the Black Optic package. Includes remaining factory warranty plus CPO coverage.",
    photos: ["1599912027806-cfec9f5944b6"], daysAgo: 6,
  },
  {
    seller: "northline", make: "Audi", model: "RS 7", year: 2021, trim: "Sportback",
    price: 119900, mileage: 26000, bodyStyle: "HATCHBACK", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "4.0L twin-turbo V8 mild hybrid", horsepower: 591, exteriorColour: "Nardo Grey", interiorColour: "Black Valcona", owners: 1,
    features: ["Dynamic ride control", "Bang & Olufsen 3D audio", "Laser lights", "Rear-wheel steering"],
    description: "Nardo Grey RS 7 with the Black Optic package. One owner, clean history.",
    photos: ["1606152421802-db97b9c7a11b"], daysAgo: 12,
  },
  {
    seller: "lakeshore", make: "Audi", model: "RS 7", year: 2022, trim: "Sportback",
    price: 134500, mileage: 14000, bodyStyle: "HATCHBACK", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "4.0L twin-turbo V8 mild hybrid", horsepower: 591, exteriorColour: "Glacier White", interiorColour: "Black / red stitching",
    features: ["Carbon ceramic brakes", "Bang & Olufsen 3D audio", "Head-up display", "Adaptive cruise"],
    description: "Glacier White RS 7 with carbon ceramics. Balance of prepaid maintenance.",
    photos: ["1616422285623-13ff0162193c"], daysAgo: 3,
  },

  // Porsche
  {
    seller: "marcus", make: "Porsche", model: "Panamera", year: 2018, trim: "4S",
    price: 69900, mileage: 72000, bodyStyle: "HATCHBACK", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "2.9L twin-turbo V6", horsepower: 440, exteriorColour: "Jet Black Metallic", interiorColour: "Black", owners: 2,
    features: ["Sport Chrono", "Bose audio", "Adaptive air suspension", "Panoramic roof", "Heated rear seats"],
    description: "Four-door Porsche that does everything. Porsche-serviced, warranty extension available.",
    photos: ["1503376780353-7e6692767b70"], daysAgo: 16,
  },
  {
    seller: "lakeshore", make: "Porsche", model: "911", year: 2019, trim: "GT3 RS",
    price: 249000, mileage: 9800, bodyStyle: "COUPE", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "RWD",
    engine: "4.0L naturally aspirated flat-6", horsepower: 520, exteriorColour: "Black", interiorColour: "Black / Alcantara", owners: 1,
    features: ["Weissach package", "Front axle lift", "Carbon bucket seats", "Clubsport package"],
    description: "Weissach-spec GT3 RS with front axle lift. Never tracked. Collector-grade example.",
    photos: ["1580274455191-1c62238fa333"], daysAgo: 2,
  },
  {
    seller: "northline", make: "Porsche", model: "911", year: 2018, trim: "GT3",
    price: 189900, mileage: 15000, bodyStyle: "COUPE", transmission: "MANUAL", fuelType: "GASOLINE", drivetrain: "RWD",
    engine: "4.0L naturally aspirated flat-6", horsepower: 500, exteriorColour: "White", interiorColour: "Black", owners: 1,
    features: ["6-speed manual", "Front axle lift", "Sport Chrono", "LED headlights with PDLS+"],
    description: "Manual 991.2 GT3 in white. Paint protection film and clean history.",
    photos: ["1614162692292-7ac56d7f7f1e"], daysAgo: 21,
  },
  {
    seller: "liam", make: "Porsche", model: "718 Spyder", year: 2021,
    price: 134900, mileage: 8500, bodyStyle: "CONVERTIBLE", transmission: "MANUAL", fuelType: "GASOLINE", drivetrain: "RWD",
    engine: "4.0L naturally aspirated flat-6", horsepower: 414, exteriorColour: "Racing Yellow", interiorColour: "Black / Alcantara", owners: 1,
    features: ["6-speed manual", "Full bucket seats", "Sport Chrono", "Bose audio"],
    description: "Racing Yellow Spyder, summer weekends only. Selling to make room for a family car.",
    photos: ["1632245889029-e406faaa34cd"], daysAgo: 4,
  },

  // Tesla
  {
    seller: "priya", make: "Tesla", model: "Model S", year: 2016, trim: "90D",
    price: 34900, mileage: 112000, bodyStyle: "HATCHBACK", transmission: "AUTOMATIC", fuelType: "ELECTRIC", drivetrain: "AWD",
    exteriorColour: "Solid Black", interiorColour: "Black", owners: 2,
    features: ["Autopilot", "Glass roof", "Premium audio", "Heated seats"],
    description: "Battery health checked at Tesla service this year. Charges on a standard pay-per-use Supercharger plan.",
    photos: ["1536700503339-1e4b06520771"], daysAgo: 19,
  },
  {
    seller: "danielle", make: "Tesla", model: "Model S", year: 2019, trim: "Long Range",
    price: 49900, mileage: 64000, bodyStyle: "HATCHBACK", transmission: "AUTOMATIC", fuelType: "ELECTRIC", drivetrain: "AWD",
    exteriorColour: "Midnight Silver", interiorColour: "Black", owners: 1,
    features: ["Enhanced Autopilot", "Air suspension", "Heated seats all around", "Premium connectivity"],
    description: "Long Range Model S with air suspension. Garage-charged on a home wall connector, which can be included.",
    photos: ["1620891549027-942fdc95d3f5"], daysAgo: 14,
  },
  {
    seller: "peel", make: "Tesla", model: "Model 3", year: 2021, trim: "Long Range AWD",
    price: 39900, mileage: 52000, bodyStyle: "SEDAN", transmission: "AUTOMATIC", fuelType: "ELECTRIC", drivetrain: "AWD",
    exteriorColour: "Pearl White", interiorColour: "Black", owners: 1,
    features: ["Autopilot", "Heated seats", "Glass roof", "Premium audio"],
    description: "Long Range dual motor. Clean title, no accidents. All-weather mats and winter wheels included.",
    photos: ["1560958089-b8a1929cea89"], daysAgo: 5,
  },
  {
    seller: "marcus", make: "Tesla", model: "Model 3", year: 2022, trim: "RWD",
    price: 35500, mileage: 34000, bodyStyle: "SEDAN", transmission: "AUTOMATIC", fuelType: "ELECTRIC", drivetrain: "RWD",
    exteriorColour: "Pearl White", interiorColour: "Black", owners: 1,
    features: ["Autopilot", "Heated seats", "Glass roof", "Heat pump"],
    description: "Efficient RWD Model 3 with the heat pump. Perfect commuter, still under battery warranty.",
    photos: ["1606016159991-dfe4f2746ad5"], daysAgo: 8,
  },

  // Toyota
  {
    seller: "steeltown", make: "Toyota", model: "Tacoma", year: 2019, trim: "TRD Off-Road",
    price: 44900, mileage: 76000, bodyStyle: "TRUCK", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "FOUR_WD",
    engine: "3.5L V6", horsepower: 278, exteriorColour: "Quicksand", interiorColour: "Black", owners: 1,
    features: ["Locking rear differential", "Crawl Control", "Tow package", "Aftermarket wheels and all-terrain tires"],
    description: "Lifted Tacoma TRD Off-Road on aftermarket wheels. Rust-proofed every fall.",
    photos: ["1559416523-140ddc3d238c"], daysAgo: 3,
  },
  {
    seller: "priya", make: "Toyota", model: "RAV4", year: 2021, trim: "XLE AWD",
    price: 33900, mileage: 48000, bodyStyle: "SUV", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "2.5L inline-4", horsepower: 203, exteriorColour: "Silver Sky", interiorColour: "Black", owners: 1,
    features: ["Sunroof", "Heated seats", "Apple CarPlay & Android Auto", "Toyota Safety Sense 2.0", "Power liftgate"],
    description: "Well-kept RAV4 XLE. Non-smoker, no pets, Toyota-serviced.",
    photos: ["1617469767053-d3b523a0b982"], daysAgo: 7,
  },
  {
    seller: "peel", make: "Toyota", model: "Corolla", year: 2020, trim: "SE",
    price: 21900, mileage: 58000, bodyStyle: "SEDAN", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "FWD",
    engine: "2.0L inline-4", horsepower: 169, exteriorColour: "Super White", interiorColour: "Black",
    features: ["Apple CarPlay", "Heated seats", "Adaptive cruise", "Lane tracing assist"],
    description: "Great first car or commuter. Certified and detailed.",
    photos: ["1623869675781-80aa31012a5a"], daysAgo: 12,
  },
  {
    seller: "danielle", make: "Toyota", model: "Corolla", year: 2022, trim: "LE",
    price: 24500, mileage: 31000, bodyStyle: "SEDAN", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "FWD",
    engine: "1.8L inline-4", horsepower: 139, exteriorColour: "Super White", interiorColour: "Black", owners: 1,
    features: ["Heated seats", "Apple CarPlay & Android Auto", "Toyota Safety Sense 2.0", "Blind-spot monitor"],
    description: "Low kilometres and still under Toyota powertrain warranty.",
    photos: ["1638618164682-12b986ec2a75"], daysAgo: 2,
  },
  {
    seller: "liam", make: "Toyota", model: "Camry", year: 2021, trim: "XSE",
    price: 32900, mileage: 45000, bodyStyle: "SEDAN", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "FWD",
    engine: "2.5L inline-4", horsepower: 206, exteriorColour: "Celestial Silver", interiorColour: "Black leather", owners: 1,
    features: ["Panoramic roof", "Head-up display", "JBL audio", "Wireless charging"],
    description: "Sporty Camry XSE, highway kilometres. Includes all-season and winter tires.",
    photos: ["1621007947382-bb3c3994e3fb"], daysAgo: 17,
  },
  {
    seller: "steeltown", make: "Toyota", model: "4Runner", year: 2020, trim: "TRD Off-Road",
    price: 47900, mileage: 69000, bodyStyle: "SUV", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "FOUR_WD",
    engine: "4.0L V6", horsepower: 270, exteriorColour: "Magnetic Grey", interiorColour: "Black", owners: 2,
    features: ["Locking rear differential", "KDSS", "Multi-terrain select", "Tow hitch"],
    description: "Body-on-frame toughness, Toyota reliability. Fresh fluids and new all-terrain tires.",
    photos: ["1621993202323-f438eec934ff"], daysAgo: 9,
  },

  // Honda
  {
    seller: "danielle", make: "Honda", model: "CR-V", year: 2019, trim: "EX-L AWD",
    price: 28900, mileage: 81000, bodyStyle: "SUV", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "1.5L turbo inline-4", horsepower: 190, exteriorColour: "Platinum White Pearl", interiorColour: "Black leather", owners: 1,
    features: ["Leather seats", "Sunroof", "Honda Sensing", "Power tailgate", "Apple CarPlay"],
    description: "Dependable CR-V with full Honda service records. Remote starter installed.",
    photos: ["1519641471654-76ce0107ad1b"], daysAgo: 6,
  },
  {
    seller: "marcus", make: "Honda", model: "Civic", year: 2019, trim: "Si Coupe",
    price: 24900, mileage: 63000, bodyStyle: "COUPE", transmission: "MANUAL", fuelType: "GASOLINE", drivetrain: "FWD",
    engine: "1.5L turbo inline-4", horsepower: 205, exteriorColour: "Crystal Black Pearl", interiorColour: "Black / red", owners: 1,
    features: ["6-speed manual", "Limited-slip differential", "Adaptive dampers", "Apple CarPlay"],
    description: "Stock Civic Si Coupe, no modifications. Clutch is strong. Winter tires included.",
    photos: ["1594070319944-7c0cbebb6f58"], daysAgo: 10,
  },
  {
    seller: "peel", make: "Honda", model: "Civic", year: 2020, trim: "Sport Sedan",
    price: 22900, mileage: 54000, bodyStyle: "SEDAN", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "FWD",
    engine: "2.0L inline-4", horsepower: 158, exteriorColour: "Crystal Black Pearl", interiorColour: "Black",
    features: ["Sunroof", "Honda Sensing", "Heated seats", "Apple CarPlay & Android Auto"],
    description: "Clean Civic Sport sedan. Safety certified with a 90-day powertrain warranty.",
    photos: ["1605816988069-b11383b50717"], daysAgo: 22,
  },
  {
    seller: "liam", make: "Honda", model: "Civic Type R", year: 2019,
    price: 44900, mileage: 39000, bodyStyle: "HATCHBACK", transmission: "MANUAL", fuelType: "GASOLINE", drivetrain: "FWD",
    engine: "2.0L turbo inline-4", horsepower: 306, exteriorColour: "Rallye Red", interiorColour: "Black / red suede", owners: 1,
    features: ["6-speed manual", "Brembo brakes", "Adaptive dampers", "Helical LSD"],
    description: "Rallye Red Type R, unmodified with every original part. Garage-kept.",
    photos: ["1570303278489-041bd897a873"], daysAgo: 1,
  },

  // Lexus
  {
    seller: "lakeshore", make: "Lexus", model: "LC 500", year: 2018,
    price: 82900, mileage: 31000, bodyStyle: "COUPE", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "RWD",
    engine: "5.0L naturally aspirated V8", horsepower: 471, exteriorColour: "Graphite Black", interiorColour: "Ochre", owners: 1,
    features: ["Mark Levinson audio", "Carbon roof", "Head-up display", "Torsen LSD"],
    description: "One of the best-sounding V8s on sale. Lexus serviced since new.",
    photos: ["1577496549804-8b05f1f67338"], daysAgo: 11,
  },
  {
    seller: "northline", make: "Lexus", model: "LX 570", year: 2019,
    price: 79900, mileage: 85000, bodyStyle: "SUV", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "FOUR_WD",
    engine: "5.7L V8", horsepower: 383, exteriorColour: "Eminent White Pearl", interiorColour: "Black semi-aniline", owners: 2,
    features: ["Three-row seating", "Mark Levinson audio", "Height-adjustable suspension", "Rear entertainment"],
    description: "Eight-seat luxury SUV with Land Cruiser underpinnings. Two sets of tires.",
    photos: ["1570523986973-787a8f2c004b", "1592857723369-03e2e792626d"], daysAgo: 13,
  },
  {
    seller: "priya", make: "Lexus", model: "GX 460", year: 2021, trim: "Premium",
    price: 62500, mileage: 52000, bodyStyle: "SUV", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "FOUR_WD",
    engine: "4.6L V8", horsepower: 301, exteriorColour: "Black Onyx", interiorColour: "Black", owners: 1,
    features: ["Seven seats", "Heated & ventilated seats", "Crawl control", "Sunroof"],
    description: "Body-on-frame Lexus that will outlast us all. Undercoated every year.",
    photos: ["1700884520248-92092bd21e63", "1693532331766-bfcec4163ce4"], daysAgo: 4,
  },
  {
    seller: "steeltown", make: "Lexus", model: "LX 570", year: 2017,
    price: 64900, mileage: 121000, bodyStyle: "SUV", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "FOUR_WD",
    engine: "5.7L V8", horsepower: 383, exteriorColour: "Black", interiorColour: "Parchment",
    features: ["Three-row seating", "Mark Levinson audio", "Cool box", "Sunroof"],
    description: "High kilometres but meticulously maintained. Records on file.",
    status: "PENDING", photos: ["1603050087224-98d2e1e8930a"], daysAgo: 27,
  },

  // Hyundai
  {
    seller: "danielle", make: "Hyundai", model: "IONIQ 5", year: 2023, trim: "Preferred AWD Long Range",
    price: 46900, mileage: 18000, bodyStyle: "SUV", transmission: "AUTOMATIC", fuelType: "ELECTRIC", drivetrain: "AWD",
    exteriorColour: "Atlas White", interiorColour: "Grey", owners: 1,
    features: ["800V ultra-fast charging", "Heat pump", "Highway Driving Assist", "Vehicle-to-load"],
    description: "Long Range AWD IONIQ 5 with the heat pump. Charges 10–80% in about 18 minutes on a 350 kW charger.",
    photos: ["1647418552401-f3958302b72a", "1647934441921-4ed1e182e4b3"], daysAgo: 3,
  },
  {
    seller: "peel", make: "Hyundai", model: "IONIQ 5 N", year: 2025,
    price: 72900, mileage: 4000, bodyStyle: "HATCHBACK", transmission: "AUTOMATIC", fuelType: "ELECTRIC", drivetrain: "AWD",
    horsepower: 641, exteriorColour: "Performance Blue Matte", interiorColour: "Black", owners: 1,
    features: ["N Grin Boost", "N e-Shift", "Track-ready brakes", "N Drift Optimizer"],
    description: "Nearly new IONIQ 5 N, 4,000 km. Remaining Hyundai warranty transfers.",
    photos: ["1701921642695-729c4262b060"], daysAgo: 1,
  },
  {
    seller: "steeltown", make: "Hyundai", model: "IONIQ 5", year: 2022, trim: "Preferred RWD",
    price: 37900, mileage: 46000, bodyStyle: "SUV", transmission: "AUTOMATIC", fuelType: "ELECTRIC", drivetrain: "RWD",
    exteriorColour: "Atlas White", interiorColour: "Grey",
    features: ["Heat pump", "Heated seats", "Apple CarPlay", "Blind-spot monitoring"],
    description: "Affordable IONIQ 5 with plenty of range for the daily commute.",
    photos: ["1675243853852-937413fac915"], daysAgo: 15,
  },
  {
    seller: "priya", make: "Hyundai", model: "Accent", year: 2020, trim: "Preferred",
    price: 16900, mileage: 64000, bodyStyle: "SEDAN", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "FWD",
    engine: "1.6L inline-4", horsepower: 120, exteriorColour: "Absolute Black", interiorColour: "Black", owners: 1,
    features: ["Heated seats", "Apple CarPlay", "Rear-view camera"],
    description: "Thrifty and reliable. Perfect for a student or new driver.",
    photos: ["1619767886558-efdc259cde1a"], daysAgo: 18,
  },

  // Ford
  {
    seller: "steeltown", make: "Ford", model: "Mustang", year: 2018, trim: "GT Premium",
    price: 34900, mileage: 54000, bodyStyle: "COUPE", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "RWD",
    engine: "5.0L V8", horsepower: 460, exteriorColour: "Shadow Black", interiorColour: "Ebony leather", owners: 1,
    features: ["10-speed automatic", "Active exhaust", "Digital cluster", "B&O audio"],
    description: "Coyote V8 Mustang GT. Stored every winter.",
    photos: ["1547744152-14d985cb937f"], daysAgo: 5,
  },
  {
    seller: "liam", make: "Ford", model: "Mustang", year: 2020, trim: "Shelby GT350",
    price: 76900, mileage: 19000, bodyStyle: "COUPE", transmission: "MANUAL", fuelType: "GASOLINE", drivetrain: "RWD",
    engine: "5.2L flat-plane crank V8", horsepower: 526, exteriorColour: "Magnetic Grey", interiorColour: "Ebony", owners: 1,
    features: ["Recaro seats", "MagneRide", "Brembo brakes", "Track Apps"],
    description: "Final-year GT350 with the Voodoo V8. Clean, original and unmodified.",
    photos: ["1625231334168-35067f8853ed"], daysAgo: 7,
  },
  {
    seller: "marcus", make: "Ford", model: "Mustang", year: 1971, trim: "Mach 1",
    price: 64900, mileage: 112000, bodyStyle: "COUPE", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "RWD",
    exteriorColour: "Bright Red", interiorColour: "Black",
    features: ["Restored body", "Ram-air hood", "Front disc brakes"],
    description: "Classic Mach 1 with a respectful restoration. Mileage shown is not guaranteed original.",
    history: "Restored in 2015. Receipts available for inspection.",
    photos: ["1584345604476-8ec5e12e42dd"], daysAgo: 24,
  },
  {
    seller: "peel", make: "Ford", model: "Mustang", year: 2019, trim: "GT",
    price: 36900, mileage: 47000, bodyStyle: "COUPE", transmission: "MANUAL", fuelType: "GASOLINE", drivetrain: "RWD",
    engine: "5.0L V8", horsepower: 460, exteriorColour: "Need For Green", interiorColour: "Ebony", owners: 2,
    features: ["6-speed manual", "Performance package", "Recaro seats", "Active exhaust"],
    description: "Rare Need For Green GT with the Performance Pack and a six-speed.",
    photos: ["1567818735868-e71b99932e29"], daysAgo: 9,
  },
  {
    seller: "steeltown", make: "Ford", model: "Expedition", year: 2018, trim: "Limited 4x4",
    price: 45900, mileage: 92000, bodyStyle: "SUV", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "FOUR_WD",
    engine: "3.5L EcoBoost V6", horsepower: 375, exteriorColour: "Oxford White", interiorColour: "Ebony leather", owners: 1,
    features: ["Eight seats", "Max trailer tow package", "Panoramic roof", "B&O audio"],
    description: "Big family hauler with the max tow package. Ford-serviced.",
    photos: ["1533473359331-0135ef1b58bf"], daysAgo: 14,
  },
  {
    seller: "northline", make: "Ford", model: "F-150", year: 2019, trim: "Lariat SuperCrew",
    price: 42900, mileage: 88000, bodyStyle: "TRUCK", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "FOUR_WD",
    engine: "3.5L EcoBoost V6", horsepower: 375, exteriorColour: "Velocity Blue", interiorColour: "Black leather", owners: 1,
    features: ["Max trailer tow", "Heated & cooled seats", "B&O audio", "360° camera", "Spray-in bedliner"],
    description: "Well-equipped Lariat with the 3.5 EcoBoost. Fresh safety and new brakes.",
    photos: ["1551830820-330a71b99659"], daysAgo: 6,
  },
  {
    seller: "liam", make: "Ford", model: "F-150", year: 2019, trim: "Raptor",
    price: 69900, mileage: 64000, bodyStyle: "TRUCK", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "FOUR_WD",
    engine: "3.5L high-output EcoBoost V6", horsepower: 450, exteriorColour: "Lead Foot Grey", interiorColour: "Black / blue accents", owners: 1,
    features: ["FOX Live Valve shocks", "Torsen front differential", "Trail control", "B&O audio"],
    description: "Raptor with Live Valve shocks and the 802A package. Never off-roaded hard.",
    photos: ["1605893477799-b99e3b8b93fe", "1605893523428-4ad26c5edc4c"], daysAgo: 2,
  },
  {
    seller: "northline", make: "Ford", model: "Ranger", year: 2024, trim: "Raptor",
    price: 74900, mileage: 7000, bodyStyle: "TRUCK", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "FOUR_WD",
    engine: "3.0L twin-turbo V6", horsepower: 405, exteriorColour: "Code Orange", interiorColour: "Black", owners: 1,
    features: ["FOX Live Valve shocks", "Front & rear lockers", "Bull bar", "Roof rack"],
    description: "Ranger Raptor with an aftermarket bull bar and roof rack. Balance of Ford warranty.",
    photos: ["1770096171604-2e6f19fc33c0"], daysAgo: 1,
  },

  // Chevrolet
  {
    seller: "peel", make: "Chevrolet", model: "Camaro", year: 2017, trim: "2SS",
    price: 34500, mileage: 58000, bodyStyle: "COUPE", transmission: "MANUAL", fuelType: "GASOLINE", drivetrain: "RWD",
    engine: "6.2L V8", horsepower: 455, exteriorColour: "Hyper Blue", interiorColour: "Jet Black", owners: 2,
    features: ["6-speed manual", "Magnetic Ride Control", "Head-up display", "Brembo brakes"],
    description: "LT1-powered 2SS in Hyper Blue. Dual-mode exhaust.",
    photos: ["1552519507-da3b142c6e3d"], daysAgo: 16,
  },
  {
    seller: "lakeshore", make: "Chevrolet", model: "Corvette", year: 2021, trim: "Stingray 2LT",
    price: 89900, mileage: 16000, bodyStyle: "COUPE", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "RWD",
    engine: "6.2L V8", horsepower: 495, exteriorColour: "Black", interiorColour: "Jet Black", owners: 1,
    features: ["Z51 performance package", "Front lift", "Head-up display", "Bose audio"],
    description: "Mid-engine C8 with Z51 and front lift. Removable roof panel.",
    photos: ["1710823367826-02e38b3c9f67", "1733724965266-388735e15320"], daysAgo: 5,
  },
  {
    seller: "marcus", make: "Chevrolet", model: "Corvette", year: 2023, trim: "Stingray 3LT",
    price: 104900, mileage: 9000, bodyStyle: "COUPE", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "RWD",
    engine: "6.2L V8", horsepower: 495, exteriorColour: "Arctic White", interiorColour: "Adrenaline Red", owners: 1,
    features: ["Z51 performance package", "Magnetic Ride Control", "Performance data recorder", "Carbon fibre trim"],
    description: "Arctic White 3LT with the red interior. Ceramic coated, stored indoors.",
    photos: ["1775351839737-a2d2de24f887"], daysAgo: 8,
  },
  {
    seller: "danielle", make: "Chevrolet", model: "Blazer", year: 2021, trim: "LT AWD",
    price: 31900, mileage: 57000, bodyStyle: "SUV", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "2.0L turbo inline-4", horsepower: 230, exteriorColour: "Satin Steel Metallic", interiorColour: "Jet Black", owners: 1,
    features: ["Heated seats", "Remote start", "Apple CarPlay", "Power liftgate"],
    description: "Comfortable mid-size SUV. Single owner, clean history.",
    photos: ["1646844371347-e7eab6275747"], daysAgo: 20,
  },
  {
    seller: "steeltown", make: "Chevrolet", model: "Silverado 1500", year: 2015, trim: "LTZ Crew Cab",
    price: 24900, mileage: 168000, bodyStyle: "TRUCK", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "FOUR_WD",
    engine: "5.3L V8", horsepower: 355, exteriorColour: "Deep Ruby Metallic", interiorColour: "Jet Black", owners: 3,
    features: ["Leather", "Heated seats", "Trailer brake controller", "Bedliner"],
    description: "Honest work truck with a strong V8. Sold as-is, priced to move.",
    status: "SOLD", photos: ["1765679244145-9c36a8846daa", "1765679244138-7c0b08069816"], daysAgo: 35,
  },
  {
    seller: "northline", make: "Chevrolet", model: "Silverado 1500", year: 2018, trim: "High Country",
    price: 41900, mileage: 98000, bodyStyle: "TRUCK", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "FOUR_WD",
    engine: "6.2L V8", horsepower: 420, exteriorColour: "Graphite Metallic", interiorColour: "Saddle Brown", owners: 2,
    features: ["Heated & cooled seats", "Max trailering package", "Sunroof", "Bose audio"],
    description: "High Country with the 6.2. Lifted on aftermarket wheels.",
    photos: ["1645830102962-f2716eed466d"], daysAgo: 10,
  },

  // Subaru
  {
    seller: "marcus", make: "Subaru", model: "WRX STI", year: 2017, trim: "Sport-tech",
    price: 33900, mileage: 82000, bodyStyle: "SEDAN", transmission: "MANUAL", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "2.5L turbo flat-4", horsepower: 305, exteriorColour: "WR Blue Pearl", interiorColour: "Black / Alcantara", owners: 2,
    features: ["6-speed manual", "Brembo brakes", "Recaro seats", "DCCD"],
    description: "Stock STI except for an aftermarket cat-back exhaust (original included).",
    photos: ["1636074641063-1c2152f1b31e"], daysAgo: 4,
  },
  {
    seller: "priya", make: "Subaru", model: "WRX", year: 2019, trim: "Sport",
    price: 26900, mileage: 61000, bodyStyle: "SEDAN", transmission: "MANUAL", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "2.0L turbo flat-4", horsepower: 268, exteriorColour: "WR Blue Pearl", interiorColour: "Black", owners: 1,
    features: ["6-speed manual", "Sunroof", "Heated seats", "EyeSight"],
    description: "Fun all-season sedan. Rust-proofed every year, winter tires included.",
    photos: ["1773540837069-69a7846927f5"], daysAgo: 12,
  },
  {
    seller: "liam", make: "Subaru", model: "WRX STI", year: 2020, trim: "Sport-tech",
    price: 41900, mileage: 38000, bodyStyle: "SEDAN", transmission: "MANUAL", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "2.5L turbo flat-4", horsepower: 310, exteriorColour: "Magnetite Grey", interiorColour: "Black", owners: 1,
    features: ["6-speed manual", "Brembo brakes", "Recaro seats", "Bronze BBS wheels"],
    description: "One of the last EJ25 STIs. Unmodified, dealer serviced.",
    photos: ["1591827285933-08285e588df0"], daysAgo: 6,
  },
  {
    seller: "danielle", make: "Subaru", model: "Outback", year: 2023, trim: "Wilderness",
    price: 41900, mileage: 22000, bodyStyle: "WAGON", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "2.4L turbo flat-4", horsepower: 260, exteriorColour: "Geyser Blue", interiorColour: "Grey StarTex", owners: 1,
    features: ["X-Mode", "All-terrain tires", "Water-repellent upholstery", "Heavy-duty roof rails"],
    description: "Outback Wilderness, the blue one on the right in the photo. Cargo box not included.",
    photos: ["1773859722927-ad53625cce80"], daysAgo: 2,
  },
  {
    seller: "steeltown", make: "Subaru", model: "Outback", year: 2021, trim: "Touring",
    price: 32900, mileage: 49000, bodyStyle: "WAGON", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "2.5L flat-4", horsepower: 182, exteriorColour: "Magnetite Grey", interiorColour: "Black", owners: 1,
    features: ["Sunroof", "Heated seats", "EyeSight", "Power liftgate"],
    description: "Winter-ready Outback with symmetrical AWD and winter tires mounted.",
    photos: ["1609772168547-d216c44c3f85"], daysAgo: 8,
  },
  {
    seller: "peel", make: "Subaru", model: "Outback", year: 2016, trim: "2.5i Touring",
    price: 16900, mileage: 142000, bodyStyle: "WAGON", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "2.5L flat-4", horsepower: 175, exteriorColour: "Twilight Blue", interiorColour: "Black",
    features: ["Heated seats", "Sunroof", "Rear-view camera"],
    description: "Affordable AWD wagon. New CVT fluid and brakes.",
    photos: ["1546023165-1c4a1b59f2b3"], daysAgo: 26,
  },

  // Volkswagen
  {
    seller: "lakeshore", make: "Volkswagen", model: "Golf GTI", year: 2022, trim: "Autobahn",
    price: 36900, mileage: 21000, bodyStyle: "HATCHBACK", transmission: "MANUAL", fuelType: "GASOLINE", drivetrain: "FWD",
    engine: "2.0L turbo inline-4", horsepower: 241, exteriorColour: "Pure White", interiorColour: "Black / Scale Paper plaid", owners: 1,
    features: ["6-speed manual", "Harman Kardon audio", "DCC adaptive dampers", "IQ.DRIVE"],
    description: "Mk8 GTI Autobahn with a manual. Remaining VW warranty.",
    photos: ["1767949374162-5cbb31071b8f"], daysAgo: 3,
  },
  {
    seller: "marcus", make: "Volkswagen", model: "Golf R", year: 2019,
    price: 33900, mileage: 55000, bodyStyle: "HATCHBACK", transmission: "MANUAL", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "2.0L turbo inline-4", horsepower: 288, exteriorColour: "Indium Grey", interiorColour: "Black Nappa", owners: 1,
    features: ["6-speed manual", "4MOTION AWD", "Digital cockpit", "DCC adaptive dampers"],
    description: "Mk7.5 Golf R six-speed. Ceramic coated.",
    photos: ["1760688964516-1012e0ece2a8", "1760688960224-bb2ae6bfa394"], daysAgo: 7,
  },
  {
    seller: "priya", make: "Volkswagen", model: "Golf R", year: 2018,
    price: 30900, mileage: 71000, bodyStyle: "HATCHBACK", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "2.0L turbo inline-4", horsepower: 288, exteriorColour: "Pure White", interiorColour: "Black", owners: 2,
    features: ["DSG", "4MOTION AWD", "Digital cockpit", "Fender audio"],
    description: "DSG Golf R. DSG service done at 60,000 km.",
    photos: ["1572811298797-9eecadf6cb24"], daysAgo: 19,
  },
  {
    seller: "steeltown", make: "Volkswagen", model: "Golf GTI", year: 2017, trim: "Autobahn",
    price: 19900, mileage: 96000, bodyStyle: "HATCHBACK", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "FWD",
    engine: "2.0L turbo inline-4", horsepower: 220, exteriorColour: "Carbon Steel Grey", interiorColour: "Black leather",
    features: ["DSG", "Sunroof", "Fender audio", "Heated seats"],
    description: "Mk7 GTI, certified.",
    status: "SOLD", photos: ["1618767747322-64e376fd4826"], daysAgo: 40,
  },

  // Mazda
  {
    seller: "danielle", make: "Mazda", model: "CX-5", year: 2020, trim: "GT AWD",
    price: 29900, mileage: 52000, bodyStyle: "SUV", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "2.5L inline-4", horsepower: 187, exteriorColour: "Snowflake White Pearl", interiorColour: "Black leather", owners: 1,
    features: ["Bose audio", "Heated steering wheel", "Ventilated seats", "Head-up display"],
    description: "Top-trim CX-5 GT. Mazda serviced, two sets of tires.",
    photos: ["1643142311296-304953706775"], daysAgo: 5,
  },
  {
    seller: "liam", make: "Mazda", model: "Mazda6", year: 2017, trim: "GT",
    price: 18900, mileage: 104000, bodyStyle: "SEDAN", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "FWD",
    engine: "2.5L inline-4", horsepower: 184, exteriorColour: "Soul Red Metallic", interiorColour: "Black leather", owners: 2,
    features: ["Bose audio", "Heated seats", "Sunroof", "Blind-spot monitoring"],
    description: "Elegant Mazda6 GT in Soul Red. Highway kilometres.",
    photos: ["1668415759930-5a9dbe80c488"], daysAgo: 23,
  },
  {
    seller: "priya", make: "Mazda", model: "MX-5 RF", year: 2021, trim: "GT",
    price: 33900, mileage: 18000, bodyStyle: "CONVERTIBLE", transmission: "MANUAL", fuelType: "GASOLINE", drivetrain: "RWD",
    engine: "2.0L inline-4", horsepower: 181, exteriorColour: "Jet Black Mica", interiorColour: "Black leather", owners: 1,
    features: ["6-speed manual", "Power retractable hardtop", "Bose audio", "Heated seats"],
    description: "Retractable fastback MX-5. Summer use only, stored indoors.",
    photos: ["1787947612261-c2d4feab3454"], daysAgo: 9,
  },

  // Others
  {
    seller: "lakeshore", make: "Nissan", model: "GT-R", year: 2017, trim: "Premium",
    price: 99900, mileage: 36000, bodyStyle: "COUPE", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "3.8L twin-turbo V6", horsepower: 565, exteriorColour: "Pearl White", interiorColour: "Black", owners: 1,
    features: ["Bose audio", "Launch control", "Heated seats"],
    description: "Serviced at a GT-R certified Nissan dealer since new.",
    photos: ["1568605117036-5fe5e7bab0b7"], daysAgo: 14,
  },
  {
    seller: "peel", make: "Nissan", model: "Altima", year: 2018, trim: "2.5 SV",
    price: 17500, mileage: 89000, bodyStyle: "SEDAN", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "FWD",
    engine: "2.5L inline-4", horsepower: 179, exteriorColour: "Storm Blue", interiorColour: "Charcoal",
    features: ["Remote start", "Heated seats", "Rear-view camera"],
    description: "Comfortable mid-size sedan. Certified.",
    photos: ["1581540222194-0def2dda95b8"], daysAgo: 21,
  },
  {
    seller: "northline", make: "Dodge", model: "Challenger", year: 2019, trim: "R/T Scat Pack",
    price: 46900, mileage: 33000, bodyStyle: "COUPE", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "RWD",
    engine: "6.4L HEMI V8", horsepower: 485, exteriorColour: "Octane Red", interiorColour: "Black", owners: 1,
    features: ["Brembo brakes", "Launch control", "Harman Kardon audio", "Performance pages"],
    description: "392 Scat Pack with the 8-speed. Summer driven.",
    photos: ["1626668893632-6f3a4466d22f"], daysAgo: 11,
  },
  {
    seller: "danielle", make: "Volvo", model: "XC60", year: 2019, trim: "T6 R-Design",
    price: 36900, mileage: 68000, bodyStyle: "SUV", transmission: "AUTOMATIC", fuelType: "GASOLINE", drivetrain: "AWD",
    engine: "2.0L turbo & supercharged inline-4", horsepower: 316, exteriorColour: "Bursting Blue", interiorColour: "Charcoal leather", owners: 1,
    features: ["Pilot Assist", "Harman Kardon audio", "Panoramic roof", "360° camera"],
    description: "Safe, quick and comfortable. Volvo serviced.",
    photos: ["1629897048514-3dd7414fe72a"], daysAgo: 13,
  },
];
