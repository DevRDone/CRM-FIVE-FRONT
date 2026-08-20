import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Phone, Calendar, Archive, Trash2, ExternalLink } from 'lucide-react';
import './SubmissionModal.css';

export default function SubmissionModal({ submission, candidateInfo, onClose, onArchive }) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!submission) return null;

  const dateStr = new Date(submission.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  const formTitle = submission.forms?.title || 'Formulário Desconhecido';
  
  // Transform answers object + snapshot to array format
  const mappedAnswers = (submission.form_snapshot || []).map(q => {
    return {
      question: q.label,
      type: q.type,
      answer: submission.answers[q.id] || ''
    };
  });

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="modal-header">
          <div className="modal-header-info">
            <span className="modal-form-badge">{formTitle}</span>
            <h2>{candidateInfo.name}</h2>
            <div className="modal-meta">
              <span className="meta-item"><Calendar size={14}/> {dateStr}</span>
              <span className="meta-item"><Mail size={14}/> {candidateInfo.email}</span>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}><X size={24} /></button>
        </header>

        {/* Content (Answers) */}
        <div className="modal-content">
          <h3 className="section-title">Respostas do Formulário</h3>
          
          <div className="answers-grid">
            {mappedAnswers.length > 0 ? (
              mappedAnswers.map((ans, idx) => {
                let displayAnswer = ans.answer;
                if (Array.isArray(displayAnswer)) {
                  displayAnswer = displayAnswer.join(', ');
                }

                return (
                  <div key={idx} className={`answer-card ${ans.type === 'long_text' ? 'full-width' : ''}`}>
                    <span className="answer-label">{ans.question || 'Pergunta sem título'}</span>
                    <div className="answer-value">
                      {ans.type === 'file_pdf' && displayAnswer ? (
                        <a href={displayAnswer} download="curriculo.pdf" className="link-answer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(51,255,102,0.1)', color: 'var(--accent-color)', borderRadius: '6px', textDecoration: 'none' }}>
                          Baixar PDF <ExternalLink size={14} />
                        </a>
                      ) : typeof displayAnswer === 'string' && displayAnswer.startsWith('http') ? (
                        <a href={displayAnswer} target="_blank" rel="noreferrer" className="link-answer">
                          Acessar Link <ExternalLink size={14} />
                        </a>
                      ) : (
                        displayAnswer || '-'
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="no-data">Nenhuma resposta registrada (ou erro no formato).</p>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <footer className="modal-footer">
          {submission.status !== 'archived' ? (
            <button className="btn-secondary" onClick={() => onArchive(submission.id)}>
              <Archive size={16} /> Arquivar Candidato
            </button>
          ) : (
            <button className="btn-danger">
              <Trash2 size={16} /> Excluir Definitivamente
            </button>
          )}
          
          <div className="footer-right">
            <button className="btn-primary" onClick={onClose}>Fechar Resumo</button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
}
