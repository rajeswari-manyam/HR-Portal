import { useState } from "react";
import { PERSONS } from "../data/mockProjects";
import type { Project, TeamMember } from "../types/Project.types";
import { ROLE_COLOR_MAP } from "../components/constants/Project.constants";
import { Overlay } from "../components/ProjectUi";
import { IClose, ICheck, ISearch, IUserPlus } from "../components/icons";

export const AssignModal = ({
  p, onClose, onSave,
}: {
  p:       Project;
  onClose: () => void;
  onSave:  (team: TeamMember[]) => void;
}) => {
  const [selected,   setSelected]   = useState<Set<string>>(new Set(p.team.map(m => m.name)));
  const [search,     setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const allEmployees = PERSONS.map(person => ({
    id:       person.id,
    name:     person.name,
    initials: person.avatar,
    color:    ROLE_COLOR_MAP[person.role] ?? "bg-gray-400",
    role:     person.role,
    dept:     "Engineering",
    online:   Math.random() > 0.3,
    skills:   (["React", "Node.js", "TypeScript", "Figma", "Python", "Strategy", "Agile", "JIRA"] as string[])
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1),
  }));

  const roles    = ["All", ...Array.from(new Set(allEmployees.map(e => e.role)))];
  const filtered = allEmployees.filter(e => {
    const q = search.toLowerCase();
    return (
      (!search || e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q)) &&
      (roleFilter === "All" || e.role === roleFilter)
    );
  });

  const toggle    = (name: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n; });
  const selectAll = () => setSelected(new Set(filtered.map(e => e.name)));
  const clearAll  = () => setSelected(new Set());

  const selectedEmployees = allEmployees.filter(e => selected.has(e.name));

  const handleSave = () => {
    const team: TeamMember[] = selectedEmployees.map(e => ({
      initials: e.initials, color: e.color, name: e.name,
    }));
    onSave(team);
  };

  return (
    <Overlay onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg mx-auto overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500"><IUserPlus /></div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Assign Employees</h2>
            <p className="text-xs text-gray-400">{p.name} · <span className="font-mono">{p.id}</span></p>
          </div>
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <IClose />
          </button>
        </div>

        {/* Selected chips */}
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600">
              Team <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full ml-1">{selected.size}</span>
            </span>
            <div className="flex gap-3 text-xs font-medium">
              <button onClick={selectAll} className="text-blue-600 hover:underline">Select all</button>
              <button onClick={clearAll}  className="text-gray-400 hover:underline">Clear</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[32px]">
            {selectedEmployees.map(e => (
              <span key={e.id} className="inline-flex items-center gap-1 pl-1 pr-1.5 py-0.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] ${e.color}`}>{e.initials}</span>
                {e.name.split(" ")[0]}
                <button onClick={() => toggle(e.name)} className="text-gray-400 hover:text-gray-600 leading-none ml-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Search + Filters */}
        <div className="px-5 py-3 space-y-2 border-b border-gray-100">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
            <ISearch />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, skill, role..."
              className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400" />
          </div>
          <div className="flex gap-2">
            {[
              { value: roleFilter,   set: setRoleFilter,  opts: roles },
              { value: "All",        set: () => {},        opts: ["All", "Engineering", "Design", "Product"] },
              { value: "All",        set: () => {},        opts: ["All", "Online", "Offline"] },
            ].map(({ value, set, opts }, i) => (
              <select key={i} value={value} onChange={e => set(e.target.value)}
                className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-blue-400 text-gray-600">
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            ))}
          </div>
          <p className="text-xs text-gray-400">{filtered.length} employees shown</p>
        </div>

        {/* Employee list */}
        <div className="max-h-52 overflow-y-auto divide-y divide-gray-50">
          {filtered.map(e => {
            const isSel = selected.has(e.name);
            return (
              <button key={e.id} onClick={() => toggle(e.name)}
                className={`w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-gray-50 transition-colors ${isSel ? "bg-blue-50/50" : ""}`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${isSel ? "bg-blue-600" : "border-2 border-gray-300"}`}>
                  {isSel && <ICheck />}
                </div>
                <span className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${e.color}`}>{e.initials}</span>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{e.name}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{e.role}</span>
                  </div>
                  <p className="text-xs text-gray-400">{e.dept} · {e.name.toLowerCase().replace(" ", ".")}@corp.io</p>
                  <div className="flex gap-1 mt-0.5 flex-wrap">
                    {e.skills.map(s => <span key={s} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{s}</span>)}
                  </div>
                </div>
                <span className={`w-2 h-2 rounded-full shrink-0 ${e.online ? "bg-green-400" : "bg-gray-300"}`} />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center -space-x-1.5">
            {selectedEmployees.slice(0, 4).map(e => (
              <span key={e.id} className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] ${e.color}`}>{e.initials}</span>
            ))}
            <span className="ml-2 text-sm font-medium text-gray-700">{selected.size} selected</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose}    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Save Team</button>
          </div>
        </div>
      </div>
    </Overlay>
  );
};
