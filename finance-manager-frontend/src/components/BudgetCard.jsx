import React from 'react';
import { AlertTriangle, Edit3, Trash2 } from 'lucide-react';

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const { categoryName, amount, spentAmount, remainingAmount, utilizationPercentage } = budget;

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);

  const getStatusClass = () => {
    if (utilizationPercentage >= 100) return 'danger';
    if (utilizationPercentage >= 80) return 'warning';
    return 'success';
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{categoryName}</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Budget: <strong style={{ color: 'var(--text-secondary)' }}>{formatCurrency(amount)}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {onEdit && (
            <button onClick={() => onEdit(budget)} className="btn btn-secondary" style={{ padding: '6px' }}>
              <Edit3 size={16} />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(budget.id)} className="btn btn-danger" style={{ padding: '6px' }}>
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Spent: {formatCurrency(spentAmount)}</span>
        <span style={{ fontWeight: '600', color: utilizationPercentage >= 100 ? 'var(--expense)' : 'var(--text-primary)' }}>
          {utilizationPercentage}%
        </span>
      </div>

      <div className="progress-container">
        <div 
          className={`progress-bar ${getStatusClass()}`} 
          style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
        ></div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        <span style={{ fontSize: '13px', color: remainingAmount < 0 ? 'var(--expense)' : 'var(--income)' }}>
          {remainingAmount < 0 ? `Over by ${formatCurrency(Math.abs(remainingAmount))}` : `Remaining: ${formatCurrency(remainingAmount)}`}
        </span>

        {utilizationPercentage >= 100 && (
          <span className="badge expense">
            <AlertTriangle size={12} /> Over Budget
          </span>
        )}
      </div>
    </div>
  );
};

export default BudgetCard;
