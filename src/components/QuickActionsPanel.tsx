import React from "react";
import "../styles/QuickActionsPanel.css";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  shortcut?: string;
}

interface QuickActionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  actions: QuickAction[];
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ isOpen, onClose, actions }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="quickActionsOverlay" onClick={onClose} aria-hidden="true" />
      <div className="quickActionsPanel">
        <div className="quickActionsPanel__header">
          <h3 className="quickActionsPanel__title">Quick Actions</h3>
          <button
            type="button"
            className="quickActionsPanel__close"
            onClick={onClose}
            aria-label="Tutup Quick Actions"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="quickActionsPanel__content">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              className={`quickActionsPanel__action quickActionsPanel__action--${action.variant || "secondary"}`}
              onClick={() => {
                action.onClick();
                onClose();
              }}
            >
              <span className="quickActionsPanel__actionIcon">{action.icon}</span>
              <span className="quickActionsPanel__actionLabel">{action.label}</span>
              {action.shortcut && (
                <span className="quickActionsPanel__actionShortcut">{action.shortcut}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default QuickActionsPanel;

