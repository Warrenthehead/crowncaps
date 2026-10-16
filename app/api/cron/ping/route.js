import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getPublicClient } from '@/lib/supabase/public';

export const dynamic = 'force-dynamic';

// Ping quotidien (Vercel Cron, voir vercel.json) :
// 1. garde le projet Supabase gratuit actif (il se met en pause après 7 jours sans activité)
// 2. publie les produits "À venir" dont la date de sortie est passée
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const supabase = getPublicClient();
    const { error } = await supabase.from('settings').select('id').limit(1);
    if (error) throw error;
    const { data: released } = await supabase.rpc('release_due_products');
    if (released > 0) revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, released: released || 0, at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
