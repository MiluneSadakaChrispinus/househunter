import React, { useState } from "react";

function TenantView({ properties }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("default");

  // 🧠 Filter properties by title or location
  const filteredProperties = properties.filter((p) =>
    [p.title, p.location].some((field) =>
      field?.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
  );

  // 🪄 Sort properties by selected option
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortOption === "low") return a.price - b.price;
    if (sortOption === "high") return b.price - a.price;
    return 0; // default - no sorting
  });

  return (
    <div>
      <h2>Available Properties</h2>

      {/* 🔍 Search & Sort Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by title or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button className="clear-button" onClick={() => setSearchTerm("")}>
            ✖ Clear
          </button>
        )}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="sort-select"
        >
          <option value="default">Sort by</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>
      </div>

      {/* 🏡 Property Listings */}
      <div className="listings">
        {sortedProperties.length === 0 && (
          <p>No matching properties found.</p>
        )}

        {sortedProperties.map((p) => (
          <div key={p.id} className="card">
            {p.image_url && (
              <img
                src={p.image_url}
                alt={p.title}
                className="property-img"
              />
            )}
            <h3>{p.title}</h3>
            <p>{p.location}</p>
            <p>Price: KES {p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TenantView;
