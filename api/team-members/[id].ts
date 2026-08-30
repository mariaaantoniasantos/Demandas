import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminClient, requireManagerCaller, friendlyAuthError, VALID_ROLES } from '../_lib/adminAuth';

// PATCH /api/team-members/:id — edita perfil e, opcionalmente, email/senha.
// DELETE /api/team-members/:id — remove o usuário (auth + perfil, em cascata).
// Ambas exigem a service role key (edição de email/senha e remoção de conta
// alheia ignoram as permissões normais do próprio usuário logado).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: 'ID inválido.' });

  const admin = getAdminClient();
  const caller = await requireManagerCaller(req, admin);
  if ('error' in caller) {
    return res.status(401).json({ error: caller.error });
  }

  if (req.method === 'PATCH') {
    const { nome, email, senha, papel, cor_avatar } = req.body || {};

    if (papel !== undefined && !VALID_ROLES.includes(papel)) {
      return res.status(400).json({ error: 'Papel inválido.' });
    }
    if (senha && String(senha).length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    if (email || senha) {
      const { error: authUpdateError } = await admin.auth.admin.updateUserById(id, {
        ...(email ? { email: String(email).trim() } : {}),
        ...(senha ? { password: String(senha) } : {}),
      });
      if (authUpdateError) {
        return res
          .status(409)
          .json({ error: friendlyAuthError(authUpdateError.message, 'Não foi possível atualizar as credenciais do usuário.') });
      }
    }

    const profileUpdates: Record<string, unknown> = {};
    if (nome !== undefined) profileUpdates.nome = String(nome).trim();
    if (email !== undefined) profileUpdates.email = String(email).trim();
    if (papel !== undefined) profileUpdates.papel = papel;
    if (cor_avatar !== undefined) profileUpdates.cor_avatar = cor_avatar;

    let profileRow;
    if (Object.keys(profileUpdates).length > 0) {
      const { data, error } = await admin.from('usuarios').update(profileUpdates).eq('id', id).select('*').single();
      if (error || !data) return res.status(500).json({ error: 'Não foi possível salvar o perfil do usuário.' });
      profileRow = data;
    } else {
      const { data, error } = await admin.from('usuarios').select('*').eq('id', id).single();
      if (error || !data) return res.status(404).json({ error: 'Usuário não encontrado.' });
      profileRow = data;
    }

    return res.status(200).json({ user: profileRow });
  }

  if (req.method === 'DELETE') {
    if (id === caller.userId) {
      return res.status(400).json({ error: 'Você não pode remover o próprio usuário enquanto está logado.' });
    }

    const { count, error: countError } = await admin.from('usuarios').select('*', { count: 'exact', head: true });
    if (countError) return res.status(500).json({ error: 'Não foi possível verificar a equipe.' });
    if ((count ?? 0) <= 1) {
      return res.status(400).json({ error: 'Não é possível remover o último usuário do sistema.' });
    }

    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return res.status(500).json({ error: 'Não foi possível remover o usuário.' });
    return res.status(204).end();
  }

  res.setHeader('Allow', 'PATCH, DELETE');
  return res.status(405).json({ error: 'Método não permitido.' });
}
