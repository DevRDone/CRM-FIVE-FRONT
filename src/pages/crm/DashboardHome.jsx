import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Users, FileText, ArrowRight, TrendingUp } from 'lucide-react';
import { formsApi, submissionsApi } from '../../services/api';
import './DashboardHome.css';

export default function DashboardHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeForms: 0,
    totalSubmissions: 0,
    newSubmissions: 0
  });
  const [recentForms, setRecentForms] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [forms, submissions] = await Promise.all([
          formsApi.getForms(),
          submissionsApi.getSubmissions()
        ]);

        const activeFormsCount = forms.filter(f => f.status === 'active').length;
        const newSubsCount = submissions.filter(s => s.status === 'new').length;

        setStats({
          activeForms: activeFormsCount,
          totalSubmissions: submissions.length,
          newSubmissions: newSubsCount
        });

        // Get top 3 forms by responses
        const sortedForms = [...forms].sort((a, b) => b.responses - a.responses).slice(0, 3);
        setRecentForms(sortedForms);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="glass-panel p-8 text-center text-secondary">Carregando painel de análises...</div>;
  }

  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <h2>Visão Geral</h2>
        <p className="subtitle">Acompanhe o desempenho dos seus formulários em tempo real.</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card glass-panel">
          <div className="kpi-icon blue"><FileText size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Formulários Ativos</span>
            <span className="kpi-value">{stats.activeForms}</span>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon green"><Users size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Total de Respostas</span>
            <span className="kpi-value">{stats.totalSubmissions}</span>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon purple"><Activity size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Novas Respostas (Não Lidas)</span>
            <span className="kpi-value">{stats.newSubmissions}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-widgets">
        <div className="widget-card glass-panel">
          <div className="widget-header">
            <div className="widget-title">
              <TrendingUp size={20} className="text-accent" />
              <h3>Formulários Mais Populares</h3>
            </div>
            <button className="btn-text-small" onClick={() => navigate('/crm/forms')}>Ver Todos <ArrowRight size={14}/></button>
          </div>
          
          <div className="widget-content">
            {recentForms.length > 0 ? (
              recentForms.map(form => (
                <div key={form.id} className="popular-form-row">
                  <div className="pf-info">
                    <span className="pf-title">{form.title}</span>
                    <span className="pf-slug">/f/{form.slug}</span>
                  </div>
                  <div className="pf-badge">
                    {form.responses} respostas
                  </div>
                </div>
              ))
            ) : (
              <p className="text-secondary text-sm">Nenhum formulário criado ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
