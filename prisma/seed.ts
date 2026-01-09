import { faker } from "@faker-js/faker";
import { Role } from "@prisma/client";
import { hash } from "../src/lib/hash";
import { prisma } from "../src/lib/prisma";
import { createSlug, ensureUniqueSlug } from "../src/utils/common";

// Material seed data
const materials = [
  { name: "Wooden", slug: "wooden" },
  { name: "Bamboo", slug: "bamboo" },
  { name: "Metal", slug: "metal" },
];

// Type seed data
const types = [
  { name: "Seating", slug: "seating" },
  { name: "Lying", slug: "lying" },
  { name: "Tables", slug: "tables" },
  { name: "Storage", slug: "storage" },
  { name: "Entertainment", slug: "entertainment" },
];

// Category seed data
const categories = [
  { name: "Furniture Buying Guide", slug: "furniture-buying-guide" },
  { name: "Interior Design Tips", slug: "interior-design-tips" },
  { name: "Furniture Care & Maintenance", slug: "furniture-care-maintenance" },
  { name: "Material Guide", slug: "material-guide" },
  { name: "Home Decor Inspiration", slug: "home-decor-inspiration" },
];

export function createRandomUser() {
  return {
    email: faker.internet.email(),
    username: faker.internet.username(),
    password: faker.internet.password(),
    randToken: faker.internet.jwt(),
  };
}

export const users = faker.helpers.multiple(createRandomUser, {
  count: 5,
});

