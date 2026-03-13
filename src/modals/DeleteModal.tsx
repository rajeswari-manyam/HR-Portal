import type { Project } from "../types/Project.types";
import { Overlay } from "../components/ProjectUi";

export const DeleteModal = ({
  p, onClose, onConfirm,
}: {
  p:         Project;
  onClose:   () => void;
  onConfirm: () => void;
}) => (
  <Overlay onClose={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm mx-auto p-8 text-center">
      <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" /><path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Project</h3>
      <p className="text-sm text-gray-500 mb-1">
        Delete "<span className="font-semibold text-gray-800">{p.name}</span>"?
      </p>
      <p className="text-xs text-gray-400 mb-6">This cannot be undone.</p>
      <div className="flex gap-3">
        <button onClick={onClose}    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
        <button onClick={onConfirm} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">Delete</button>
      </div>
    </div>
  </Overlay>
);
