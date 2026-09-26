import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Calendar } from 'lucide-react';

const Navbar = ({ onOpenAddTransaction, title = "Dashboard" }) => {
  const { user } = useAuth();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="navbar">
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>{title}</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} />
          {currentDate}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {onOpenAddTransaction && (
          <button onClick={onOpenAddTransaction} className="btn btn-primary">
            <Plus size={18} />
            <span>Add Transaction</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
