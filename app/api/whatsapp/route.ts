import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabaseServer } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function j(err: unknown) {
  if (!err) return 'Unknown error'
  if (typeof err === 'string') return err
  if (err instanceof Error) return `${err.name}: ${err.message}`
  try { return JSON.stringify(err) } catch { return String(err) }
}

function extFromContentType(ct: string) {
  if (!ct) return 'bin'
  if (ct.includes('jpeg')) return 'jpg'
  if (ct.includes('jpg'))  return 'jpg'
  if (ct.includes('png'))  return 'png'
  if (ct.includes('webp')) return 'webp'
  if (ct.includes('gif'))  return 'gif'
  if (ct.includes('mp4'))  return 'mp4'
  if (ct.includes('quicktime')) return 'mov'
  if (ct.includes('webm')) return 'webm'
  if (ct.includes('pdf'))  return 'pdf'
  return ct.split('/').pop() || 'bin'
}

export async function POST(req: Request) {
  try {
    // Twilio envoie application/x-www-form-urlencoded
    const form = await req.formData()

    const from = String(form.get('From') || '')                // ex: whatsapp:+336...
    const body = String(form.get('Body') || '').trim()
    const numMedia = parseInt(String(form.get('NumMedia') || '0'), 10) || 0

    const fromPhone = from.replace(/^whatsapp:/i, '').replace(/\s+/g, '')
    if (!fromPhone) return NextResponse.json({ error: 'Missing From phone' }, { status: 400 })

    // Liste des médias (url + content-type)
    const medias: { url: string; contentType: string }[] = []
    for (let i = 0; i < numMedia; i++) {
      const u = String(form.get(`MediaUrl${i}`) || '')
      const c = String(form.get(`MediaContentType${i}`) || '')
      if (u) medias.push({ url: u, contentType: c })
    }

    // 1) Trouver ticket OPEN récent pour ce numéro, sinon créer
    let ticket = await prisma.ticket.findFirst({
      where: { status: 'OPEN', messages: { some: { phone: fromPhone } } },
      orderBy: { createdAt: 'desc' },
    })

    if (!ticket) {
      ticket = await prisma.ticket.create({
        data: { status: 'OPEN', type: 'MSG' },
      })
      await prisma.auditLog.create({ data: { action: 'TICKET_CREATED', entity: 'Ticket', entityId: ticket.id } })
    }

    // 2) Enregistrer le message texte (si présent)
    if (body) {
      await prisma.message.create({
        data: { ticketId: ticket.id, from: 'phone', phone: fromPhone, body },
      })
    }

    // 3) Téléchargement médias (supporte URL Twilio avec auth et URL publiques sans auth)
    if (medias.length > 0) {
      const sid = process.env.TWILIO_ACCOUNT_SID || ''
      const token = process.env.TWILIO_AUTH_TOKEN || ''
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: 'Missing Supabase env vars' }, { status: 500 })
      }

      const basicAuth = 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64')

      let idx = 0
      for (const m of medias) {
        try {
          const needsAuth = /twilio\.com/i.test(m.url)
          const r = await fetch(m.url, {
            headers: needsAuth && sid && token ? { Authorization: basicAuth } : {},
          })
          if (!r.ok) {
            await prisma.auditLog.create({
              data: { action: 'MEDIA_FETCH_FAIL', entity: 'Ticket', entityId: ticket.id }
            })
            idx++
            continue
          }

          const buf = new Uint8Array(await r.arrayBuffer())
          const ext = extFromContentType(m.contentType)
          const key = `tickets/${ticket.id}/${Date.now()}_${idx}.${ext || 'bin'}`

          const { error: upErr } = await supabaseServer.storage
            .from('crm-photos')
            .upload(key, buf, {
              contentType: m.contentType || 'application/octet-stream',
              upsert: false
            })

          if (upErr) {
            await prisma.auditLog.create({
              data: { action: 'MEDIA_UPLOAD_FAIL', entity: 'Ticket', entityId: ticket.id }
            })
            idx++
            continue
          }

          const { data: pub } = supabaseServer.storage.from('crm-photos').getPublicUrl(key)
          const mediaUrl = pub.publicUrl

          await prisma.message.create({
            data: {
              ticketId: ticket.id,
              from: 'phone',
              phone: fromPhone,
              body: '',
              // @ts-ignore – champ souple V1
              mediaUrl,
            } as any,
          })

          idx++
        } catch (err) {
          await prisma.auditLog.create({
            data: { action: 'MEDIA_FETCH_EXCEPTION', entity: 'Ticket', entityId: ticket.id }
          })
          idx++
          continue
        }
      }
    }

    await prisma.auditLog.create({ data: { action: 'MESSAGE_IN', entity: 'Ticket', entityId: ticket.id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: `Unhandled: ${j(e)}` }, { status: 500 })
  }
}