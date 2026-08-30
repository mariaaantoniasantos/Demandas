import type { VercelRequest } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const VALID_ROLES = ['designer', 'videomaker', 'social_media', 'gerente'];

// Cliente com a service role key — só pode ser usado dentro de rotas /api
// (nunca no frontend). Ignora RLS, então cada rota precisa validar por conta
// própria quem está chamando antes de agir.
export function getAdminClient(): SupabaseClient {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('Configuração ausente: defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente do servidor.');
  }
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

type CallerResult = { userId: string } | { error: string };

// Só usuários com papel 'gerente' podem criar, editar ou remover outros
// membros da equipe — essa é a "permissão especial" que justifica passar
// pela service role key em vez de deixar o cliente falar direto com o Supabase.
export async function requireManagerCaller(req: VercelRequest, admin: SupabaseClient): Promise<CallerResult> {
  const authHeader = (req.headers.authorization as string) || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return { error: 'Não autenticado.' };

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return { error: 'Sessão inválida ou expirada.' };

  const { data: profile, error: profileError } = await admin
    .from('usuarios')
    .select('papel')
    .eq('id', data.user.id)
    .single();
  if (profileError || !profile) return { error: 'Perfil não encontrado.' };
  if (profile.papel !== 'gerente') return { error: 'Apenas gerentes podem gerenciar a equipe.' };

  return { userId: data.user.id };
}

export function friendlyAuthError(message: string | undefined, fallback: string): string {
  if (message && message.toLowerCase().includes('already been registered')) {
    return 'Já existe um usuário cadastrado com este email.';
  }
  return message || fallback;
}
