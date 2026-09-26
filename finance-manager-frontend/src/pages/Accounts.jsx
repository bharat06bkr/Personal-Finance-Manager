import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import { Plus, Wallet, CreditCard, Building2, Smartphone, DollarSign, Edit3, Trash2 } from 'lucide-react';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState('BANK_ACCOUNT');
  const [balance, setBalance] = useState('');
  const [error, setError] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data);
    } catch (err) {
      console.error('Error fetching accounts:', err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setName('');
    setAccountType('BANK_ACCOUNT');
    setBalance('');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc) => {
    setEditingAccount(acc);
    setName(acc.name);
    setAccountType(acc.accountType);
    setBalance(acc.balance);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Account name is required');
      return;
    }
    if (balance === '') {
      setError('Initial balance is required');
      return;
    }

    try {
      const payload = {
        name,
        accountType,
        balance: parseFloat(balance)
      };

      if (editingAccount) {
        await api.put(`/accounts/${editingAccount.id}`, payload);
      } else {
        await api.post('/accounts', payload);
      }
      fetchAccounts();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save account');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/accounts/${deleteId}`);
      fetchAccounts();
    } catch (err) {
      console.error('Error deleting account:', err);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const getAccountIcon = (type) => {
    switch (type) {
      case 'BANK_ACCOUNT':
      case 'SAVINGS_ACCOUNT':
        return <Building2 size={24} color="#3b82f6" />;
      case 'CREDIT_CARD':
        return <CreditCard size={24} color="#ec4899" />;
      case 'UPI':
        return <Smartphone size={24} color="#a855f7" />;
      case 'CASH':
      default:
        return <DollarSign size={24} color="#10b981" />;
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);

  const totalBalance = accounts.reduce((acc, a) => acc + (a.balance || 0), 0);

  return (
    <div>
      <Navbar title="Financial Accounts" />

      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Net Liquidity Across All Accounts</span>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
              {formatCurrency(totalBalance)}
            </h2>
          </div>

          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={18} />
            <span>Add Account</span>
          </button>
        </div>

        {accounts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {accounts.map(acc => (
              <div key={acc.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
                        {getAccountIcon(acc.accountType)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{acc.name}</h4>
                        <span className="badge default" style={{ fontSize: '11px', marginTop: '4px' }}>
                          {acc.accountType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleOpenEdit(acc)} className="btn btn-secondary" style={{ padding: '6px' }}>
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDeleteClick(acc.id)} className="btn btn-danger" style={{ padding: '6px' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Current Balance</span>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: acc.balance < 0 ? 'var(--expense)' : 'var(--text-primary)' }}>
                    {formatCurrency(acc.balance)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <Wallet size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
              No Accounts Added Yet
            </h4>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '20px' }}>
              Add your Bank Accounts, Cash, Credit Cards, or UPI accounts to track live balances across all your money sources!
            </p>
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={18} />
              <span>Create Account</span>
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title" style={{ marginBottom: '20px' }}>
              {editingAccount ? 'Edit Account' : 'Add New Account'}
            </h3>

            {error && (
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--expense-light)', color: 'var(--expense)', marginBottom: '16px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Account Name</label>
                <input
                  type="text"
                  placeholder="e.g. SBI Savings, HDFC Credit Card"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Type</label>
                <select
                  className="form-select"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  required
                >
                  <option value="BANK_ACCOUNT">Bank Account</option>
                  <option value="SAVINGS_ACCOUNT">Savings Account</option>
                  <option value="CASH">Cash</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Balance (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 25000"
                  className="form-input"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Account
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
        title="Delete Account"
        message="Are you sure you want to delete this account?"
      />
    </div>
  );
};

export default Accounts;
