import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import TransactionModal from '../components/TransactionModal';
import ConfirmModal from '../components/ConfirmModal';
import { 
  Plus, Search, Edit3, Trash2, ArrowUpRight, ArrowDownRight, 
  ChevronLeft, ChevronRight
} from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTxId, setDeleteTxId] = useState(null);

  const fetchDependencies = async () => {
    try {
      const [catRes, accRes] = await Promise.all([
        api.get('/categories'),
        api.get('/accounts')
      ]);
      setCategories(catRes.data);
      setAccounts(accRes.data);
    } catch (err) {
      console.error('Error fetching dependencies:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const params = {
        page,
        size: 10,
        sortBy: 'transactionDate',
        sortDir: 'desc'
      };
      if (type) params.type = type;
      if (categoryId) params.categoryId = categoryId;
      if (accountId) params.accountId = accountId;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/transactions', { params });
      setTransactions(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, type, categoryId, accountId, startDate, endDate]);

  const handleEdit = (tx) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteTxId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTxId) return;
    try {
      await api.delete(`/transactions/${deleteTxId}`);
      fetchTransactions();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteTxId(null);
    }
  };

  const handleAddNew = () => {
    setSelectedTx(null);
    setIsModalOpen(true);
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);

  const filteredList = transactions.filter(t => 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.accountName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Navbar title="Transaction History" onOpenAddTransaction={handleAddNew} />

      <div className="page-container">
        {/* Filters Toolbar */}
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'center' }}>
            
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search transactions..."
                className="form-input"
                style={{ paddingLeft: '38px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            <select
              className="form-select"
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(0); }}
            >
              <option value="">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>

            <select
              className="form-select"
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setPage(0); }}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              className="form-select"
              value={accountId}
              onChange={(e) => { setAccountId(e.target.value); setPage(0); }}
            >
              <option value="">All Accounts</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>

            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
            />

            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="card">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Account</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length > 0 ? (
                  filteredList.map((tx) => (
                    <tr key={tx.id}>
                      <td style={{ color: 'var(--text-secondary)' }}>{tx.transactionDate}</td>
                      <td>
                        <span className={`badge ${tx.type.toLowerCase()}`}>
                          {tx.type === 'INCOME' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600' }}>{tx.categoryName}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{tx.accountName}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{tx.description || '-'}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: tx.type === 'INCOME' ? 'var(--income)' : 'var(--expense)' }}>
                        {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button onClick={() => handleEdit(tx)} className="btn btn-secondary" style={{ padding: '6px' }}>
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDeleteClick(tx.id)} className="btn btn-danger" style={{ padding: '6px' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No matching transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Page {page + 1} of {totalPages}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn btn-secondary"
                  style={{ opacity: page === 0 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn btn-secondary"
                  style={{ opacity: page >= totalPages - 1 ? 0.5 : 1 }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchTransactions}
        transaction={selectedTx}
        categories={categories}
        accounts={accounts}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? The corresponding account balance will be automatically adjusted."
      />
    </div>
  );
};

export default Transactions;
