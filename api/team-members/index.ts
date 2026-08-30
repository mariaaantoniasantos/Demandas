import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminClient, requireManagerCaller, friendlyAuthError, VALID_ROLES } from '../_lib/adminAuth';

// POST /api/team-members — cria um novo membro da equipe (usuário do Supabase
// Auth + linha correspondente em public.usuarios). Requer a service role key,
// por isso vive numa rota de servidor e não é chamada direto do frontend.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const admin = getAdminClient();
  const caller = await requireManagerCaller(req, admin);
  if ('error' in caller) {
    return res.status(401).json({ error: caller.error });
  }

  const { nome, email, senha, papel, cor_avatar } = req.body || {};

  if (!nome || !String(nome).trim()) {
    return res.status(400).json({ error: 'Informe o nome do membro da equipe.' });
  }
  if (!email || !String(email).trim()) {
    return res.status(400).json({ error: 'Informe o email do membro da equipe.' });
  }
  if (!senha || String(senha).length < 6) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
  }
  if (!papel || !VALID_ROLES.includes(papel)) {
    return res.status(400).json({ error: 'Papel inválido.' });
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: String(email).trim(),
    password: String(senha),
    email_confirm: true,
  });

  if (createError || !created.user) {
    return res.status(409).json({ error: friendlyAuthError(createError?.message, 'Não foi possível cadastrar o usuário.') });
  }

  const { data: profileRow, error: profileError } = await admin
    .from('usuarios')
    .insert({
      id: created.user.id,
      nome: String(nome).trim(),
      email: String(email).trim(),
      papel,
      cor_avatar: cor_avatar || '#6366f1',
    })
    .select('*')
    .single();

  if (profileError || !profileRow) {
    // Evita deixar um usuário de auth "órfão" sem perfil correspondente.
    await admin.auth.admin.deleteUser(created.user.id);
    return res.status(500).json({ error: 'Não foi possível salvar o perfil do usuário.' });
  }

  return res.status(201).json({ user: profileRow });
}
