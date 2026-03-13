import { useState } from 'react';
import { Plus, Briefcase, Users, Eye } from 'lucide-react';
import { mockJobs, mockCandidates } from '../../data/mockData';
import { JobPosting, Candidate } from '../../types';
import Badge from '../../components/shared/Badge';
import Modal from '../../components/shared/Modal';
import { formatDate, generateId } from '../../utils/helpers';
import Button from '../../components/shared/Button';
import InputField from '../../components/shared/InputField';
import Select from '../../components/shared/Select';
import Table from '../../components/shared/Table';

const emptyJob: Partial<JobPosting> = { title: '', department: '', experience: '', salaryRange: '', skills: [], status: 'open' };

export default function Recruitment() {
  const [jobs, setJobs] = useState<JobPosting[]>(mockJobs);
  const [candidates] = useState<Candidate[]>(mockCandidates);
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates'>('jobs');
const [modal, setModal] = useState<'add-job' | 'view-job' | 'view-applicants' | null>(null);
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
 const columns = [
  {
    header: "Candidate",
    render: (c: Candidate) => (
      <div>
        <p className="font-semibold text-slate-900">{c.name}</p>
        <p className="text-xs text-slate-400">{c.email}</p>
      </div>
    ),
  },
  {
    header: "Job",
    render: (c: Candidate) => {
      const job = jobs.find(j => j.id === c.jobId);
      return <span className="text-sm text-slate-600">{job?.title || '-'}</span>;
    },
  },
  {
    header: "Experience",
    render: (c: Candidate) => <span className="text-sm text-slate-600">{c.experience}</span>,
  },
  {
    header: "Skills",
    render: (c: Candidate) => (
      <div className="flex flex-wrap gap-1">
        {c.skills.map(s => <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{s}</span>)}
      </div>
    ),
  },
  {
    header: "Applied On",
    render: (c: Candidate) => <span className="text-sm text-slate-500">{formatDate(c.appliedOn)}</span>,
  },
  {
    header: "Stage",
    render: (c: Candidate) => <Badge status={c.status} />,
  },
  {
    header: "Actions",
    render: (c: Candidate) => (
      <Button className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"><Eye size={12} /> View</Button>
    ),
  },
];  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Recruitment</h1><p className="page-subtitle">Manage job postings and candidates</p></div>
        <Button onClick={() => { setForm(emptyJob); setModal('add-job'); }} className="btn-primary"><Plus size={16} /> Post Job</Button>
      </div>

      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <Button onClick={() => setActiveTab('jobs')} className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}>Job Postings ({jobs.length})</Button>
        <Button onClick={() => setActiveTab('candidates')} className={`tab-btn ${activeTab === 'candidates' ? 'active' : ''}`}>Candidates ({candidates.length})</Button >
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
                <Button onClick={() => { setSelected(job); setModal('view-job'); }} className="btn-secondary flex-1 justify-center py-2 text-xs">View Details</Button>
              <Button
  onClick={() => {
    setSelected(job);
    setModal('view-applicants');
  }}
  className="btn-primary flex-1 justify-center py-2 text-xs"
>
  View Applicants
</Button>
              </div>
            </div>
          ))}
        </div>
      )}

{activeTab === "candidates" && (
  <Table
    columns={columns}
    data={candidates}
    rowsPerPage={5}
    emptyMessage="No candidates found"
  />
)}

      {/* Add Job Modal */}
      <Modal isOpen={modal === 'add-job'} onClose={() => setModal(null)} title="Post New Job">
        <div className="space-y-4">
<InputField
  label="Job Title *"
  placeholder="Enter job title"
  value={form.title || ""}
  onChange={(e) =>
    setForm((p) => ({ ...p, title: e.target.value }))
  }
/>
          <div><label className="label">Department *</label>
       <Select
  label="Department *"
  value={form.department || ""}
  onChange={(val) =>
    setForm((p) => ({ ...p, department: val }))
  }
  options={[
    { label: "Engineering", value: "Engineering" },
    { label: "HR", value: "HR" },
    { label: "Marketing", value: "Marketing" },
    { label: "Finance", value: "Finance" },
    { label: "Design", value: "Design" },
  ]}
/>
          </div>
          <div className="grid grid-cols-2 gap-4">
<InputField
  label="Experience"
  placeholder="e.g. 3-5 years"
  value={form.experience || ""}
  onChange={(e) =>
    setForm((p) => ({ ...p, experience: e.target.value }))
  }
/>
         <InputField
  label="Salary Range"
  placeholder="e.g. ₹12L - ₹18L"
  value={form.salaryRange || ""}
  onChange={(e) =>
    setForm((p) => ({ ...p, salaryRange: e.target.value }))
  }
/>
          </div>
          <div>
            <label className="label">Skills</label>
            <div className="flex gap-2 mb-2">
             <InputField
  placeholder="Add a skill"
  value={skillInput}
  onChange={(e) => setSkillInput(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && addSkill()}
/>
              <Button onClick={addSkill} className="btn-secondary px-3">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.skills?.map(s => (
                <span key={s} className="flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-semibold">
                  {s}
                  <Button onClick={() => setForm(p => ({ ...p, skills: p.skills?.filter(sk => sk !== s) }))} className="hover:text-red-500">×</Button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Status</label>
           <Select
  label="Status"
  value={form.status || "open"}
 onChange={(val) =>
  setForm((p) => ({
    ...p,
    status: val as JobPosting["status"],
  }))
}
  options={[
    { label: "Open", value: "open" },
    { label: "Draft", value: "draft" },
    { label: "Closed", value: "closed" },
  ]}
/>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">Cancel</Button>
          <Button onClick={addJob} className="btn-primary flex-1 justify-center">Post Job</Button>
        </div>
      </Modal>
      {/* View Job Details */}
<Modal
  isOpen={modal === 'view-job'}
  onClose={() => setModal(null)}
  title="Job Details"
>
  {selected && (
    <div className="space-y-3">
      <p><b>Title:</b> {selected.title}</p>
      <p><b>Department:</b> {selected.department}</p>
      <p><b>Experience:</b> {selected.experience}</p>
      <p><b>Salary:</b> {selected.salaryRange}</p>

      <div>
        <b>Skills:</b>
        <div className="flex flex-wrap gap-2 mt-1">
          {selected.skills.map(skill => (
            <span
              key={skill}
              className="px-2 py-1 bg-slate-100 rounded text-xs"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <p><b>Status:</b> {selected.status}</p>
      <p><b>Posted On:</b> {formatDate(selected.postedOn)}</p>
      <p><b>Applicants:</b> {selected.applicants}</p>
    </div>
  )}
</Modal>
{/* View Applicants */}
<Modal
  isOpen={modal === 'view-applicants'}
  onClose={() => setModal(null)}
  title="Applicants"
>
  {selected && (
    <div className="space-y-3">
      {candidates
        .filter(c => c.jobId === selected.id)
        .map(c => (
          <div
            key={c.id}
            className="p-3 border rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs text-slate-500">{c.email}</p>
              <p className="text-xs text-slate-500">
                {c.experience} experience
              </p>
            </div>

            <Badge status={c.status} />
          </div>
        ))}

      {candidates.filter(c => c.jobId === selected.id).length === 0 && (
        <p className="text-sm text-slate-500">
          No applicants for this job.
        </p>
      )}
    </div>
  )}
</Modal>
    </div>
  );
}
