import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [players, setPlayers] = useState([]);
  const [filters, setFilters] = useState({
    gameMode: 'Tümü',
    lookingFor: 'Tümü',
    micOnly: false
  });
  const [loading, setLoading] = useState(true);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    username: '',
    tag: '',
    lobby_code: '',
    min_rank: 'Demir',
    max_rank: 'Radyant',
    age_range: '18+',
    looking_for: '1 Kişi',
    game_mode: 'Dereceli',
    mic_enabled: true
  });
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    fetchPlayers();
    // Auto refresh every 30 seconds to remove old players
    const interval = setInterval(fetchPlayers, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [filters]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/players?game=valorant`;
      
      if (filters.gameMode !== 'Tümü') {
        url += `&game_mode=${encodeURIComponent(filters.gameMode)}`;
      }
      if (filters.lookingFor !== 'Tümü') {
        url += `&looking_for=${encodeURIComponent(filters.lookingFor)}`;
      }
      if (filters.micOnly) {
        url += `&mic_only=true`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const copyLobbyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast('Lobi kodu kopyalandı!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Lobi kodu kopyalandı!');
    }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPlayer,
          game: 'valorant'
        }),
      });
      
      if (response.ok) {
        setNewPlayer({
          username: '',
          tag: '',
          lobby_code: '',
          min_rank: 'Demir',
          max_rank: 'Radyant',
          age_range: '18+',
          looking_for: '1 Kişi',
          game_mode: 'Dereceli',
          mic_enabled: true
        });
        setShowAddPlayer(false);
        fetchPlayers(); // Refresh to show new player at top
        showToast('Oyuncu başarıyla eklendi!');
      }
    } catch (error) {
      console.error('Error adding player:', error);
      showToast('Oyuncu eklenirken hata oluştu!');
    }
  };

  const getTimeAgo = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now - created) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Şimdi';
    if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;
    const hours = Math.floor(diffInMinutes / 60);
    if (hours === 1) return '1 sa önce';
    return `${hours} sa önce`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
          <div className="flex items-center space-x-2">
            <span>✅</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header with centered logo */}
      <header className="bg-[#040509] backdrop-blur-sm border-b border-red-600/30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-center items-center">
          <img 
            src="https://i.hizliresim.com/5t50he5.png" 
            alt="VALOMATE" 
            className="h-10 w-auto"
          />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Modern Filters */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 border border-gray-800 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="block text-white text-sm font-semibold">Oyun Modu</label>
              <select 
                value={filters.gameMode}
                onChange={(e) => setFilters(prev => ({...prev, gameMode: e.target.value}))}
                className="w-full bg-black/50 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-red-500 focus:outline-none transition-all text-sm sm:text-base"
              >
                <option value="Tümü">Tümü</option>
                <option value="Dereceli">Dereceli</option>
                <option value="Premier">Premier</option>
                <option value="Derecesiz">Derecesiz</option>
                <option value="Tam Gaz">Tam Gaz</option>
                <option value="Özel Oyun">Özel Oyun</option>
                <option value="1vs1">1vs1</option>
                <option value="2vs2">2vs2</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-white text-sm font-semibold">Aranan Kişi</label>
              <select 
                value={filters.lookingFor}
                onChange={(e) => setFilters(prev => ({...prev, lookingFor: e.target.value}))}
                className="w-full bg-black/50 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-red-500 focus:outline-none transition-all text-sm sm:text-base"
              >
                <option value="Tümü">Tümü</option>
                <option value="1 Kişi">1 Kişi</option>
                <option value="2 Kişi">2 Kişi</option>
                <option value="3 Kişi">3 Kişi</option>
                <option value="4 Kişi">4 Kişi</option>
                <option value="5 Kişi">5 Kişi</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-white text-sm font-semibold">Mikrofon</label>
              <div className="flex items-center space-x-3 h-12">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.micOnly}
                    onChange={(e) => setFilters(prev => ({...prev, micOnly: e.target.checked}))}
                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-white font-medium text-sm sm:text-base">🎤 Sadece mikrofonlu</span>
                </label>
              </div>
            </div>

            <div className="flex items-end">
              <button 
                onClick={fetchPlayers}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 w-full shadow-lg text-sm sm:text-base"
              >
                🎮 Uygula / Yenile
              </button>
            </div>
          </div>
        </div>

        {/* Modern Players Table */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
          {/* Mobile-friendly table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/50">
                <tr>
                  <th className="text-left text-white px-6 py-4 font-semibold">KULLANICI</th>
                  <th className="text-left text-white px-6 py-4 font-semibold">LOBİ KODU</th>
                  <th className="text-left text-white px-6 py-4 font-semibold">MIN - MAKS RANK</th>
                  <th className="text-left text-white px-6 py-4 font-semibold">YAŞ ARALIĞI</th>
                  <th className="text-left text-white px-6 py-4 font-semibold">ARANAN</th>
                  <th className="text-left text-white px-6 py-4 font-semibold">OYUN MODU</th>
                  <th className="text-left text-white px-6 py-4 font-semibold">MİKROFON</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-400">Yükleniyor...</td>
                  </tr>
                ) : players.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-400">Oyuncu bulunamadı</td>
                  </tr>
                ) : (
                  players.map((player, index) => (
                    <tr key={player.id || index} className="hover:bg-gray-800/50 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                            <span className="text-lg">V</span>
                          </div>
                          <div>
                            <div className="text-white font-semibold">{player.username}</div>
                            <div className="text-red-400 text-sm font-mono">#{player.tag}</div>
                            <div className="text-gray-400 text-xs">{getTimeAgo(player.created_at)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => copyLobbyCode(player.lobby_code)}
                          className="text-red-400 font-mono font-bold text-lg hover:text-red-300 transition-colors cursor-pointer bg-gray-800/50 px-3 py-1 rounded-lg hover:bg-gray-700/50"
                        >
                          {player.lobby_code}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-sm font-medium">{player.min_rank}</span>
                          <span className="text-gray-500">-</span>
                          <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-sm font-medium">{player.max_rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">{player.age_range}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-800/50 text-gray-300 px-3 py-1 rounded-full text-sm">{player.looking_for}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300 text-sm">{player.game_mode}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <span className={`text-xl ${player.mic_enabled ? 'text-red-400' : 'text-gray-600'} transition-colors`}>
                            🎤
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="lg:hidden space-y-4 p-4">
            {loading ? (
              <div className="text-center py-8 text-gray-400">Yükleniyor...</div>
            ) : players.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Oyuncu bulunamadı</div>
            ) : (
              players.map((player, index) => (
                <div key={player.id || index} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      <span className="text-lg">V</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold">{player.username}</div>
                      <div className="text-red-400 text-sm font-mono">#{player.tag}</div>
                      <div className="text-gray-400 text-xs">{getTimeAgo(player.created_at)}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg ${player.mic_enabled ? 'text-red-400' : 'text-gray-600'}`}>🎤</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Lobi:</span>
                      <button
                        onClick={() => copyLobbyCode(player.lobby_code)}
                        className="ml-2 text-red-400 font-mono font-bold hover:text-red-300 transition-colors"
                      >
                        {player.lobby_code}
                      </button>
                    </div>
                    <div>
                      <span className="text-gray-400">Yaş:</span>
                      <span className="ml-2 text-white">{player.age_range}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Aranan:</span>
                      <span className="ml-2 text-gray-300">{player.looking_for}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Mod:</span>
                      <span className="ml-2 text-gray-300">{player.game_mode}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-3">
                    <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-xs font-medium">{player.min_rank}</span>
                    <span className="text-gray-500 text-xs">-</span>
                    <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-xs font-medium">{player.max_rank}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Auto-cleanup notice */}
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            🕒 Oyuncu aramaları 30 dakika sonra otomatik olarak silinir
          </p>
        </div>

        {/* Modern Add Player Modal */}
        {showAddPlayer && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 w-full max-w-2xl border border-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-white text-xl sm:text-2xl font-bold mb-6">Oyuncu Ara</h3>
              <form onSubmit={handleAddPlayer} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">Kullanıcı Adı</label>
                    <input
                      type="text"
                      value={newPlayer.username}
                      onChange={(e) => setNewPlayer(prev => ({...prev, username: e.target.value}))}
                      className="w-full bg-black/50 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-red-500 focus:outline-none transition-all text-sm sm:text-base"
                      required
                      placeholder="Kullanıcı adınız"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">Tag</label>
                    <input
                      type="text"
                      value={newPlayer.tag}
                      onChange={(e) => setNewPlayer(prev => ({...prev, tag: e.target.value}))}
                      className="w-full bg-black/50 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-red-500 focus:outline-none transition-all text-sm sm:text-base"
                      required
                      placeholder="#ABC123"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-semibold mb-2">Lobi Kodu</label>
                  <input
                    type="text"
                    value={newPlayer.lobby_code}
                    onChange={(e) => setNewPlayer(prev => ({...prev, lobby_code: e.target.value}))}
                    className="w-full bg-black/50 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-red-500 focus:outline-none transition-all text-sm sm:text-base"
                    placeholder="ABC12 (boş bırakılırsa otomatik oluşur)"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">Minimum Rank</label>
                    <select
                      value={newPlayer.min_rank}
                      onChange={(e) => setNewPlayer(prev => ({...prev, min_rank: e.target.value}))}
                      className="w-full bg-black/50 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-red-500 focus:outline-none transition-all text-sm sm:text-base"
                    >
                      <option value="Demir">Demir</option>
                      <option value="Bronz">Bronz</option>
                      <option value="Gümüş">Gümüş</option>
                      <option value="Altın">Altın</option>
                      <option value="Platin">Platin</option>
                      <option value="Elmas">Elmas</option>
                      <option value="Asens">Asens</option>
                      <option value="Ölümsüz">Ölümsüz</option>
                      <option value="Radyant">Radyant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">Maksimum Rank</label>
                    <select
                      value={newPlayer.max_rank}
                      onChange={(e) => setNewPlayer(prev => ({...prev, max_rank: e.target.value}))}
                      className="w-full bg-black/50 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-red-500 focus:outline-none transition-all text-sm sm:text-base"
                    >
                      <option value="Demir">Demir</option>
                      <option value="Bronz">Bronz</option>
                      <option value="Gümüş">Gümüş</option>
                      <option value="Altın">Altın</option>
                      <option value="Platin">Platin</option>
                      <option value="Elmas">Elmas</option>
                      <option value="Asens">Asens</option>
                      <option value="Ölümsüz">Ölümsüz</option>
                      <option value="Radyant">Radyant</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">Yaş Aralığı</label>
                    <select
                      value={newPlayer.age_range}
                      onChange={(e) => setNewPlayer(prev => ({...prev, age_range: e.target.value}))}
                      className="w-full bg-black/50 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-red-500 focus:outline-none transition-all text-sm sm:text-base"
                    >
                      <option value="13-">13-</option>
                      <option value="14-17">14-17</option>
                      <option value="18+">18+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">Aranan</label>
                    <select
                      value={newPlayer.looking_for}
                      onChange={(e) => setNewPlayer(prev => ({...prev, looking_for: e.target.value}))}
                      className="w-full bg-black/50 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-red-500 focus:outline-none transition-all text-sm sm:text-base"
                    >
                      <option value="1 Kişi">1 Kişi</option>
                      <option value="2 Kişi">2 Kişi</option>
                      <option value="3 Kişi">3 Kişi</option>
                      <option value="4 Kişi">4 Kişi</option>
                      <option value="5 Kişi">5 Kişi</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-semibold mb-2">Oyun Modu</label>
                  <select
                    value={newPlayer.game_mode}
                    onChange={(e) => setNewPlayer(prev => ({...prev, game_mode: e.target.value}))}
                    className="w-full bg-black/50 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-red-500 focus:outline-none transition-all text-sm sm:text-base"
                  >
                    <option value="Dereceli">Dereceli</option>
                    <option value="Premier">Premier</option>
                    <option value="Derecesiz">Derecesiz</option>
                    <option value="Tam Gaz">Tam Gaz</option>
                    <option value="Özel Oyun">Özel Oyun</option>
                    <option value="1vs1">1vs1</option>
                    <option value="2vs2">2vs2</option>
                  </select>
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newPlayer.mic_enabled}
                      onChange={(e) => setNewPlayer(prev => ({...prev, mic_enabled: e.target.checked}))}
                      className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-white font-medium text-sm sm:text-base">🎤 Mikrofon</span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddPlayer(false)}
                    className="flex-1 bg-gray-700 text-white py-3 rounded-xl hover:bg-gray-600 transition-all font-semibold text-sm sm:text-base"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-semibold transform hover:scale-105 text-sm sm:text-base"
                  >
                    Ekle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bottom Center Add Player Button - Smaller and Mobile Responsive */}
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2">
          <button 
            onClick={() => setShowAddPlayer(true)}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold shadow-xl hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-110 flex items-center space-x-2 border-2 border-red-500/30 text-sm sm:text-base"
          >
            <span className="text-sm sm:text-lg">👥</span>
            <span>Oyuncu Ara</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;