import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const property = await prisma.property.upsert({
    where: { slug: 'montparnasse' },
    update: {},
    create: { slug: 'montparnasse', name: 'Studio Montparnasse', address: 'Paris 14e' }
  })

  const concierge = await prisma.user.upsert({
    where: { email: 'concierge@demo.local' },
    update: {},
    create: { role: 'CONCIERGE', name: 'Concierge Démo', email: 'concierge@demo.local' }
  })

  const housekeeper = await prisma.user.upsert({
    where: { email: 'menage@demo.local' },
    update: {},
    create: { role: 'HOUSEKEEPING', name: 'Équipe Ménage', email: 'menage@demo.local' }
  })

  const ticket = await prisma.ticket.create({
    data: {
      propertyId: property.id,
      status: 'OPEN',
      type: 'MSG',
      assigneeId: concierge.id,
      messages: {
        create: [
          { from: 'phone', body: 'Bonjour, je n’arrive pas à trouver les clés.', phone: '+33600000000' },
          { from: 'staff', body: 'Bonjour ! Le coffre est à gauche de la porte, code 2580.' }
        ]
      }
    }
  })

  const due = new Date()
  due.setHours(14, 0, 0, 0)
  const task = await prisma.task.create({
    data: {
      propertyId: property.id,
      type: 'CLEANING',
      dueAt: due,
      assigneeId: housekeeper.id,
      status: 'TODO'
    }
  })

  await prisma.review.create({
    data: { propertyId: property.id, score: 5, comment: 'Séjour parfait, merci !' }
  })

  console.log('Seed OK', { property: property.slug, ticket: ticket.id, task: task.id })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
