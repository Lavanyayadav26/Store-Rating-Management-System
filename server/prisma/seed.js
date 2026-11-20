import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log('Clearing existing data...');
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding users...');
  const commonPasswordHash = await hashPassword('Password@123');

  // 1 System Admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator Master',
      email: 'admin@storerating.com',
      password: commonPasswordHash,
      address: '100 Tech Blvd, Silicon Valley, CA 94016, United States',
      role: 'SYSTEM_ADMIN',
    },
  });

  // 3 Store Owners
  const owner1 = await prisma.user.create({
    data: {
      name: 'Store Owner Alice Johnson',
      email: 'alice.owner@store.com',
      password: commonPasswordHash,
      address: '250 Market Street, San Francisco, CA 94105, United States',
      role: 'STORE_OWNER',
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Store Owner Robert Davis',
      email: 'robert.owner@store.com',
      password: commonPasswordHash,
      address: '420 Broadway Avenue, New York, NY 10013, United States',
      role: 'STORE_OWNER',
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      name: 'Store Owner Clara Sterling',
      email: 'clara.owner@store.com',
      password: commonPasswordHash,
      address: '789 Michigan Avenue, Chicago, IL 60611, United States',
      role: 'STORE_OWNER',
    },
  });

  // 6 Normal Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Normal User David Williams',
      email: 'david.user@example.com',
      password: commonPasswordHash,
      address: '12 Oak Ridge Road, Austin, TX 78701, United States',
      role: 'NORMAL_USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Normal User Emma Watson Lee',
      email: 'emma.user@example.com',
      password: commonPasswordHash,
      address: '54 Pine Street, Seattle, WA 98101, United States',
      role: 'NORMAL_USER',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Normal User Frank Castle Jr',
      email: 'frank.user@example.com',
      password: commonPasswordHash,
      address: '88 Elm Street, Denver, CO 80202, United States',
      role: 'NORMAL_USER',
    },
  });

  const user4 = await prisma.user.create({
    data: {
      name: 'Normal User Grace Hopper Sr',
      email: 'grace.user@example.com',
      password: commonPasswordHash,
      address: '99 Maple Drive, Boston, MA 02108, United States',
      role: 'NORMAL_USER',
    },
  });

  const user5 = await prisma.user.create({
    data: {
      name: 'Normal User Henry Ford King',
      email: 'henry.user@example.com',
      password: commonPasswordHash,
      address: '101 Cedar Lane, Portland, OR 97201, United States',
      role: 'NORMAL_USER',
    },
  });

  const user6 = await prisma.user.create({
    data: {
      name: 'Normal User Isabella Thorne',
      email: 'isabella.user@example.com',
      password: commonPasswordHash,
      address: '320 Sunset Boulevard, Los Angeles, CA 90028, United States',
      role: 'NORMAL_USER',
    },
  });

  console.log('Seeding stores...');
  const store1 = await prisma.store.create({
    data: {
      name: 'Apex Super Tech Electronics',
      email: 'contact@apextech.com',
      address: '250 Market Street, San Francisco, CA 94105, United States',
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Green Valley Organic Foods',
      email: 'support@greenvalleyfoods.com',
      address: '420 Broadway Avenue, New York, NY 10013, United States',
      ownerId: owner2.id,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Heritage Books and Stationery',
      email: 'hello@heritagebooks.com',
      address: '789 Michigan Avenue, Chicago, IL 60611, United States',
      ownerId: owner3.id,
    },
  });

  const store4 = await prisma.store.create({
    data: {
      name: 'Urban Vogue Fashion Boutique',
      email: 'care@urbanvogue.com',
      address: '65 Rodeo Drive, Beverly Hills, CA 90210, United States',
      ownerId: null, // Unassigned store
    },
  });

  const store5 = await prisma.store.create({
    data: {
      name: 'Pacific Blue Ocean Seafoods',
      email: 'info@pacificbluesea.com',
      address: '12 Waterfront Pier, Seattle, WA 98101, United States',
      ownerId: null, // Unassigned store
    },
  });

  const store6 = await prisma.store.create({
    data: {
      name: 'Peak Performance Sporting Goods',
      email: 'sales@peakperformance.com',
      address: '77 Mountain Ridge Way, Denver, CO 80202, United States',
      ownerId: null,
    },
  });

  console.log('Seeding ratings...');
  // Apex Super Tech Electronics ratings
  await prisma.rating.createMany({
    data: [
      { userId: user1.id, storeId: store1.id, rating: 5 },
      { userId: user2.id, storeId: store1.id, rating: 4 },
      { userId: user3.id, storeId: store1.id, rating: 5 },
      { userId: user4.id, storeId: store1.id, rating: 4 },
    ],
  });

  // Green Valley Organic Foods ratings
  await prisma.rating.createMany({
    data: [
      { userId: user1.id, storeId: store2.id, rating: 4 },
      { userId: user2.id, storeId: store2.id, rating: 5 },
      { userId: user5.id, storeId: store2.id, rating: 4 },
      { userId: user6.id, storeId: store2.id, rating: 3 },
    ],
  });

  // Heritage Books and Stationery ratings
  await prisma.rating.createMany({
    data: [
      { userId: user3.id, storeId: store3.id, rating: 5 },
      { userId: user4.id, storeId: store3.id, rating: 5 },
      { userId: user5.id, storeId: store3.id, rating: 4 },
    ],
  });

  // Urban Vogue Fashion Boutique ratings
  await prisma.rating.createMany({
    data: [
      { userId: user2.id, storeId: store4.id, rating: 3 },
      { userId: user6.id, storeId: store4.id, rating: 4 },
    ],
  });

  // Pacific Blue Ocean Seafoods ratings
  await prisma.rating.createMany({
    data: [
      { userId: user1.id, storeId: store5.id, rating: 4 },
      { userId: user4.id, storeId: store5.id, rating: 5 },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
