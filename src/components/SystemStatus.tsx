import React, { useState, useEffect } from "react";
import "../styles/SystemStatus.css";

interface SystemMetric {
  name: string;
  value: string | number;
  status: "healthy" | "warning" | "error";
  icon: string;
}

interface SystemStatusProps {
  isOpen: boolean;
  onClose: () => void;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadSystemStatus();
      const interval = setInterval(loadSystemStatus, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadSystemStatus = async () => {
    setIsLoading(true);
    // TODO: Fetch from API
    const mockMetrics: SystemMetric[] = [
      {
        name: "Database",
        value: "Connected",
        status: "healthy",
        icon: "🗄️",
      },
      {
        name: "API Server",
        value: "Running",
        status: "healthy",
        icon: "🚀",
      },
      {
        name: "Storage",
        value: "85% used",
        status: "warning",
        icon: "💾",
      },
      {
        name: "Memory",
        value: "2.1 GB / 4 GB",
        status: "healthy",
        icon: "🧠",
      },
    ];
    setMetrics(mockMetrics);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="systemStatusOverlay" onClick={onClose} aria-hidden="true" />
      <div className="systemStatus">
        <div className="systemStatus__header">
          <h3 className="systemStatus__title">System Status</h3>
          <button
            type="button"
            className="systemStatus__close"
            onClick={onClose}
            aria-label="Tutup System Status"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="systemStatus__content">
          {isLoading ? (
            <div className="systemStatus__loading">
              <svg className="systemStatus__spinner" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.416" strokeDashoffset="31.416" opacity="0.3">
                  <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                  <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                </circle>
              </svg>
              <span>Memuat status sistem...</span>
            </div>
          ) : (
            <div className="systemStatus__metrics">
              {metrics.map((metric, index) => (
                <div key={index} className={`systemStatus__metric systemStatus__metric--${metric.status}`}>
                  <div className="systemStatus__metricIcon">{metric.icon}</div>
                  <div className="systemStatus__metricContent">
                    <span className="systemStatus__metricName">{metric.name}</span>
                    <span className="systemStatus__metricValue">{metric.value}</span>
                  </div>
                  <div className={`systemStatus__metricStatus systemStatus__metricStatus--${metric.status}`}>
                    {metric.status === "healthy" && "✓"}
                    {metric.status === "warning" && "⚠"}
                    {metric.status === "error" && "✗"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SystemStatus;

