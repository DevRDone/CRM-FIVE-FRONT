import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Copy, Power, Trash2, ExternalLink } from 'lucide-react';
import { formsApi } from '../../services/api';
import './FormsManager.css';

export default function FormsManager() {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [formToDelete, setFormToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const data = await formsApi.getForms();
      setForms(data);
    } catch (error) {
      console.error('Error fetching forms:', error);
      alert('Erro ao carregar os formulários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      // Local optimistic update
      setForms(forms.map(f => f.id === id ? { ...f, status: newStatus } : f));
      await formsApi.updateForm(id, { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      fetchForms(); // Revert on failure
    }
  };

  const deleteForm = (id) => {
    setFormToDelete(id);
  };

  const confirmDelete = async () => {
    if (formToDelete) {
      try {
        await formsApi.deleteForm(formToDelete);
        setForms(forms.filter(f => f.id !== formToDelete));
        setFormToDelete(null);
      } catch (error) {
        console.error('Error deleting form:', error);
        alert('Erro ao deletar o formulário');
      }
    }
  };

  const copyLink = (slug) => {
    const url = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copiado para a área de transferência!');
    });
  };

  if (loading) {
    return <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>Carregando formulários...</div>;
  }

  return (
    <div className="glass-panel forms-manager-container">
      <div className="manager-header">
        <div>
          <h2>Meus Formulários</h2>
          <p className="subtitle">Crie e gerencie os formulários públicos de captação.</p>
        </div>
        
        <button className="btn-primary" onClick={() => navigate('/crm/forms/new')}>
          <Plus size={18} /> Novo Formulário
        </button>
      </div>

      <div className="forms-grid">
        {forms.map(form => (
          <div key={form.id} className={`form-card ${form.status}`}>
            <div className="form-card-header">
              <span className={`status-dot ${form.status}`}></span>
              <span className="status-text">{form.status === 'active' ? 'Ativo' : 'Inativo'}</span>
            </div>
            
            <h3 className="form-title">{form.title}</h3>
            
            <div className="form-stats">
              <div className="stat-box">
                <span className="stat-value">{form.responses}</span>
                <span className="stat-label">Respostas</span>
              </div>
              <div className="form-slug">
                <span>/f/{form.slug}</span>
                <button className="btn-icon-small" title="Acessar Formulário" onClick={() => window.open(`/f/${form.slug}`, '_blank')}>
                  <ExternalLink size={14} />
                </button>
                <button className="btn-icon-small" title="Copiar Link" onClick={() => copyLink(form.slug)}>
                  <Copy size={12} />
                </button>
              </div>
            </div>

            <div className="form-card-footer">
              <span className="last-updated">Modificado: {form.lastUpdated}</span>
              <div className="form-actions">
                <button className="btn-icon" title="Editar Perguntas" onClick={() => navigate(`/crm/forms/edit/${form.id}`)}>
                  <Edit2 size={16} />
                </button>
                <button className="btn-icon" title={form.status === 'active' ? "Desativar" : "Ativar"} onClick={() => toggleStatus(form.id, form.status)}>
                  <Power size={16} />
                </button>
                <button className="btn-icon text-danger" title="Excluir" onClick={() => deleteForm(form.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {formToDelete && createPortal(
        <div className="modal-overlay">
          <div className="modal-content glass-panel confirmation-modal">
            <h3 className="modal-title" style={{ color: 'var(--error-color)', marginBottom: '16px' }}>Confirmar Exclusão</h3>
            <p className="modal-text">Você tem certeza que deseja excluir permanentemente este formulário? Esta ação não poderá ser desfeita e todas as respostas serão perdidas.</p>
            <div className="modal-actions" style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setFormToDelete(null)}>Cancelar</button>
              <button className="btn-primary" style={{ background: 'var(--error-color)', borderColor: 'var(--error-color)', boxShadow: '0 0 15px rgba(255, 51, 102, 0.4)' }} onClick={confirmDelete}>Excluir</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
