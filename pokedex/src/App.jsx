import { useState, useRef, useEffect } from 'react'
import './App.css'

export default function App() {
  const [query, setQuery] = useState('')
  const [pokemon, setPokemon] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [randomList, setRandomList] = useState([])
  const [randomLoading, setRandomLoading] = useState(false)

  const [modal, setModal] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [artworkReady, setArtworkReady] = useState(false)

  const galleryRef = useRef(null)

  const doSearch = async () => {
    const name = query.trim().toLowerCase()
    if (!name) return
    setLoading(true)
    setError('')
    setPokemon(null)
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      if (!res.ok) throw new Error('Pokémon not found!')
      const data = await res.json()
      const stats = {}
      data.stats.forEach(s => { stats[s.stat.name] = s.base_stat })
      setPokemon({
        name: data.name, id: data.id,
        image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
        types: data.types.map(t => t.type.name),
        height: data.height / 10, weight: data.weight / 10, stats,
      })
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') doSearch() }

  const handleStartAdventure = async () => {
    galleryRef.current?.scrollIntoView({ behavior: 'smooth' })
    if (randomLoading) return
    setRandomLoading(true)
    setRandomList([])
    try {
      const ids = []
      while (ids.length < 35) {
        const id = Math.floor(Math.random() * 1010) + 1
        if (!ids.includes(id)) ids.push(id)
      }
      const BATCH = 12
      const allResults = []
      for (let i = 0; i < ids.length; i += BATCH) {
        const results = await Promise.all(
          ids.slice(i, i + BATCH).map(id =>
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
              .then(r => r.json())
              .then(d => ({
                id: d.id, name: d.name,
                sprite: d.sprites.front_default,
                artwork: d.sprites.other['official-artwork'].front_default,
                types: d.types.map(t => t.type.name),
              }))
          )
        )
        allResults.push(...results)
        setRandomList([...allResults])

        // silently preload all artworks in this batch right away
        results.forEach(p => {
          if (p.artwork) {
            const img = new Image()
            img.src = p.artwork
          }
        })
      }
    } catch (e) { console.error(e) }
    finally { setRandomLoading(false) }
  }

  // preload artwork on hover (before click)
  const preloadArtwork = (artwork) => {
    if (artwork) {
      const img = new Image()
      img.src = artwork
    }
  }

  const openModal = async (p) => {
    setArtworkReady(false)
    setModalLoading(true)
    // open immediately with sprite so something is visible right away
    setModal({
      id: p.id, name: p.name,
      sprite: p.sprite,
      artwork: p.artwork,
      types: p.types,
      stats: null,
    })

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.id}`)
      const data = await res.json()
      const stats = {}
      data.stats.forEach(s => { stats[s.stat.name] = s.base_stat })
      setModal(prev => ({
        ...prev,
        height: data.height / 10,
        weight: data.weight / 10,
        stats,
      }))
    } catch (e) { console.error(e) }
    finally { setModalLoading(false) }
  }

  const closeModal = () => { setModal(null); setArtworkReady(false) }

  const statLabel = {
    hp: 'HP', attack: 'ATK', defense: 'DEF',
    'special-attack': 'SP.ATK', 'special-defense': 'SP.DEF', speed: 'SPD',
  }

  const typeColors = {
    fire: '#F08030', water: '#6890F0', grass: '#78C850', electric: '#F8D030',
    psychic: '#F85888', ice: '#98D8D8', dragon: '#7038F8', dark: '#705848',
    fairy: '#EE99AC', normal: '#A8A878', fighting: '#C03028', flying: '#A890F0',
    poison: '#A040A0', ground: '#E0C068', rock: '#B8A038', bug: '#A8B820',
    ghost: '#705898', steel: '#B8B8D0',
  }

  return (
    <>
      <div id="page">
        <div className="navbar">
          <div><button>HOME</button><button>POKÉMONS</button></div>
          <div><button>ABOUT</button></div>
        </div>

        <div className="hero">
          <div className="box">
            <div className="search-box">
              <h1>EXPLORE THE POKÉDEX</h1>
              <div className="search">
                <input
                  type="text" placeholder="Search Pokémon..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button onClick={doSearch}>🔍</button>
              </div>
            </div>

            {loading && <div className="card"><div className="card-loading">⏳ Searching Pokédex...</div></div>}
            {error && <div className="card"><div className="card-error">❌ {error}</div></div>}

            {pokemon && !loading && (
              <div className="card">
                <div className="card-header">
                  <span className="card-id">#{String(pokemon.id).padStart(3, '0')}</span>
                  <h2 className="card-name">{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
                  <div className="card-types">
                    {pokemon.types.map(t => (
                      <span key={t} className="type-badge" style={{ background: typeColors[t] || '#888' }}>{t.toUpperCase()}</span>
                    ))}
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-image-wrap">
                    <img src={pokemon.image} alt={pokemon.name} className="card-image" loading="lazy" />
                    <div className="card-meta">
                      <span>📏 {pokemon.height} m</span>
                      <span>⚖️ {pokemon.weight} kg</span>
                    </div>
                  </div>
                  <div className="card-stats">
                    {Object.entries(pokemon.stats).map(([key, val]) => (
                      <div key={key} className="stat-row">
                        <span className="stat-label">{statLabel[key] || key.toUpperCase()}</span>
                        <div className="stat-bar-bg">
                          <div className="stat-bar-fill" style={{ width: `${Math.min((val / 255) * 100, 100)}%` }} />
                        </div>
                        <span className="stat-value">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button className="cta" onClick={handleStartAdventure}>
              START YOUR ADVENTURE
              <small>Discover all 1000+ Pokémon</small>
            </button>
          </div>
        </div>
      </div>

      {/* ── GALLERY ── */}
      <div className="gallery-section" ref={galleryRef}>
        <div className="gallery-header">
          <h2>✨ Random Pokémon</h2>
          <button className="refresh-btn" onClick={handleStartAdventure} disabled={randomLoading}>
            {randomLoading ? '⏳ Loading...' : '🔀 Shuffle'}
          </button>
        </div>

        {randomLoading && randomList.length === 0 && (
          <div className="gallery-loading">
            <div className="pokeball-spin">⚪</div>
            <p>Loading Pokémon...</p>
          </div>
        )}

        <div className="gallery-grid">
          {randomList.map((p, i) => (
            <div
              className="poke-card"
              key={p.id}
              style={{ animationDelay: `${(i % 12) * 0.04}s` }}
              onMouseEnter={() => preloadArtwork(p.artwork)}
              onClick={() => openModal(p)}
            >
              <div className="poke-card-img-wrap">
                <img
                  src={p.sprite} alt={p.name}
                  className="poke-card-img"
                  loading="lazy" width="96" height="96"
                />
              </div>
              <div className="poke-card-info">
                <span className="poke-card-id">#{String(p.id).padStart(3, '0')}</span>
                <span className="poke-card-name">{p.name.charAt(0).toUpperCase() + p.name.slice(1)}</span>
                <div className="poke-card-types">
                  {p.types.map(t => (
                    <span key={t} className="type-badge-sm" style={{ background: typeColors[t] || '#888' }}>{t.toUpperCase()}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODAL ── */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>

            <div className="modal-header" style={{ background: modal.types?.[0] ? typeColors[modal.types[0]] : '#cc0000' }}>
              <span className="modal-id">#{String(modal.id).padStart(3, '0')}</span>
              <h2 className="modal-name">{modal.name.charAt(0).toUpperCase() + modal.name.slice(1)}</h2>
              <div className="modal-types">
                {modal.types?.map(t => (
                  <span key={t} className="type-badge" style={{ background: typeColors[t] || '#888' }}>{t.toUpperCase()}</span>
                ))}
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-img-wrap">
                {/* sprite shown instantly, artwork fades in on top once ready */}
                <div className="modal-img-stack">
                  <img
                    src={modal.sprite}
                    alt={modal.name}
                    className="modal-img modal-img-sprite"
                    style={{ opacity: artworkReady ? 0 : 1 }}
                  />
                  {modal.artwork && (
                    <img
                      src={modal.artwork}
                      alt={modal.name}
                      className="modal-img modal-img-artwork"
                      style={{ opacity: artworkReady ? 1 : 0 }}
                      onLoad={() => setArtworkReady(true)}
                    />
                  )}
                </div>

                {modal.height && (
                  <div className="modal-meta">
                    <span>📏 {modal.height} m</span>
                    <span>⚖️ {modal.weight} kg</span>
                  </div>
                )}
              </div>

              <div className="modal-stats">
                {modalLoading && !modal.stats ? (
                  <div className="modal-stat-loading">
                    <div className="pokeball-spin" style={{ fontSize: 28 }}>⚪</div>
                  </div>
                ) : modal.stats ? (
                  Object.entries(modal.stats).map(([key, val]) => (
                    <div key={key} className="stat-row">
                      <span className="stat-label">{statLabel[key] || key.toUpperCase()}</span>
                      <div className="stat-bar-bg">
                        <div className="stat-bar-fill" style={{ width: `${Math.min((val / 255) * 100, 100)}%` }} />
                      </div>
                      <span className="stat-value">{val}</span>
                    </div>
                  ))
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}