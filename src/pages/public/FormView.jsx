import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Fingerprint, Phone, Power, FileUp } from 'lucide-react';
import { formsApi, submissionsApi } from '../../services/api';
import './FormView.css';

export default function FormView() {
  const { slug } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const data = await formsApi.getFormBySlug(slug);
        setForm(data);
      } catch (error) {
        console.error('Error fetching form:', error);
        setForm({ status: 'inactive' });
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [slug]);

  const handleAnswerChange = (value, type) => {
    let formattedValue = value;
    
    if (type === 'phone') {
      formattedValue = formattedValue.replace(/\D/g, '');
      formattedValue = formattedValue.slice(0, 11);
      formattedValue = formattedValue.replace(/^(\d{2})(\d)/g, '($1) $2');
      formattedValue = formattedValue.replace(/(\d)(\d{4})$/, '$1-$2');
    } else if (type === 'cpf') {
      formattedValue = formattedValue.replace(/\D/g, '');
      formattedValue = formattedValue.slice(0, 11);
      formattedValue = formattedValue.replace(/(\d{3})(\d)/, '$1.$2');
      formattedValue = formattedValue.replace(/(\d{3})(\d)/, '$1.$2');
      formattedValue = formattedValue.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    setAnswers({ ...answers, [currentQuestion.id]: formattedValue });
  };

  const nextStep = () => {
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      alert('Este campo é obrigatório.');
      return;
    }
    
    // Add length validation for phone and CPF
    if (currentQuestion.type === 'phone' && answers[currentQuestion.id] && answers[currentQuestion.id].length < 14) {
      alert('Por favor, digite um número de telefone válido.');
      return;
    }

    if (currentQuestion.type === 'cpf' && answers[currentQuestion.id] && answers[currentQuestion.id].length < 14) {
      alert('Por favor, digite um CPF válido.');
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitForm();
    }
  };

  const submitForm = async () => {
    try {
      await submissionsApi.createSubmission(slug, { answers });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Erro ao enviar suas respostas. Tente novamente.');
    }
  };

  if (loading) {
    return <div className="public-form-container"><div className="glass-panel" style={{padding: '32px'}}>Carregando formulário...</div></div>;
  }

  const totalSteps = form.questions ? form.questions.length : 0;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  const currentQuestion = form.questions ? form.questions[currentStep] : null;

  if (form.status === 'inactive') {
    return (
      <div className="public-form-container success-state">
        <div className="success-card glass-panel" style={{ borderColor: 'var(--border-color)' }}>
          <img 
            src="/logo_five.PNG" 
            alt="Five Forms Logo" 
            style={{ height: '140px', marginBottom: '0.75rem' }} 
          />
          <h2>Vaga Indisponível</h2>
          <p>O processo seletivo para esta vaga já foi encerrado ou ela não está mais disponível no momento.</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="public-form-container success-state">
        <div className="success-card glass-panel">
          <CheckCircle2 size={64} className="text-accent mb-4" />
          <h2>Formulário Enviado!</h2>
          <p>Suas respostas foram registradas com sucesso. Agradecemos o seu tempo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-form-container">
      <div className="form-content-wrapper">
        <header className="public-form-header">
          <h1 className="logo-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
            <img src="/logo_five.PNG" alt="Five" style={{ height: '40px' }} />
            <span className="neon-dot" style={{ marginLeft: '-4px' }}>.</span>
          </h1>
          <h2 className="form-title">{form.title}</h2>
          <p className="form-description">{form.description}</p>
        </header>

        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="question-display-area glass-panel">
          <div className="question-counter">
            Pergunta {currentStep + 1} de {totalSteps}
          </div>
          
          <h3 className="question-label">
            {currentQuestion.label} {currentQuestion.required && <span className="text-accent">*</span>}
          </h3>

          <div className="question-input-area">
            {currentQuestion.type === 'short_text' && (
              <input 
                type="text"
                className="public-input no-icon"
                placeholder="Digite sua resposta curta..."
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(e.target.value, 'short_text')}
                autoFocus
              />
            )}
            
            {currentQuestion.type === 'long_text' && (
              <textarea 
                className="public-textarea"
                placeholder="Digite sua resposta aqui..."
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(e.target.value, 'long_text')}
                autoFocus
              />
            )}
            
            {currentQuestion.type === 'phone' && (
              <div className="input-with-icon">
                <Phone size={20} className="input-icon" />
                <input 
                  type="tel"
                  className="public-input"
                  placeholder="(11) 99999-9999"
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value, 'phone')}
                  autoFocus
                />
              </div>
            )}
            
            {currentQuestion.type === 'cpf' && (
              <div className="input-with-icon">
                <Fingerprint size={20} className="input-icon" />
                <input 
                  type="text"
                  className="public-input"
                  placeholder="000.000.000-00"
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value, 'cpf')}
                  autoFocus
                />
              </div>
            )}
            
            {currentQuestion.type === 'single_choice' && (
              <div className="public-options-list">
                {currentQuestion.options.map((opt, idx) => (
                  <label key={idx} className={`public-option-card ${answers[currentQuestion.id] === opt ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name={`question_${currentQuestion.id}`}
                      value={opt}
                      checked={answers[currentQuestion.id] === opt}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                    />
                    <div className="radio-circle"></div>
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            )}
            
            {currentQuestion.type === 'multiple_choice' && (
              <div className="public-options-list">
                {currentQuestion.options.map((opt, idx) => {
                  const currentAnswers = answers[currentQuestion.id] || [];
                  const isChecked = currentAnswers.includes(opt);
                  
                  return (
                    <label key={idx} className={`public-option-card ${isChecked ? 'selected' : ''}`}>
                      <input 
                        type="checkbox" 
                        value={opt}
                        checked={isChecked}
                        onChange={(e) => {
                          let newArr = [...currentAnswers];
                          if (e.target.checked) newArr.push(opt);
                          else newArr = newArr.filter(item => item !== opt);
                          handleAnswerChange(newArr);
                        }}
                      />
                      <div className="checkbox-square"></div>
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'file_pdf' && (
              <div className="public-file-upload">
                <label 
                  className={`public-option-card ${answers[currentQuestion.id] ? 'selected' : ''}`}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '16px', borderStyle: 'dashed' }}
                >
                  <FileUp size={48} className={answers[currentQuestion.id] ? 'text-accent' : 'text-secondary'} />
                  <span style={{ fontSize: '18px', fontWeight: '500', color: answers[currentQuestion.id] ? 'var(--accent-color)' : 'var(--text-primary)', textAlign: 'center' }}>
                    {answers[currentQuestion.id] ? 'Currículo Anexado com Sucesso!' : 'Clique aqui para anexar seu Currículo (PDF)'}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Tamanho máximo: 2MB</span>
                  
                  <input 
                    type="file" 
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) {
                        alert('O arquivo é muito grande. O tamanho máximo permitido é 2MB para não sobrecarregar o sistema.');
                        e.target.value = '';
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        handleAnswerChange(reader.result, 'file_pdf');
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
            )}
          </div>
          
          <div className="public-form-actions">
            <button className="btn-primary" onClick={nextStep}>
              {currentStep < totalSteps - 1 ? 'Próxima' : 'Enviar Formulário'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
