import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import { Plus, Trash2, Edit3, ShieldCheck } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setType('EXPENSE');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    if (cat.isDefault) return;
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Category name cannot be empty');
      return;
    }

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, { name, type });
      } else {
        await api.post('/categories', { name, type });
      }
      fetchCategories();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/categories/${deleteId}`);
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const filteredCategories = categories.filter(c => {
    if (activeTab === 'ALL') return true;
    return c.type === activeTab;
  });

  return (
    <div>
      <Navbar title="Manage Categories" />

      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`btn ${activeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none', padding: '8px 16px' }}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('INCOME')}
              className={`btn ${activeTab === 'INCOME' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none', padding: '8px 16px', backgroundColor: activeTab === 'INCOME' ? 'var(--income)' : '' }}
            >
              Income
            </button>
            <button
              onClick={() => setActiveTab('EXPENSE')}
              className={`btn ${activeTab === 'EXPENSE' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none', padding: '8px 16px', backgroundColor: activeTab === 'EXPENSE' ? 'var(--expense)' : '' }}
            >
              Expense
            </button>
          </div>

          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={18} />
            <span>Add Custom Category</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {cat.name}
                </h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className={`badge ${cat.type.toLowerCase()}`}>
                    {cat.type}
                  </span>
                  {cat.isDefault ? (
                    <span className="badge default" title="System default category">
                      <ShieldCheck size={12} /> Default
                    </span>
                  ) : (
                    <span className="badge default" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                      Custom
                    </span>
                  )}
                </div>
              </div>

              {!cat.isDefault && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleOpenEdit(cat)} className="btn btn-secondary" style={{ padding: '6px' }}>
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDeleteClick(cat.id)} className="btn btn-danger" style={{ padding: '6px' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title" style={{ marginBottom: '20px' }}>
              {editingCategory ? 'Edit Category' : 'Create Custom Category'}
            </h3>

            {error && (
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--expense-light)', color: 'var(--expense)', marginBottom: '16px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Subscriptions, Gaming"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category Type</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
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
        title="Delete Custom Category"
        message="Are you sure you want to delete this custom category?"
      />
    </div>
  );
};

export default Categories;
