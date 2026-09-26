import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import SummaryCard from '../components/SummaryCard';
import TransactionModal from '../components/TransactionModal';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell 
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6', '#14b8a6'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      setData(res.data);

      const [catRes, accRes] = await Promise.all([
        api.get('/categories'),
        api.get('/accounts')
      ]);
      setCategories(catRes.data);
      setAccounts(accRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);

  return (
    <div>
      <Navbar title="Financial Dashboard" onOpenAddTransaction={() => setIsModalOpen(true)} />

      <div className="page-container">
        {/* Stats Grid */}
        <div className="stats-grid">
          <SummaryCard title="Total Income" amount={data?.totalIncome || 0} type="income" />
          <SummaryCard title="Total Expenses" amount={data?.totalExpense || 0} type="expense" />
          <SummaryCard title="Net Balance" amount={data?.balance || 0} type="balance" />
        </div>

        {/* Charts Grid */}
        <div className="grid-2" style={{ marginBottom: '32px' }}>
          {/* Income vs Expense Bar Chart */}
          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
              Income vs Expense (Last 6 Months)
            </h3>
            <div style={{ width: '100%', height: '300px' }}>
              {data?.monthlyTrends && data.monthlyTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="monthName" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                      formatter={(val) => formatCurrency(val)}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  No transaction data available yet.
                </div>
              )}
            </div>
          </div>

          {/* Category Expenses Pie Chart */}
          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
              Expenses by Category
            </h3>
            <div style={{ width: '100%', height: '300px' }}>
              {data?.categoryExpenses && data.categoryExpenses.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categoryExpenses}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="amount"
                      nameKey="categoryName"
                    >
                      {data.categoryExpenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                      formatter={(val) => formatCurrency(val)}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  No expense category breakdown available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions Section */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="var(--primary)" />
              Recent Transactions
            </h3>
          </div>

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
                </tr>
              </thead>
              <tbody>
                {data?.recentTransactions && data.recentTransactions.length > 0 ? (
                  data.recentTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td style={{ color: 'var(--text-secondary)' }}>{tx.transactionDate}</td>
                      <td>
                        <span className={`badge ${tx.type.toLowerCase()}`}>
                          {tx.type === 'INCOME' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: '500' }}>{tx.categoryName}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{tx.accountName}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{tx.description || '-'}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: tx.type === 'INCOME' ? 'var(--income)' : 'var(--expense)' }}>
                        {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No transactions recorded yet. Click "Add Transaction" to create your first entry!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchDashboardData}
        categories={categories}
        accounts={accounts}
      />
    </div>
  );
};

export default Dashboard;
