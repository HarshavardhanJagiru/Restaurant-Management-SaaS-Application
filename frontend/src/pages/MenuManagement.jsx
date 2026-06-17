import React, { useEffect, useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import API from '../services/api';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, Tag, Clock, CircleDot } from 'lucide-react';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  
  // Modals state
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // Forms state
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  
  const [editingItem, setEditingItem] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemPrep, setItemPrep] = useState('15');
  const [itemDiet, setItemDiet] = useState('veg');
  const [itemImage, setItemImage] = useState('');

  const [loading, setLoading] = useState(true);

  const fetchMenuData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        API.get('/menu'),
        API.get('/categories')
      ]);
      setMenuItems(menuRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Error fetching menu details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryName) return;
    try {
      await API.post('/categories', { name: categoryName, description: categoryDesc });
      setCategoryName('');
      setCategoryDesc('');
      setShowCategoryModal(false);
      fetchMenuData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating category');
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemName || !itemPrice || !itemCategory) return;
    
    const payload = {
      name: itemName,
      description: itemDesc,
      price: parseFloat(itemPrice),
      category: itemCategory,
      preparationTime: parseInt(itemPrep),
      dietType: itemDiet,
      imageUrl: itemImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
    };

    try {
      if (editingItem) {
        await API.put(`/menu/${editingItem._id}`, payload);
      } else {
        await API.post('/menu', payload);
      }
      resetItemForm();
      setShowItemModal(false);
      fetchMenuData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving menu item');
    }
  };

  const handleEditItemClick = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemDesc(item.description);
    setItemPrice(item.price.toString());
    setItemCategory(item.category._id || item.category);
    setItemPrep(item.preparationTime.toString());
    setItemDiet(item.dietType);
    setItemImage(item.imageUrl);
    setShowItemModal(true);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to remove this dish from the menu?')) return;
    try {
      await API.delete(`/menu/${id}`);
      fetchMenuData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting menu item');
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await API.put(`/menu/${item._id}/availability`);
      fetchMenuData();
    } catch (err) {
      console.error(err);
    }
  };

  const resetItemForm = () => {
    setEditingItem(null);
    setItemName('');
    setItemDesc('');
    setItemPrice('');
    setItemCategory('');
    setItemPrep('15');
    setItemDiet('veg');
    setItemImage('');
  };

  // Filter items locally
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory ? (item.category?._id === activeCategory) : true;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pl-64 bg-darkBg text-slate-100 flex flex-col">
      <Sidebar />
      <Navbar title="Menu & Recipe Hub" />

      <main className="flex-1 p-8 mt-16 space-y-6 overflow-y-auto">
        
        {/* Header bar controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-darkBorder pb-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Menu Management</h1>
            <p className="text-sm text-slate-400">Configure catalog prices, categorizations, and stock statuses</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { resetItemForm(); setShowItemModal(true); }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold text-xs text-white shadow-lg shadow-indigo-500/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Dish</span>
            </button>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-900/60 border border-darkBorder font-semibold text-xs text-indigo-400 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Category</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Category Chips scrolling list */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1.5 scrollbar-thin">
            <button
              onClick={() => setActiveCategory('')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === '' 
                  ? 'bg-indigo-500 text-white shadow-md' 
                  : 'bg-slate-900 border border-darkBorder text-slate-400 hover:text-slate-200'
              }`}
            >
              All Dishes
            </button>
            {categories.map(cat => (
              <button
                key={cat._id}
                onClick={() => setActiveCategory(cat._id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat._id 
                    ? 'bg-indigo-500 text-white shadow-md' 
                    : 'bg-slate-900 border border-darkBorder text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-darkBorder text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Menu Grid List */}
        {loading ? (
          <div className="py-20 flex justify-center"><span className="w-8 h-8 rounded-full border-4 border-indigo-500/25 border-t-indigo-500 animate-spin"></span></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <div 
                key={item._id} 
                className={`glass-panel rounded-2xl overflow-hidden group transition-all duration-300 border ${
                  item.availability === 'out_of_stock' ? 'opacity-65 border-rose-500/20' : 'border-darkBorder hover:border-indigo-500/30'
                }`}
              >
                {/* Visual Header image */}
                <div className="h-44 relative bg-slate-950/40 overflow-hidden">
                  <img 
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Category overlay */}
                  <span className="absolute top-3 left-3 bg-slate-950/80 text-[10px] font-bold text-slate-300 px-2 py-1 rounded-md border border-slate-800">
                    {item.category?.name || 'Beverage'}
                  </span>
                  
                  {/* Diet Badge overlay */}
                  <span className={`absolute top-3 right-3 px-2 py-1 rounded-md text-[10px] font-extrabold uppercase border ${
                    item.dietType === 'veg' 
                      ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400' 
                      : item.dietType === 'non_veg' 
                        ? 'bg-rose-500/15 border-rose-500/20 text-rose-400' 
                        : 'bg-amber-500/15 border-amber-500/20 text-amber-400'
                  }`}>
                    {item.dietType === 'non_veg' ? 'Non Veg' : item.dietType}
                  </span>
                </div>

                {/* Info body */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-100 truncate">{item.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 min-h-[32px]">{item.description}</p>
                  </div>

                  {/* Price and Prep-time details */}
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-300 bg-slate-950/40 px-3 py-2 rounded-xl border border-darkBorder/30">
                    <span className="text-sm font-extrabold text-white">₹{item.price}</span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.preparationTime} mins</span>
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2 pt-2 border-t border-darkBorder/50">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      title={item.availability === 'available' ? 'Mark Out of Stock' : 'Mark Available'}
                      className={`flex-1 flex justify-center items-center py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        item.availability === 'available' 
                          ? 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400' 
                          : 'border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {item.availability === 'available' ? (
                        <>
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>In Stock</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 mr-1" />
                          <span>Sold Out</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleEditItemClick(item)}
                      title="Edit dish"
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-900/60 border border-darkBorder text-slate-400 hover:text-indigo-400 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      title="Delete dish"
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-900/60 border border-darkBorder text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Category Creator */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-darkBorder shadow-2xl relative">
              <h2 className="text-lg font-bold text-white mb-4">Create Category</h2>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Category Name</label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g. Appetizers"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-darkBorder text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
                  <textarea
                    value={categoryDesc}
                    onChange={(e) => setCategoryDesc(e.target.value)}
                    placeholder="Brief details..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-darkBorder text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    rows="2"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-darkBorder text-xs text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Item Builder Form */}
        {showItemModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-darkBorder shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold text-white mb-4">{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
              <form onSubmit={handleSaveItem} className="space-y-4">
                
                {/* Dish Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Dish Name</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Butter Garlic Naan"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-darkBorder text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Category Selector */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Category</label>
                    <select
                      value={itemCategory}
                      onChange={(e) => setItemCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-darkBorder text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Price */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Price (INR)</label>
                    <input
                      type="number"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      placeholder="₹ 150"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-darkBorder text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                      min="0"
                    />
                  </div>
                </div>

                {/* Prep and Diet Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Preparation Time (mins)</label>
                    <input
                      type="number"
                      value={itemPrep}
                      onChange={(e) => setItemPrep(e.target.value)}
                      placeholder="15"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-darkBorder text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                      min="1"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Dietary Type</label>
                    <select
                      value={itemDiet}
                      onChange={(e) => setItemDiet(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-darkBorder text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    >
                      <option value="veg">Veg</option>
                      <option value="non_veg">Non Veg</option>
                      <option value="egg">Egg</option>
                    </select>
                  </div>
                </div>

                {/* Image URL link */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Image URL (Optional)</label>
                  <input
                    type="text"
                    value={itemImage}
                    onChange={(e) => setItemImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-darkBorder text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
                  <textarea
                    value={itemDesc}
                    onChange={(e) => setItemDesc(e.target.value)}
                    placeholder="Ingredients and serving details..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-darkBorder text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    rows="3"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end pt-2 border-t border-darkBorder/40">
                  <button
                    type="button"
                    onClick={() => { setShowItemModal(false); resetItemForm(); }}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 border border-darkBorder text-xs text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Save Dish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default MenuManagement;
