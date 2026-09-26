import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';

const TransactionModal = ({ isOpen, onClose, onSave, transaction = null, categories = [], accounts = [] }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount);
      setType(transaction.type);
      setDescription(transaction.description || '');
      setTransactionDate(transaction.transactionDate);
      setCategoryId(transaction.categoryId);
      setAccountId(transaction.accountId);
    } else {
      setAmount('');
      setType('EXPENSE');
      setDescription('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      if (categories.length > 0) {
        const filtered = categories.filter(c => c.type === 'EXPENSE');
        if (filtered.length > 0) setCategoryId(filtered[0].id);
      }
      if (accounts.length > 0) setAccountId(accounts[0].id);
    }
  }, [transaction, isOpen, categories, accounts]);

  const handleTypeChange = (newType) => {
    setType(newType);
    const filtered = categories.filter(c => c.type === newType);
    if (filtered.length > 0) {
      setCategoryId(filtered[0].id);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }
    if (!accountId) {
      setError('Please select an account.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        type,
        description,
        transactionDate,
        categoryId: parseInt(categoryId),
        accountId: parseInt(accountId)
      };

      if (transaction) {
        await api.put(`/transactions/${transaction.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{transaction ? 'Edit Transaction' : 'Add New Transaction'}</h2>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--expense-light)', color: 'var(--expense)', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className={`btn ${type === 'INCOME' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, backgroundColor: type === 'INCOME' ? 'var(--income)' : '' }}
                onClick={() => handleTypeChange('INCOME')}
              >
                Income
              </button>
              <button
                type="button"
                className={`btn ${type === 'EXPENSE' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, backgroundColor: type === 'EXPENSE' ? 'var(--expense)' : '' }}
                onClick={() => handleTypeChange('EXPENSE')}
              >
                Expense
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 1500"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Account</label>
            <select
              className="form-select"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
            >
              <option value="">Select Account</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.accountType})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Grocery shopping at D-Mart"
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : (transaction ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
