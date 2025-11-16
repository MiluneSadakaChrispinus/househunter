import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import "./styles.css";

function App() {
  const [session, setSession] = useState(null);
  const [userType, setUserType] = useState(localStorage.getItem("userType") || "tenant");
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchProperties = useCallback(async () => {
    if (!session?.user) return;

    let query = supabase.from("properties").select("*");
    if (userType === "landlord") query = query.eq("owner_id", session.user.id);

    const { data, error } = await query;
    if (error) console.error("❌ Fetch error:", error.message);
    else setProperties(data || []);
  }, [session, userType]);

  useEffect(() => {
    if (session) fetchProperties();
  }, [session, fetchProperties]);

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem("userType");
    setSession(null);
  }

  if (!session) {
    return (
      <Auth
        onLogin={(sessionData, userTypeFromAuth) => {
          setSession(sessionData);
          setUserType(userTypeFromAuth);
          localStorage.setItem("userType", userTypeFromAuth);
        }}
      />
    );
  }

  return (
    <div className="app-container">
      <header>
        <h1>🏠 HouseHunt App</h1>
        <p>Logged in as: <b>{userType}</b></p>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <main>
        {userType === "tenant" ? (
          <TenantView properties={properties} />
        ) : (
          <LandlordView properties={properties} fetchProperties={fetchProperties} session={session} />
        )}
      </main>
    </div>
  );
}

/* ============================================================
   Tenant View
============================================================ */
function TenantView({ properties }) {
  return (
    <div>
      <h2>Available Properties</h2>
      <div className="listings">
        {properties.length === 0 && <p>No properties available yet.</p>}
        {properties.map((p) => (
          <div key={p.id} className="card">
            {p.image_url && <img src={p.image_url} alt={p.title} className="property-img" />}
            <h3>{p.title}</h3>
            <p>{p.location}</p>
            <p>Price: KES {p.price}</p>
            <p>Bedrooms: {p.bedrooms || "-"}</p>
            <p>Bathrooms: {p.bathrooms || "-"}</p>
            <p>Area: {p.area ? `${p.area} sqft` : "-"}</p>
            <p>Amenities: {p.amenities || "-"}</p>
            <p>Type: {p.type || "-"}</p>
            <p>Phone: {p.phone || "-"}</p>
            <p>Email: {p.email || "-"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Landlord View
============================================================ */
function LandlordView({ properties, fetchProperties, session }) {
  const [form, setForm] = useState({
    title: "", location: "", price: "", type: "Apartment", bedrooms: "", bathrooms: "", area: "",
    description: "", phone: "", email: "", amenities: "", latitude: "", longitude: "", full_address: "", imageUrl: ""
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    const f = e.target.files[0];
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function uploadImage(file) {
    try {
      setUploading(true);
      const fileName = `${session.user.id}-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("property-images").upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("property-images").getPublicUrl(fileName);
      return { publicUrl: urlData.publicUrl, fileName };
    } catch (err) {
      alert(`❌ Upload failed: ${err.message}`);
      return null;
    } finally { setUploading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const owner_id = session.user.id;
    let finalImageUrl = form.imageUrl;
    let storedFileName = null;

    if (file) {
      const uploaded = await uploadImage(file);
      if (!uploaded) return;
      finalImageUrl = uploaded.publicUrl;
      storedFileName = uploaded.fileName;
    }

    const propertyData = {
      ...form,
      price: parseFloat(form.price || 0),
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
      bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
      area: form.area ? parseFloat(form.area) : null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      owner_id,
      landlord: session.user.email,
      image_url: finalImageUrl,
      image_path: storedFileName
    };

    if (editId) {
      const { error } = await supabase.from("properties").update(propertyData).eq("id", editId).eq("owner_id", owner_id);
      if (error) alert(`❌ Update failed: ${error.message}`);
      else { alert("✅ Updated!"); clearForm(); fetchProperties(); }
    } else {
      const { error } = await supabase.from("properties").insert([propertyData]);
      if (error) alert(`❌ Add failed: ${error.message}`);
      else { alert("✅ Added!"); clearForm(); fetchProperties(); }
    }
  }

  async function deleteProperty(id, imagePath) {
    if (!window.confirm("Delete this property?")) return;
    try {
      if (imagePath) await supabase.storage.from("property-images").remove([imagePath]);
      const { error } = await supabase.from("properties").delete().eq("id", id).eq("owner_id", session.user.id);
      if (error) throw error;
      alert("🗑️ Deleted!");
      fetchProperties();
    } catch (err) {
      alert(`❌ Delete error: ${err.message}`);
    }
  }

  function startEdit(p) {
    setEditId(p.id);
    setForm({
      title: p.title || "",
      location: p.location || "",
      price: p.price || "",
      type: p.type || "Apartment",
      bedrooms: p.bedrooms || "",
      bathrooms: p.bathrooms || "",
      area: p.area || "",
      description: p.description || "",
      phone: p.phone || "",
      email: p.email || "",
      amenities: p.amenities || "",
      latitude: p.latitude || "",
      longitude: p.longitude || "",
      full_address: p.full_address || "",
      imageUrl: p.image_url || "" // <-- mapping Supabase column
    });
    setPreview(p.image_url || null);
    setFile(null);
  }

  function clearForm() {
    setEditId(null);
    setForm({
      title: "", location: "", price: "", type: "Apartment", bedrooms: "", bathrooms: "", area: "",
      description: "", phone: "", email: "", amenities: "", latitude: "", longitude: "", full_address: "", imageUrl: ""
    });
    setPreview(null);
    setFile(null);
  }

  return (
    <div>
      <h2>{editId ? "✏️ Edit Property" : "➕ Add Property"}</h2>

      <form onSubmit={handleSubmit} className="add-property-form">
        {Object.keys(form).map((key) => {
          if (key === "imageUrl") return null; // handled separately
          const typeAttr = ["price","bedrooms","bathrooms","area","latitude","longitude"].includes(key) ? "number" : "text";
          return <input key={key} type={typeAttr} name={key} placeholder={key.replace("_"," ")} value={form[key]} onChange={handleChange} />;
        })}

        <input type="text" name="imageUrl" placeholder="Image URL" value={form.imageUrl} onChange={handleChange} />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Preview" />
            <button type="button" onClick={() => { setFile(null); setPreview(null); }}>❌ Remove</button>
          </div>
        )}
        <button type="submit" disabled={uploading}>{uploading ? "Saving..." : editId ? "Save Changes" : "Add Property"}</button>
        {editId && <button type="button" onClick={clearForm}>Cancel Edit</button>}
      </form>

      <div className="listings">
        {properties.map((p) => (
          <div key={p.id} className="card">
            {p.image_url && <img src={p.image_url} alt={p.title} className="property-img" />}
            <h3>{p.title}</h3>
            <p>{p.location}</p>
            <p>Price: KES {p.price}</p>
            <p>Bedrooms: {p.bedrooms || "-"}</p>
            <p>Bathrooms: {p.bathrooms || "-"}</p>
            <p>Area: {p.area ? `${p.area} sqft` : "-"}</p>
            <p>Amenities: {p.amenities || "-"}</p>
            <p>Type: {p.type || "-"}</p>
            <p>Phone: {p.phone || "-"}</p>
            <p>Email: {p.email || "-"}</p>
            <p>Latitude: {p.latitude || "-"}</p>
            <p>Longitude: {p.longitude || "-"}</p>
            <p>Full Address: {p.full_address || "-"}</p>

            <button onClick={() => startEdit(p)}>✏️ Edit</button>
            <button onClick={() => deleteProperty(p.id, p.image_path)}>🗑️ Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
