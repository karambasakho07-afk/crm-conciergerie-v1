import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const items = await prisma.$transaction([
    prisma.auditLog.create({ data: { action: 'LOGIN_OK', entity: 'User', entityId: 'admin' } }),
    prisma.auditLog.create({ data: { action: 'MESSAGE_IN', entity: 'Ticket', entityId: 'demo' } }),
    prisma.auditLog.create({ data: { action: 'MESSAGE_OUT', entity: 'Ticket', entityId: 'demo' } }),
    prisma.auditLog.create({ data: { action: 'TICKET_STATUS_CHANGED', entity: 'Ticket', entityId: 'demo' } }),
    prisma.auditLog.create({ data: { action: 'TASK_ASSIGNED', entity: 'Task', entityId: 'demo' } }),
  ])
  return NextResponse.json({ ok: true, count: items.length })
}