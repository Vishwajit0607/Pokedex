import { useState } from 'react'
import './App.css'

export default function App() {
  const [query, setQuery] = useState('')

  const doSearch = () => {
    if (query.trim()) alert('Searching for: ' + query.trim())
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') doSearch()
  }

  return (
    <div id="page">

      {/* NAVBAR */}
      <div className="navbar">
        <div>
          <button>HOME</button>
          <button>POKÉMONS</button>
        </div>
        <div>
          <button>ABOUT</button>
        </div>
      </div>

      {/* HERO */}
      <div className="hero">
        <div className="box">

          {/* SEARCH BOX */}
          <div className="search-box">
            <h1>EXPLORE THE POKÉDEX</h1>
            <div className="search">
              <input
                type="text"
                placeholder="Search Pokémon..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button onClick={doSearch}>🔍</button>
            </div>
          </div>

          {/* CTA */}
          <button className="cta">
            START YOUR ADVENTURE
            <small>Discover all 1000+ Pokémon</small>
          </button>

        </div>
      </div>

    </div>
  )
}
