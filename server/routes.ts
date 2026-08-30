import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { readUsers, writeUsers, StoredUser, UserRole } from './db/users';
import { signToken, verifyToken, TokenPayload } from './auth';

const router = Router();

interface AuthedRequest extends Request {
  auth?: TokenPayload;
}

function toPublicUser(u: StoredUser) {
  const { senha_hash, ...rest } = u;
  return rest;
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
  }
  req.auth = payload;
  next();
}

const VALID_ROLES: UserRole[] = ['designer', 'videomaker', 'social_media', 'gerente'];

router.post('/login', (req: Request, res: Response) => {
  const { email, senha } = req.body || {};
  if (!email || !senha) {
    return res.status(400).json({ error: 'Informe email e senha.' });
  }

  const users = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase().trim());

  if (!user || !bcrypt.compareSync(String(senha), user.senha_hash)) {
    return res.status(401).json({ error: 'Email ou senha inválidos.' });
  }

  const token = signToken({
    sub: user.id,
    nome: user.nome,
    email: user.email,
    papel: user.papel,
    cor_avatar: user.cor_avatar,
  });

  res.json({ token, user: toPublicUser(user) });
});

router.get('/me', requireAuth, (req: AuthedRequest, res: Response) => {
  const users = readUsers();
  const user = users.find((u) => u.id === req.auth!.sub);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }
  res.json({ user: toPublicUser(user) });
});

router.get('/usuarios', requireAuth, (_req: AuthedRequest, res: Response) => {
  res.json({ users: readUsers().map(toPublicUser) });
});

router.post('/usuarios', requireAuth, (req: AuthedRequest, res: Response) => {
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

  const users = readUsers();
  const emailNormalized = String(email).toLowerCase().trim();
  if (users.some((u) => u.email.toLowerCase() === emailNormalized)) {
    return res.status(409).json({ error: 'Já existe um usuário cadastrado com este email.' });
  }

  const newUser: StoredUser = {
    id: `user_${Date.now()}`,
    nome: String(nome).trim(),
    email: String(email).trim(),
    senha_hash: bcrypt.hashSync(String(senha), 10),
    papel,
    cor_avatar: cor_avatar || '#6366f1',
  };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json({ user: toPublicUser(newUser) });
});

router.put('/usuarios/:id', requireAuth, (req: AuthedRequest, res: Response) => {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  const { nome, email, papel, cor_avatar, senha } = req.body || {};

  if (papel && !VALID_ROLES.includes(papel)) {
    return res.status(400).json({ error: 'Papel inválido.' });
  }

  if (email) {
    const emailNormalized = String(email).toLowerCase().trim();
    const emailInUse = users.some((u, i) => i !== idx && u.email.toLowerCase() === emailNormalized);
    if (emailInUse) {
      return res.status(409).json({ error: 'Já existe um usuário cadastrado com este email.' });
    }
  }

  const updated: StoredUser = {
    ...users[idx],
    ...(nome ? { nome: String(nome).trim() } : {}),
    ...(email ? { email: String(email).trim() } : {}),
    ...(papel ? { papel } : {}),
    ...(cor_avatar ? { cor_avatar } : {}),
    ...(senha ? { senha_hash: bcrypt.hashSync(String(senha), 10) } : {}),
  };

  users[idx] = updated;
  writeUsers(users);

  res.json({ user: toPublicUser(updated) });
});

router.delete('/usuarios/:id', requireAuth, (req: AuthedRequest, res: Response) => {
  const users = readUsers();
  if (users.length <= 1) {
    return res.status(400).json({ error: 'Não é possível remover o último usuário do sistema.' });
  }
  if (req.params.id === req.auth!.sub) {
    return res.status(400).json({ error: 'Você não pode remover o próprio usuário enquanto está logado.' });
  }
  const exists = users.some((u) => u.id === req.params.id);
  if (!exists) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  writeUsers(users.filter((u) => u.id !== req.params.id));
  res.status(204).end();
});

export default router;
