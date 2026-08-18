import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formsApi } from '../../services/api';
import { ArrowLeft, Plus, Save, GripVertical, Trash2, Settings, Type, AlignLeft, CheckSquare, CircleDot, Phone, Fingerprint } from 'lucide-react';
import './FormBuilder.css';

const QUESTION_TYPES = [
  { id: 'short_text', icon: Type, label: 'Resposta Curta' },
  { id: 'long_text', icon: AlignLeft, label: 'Parágrafo' },
  { id: 'phone', icon: Phone, label: 'Telefone' },
  { id: 'cpf', icon: Fingerprint, label: 'CPF' },
  { id: 'single_choice', icon: CircleDot, label: 'Múltipla Escolha (1 opção)' },
  { id: 'multiple_choice', icon: CheckSquare, label: 'Caixas de Seleção (Várias opções)' }
];

export default function FormBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formTitle, setFormTitle] = useState(isEditing ? 'Vaga Desenvolvedor Frontend' : 'Novo Formulário');
  const [questions, setQuestions] = useState([
    { id: 'q_1', type: 'long_text', label: 'Descreva seu objetivo', required: true, options: [] },
    { id: 'q_2', type: 'single_choice', label: 'Nível de Experiência', required: true, options: ['Júnior', 'Pleno', 'Sênior'] }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions, 
      { id: `q_${Date.now()}`, type: 'long_text', label: '', required: false, options: [] }
    ]);
  };

  const updateQuestion = (qId, field, value) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, [field]: value } : q));
  };

  const removeQuestion = (qId) => {
    setQuestions(questions.filter(q => q.id !== qId));
  };

  const saveForm = async () => {
    try {
      setIsSaving(true);
      await formsApi.createForm({
        title: formTitle,
        questions,
        status: 'active'
      });
      navigate('/crm/forms');
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Erro ao salvar o formulário');
    } finally {
      setIsSaving(false);
    }
  };

  // Drag and Drop handlers
  const [draggedQuestionIndex, setDraggedQuestionIndex] = useState(null);

  const handleDragStart = (index) => {
    setDraggedQuestionIndex(index);
  };

  const handleDragEnter = (index) => {
    if (draggedQuestionIndex === null || draggedQuestionIndex === index) return;
    const newQuestions = [...questions];
    const draggedItem = newQuestions[draggedQuestionIndex];
    
    // Remove from old position
    newQuestions.splice(draggedQuestionIndex, 1);
    // Insert into new position
    newQuestions.splice(index, 0, draggedItem);
    
    setDraggedQuestionIndex(index);
    setQuestions(newQuestions);
  };

  const handleDragEnd = () => {
    setDraggedQuestionIndex(null);
  };

  return (
    <div className="form-builder-container">
      {/* Header */}
      <header className="builder-header glass-panel">
        <div className="builder-header-left">
          <button className="btn-icon" onClick={() => navigate('/crm/forms')}><ArrowLeft size={20}/></button>
          <div className="builder-title-group">
            <span className="builder-badge">Construindo Formulário</span>
            <input 
              type="text" 
              className="form-title-input" 
              value={formTitle} 
              onChange={e => setFormTitle(e.target.value)}
              placeholder="Título do Formulário"
            />
          </div>
        </div>
        <div className="builder-header-right">
          <button className="btn-secondary" onClick={() => navigate('/crm/forms')}>Cancelar</button>
          <button className="btn-primary" onClick={saveForm}><Save size={18}/> Salvar</button>
        </div>
      </header>

      {/* Editor Area */}
      <div className="builder-workspace">
        <div className="questions-list">
          {questions.map((q, index) => (
            <div 
              key={q.id} 
              className={`question-editor-card glass-panel ${draggedQuestionIndex === index ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                handleDragStart(index);
              }}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()} // Required to allow dropping
            >
              <div className="drag-handle"><GripVertical size={20}/></div>
              
              <div className="question-editor-content">
                <div className="question-row-1">
                  <input 
                    type="text" 
                    className="question-label-input" 
                    value={q.label}
                    onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                    placeholder="Digite a sua pergunta aqui..."
                  />
                  
                  <select 
                    className="question-type-select"
                    value={q.type}
                    onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                  >
                    {QUESTION_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="question-preview">
                  {q.type === 'short_text' && <input type="text" disabled placeholder="Resposta curta" className="preview-input" />}
                  {q.type === 'phone' && <input type="text" disabled placeholder="(11) 99999-9999" className="preview-input" />}
                  {q.type === 'cpf' && <input type="text" disabled placeholder="000.000.000-00" className="preview-input" />}
                  {q.type === 'long_text' && <textarea disabled placeholder="Texto longo de resposta" className="preview-textarea" />}
                  {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
                    <div className="options-editor">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="option-row">
                          {q.type === 'single_choice' ? <CircleDot size={16} className="text-secondary"/> : <CheckSquare size={16} className="text-secondary"/>}
                          <input 
                            type="text" 
                            value={opt} 
                            onChange={(e) => {
                              const newOpts = [...q.options];
                              newOpts[optIndex] = e.target.value;
                              updateQuestion(q.id, 'options', newOpts);
                            }}
                            className="option-input"
                          />
                          <button className="btn-icon-small" onClick={() => {
                            const newOpts = q.options.filter((_, i) => i !== optIndex);
                            updateQuestion(q.id, 'options', newOpts);
                          }}><X size={14}/></button>
                        </div>
                      ))}
                      <div className="add-option-row" onClick={() => updateQuestion(q.id, 'options', [...q.options, `Opção ${q.options.length + 1}`])}>
                        <Plus size={16} className="text-secondary"/>
                        <span>Adicionar opção</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="question-footer">
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={q.required} 
                      onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                    />
                    <span className="slider"></span>
                    <span className="toggle-label">Obrigatório</span>
                  </label>
                  
                  <div className="question-actions">
                    <button className="btn-icon" title="Excluir Pergunta" onClick={() => removeQuestion(q.id)}>
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button className="btn-add-question" onClick={addQuestion}>
            <Plus size={24}/>
            <span>Nova Pergunta</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Temporary X icon since I forgot to import it above in the lucide-react import
const X = ({size}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
