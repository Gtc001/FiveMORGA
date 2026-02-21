import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Users, Plus, Shield, User, Trash2, Edit3, X, Save, Key, AlertCircle,
} from 'lucide-react';

export default function AdminPage() {
  const { showToast } = useOutletContext();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadUsers = async () => {
    try {
      const data = await api.admin.listUsers();
      setUsers(data);
    } catch (err) { showToast(err.message, 'error'); }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleSave = async (data) => {
    try {
      if (data.id) {
        await api.admin.updateUser(data.id, data);
        showToast('Utilisateur mis à jour');
      } else {
        await api.admin.createUser(data);
        showToast('Utilisateur créé');
      }
      setShowModal(false);
      setEditUser(null);
      loadUsers();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.admin.deleteUser(id);
      showToast('Utilisateur supprimé');
      setDeleteConfirm(null);
      loadUsers();
    } catch (err) { showToast(err.message, 'error'); }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="w-6 h-6 text-red-400" />
              Administration
            </h1>
            <p className="text-sm text-slate-500 mt-1">Gestion des utilisateurs et des rôles</p>
          </div>
          <button onClick={() => { setEditUser(null); setShowModal(true); }} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Nouvel utilisateur
          </button>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_160px_100px] gap-4 px-6 py-3 border-b border-dark-400/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Utilisateur</span>
            <span>Rôle</span>
            <span>Créé le</span>
            <span className="text-right">Actions</span>
          </div>

          {users.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-600">Aucun utilisateur</div>
          ) : (
            users.map((u) => (
              <div key={u.id} className="grid grid-cols-[1fr_120px_160px_100px] gap-4 px-6 py-4 border-b border-dark-400/30 items-center hover:bg-dark-600/30 transition-all group">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold uppercase ${
                    u.role === 'admin' ? 'bg-red-500/10 text-red-400' : 'bg-dark-500 text-slate-400'
                  }`}>
                    {u.username[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{u.username}</p>
                    {u.id === currentUser?.id && <span className="text-[10px] text-fivem">Vous</span>}
                  </div>
                </div>

                <div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${
                    u.role === 'admin'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-dark-500 text-slate-400 border border-dark-400'
                  }`}>
                    {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {u.role === 'admin' ? 'Admin' : 'Membre'}
                  </span>
                </div>

                <span className="text-xs text-slate-500">
                  {new Date(u.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>

                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => { setEditUser(u); setShowModal(true); }}
                    className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-dark-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {u.id !== currentUser?.id && (
                    <button
                      onClick={() => setDeleteConfirm({ id: u.id, username: u.username })}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <UserModal
          user={editUser}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditUser(null); }}
        />
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Supprimer l'utilisateur"
        message={`L'utilisateur « ${deleteConfirm?.username} » sera supprimé définitivement.`}
        confirmLabel="Supprimer"
        confirmColor="red"
        onConfirm={async () => {
          await handleDelete(deleteConfirm.id);
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

function UserModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({
    username: user?.username || '',
    password: '',
    role: user?.role || 'member',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim()) return;
    if (!user && !form.password) return;
    setLoading(true);
    const data = { ...form };
    if (user) {
      data.id = user.id;
      if (!data.password) delete data.password;
    }
    await onSave(data);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md glass rounded-2xl modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="text-lg font-semibold text-white">{user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-dark-500 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              <Users className="w-3 h-3 inline mr-1" />
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="input-field"
              placeholder="username"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              <Key className="w-3 h-3 inline mr-1" />
              {user ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field"
              placeholder={user ? '••••••••' : 'Mot de passe'}
              {...(!user && { required: true })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Rôle</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'member' })}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  form.role === 'member'
                    ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                    : 'border-dark-400 text-slate-500 hover:border-dark-300'
                }`}
              >
                <User className="w-4 h-4" />
                Membre
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'admin' })}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  form.role === 'admin'
                    ? 'border-red-500/30 bg-red-500/10 text-red-400'
                    : 'border-dark-400 text-slate-500 hover:border-dark-300'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
            </div>
          </div>

          {user && (
            <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-400/80">Les changements de rôle prennent effet immédiatement.</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-dark-400/50">
            <button type="button" onClick={onClose} className="btn-ghost text-sm">Annuler</button>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {user ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
