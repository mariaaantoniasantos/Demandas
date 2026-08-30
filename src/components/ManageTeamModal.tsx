import React, { useState } from 'react';
import { X, Plus, Users, Trash2, Edit2, Check, AlertCircle, Lock } from 'lucide-react';
import { useDemands } from '../context/DemandContext';
import { USER_ROLE_CONFIG } from '../data/constants';
import { User, UserRole } from '../types';
import { getInitials } from '../utils/formatters';

const AVATAR_COLORS = [
  '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f97316',
  '#06b6d4', '#e11d48', '#6366f1', '#14b8a6', '#64748b',
];

export const ManageTeamModal: React.FC = () => {
  const {
    isTeamModalOpen,
    setIsTeamModalOpen,
    users,
    addUser,
    updateUser,
    deleteUser,
    demands,
    currentUser,
    isEtapaFinal,
    theme,
  } = useDemands();

  const isDark = theme === 'dark';

  const [isAdding, setIsAdding] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form state
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [papel, setPapel] = useState<UserRole>('designer');
  const [corAvatar, setCorAvatar] = useState(AVATAR_COLORS[0]);

  if (!isTeamModalOpen) return null;

  const resetForm = () => {
    setNome('');
    setEmail('');
    setSenha('');
    setPapel('designer');
    setCorAvatar(AVATAR_COLORS[0]);
    setIsAdding(false);
    setEditingUserId(null);
    setFormError('');
  };

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    setNome(user.nome);
    setEmail(user.email);
    setPapel(user.papel);
    setCorAvatar(user.cor_avatar);
    setIsAdding(false);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    setFormError('');

    if (editingUserId) {
      setIsSubmitting(true);
      await updateUser(editingUserId, {
        nome: nome.trim(),
        email: email.trim(),
        papel,
        cor_avatar: corAvatar,
      });
      setIsSubmitting(false);
      resetForm();
    } else {
      if (!email.trim()) {
        setFormError('Informe o email do novo membro.');
        return;
      }
      if (senha.length < 6) {
        setFormError('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
      setIsSubmitting(true);
      const result = await addUser({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        papel,
        cor_avatar: corAvatar,
      });
      setIsSubmitting(false);
      if (!result.success) {
        setFormError(result.error || 'Não foi possível cadastrar o membro.');
        return;
      }
      resetForm();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => setIsTeamModalOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl animate-in zoom-in-95 duration-150 ${
          isDark
            ? 'bg-[#0e1017]/95 border-white/10 text-slate-100'
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-900/20'
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'bg-white/[0.04] border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <div>
              <h2 className={`font-bold text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Gerenciar Membros da Equipe</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Designers, Videomakers / Editores, Social Medias e Gerentes</p>
            </div>
          </div>

          <button
            onClick={() => setIsTeamModalOpen(false)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">

          {/* Add / Edit Form */}
          {(isAdding || editingUserId) && (
            <form onSubmit={handleSubmit} className={`p-4 rounded-xl border space-y-3 backdrop-blur-md ${
              isDark ? 'bg-white/[0.04] border-white/10' : 'bg-slate-50 border-slate-200 shadow-sm'
            }`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {editingUserId ? 'Editar Membro' : 'Novo Membro da Equipe'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Juliana Mendes"
                    className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                      isDark
                        ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08]'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>E-mail {editingUserId ? '' : '*'}</label>
                  <input
                    type="email"
                    required={!editingUserId}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="juliana.designer@agencia.com"
                    className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                      isDark
                        ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08]'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              {!editingUserId && (
                <div>
                  <label className={`text-xs font-semibold block mb-1 flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Lock className="w-3 h-3" />
                    <span>Senha de acesso * (mín. 6 caracteres)</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                      isDark
                        ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08]'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              )}

              <div>
                <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Papel / Especialidade *</label>
                <select
                  value={papel}
                  onChange={(e) => setPapel(e.target.value as UserRole)}
                  className={`w-full text-xs font-semibold p-2.5 border rounded-xl cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                    isDark
                      ? 'bg-white/[0.05] border-white/10 text-slate-100 focus:bg-[#161922]'
                      : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                >
                  {Object.entries(USER_ROLE_CONFIG).map(([key, val]) => (
                    <option key={key} value={key} className={isDark ? 'bg-[#161922] text-slate-100' : 'bg-white text-slate-900'}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color Picker */}
              <div>
                <label className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Cor do Avatar</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCorAvatar(c)}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                        corAvatar === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-slate-900 ring-indigo-400' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {formError && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${
                  isDark ? 'bg-rose-500/15 border-rose-500/30 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className={`px-3.5 py-1.5 text-xs rounded-xl transition-colors cursor-pointer ${
                    isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Salvando...' : editingUserId ? 'Salvar Alterações' : 'Adicionar Membro'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Add Trigger */}
          {!isAdding && !editingUserId && (
            <button
              onClick={() => setIsAdding(true)}
              className={`w-full flex items-center justify-center gap-1.5 p-3 rounded-xl border border-dashed text-xs font-bold transition-all cursor-pointer ${
                isDark
                  ? 'border-white/20 hover:border-indigo-400 hover:bg-white/[0.04] text-indigo-300'
                  : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50 text-indigo-600'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Membro à Equipe</span>
            </button>
          )}

          {/* List of Members */}
          <div className="space-y-2">
            {users.map((user) => {
              const activeCount = demands.filter(
                (d) => d.responsavel_id === user.id && !isEtapaFinal(d.etapa_id)
              ).length;

              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    currentUser.id === user.id
                      ? isDark ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-indigo-400 bg-indigo-50/70 shadow-xs'
                      : isDark ? 'border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.05]' : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs"
                      style={{ backgroundColor: user.cor_avatar }}
                    >
                      {getInitials(user.nome)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`font-bold text-xs sm:text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{user.nome}</h4>
                        {currentUser.id === user.id && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                            isDark ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-indigo-100 border-indigo-200 text-indigo-700'
                          }`}>
                            VOCÊ
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium ${USER_ROLE_CONFIG[user.papel].badge}`}>
                          {USER_ROLE_CONFIG[user.papel].label}
                        </span>
                        <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {activeCount} demandas ativas
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStartEdit(user)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Editar membro"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {users.length > 1 && currentUser.id !== user.id && (
                      <button
                        onClick={() => {
                          if (confirm(`Deseja remover "${user.nome}" da equipe?`)) {
                            deleteUser(user.id);
                          }
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remover da equipe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
