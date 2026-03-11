import { useState } from 'react';
import { Plus, Briefcase, Users, Eye } from 'lucide-react';
import { mockJobs, mockCandidates } from '../../data/mockData';
import { JobPosting, Candidate } from '../../types';
import Badge from '../../components/shared/Badge';
import Modal from '../../components/shared/Modal';
import { formatDate, generateId } from '../../utils/helpers';

const emptyJob: Partial<JobPosting> = { title: '', department: '', experience: '', salaryRange: '', skills: [], status: 'open' };

export default function Recruitment() {
  const [jobs, setJobs] = useState<JobPosting[]>(mockJobs);
  const [candidates] = useState<Candidate[]>(mockCandidates);
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates'>('jobs');
  const [modal, setModal] = useState<'add-job' | 'view-job' | null>(null);
  const [selected, setSelected] = useState<JobPosting | null>(null);
  const [form, setForm] = useState<Partial<JobPosting>>(emptyJob);
  const [skillInput, setSkillInput] = useState('');

  const addJob = () => {
    setJobs(prev => [...prev, { ...form, id: generateId(), applicants: 0, postedOn: new Date().toISOString().split('T')[0] } as JobPosting]);
    setModal(null);
    setForm(emptyJob);
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setForm(p => ({ ...p, skills: [...(p.skills || []), skillInput.trim()] }));
      setSkillInput('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Recruitment</h1><p className="page-subtitle">Manage job postings and candidates</p></div>
        <button onClick={() => { setForm(emptyJob); setModal('add-job'); }} className="btn-primary"><Plus size={16} /> Post Job</button>
      </div>

      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab('jobs')} className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}>Job Postings ({jobs.length})</button>
        <button onClick={() => setActiveTab('candidates')} className={`tab-btn ${activeTab === 'candidates' ? 'active' : ''}`}>Candidates ({candidates.length})</button>
      </div>

      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map(job => (
            <div key={job.id} className="card hover:shadow-card-hover transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Briefcase size={18} className="text-primary-600" />
                </div>
                <Badge status={job.status} />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{job.title}</h3>
              <p className="text-sm text-slate-500 mb-3">{job.department} · {job.experience}</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {job.skills.slice(0, 3).map(s => (
                  <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">{s}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-slate-500"><Users size={13} />{job.applicants} applicants</span>
                <span className="font-semibold text-slate-700">{job.salaryRange}</span>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <button onClick={() => { setSelected(job); setModal('view-job'); }} className="btn-secondary flex-1 justify-center py-2 text-xs">View Details</button>
                <button className="btn-primary flex-1 justify-center py-2 text-xs">View Applicants</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'candidates' && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="table-header">Candidate</th>
                  <th className="table-header">Job</th>
                  <th className="table-header">Experience</th>
                  <th className="table-header">Skills</th>
                  <th className="table-header">Applied On</th>
                  <th className="table-header">Stage</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {candidates.map(c => {
                  const job = jobs.find(j => j.id === c.jobId);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="table-cell">
                        <p className="font-semibold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.email}</p>
                      </td>
                      <td className="table-cell text-sm text-slate-600">{job?.title || '-'}</td>
                      <td className="table-cell text-sm text-slate-600">{c.experience}</td>
                      <td className="table-cell">
                        <div className="flex flex-wrap gap-1">
                          {c.skills.map(s => <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{s}</span>)}
                        </div>
                      </td>
                      <td className="table-cell text-sm text-slate-500">{formatDate(c.appliedOn)}</td>
                      <td className="table-cell"><Badge status={c.status} /></td>
                      <td className="table-cell">
                        <button className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"><Eye size={12} /> View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      <Modal isOpen={modal === 'add-job'} onClose={() => setModal(null)} title="Post New Job">
        <div className="space-y-4">
          <div><label className="label">Job Title *</label><input className="input" value={form.title || ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
          <div><label className="label">Department *</label>
            <select className="input" value={form.department || ''} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}>
              <option value="">Select department</option>
              {['Engineering', 'HR', 'Marketing', 'Finance', 'Design'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Experience</label><input className="input" placeholder="e.g. 3-5 years" value={form.experience || ''} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} /></div>
            <div><label className="label">Salary Range</label><input className="input" placeholder="e.g. ₹12L - ₹18L" value={form.salaryRange || ''} onChange={e => setForm(p => ({ ...p, salaryRange: e.target.value }))} /></div>
          </div>
          <div>
            <label className="label">Skills</label>
            <div className="flex gap-2 mb-2">
              <input className="input" placeholder="Add a skill" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} />
              <button onClick={addSkill} className="btn-secondary px-3">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.skills?.map(s => (
                <span key={s} className="flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-semibold">
                  {s}
                  <button onClick={() => setForm(p => ({ ...p, skills: p.skills?.filter(sk => sk !== s) }))} className="hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status || 'open'} onChange={e => setForm(p => ({ ...p, status: e.target.value as JobPosting['status'] }))}>
              <option value="open">Open</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={addJob} className="btn-primary flex-1 justify-center">Post Job</button>
        </div>
      </Modal>
    </div>
  );
}