// Post seed data
const posts = [
  {
    title: "First Time Home Owner Ideas",
    content:
      "The choice of furniture depends on personal preferences, the style of the living space, and the intended use of the furniture.",
    image: "post/post-1.jpg",
    body: "<p>Storage furniture is essential for organizing and storing items in homes and offices. It helps to keep living spaces clean and clutter-free, making it easier to find and access items when needed. Storage furniture can also add style and character to a room, enhancing the overall decor of a space.</p><br/><p>Storage furniture is designed to provide storage space for various items in homes and offices. Here are some common uses of storage furniture:</p><br/><ol><li><strong>Organization:</strong> The primary use of storage furniture is to help organize and store various items in homes and offices. This includes items such as clothing, shoes, books, toys, office supplies, and other household items.</li><li><strong>Space-saving:</strong> Storage furniture can also be used to save space in a room. For example, a bed with built-in drawers or shelves can provide additional storage space for clothing and bedding, freeing up space in a closet or dresser.</li><li><strong>Decor</strong>Storage furniture can also be used as decorative pieces in a room. Bookcases, for example, can be used to display books and decorative items while also providing storage space.</li><li><strong>Flexibility:</strong> Storage furniture can be used in various rooms in a home or office. For example, a storage cabinet that is used in a living room to store board games and other items can be moved to a home office to store office supplies.</li><li><strong>Safety:</strong> Storage furniture can also be used to keep hazardous items out of reach of children and pets. Cabinets and lockers can be used to store chemicals, tools, and other items that can be dangerous if not stored properly.</li></ol><br/><br/><p>Overall, storage furniture is an essential part of any functional and organized living space. It helps to keep items organized and easily accessible while also providing additional storage space and enhancing the overall decor of a room.</p>",
    categorySlug: "furniture-buying-guide",
  },
  {
    title: "How To Keep Your Furniture Clean",
    content:
      "The choice of furniture depends on personal preferences, the style of the living space, and the intended use of the furniture.",
    image: "post/post-2.jpg",
    body: "<p>Storage furniture is essential for organizing and storing items in homes and offices. It helps to keep living spaces clean and clutter-free, making it easier to find and access items when needed. Storage furniture can also add style and character to a room, enhancing the overall decor of a space.</p><br/><p>Storage furniture is designed to provide storage space for various items in homes and offices. Here are some common uses of storage furniture:</p><br/><ol><li><strong>Organization:</strong> The primary use of storage furniture is to help organize and store various items in homes and offices. This includes items such as clothing, shoes, books, toys, office supplies, and other household items.</li><li><strong>Space-saving:</strong> Storage furniture can also be used to save space in a room. For example, a bed with built-in drawers or shelves can provide additional storage space for clothing and bedding, freeing up space in a closet or dresser.</li><li><strong>Decor</strong>Storage furniture can also be used as decorative pieces in a room. Bookcases, for example, can be used to display books and decorative items while also providing storage space.</li><li><strong>Flexibility:</strong> Storage furniture can be used in various rooms in a home or office. For example, a storage cabinet that is used in a living room to store board games and other items can be moved to a home office to store office supplies.</li><li><strong>Safety:</strong> Storage furniture can also be used to keep hazardous items out of reach of children and pets. Cabinets and lockers can be used to store chemicals, tools, and other items that can be dangerous if not stored properly.</li></ol><br/><br/><p>Overall, storage furniture is an essential part of any functional and organized living space. It helps to keep items organized and easily accessible while also providing additional storage space and enhancing the overall decor of a room.</p>",
    categorySlug: "furniture-care-maintenance",
  },
  {
    title: "Small Space Furniture Apartment Ideas",
    content:
      "The choice of furniture depends on personal preferences, the style of the living space, and the intended use of the furniture.",
    image: "post/post-3.jpg",
    body: "<p>Storage furniture is essential for organizing and storing items in homes and offices. It helps to keep living spaces clean and clutter-free, making it easier to find and access items when needed. Storage furniture can also add style and character to a room, enhancing the overall decor of a space.</p><br/><p>Storage furniture is designed to provide storage space for various items in homes and offices. Here are some common uses of storage furniture:</p><br/><ol><li><strong>Organization:</strong> The primary use of storage furniture is to help organize and store various items in homes and offices. This includes items such as clothing, shoes, books, toys, office supplies, and other household items.</li><li><strong>Space-saving:</strong> Storage furniture can also be used to save space in a room. For example, a bed with built-in drawers or shelves can provide additional storage space for clothing and bedding, freeing up space in a closet or dresser.</li><li><strong>Decor</strong>Storage furniture can also be used as decorative pieces in a room. Bookcases, for example, can be used to display books and decorative items while also providing storage space.</li><li><strong>Flexibility:</strong> Storage furniture can be used in various rooms in a home or office. For example, a storage cabinet that is used in a living room to store board games and other items can be moved to a home office to store office supplies.</li><li><strong>Safety:</strong> Storage furniture can also be used to keep hazardous items out of reach of children and pets. Cabinets and lockers can be used to store chemicals, tools, and other items that can be dangerous if not stored properly.</li></ol><br/><br/><p>Overall, storage furniture is an essential part of any functional and organized living space. It helps to keep items organized and easily accessible while also providing additional storage space and enhancing the overall decor of a room.</p>",
    categorySlug: "interior-design-tips",
  },
  {
    title: "keep living spaces clean and clutter-free",
    content:
      "The choice of furniture depends on personal preferences, the style of the living space, and the intended use of the furniture.",
    image: "post/post-4.jpg",
    body: "<p>Storage furniture is essential for organizing and storing items in homes and offices. It helps to keep living spaces clean and clutter-free, making it easier to find and access items when needed. Storage furniture can also add style and character to a room, enhancing the overall decor of a space.</p><br/><p>Storage furniture is designed to provide storage space for various items in homes and offices. Here are some common uses of storage furniture:</p><br/><ol><li><strong>Organization:</strong> The primary use of storage furniture is to help organize and store various items in homes and offices. This includes items such as clothing, shoes, books, toys, office supplies, and other household items.</li><li><strong>Space-saving:</strong> Storage furniture can also be used to save space in a room. For example, a bed with built-in drawers or shelves can provide additional storage space for clothing and bedding, freeing up space in a closet or dresser.</li><li><strong>Decor</strong>Storage furniture can also be used as decorative pieces in a room. Bookcases, for example, can be used to display books and decorative items while also providing storage space.</li><li><strong>Flexibility:</strong> Storage furniture can be used in various rooms in a home or office. For example, a storage cabinet that is used in a living room to store board games and other items can be moved to a home office to store office supplies.</li><li><strong>Safety:</strong> Storage furniture can also be used to keep hazardous items out of reach of children and pets. Cabinets and lockers can be used to store chemicals, tools, and other items that can be dangerous if not stored properly.</li></ol><br/><br/><p>Overall, storage furniture is an essential part of any functional and organized living space. It helps to keep items organized and easily accessible while also providing additional storage space and enhancing the overall decor of a room.</p>",
    categorySlug: "home-decor-inspiration",
  },
  {
    title: "How To Keep Your Furniture Clean",
    content:
      "The choice of furniture depends on personal preferences, the style of the living space, and the intended use of the furniture.",
    image: "post/post-5.jpg",
    body: "<p>Storage furniture is essential for organizing and storing items in homes and offices. It helps to keep living spaces clean and clutter-free, making it easier to find and access items when needed. Storage furniture can also add style and character to a room, enhancing the overall decor of a space.</p><br/><p>Storage furniture is designed to provide storage space for various items in homes and offices. Here are some common uses of storage furniture:</p><br/><ol><li><strong>Organization:</strong> The primary use of storage furniture is to help organize and store various items in homes and offices. This includes items such as clothing, shoes, books, toys, office supplies, and other household items.</li><li><strong>Space-saving:</strong> Storage furniture can also be used to save space in a room. For example, a bed with built-in drawers or shelves can provide additional storage space for clothing and bedding, freeing up space in a closet or dresser.</li><li><strong>Decor</strong>Storage furniture can also be used as decorative pieces in a room. Bookcases, for example, can be used to display books and decorative items while also providing storage space.</li><li><strong>Flexibility:</strong> Storage furniture can be used in various rooms in a home or office. For example, a storage cabinet that is used in a living room to store board games and other items can be moved to a home office to store office supplies.</li><li><strong>Safety:</strong> Storage furniture can also be used to keep hazardous items out of reach of children and pets. Cabinets and lockers can be used to store chemicals, tools, and other items that can be dangerous if not stored properly.</li></ol><br/><br/><p>Overall, storage furniture is an essential part of any functional and organized living space. It helps to keep items organized and easily accessible while also providing additional storage space and enhancing the overall decor of a room.</p>",
    categorySlug: "furniture-care-maintenance",
  },
  {
    title: "Small Space Furniture Apartment Ideas",
    content:
      "The global smart furniture market size is expected to reach $794.8 million by 2025, growing at a CAGR of 6.4% from 2020 to 2025.",
    image: "post/post-6.jpg",
    body: "<p>Storage furniture is essential for organizing and storing items in homes and offices. It helps to keep living spaces clean and clutter-free, making it easier to find and access items when needed. Storage furniture can also add style and character to a room, enhancing the overall decor of a space.</p><br/><p>Storage furniture is designed to provide storage space for various items in homes and offices. Here are some common uses of storage furniture:</p><br/><ol><li><strong>Organization:</strong> The primary use of storage furniture is to help organize and store various items in homes and offices. This includes items such as clothing, shoes, books, toys, office supplies, and other household items.</li><li><strong>Space-saving:</strong> Storage furniture can also be used to save space in a room. For example, a bed with built-in drawers or shelves can provide additional storage space for clothing and bedding, freeing up space in a closet or dresser.</li><li><strong>Decor</strong>Storage furniture can also be used as decorative pieces in a room. Bookcases, for example, can be used to display books and decorative items while also providing storage space.</li><li><strong>Flexibility:</strong> Storage furniture can be used in various rooms in a home or office. For example, a storage cabinet that is used in a living room to store board games and other items can be moved to a home office to store office supplies.</li><li><strong>Safety:</strong> Storage furniture can also be used to keep hazardous items out of reach of children and pets. Cabinets and lockers can be used to store chemicals, tools, and other items that can be dangerous if not stored properly.</li></ol><br/><br/><p>Overall, storage furniture is an essential part of any functional and organized living space. It helps to keep items organized and easily accessible while also providing additional storage space and enhancing the overall decor of a room.</p>",
    categorySlug: "interior-design-tips",
  },
];

