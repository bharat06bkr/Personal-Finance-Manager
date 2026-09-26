import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import BudgetCard from '../components/BudgetCard';
import ConfirmModal from '../components/ConfirmModal';
import { Plus, Calendar, PieChart } from 'lucide-react';

const Budgets = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchBudgets = async () => {
    try {
      const res = await api.get('/budgets', { params: { month, year } });
      setBudgets(res.data);
    } catch (err) {
      console.error('Error fetching budgets:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories', { params: { type: 'EXPENSE' } });
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setAmount('');
    if (categories.length > 0) setCategoryId(categories[0].id);
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (budget) => {
    setEditingBudget(budget);
    setAmount(budget.amount);
    setCategoryId(budget.categoryId);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    try {
      const payload = {
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year),
        categoryId: parseInt(categoryId)
      };

      if (editingBudget) {
        await api.put(`/budgets/${editingBudget.id}`, payload);
      } else {
        await api.post('/budgets', payload);
      }
      fetchBudgets();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/budgets/${deleteId}`);
      fetchBudgets();
    } catch (err) {
      console.error('Error deleting budget:', err);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const totalBudgeted = budgets.reduce((acc, b) => acc + (b.amount || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (b.spentAmount || 0), 0);
  const totalRemaining = totalBudgeted - totalSpent;

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div>
      <Navbar title="Monthly Budgets" />

      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Calendar size={20} color="var(--primary)" />
            <select
              className="form-select"
              style={{ width: '140px' }}
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            >
              {monthNames.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>{m}</option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ width: '100px' }}
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={18} />
            <span>Set Category Budget</span>
          </button>
        </div>

        <div className="card" style={{ marginBottom: '32px', background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Overall Budget Summary ({monthNames[month - 1]} {year})
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Budgeted</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {formatCurrency(totalBudgeted)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Spent</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--expense)' }}>
                {formatCurrency(totalSpent)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Remaining Budget</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: totalRemaining < 0 ? 'var(--expense)' : 'var(--income)' }}>
                {formatCurrency(totalRemaining)}
              </div>
            </div>
          </div>
        </div>

        {budgets.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {budgets.map(b => (
              <BudgetCard
                key={b.id}
                budget={b}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <PieChart size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
              No Budgets Configured for {monthNames[month - 1]} {year}
            </h4>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '20px' }}>
              Set monthly budget limits per expense category to track your spending and stay on budget!
            </p>
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={18} />
              <span>Create First Budget</span>
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title" style={{ marginBottom: '20px' }}>
              {editingBudget ? 'Edit Budget' : 'Set Category Budget'}
            </h3>

            {error && (
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--expense-light)', color: 'var(--expense)', marginBottom: '16px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Expense Category</label>
                <select
                  className="form-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={!!editingBudget}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Limit (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 10000"
                  className="form-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Budget"
        message="Are you sure you want to remove this budget limit?"
      />
    </div>
  );
};

export default Budgets;
