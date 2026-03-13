import { useState, useEffect } from 'react';
import { Plus, Briefcase, Users, Eye, Pencil, Trash2, X, RefreshCw } from 'lucide-react';
import { JobPosting, Candidate } from '../../types';
import Badge from '../../components/shared/Badge';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { formatDate } from '../../utils/helpers';
import Button from '../../components/shared/Button';
import InputField from '../../components/shared/InputField';
import Select from '../../components/shared/Select';
import Table from '../../components/shared/Table';

// ── Service imports ────────────────────────────────────────────────────────
import {
  createJob,
  getAllJobs,
  updateJob,
  deleteJob,
  JobResponse,
} from '../../service/Recruitment.service';

import {
  createCandidate,
  getAllCandidates,
  updateCandidate,
  deleteCandidate,
  CandidateResponse,
} from "../../service/candidates.service";
import { DEPARTMENT_NAMES } from '../../data/department';
// ─────────────────────────────────────────────────────────────────────────────
// Map API → local types
// ─────────────────────────────────────────────────────────────────────────────

const mapJob = (j: JobResponse): JobPosting => ({
  id: j._id,
  title: j.title,
  department: j.department,
  skills: j.skills,
  experience: j.experience,
  salaryRange: j.salaryRange,
  status: j.status,
  applicants: j.applicants,
  postedOn: j.postedOn,
});

const mapCandidate = (c: CandidateResponse): Candidate => ({
  id: c._id,
  jobId: c.jobId,
  name: c.name,
  email: c.email,
  phone: c.phone,
  experience: c.experience,
  skills: c.skills,
  status: c.status as Candidate['status'],
  appliedOn: c.appliedOn,
});

// ─────────────────────────────────────────────────────────────────────────────
// Empty form state
// ─────────────────────────────────────────────────────────────────────────────

const emptyJobForm = {
  title: '',
  department: '',
  experience: '',
  salaryRange: '',
  skills: [] as string[],
  status: 'open' as JobPosting['status'],
};

