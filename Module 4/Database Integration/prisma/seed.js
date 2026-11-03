require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const samplePosts = require('../src/data/postSeed');

const prisma = new PrismaClient();

async function main() {
  let user = await prisma.user.findFirst({ where: { name: 'Community Seed User' } });
  if (!user) {
    user = await prisma.user.create({ data: { name: 'Community Seed User' } });
  }

  for (const post of samplePosts) {
    const existing = await prisma.post.findFirst({
      where: { title: post.title, authorId: user.id },
    });

    if (!existing) {
      await prisma.post.create({
        data: {
          title: post.title,
          body: post.body,
          authorId: user.id,
        },
      });
    }
  }
}

main()
  .catch((error) => {
    console.error('Database seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
