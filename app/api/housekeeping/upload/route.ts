import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function json(err: unknown) {
  if (!err) return 'Unknown error'
  if (typeof err === 'string') return err
  if (err instanceof Error) return `${err.name}: ${err.message}`
  try { return JSON.stringify(err) } catch { return String(err) }
}

// Remplace accents/espaces/caractères spéciaux pour un nom de fichier sûr
function sanitizeFilename(name: string) {
  // supprime chemin éventuel
  const base = name.split('/').pop()?.split('\\').pop() || 'upload'
  // remplace espaces par _
  let s = base.replace(/\s+/g, '_')
  // enlève accents
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  // garde uniquement a-zA-Z0-9._-
  s = s.replace(/[^a-zA-Z0-9._-]/g, '')
  // évite vide
  if (!s || s === '.' || s === '..') s = 'upload'
  return s.toLowerCase()
}

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Missing Supabase env vars' }, { status: 500 })
    }

    const form = await req.formData()
    const taskId = String(form.get('taskId') || '')
    const checklistStr = String(form.get('checklist') || '{}')
    const file = form.get('photo') as File | null

    if (!taskId) return NextResponse.json({ error: 'Missing taskId' }, { status: 400 })
    if (!file)   return NextResponse.json({ error: 'Missing file "photo"' }, { status: 400 })

    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

    const bytes = new Uint8Array(await file.arrayBuffer())
    const originalName = (file as any).name || 'upload'
    const safeName = sanitizeFilename(originalName)
    const key = `hk/${taskId}/${Date.now()}_${safeName}`

    const { error: upErr } = await supabaseServer
      .storage
      .from('crm-photos')
      .upload(key, bytes, {
        contentType: file.type || 'image/jpeg',
        upsert: false
      })

    if (upErr) {
      return NextResponse.json({ error: `Supabase upload failed: ${json(upErr)}` }, { status: 500 })
    }

    const { data: pub } = supabaseServer.storage.from('crm-photos').getPublicUrl(key)
    const checklist = (() => { try { return JSON.parse(checklistStr) } catch { return {} } })()

    const existing = await prisma.hK_Check.findUnique({ where: { taskId } })
    if (existing) {
      const photos = Array.isArray(existing.photos) ? existing.photos : []
      photos.push({ url: pub.publicUrl, meta: { key } })
      await prisma.hK_Check.update({ where: { id: existing.id }, data: { photos } })
    } else {
      await prisma.hK_Check.create({
        data: { taskId, checklist, photos: [{ url: pub.publicUrl, meta: { key } }] }
      })
    }

    await prisma.auditLog.create({ data: { action: 'HK_UPLOAD', entity: 'Task', entityId: taskId } })
    return NextResponse.json({ ok: true, url: pub.publicUrl })
  } catch (e) {
    return NextResponse.json({ error: `Unhandled: ${json(e)}` }, { status: 500 })
  }
}