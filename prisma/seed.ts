import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding public amenities...");

  await prisma.amenityReview.deleteMany();
  await prisma.amenityVerification.deleteMany();
  await prisma.amenity.deleteMany();

  const amenitiesData = [
    {
      name: "Union Square Plaza Public Restroom",
      type: "RESTROOM",
      latitude: 37.7879,
      longitude: -122.4075,
      address: "333 Post St, San Francisco, CA 94108",
      description: "Self-cleaning automatic public toilet pod in the southwest corner of Union Square.",
      isAccessible: true,
      isGenderNeutral: true,
      hasBabyChanging: true,
      feeRequired: false,
      keyOrCodeRequired: false,
      hours: "06:00 - 22:00",
      status: "OPERATIONAL",
      reviews: {
        create: [
          {
            rating: 5,
            cleanlinessRating: 4,
            comment: "Very clean and accessible. Automated door works smoothly.",
          },
          {
            rating: 4,
            cleanlinessRating: 4,
            comment: "Usually no line in the morning. Great spot downtown.",
          },
        ],
      },
      verifications: {
        create: [
          {
            status: "OPERATIONAL",
            notes: "Inspected this morning. Clean and stocked with paper.",
          },
        ],
      },
    },
    {
      name: "Yerba Buena Gardens Water Bottle Refill Station",
      type: "WATER_FOUNTAIN",
      latitude: 37.7861,
      longitude: -122.4024,
      address: "750 Howard St, San Francisco, CA 94103",
      description: "Dual-height drinking fountain with automatic high-flow bottle filling tap and chilled filtered water.",
      isAccessible: true,
      isGenderNeutral: false,
      hasBabyChanging: false,
      feeRequired: false,
      keyOrCodeRequired: false,
      hours: "24/7",
      status: "OPERATIONAL",
      reviews: {
        create: [
          {
            rating: 5,
            cleanlinessRating: 5,
            comment: "Cold, crisp water. High pressure bottle filler fills a 1L bottle in seconds.",
          },
        ],
      },
      verifications: {
        create: [
          {
            status: "OPERATIONAL",
            notes: "Flow rate verified, clean basin.",
          },
        ],
      },
    },
    {
      name: "Salesforce Park Shaded Bamboo Grove Seating",
      type: "SEATING",
      latitude: 37.7897,
      longitude: -122.3972,
      address: "425 Mission St, Rooftop Park, San Francisco, CA 94105",
      description: "Quiet shaded wooden benches surrounded by bamboo and water fountain garden. Very calm and relaxing.",
      isAccessible: true,
      isGenderNeutral: false,
      hasBabyChanging: false,
      feeRequired: false,
      keyOrCodeRequired: false,
      hours: "06:00 - 20:00",
      status: "OPERATIONAL",
      reviews: {
        create: [
          {
            rating: 5,
            cleanlinessRating: 5,
            comment: "Super peaceful rooftop sanctuary. Free public Wi-Fi and plenty of shaded spots.",
          },
        ],
      },
      verifications: {
        create: [
          {
            status: "OPERATIONAL",
            notes: "Open to the public, immaculate condition.",
          },
        ],
      },
    },
    {
      name: "Market & 5th St Public Convenience",
      type: "RESTROOM",
      latitude: 37.7836,
      longitude: -122.4089,
      address: "899 Market St, San Francisco, CA 94103",
      description: "Municipal attended public toilet kiosk near Powell St Station.",
      isAccessible: true,
      isGenderNeutral: true,
      hasBabyChanging: false,
      feeRequired: false,
      keyOrCodeRequired: false,
      hours: "07:00 - 19:00",
      status: "OPERATIONAL",
      reviews: {
        create: [
          {
            rating: 4,
            cleanlinessRating: 3,
            comment: "Attendant present, kept in decent condition for high foot traffic.",
          },
        ],
      },
      verifications: {
        create: [
          {
            status: "OPERATIONAL",
            notes: "Open and working.",
          },
        ],
      },
    },
    {
      name: "Ferry Building Embarcadero Promenade Benches",
      type: "SEATING",
      latitude: 37.7955,
      longitude: -122.3937,
      address: "1 Ferry Building, San Francisco, CA 94111",
      description: "Wide waterfront benches facing the Bay Bridge with unobstructed water views.",
      isAccessible: true,
      isGenderNeutral: false,
      hasBabyChanging: false,
      feeRequired: false,
      keyOrCodeRequired: false,
      hours: "24/7",
      status: "OPERATIONAL",
      reviews: {
        create: [
          {
            rating: 5,
            cleanlinessRating: 5,
            comment: "Best spot in the city to sit and eat lunch with ocean breeze.",
          },
        ],
      },
      verifications: {
        create: [
          {
            status: "OPERATIONAL",
            notes: "Benches clean and well-maintained.",
          },
        ],
      },
    },
  ];

  for (const item of amenitiesData) {
    await prisma.amenity.create({
      data: item,
    });
  }

  console.log(`Successfully seeded ${amenitiesData.length} amenities.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
