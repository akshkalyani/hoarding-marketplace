import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.offerListing.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.adminAction.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('password123', 10);

  // ─── Users ───────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: 'admin@admax.com',
      name: 'Admin User',
      phone: '+91 9000000000',
      passwordHash: hash,
      roles: ['USER', 'ADMIN'],
      isActive: true,
      isVerified: true,
    },
  });
  console.log('  Created admin:', admin.email);

  const owner = await prisma.user.create({
    data: {
      email: 'owner@admax.com',
      name: 'Media Owner',
      phone: '+91 9111111111',
      passwordHash: hash,
      roles: ['USER'],
      isActive: true,
      isVerified: true,
    },
  });
  console.log('  Created owner:', owner.email);

  const agency = await prisma.user.create({
    data: {
      email: 'agency@admax.com',
      name: 'Agency User',
      phone: '+91 9222222222',
      passwordHash: hash,
      roles: ['USER'],
      isActive: true,
      isVerified: true,
    },
  });
  console.log('  Created agency:', agency.email);

  const pendingUser = await prisma.user.create({
    data: {
      email: 'pending@admax.com',
      name: 'Pending User',
      passwordHash: hash,
      roles: ['USER'],
      isActive: true,
      isVerified: false,
    },
  });
  console.log('  Created pending user:', pendingUser.email);

  // ─── Listings ────────────────────────────────────────
  const listing1 = await prisma.listing.create({
    data: {
      ownerId: owner.id,
      title: 'Premium Highway Hoarding - Mumbai',
      description:
        'Large 40x20ft hoarding on Western Express Highway, Mumbai. High visibility with 500K+ daily impressions. Illuminated at night.',
      type: 'HOARDING',
      price: 75000,
      landmarks: ['Western Express Highway', 'Andheri', 'Metro Station'],
      latitude: 19.1197,
      longitude: 72.8464,
      status: 'LIVE',
      isFeatured: true,
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      ownerId: owner.id,
      title: 'Mall Kiosk - Phoenix Marketcity',
      description:
        'Indoor digital kiosk at Phoenix Marketcity, Kurla. Perfect for brand activations and product launches.',
      type: 'KIOSK',
      price: 25000,
      landmarks: ['Phoenix Marketcity', 'Kurla', 'LBS Road'],
      latitude: 19.0863,
      longitude: 72.8892,
      status: 'LIVE',
      isFeatured: false,
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      ownerId: owner.id,
      title: 'Gantry - Bandra Worli Sea Link',
      description:
        'Premium gantry placement at the approach to Bandra Worli Sea Link. Unmatched premium audience.',
      type: 'GANTRY',
      price: 150000,
      landmarks: ['Sea Link', 'Bandra', 'Worli'],
      latitude: 19.0399,
      longitude: 72.8177,
      status: 'LIVE',
      isFeatured: true,
    },
  });

  const listing4 = await prisma.listing.create({
    data: {
      ownerId: owner.id,
      title: 'Bus Shelter Ad - Dadar',
      description: 'Transit media on bus shelter near Dadar station. High footfall area.',
      type: 'TRANSIT',
      price: 15000,
      landmarks: ['Dadar Station', 'Dadar TT'],
      latitude: 19.0178,
      longitude: 72.8478,
      status: 'LIVE',
      isFeatured: false,
    },
  });

  const listing5 = await prisma.listing.create({
    data: {
      ownerId: owner.id,
      title: 'Digital Hoarding - BKC',
      description: 'LED digital hoarding at Bandra Kurla Complex. Ideal for corporate campaigns.',
      type: 'HOARDING',
      price: 120000,
      landmarks: ['BKC', 'Diamond District'],
      latitude: 19.0654,
      longitude: 72.8689,
      status: 'PENDING',
      isFeatured: false,
    },
  });

  const listing6 = await prisma.listing.create({
    data: {
      ownerId: owner.id,
      title: 'Draft Listing - Test',
      description: 'A draft listing for testing.',
      type: 'KIOSK',
      price: 10000,
      landmarks: ['Test'],
      latitude: 19.0,
      longitude: 72.8,
      status: 'DRAFT',
      isFeatured: false,
    },
  });

  console.log('  Created 6 listings');

  // ─── Listing Images ──────────────────────────────────
  await prisma.listingImage.createMany({
    data: [
      { listingId: listing1.id, url: '/uploads/placeholder-hoarding-1.jpg' },
      { listingId: listing1.id, url: '/uploads/placeholder-hoarding-2.jpg' },
      { listingId: listing2.id, url: '/uploads/placeholder-kiosk-1.jpg' },
      { listingId: listing3.id, url: '/uploads/placeholder-gantry-1.jpg' },
      { listingId: listing4.id, url: '/uploads/placeholder-transit-1.jpg' },
    ],
  });
  console.log('  Created listing images');

  // ─── Bookings ────────────────────────────────────────
  const booking1 = await prisma.booking.create({
    data: {
      listingId: listing1.id,
      userId: agency.id,
      startDate: new Date('2026-04-15'),
      endDate: new Date('2026-05-15'),
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      listingId: listing2.id,
      userId: agency.id,
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-05-31'),
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      listingId: listing3.id,
      userId: agency.id,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-30'),
    },
  });
  console.log('  Created 3 bookings');

  // ─── Offers ──────────────────────────────────────────
  const offer1 = await prisma.offer.create({
    data: {
      senderId: agency.id,
      receiverId: owner.id,
      totalPrice: 100000,
      negotiatedPrice: 85000,
      status: 'PENDING',
      offerListings: {
        create: [
          { listingId: listing1.id },
          { listingId: listing2.id },
        ],
      },
    },
  });

  const offer2 = await prisma.offer.create({
    data: {
      senderId: agency.id,
      receiverId: owner.id,
      totalPrice: 150000,
      status: 'ACCEPTED',
      offerListings: {
        create: [{ listingId: listing3.id }],
      },
    },
  });
  console.log('  Created 2 offers');

  // ─── Conversations ───────────────────────────────────
  const conv1 = await prisma.conversation.create({
    data: {
      offerId: offer1.id,
      participants: {
        connect: [{ id: agency.id }, { id: owner.id }],
      },
      messages: {
        create: [
          {
            senderId: agency.id,
            content: 'Hi, I am interested in booking these two spots for our upcoming campaign.',
          },
          {
            senderId: owner.id,
            content: 'Thanks for your interest! The hoarding is available from mid-April. We can discuss pricing.',
          },
          {
            senderId: agency.id,
            content: 'We have sent an offer for ₹85,000 for both. Let us know if that works.',
          },
        ],
      },
    },
  });

  const conv2 = await prisma.conversation.create({
    data: {
      offerId: offer2.id,
      participants: {
        connect: [{ id: agency.id }, { id: owner.id }],
      },
      messages: {
        create: [
          {
            senderId: agency.id,
            content: 'We would like to book the Sea Link gantry for June.',
          },
          {
            senderId: owner.id,
            content: 'Deal confirmed! We will send you the installation schedule.',
          },
        ],
      },
    },
  });
  console.log('  Created 2 conversations with messages');

  console.log('\nSeed complete!');
  console.log('────────────────────────────────────────');
  console.log('Login credentials (all passwords: password123):');
  console.log('  Admin:  admin@admax.com');
  console.log('  Owner:  owner@admax.com');
  console.log('  Agency: agency@admax.com');
  console.log('────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
