import React, { useState, useEffect } from 'react';
import { Camera, Check, X, LogOut, Shuffle, Calendar, MapPin, User, ChefHat, Upload, Shield, Scissors, UtensilsCrossed, Trophy, Eye, Clock, RefreshCw, Star, History, Plus, Minus, Image, Edit3, RotateCcw, ChevronDown, ChevronUp, UserCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const FOUNDING_MEMBERS = ['Henry', 'Woodall', 'Elliott', 'Beaz'];

const INITIAL_MEMBERS = [
  { id: 1, name: 'Nathan', haircuts: 0, meals: 0, pendingHaircut: null, pendingMeal: null, profilePic: null },
  { id: 2, name: 'Hepburn', haircuts: 0, meals: 0, pendingHaircut: null, pendingMeal: null, profilePic: null },
  { id: 3, name: 'Beaz', haircuts: 0, meals: 0, pendingHaircut: null, pendingMeal: null, profilePic: null },
  { id: 4, name: 'Vinay', haircuts: 0, meals: 0, pendingHaircut: null, pendingMeal: null, profilePic: null },
  { id: 5, name: 'Josh P', haircuts: 0, meals: 0, pendingHaircut: null, pendingMeal: null, profilePic: null },
  { id: 6, name: 'Woodall', haircuts: 0, meals: 0, pendingHaircut: null, pendingMeal: null, profilePic: null },
  { id: 7, name: 'Elliott', haircuts: 0, meals: 0, pendingHaircut: null, pendingMeal: null, profilePic: null },
  { id: 8, name: 'Joel', haircuts: 0, meals: 0, pendingHaircut: null, pendingMeal: null, profilePic: null },
  { id: 9, name: 'Luke', haircuts: 0, meals: 0, pendingHaircut: null, pendingMeal: null, profilePic: null },
  { id: 10, name: 'Henry', haircuts: 0, meals: 0, pendingHaircut: null, pendingMeal: null, profilePic: null },
];

const CUISINES = ['Chinese', 'Thai', 'Italian', 'American', 'South American', 'Greek', 'Mexican', 'Spanish', 'Portuguese', 'Korean', 'Japanese', 'African', 'Indian', 'Jamaican', 'Vietnamese', 'Turkish', 'Lebanese', 'Caribbean', 'Ethiopian', 'Peruvian'];

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'curryburger2025';

const FoundingBadge = () => (
  <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-xs text-stone-900 px-1.5 py-0.5 rounded-full font-bold ml-1">
    <Star className="w-3 h-3" fill="currentColor" />
    <span className="hidden sm:inline">Founder</span>
  </span>
);

const MemberAvatar = ({ member, size = 'md' }) => {
  const sizeClasses = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 sm:w-12 sm:h-12 text-base sm:text-lg', lg: 'w-16 h-16 sm:w-20 sm:h-20 text-2xl', xl: 'w-20 h-20 sm:w-24 sm:h-24 text-3xl' };
  if (member.profilePic) {
    return <img src={member.profilePic} alt={member.name} className={`${sizeClasses[size]} rounded-full object-cover border-2 border-amber-400 shadow-md`} />;
  }
  return <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-md`}>{member.name.charAt(0)}</div>;
};

export default function Home() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [adminTab, setAdminTab] = useState('verifications');
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [usedCuisines, setUsedCuisines] = useState(['African']);
  const [currentMonth, setCurrentMonth] = useState({ month: 'January 2026', cuisine: 'African', restaurant: 'The Merge', location: 'TBD', date: 'Last Friday of January', organiser: 'Nathan' });
  const [history, setHistory] = useState([]);
  const [uploadingType, setUploadingType] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [editingOrganiser, setEditingOrganiser] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [tempOrganiser, setTempOrganiser] = useState('');
  const [tempRestaurant, setTempRestaurant] = useState('');
  const [tempLocation, setTempLocation] = useState('');
  const [expandedHistory, setExpandedHistory] = useState({});
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [editingCuisine, setEditingCuisine] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [tempCuisine, setTempCuisine] = useState('');
  const [tempDate, setTempDate] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'clubData', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.members) {
          const merged = data.members.map(m => ({ ...m, profilePic: m.profilePic || null }));
          setMembers(merged);
        }
        if (data.currentMonth) {
          const fixed = { ...data.currentMonth };
          if (fixed.month && fixed.month.includes('2025')) fixed.month = fixed.month.replace('2025', '2026');
          setCurrentMonth(fixed);
        }
        if (data.usedCuisines) setUsedCuisines(data.usedCuisines);
        if (data.history) setHistory(data.history);
      }
      setIsLoading(false);
    }, (error) => { console.error("Error:", error); setIsLoading(false); });
    return () => unsubscribe();
  }, []);

  const saveToFirebase = async (newMembers, newMonth, newUsedCuisines, newHistory) => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'clubData', 'main'), { members: newMembers || members, currentMonth: newMonth || currentMonth, usedCuisines: newUsedCuisines || usedCuisines, history: newHistory || history, lastUpdated: new Date().toISOString() });
    } catch (error) { console.error("Error saving:", error); alert("Error saving. Try again."); }
    setIsSaving(false);
  };

  const pendingVerifications = members.filter(m => m.pendingHaircut || m.pendingMeal);
  const isFoundingMember = (name) => FOUNDING_MEMBERS.includes(name);

  const handleAdminLogin = () => {
    if (adminUsername === ADMIN_USERNAME && adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true); setCurrentView('admin'); setLoginError(''); setAdminUsername(''); setAdminPassword('');
    } else { setLoginError('Invalid credentials'); }
  };

  const handleAdminLogout = () => { setIsAdmin(false); setCurrentView('home'); };

  const updateCurrentMonth = async (field, value) => {
    const newMonth = { ...currentMonth, [field]: value };
    setCurrentMonth(newMonth);
    await saveToFirebase(members, newMonth, usedCuisines, history);
  };

  const generateNewMonth = async () => {
    if (!isAdmin) return;
    const historyEntry = { id: Date.now(), month: currentMonth.month, cuisine: currentMonth.cuisine, restaurant: currentMonth.restaurant, location: currentMonth.location, organiser: currentMonth.organiser, photo: null, verificationPhotos: [] };
    const newHistory = [historyEntry, ...history];
    let availableCuisines = CUISINES.filter(c => !usedCuisines.includes(c));
    if (availableCuisines.length === 0) availableCuisines = CUISINES;
    const randomCuisine = availableCuisines[Math.floor(Math.random() * availableCuisines.length)];
    const randomOrganiser = members[Math.floor(Math.random() * members.length)];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonthIndex = months.findIndex(m => currentMonth.month.includes(m));
    const currentYear = parseInt(currentMonth.month.split(' ')[1]);
    const nextMonthIndex = (currentMonthIndex + 1) % 12;
    const nextYear = nextMonthIndex === 0 ? currentYear + 1 : currentYear;
    const newMonth = { month: `${months[nextMonthIndex]} ${nextYear}`, cuisine: randomCuisine, restaurant: 'TBD - Awaiting Organiser', location: 'TBD', date: `Last Friday of ${months[nextMonthIndex]}`, organiser: randomOrganiser.name };
    const newUsedCuisines = availableCuisines.length === CUISINES.length ? [randomCuisine] : [...usedCuisines, randomCuisine];
    setCurrentMonth(newMonth); setUsedCuisines(newUsedCuisines); setHistory(newHistory);
    await saveToFirebase(members, newMonth, newUsedCuisines, newHistory);
  };

  const restoreFromHistory = async (historyEntry) => {
    if (!isAdmin) return;
    const newHistory = history.filter(h => h.id !== historyEntry.id);
    const restoredMonth = { month: historyEntry.month, cuisine: historyEntry.cuisine, restaurant: historyEntry.restaurant, location: historyEntry.location, date: `Last Friday of ${historyEntry.month.split(' ')[0]}`, organiser: historyEntry.organiser };
    setCurrentMonth(restoredMonth); setHistory(newHistory);
    await saveToFirebase(members, restoredMonth, usedCuisines, newHistory);
  };

  const compressImage = (file, callback, quality) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = quality === 'low' ? 200 : 800;
        let width = img.width, height = img.height;
        if (width > height && width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
        else if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', quality === 'low' ? 0.5 : 0.6));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e) => { if (e.target.files[0]) compressImage(e.target.files[0], setUploadedImage); };
  const handleHistoryPhotoUpload = (e, historyId) => { if (e.target.files[0]) compressImage(e.target.files[0], (data) => updateHistoryPhoto(historyId, data)); };

  const handleProfilePicUpload = async (e) => {
    if (!e.target.files[0] || !selectedMember) return;
    setIsSaving(true);
    compressImage(e.target.files[0], async (compressedData) => {
      const updatedMembers = members.map(m => m.id === selectedMember.id ? { ...m, profilePic: compressedData } : m);
      setMembers(updatedMembers);
      setSelectedMember(updatedMembers.find(m => m.id === selectedMember.id));
      await saveToFirebase(updatedMembers, currentMonth, usedCuisines, history);
      setUploadingProfilePic(false);
      setIsSaving(false);
    }, 'low');
  };

  const updateHistoryPhoto = async (historyId, photoData) => {
    const newHistory = history.map(h => h.id === historyId ? { ...h, photo: photoData } : h);
    setHistory(newHistory);
    await saveToFirebase(members, currentMonth, usedCuisines, newHistory);
  };

  const submitForVerification = async () => {
    if (!uploadedImage || !selectedMember || !uploadingType) return;
    setIsSaving(true);
    const updatedMembers = members.map(m => {
      if (m.id === selectedMember.id) {
        return uploadingType === 'haircut' ? { ...m, pendingHaircut: uploadedImage } : { ...m, pendingMeal: uploadedImage };
      }
      return m;
    });
    setMembers(updatedMembers);
    setSelectedMember(updatedMembers.find(m => m.id === selectedMember.id));
    await saveToFirebase(updatedMembers, currentMonth, usedCuisines, history);
    setUploadedImage(null); setUploadingType(null); setIsSaving(false);
  };

  const approveStamp = async (memberId, type) => {
    if (!isAdmin) return;
    const member = members.find(m => m.id === memberId);
    const photo = type === 'haircut' ? member.pendingHaircut : member.pendingMeal;
    let newHistory = history;
    if (history.length > 0) {
      newHistory = history.map((h, idx) => idx === 0 ? { ...h, verificationPhotos: [...(h.verificationPhotos || []), { photo, memberName: member.name, type, timestamp: Date.now() }] } : h);
    }
    const updatedMembers = members.map(m => {
      if (m.id === memberId) {
        return type === 'haircut' ? { ...m, haircuts: m.haircuts + 1, pendingHaircut: null } : { ...m, meals: m.meals + 1, pendingMeal: null };
      }
      return m;
    });
    setMembers(updatedMembers); setHistory(newHistory);
    await saveToFirebase(updatedMembers, currentMonth, usedCuisines, newHistory);
  };

  const rejectStamp = async (memberId, type) => {
    if (!isAdmin) return;
    const updatedMembers = members.map(m => {
      if (m.id === memberId) {
        return type === 'haircut' ? { ...m, pendingHaircut: null } : { ...m, pendingMeal: null };
      }
      return m;
    });
    setMembers(updatedMembers);
    await saveToFirebase(updatedMembers, currentMonth, usedCuisines, history);
  };

  const adjustStamps = async (memberId, type, delta) => {
    if (!isAdmin) return;
    const updatedMembers = members.map(m => {
      if (m.id === memberId) {
        return type === 'haircut' ? { ...m, haircuts: Math.max(0, m.haircuts + delta) } : { ...m, meals: Math.max(0, m.meals + delta) };
      }
      return m;
    });
    setMembers(updatedMembers);
    await saveToFirebase(updatedMembers, currentMonth, usedCuisines, history);
  };

  const toggleHistoryExpanded = (historyId) => setExpandedHistory(prev => ({ ...prev, [historyId]: !prev[historyId] }));

  const renderStampBoxes = (count, total, type) => Array.from({ length: total }, (_, i) => (
    <div key={i} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${i < count ? (type === 'haircut' ? 'bg-gradient-to-br from-red-500 to-red-700 border-red-400 shadow-lg' : 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-400 shadow-lg') : 'bg-stone-100 border-stone-300'}`}>
      {i < count && (type === 'haircut' ? <Scissors className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-white" />)}
    </div>
  ));

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
      <div className="text-center"><RefreshCw className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" /><p className="text-stone-600 font-semibold">Loading...</p></div>
    </div>
  );

  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="bg-stone-900 text-white p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"><div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' }}></div></div>
        <div className="relative flex flex-col items-center">
          <img src="/logo.png" alt="Club Logo" className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-amber-400 shadow-2xl object-cover mb-4" />
          <h1 className="text-3xl sm:text-4xl tracking-tight brand-font"><span className="text-red-500">FRIDAY NIGHT</span></h1>
          <div className="bg-amber-500 px-4 py-1 -mt-1 mb-1 rounded"><span className="text-stone-900 text-lg sm:text-xl font-black tracking-wider brand-font">MONTHLY</span></div>
          <p className="text-xs sm:text-sm tracking-widest text-stone-400 font-bold">HAIRCUT • CURRY • BURGER CLUB</p>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-stone-200">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4"><h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 brand-font"><Calendar className="w-5 h-5 sm:w-6 sm:h-6" />{currentMonth.month}</h2></div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 text-stone-700"><ChefHat className="w-5 h-5 text-amber-600 flex-shrink-0" /><div><p className="text-xs text-stone-500 uppercase tracking-wide font-bold">Cuisine</p><p className="font-bold text-xl sm:text-2xl text-red-600 brand-font">{currentMonth.cuisine}</p></div></div>
            <div className="flex items-center gap-3 text-stone-700"><UtensilsCrossed className="w-5 h-5 text-amber-600 flex-shrink-0" /><div><p className="text-xs text-stone-500 uppercase tracking-wide font-bold">Restaurant</p><p className="font-semibold">{currentMonth.restaurant}</p></div></div>
            <div className="flex items-center gap-3 text-stone-700"><MapPin className="w-5 h-5 text-amber-600 flex-shrink-0" /><div><p className="text-xs text-stone-500 uppercase tracking-wide font-bold">Location</p><p className="font-semibold">{currentMonth.location}</p></div></div>
            <div className="flex items-center gap-3 text-stone-700"><Calendar className="w-5 h-5 text-amber-600 flex-shrink-0" /><div><p className="text-xs text-stone-500 uppercase tracking-wide font-bold">Date</p><p className="font-semibold">{currentMonth.date}</p></div></div>
            <div className="flex items-center gap-3 text-stone-700"><User className="w-5 h-5 text-amber-600 flex-shrink-0" /><div><p className="text-xs text-stone-500 uppercase tracking-wide font-bold">Organiser</p><p className="font-semibold">{currentMonth.organiser}</p></div></div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-stone-800 mb-3 flex items-center gap-2 brand-font"><User className="w-5 h-5" />SELECT YOUR CARD</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {members.map(member => (
            <button key={member.id} onClick={() => { setSelectedMember(member); setCurrentView('member'); }} className="bg-white p-3 sm:p-4 rounded-xl shadow-lg border-2 border-stone-200 hover:border-amber-400 hover:shadow-xl transition-all duration-300 text-left">
              <div className="mb-2"><MemberAvatar member={member} size="md" /></div>
              <p className="font-bold text-stone-800 text-sm sm:text-base truncate">{member.name}{isFoundingMember(member.name) && <FoundingBadge />}</p>
              <div className="flex gap-2 sm:gap-3 mt-2 text-xs text-stone-500"><span className="flex items-center gap-1"><Scissors className="w-3 h-3 text-red-500" /> {member.haircuts}</span><span className="flex items-center gap-1"><UtensilsCrossed className="w-3 h-3 text-amber-500" /> {member.meals}</span></div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-stone-800 mb-3 flex items-center gap-2 brand-font"><Trophy className="w-5 h-5 text-amber-500" />LEADERBOARD</h3>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-stone-200">
          {[...members].sort((a, b) => (b.haircuts + b.meals) - (a.haircuts + a.meals)).map((member, index) => (
            <div key={member.id} className={`p-3 flex items-center gap-3 ${index > 0 ? 'border-t border-stone-100' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${index === 0 ? 'bg-amber-400 text-white' : index === 1 ? 'bg-stone-300 text-stone-700' : index === 2 ? 'bg-orange-300 text-orange-800' : 'bg-stone-100 text-stone-500'}`}>{index + 1}</div>
              <MemberAvatar member={member} size="sm" />
              <div className="flex-1 min-w-0"><p className="font-semibold text-stone-800 truncate">{member.name}{isFoundingMember(member.name) && <FoundingBadge />}</p></div>
              <div className="text-right flex-shrink-0"><p className="font-bold text-lg text-amber-600">{member.haircuts + member.meals}</p><p className="text-xs text-stone-500">stamps</p></div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-stone-800 mb-3 flex items-center gap-2 brand-font"><History className="w-5 h-5 text-stone-600" />CLUB HISTORY</h3>
        {history.length === 0 ? <div className="bg-white rounded-xl shadow-lg p-6 text-center border-2 border-stone-200"><p className="text-stone-500">No history yet.</p></div> : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-stone-200">
                <div className="bg-gradient-to-r from-stone-700 to-stone-800 text-white p-3 cursor-pointer flex items-center justify-between" onClick={() => toggleHistoryExpanded(entry.id)}>
                  <h4 className="font-bold brand-font">{entry.month} - {entry.cuisine}</h4>
                  {expandedHistory[entry.id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
                {expandedHistory[entry.id] && (
                  <div className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                      {entry.photo ? <img src={entry.photo} alt="Group" className="w-full sm:w-48 h-32 object-cover rounded-lg" /> : <div className="w-full sm:w-48 h-32 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400"><Image className="w-8 h-8" /></div>}
                      <div className="flex-1 space-y-1">
                        <p className="text-stone-700"><span className="font-bold">Restaurant:</span> {entry.restaurant}</p>
                        <p className="text-stone-700"><span className="font-bold">Location:</span> {entry.location || 'TBD'}</p>
                        <p className="text-stone-700"><span className="font-bold">Organiser:</span> {entry.organiser}</p>
                      </div>
                    </div>
                    {entry.verificationPhotos && entry.verificationPhotos.length > 0 && (
                      <div className="border-t border-stone-200 pt-4">
                        <h5 className="font-bold text-stone-700 mb-3 flex items-center gap-2"><Camera className="w-4 h-4" />Verification Photos ({entry.verificationPhotos.length})</h5>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {entry.verificationPhotos.map((vp, idx) => (
                            <div key={idx} className="relative">
                              <img src={vp.photo} alt={`${vp.memberName} ${vp.type}`} className="w-full h-24 object-cover rounded-lg" />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-lg"><span className="flex items-center gap-1">{vp.type === 'haircut' ? <Scissors className="w-3 h-3" /> : <UtensilsCrossed className="w-3 h-3" />}{vp.memberName}</span></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 pb-8"><button onClick={() => setCurrentView('admin-login')} className="w-full py-3 px-4 bg-stone-800 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-stone-700 transition-colors font-bold"><Shield className="w-5 h-5" />Admin Panel</button></div>
    </div>
  );

  const renderMemberCard = () => {
    if (!selectedMember) return null;
    const member = members.find(m => m.id === selectedMember.id);
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-4">
        <button onClick={() => { setCurrentView('home'); setSelectedMember(null); setUploadingType(null); setUploadedImage(null); setUploadingProfilePic(false); }} className="mb-4 flex items-center gap-2 text-stone-600 hover:text-stone-800 font-semibold"><X className="w-5 h-5" /> Back</button>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-stone-200 max-w-md mx-auto">
          <div className="bg-gradient-to-r from-stone-800 to-stone-900 text-white p-4 text-center">
            <img src="/logo.png" alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-400 mx-auto mb-2 object-cover" />
            <h2 className="text-xl brand-font"><span className="text-red-500">FRIDAY NIGHT</span><span className="block text-amber-400 text-sm">MONTHLY</span></h2>
            <p className="text-xs tracking-widest text-stone-400">HAIRCUT • CURRY • BURGER CLUB</p>
          </div>
          <div className="bg-amber-400 py-3 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <MemberAvatar member={member} size="xl" />
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-lg cursor-pointer hover:bg-stone-100 border-2 border-stone-200">
                  <Camera className="w-4 h-4 text-stone-600" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicUpload} />
                </label>
              </div>
              <p className="font-black text-stone-900 text-lg sm:text-xl tracking-wide brand-font">{member.name}{isFoundingMember(member.name) && <FoundingBadge />}</p>
            </div>
          </div>
          <div className="p-4 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2"><Scissors className="w-5 h-5 text-red-600" /><h3 className="font-bold text-stone-800 brand-font">HAIRCUT STAMPS</h3><span className="ml-auto text-sm text-stone-500 font-bold">{member.haircuts}/12</span></div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">{renderStampBoxes(member.haircuts, 12, 'haircut')}</div>
              {member.pendingHaircut && <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm font-semibold"><Clock className="w-4 h-4" />Pending verification</div>}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2"><UtensilsCrossed className="w-5 h-5 text-amber-600" /><h3 className="font-bold text-stone-800 brand-font">MEAL STAMPS</h3><span className="ml-auto text-sm text-stone-500 font-bold">{member.meals}/12</span></div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">{renderStampBoxes(member.meals, 12, 'meal')}</div>
              {member.pendingMeal && <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm font-semibold"><Clock className="w-4 h-4" />Pending verification</div>}
            </div>
          </div>
          <div className="bg-red-600 text-white py-2 px-4 text-center"><p className="text-xs font-black tracking-wide brand-font">MOST STAMPS AT THE END OF THE YEAR GETS A PRIZE!</p></div>
        </div>
        {!uploadingType && (
          <div className="mt-6 space-y-3 max-w-md mx-auto">
            <h3 className="font-bold text-stone-800 text-center brand-font">UPLOAD PROOF PHOTO</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setUploadingType('haircut')} disabled={member.pendingHaircut !== null} className={`py-4 px-4 rounded-xl flex flex-col items-center gap-2 transition-colors ${member.pendingHaircut ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}><Camera className="w-6 h-6" /><span className="text-sm font-bold">Haircut Photo</span></button>
              <button onClick={() => setUploadingType('meal')} disabled={member.pendingMeal !== null} className={`py-4 px-4 rounded-xl flex flex-col items-center gap-2 transition-colors ${member.pendingMeal ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-amber-500 text-white hover:bg-amber-600'}`}><Camera className="w-6 h-6" /><span className="text-sm font-bold">Meal Photo</span></button>
            </div>
          </div>
        )}
        {uploadingType && (
          <div className="mt-6 bg-white rounded-xl p-4 shadow-lg max-w-md mx-auto">
            <h3 className="font-bold text-stone-800 mb-3 brand-font">Upload {uploadingType === 'haircut' ? 'Haircut' : 'Meal'} Photo</h3>
            {!uploadedImage ? (
              <label className="block border-2 border-dashed border-stone-300 rounded-xl p-8 text-center cursor-pointer hover:border-amber-400 transition-colors">
                <Upload className="w-10 h-10 mx-auto text-stone-400 mb-2" /><p className="text-stone-500 font-semibold">Tap to upload photo</p>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            ) : (
              <div>
                <img src={uploadedImage} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-4" />
                <div className="flex gap-2">
                  <button onClick={() => setUploadedImage(null)} className="flex-1 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 font-semibold" disabled={isSaving}>Retake</button>
                  <button onClick={submitForVerification} className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50" disabled={isSaving}>{isSaving ? 'Uploading...' : 'Submit'}</button>
                </div>
              </div>
            )}
            <button onClick={() => { setUploadingType(null); setUploadedImage(null); }} className="w-full mt-3 py-2 text-stone-500 hover:text-stone-700 font-semibold">Cancel</button>
          </div>
        )}
      </div>
    );
  };

  const renderAdminLogin = () => (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-200 p-4 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <button onClick={() => setCurrentView('home')} className="mb-4 flex items-center gap-2 text-stone-600 hover:text-stone-800 font-semibold"><X className="w-5 h-5" /> Back</button>
        <div className="text-center mb-6"><Shield className="w-12 h-12 mx-auto text-stone-700 mb-2" /><h2 className="text-2xl text-stone-800 brand-font">ADMIN LOGIN</h2></div>
        <div className="space-y-4">
          <div><label className="block text-sm font-bold text-stone-700 mb-1">Username</label><input type="text" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} className="w-full px-4 py-2 border-2 border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400" onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()} /></div>
          <div><label className="block text-sm font-bold text-stone-700 mb-1">Password</label><input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full px-4 py-2 border-2 border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400" onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()} /></div>
          {loginError && <p className="text-red-500 text-sm text-center font-semibold">{loginError}</p>}
          <button onClick={handleAdminLogin} className="w-full py-3 bg-stone-800 text-white rounded-lg font-bold hover:bg-stone-700 transition-colors">Login</button>
        </div>
      </div>
    </div>
  );

  const renderAdminPanel = () => (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl text-stone-800 flex items-center gap-2 brand-font"><Shield className="w-6 h-6" /> ADMIN PANEL</h1>
          <button onClick={handleAdminLogout} className="flex items-center gap-1 text-stone-600 hover:text-stone-800 font-semibold"><LogOut className="w-5 h-5" /> Logout</button>
        </div>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[['verifications', Eye, 'Verifications'], ['current', Edit3, 'Edit Month'], ['stamps', Trophy, 'Edit Stamps'], ['history', History, 'History'], ['generate', Shuffle, 'New Month']].map(([tab, Icon, label]) => (
            <button key={tab} onClick={() => setAdminTab(tab)} className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap flex items-center gap-1 ${adminTab === tab ? 'bg-stone-800 text-white' : 'bg-white text-stone-600 hover:bg-stone-100'}`}>
              <Icon className="w-4 h-4" />{label}
              {tab === 'verifications' && pendingVerifications.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingVerifications.reduce((acc, m) => acc + (m.pendingHaircut ? 1 : 0) + (m.pendingMeal ? 1 : 0), 0)}</span>}
            </button>
          ))}
        </div>

        {adminTab === 'current' && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <h2 className="font-bold text-stone-800 mb-4 flex items-center gap-2 brand-font"><Edit3 className="w-5 h-5" /> EDIT CURRENT MONTH</h2>
            <div className="space-y-4">
              <div className="p-3 bg-stone-50 rounded-lg"><p className="text-sm text-stone-500 font-bold mb-1">Month</p><p className="font-bold text-lg">{currentMonth.month}</p></div>
              <div className="p-3 bg-stone-50 rounded-lg">
                <p className="text-sm text-stone-500 font-bold mb-1">Cuisine</p>
                {editingCuisine ? (
                  <div className="flex gap-2">
                    <select value={tempCuisine} onChange={(e) => setTempCuisine(e.target.value)} className="flex-1 px-3 py-2 border-2 border-stone-300 rounded-lg">{CUISINES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                    <button onClick={async () => { await updateCurrentMonth('cuisine', tempCuisine); setEditingCuisine(false); }} disabled={isSaving} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">Save</button>
                    <button onClick={() => setEditingCuisine(false)} className="px-4 py-2 bg-stone-300 text-stone-700 rounded-lg font-semibold">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between"><p className="font-bold text-lg text-red-600">{currentMonth.cuisine}</p><button onClick={() => { setTempCuisine(currentMonth.cuisine); setEditingCuisine(true); }} className="px-3 py-1 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600"><Edit3 className="w-4 h-4 inline mr-1" />Edit</button></div>
                )}
              </div>
              <div className="p-3 bg-stone-50 rounded-lg">
                <p className="text-sm text-stone-500 font-bold mb-1">Organiser</p>
                {editingOrganiser ? (
                  <div className="flex gap-2">
                    <select value={tempOrganiser} onChange={(e) => setTempOrganiser(e.target.value)} className="flex-1 px-3 py-2 border-2 border-stone-300 rounded-lg">{members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}</select>
                    <button onClick={async () => { await updateCurrentMonth('organiser', tempOrganiser); setEditingOrganiser(false); }} disabled={isSaving} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">Save</button>
                    <button onClick={() => setEditingOrganiser(false)} className="px-4 py-2 bg-stone-300 text-stone-700 rounded-lg font-semibold">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between"><p className="font-bold text-lg">{currentMonth.organiser}</p><button onClick={() => { setTempOrganiser(currentMonth.organiser); setEditingOrganiser(true); }} className="px-3 py-1 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600"><Edit3 className="w-4 h-4 inline mr-1" />Edit</button></div>
                )}
              </div>
              <div className="p-3 bg-stone-50 rounded-lg">
                <p className="text-sm text-stone-500 font-bold mb-1">Restaurant</p>
                {editingRestaurant ? (
                  <div className="flex gap-2">
                    <input type="text" value={tempRestaurant} onChange={(e) => setTempRestaurant(e.target.value)} className="flex-1 px-3 py-2 border-2 border-stone-300 rounded-lg" />
                    <button onClick={async () => { await updateCurrentMonth('restaurant', tempRestaurant); setEditingRestaurant(false); }} disabled={isSaving} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">Save</button>
                    <button onClick={() => setEditingRestaurant(false)} className="px-4 py-2 bg-stone-300 text-stone-700 rounded-lg font-semibold">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between"><p className="font-bold text-lg">{currentMonth.restaurant}</p><button onClick={() => { setTempRestaurant(currentMonth.restaurant); setEditingRestaurant(true); }} className="px-3 py-1 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600"><Edit3 className="w-4 h-4 inline mr-1" />Edit</button></div>
                )}
              </div>
              <div className="p-3 bg-stone-50 rounded-lg">
                <p className="text-sm text-stone-500 font-bold mb-1">Location</p>
                {editingLocation ? (
                  <div className="flex gap-2">
                    <input type="text" value={tempLocation} onChange={(e) => setTempLocation(e.target.value)} className="flex-1 px-3 py-2 border-2 border-stone-300 rounded-lg" />
                    <button onClick={async () => { await updateCurrentMonth('location', tempLocation); setEditingLocation(false); }} disabled={isSaving} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">Save</button>
                    <button onClick={() => setEditingLocation(false)} className="px-4 py-2 bg-stone-300 text-stone-700 rounded-lg font-semibold">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between"><p className="font-bold text-lg">{currentMonth.location}</p><button onClick={() => { setTempLocation(currentMonth.location); setEditingLocation(true); }} className="px-3 py-1 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600"><Edit3 className="w-4 h-4 inline mr-1" />Edit</button></div>
                )}
              </div>
              <div className="p-3 bg-stone-50 rounded-lg">
                <p className="text-sm text-stone-500 font-bold mb-1">Date</p>
                {editingDate ? (
                  <div className="flex gap-2">
                    <input type="text" value={tempDate} onChange={(e) => setTempDate(e.target.value)} placeholder="e.g. Friday 31st January" className="flex-1 px-3 py-2 border-2 border-stone-300 rounded-lg" />
                    <button onClick={async () => { await updateCurrentMonth('date', tempDate); setEditingDate(false); }} disabled={isSaving} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">Save</button>
                    <button onClick={() => setEditingDate(false)} className="px-4 py-2 bg-stone-300 text-stone-700 rounded-lg font-semibold">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between"><p className="font-bold text-lg">{currentMonth.date}</p><button onClick={() => { setTempDate(currentMonth.date); setEditingDate(true); }} className="px-3 py-1 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600"><Edit3 className="w-4 h-4 inline mr-1" />Edit</button></div>
                )}
              </div>
            </div>
          </div>
        )}

        {adminTab === 'generate' && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <h2 className="font-bold text-stone-800 mb-3 flex items-center gap-2 brand-font"><Shuffle className="w-5 h-5" /> GENERATE NEW MONTH</h2>
            <div className="mb-3 p-3 bg-stone-50 rounded-lg">
              <p className="text-sm text-stone-600">Current: <span className="font-bold">{currentMonth.month}</span></p>
              <p className="text-sm text-stone-600">Cuisine: <span className="font-bold text-red-600">{currentMonth.cuisine}</span></p>
              <p className="text-sm text-stone-600">Organiser: <span className="font-bold">{currentMonth.organiser}</span></p>
            </div>
            <p className="text-sm text-stone-500 mb-3">Saves current month to history and generates new random cuisine & organiser.</p>
            <button onClick={generateNewMonth} disabled={isSaving} className="w-full py-3 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 disabled:opacity-50">{isSaving ? 'Saving...' : 'Generate Next Month'}</button>
          </div>
        )}

        {adminTab === 'verifications' && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <h2 className="font-bold text-stone-800 mb-3 flex items-center gap-2 brand-font"><Eye className="w-5 h-5" /> PENDING VERIFICATIONS</h2>
            {pendingVerifications.length === 0 ? <p className="text-stone-500 text-center py-4">No pending verifications</p> : (
              <div className="grid gap-4 sm:grid-cols-2">
                {pendingVerifications.map(member => (
                  <div key={member.id}>
                    {member.pendingHaircut && (
                      <div className="border-2 border-stone-200 rounded-lg p-3 mb-2">
                        <div className="flex items-center gap-2 mb-2"><Scissors className="w-4 h-4 text-red-600" /><span className="font-bold">{member.name} - Haircut</span></div>
                        <img src={member.pendingHaircut} alt="Proof" className="w-full h-40 object-cover rounded-lg mb-2" />
                        <div className="flex gap-2">
                          <button onClick={() => approveStamp(member.id, 'haircut')} disabled={isSaving} className="flex-1 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center gap-1 hover:bg-green-700 font-semibold disabled:opacity-50"><Check className="w-4 h-4" /> Approve</button>
                          <button onClick={() => rejectStamp(member.id, 'haircut')} disabled={isSaving} className="flex-1 py-2 bg-red-600 text-white rounded-lg flex items-center justify-center gap-1 hover:bg-red-700 font-semibold disabled:opacity-50"><X className="w-4 h-4" /> Reject</button>
                        </div>
                      </div>
                    )}
                    {member.pendingMeal && (
                      <div className="border-2 border-stone-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2"><UtensilsCrossed className="w-4 h-4 text-amber-600" /><span className="font-bold">{member.name} - Meal</span></div>
                        <img src={member.pendingMeal} alt="Proof" className="w-full h-40 object-cover rounded-lg mb-2" />
                        <div className="flex gap-2">
                          <button onClick={() => approveStamp(member.id, 'meal')} disabled={isSaving} className="flex-1 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center gap-1 hover:bg-green-700 font-semibold disabled:opacity-50"><Check className="w-4 h-4" /> Approve</button>
                          <button onClick={() => rejectStamp(member.id, 'meal')} disabled={isSaving} className="flex-1 py-2 bg-red-600 text-white rounded-lg flex items-center justify-center gap-1 hover:bg-red-700 font-semibold disabled:opacity-50"><X className="w-4 h-4" /> Reject</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {adminTab === 'stamps' && (
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="font-bold text-stone-800 mb-3 flex items-center gap-2 brand-font"><Trophy className="w-5 h-5 text-amber-500" /> EDIT MEMBER STAMPS</h2>
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="p-3 bg-stone-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2"><span className="font-bold text-stone-800">{member.name}{isFoundingMember(member.name) && <FoundingBadge />}</span><span className="text-sm text-stone-500">Total: {member.haircuts + member.meals}</span></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-red-600" />
                      <button onClick={() => adjustStamps(member.id, 'haircut', -1)} disabled={isSaving || member.haircuts === 0} className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 disabled:opacity-50"><Minus className="w-4 h-4" /></button>
                      <span className="font-bold text-lg w-8 text-center">{member.haircuts}</span>
                      <button onClick={() => adjustStamps(member.id, 'haircut', 1)} disabled={isSaving} className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 disabled:opacity-50"><Plus className="w-4 h-4" /></button>
                    </div>
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                      <button onClick={() => adjustStamps(member.id, 'meal', -1)} disabled={isSaving || member.meals === 0} className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center hover:bg-amber-200 disabled:opacity-50"><Minus className="w-4 h-4" /></button>
                      <span className="font-bold text-lg w-8 text-center">{member.meals}</span>
                      <button onClick={() => adjustStamps(member.id, 'meal', 1)} disabled={isSaving} className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center hover:bg-amber-200 disabled:opacity-50"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {adminTab === 'history' && (
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="font-bold text-stone-800 mb-3 flex items-center gap-2 brand-font"><History className="w-5 h-5" /> MANAGE HISTORY</h2>
            {history.length === 0 ? <p className="text-stone-500 text-center py-4">No history yet.</p> : (
              <div className="space-y-4">
                {history.map((entry) => (
                  <div key={entry.id} className="border-2 border-stone-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div><h4 className="font-bold text-stone-800">{entry.month}</h4><p className="text-sm text-stone-500">{entry.cuisine} at {entry.restaurant}</p><p className="text-sm text-stone-500">Organised by: {entry.organiser}</p></div>
                      <button onClick={() => restoreFromHistory(entry)} disabled={isSaving} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"><RotateCcw className="w-4 h-4" />Restore</button>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-bold text-stone-600 mb-2">Group Photo:</p>
                      {entry.photo ? (
                        <div className="relative">
                          <img src={entry.photo} alt="Group" className="w-full h-48 object-cover rounded-lg" />
                          <label className="absolute bottom-2 right-2 bg-white/90 px-3 py-1 rounded-lg text-sm font-semibold cursor-pointer hover:bg-white">Change<input type="file" accept="image/*" className="hidden" onChange={(e) => handleHistoryPhotoUpload(e, entry.id)} /></label>
                        </div>
                      ) : (
                        <label className="block border-2 border-dashed border-stone-300 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400"><Upload className="w-8 h-8 mx-auto text-stone-400 mb-2" /><p className="text-stone-500 font-semibold">Upload group photo</p><input type="file" accept="image/*" className="hidden" onChange={(e) => handleHistoryPhotoUpload(e, entry.id)} /></label>
                      )}
                    </div>
                    {entry.verificationPhotos && entry.verificationPhotos.length > 0 && (
                      <div className="border-t border-stone-200 pt-4">
                        <p className="text-sm font-bold text-stone-600 mb-2">Verification Photos ({entry.verificationPhotos.length}):</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {entry.verificationPhotos.map((vp, idx) => (
                            <div key={idx} className="relative">
                              <img src={vp.photo} alt={`${vp.memberName}`} className="w-full h-24 object-cover rounded-lg" />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-lg"><span className="flex items-center gap-1">{vp.type === 'haircut' ? <Scissors className="w-3 h-3" /> : <UtensilsCrossed className="w-3 h-3" />}{vp.memberName}</span></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  switch (currentView) {
    case 'member': return renderMemberCard();
    case 'admin-login': return renderAdminLogin();
    case 'admin': return renderAdminPanel();
    default: return renderHome();
  }
}
