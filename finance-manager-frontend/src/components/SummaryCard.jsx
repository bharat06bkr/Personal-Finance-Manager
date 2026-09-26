import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const SummaryCard = ({ title, amount, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'income':
        return <TrendingUp size={28} />;
      case 'expense':
        return <TrendingDown size={28} />;
      case 'balance':
      default:
        return <Wallet size={28} />;
    }
  };

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);

  return (
    <div className="stat-card">
      <div>
        <div className="card-title">{title}</div>
        <div className="stat-value">{formattedAmount}</div>
      </div>
      <div className={`stat-icon-wrapper ${type}`}>
        {getIcon()}
      </div>
    </div>
  );
};

export default SummaryCard;