const emptyCandidateForm = {
  name: '',
  email: '',
  phone: '',
  jobId: '',
  experience: '',
  skills: [] as string[],
  status: 'applied' as CandidateResponse['status'],
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function Recruitment() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates'>('jobs');

  // Modals
  const [modal, setModal] = useState<'add-job' | 'edit-job' | 'view-job' | 'view-applicants' | 'add-candidate' | null>(null);
  const [selected, setSelected] = useState<JobPosting | null>(null);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  // Job form
  const [jobForm, setJobForm] = useState(emptyJobForm);
  const [skillInput, setSkillInput] = useState('');
  const [jobFormError, setJobFormError] = useState<string | null>(null);
  const [savingJob, setSavingJob] = useState(false);

  // Candidate form
  const [candidateForm, setCandidateForm] = useState(emptyCandidateForm);
  const [candidateSkillInput, setCandidateSkillInput] = useState('');
  const [candidateFormError, setCandidateFormError] = useState<string | null>(null);
  const [savingCandidate, setSavingCandidate] = useState(false);

  // ── Fetch jobs ──────────────────────────────────────────────────────────────
  const fetchJobs = async () => {
    setLoadingJobs(true);
    setError(null);
    try {
      const data = await getAllJobs();
      setJobs(data.map(mapJob));
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoadingJobs(false);
    }
  };

  // ── Fetch candidates ────────────────────────────────────────────────────────
  const fetchCandidates = async (filters?: { jobId?: string; status?: string }) => {
    setLoadingCandidates(true);
    try {
      const data = await getAllCandidates(filters);
      setCandidates(data.map(mapCandidate));
    } catch {
      // Candidates are optional — fail silently
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCandidates();
  }, []);

  // ── Job skill helpers ───────────────────────────────────────────────────────
  const addJobSkill = () => {
    if (skillInput.trim() && !jobForm.skills.includes(skillInput.trim())) {
      setJobForm(p => ({ ...p, skills: [...p.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };
  const removeJobSkill = (s: string) =>
    setJobForm(p => ({ ...p, skills: p.skills.filter(sk => sk !== s) }));

  // ── Candidate skill helpers ─────────────────────────────────────────────────
  const addCandidateSkill = () => {
    if (candidateSkillInput.trim() && !candidateForm.skills.includes(candidateSkillInput.trim())) {
      setCandidateForm(p => ({ ...p, skills: [...p.skills, candidateSkillInput.trim()] }));
      setCandidateSkillInput('');
    }
  };
  const removeCandidateSkill = (s: string) =>
    setCandidateForm(p => ({ ...p, skills: p.skills.filter(sk => sk !== s) }));

  // ── Open Add Job modal ──────────────────────────────────────────────────────
  const openAddJob = () => {
    setJobForm(emptyJobForm);
    setSkillInput('');
    setJobFormError(null);
    setModal('add-job');
  };

  // ── Open Edit Job modal ─────────────────────────────────────────────────────
  const openEditJob = (job: JobPosting) => {
    setSelected(job);
    setJobForm({
      title: job.title,
      department: job.department,
      experience: job.experience,
      salaryRange: job.salaryRange,
      skills: [...job.skills],
      status: job.status,
    });
    setSkillInput('');
    setJobFormError(null);
    setModal('edit-job');
  };

  // ── Save job (POST or PUT) ──────────────────────────────────────────────────
  const handleSaveJob = async () => {
    if (!jobForm.title.trim() || !jobForm.department.trim()) {
      setJobFormError('Title and Department are required.');
      return;
    }
    setSavingJob(true);
    setJobFormError(null);
    try {
      if (modal === 'add-job') {
        const created = await createJob({
          ...jobForm,
          applicants: 0,
          postedOn: new Date().toISOString().split('T')[0],
        });
        setJobs(prev => [mapJob(created), ...prev]);
      } else if (modal === 'edit-job' && selected) {
        const updated = await updateJob(selected.id, jobForm);
        setJobs(prev => prev.map(j => j.id === selected.id ? mapJob(updated) : j));
      }
      setModal(null);
    } catch (err: any) {
      setJobFormError(err.message || 'Failed to save job');
    } finally {
      setSavingJob(false);
    }
  };

  // ── Delete job ──────────────────────────────────────────────────────────────
  const handleDeleteJob = async () => {
    if (!deleteJobId) return;
    try {
      await deleteJob(deleteJobId);
      setJobs(prev => prev.filter(j => j.id !== deleteJobId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete job');
    } finally {
      setDeleteJobId(null);
    }
  };

  // ── Save candidate (POST) ───────────────────────────────────────────────────
  const handleSaveCandidate = async () => {
    if (!candidateForm.name.trim() || !candidateForm.email.trim()) {
      setCandidateFormError('Name and Email are required.');
      return;
    }
    setSavingCandidate(true);
    setCandidateFormError(null);
    try {
      const created = await createCandidate({
        ...candidateForm,
        appliedOn: new Date().toISOString().split('T')[0],
      });
      setCandidates(prev => [mapCandidate(created), ...prev]);
      setModal(null);
      setCandidateForm(emptyCandidateForm);
    } catch (err: any) {
      setCandidateFormError(err.message || 'Failed to add candidate');
    } finally {
      setSavingCandidate(false);
    }
  };

  // ── Delete candidate ────────────────────────────────────────────────────────
  const handleDeleteCandidate = async () => {
    if (!deleteCandidateId) return;
    try {
      await deleteCandidate(deleteCandidateId);
      setCandidates(prev => prev.filter(c => c.id !== deleteCandidateId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete candidate');
    } finally {
      setDeleteCandidateId(null);
    }
  };

  // ── Update candidate status ─────────────────────────────────────────────────
  const handleUpdateCandidateStatus = async (
    id: string,
    status: CandidateResponse['status']
  ) => {
    try {
      const updated = await updateCandidate(id, { status });
      setCandidates(prev =>
        prev.map(c => c.id === id ? mapCandidate(updated) : c)
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update candidate status');
    }
  };

  // ── Candidate table columns ─────────────────────────────────────────────────
  const candidateColumns = [
    {
      header: 'Candidate',
      render: (c: Candidate) => (
        <div>
          <p className="font-semibold text-slate-900">{c.name}</p>
          <p className="text-xs text-slate-400">{c.email}</p>
        </div>
      ),
    },
    {
      header: 'Job',
      render: (c: Candidate) => {
        const job = jobs.find(j => j.id === c.jobId);
        return <span className="text-sm text-slate-600">{job?.title || c.jobId || '-'}</span>;
      },
    },
    {
      header: 'Experience',
      render: (c: Candidate) => (
        <span className="text-sm text-slate-600">{c.experience || '-'}</span>
      ),
    },
    {
      header: 'Skills',
      render: (c: Candidate) => (
        <div className="flex flex-wrap gap-1">
          {c.skills.map(s => (
            <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{s}</span>
          ))}
        </div>
      ),
    },
    {
      header: 'Applied On',
      render: (c: Candidate) => (
        <span className="text-sm text-slate-500">{formatDate(c.appliedOn)}</span>
      ),
    },
    {
      header: 'Stage',
      render: (c: Candidate) => <Badge status={c.status} />,
    },
    {
      header: 'Actions',
      render: (c: Candidate) => (
        <div className="flex items-center gap-1">
          <Select
            value={c.status}
            onChange={(val) => handleUpdateCandidateStatus(c.id, val as CandidateResponse['status'])}
            options={[
              { label: 'Applied', value: 'applied' },
              { label: 'Screening', value: 'screening' },
              { label: 'Interview', value: 'interview' },
              { label: 'Offered', value: 'offered' },
              { label: 'Rejected', value: 'rejected' },
            ]}
          />
          <button
            onClick={() => setDeleteCandidateId(c.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  // ── Job form JSX ────────────────────────────────────────────────────────────
  const JobFormContent = (
    <div className="space-y-4">
      <InputField
        label="Job Title *"
        placeholder="e.g. Senior React Developer"
        value={jobForm.title}
        onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))}
      />
      <Select
        label="Department *"
        value={jobForm.department}
        onChange={val => setJobForm(p => ({ ...p, department: val }))}
        options={DEPARTMENT_NAMES.map(d => ({ label: d, value: d }))}
      />
      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Experience"
          placeholder="e.g. 3-5 years"
          value={jobForm.experience}
          onChange={e => setJobForm(p => ({ ...p, experience: e.target.value }))}
        />
        <InputField
          label="Salary Range"
          placeholder="e.g. ₹12L - ₹18L"
          value={jobForm.salaryRange}
          onChange={e => setJobForm(p => ({ ...p, salaryRange: e.target.value }))}
        />
      </div>
      <div>
        <label className="label">Skills</label>
        <div className="flex gap-2 mb-2">
          <InputField
            placeholder="Add a skill and press Enter"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addJobSkill()}
          />
          <Button onClick={addJobSkill} className="btn-secondary px-3">Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {jobForm.skills.map(s => (
            <span key={s} className="flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-semibold">
              {s}
              <button onClick={() => removeJobSkill(s)} className="hover:text-red-500 ml-1">×</button>
            </span>
          ))}
        </div>
      </div>
      <Select
        label="Status"
        value={jobForm.status}
        onChange={val => setJobForm(p => ({ ...p, status: val as JobPosting['status'] }))}
        options={[
          { label: 'Open', value: 'open' },
          { label: 'Draft', value: 'draft' },
          { label: 'Closed', value: 'closed' },
        ]}
      />
      {jobFormError && (
        <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{jobFormError}</p>
      )}
    </div>
  );

  // ── Candidate form JSX ──────────────────────────────────────────────────────
  const CandidateFormContent = (
    <div className="space-y-4">
      <InputField
        label="Name *"
        placeholder="e.g. Bob Smith"
        value={candidateForm.name}
        onChange={e => setCandidateForm(p => ({ ...p, name: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Email *"
          placeholder="bob@example.com"
          value={candidateForm.email}
          onChange={e => setCandidateForm(p => ({ ...p, email: e.target.value }))}
        />
        <InputField
          label="Phone"
          placeholder="9876543210"
          value={candidateForm.phone}
          onChange={e => setCandidateForm(p => ({ ...p, phone: e.target.value }))}
        />
      </div>
      <Select
        label="Job"
        value={candidateForm.jobId}
        onChange={val => setCandidateForm(p => ({ ...p, jobId: val }))}
        options={[
          { label: 'Select a job...', value: '' },
          ...jobs.map(j => ({ label: j.title, value: j.id })),
        ]}
      />
      <InputField
        label="Experience"
        placeholder="e.g. 2 years"
        value={candidateForm.experience}
        onChange={e => setCandidateForm(p => ({ ...p, experience: e.target.value }))}
      />
      <div>
        <label className="label">Skills</label>
        <div className="flex gap-2 mb-2">
          <InputField
            placeholder="Add a skill and press Enter"
            value={candidateSkillInput}
            onChange={e => setCandidateSkillInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCandidateSkill()}
          />
          <Button onClick={addCandidateSkill} className="btn-secondary px-3">Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {candidateForm.skills.map(s => (
            <span key={s} className="flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-semibold">
              {s}
              <button onClick={() => removeCandidateSkill(s)} className="hover:text-red-500 ml-1">×</button>
            </span>
          ))}
        </div>
      </div>
      <Select
        label="Status"
        value={candidateForm.status}
        onChange={val => setCandidateForm(p => ({ ...p, status: val as CandidateResponse['status'] }))}
        options={[
          { label: 'Applied', value: 'applied' },
          { label: 'Screening', value: 'screening' },
          { label: 'Interview', value: 'interview' },
          { label: 'Offered', value: 'offered' },
          { label: 'Rejected', value: 'rejected' },
        ]}
      />
      {candidateFormError && (
        <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{candidateFormError}</p>
      )}
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">

      {/* Error banner */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Recruitment</h1>
          <p className="page-subtitle">Manage job postings and candidates</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { fetchJobs(); fetchCandidates(); }}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={loadingJobs ? 'animate-spin' : ''} />
          </button>
          {activeTab === 'jobs' ? (
            <Button onClick={openAddJob} className="btn-primary">
              <Plus size={16} /> Post Job
            </Button>
          ) : (
            <Button
              onClick={() => { setCandidateForm(emptyCandidateForm); setCandidateFormError(null); setModal('add-candidate'); }}
              className="btn-primary"
            >
              <Plus size={16} /> Add Candidate
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <Button
          onClick={() => setActiveTab('jobs')}
          className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
        >
          Job Postings ({jobs.length})
        </Button>
        <Button
          onClick={() => setActiveTab('candidates')}
          className={`tab-btn ${activeTab === 'candidates' ? 'active' : ''}`}
        >
          Candidates ({candidates.length})
        </Button>
      </div>

      {/* Jobs Grid */}
      {activeTab === 'jobs' && (
        <>
          {loadingJobs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card animate-pulse space-y-3">
                  <div className="h-10 w-10 bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-8 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="card flex flex-col items-center py-16 gap-3 text-center">
              <Briefcase size={36} className="text-slate-300" />
              <p className="text-slate-500 font-medium">No job postings yet</p>
              <p className="text-slate-400 text-sm">Click "Post Job" to create the first one</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {jobs.map(job => (
                <div key={job.id} className="card hover:shadow-card-hover transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                      <Briefcase size={18} className="text-primary-600" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge status={job.status} />
                      <button
                        onClick={() => openEditJob(job)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteJobId(job.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 mb-1">{job.title}</h3>
                  <p className="text-sm text-slate-500 mb-3">{job.department} · {job.experience}</p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {job.skills.slice(0, 3).map(s => (
                      <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">{s}</span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md text-xs">+{job.skills.length - 3}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Users size={13} />{job.applicants} applicants
                    </span>
                    <span className="font-semibold text-slate-700">{job.salaryRange}</span>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                    <Button
                      onClick={() => { setSelected(job); setModal('view-job'); }}
                      className="btn-secondary flex-1 justify-center py-2 text-xs"
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => { setSelected(job); setModal('view-applicants'); }}
                      className="btn-primary flex-1 justify-center py-2 text-xs"
                    >
                      View Applicants
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Candidates Table */}
      {activeTab === 'candidates' && (
        loadingCandidates ? (
          <div className="flex justify-center py-12 text-slate-400 text-sm">Loading candidates…</div>
        ) : (
          <Table
            columns={candidateColumns}
            data={candidates}
            rowsPerPage={5}
            emptyMessage="No candidates found"
          />
        )
      )}

      {/* ── Add Job Modal ─────────────────────────────────────────────────── */}
      <Modal isOpen={modal === 'add-job'} onClose={() => setModal(null)} title="Post New Job">
        {JobFormContent}
        <div className="flex gap-3 mt-6">
          <Button onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">Cancel</Button>
          <Button onClick={handleSaveJob} disabled={savingJob} className="btn-primary flex-1 justify-center">
            {savingJob ? 'Posting…' : 'Post Job'}
          </Button>
        </div>
      </Modal>

      {/* ── Edit Job Modal ────────────────────────────────────────────────── */}
      <Modal isOpen={modal === 'edit-job'} onClose={() => setModal(null)} title="Edit Job">
        {JobFormContent}
        <div className="flex gap-3 mt-6">
          <Button onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">Cancel</Button>
          <Button onClick={handleSaveJob} disabled={savingJob} className="btn-primary flex-1 justify-center">
            {savingJob ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </Modal>

      {/* ── Add Candidate Modal ───────────────────────────────────────────── */}
      <Modal isOpen={modal === 'add-candidate'} onClose={() => setModal(null)} title="Add Candidate">
        {CandidateFormContent}
        <div className="flex gap-3 mt-6">
          <Button onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">Cancel</Button>
          <Button onClick={handleSaveCandidate} disabled={savingCandidate} className="btn-primary flex-1 justify-center">
            {savingCandidate ? 'Saving…' : 'Add Candidate'}
          </Button>
        </div>
      </Modal>

      {/* ── View Job Details Modal ────────────────────────────────────────── */}
      <Modal isOpen={modal === 'view-job'} onClose={() => setModal(null)} title="Job Details">
        {selected && (
          <div className="space-y-3">
            {[
              { label: 'Title', value: selected.title },
              { label: 'Department', value: selected.department },
              { label: 'Experience', value: selected.experience },
              { label: 'Salary', value: selected.salaryRange },
              { label: 'Status', value: selected.status },
              { label: 'Posted On', value: formatDate(selected.postedOn) },
              { label: 'Applicants', value: String(selected.applicants) },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500 font-medium">{row.label}</span>
                <span className="text-sm text-slate-900 font-semibold">{row.value}</span>
              </div>
            ))}
            <div>
              <p className="text-sm text-slate-500 font-medium mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {selected.skills.map(skill => (
                  <span key={skill} className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── View Applicants Modal ─────────────────────────────────────────── */}
      <Modal isOpen={modal === 'view-applicants'} onClose={() => setModal(null)} title="Applicants">
        {selected && (
          <div className="space-y-3">
            {candidates.filter(c => c.jobId === selected.id).length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No applicants for this job yet.</p>
            ) : (
              candidates.filter(c => c.jobId === selected.id).map(c => (
                <div key={c.id} className="p-3 border border-slate-100 rounded-xl flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.email}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{c.experience} experience</p>
                  </div>
                  <Badge status={c.status} />
                </div>
              ))
            )}
          </div>
        )}
      </Modal>

      {/* ── Delete Job Confirm ────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteJobId}
        onConfirm={handleDeleteJob}
        onCancel={() => setDeleteJobId(null)}
        title="Delete Job Posting"
        message="Are you sure you want to delete this job posting? This action cannot be undone."
      />

      {/* ── Delete Candidate Confirm ──────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteCandidateId}
        onConfirm={handleDeleteCandidate}
        onCancel={() => setDeleteCandidateId(null)}
        title="Delete Candidate"
        message="Are you sure you want to delete this candidate? This action cannot be undone."
      />
    </div>
  );
}