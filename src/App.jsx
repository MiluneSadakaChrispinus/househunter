import React, { useState, useEffect, useCallback } from 'react'; 
import { supabase } from "./supabaseClient"; 
import Auth from "./Auth";
import LandlordView from "./LandlordView"; 
import { Home, Heart, PlusCircle, LayoutList, LogOut, User, DollarSign, BedDouble, Ruler, Loader2 } from 'lucide-react';
import "./styles.css";

// ====================================================================
// 📌 Property Card UI Component (Tenant List Item)
// ====================================================================
const PropertyCard = ({ property, favorites, toggleFavorite }) => {
  const isFavorite = favorites.includes(property.id);

  const handleCardClick = () => {
    console.log(`Navigating to property details for: ${property.title}`);
  };

  return (
    // ⬅️ Tailwind Utility Classes Reinstated
    <div 
      className="bg-white p-4 shadow-lg rounded-xl flex flex-col hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* ⬅️ Tailwind Utility Classes Reinstated */}
      <div className="w-full h-40 bg-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        {property.image_url ? (
            <img src={property.image_url} alt={property.title} className="w-full h-full object-cover" />
        ) : (
            <img
                src={`https://placehold.co/400x200/5E5E94/ffffff?text=${property.type || 'Property'}`}
                alt={property.title}
                className="w-full h-full object-cover"
            />
        )}
      </div>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{property.title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation(); 
            toggleFavorite(property.id);
          }}
          // ⬅️ Tailwind Utility Classes Reinstated
          className={`p-2 rounded-full ${
            isFavorite
              ? 'text-red-500 bg-red-100'
              : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
          }`}
        >
          <Heart fill={isFavorite ? 'currentColor' : 'none'} size={20} />
        </button>
      </div>
      {/* ⬅️ Tailwind Utility Classes Reinstated */}
      <p className="text-2xl font-extrabold text-indigo-600 mb-2">
        <DollarSign size={18} className="inline-block mr-1 translate-y-[-1px]" />
        {property.price ? property.price.toLocaleString('en-US') : 'N/A'}
      </p>
      <div className="flex text-sm text-gray-500 space-x-4">
        {/* ⬅️ Tailwind Utility Classes Reinstated */}
        <span className="flex items-center">
          <BedDouble size={14} className="mr-1 text-indigo-400" />
          {property.bedrooms || '—'} Beds
        </span>
        {/* ⬅️ Tailwind Utility Classes Reinstated */}
        <span className="flex items-center">
          <Ruler size={14} className="mr-1 text-indigo-400" />
          {property.area || '—'} sqft
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-2 capitalize">{property.type || 'Residential'}</p>
    </div>
  );
};


// ====================================================================
// 🏠 Listings Page Component (Tenant View with Search and Sort)
// ====================================================================
const ListingsPage = ({ title, initialProperties, loading, error, favorites, toggleFavorite }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("default");
  
  const searchedProperties = initialProperties.filter((p) =>
    ['title', 'type', 'location'].some((key) =>
      p[key]?.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
  );

  const finalProperties = [...searchedProperties].sort((a, b) => {
    const priceA = parseFloat(a.price);
    const priceB = parseFloat(b.price);
    if (sortOption === "low") return priceA - priceB;
    if (sortOption === "high") return priceB - priceA;
    return 0;
  });

  // ⬅️ Tailwind Utility Classes Reinstated
  const inputClasses = "p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 flex-grow mr-2 min-w-40";

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">{title}</h2>
      
      {/* ⬅️ Tailwind Utility Classes Reinstated */}
      <div className="flex flex-wrap items-center mb-6 p-4 bg-white rounded-xl shadow-md">
        <input
          type="text"
          placeholder="Search by title, type, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={inputClasses}
        />
        {searchTerm && (
          <button 
            // ⬅️ Tailwind Utility Classes Reinstated
            className="p-2 text-gray-500 hover:text-indigo-600 transition-colors mr-2"
            onClick={() => setSearchTerm("")}
          >
            Clear Search
          </button>
        )}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          // ⬅️ Tailwind Utility Classes Reinstated
          className="p-2 border border-gray-300 rounded-lg text-gray-700 bg-white"
        >
          <option value="default">Sort by</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>
      </div>

      {loading && <div className="text-center py-8 text-indigo-600 font-medium">Loading properties...</div>}
      {error && <div className="text-center py-8 text-red-500 font-medium">{error}</div>}
      
      {!loading && finalProperties.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <LayoutList size={40} className="mx-auto mb-2" />
          <p className="text-lg">No matching properties found.</p>
          {searchTerm && <button onClick={() => setSearchTerm("")} className="mt-2 text-indigo-600 font-medium hover:text-indigo-800">Clear Search</button>}
        </div>
      )}

      {/* ⬅️ Tailwind Utility Classes Reinstated */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {finalProperties.map((property) => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            favorites={favorites} 
            toggleFavorite={toggleFavorite} 
          />
        ))}
      </div>
    </div>
  );
};

// ====================================================================
// Landlord Page Wrapper
// ====================================================================
const LandlordPage = ({ properties, fetchProperties }) => {
    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <LandlordView properties={properties} fetchProperties={fetchProperties} />
        </div>
    );
};