export async function main() {
  console.log("Starting seed...");

  // Seed Materials
  console.log("Seeding Materials...");
  for (const material of materials) {
    await prisma.material.upsert({
      where: { slug: material.slug },
      update: {},
      create: {
        name: material.name,
        slug: material.slug,
      },
    });
    console.log(`Created/Updated material: ${material.name}`);
  }

  // Seed Types
  console.log("Seeding Types...");
  for (const type of types) {
    await prisma.type.upsert({
      where: { slug: type.slug },
      update: {},
      create: {
        name: type.name,
        slug: type.slug,
      },
    });
    console.log(`Created/Updated type: ${type.name}`);
  }

  // Seed Categories
  console.log("Seeding Categories...");
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.name,
        slug: category.slug,
      },
    });
    console.log(`Created/Updated category: ${category.name}`);
  }

  // Seed Admin User
  console.log("Seeding Admin User...");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      username: "admin",
      password: await hash("admin123"),
      randToken: faker.internet.jwt(),
      role: Role.ADMIN,
      firstName: "Admin",
      lastName: "User",
    },
  });
  console.log(`Created/Updated admin user: ${adminUser.email}`);

  // Seed Author User
  console.log("Seeding Author User...");
  const authorUser = await prisma.user.upsert({
    where: { email: "author@example.com" },
    update: {},
    create: {
      email: "author@example.com",
      username: "author",
      password: await hash("author123"),
      randToken: faker.internet.jwt(),
      role: Role.AUTHOR,
      firstName: "Author",
      lastName: "User",
    },
  });
  console.log(`Created/Updated author user: ${authorUser.email}`);

  // Seed Regular Users
  console.log("Seeding Regular Users...");
  // Delete old regular users (USER role) before creating new ones
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      role: Role.USER,
    },
  });
  console.log(`Deleted ${deletedUsers.count} old regular users`);

  for (const user of users) {
    await prisma.user.create({
      data: {
        ...user,
        password: await hash(user.password),
      },
    });
    console.log(
      `Created user with email: ${user.email}, username: ${user.username}`
    );
  }

  // Seed Posts
  console.log("Seeding Posts...");
  // Delete all existing posts before creating new ones
  const deletedPosts = await prisma.post.deleteMany({});
  console.log(`Deleted ${deletedPosts.count} old posts`);

  // Only use admin and author users as post authors
  const authorIds = [adminUser.id, authorUser.id];
  let authorIndex = 0;

  for (const postData of posts) {
    // Get category by slug
    const category = await prisma.category.findUnique({
      where: { slug: postData.categorySlug },
    });

    if (!category) {
      console.log(
        `Category with slug ${postData.categorySlug} not found, skipping post: ${postData.title}`
      );
      continue;
    }

    // Create slug from title
    const baseSlug = createSlug(postData.title);
    const existingPost = await prisma.post.findUnique({
      where: { slug: baseSlug },
    });
    const slugExists = !!existingPost;
    const slug = await ensureUniqueSlug(baseSlug, slugExists);

    // Alternate between admin and author (only these two users can be post authors)
    const authorId = authorIds[authorIndex];
    authorIndex = authorIndex === 0 ? 1 : 0;

    await prisma.post.upsert({
      where: { slug },
      update: {},
      create: {
        title: postData.title,
        slug,
        content: postData.content,
        body: postData.body,
        image: postData.image,
        authorId: authorId ?? adminUser.id,
        categoryId: category.id,
      },
    });
    console.log(`Created/Updated post: ${postData.title}`);
  }

  console.log("Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
