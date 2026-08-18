import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Archive as ArchiveIcon, MoreVertical, Search, CheckCircle2, Trash2, Power, Inbox } from 'lucide-react';
import { submissionsApi } from '../../services/api';
import SubmissionModal from './SubmissionModal';
import './SubmissionsList.css';

export default function SubmissionsList({ viewType = 'all' }) {
  const [submissions, setSubmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // States for 3-dots menu
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // States for delete modal
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const statusParam = viewType === 'archived' ? 'archived' : '';
      const data = await submissionsApi.getSubmissions('', statusParam);
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [viewType]);

  const extractCandidateInfo = (sub) => {
    let name = 'Candidato Anônimo';
    let email = 'Sem e-mail';
    
    if (sub.form_snapshot && sub.answers) {
      for (const q of sub.form_snapshot) {
        const val = sub.answers[q.id];
        if (val) {
          const lowerLabel = (q.label || '').toLowerCase();
          if (q.type === 'email' || lowerLabel.includes('email') || lowerLabel.includes('e-mail')) {
            email = val;
          } else if (lowerLabel.includes('nome')) {
            name = val;
          }
        }
      }
    }
    return { name, email };
  };

  // Filter local state based on viewType & search
  const filteredSubmissions = submissions.filter(sub => {
    if (viewType === 'recents' && sub.status !== 'new') return false;
    if (viewType === 'archived' && sub.status !== 'archived') return false;
    if (viewType === 'all' && sub.status === 'archived') return false;
    
    if (searchTerm) {
      const { name, email } = extractCandidateInfo(sub);
      if (!name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !email.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new': return <span className="status-badge new"><span className="dot"></span> Novo</span>;
      case 'viewed': return <span className="status-badge viewed"><CheckCircle2 size={12}/> Visto</span>;
      case 'archived': return <span className="status-badge archived">Arquivado</span>;
      default: return null;
    }
  };

  const handleArchive = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'archived' ? 'new' : 'archived';
      await submissionsApi.updateStatus(id, newStatus);
      // Local update
      setSubmissions(submissions.map(s => s.id === id ? { ...s, status: newStatus } : s));
      setOpenMenuId(null);
      window.dispatchEvent(new Event('submissionsUpdated'));
    } catch (error) {
      console.error('Error archiving:', error);
    }
  };

  const confirmDelete = async () => {
    if (deleteCandidate) {
      try {
        await submissionsApi.deleteSubmission(deleteCandidate.id);
        setSubmissions(submissions.filter(s => s.id !== deleteCandidate.id));
        setDeleteCandidate(null);
        window.dispatchEvent(new Event('submissionsUpdated'));
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const handleView = async (sub) => {
    setSelectedSubmission(sub);
    if (sub.status === 'new') {
      try {
        await submissionsApi.updateStatus(sub.id, 'viewed');
        setSubmissions(submissions.map(s => s.id === sub.id ? { ...s, status: 'viewed' } : s));
        window.dispatchEvent(new Event('submissionsUpdated'));
      } catch (error) {
        console.error('Error marking as viewed:', error);
      }
    }
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  return (
    <div className="glass-panel submissions-container">
      <div className="list-header">
        <div>
          <h2>
            {viewType === 'recents' && 'Candidatos Recentes'}
            {viewType === 'all' && 'Todos os Candidatos'}
            {viewType === 'archived' && 'Candidatos Arquivados'}
          </h2>
          <p className="subtitle">Gerencie e visualize as respostas recebidas.</p>
        </div>
        
        <div className="list-actions">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="submissions-table">
          <thead>
            <tr>
              <th>Candidato</th>
              <th>Origem (Formulário)</th>
              <th>Data</th>
              <th>Status</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="empty-state">Carregando candidatos...</td>
              </tr>
            ) : filteredSubmissions.length > 0 ? (
              filteredSubmissions.map(sub => {
                const { name, email } = extractCandidateInfo(sub);
                const dateStr = new Date(sub.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
                
                return (
                  <tr key={sub.id} className={`status-${sub.status}`}>
                    <td>
                      <div className="candidate-info">
                        <div className="avatar">{name.charAt(0).toUpperCase()}</div>
                        <div>
                          <strong>{name}</strong>
                          <span className="candidate-email">{email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{sub.forms?.title || 'Formulário Desconhecido'}</td>
                    <td>{dateStr}</td>
                    <td>{getStatusBadge(sub.status)}</td>
                    <td className="text-right">
                      <div className="action-buttons">
                        <button className="btn-icon" title="Ver Respostas" onClick={() => handleView(sub)}>
                          <Eye size={18} />
                        </button>
                        
                        <div className="menu-container">
                          <button className="btn-icon" onClick={(e) => toggleMenu(e, sub.id)}>
                            <MoreVertical size={18} />
                          </button>
                          
                          {openMenuId === sub.id && (
                            <div className="dropdown-menu">
                              <button onClick={() => handleArchive(sub.id, sub.status)}>
                                {sub.status === 'archived' ? <Power size={14}/> : <ArchiveIcon size={14} />}
                                {sub.status === 'archived' ? 'Desarquivar' : 'Arquivar'}
                              </button>
                              <button className="text-danger" onClick={() => setDeleteCandidate(sub)}>
                                <Trash2 size={14} />
                                Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="empty-state-cell">
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Inbox size={32} />
                    </div>
                    <h3>Nenhum candidato encontrado</h3>
                    <p>Ainda não há respostas ou os filtros não retornaram resultados.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Modal View Submission */}
      {selectedSubmission && (
        <SubmissionModal 
          submission={selectedSubmission} 
          candidateInfo={extractCandidateInfo(selectedSubmission)}
          onClose={() => setSelectedSubmission(null)}
          onArchive={(id) => {
            handleArchive(id, selectedSubmission.status);
            setSelectedSubmission(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && createPortal(
        <div className="delete-modal-overlay">
          <div className="delete-modal-content glass-panel">
            <h3 className="delete-modal-title">Excluir Resposta</h3>
            <p>Tem certeza que deseja excluir a resposta de <strong>{extractCandidateInfo(deleteCandidate).name}</strong>? Esta ação não pode ser desfeita.</p>
            <div className="delete-modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteCandidate(null)}>Cancelar</button>
              <button className="btn-primary danger" onClick={confirmDelete}>Sim, excluir permanentemente</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
