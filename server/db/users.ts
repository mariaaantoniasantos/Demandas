import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Permite apontar para o mount path de um disco persistente (ex: no Render)
// através da variável de ambiente DATA_DIR. Sem essa variável, usa a pasta
// server/data dentro do próprio projeto (comportamento padrão local/dev).
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), 'server/data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Senha padrão dos usuários de demonstração na primeira inicialização do servidor.
// Deve ser trocada pelo usuário assim que possível (edição em Gerenciar Equipe).
const DEFAULT_PASSWORD = 'agencia123';

export type UserRole = 'designer' | 'videomaker' | 'social_media' | 'gerente';

export interface StoredUser {
  id: string;
  nome: string;
  email: string;
  senha_hash: string;
  papel: UserRole;
  cor_avatar: string;
  avatar_url?: string;
}

const SEED_USERS: Array<Omit<StoredUser, 'senha_hash'>> = [
  { id: 'user_mariana', nome: 'Mariana Santos', email: 'mariana.santos@v4company.com', cor_avatar: '#10b981', papel: 'gerente' },
  { id: 'user_lucas', nome: 'Lucas Silva', email: 'lucas.designer@agencia.com', cor_avatar: '#8b5cf6', papel: 'designer' },
  { id: 'user_beatriz', nome: 'Beatriz Lima', email: 'beatriz.social@agencia.com', cor_avatar: '#ec4899', papel: 'social_media' },
  { id: 'user_rafael', nome: 'Rafael Costa', email: 'rafael.video@agencia.com', cor_avatar: '#f59e0b', papel: 'videomaker' },
];

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function seedUsers(): StoredUser[] {
  const senha_hash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);
  return SEED_USERS.map((u) => ({ ...u, senha_hash }));
}

export function readUsers(): StoredUser[] {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) {
    const seeded = seedUsers();
    writeUsers(seeded);
    return seeded;
  }
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw) as StoredUser[];
  } catch (err) {
    console.error('Falha ao ler o arquivo de usuários, retornando lista vazia.', err);
    return [];
  }
}

export function writeUsers(users: StoredUser[]): void {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}
