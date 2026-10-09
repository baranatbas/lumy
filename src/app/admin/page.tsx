'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Product,
  Category,
  SiteSettings,
  UserMessage,
  WholesaleFeature,
  StatItem,
  ProcessStep,
  WhyFeature,
  ThemeColors
} from '@/lib/db';
import { formatWhatsAppPhone } from '@/lib/whatsapp';
import {
  Package,
  FileText,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Inbox,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  Upload,
  LogOut,
  ExternalLink,
  RefreshCw,
  Search,
  MessageCircle,
  Eye,
  AlertCircle,
  Mail,
  Image as ImageIcon,
  FolderPlus,
  Send,
  Tag,
  EyeOff,
  Sparkles,
  Layers,
  ShieldCheck,
  Heart,
  Smile,
  Star,
  Leaf,
  Truck,
  ArrowRight,
  Smartphone,
  Menu
} from 'lucide-react';
import LumyLogo from '@/components/LumyLogo';

export default function AdminDashboardPage() {
  const router = useRouter();

  // Authentication check
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'products' | 'content' | 'contact' | 'email' | 'messages'>('products');

  // Data states
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [messages, setMessages] = useState<UserMessage[]>([]);

  // UI status feedback
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Product Edit / Create Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSectionImg, setUploadingSectionImg] = useState<string | null>(null);

  // Inline New Category state in product modal
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Category management modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Filter state for products tab
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);


  useEffect(() => {
    // Check local admin token
    const token = typeof window !== 'undefined' ? localStorage.getItem('lumy_admin_token') : null;
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setAuthenticated(true);
    fetchData();
  }, []);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, productsRes, categoriesRes, messagesRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/messages')
      ]);

      const [settingsData, productsData, categoriesData, messagesData] = await Promise.all([
        settingsRes.json(),
        productsRes.json(),
        categoriesRes.json(),
        messagesRes.json()
      ]);

      if (settingsData.success) {
        const s = settingsData.data;
        if (!s.processSteps || s.processSteps.length === 0) {
          s.processSteps = [
            { id: 'step-1', stepNumber: '01', stepLabel: 'FİKİR', description: 'Sizin konseptiniz, bizim yaratıcılığımız.', imageUrl: '/images/process_01.jpg' },
            { id: 'step-2', stepNumber: '02', stepLabel: 'TASARIM', description: 'Detaylı kalıplar ve tasarım çizimleri.', imageUrl: '/images/process_02.jpg' },
            { id: 'step-3', stepNumber: '03', stepLabel: 'PROTOTİP', description: 'Mükemmel doku ve form için numune testi.', imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80' },
            { id: 'step-4', stepNumber: '04', stepLabel: 'ÜRETİM', description: 'Markanız ve sevdikleriniz için hazır.', imageUrl: '/images/hero_hedgehog.jpg' }
          ];
        }
        if (!s.whyFeatures || s.whyFeatures.length === 0) {
          s.whyFeatures = [
            { id: 'wf-1', icon: 'heart', title: 'Yaratıcı Tasarım Desteği', description: 'Fikriniz ister karalama olsun ister 3D model; tasarım ekibimiz peluş haline getirir.' },
            { id: 'wf-2', icon: 'shield', title: 'EN-71 & CE Çocuk Güvenliği', description: 'Avrupa güvenlik standartlarında, antialerjik ve bebekler için tam güvenli dikişler.' },
            { id: 'wf-3', icon: 'sparkles', title: 'Özel Markalama & Etiket', description: 'Kurumsal kimliğinize özel woven dokuma etiket, nakış logo ve kutu tasarımı.' },
            { id: 'wf-4', icon: 'truck', title: 'Hızlı Prototip & Sevkiyat', description: 'Numune onayından sonra seri üretim ve Türkiye geneline güvenli teslimat.' }
          ];
        }
        setSettings(s);
      }
      if (productsData.success) setProducts(productsData.data);
      if (categoriesData.success) setCategories(categoriesData.data);
      if (messagesData.success) setMessages(messagesData.data);
    } catch (err: any) {
      showStatus('error', 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lumy_admin_token');
    router.push('/admin/login');
  };

  // -------------------------------------------------------------
  // PRODUCT ACTIONS
  // -------------------------------------------------------------
  const openNewProductModal = () => {
    setEditingProduct({
      name: '',
      category: categories[0]?.id || 'pelus-oyuncaklar',
      price: null,
      wholesaleMin: null,
      image: '',
      images: [],
      description: '',
      inStock: true,
      showStock: false,
      featured: false,
      badge: ''
    });
    setIsAddingNewCategory(false);
    setNewCategoryInput('');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    const imgs = (prod.images && prod.images.length > 0)
      ? [...prod.images]
      : (prod.image ? [prod.image] : ['https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&auto=format&fit=crop&q=80']);
    setEditingProduct({ ...prod, images: imgs });
    setIsAddingNewCategory(false);
    setNewCategoryInput('');
    setIsProductModalOpen(true);
  };

  const handleImageSlotUrlChange = (index: number, url: string) => {
    if (!editingProduct) return;
    const currentImages = editingProduct.images ? [...editingProduct.images] : (editingProduct.image ? [editingProduct.image] : []);
    currentImages[index] = url;
    setEditingProduct({
      ...editingProduct,
      images: currentImages,
      image: currentImages[0] || url
    });
  };

  const handleAddImageSlot = () => {
    if (!editingProduct) return;
    const currentImages = editingProduct.images ? [...editingProduct.images] : (editingProduct.image ? [editingProduct.image] : []);
    if (currentImages.length >= 5) {
      showStatus('error', 'Bir ürüne en fazla 5 adet görsel eklenebilir.');
      return;
    }
    const updated = [...currentImages, ''];
    setEditingProduct({
      ...editingProduct,
      images: updated
    });
  };

  const handleRemoveImageSlot = (index: number) => {
    if (!editingProduct) return;
    const currentImages = editingProduct.images ? [...editingProduct.images] : (editingProduct.image ? [editingProduct.image] : []);
    if (currentImages.length <= 1) {
      showStatus('error', 'En az 1 adet görsel bulunmalıdır.');
      return;
    }
    const updated = currentImages.filter((_, i) => i !== index);
    setEditingProduct({
      ...editingProduct,
      images: updated,
      image: updated[0] || ''
    });
  };

  const handleImageUploadSlot = async (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setEditingProduct(prev => {
          if (!prev) return null;
          const currentImages = prev.images ? [...prev.images] : (prev.image ? [prev.image] : []);
          currentImages[slotIndex] = data.url;
          return {
            ...prev,
            images: currentImages,
            image: currentImages[0] || data.url
          };
        });
        showStatus('success', `${slotIndex + 1}. ürün görseli yüklendi!`);
      } else {
        showStatus('error', data.error || 'Görsel yüklenemedi');
      }
    } catch (err) {
      showStatus('error', 'Görsel yüklenirken hata oluştu');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setSettings({ ...settings, logoUrl: data.url });
        showStatus('success', 'Logo yüklendi! Lütfen "Değişiklikleri Kaydet" butonuna basınız.');
      } else {
        showStatus('error', data.error || 'Logo yüklenemedi');
      }
    } catch (err) {
      showStatus('error', 'Logo yüklenirken hata oluştu');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSectionImageUpload = async (key: string, file: File) => {
    if (!file || !settings) return;
    setUploadingSectionImg(key);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        if (key === 'heroImageUrl') {
          setSettings({ ...settings, heroImageUrl: data.url });
        } else if (key === 'heroMobileImageUrl') {
          setSettings({ ...settings, heroMobileImageUrl: data.url });
        } else if (key === 'whyImageUrl') {
          setSettings({ ...settings, whyImageUrl: data.url });
        } else if (key === 'footerLogoUrl') {
          setSettings({ ...settings, footerLogoUrl: data.url });
        } else if (key === 'footerMascotUrl') {
          setSettings({ ...settings, footerMascotUrl: data.url });
        } else if (key === 'spotlight1Image') {
          setSettings({ ...settings, spotlight1Image: data.url });
        } else if (key === 'spotlight2Image') {
          setSettings({ ...settings, spotlight2Image: data.url });
        } else if (key.startsWith('processStep_')) {
          const idx = parseInt(key.replace('processStep_', ''), 10);
          const steps = [...(settings.processSteps || [])];
          if (steps[idx]) {
            steps[idx] = { ...steps[idx], imageUrl: data.url };
            setSettings({ ...settings, processSteps: steps });
          }
        }
        showStatus('success', 'Görsel yüklendi! "Değişiklikleri Kaydet" butonuna basarak kaydedin.');
      } else {
        showStatus('error', data.error || 'Görsel yüklenemedi');
      }
    } catch (err) {
      showStatus('error', 'Görsel yüklenirken hata oluştu');
    } finally {
      setUploadingSectionImg(null);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryInput.trim()) return;
    setIsSavingCategory(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        const createdCat = data.data;
        setCategories(prev => {
          if (prev.some(c => c.id === createdCat.id)) return prev;
          return [...prev, createdCat];
        });
        setEditingProduct(prev => prev ? { ...prev, category: createdCat.id } : null);
        setIsAddingNewCategory(false);
        setNewCategoryInput('');
        showStatus('success', `"${createdCat.name}" kategorisi başarıyla eklendi!`);
      } else {
        showStatus('error', data.error || 'Kategori eklenemedi');
      }
    } catch (err) {
      showStatus('error', 'Kategori eklenirken hata oluştu');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (catId === 'all') {
      showStatus('error', 'Tüm Peluşlar ana sekmesi silinemez.');
      return;
    }
    const assignedCount = products.filter(p => p.category === catId).length;
    if (assignedCount > 0) {
      alert(`Bu kategoride ${assignedCount} adet peluş ürün bulunmaktadır. Silmek için önce bu ürünlerin kategorisini değiştirin veya ürünleri silin.`);
      return;
    }
    if (!confirm(`"${catName}" kategorisini silmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(`/api/categories?id=${encodeURIComponent(catId)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCategories(prev => prev.filter(c => c.id !== catId));
        showStatus('success', `"${catName}" kategorisi başarıyla silindi!`);
      } else {
        showStatus('error', data.error || 'Kategori silinemedi.');
      }
    } catch (err) {
      showStatus('error', 'Kategori silinirken hata oluştu.');
    }
  };

  const toggleProductHomepage = async (product: Product) => {
    const nextVal = product.showOnHomepage === false ? true : false;
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showOnHomepage: nextVal })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, showOnHomepage: nextVal } : p));
        showStatus('success', nextVal ? `"${product.name}" ana sayfada gösteriliyor.` : `"${product.name}" ana sayfadan gizlendi.`);
      } else {
        showStatus('error', data.error || 'Görünürlük güncellenemedi');
      }
    } catch (err) {
      showStatus('error', 'Görünürlük güncellenirken hata oluştu');
    }
  };

  const toggleProductFeatured = async (product: Product) => {
    const nextVal = !product.featured;
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: nextVal })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, featured: nextVal } : p));
        showStatus('success', nextVal ? `"${product.name}" vitrinde öne çıkarıldı (katalogda en üstte gösterilecek)! ⭐` : `"${product.name}" normal sıralamaya alındı.`);
      } else {
        showStatus('error', data.error || 'Öne çıkarma durumu güncellenemedi');
      }
    } catch (err) {
      showStatus('error', 'Güncellenirken hata oluştu');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    setIsSaving(true);
    try {
      if (editingProduct.id) {
        // Update
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingProduct)
        });
        const data = await res.json();
        if (data.success) {
          setProducts(prev => prev.map(p => p.id === data.data.id ? data.data : p));
          setIsProductModalOpen(false);
          showStatus('success', 'Ürün başarıyla güncellendi!');
        } else {
          showStatus('error', data.error || 'Ürün güncellenemedi');
        }
      } else {
        // Create
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingProduct)
        });
        const data = await res.json();
        if (data.success) {
          setProducts(prev => [data.data, ...prev]);
          setIsProductModalOpen(false);
          showStatus('success', 'Yeni peluş ürün eklendi!');
        } else {
          showStatus('error', data.error || 'Ürün eklenemedi');
        }
      }
    } catch (err) {
      showStatus('error', 'Kaydedilirken hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
        showStatus('success', 'Ürün silindi!');
      } else {
        showStatus('error', data.error || 'Silinemedi');
      }
    } catch (err) {
      showStatus('error', 'Silinirken hata oluştu');
    }
  };


  // -------------------------------------------------------------
  // SETTINGS & CONTENT ACTIONS
  // -------------------------------------------------------------
  const handleSaveSettings = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        showStatus('success', 'Site ayarları ve metinleri başarıyla kaydedildi!');
      } else {
        showStatus('error', data.error || 'Ayarlar kaydedilemedi');
      }
    } catch (err) {
      showStatus('error', 'Kaydedilirken hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!settings?.emailNotification?.recipientEmail) {
      showStatus('error', 'Lütfen önce e-posta adresi girip kaydedin!');
      return;
    }
    setSendingTestEmail(true);
    try {
      const res = await fetch('/api/test-email', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showStatus('success', data.message || 'Test e-postası başarıyla gönderildi!');
      } else {
        showStatus('error', data.error || 'Test e-postası gönderilemedi.');
      }
    } catch (err: any) {
      showStatus('error', 'E-posta testi sırasında bağlantı hatası oluştu');
    } finally {
      setSendingTestEmail(false);
    }
  };


  // -------------------------------------------------------------
  // MESSAGES ACTIONS
  // -------------------------------------------------------------
  const toggleMessageStatus = async (id: string, currentStatus: 'read' | 'unread') => {
    const newStatus = currentStatus === 'unread' ? 'read' : 'unread';
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
        showStatus('success', 'Mesaj durumu güncellendi');
      }
    } catch (err) {
      showStatus('error', 'Durum güncellenemedi');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => prev.filter(m => m.id !== id));
        showStatus('success', 'Mesaj silindi');
      }
    } catch (err) {
      showStatus('error', 'Mesaj silinemedi');
    }
  };

  if (!authenticated) {
    return null;
  }

  const unreadMessagesCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="min-h-screen bg-stone-50/80 text-gray-800 flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <img
              src={settings?.logoUrl && settings.logoUrl.trim() !== '' ? settings.logoUrl : '/images/lumy_logo_color.png'}
              alt={settings?.brandName || 'Lumy Toys'}
              className="h-9 sm:h-12 w-auto max-w-[120px] sm:max-w-[160px] object-contain shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-xl font-black text-gray-900 tracking-tight truncate">
                  {settings?.brandName || 'Lumy Toys'}
                </h1>
                <span className="bg-amber-100 text-amber-800 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md uppercase shrink-0">
                  Panel
                </span>
              </div>
              <p className="text-[11px] text-gray-500 hidden sm:block">Ürün, İçerik & Bildirim Merkezi</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {(activeTab === 'content' || activeTab === 'contact' || activeTab === 'email') && (
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                title="Değişiklikleri Kaydet"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? '...' : 'Kaydet'}</span>
              </button>
            )}

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-plush-600 bg-stone-100 hover:bg-stone-200/70 p-2 sm:px-3.5 sm:py-2 rounded-xl transition-colors"
              title="Siteyi Gör"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Siteyi Gör</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-2 sm:px-3.5 sm:py-2 rounded-xl transition-colors cursor-pointer"
              title="Çıkış Yap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Çıkış</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-2 border-t border-gray-100 overflow-x-auto scrollbar-none py-0.5">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-1.5 sm:gap-2 py-3 px-2.5 sm:px-4 border-b-2 text-xs sm:text-sm font-extrabold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
              activeTab === 'products'
                ? 'border-plush-500 text-plush-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Ürünler ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-1.5 sm:gap-2 py-3 px-2.5 sm:px-4 border-b-2 text-xs sm:text-sm font-extrabold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
              activeTab === 'content'
                ? 'border-plush-500 text-plush-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Site Yazıları & Logo</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-1.5 sm:gap-2 py-3 px-2.5 sm:px-4 border-b-2 text-xs sm:text-sm font-extrabold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
              activeTab === 'contact'
                ? 'border-plush-500 text-plush-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>İletişim</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-1.5 sm:gap-2 py-3 px-2.5 sm:px-4 border-b-2 text-xs sm:text-sm font-extrabold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
              activeTab === 'email'
                ? 'border-plush-500 text-plush-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>E-Posta</span>
            {settings?.emailNotification?.enabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-1.5 sm:gap-2 py-3 px-2.5 sm:px-4 border-b-2 text-xs sm:text-sm font-extrabold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
              activeTab === 'messages'
                ? 'border-plush-500 text-plush-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Inbox className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Talepler</span>
            {unreadMessagesCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0">
                {unreadMessagesCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Floating Status Toast Alert */}
      {statusMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold animate-in slide-in-from-bottom-5 text-white ${
            statusMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {statusMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 text-plush-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-500">Yönetim verileri yükleniyor...</p>
          </div>
        ) : (
          <>
            {/* ------------------------------------------------------------- */}
            {/* TAB 1: PRODUCT MANAGEMENT */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Peluş Oyuncak Kataloğu</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Ürünlerinizi yönetin, fotoğraflar ve detaylar ekleyin (Önerilen ürün görseli: 1:1 Kare, 800×800 px).
                    </p>
                  </div>

                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Ürün adı veya açıklama ara..."
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        className="px-3 py-2 bg-stone-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                      >
                        <option value="all">Tüm Kategoriler ({products.length})</option>
                        {categories.filter(c => c.id !== 'all').map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({products.filter(p => p.category === c.id).length})
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="inline-flex items-center justify-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold px-3.5 py-2 rounded-xl border border-stone-300 transition-all cursor-pointer whitespace-nowrap"
                        title="Kategorileri Düzenle / Sil"
                      >
                        <Tag className="w-3.5 h-3.5 text-amber-600" />
                        <span>Kategoriler ({categories.filter(c => c.id !== 'all').length})</span>
                      </button>

                      <button
                        onClick={openNewProductModal}
                        className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Yeni Peluş Ekle</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Table & Mobile Cards */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
                  {/* Mobile Card List (< md screens) */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {products
                      .filter((p) => {
                        const matchesSearch =
                          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          (p.description || '').toLowerCase().includes(productSearch.toLowerCase());
                        const matchesCategory =
                          productCategoryFilter === 'all' || p.category === productCategoryFilter;
                        return matchesSearch && matchesCategory;
                      })
                      .sort((a, b) => {
                        if (a.featured && !b.featured) return -1;
                        if (!a.featured && b.featured) return 1;
                        return 0;
                      })
                      .map((p) => (
                        <div key={p.id} className="p-4 flex items-start gap-3 hover:bg-amber-50/30 transition-colors">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-black text-gray-900 text-sm truncate">{p.name}</h3>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => openEditProductModal(p)}
                                  className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                  title="Düzenle"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Sil"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <p className="text-[11px] text-plush-600 font-semibold mt-0.5">
                              {categories.find(c => c.id === p.category)?.name || p.category}
                            </p>

                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              {/* Vitrin / En Üstte Toggle Button */}
                              {p.featured ? (
                                <button
                                  type="button"
                                  onClick={() => toggleProductFeatured(p)}
                                  className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-2 py-0.5 rounded-md text-[10px] cursor-pointer"
                                  title="Vitrinden (en üstten) kaldırmak için tıklayın"
                                >
                                  <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                                  <span>⭐ Vitrinde (En Üstte)</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => toggleProductFeatured(p)}
                                  className="inline-flex items-center gap-1 text-gray-600 hover:text-amber-700 bg-stone-100 hover:bg-amber-50 px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer border border-gray-200"
                                  title="Bu peluşu öne çıkar ve katalogda en başta göster"
                                >
                                  <Star className="w-3 h-3" />
                                  <span>En Üste Al</span>
                                </button>
                              )}

                               {/* Show on Homepage Toggle */}
                              <button
                                type="button"
                                onClick={() => toggleProductHomepage(p)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer ${
                                  p.showOnHomepage !== false
                                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                    : 'text-gray-500 bg-gray-100 border border-gray-300'
                                }`}
                              >
                                {p.showOnHomepage !== false ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-gray-400" />}
                                <span>{p.showOnHomepage !== false ? 'Yayında' : 'Gizli'}</span>
                              </button>

                              <span className="text-gray-600 bg-stone-100 font-bold px-2 py-0.5 rounded text-[10px]">
                                📷 {p.images?.length || (p.image ? 1 : 0)} Görsel
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                    {products.filter((p) => {
                      const matchesSearch =
                        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                        (p.description || '').toLowerCase().includes(productSearch.toLowerCase());
                      const matchesCategory =
                        productCategoryFilter === 'all' || p.category === productCategoryFilter;
                      return matchesSearch && matchesCategory;
                    }).length === 0 && (
                      <div className="p-8 text-center text-xs text-gray-400">
                        Aramanıza veya seçtiğiniz kategoriye uygun ürün bulunamadı.
                      </div>
                    )}
                  </div>

                  {/* Desktop Table (>= md screens) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-extrabold">
                        <tr>
                          <th className="py-3.5 px-4">Görseller</th>
                          <th className="py-3.5 px-4">Ürün Adı & Kategori</th>
                          <th className="py-3.5 px-4">Vitrin & Görünürlük</th>
                          <th className="py-3.5 px-4 text-right">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {products
                          .filter((p) => {
                            const matchesSearch =
                              p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                              (p.description || '').toLowerCase().includes(productSearch.toLowerCase());
                            const matchesCategory =
                              productCategoryFilter === 'all' || p.category === productCategoryFilter;
                            return matchesSearch && matchesCategory;
                          })
                          .sort((a, b) => {
                            if (a.featured && !b.featured) return -1;
                            if (!a.featured && b.featured) return 1;
                            return 0;
                          })
                          .map((p) => (
                            <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                    <img
                                      src={p.image}
                                      alt={p.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <span className="text-[10px] font-bold text-gray-600 bg-stone-100 px-2 py-1 rounded-lg">
                                    📷 {p.images?.length || (p.image ? 1 : 0)} Görsel
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="font-extrabold text-gray-900 text-sm">{p.name}</div>
                                <div className="text-[11px] text-plush-600 font-semibold">
                                  {categories.find(c => c.id === p.category)?.name || p.category}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex flex-col gap-1.5 items-start">
                                  {/* Vitrin / En Üstte Toggle Button */}
                                  {p.featured ? (
                                    <button
                                      type="button"
                                      onClick={() => toggleProductFeatured(p)}
                                      className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-2.5 py-1 rounded-lg text-[10px] cursor-pointer hover:bg-amber-200 transition-colors shadow-2xs"
                                      title="Vitrinden (en üstten) kaldırmak için tıklayın"
                                    >
                                      <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                                      <span>⭐ Vitrinde (En Üstte)</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => toggleProductFeatured(p)}
                                      className="inline-flex items-center gap-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 font-bold px-2.5 py-1 rounded-lg text-[10px] cursor-pointer border border-stone-200 hover:border-amber-300 transition-colors"
                                      title="Bu peluşu vitrine alıp katalogda en başta göster"
                                    >
                                      <Star className="w-3.5 h-3.5" />
                                      <span>En Üste Al (Vitrin)</span>
                                    </button>
                                  )}

                                  {/* Show on Homepage Toggle */}
                                  <button
                                    type="button"
                                    onClick={() => toggleProductHomepage(p)}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                                      p.showOnHomepage !== false
                                        ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                                        : 'text-gray-500 bg-gray-100 hover:bg-gray-200 border border-gray-300'
                                    }`}
                                    title={p.showOnHomepage !== false ? 'Katalogda yayında (Gizlemek için tıklayın)' : 'Katalogdan gizlendi (Yayınlamak için tıklayın)'}
                                  >
                                    {p.showOnHomepage !== false ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-gray-400" />}
                                    <span>{p.showOnHomepage !== false ? 'Yayında' : 'Gizli'}</span>
                                  </button>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-right space-x-2">
                                <button
                                  onClick={() => openEditProductModal(p)}
                                  className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                  title="Düzenle"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Sil"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 2: SITE TEXTS, ICONS & LOGO */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'content' && settings && (
              <div className="space-y-8 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xs">
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Site Metinleri, İkonlar & Başlıklar</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Sitedeki her bir başlığı, rozet ikonunu, buton yazısını ve metni buradan anında değiştirebilirsiniz.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer shrink-0"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
                  </button>
                </div>

                {/* Section: Custom Logo Upload */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-plush-600" /> Marka Logosu
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-amber-50/50 rounded-2xl border border-amber-200">
                    <div className="w-32 h-20 bg-white border border-gray-300 rounded-xl flex items-center justify-center p-2 shadow-inner shrink-0">
                      {settings.logoUrl && settings.logoUrl.trim() !== '' ? (
                        <img
                          src={settings.logoUrl}
                          alt="Yüklü Logo"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <img
                          src="/images/lumy_logo_color.png"
                          alt="Lumy Toys Orijinal Logo"
                          className="max-h-full max-w-full object-contain"
                        />
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      <p className="text-xs text-gray-600 font-medium">
                        Logonuz şeffaf arka planlı (PNG veya SVG) olduğunda sitenin hem üst menüsünde hem de alt kısmında kusursuz görünür.
                      </p>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-plush-500 hover:bg-plush-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingLogo ? 'Yükleniyor...' : 'Bilgisayardan Logo Seç'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            disabled={uploadingLogo}
                          />
                        </label>

                        <input
                          type="text"
                          value={settings.logoUrl || ''}
                          onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                          placeholder="Veya Doğrudan Logo URL Yapıştırın (https://...)"
                          className="flex-1 w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Brand Identity */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-amber-500">🏷️</span> Marka Kimliği
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Marka Adı</label>
                      <input
                        type="text"
                        value={settings.brandName || ''}
                        onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-plush-400 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Marka Sloganı</label>
                      <input
                        type="text"
                        value={settings.slogan || ''}
                        onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-plush-400 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Navbar Links */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-amber-500">🧭</span> Üst Gezinti Menüsü (Navbar) Bağlantı Yazıları
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">1. Menü: Sürecimiz</label>
                      <input
                        type="text"
                        value={settings.navProcess || ''}
                        onChange={(e) => setSettings({ ...settings, navProcess: e.target.value })}
                        placeholder="SÜRECİMİZ"
                        className="w-full px-3 py-2 bg-stone-50 border border-gray-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">2. Menü: Ürünler / Katalog</label>
                      <input
                        type="text"
                        value={settings.navCatalog || ''}
                        onChange={(e) => setSettings({ ...settings, navCatalog: e.target.value })}
                        placeholder="ÜRÜNLER"
                        className="w-full px-3 py-2 bg-stone-50 border border-gray-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">3. Menü: Neden Lumy?</label>
                      <input
                        type="text"
                        value={settings.navWhy || ''}
                        onChange={(e) => setSettings({ ...settings, navWhy: e.target.value })}
                        placeholder="NEDEN LUMY?"
                        className="w-full px-3 py-2 bg-stone-50 border border-gray-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">4. Menü: İletişim</label>
                      <input
                        type="text"
                        value={settings.navContact || ''}
                        onChange={(e) => setSettings({ ...settings, navContact: e.target.value })}
                        placeholder="İLETİŞİM"
                        className="w-full px-3 py-2 bg-stone-50 border border-gray-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* Section 1: Hero Section */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" /> 1. Ana Karşılama (Hero Alanı)
                    </h3>
                    <span className="text-[11px] font-bold text-gray-400">Sayfa Üstü</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Üst Küçük Kicker Başlık (Örn: ÖZEL TASARIM & MARKA PELUŞLARI)
                    </label>
                    <input
                      type="text"
                      value={settings.heroKicker || ''}
                      onChange={(e) => setSettings({ ...settings, heroKicker: e.target.value })}
                      placeholder="ÖZEL TASARIM & MARKA PELUŞLARI"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs font-bold tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Hero Ana Başlığı
                    </label>
                    <input
                      type="text"
                      value={settings.heroTitle || ''}
                      onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                      placeholder="Fikirlerinizi sarılası peluşlara dönüştürüyoruz."
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-sm font-black focus:ring-2 focus:ring-amber-400 focus:bg-white"
                    />
                  </div>

                  {/* Hero Image Management */}
                  <div className="space-y-4">
                    {/* Desktop Banner */}
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-stone-600" />
                          Masaüstü Hero Karşılama Görseli (Geniş Banner)
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-lg border border-amber-300">
                          📐 Önerilen: 21:9 Panoramik (1920 × 720 px)
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Image Preview */}
                        <div className="w-36 h-20 rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shrink-0 shadow-inner flex items-center justify-center">
                          <img
                            src={settings.heroImageUrl || '/images/hero_hedgehog_banner.jpg'}
                            alt="Hero Desktop Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 w-full space-y-2">
                          <div className="flex flex-col sm:flex-row items-center gap-2">
                            <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors shadow-xs">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{uploadingSectionImg === 'heroImageUrl' ? 'Yükleniyor...' : 'Masaüstü Görseli Seç'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleSectionImageUpload('heroImageUrl', f);
                                }}
                                className="hidden"
                                disabled={uploadingSectionImg === 'heroImageUrl'}
                              />
                            </label>

                            <input
                              type="text"
                              value={settings.heroImageUrl || ''}
                              onChange={(e) => setSettings({ ...settings, heroImageUrl: e.target.value })}
                              placeholder="Veya Görsel URL Yapıştırın (/images/hero_hedgehog_banner.jpg veya https://...)"
                              className="flex-1 w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                            />
                          </div>
                          <p className="text-[11px] text-gray-500">
                            Masaüstü için tavsiye edilen boyut: <strong>21:9 oranında 1920 × 720 px</strong> (veya 1920 × 750 px). Bu oran görselin üstten/alttan kırpılmasını önler ve peluş karakterinizin tam görünmesini sağlar.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Hero Image Card */}
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                          Mobil Karşılama Görseli (Telefonlar İçin Özel Boyut)
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                          📐 Önerilen: 4:5 Dikey (800 × 1000 px) veya 1:1 Kare (800 × 800 px)
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Thumbnail Preview */}
                        <div className="w-20 h-24 rounded-2xl overflow-hidden bg-stone-200 border-2 border-stone-300 shrink-0 shadow-inner flex items-center justify-center relative">
                          {settings.heroMobileImageUrl ? (
                            <img
                              src={settings.heroMobileImageUrl}
                              alt="Hero Mobile Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center p-1">
                              <span className="text-[9px] font-bold text-gray-400 block">Otomatik</span>
                              <span className="text-[8px] text-gray-400 block">Masaüstü</span>
                            </div>
                          )}
                          {settings.heroMobileImageUrl && (
                            <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[8px] font-black text-center py-0.5 uppercase tracking-wider">
                              Özel Mobil
                            </span>
                          )}
                        </div>

                        <div className="flex-1 w-full space-y-2">
                          <div className="flex flex-col sm:flex-row items-center gap-2">
                            <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors shadow-xs">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{uploadingSectionImg === 'heroMobileImageUrl' ? 'Yükleniyor...' : 'Mobil Görseli Seç'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleSectionImageUpload('heroMobileImageUrl', f);
                                }}
                                className="hidden"
                                disabled={uploadingSectionImg === 'heroMobileImageUrl'}
                              />
                            </label>

                            <input
                              type="text"
                              value={settings.heroMobileImageUrl || ''}
                              onChange={(e) => setSettings({ ...settings, heroMobileImageUrl: e.target.value })}
                              placeholder="Veya Görsel URL Yapıştırın (/images/... veya https://...)"
                              className="flex-1 w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                            />

                            {settings.heroMobileImageUrl && (
                              <button
                                type="button"
                                onClick={() => setSettings({ ...settings, heroMobileImageUrl: '' })}
                                className="text-red-500 hover:text-red-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl border border-red-200 transition-colors shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Kaldır</span>
                              </button>
                            )}
                          </div>

                          {/* Mobil Sol Yazı Arkası Beyazlık / Gölge Kontrolü */}
                          <div className="pt-2 border-t border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div>
                              <span className="text-xs font-bold text-stone-800 block">
                                Mobilde Sol Yazı Arkası Beyazlık / Gölge Yoğunluğu:
                              </span>
                              <span className="text-[11px] text-gray-400 block">
                                Yazının rahat okunması için soldan gelen beyaz geçişi artırabilir veya tamamen kapatabilirsiniz (%0).
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={typeof settings.heroMobileOverlayOpacity === 'number' ? settings.heroMobileOverlayOpacity : 35}
                                onChange={(e) => setSettings({ ...settings, heroMobileOverlayOpacity: parseInt(e.target.value, 10) })}
                                className="w-28 sm:w-32 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                              />
                              <span className="text-xs font-mono font-bold text-stone-700 min-w-9 text-right">
                                %{typeof settings.heroMobileOverlayOpacity === 'number' ? settings.heroMobileOverlayOpacity : 35}
                              </span>
                              <button
                                type="button"
                                onClick={() => setSettings({
                                  ...settings,
                                  heroMobileOverlayOpacity: (typeof settings.heroMobileOverlayOpacity === 'number' ? settings.heroMobileOverlayOpacity : 35) === 0 ? 35 : 0
                                })}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                  (typeof settings.heroMobileOverlayOpacity === 'number' ? settings.heroMobileOverlayOpacity : 35) === 0
                                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                                }`}
                              >
                                {(typeof settings.heroMobileOverlayOpacity === 'number' ? settings.heroMobileOverlayOpacity : 35) === 0 ? 'Kapalı ✕' : 'Kapat (%0)'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* Section 2: Process Section (4 Steps) */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-500" /> 2. Üretim Sürecimiz (4 Aşamalı Süreç)
                    </h3>
                    <span className="text-[11px] font-bold text-gray-400">Çizimden Gülümsemeye</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Kicker Başlık (Örn: ÜRETİM SÜRECİMİZ)
                    </label>
                    <input
                      type="text"
                      value={settings.processKicker || ''}
                      onChange={(e) => setSettings({ ...settings, processKicker: e.target.value })}
                      placeholder="ÜRETİM SÜRECİMİZ"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs font-bold tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Süreç Bölüm Başlığı
                    </label>
                    <input
                      type="text"
                      value={settings.processTitle || ''}
                      onChange={(e) => setSettings({ ...settings, processTitle: e.target.value })}
                      placeholder="Çizimden gülümsemeye."
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-sm font-black focus:ring-2 focus:ring-amber-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Süreç Açıklama Metni
                    </label>
                    <textarea
                      rows={2}
                      value={settings.processSubtitle || ''}
                      onChange={(e) => setSettings({ ...settings, processSubtitle: e.target.value })}
                      placeholder="Fikirlerinizi yaratıcı tasarım, yüksek kaliteli malzemeler ve güvenilir bir üretim süreciyle hayata geçiriyoruz."
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-400 focus:bg-white"
                    />
                  </div>

                  {/* 4 Process Steps */}
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold text-gray-900 block">
                      4 Süreç Kartı Detayları (Numara, Başlık, Açıklama ve Görseller)
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(settings.processSteps || []).map((step, idx) => (
                        <div
                          key={step.id || idx}
                          className="p-4 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-16">
                              <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-0.5">
                                No
                              </label>
                              <input
                                type="text"
                                value={step.stepNumber}
                                onChange={(e) => {
                                  const steps = [...(settings.processSteps || [])];
                                  steps[idx] = { ...steps[idx], stepNumber: e.target.value };
                                  setSettings({ ...settings, processSteps: steps });
                                }}
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-black text-center"
                                placeholder={`0${idx + 1}`}
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-0.5">
                                Adım Başlığı
                              </label>
                              <input
                                type="text"
                                value={step.stepLabel}
                                onChange={(e) => {
                                  const steps = [...(settings.processSteps || [])];
                                  steps[idx] = { ...steps[idx], stepLabel: e.target.value };
                                  setSettings({ ...settings, processSteps: steps });
                                }}
                                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider"
                                placeholder="FİKİR / TASARIM / PROTOTİP / ÜRETİM"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-0.5">
                              Kısa Açıklama
                            </label>
                            <input
                              type="text"
                              value={step.description}
                              onChange={(e) => {
                                const steps = [...(settings.processSteps || [])];
                                steps[idx] = { ...steps[idx], description: e.target.value };
                                setSettings({ ...settings, processSteps: steps });
                              }}
                              className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs"
                              placeholder="Sizin konseptiniz, bizim yaratıcılığımız."
                            />
                          </div>

                          {/* Step Image */}
                          <div className="flex items-center gap-3 pt-1">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shrink-0 shadow-inner">
                              <img
                                src={step.imageUrl || '/images/hero_hedgehog.jpg'}
                                alt={`Adım ${step.stepNumber}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <label className="inline-flex items-center gap-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-gray-300 text-[11px] font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-colors shadow-2xs shrink-0">
                                  <Upload className="w-3 h-3 text-stone-600" />
                                  <span>{uploadingSectionImg === `processStep_${idx}` ? 'Yükleniyor...' : 'Görsel Yükle'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (f) handleSectionImageUpload(`processStep_${idx}`, f);
                                    }}
                                    className="hidden"
                                    disabled={uploadingSectionImg === `processStep_${idx}`}
                                  />
                                </label>
                                <input
                                  type="text"
                                  value={step.imageUrl}
                                  onChange={(e) => {
                                    const steps = [...(settings.processSteps || [])];
                                    steps[idx] = { ...steps[idx], imageUrl: e.target.value };
                                    setSettings({ ...settings, processSteps: steps });
                                  }}
                                  placeholder="Görsel URL (örn: /images/process_01.jpg)"
                                  className="flex-1 min-w-0 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[11px]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* Section 3: Products Section & Catalog */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-500" /> 3. Ürünlerimiz & Katalog Bölümü
                    </h3>
                    <span className="text-[11px] font-bold text-gray-400">Ürün Başlıkları & Butonlar</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Kicker Başlık (Örn: ÜRÜNLERİMİZ)
                    </label>
                    <input
                      type="text"
                      value={settings.productsKicker || ''}
                      onChange={(e) => setSettings({ ...settings, productsKicker: e.target.value })}
                      placeholder="ÜRÜNLERİMİZ"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs font-bold tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Ürünler Bölüm Başlığı
                    </label>
                    <input
                      type="text"
                      value={settings.productsTitle || ''}
                      onChange={(e) => setSettings({ ...settings, productsTitle: e.target.value })}
                      placeholder="Bir oyuncaktan çok daha fazlası."
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-sm font-black focus:ring-2 focus:ring-amber-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Ürünler Açıklama Metni
                    </label>
                    <textarea
                      rows={2}
                      value={settings.productsSubtitle || ''}
                      onChange={(e) => setSettings({ ...settings, productsSubtitle: e.target.value })}
                      placeholder="Yumuşacık, sevimli ve karakter dolu — peluş oyuncaklarımız markalar, etkinlikler ve özel projeler için tasarlandı."
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-400 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Katalog Arama Çubuğu İpucu (Placeholder)
                      </label>
                      <input
                        type="text"
                        value={settings.catalogSearchPlaceholder || ''}
                        onChange={(e) => setSettings({ ...settings, catalogSearchPlaceholder: e.target.value })}
                        placeholder="Koleksiyonda ara..."
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Daha Fazla Göster Buton Yazısı
                      </label>
                      <input
                        type="text"
                        value={settings.catalogLoadMoreText || ''}
                        onChange={(e) => setSettings({ ...settings, catalogLoadMoreText: e.target.value })}
                        placeholder="Daha Fazla Göster"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  {/* Öne Çıkan 2 Kategori Görseli (Vitrin) */}
                  <div className="pt-4 border-t border-gray-100 space-y-4">
                    <div>
                      <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                        Vitrin Kategori Görselleri (Sitede Oturan 2 Görsel)
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Katalog başlığının yanında yer alan 2 görseli, başlıklarını ve tıklandığında filtrelenecek kategorileri buradan değiştirebilirsiniz.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Kart 1: Sol Görsel */}
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                        <span className="text-xs font-bold text-gray-900 block">1. Vitrin Görseli (Sol)</span>

                        <div className="flex items-center gap-3">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-stone-200 shrink-0 p-1 flex items-center justify-center">
                            <img
                              src={settings.spotlight1Image || '/images/category_pelus_bear.png'}
                              alt="Spotlight 1"
                              className="w-full h-full object-contain"
                            />
                          </div>

                          <div className="flex-1 min-w-0 space-y-1.5">
                            <label className="w-full inline-flex items-center justify-center gap-1.5 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-2xs">
                              <Upload className="w-3 h-3" />
                              <span>{uploadingSectionImg === 'spotlight1Image' ? 'Yükleniyor...' : 'Görsel Seç'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleSectionImageUpload('spotlight1Image', f);
                                }}
                                className="hidden"
                                disabled={uploadingSectionImg === 'spotlight1Image'}
                              />
                            </label>

                            <input
                              type="text"
                              value={settings.spotlight1Image || ''}
                              onChange={(e) => setSettings({ ...settings, spotlight1Image: e.target.value })}
                              placeholder="Görsel URL (/images/... veya https://...)"
                              className="w-full px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[11px]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Görsel Altı Başlık</label>
                            <input
                              type="text"
                              value={settings.spotlight1Title ?? 'Peluş Oyuncaklar'}
                              onChange={(e) => setSettings({ ...settings, spotlight1Title: e.target.value })}
                              placeholder="Peluş Oyuncaklar"
                              className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Tıklanacak Kategori</label>
                            <select
                              value={settings.spotlight1CategoryId || 'pelus-oyuncaklar'}
                              onChange={(e) => setSettings({ ...settings, spotlight1CategoryId: e.target.value })}
                              className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium"
                            >
                              {categories.filter(c => c.id !== 'all').map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Kart 2: Sağ Görsel */}
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                        <span className="text-xs font-bold text-gray-900 block">2. Vitrin Görseli (Sağ)</span>

                        <div className="flex items-center gap-3">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-stone-200 shrink-0 p-1 flex items-center justify-center">
                            <img
                              src={settings.spotlight2Image || '/images/category_textil_bunny.png'}
                              alt="Spotlight 2"
                              className="w-full h-full object-contain"
                            />
                          </div>

                          <div className="flex-1 min-w-0 space-y-1.5">
                            <label className="w-full inline-flex items-center justify-center gap-1.5 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-2xs">
                              <Upload className="w-3 h-3" />
                              <span>{uploadingSectionImg === 'spotlight2Image' ? 'Yükleniyor...' : 'Görsel Seç'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleSectionImageUpload('spotlight2Image', f);
                                }}
                                className="hidden"
                                disabled={uploadingSectionImg === 'spotlight2Image'}
                              />
                            </label>

                            <input
                              type="text"
                              value={settings.spotlight2Image || ''}
                              onChange={(e) => setSettings({ ...settings, spotlight2Image: e.target.value })}
                              placeholder="Görsel URL (/images/... veya https://...)"
                              className="w-full px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[11px]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Görsel Altı Başlık</label>
                            <input
                              type="text"
                              value={settings.spotlight2Title ?? 'Tekstil Ürünleri'}
                              onChange={(e) => setSettings({ ...settings, spotlight2Title: e.target.value })}
                              placeholder="Tekstil Ürünleri"
                              className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Tıklanacak Kategori</label>
                            <select
                              value={settings.spotlight2CategoryId || 'tekstil-urunleri'}
                              onChange={(e) => setSettings({ ...settings, spotlight2CategoryId: e.target.value })}
                              className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium"
                            >
                              {categories.filter(c => c.id !== 'all').map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* Section 4: Why Lumy Toys Section */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <Heart className="w-4 h-4 text-amber-500" /> 4. Neden Lumy Toys? Bölümü
                    </h3>
                    <span className="text-[11px] font-bold text-gray-400">Kalite & Güven Standartları</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Kicker Başlık (Örn: NEDEN LUMY TOYS?)
                      </label>
                      <input
                        type="text"
                        value={settings.whyKicker || ''}
                        onChange={(e) => setSettings({ ...settings, whyKicker: e.target.value })}
                        placeholder="NEDEN LUMY TOYS?"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs font-bold tracking-wider"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Samimi El Yazısı Notu (Örn: Gerçek ortaklıklar. Kalıcı anılar. ♡)
                      </label>
                      <input
                        type="text"
                        value={settings.whyNote || ''}
                        onChange={(e) => setSettings({ ...settings, whyNote: e.target.value })}
                        placeholder="Gerçek ortaklıklar. Kalıcı anılar. ♡"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs font-medium italic"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Bölüm Ana Başlığı (Büyük Başlık)
                    </label>
                    <input
                      type="text"
                      value={settings.whyTitle || ''}
                      onChange={(e) => setSettings({ ...settings, whyTitle: e.target.value })}
                      placeholder="Her dikişte sevgi, her detayda kusursuz güven."
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-sm font-black focus:ring-2 focus:ring-amber-400 focus:bg-white"
                    />
                  </div>

                  {/* Why Section Fabric Image */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <span className="text-xs font-bold text-gray-900 block flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-stone-600" />
                      Sol Taraf Görseli (Kirpi Fotoğrafı)
                    </span>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-32 h-28 rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shrink-0 shadow-inner">
                        <img
                          src={settings.whyImageUrl || '/images/why_hedgehog.jpg'}
                          alt="Why Lumy Hedgehog"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 w-full space-y-2">
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors shadow-xs">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{uploadingSectionImg === 'whyImageUrl' ? 'Yükleniyor...' : 'Görsel Seç'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleSectionImageUpload('whyImageUrl', f);
                              }}
                              className="hidden"
                              disabled={uploadingSectionImg === 'whyImageUrl'}
                            />
                          </label>

                          <input
                            type="text"
                            value={settings.whyImageUrl || ''}
                            onChange={(e) => setSettings({ ...settings, whyImageUrl: e.target.value })}
                            placeholder="Görsel URL (/images/why_hedgehog.jpg veya https://...)"
                            className="flex-1 w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                          />
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Peluş kumaş dokusu, özel dokuma etiket veya peluş detayı gösteren görsel önerilir.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4 Feature Cards */}
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold text-gray-900 block">
                      4 Değer ve Güven Maddesi
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(settings.whyFeatures || []).map((feat, idx) => (
                        <div
                          key={feat.id || idx}
                          className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-28">
                              <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-0.5">
                                İkon Tipi
                              </label>
                              <select
                                value={feat.icon || 'heart'}
                                onChange={(e) => {
                                  const feats = [...(settings.whyFeatures || [])];
                                  feats[idx] = { ...feats[idx], icon: e.target.value };
                                  setSettings({ ...settings, whyFeatures: feats });
                                }}
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold cursor-pointer"
                              >
                                <option value="heart">❤️ Kalp (heart)</option>
                                <option value="shield">🛡️ Güvenlik (shield)</option>
                                <option value="sparkles">✨ Parıltı (sparkles)</option>
                                <option value="truck">🚚 Kargo (truck)</option>
                                <option value="star">⭐ Yıldız (star)</option>
                                <option value="leaf">🍃 Yaprak (leaf)</option>
                                <option value="smile">😊 Gülümseme (smile)</option>
                              </select>
                            </div>
                            <div className="flex-1">
                              <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-0.5">
                                Başlık
                              </label>
                              <input
                                type="text"
                                value={feat.title}
                                onChange={(e) => {
                                  const feats = [...(settings.whyFeatures || [])];
                                  feats[idx] = { ...feats[idx], title: e.target.value };
                                  setSettings({ ...settings, whyFeatures: feats });
                                }}
                                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold"
                                placeholder="Özellik Başlığı"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-0.5">
                              Açıklama
                            </label>
                            <textarea
                              rows={2}
                              value={feat.description}
                              onChange={(e) => {
                                const feats = [...(settings.whyFeatures || [])];
                                feats[idx] = { ...feats[idx], description: e.target.value };
                                setSettings({ ...settings, whyFeatures: feats });
                              }}
                              className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs"
                              placeholder="Özellik açıklaması..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* Section 5: Footer & Contact */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <Phone className="w-4 h-4 text-amber-500" /> 5. İletişim Formu Başlığı & Alt Bilgi (Footer)
                    </h3>
                    <span className="text-[11px] font-bold text-gray-400">Sayfa Sonu & Form</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Sayfa Altı Form Başlığı (Örn: Bize Ulaşın)
                      </label>
                      <input
                        type="text"
                        value={settings.footerContactTitle || ''}
                        onChange={(e) => setSettings({ ...settings, footerContactTitle: e.target.value })}
                        placeholder="Bize Ulaşın"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        En Alt Kalp Yanı Sevgi Metni (Tagline)
                      </label>
                      <input
                        type="text"
                        value={settings.footerTagline || ''}
                        onChange={(e) => setSettings({ ...settings, footerTagline: e.target.value })}
                        placeholder="Peluş ve çocuk sevgisiyle üretilmiştir"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Telif / Hakları Saklıdır Metni
                    </label>
                    <input
                      type="text"
                      value={settings.footerCopyright || ''}
                      onChange={(e) => setSettings({ ...settings, footerCopyright: e.target.value })}
                      placeholder="Tüm Hakları Saklıdır."
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>

                  {/* Footer Logo Customization */}
                  <div className="pt-4 border-t border-gray-100 space-y-4">
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-600" /> Alt Bölüm (Footer) Logosu
                    </h4>

                    {/* Footer Logo Box */}
                    <div className="p-4 bg-stone-50 rounded-2xl border border-gray-200 space-y-3 max-w-xl">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-700">Footer Logosu</label>
                        {settings.footerLogoUrl && (
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, footerLogoUrl: '' })}
                            className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                          >
                            Sıfırla
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-16 bg-[#141414] rounded-xl flex items-center justify-center p-2 shrink-0 border border-gray-700">
                          <img
                            src={settings.footerLogoUrl || settings.logoUrl || '/images/lumy_logo_lime.png'}
                            alt="Footer Logo"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-[11px] px-3 py-1.5 rounded-lg cursor-pointer shadow-xs">
                            <Upload className="w-3 h-3 text-amber-600" />
                            <span>{uploadingSectionImg === 'footerLogoUrl' ? 'Yükleniyor...' : 'Görsel Seç'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingSectionImg === 'footerLogoUrl'}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleSectionImageUpload('footerLogoUrl', file);
                              }}
                            />
                          </label>
                          <input
                            type="text"
                            value={settings.footerLogoUrl || ''}
                            onChange={(e) => setSettings({ ...settings, footerLogoUrl: e.target.value })}
                            placeholder="Veya URL (boşsa ana logo)"
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px]"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500">
                        Boş bırakırsanız üst menüdeki ana logo kullanılır.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-8 py-3.5 rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
                  </button>
                </div>

              </div>
            )}








            {/* ------------------------------------------------------------- */}
            {/* TAB 3: CONTACT INFORMATION */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'contact' && settings && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
                  <div>
                    <h2 className="text-xl font-black text-gray-900">İletişim Bilgileri</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Sitede ve altbilgide (footer) gösterilen telefon, e-posta, adres ve çalışma saatleri.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</span>
                  </button>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
                  {/* Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-stone-600" /> Telefon Numarası
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={settings.contact?.showPhone !== false}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                contact: { ...settings.contact, showPhone: e.target.checked }
                              })
                            }
                            className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-400 cursor-pointer"
                          />
                          <span className={`text-[11px] font-bold ${settings.contact?.showPhone !== false ? 'text-emerald-700' : 'text-gray-400'}`}>
                            {settings.contact?.showPhone !== false ? 'Açık' : 'Kapalı'}
                          </span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={settings.contact?.phone || settings.contact?.whatsapp || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            contact: {
                              ...settings.contact,
                              phone: e.target.value,
                              whatsapp: e.target.value
                            }
                          })
                        }
                        placeholder="+90 530 123 45 67"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-amber-400"
                      />
                    </div>

                    <div className="space-y-1.5 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-stone-600" /> İletişim E-Postası
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={settings.contact?.showEmail !== false}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                contact: { ...settings.contact, showEmail: e.target.checked }
                              })
                            }
                            className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-400 cursor-pointer"
                          />
                          <span className={`text-[11px] font-bold ${settings.contact?.showEmail !== false ? 'text-emerald-700' : 'text-gray-400'}`}>
                            {settings.contact?.showEmail !== false ? 'Açık' : 'Kapalı'}
                          </span>
                        </label>
                      </div>
                      <input
                        type="email"
                        value={settings.contact?.email || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            contact: { ...settings.contact, email: e.target.value }
                          })
                        }
                        placeholder="info@lumytoys.com"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-600" /> Açık Adres
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={settings.contact?.showAddress !== false}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              contact: { ...settings.contact, showAddress: e.target.checked }
                            })
                          }
                          className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-400 cursor-pointer"
                        />
                        <span className={`text-[11px] font-bold ${settings.contact?.showAddress !== false ? 'text-emerald-700' : 'text-gray-400'}`}>
                          {settings.contact?.showAddress !== false ? 'Açık' : 'Kapalı'}
                        </span>
                      </label>
                    </div>
                    <textarea
                      rows={2}
                      value={settings.contact?.address || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contact: { ...settings.contact, address: e.target.value }
                        })
                      }
                      placeholder="İstanbul, Türkiye"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-400 resize-none"
                    />
                  </div>

                  {/* Social Media Links (Instagram -> Facebook -> LinkedIn) */}
                  <div className="pt-2 border-t border-gray-100 space-y-3">
                    <div>
                      <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                        Sosyal Medya İkonları (Footer Alt Bölüm)
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Sitede sırasıyla Instagram, Facebook ve LinkedIn olarak listelenir. Açık olanlar ve link girilenler footer'da görünür.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* 1. Instagram */}
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <Instagram className="w-3.5 h-3.5 text-pink-600" /> 1. Instagram
                          </label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={settings.contact?.showInstagram !== false}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  contact: { ...settings.contact, showInstagram: e.target.checked }
                                })
                              }
                              className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-400 cursor-pointer"
                            />
                            <span className={`text-[11px] font-bold ${settings.contact?.showInstagram !== false ? 'text-emerald-700' : 'text-gray-400'}`}>
                              {settings.contact?.showInstagram !== false ? 'Açık' : 'Kapalı'}
                            </span>
                          </label>
                        </div>
                        <input
                          type="url"
                          value={settings.contact?.instagram || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              contact: { ...settings.contact, instagram: e.target.value }
                            })
                          }
                          placeholder="https://instagram.com/lumytoys"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-400"
                        />
                      </div>

                      {/* 2. Facebook (Ortada) */}
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <Facebook className="w-3.5 h-3.5 text-blue-600" /> 2. Facebook
                          </label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={settings.contact?.showFacebook !== false}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  contact: { ...settings.contact, showFacebook: e.target.checked }
                                })
                              }
                              className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-400 cursor-pointer"
                            />
                            <span className={`text-[11px] font-bold ${settings.contact?.showFacebook !== false ? 'text-emerald-700' : 'text-gray-400'}`}>
                              {settings.contact?.showFacebook !== false ? 'Açık' : 'Kapalı'}
                            </span>
                          </label>
                        </div>
                        <input
                          type="url"
                          value={settings.contact?.facebook || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              contact: { ...settings.contact, facebook: e.target.value }
                            })
                          }
                          placeholder="https://facebook.com/lumytoys"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-400"
                        />
                      </div>

                      {/* 3. LinkedIn */}
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <Linkedin className="w-3.5 h-3.5 text-sky-700" /> 3. LinkedIn
                          </label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={settings.contact?.showLinkedin !== false}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  contact: { ...settings.contact, showLinkedin: e.target.checked }
                                })
                              }
                              className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-400 cursor-pointer"
                            />
                            <span className={`text-[11px] font-bold ${settings.contact?.showLinkedin !== false ? 'text-emerald-700' : 'text-gray-400'}`}>
                              {settings.contact?.showLinkedin !== false ? 'Açık' : 'Kapalı'}
                            </span>
                          </label>
                        </div>
                        <input
                          type="url"
                          value={settings.contact?.linkedin || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              contact: { ...settings.contact, linkedin: e.target.value }
                            })
                          }
                          placeholder="https://linkedin.com/company/lumytoys"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-8 py-3.5 rounded-xl shadow-lg transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Kaydediliyor...' : 'İletişim Bilgilerini Kaydet'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 4: EMAIL NOTIFICATION SETTINGS */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'email' && settings && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
                  <div>
                    <h2 className="text-xl font-black text-gray-900">E-Posta Bildirim Ayarları</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Siteye yeni bir iletişim mesajı geldiğinde istediğiniz e-postaya anında bildirim düşsün.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</span>
                  </button>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-5">
                  <div className="flex items-center justify-between p-4 bg-amber-50/60 rounded-2xl border border-amber-200">
                    <div className="space-y-0.5">
                      <strong className="text-sm text-gray-900 block">E-Posta Bildirimlerini Aktifleştir</strong>
                      <p className="text-xs text-gray-500">
                        Ziyaretçi iletişim formunu doldurduğu an belirlenen e-postaya bildirim gider.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotification?.enabled !== false}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            emailNotification: {
                              ...(settings.emailNotification || { recipientEmail: '' }),
                              enabled: e.target.checked
                            }
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Bildirimlerin Gönderileceği E-Posta Adresi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={settings.emailNotification?.recipientEmail || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          emailNotification: {
                            ...(settings.emailNotification || { enabled: true }),
                            recipientEmail: e.target.value
                          }
                        })
                      }
                      placeholder="Örn: samet@gmail.com veya bildirim@lumytoys.com"
                      className="w-full px-4 py-3 bg-stone-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-plush-400 focus:bg-white"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Web sitesinde formu kim doldurursa, mesajı ve telefon numarası bu adrese iletilir.
                    </p>
                  </div>

                  {/* Optional SMTP Details */}
                  <div className="pt-4 border-t border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                        Gelişmiş SMTP Sunucu Ayarları (Opsiyonel)
                      </h4>
                      <span className="text-[10px] text-gray-400">Kurumsal mail veya Gmail için</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">SMTP Sunucusu (Host)</label>
                        <input
                          type="text"
                          value={settings.emailNotification?.smtpHost || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              emailNotification: {
                                ...(settings.emailNotification || { enabled: true, recipientEmail: '' }),
                                smtpHost: e.target.value
                              }
                            })
                          }
                          placeholder="smtp.gmail.com veya mail.alanadiniz.com"
                          className="w-full px-3.5 py-2 bg-stone-50 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">SMTP Port</label>
                        <input
                          type="number"
                          value={settings.emailNotification?.smtpPort || 587}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              emailNotification: {
                                ...(settings.emailNotification || { enabled: true, recipientEmail: '' }),
                                smtpPort: Number(e.target.value)
                              }
                            })
                          }
                          placeholder="587 veya 465"
                          className="w-full px-3.5 py-2 bg-stone-50 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">SMTP Kullanıcı Adı / E-Posta</label>
                        <input
                          type="text"
                          value={settings.emailNotification?.smtpUser || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              emailNotification: {
                                ...(settings.emailNotification || { enabled: true, recipientEmail: '' }),
                                smtpUser: e.target.value
                              }
                            })
                          }
                          placeholder="gonderen@alanadiniz.com"
                          className="w-full px-3.5 py-2 bg-stone-50 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">SMTP Şifresi / Uygulama Şifresi</label>
                        <input
                          type="password"
                          value={settings.emailNotification?.smtpPass || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              emailNotification: {
                                ...(settings.emailNotification || { enabled: true, recipientEmail: '' }),
                                smtpPass: e.target.value
                              }
                            })
                          }
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2 bg-stone-50 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    {/* Helpful Guide Box for Gmail / Hosting */}
                    <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-gray-700 space-y-2 mt-4">
                      <div className="font-black text-amber-900 flex items-center gap-1.5">
                        <span>💡</span>
                        <span>Gmail veya Hosting E-Postası ile Gönderme Rehberi:</span>
                      </div>
                      <p className="leading-relaxed text-[11px] text-gray-600">
                        • <strong>Gmail için:</strong> SMTP Host: <code className="bg-white px-1 py-0.5 rounded">smtp.gmail.com</code>, Port: <code className="bg-white px-1 py-0.5 rounded">465</code> (veya 587). Şifre kısmına normal Gmail şifreniz değil, Google Hesabınızdaki <strong>Uygulama Şifresi (App Password)</strong> yazılmalıdır (Google normal şifreyle girişe izin vermez).
                      </p>
                      <p className="leading-relaxed text-[11px] text-gray-600">
                        • <strong>Kendi Web Sitenizin Maili için:</strong> Hosting firmanızın verdiği SMTP Host (örn: <code className="bg-white px-1 py-0.5 rounded">mail.lumytoys.com</code>), Port ve E-posta şifrenizi girmeniz yeterlidir.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleSendTestEmail}
                      disabled={sendingTestEmail}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-black px-5 py-3 rounded-xl transition-all cursor-pointer border border-stone-300"
                    >
                      <Send className="w-3.5 h-3.5 text-plush-600" />
                      <span>{sendingTestEmail ? 'Test Ediliyor...' : '📧 Test E-Postası Gönder'}</span>
                    </button>

                    <button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-8 py-3.5 rounded-xl shadow-lg transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Kaydediliyor...' : 'Bildirim Ayarlarını Kaydet'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 5: MESSAGES & INQUIRIES */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Gelen Mesajlar & Talepler</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Web sitesindeki iletişim formunu dolduran müşterilerin mesajları.
                    </p>
                  </div>

                  <div className="text-xs font-bold bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-200">
                    Toplam {messages.length} Mesaj
                  </div>
                </div>

                {messages.length === 0 ? (
                  <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 p-8">
                    <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-700">Henüz Mesaj Yok</h3>
                    <p className="text-xs text-gray-400">Web sitesinden form doldurulduğunda burada görünecektir.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {messages.map((msg) => {
                      const cleanCustomerPhone = formatWhatsAppPhone(msg.phone);
                      const waReplyUrl = `https://wa.me/${cleanCustomerPhone}?text=Merhaba%20${encodeURIComponent(msg.name)},%20Lumy%20Toys%20pelu%C5%9F%20oyuncak%20mesaj%C4%B1n%C4%B1z%20i%C3%A7in%20yaz%C4%B1yorum.`;

                      return (
                        <div
                          key={msg.id}
                          className={`p-6 rounded-3xl border transition-all ${
                            msg.status === 'unread'
                              ? 'bg-white border-plush-300 shadow-md ring-2 ring-plush-100'
                              : 'bg-stone-50/70 border-gray-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900"
                              >
                                💬 İletişim Mesajı
                              </span>

                              {msg.status === 'unread' && (
                                <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                                  Yeni
                                </span>
                              )}

                              <span className="text-xs text-gray-400">{msg.date}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleMessageStatus(msg.id, msg.status)}
                                className={`text-[11px] font-bold px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                                  msg.status === 'unread'
                                    ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                                    : 'bg-white hover:bg-stone-100 text-stone-500 border-gray-200'
                                }`}
                              >
                                {msg.status === 'unread' ? 'Okundu Yap' : 'Okunmadı Olarak İşaretle'}
                              </button>

                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
                            <div>
                              <span className="text-gray-400 uppercase font-bold text-[10px]">İsim / Firma:</span>
                              <p className="font-black text-gray-900 text-sm mt-0.5">{msg.name}</p>
                              {msg.company && (
                                <p className="text-stone-500 font-semibold">{msg.company}</p>
                              )}
                            </div>

                            <div>
                              <span className="text-gray-400 uppercase font-bold text-[10px]">İletişim:</span>
                              <p className="font-bold text-gray-800 mt-0.5">{msg.phone}</p>
                              {msg.email && <p className="text-gray-500">{msg.email}</p>}
                            </div>

                            <div>
                              <span className="text-gray-400 uppercase font-bold text-[10px]">İlgi & Adet:</span>
                              <p className="font-bold text-gray-800 mt-0.5">{msg.productInterest || '-'}</p>
                              {msg.estimatedQty && (
                                <p className="text-plush-600 font-bold">Miktar: {msg.estimatedQty}</p>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-200/80 text-xs text-gray-700 leading-relaxed">
                            <span className="font-bold text-gray-500 block mb-1">Talep Mesajı:</span>
                            {msg.message}
                          </div>

                          {/* Quick reply button via WhatsApp */}
                          <div className="mt-4 flex justify-end">
                            <a
                              href={waReplyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-white" />
                              <span>WhatsApp'tan Cevap Yaz</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </main>

      {/* ------------------------------------------------------------- */}
      {/* PRODUCT CREATE / EDIT MODAL */}
      {/* ------------------------------------------------------------- */}
      {isProductModalOpen && editingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsProductModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl sm:rounded-4xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-4 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-xl font-black text-gray-900">
                {editingProduct.id ? 'Peluş Ürünü Düzenle' : 'Yeni Peluş Ürün Ekle'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer"
              >
                ✕ Kapat
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Ürün Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="Örn: 80 cm Pofuduk Sevimli Ayı"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-plush-400 focus:bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                      className="text-[11px] font-bold text-plush-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FolderPlus className="w-3 h-3" />
                      <span>{isAddingNewCategory ? 'Mevcut Kategorileri Seç' : '+ Yeni Kategori Ekle'}</span>
                    </button>
                  </div>

                  {isAddingNewCategory ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        placeholder="Örn: Bebek Çıngırakları"
                        className="flex-1 px-3 py-2 bg-amber-50 border border-amber-300 rounded-xl text-xs focus:ring-2 focus:ring-plush-400"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={isSavingCategory || !newCategoryInput.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        {isSavingCategory ? '...' : 'Ekle'}
                      </button>
                    </div>
                  ) : (
                    <select
                      value={editingProduct.category || categories[0]?.id || 'pelus-oyuncaklar'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-plush-400 focus:bg-white cursor-pointer"
                    >
                      {categories
                        .filter(c => c.id !== 'all')
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              </div>

              {/* 5-Images Gallery Manager */}
              <div className="space-y-3 bg-stone-50 p-4 sm:p-5 rounded-2xl border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="block text-xs font-black text-gray-800">
                        📸 Ürün Görselleri (Maksimum 5 Adet)
                      </label>
                      <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-lg border border-amber-300">
                        📐 Önerilen Boyut: 1:1 Kare (800 × 800 px veya 1000 × 1000 px)
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 block mt-1">
                      1. görsel ana kapak fotoğrafıdır. Ürünlerin katalogda kusursuz ve net görünmesi için <strong>1:1 kare oran (örn: 800×800 veya 1000×1000 px)</strong> ile beyaz/şeffaf arka plan önerilir.
                    </span>
                  </div>
                  {(editingProduct.images || []).length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddImageSlot}
                      className="inline-flex items-center gap-1 bg-plush-50 hover:bg-plush-100 text-plush-700 border border-plush-200 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Görsel Ekle ({(editingProduct.images || []).length}/5)</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  {(editingProduct.images || ['']).map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-3"
                    >
                      {/* Thumbnail Preview */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-amber-50 shrink-0 flex items-center justify-center relative">
                        {imgUrl ? (
                          <img src={imgUrl} alt={`Görsel ${idx + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-400 text-[10px] font-bold text-center p-1">Görsel Yok</span>
                        )}
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-plush-600 text-white text-[8px] font-black text-center py-0.5 uppercase tracking-wider">
                            Kapak
                          </span>
                        )}
                      </div>

                      {/* Inputs */}
                      <div className="flex-1 w-full space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-gray-700">
                            {idx === 0 ? '👑 1. Ana Kapak Görseli (1:1 Kare • 800×800 px)' : `${idx + 1}. Ek Görsel (1:1 Kare • 800×800 px)`}
                          </span>
                          {(editingProduct.images || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveImageSlot(idx)}
                              className="text-red-500 hover:text-red-700 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Sil</span>
                            </button>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <input
                            type="text"
                            value={imgUrl}
                            onChange={(e) => handleImageSlotUrlChange(idx, e.target.value)}
                            placeholder="Görsel URL yapıştırın (https://...)"
                            className="w-full flex-1 px-3 py-1.5 bg-stone-50 border border-gray-200 rounded-lg text-xs"
                          />

                          <label className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white hover:bg-stone-50 text-gray-700 font-bold px-3 py-1.5 rounded-lg border border-gray-300 cursor-pointer shadow-xs text-xs shrink-0">
                            <Upload className="w-3 h-3 text-plush-600" />
                            <span>{uploadingImage ? 'Yükleniyor...' : 'Dosya Seç'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUploadSlot(idx, e)}
                              className="hidden"
                              disabled={uploadingImage}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Ürün Açıklaması & Özellikleri
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Kumaş cinsi, boyutu, temizlik talimatı, antialerjik dolgu özellikleri vb."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-plush-400 focus:bg-white"
                />
              </div>

              {/* Vitrin ve Görünürlük Seçenekleri */}
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 space-y-3">
                <span className="text-xs font-bold text-gray-700 block">Vitrin & Görünürlük Seçenekleri</span>
                
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-900 bg-amber-100/70 px-3.5 py-2 rounded-xl border border-amber-300 hover:bg-amber-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct.featured)}
                      onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-400"
                    />
                    <span>⭐ Vitrinde Öne Çıkar (Katalogda En Üstte Göster)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 hover:bg-emerald-100/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={editingProduct.showOnHomepage !== false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, showOnHomepage: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-400"
                    />
                    <span>Ana Sayfa Kataloğunda Göster</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-stone-50 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 bg-plush-500 hover:bg-plush-600 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CATEGORY MANAGEMENT MODAL */}
      {/* ------------------------------------------------------------- */}
      {isCategoryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsCategoryModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl sm:rounded-4xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-5 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900">Kategorileri Yönet</h3>
                  <p className="text-[11px] text-gray-500">Mevcut kategorileri düzenleyin veya silin.</p>
                </div>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer bg-stone-100 hover:bg-stone-200 p-1.5 rounded-lg transition-colors"
              >
                ✕ Kapat
              </button>
            </div>

            {/* Category List */}
            <div className="space-y-1.5 mb-5 divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const count = products.filter(p => p.category === cat.id).length;
                const isAll = cat.id === 'all';

                return (
                  <div key={cat.id} className="pt-2.5 pb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-plush-400 shrink-0"></span>
                      <div className="min-w-0">
                        <div className="font-black text-xs sm:text-sm text-gray-900 truncate">{cat.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">id: {cat.id}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        count > 0 ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-500'
                      }`}>
                        {isAll ? `${products.length} Ürün (Tümü)` : `${count} Ürün`}
                      </span>

                      {isAll ? (
                        <span className="text-[10px] font-semibold text-gray-400 italic px-2">Sabit</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Kategoriyi Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add New Category Box */}
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2">
              <label className="block text-xs font-bold text-gray-700">Yeni Kategori Ekle</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="Örn: Bebek Çıngırakları..."
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-plush-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateCategory();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={isSavingCategory || !newCategoryInput.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0"
                >
                  {isSavingCategory ? '...' : '+ Ekle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
