import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const formsApi = {
  getForms: async () => {
    const { data, error } = await supabase
      .from('forms')
      .select('*, submissions(count)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Format to match old structure
    return data.map(form => ({
      ...form,
      responses: form.submissions ? form.submissions[0].count : 0
    }));
  },
  getFormById: async (id) => {
    const { data, error } = await supabase.from('forms').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  getFormBySlug: async (slug) => {
    const { data, error } = await supabase.from('forms').select('*').eq('slug', slug).single();
    if (error) throw error;
    return data;
  },
  createForm: async (form) => {
    const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
    const { data, error } = await supabase.from('forms').insert([{ ...form, slug }]).select().single();
    if (error) throw error;
    return data;
  },
  updateForm: async (id, form) => {
    const { data, error } = await supabase.from('forms').update(form).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  deleteForm: async (id) => {
    const { error } = await supabase.from('forms').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};

export const submissionsApi = {
  createSubmission: async (slug, formBody) => {
    // First get form ID
    const { data: form } = await supabase.from('forms').select('id, questions').eq('slug', slug).single();
    if (!form) throw new Error('Formulário não encontrado');

    const { data, error } = await supabase.from('submissions').insert([{
      form_id: form.id,
      answers: formBody.answers,
      form_snapshot: form.questions
    }]).select().single();
    
    if (error) throw error;
    return data;
  },
  getSubmissions: async (formId = '', status = '') => {
    let query = supabase.from('submissions').select('*, forms(title, slug)').order('created_at', { ascending: false });
    if (formId) query = query.eq('form_id', formId);
    if (status) query = query.eq('status', status);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  updateStatus: async (id, status) => {
    const { data, error } = await supabase.from('submissions').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  deleteSubmission: async (id) => {
    const { error } = await supabase.from('submissions').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