// ====================================================================
// Main App Component (Auth-Aware)
// ====================================================================
const App = () => {
  const [session, setSession] = useState(null);
  const [userType, setUserType] = useState(localStorage.getItem('userType') || 'tenant');
  const [currentPage, setCurrentPage] = useState('listings');
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); 

  // --- AUTHENTICATION HANDLERS ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      
      if (session) {
        // Load stored user type and navigate to correct page
        const storedUserType = localStorage.getItem('userType') || 'tenant';
        setUserType(storedUserType);
        if (storedUserType === 'landlord') {
            setCurrentPage('add'); // Landlords start on the 'add' page
        } else {
            setCurrentPage('listings'); // Tenants start on 'listings'
        }
      } else {
        localStorage.removeItem('userType');
        setUserType('tenant'); 
        setCurrentPage('listings'); 
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        const storedUserType = localStorage.getItem('userType') || 'tenant';
        setUserType(storedUserType);
      } else {
        localStorage.removeItem('userType');
        setUserType('tenant');
        setCurrentPage('listings'); // Redirect on logout
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Conditional routing based on role after login/signup (PREVIOUSLY MODIFIED)
  const handleLogin = (newSession, newUserType) => {
    setSession(newSession);
    setUserType(newUserType);
    localStorage.setItem('userType', newUserType);
    
    // Redirect Landlord to 'add' page, Tenant to 'listings' page
    if (newUserType === 'landlord') {
        setCurrentPage('add');
    } else {
        setCurrentPage('listings'); 
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };


  // --- DATA HANDLERS ---
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, type, price, bedrooms, area, location, phone, latitude, longitude, image_url, owner_id'); 
      if (error) throw error;
      setProperties(data);
    } catch (e) {
      console.error('Error fetching properties:', e);
      setError('Could not load property listings.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFavorites = useCallback(async () => {
    if (!session?.user) {
        setFavorites([]);
        return;
    }
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', session.user.id);
      if (error) throw error;
      const ids = data.map(f => f.property_id);
      setFavorites(ids);
    } catch (e) {
      console.error('Error fetching favorites:', e);
    }
  }, [session]);

  useEffect(() => {
    if (!authLoading && session) { // Only fetch data if authenticated
      fetchProperties();
      fetchFavorites();
    } else if (!authLoading && !session) {
      // If not authenticated, still fetch properties for public viewing
      fetchProperties();
      setFavorites([]);
    }
  }, [authLoading, session, fetchProperties, fetchFavorites]);

  const toggleFavorite = useCallback(
    async (propertyId) => {
      if (!session) {
        alert("You must log in to favorite a property.");
        return;
      }
      const isFav = favorites.includes(propertyId);
      if (isFav) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('property_id', propertyId);
        if (error) return console.error('Error removing favorite:', error);
        setFavorites(favorites.filter(id => id !== propertyId));
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: session.user.id, property_id: propertyId, user_type: userType }); 
        if (error) return console.error('Error adding favorite:', error);
        setFavorites([...favorites, propertyId]);
      }
    },
    [favorites, session, userType]
  );

  // --- RENDER LOGIC ---

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (!session) {
    return <Auth onLogin={handleLogin} />;
  }

  const getPageContent = () => {
    // Filter properties for the LandlordView listing section display
    const landlordListings = properties.filter(p => p.owner_id === session.user.id);
    
    // Determine the list of properties for the TENANT-focused views
    const tenantListProps = currentPage === 'favorites'
      ? properties.filter(p => favorites.includes(p.id))
      : properties;

    switch (currentPage) {
      case 'listings':
      case 'favorites':
        return (
          <ListingsPage 
            title={currentPage === 'favorites' ? "Your Favorites" : "All Available Listings"} 
            initialProperties={tenantListProps}
            loading={loading}
            error={error}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        );
      case 'add': 
        return <LandlordPage 
                  properties={landlordListings} 
                  fetchProperties={fetchProperties} 
                />;
      default:
        return <ListingsPage title="All Available Listings" initialProperties={properties} loading={loading} error={error} favorites={favorites} toggleFavorite={toggleFavorite} />;
    }
  };

  const navItemClasses = (page) =>
    `flex flex-col items-center p-2 sm:px-4 sm:py-3 rounded-lg transition-colors duration-200 ${
      currentPage === page ? 'text-indigo-700 bg-indigo-100 font-semibold' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-indigo-600 tracking-tight flex items-center">
            <Home className="mr-2" size={24} />
            House Hunt
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <User size={18} />
            <span className="truncate max-w-28 font-medium capitalize">{userType} ({session.user.email})</span> 
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto pb-20">{getPageContent()}</main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 shadow-xl">
        <div className="max-w-lg mx-auto flex justify-around">
          <button onClick={() => setCurrentPage('listings')} className={navItemClasses('listings')}>
            <Home size={20} /><span className="text-xs mt-1 hidden sm:inline">Listings</span>
          </button>
          {userType !== 'landlord' && (
             <button onClick={() => setCurrentPage('favorites')} className={navItemClasses('favorites')}>
                <Heart size={20} /><span className="text-xs mt-1 hidden sm:inline">Favorites</span>
            </button>
          )}
          
          {/* Only show "List Property" button to landlords */}
          {userType === 'landlord' && (
            <button onClick={() => setCurrentPage('add')} className={navItemClasses('add')}>
              <PlusCircle size={20} /><span className="text-xs mt-1 hidden sm:inline">List Property</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default App;