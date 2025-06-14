import React, { useState, useEffect } from 'react';
import { Users, Play, RotateCw, Trophy, UserPlus, X, ChevronRight, Award, TrendingUp, Sun, Moon, Zap } from 'lucide-react';

const ElectricPickle = () => {
  // Pre-populated players - alphabetically sorted and subtly grouped
  const defaultPlayers = [
    'Allegra', 'Amy', 'Amy R.', 'Emily M.', 'Jackie', 'Kiki G.', 'Michelle R.', 
    'Nesli', 'Sophia', 'Susan H.', 'Thais', 'AJ P.', 'Alex G.', 'Allan', 
    'Andy M.', 'Bryan S.', 'Felix L.', 'Flip', 'Joe', 'John S.', 'Josh B.', 
    'Leonel S.', 'Lenny C.', 'Michael A.', 'Mike G.', 'Mikey G.', 'Pedro P.', 
    'Roger P.', 'Sandoval', 'Sean', 'Umut S.'
  ];

  const logoUrl = 'https://share.cleanshot.com/4KMmVHKT+';

  const [darkMode, setDarkMode] = useState(true);
  const [allPlayers, setAllPlayers] = useState(defaultPlayers);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [matches, setMatches] = useState([]);
  const [courts, setCourts] = useState([{ id: 1, currentMatch: null, matchHistory: [] }]);
  const [completedMatches, setCompletedMatches] = useState([]);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerStats, setPlayerStats] = useState({});
  const [showStats, setShowStats] = useState(false);
  const [numberOfCourts, setNumberOfCourts] = useState(1);
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Initialize player stats
  useEffect(() => {
    const stats = {};
    allPlayers.forEach(player => {
      stats[player] = { wins: 0, losses: 0, matches: 0 };
    });
    setPlayerStats(stats);
  }, []);

  // Theme classes
  const theme = {
    bg: darkMode ? 'bg-gray-950' : 'bg-gray-50',
    card: darkMode ? 'bg-gray-900/95 border-cyan-500/20' : 'bg-white/95 border-gray-200',
    cardAlt: darkMode ? 'bg-gray-800/90' : 'bg-gray-100/90',
    text: darkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-600',
    border: darkMode ? 'border-gray-800' : 'border-gray-200',
    hover: darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100',
    accent: darkMode ? 'from-cyan-400 to-green-400' : 'from-green-500 to-blue-500',
    accentAlt: darkMode ? 'from-purple-400 to-pink-400' : 'from-purple-500 to-pink-500',
    teamBg1: darkMode ? 'from-cyan-500/20 to-cyan-400/20 border-cyan-400/30' : 'from-green-400 to-green-500',
    teamBg2: darkMode ? 'from-purple-500/20 to-purple-400/20 border-purple-400/30' : 'from-blue-400 to-blue-500',
  };

  // Generate round-robin matches with partner swapping
  const generateMatches = (playerList) => {
    if (playerList.length < 4) return [];
    
    const matchList = [];
    const partnerHistory = {};
    
    // Initialize partner history
    playerList.forEach(player => {
      partnerHistory[player] = new Set();
    });
    
    // Create all possible pairings
    const allPairs = [];
    for (let i = 0; i < playerList.length; i++) {
      for (let j = i + 1; j < playerList.length; j++) {
        allPairs.push([playerList[i], playerList[j]]);
      }
    }
    
    // Shuffle pairs for variety
    const shuffledPairs = [...allPairs].sort(() => Math.random() - 0.5);
    
    // Generate matches ensuring partner diversity
    while (shuffledPairs.length >= 2) {
      let matchFound = false;
      
      for (let i = 0; i < shuffledPairs.length; i++) {
        for (let j = i + 1; j < shuffledPairs.length; j++) {
          const team1 = shuffledPairs[i];
          const team2 = shuffledPairs[j];
          
          // Check if teams don't share players
          if (!team1.some(player => team2.includes(player))) {
            // Check partner history to promote diversity
            const partnersNew = 
              !partnerHistory[team1[0]].has(team1[1]) || 
              !partnerHistory[team2[0]].has(team2[1]);
            
            if (partnersNew || matchList.length < 10) {
              matchList.push({
                id: Date.now() + matchList.length,
                team1: team1,
                team2: team2,
                completed: false,
                winner: null,
                court: null
              });
              
              // Update partner history
              partnerHistory[team1[0]].add(team1[1]);
              partnerHistory[team1[1]].add(team1[0]);
              partnerHistory[team2[0]].add(team2[1]);
              partnerHistory[team2[1]].add(team2[0]);
              
              // Remove used pairs
              shuffledPairs.splice(j, 1);
              shuffledPairs.splice(i, 1);
              matchFound = true;
              break;
            }
          }
        }
        if (matchFound) break;
      }
      
      if (!matchFound) {
        // If no diverse match found, just take the first valid match
        for (let i = 0; i < shuffledPairs.length; i++) {
          for (let j = i + 1; j < shuffledPairs.length; j++) {
            const team1 = shuffledPairs[i];
            const team2 = shuffledPairs[j];
            
            if (!team1.some(player => team2.includes(player))) {
              matchList.push({
                id: Date.now() + matchList.length,
                team1: team1,
                team2: team2,
                completed: false,
                winner: null,
                court: null
              });
              
              shuffledPairs.splice(j, 1);
              shuffledPairs.splice(i, 1);
              matchFound = true;
              break;
            }
          }
          if (matchFound) break;
        }
      }
      
      if (!matchFound) break;
    }
    
    return matchList;
  };

  const togglePlayer = (player) => {
    if (selectedPlayers.includes(player)) {
      setSelectedPlayers(selectedPlayers.filter(p => p !== player));
    } else {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const addNewPlayer = () => {
    if (playerName.trim() && !allPlayers.includes(playerName.trim())) {
      const newPlayer = playerName.trim();
      // Insert new player in alphabetically correct position
      const updatedPlayers = [...allPlayers, newPlayer].sort((a, b) => {
        // Custom sort to maintain the subtle grouping
        const femaleNames = ['Allegra', 'Amy', 'Amy R.', 'Emily M.', 'Jackie', 'Kiki G.', 'Michelle R.', 'Nesli', 'Sophia', 'Susan H.', 'Thais'];
        const aIsFemale = femaleNames.some(name => a.toLowerCase().includes(name.toLowerCase().split(' ')[0]));
        const bIsFemale = femaleNames.some(name => b.toLowerCase().includes(name.toLowerCase().split(' ')[0]));
        
        if (aIsFemale && !bIsFemale) return -1;
        if (!aIsFemale && bIsFemale) return 1;
        return a.localeCompare(b);
      });
      
      setAllPlayers(updatedPlayers);
      setPlayerStats({
        ...playerStats,
        [newPlayer]: { wins: 0, losses: 0, matches: 0 }
      });
      setPlayerName('');
    }
  };

  const startTournament = () => {
    const generatedMatches = generateMatches(selectedPlayers);
    setMatches(generatedMatches);
    
    // Initialize courts
    const newCourts = [];
    for (let i = 0; i < numberOfCourts; i++) {
      newCourts.push({
        id: i + 1,
        currentMatch: generatedMatches[i] || null,
        matchHistory: []
      });
    }
    setCourts(newCourts);
    
    // Mark initial matches as assigned
    generatedMatches.slice(0, numberOfCourts).forEach((match, index) => {
      match.court = index + 1;
    });
    
    setCompletedMatches([]);
    setGameStarted(true);
    setShowAddPlayer(false);
  };

  const completeMatch = (courtId, winningTeam) => {
    const courtIndex = courts.findIndex(c => c.id === courtId);
    const court = courts[courtIndex];
    const match = court.currentMatch;
    
    if (!match) return;
    
    // Update match with winner
    match.completed = true;
    match.winner = winningTeam;
    
    // Update player stats
    const newStats = { ...playerStats };
    const winners = winningTeam === 1 ? match.team1 : match.team2;
    const losers = winningTeam === 1 ? match.team2 : match.team1;
    
    winners.forEach(player => {
      newStats[player].wins += 1;
      newStats[player].matches += 1;
    });
    
    losers.forEach(player => {
      newStats[player].losses += 1;
      newStats[player].matches += 1;
    });
    
    setPlayerStats(newStats);
    
    // Add to completed matches
    setCompletedMatches([...completedMatches, match]);
    
    // Find next unassigned match
    const nextMatch = matches.find(m => !m.completed && !m.court);
    
    // Update court
    const newCourts = [...courts];
    newCourts[courtIndex] = {
      ...court,
      currentMatch: nextMatch || null,
      matchHistory: [...court.matchHistory, match]
    };
    
    if (nextMatch) {
      nextMatch.court = courtId;
    }
    
    setCourts(newCourts);
  };

  const resetTournament = () => {
    setGameStarted(false);
    setMatches([]);
    setCourts([{ id: 1, currentMatch: null, matchHistory: [] }]);
    setCompletedMatches([]);
    setSelectedPlayers([]);
  };

  const getPlayerRecord = (player) => {
    const stats = playerStats[player] || { wins: 0, losses: 0 };
    if (stats.matches > 10 && stats.wins === 0) return "💀";
    if (stats.wins > stats.losses * 3 && stats.matches > 5) return "🔥";
    return `${stats.wins}-${stats.losses}`;
  };

  const sortedPlayerStats = Object.entries(playerStats)
    .filter(([player, stats]) => stats.matches > 0)
    .sort((a, b) => {
      const winRateA = a[1].wins / (a[1].matches || 1);
      const winRateB = b[1].wins / (b[1].matches || 1);
      return winRateB - winRateA;
    });

  const upcomingMatches = matches.filter(m => !m.completed && !m.court).slice(0, 6);
  const allCourtsComplete = courts.every(c => !c.currentMatch) && matches.length > 0;

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-500`}>
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8 pt-4 relative">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-full ${theme.card} border backdrop-blur-sm transition-all duration-300 hover:scale-110 ${theme.hover}`}
            >
              {darkMode ? (
                <Sun className="text-yellow-400" size={20} />
              ) : (
                <Moon className="text-purple-600" size={20} />
              )}
            </button>
          </div>
          
          <div className="inline-flex items-center gap-3 mb-4">
            <div className={`relative ${!logoLoaded && 'p-3 rounded-xl bg-gradient-to-br ' + theme.accent + ' shadow-lg animate-pulse'}`}>
              {!logoLoaded && <Zap className="text-white" size={32} />}
              <img 
                src={logoUrl} 
                alt="Electric Pickle" 
                className={`w-16 h-16 rounded-xl shadow-lg ${logoLoaded ? 'block' : 'hidden'}`}
                onLoad={() => setLogoLoaded(true)}
                onError={() => setLogoLoaded(false)}
              />
            </div>
          </div>
          
          <h1 className={`text-5xl md:text-6xl font-black ${theme.text} mb-2 tracking-tight cursor-default`}
              title="Not a band name (but should be)">
            ELECTRIC PICKLE
          </h1>
          <div className={`h-0.5 w-32 mx-auto bg-gradient-to-r ${theme.accent} mb-4`}></div>
          <p className={`${theme.textSecondary} text-lg tracking-wide uppercase`}>
            Round Robin Tournament System
          </p>
        </div>

        {/* Main Content */}
        {!gameStarted ? (
          <div className={`${theme.card} backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 border transition-all duration-500`}>
            {/* Player Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${theme.text} flex items-center gap-3`}>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${theme.accent}`}>
                    <Users className="text-white" size={20} />
                  </div>
                  Player Selection
                  <span className={`text-lg ${theme.textSecondary} font-normal`}>
                    ({selectedPlayers.length} selected)
                  </span>
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className={`px-4 py-2 rounded-xl bg-gradient-to-r ${theme.accentAlt} text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2`}
                  >
                    <TrendingUp size={18} />
                    Stats
                  </button>
                  <button
                    onClick={() => setShowAddPlayer(!showAddPlayer)}
                    className={`px-4 py-2 rounded-xl bg-gradient-to-r ${theme.accent} text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2`}
                  >
                    <UserPlus size={18} />
                    Add
                  </button>
                </div>
              </div>

              {showAddPlayer && (
                <div className="mb-6 flex gap-2 animate-in slide-in-from-top duration-300">
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addNewPlayer()}
                    placeholder="Enter new player name"
                    className={`flex-1 px-4 py-3 rounded-xl ${theme.cardAlt} ${theme.text} border ${theme.border} focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 placeholder:${theme.textSecondary}`}
                  />
                  <button
                    onClick={addNewPlayer}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-cyan-500 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    Add
                  </button>
                </div>
              )}

              {showStats && sortedPlayerStats.length > 0 && (
                <div className={`mb-6 ${theme.cardAlt} rounded-xl p-6 border ${theme.border} animate-in slide-in-from-top duration-300`}>
                  <h3 className={`font-bold text-lg mb-4 ${theme.text} flex items-center gap-2`}>
                    <Award className="text-yellow-500" />
                    Leaderboard
                  </h3>
                  <div className="space-y-2">
                    {sortedPlayerStats.slice(0, 10).map(([player, stats], index) => (
                      <div key={player} className={`flex items-center justify-between ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} rounded-lg px-4 py-3 transition-all duration-300 hover:scale-[1.02]`}>
                        <div className="flex items-center gap-3">
                          <span className={`font-bold text-lg w-8 ${index < 3 ? 'text-yellow-500' : theme.textSecondary}`}>
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                            {index > 2 && `${index + 1}.`}
                          </span>
                          <span className={`font-medium ${theme.text}`}>{player}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-sm ${theme.textSecondary}`}>
                            <span className="text-green-500 font-bold">{stats.wins}</span>
                            <span className="mx-1">-</span>
                            <span className="text-red-500 font-bold">{stats.losses}</span>
                          </span>
                          <span className={`text-sm font-medium ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
                            {stats.matches > 0 
                              ? stats.wins === 0 
                                ? "😬" 
                                : stats.wins === stats.matches 
                                  ? "💯" 
                                  : `${Math.round((stats.wins / stats.matches) * 100)}%`
                              : "0%"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {allPlayers.map((player) => (
                  <button
                    key={player}
                    onClick={() => togglePlayer(player)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                      selectedPlayers.includes(player)
                        ? `bg-gradient-to-r ${theme.accent} text-white shadow-lg`
                        : `${theme.cardAlt} ${theme.text} border ${theme.border} hover:border-cyan-400`
                    }`}
                    title={playerStats[player]?.matches > 5 && playerStats[player]?.wins === 0 
                      ? "Rough season..." 
                      : playerStats[player]?.wins === playerStats[player]?.matches && playerStats[player]?.matches > 5
                      ? "Undefeated legend!"
                      : ""}
                  >
                    <span>{player}</span>
                    {playerStats[player]?.matches > 0 && (
                      <span className="text-xs ml-2 opacity-80">
                        ({getPlayerRecord(player)})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Court Selection */}
              <div className="mb-6">
                <label className={`block ${theme.textSecondary} font-medium mb-3`}>Number of Courts</label>
                <div className="flex gap-3">
                  {[1, 2, 3].map(num => (
                    <button
                      key={num}
                      onClick={() => setNumberOfCourts(num)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        numberOfCourts === num
                          ? `bg-gradient-to-r ${theme.accent} text-white shadow-lg`
                          : `${theme.cardAlt} ${theme.text} border ${theme.border}`
                      }`}
                    >
                      {num} Court{num > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Button */}
            {selectedPlayers.length >= 4 && (
              <button
                onClick={startTournament}
                className={`w-full bg-gradient-to-r ${theme.accent} text-white text-xl font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center gap-3`}
              >
                <Play size={24} />
                {selectedPlayers.length === 8 ? "Initialize Elite Eight" :
                 selectedPlayers.length === 16 ? "Sweet Sixteen Time" :
                 selectedPlayers.length === 4 ? "Final Four Mode" :
                 "Initialize Tournament"}
                <span className="text-sm font-normal opacity-80">
                  ({selectedPlayers.length} {selectedPlayers.length === 13 ? "unlucky souls" : "players"}, {numberOfCourts} court{numberOfCourts > 1 ? 's' : ''})
                </span>
              </button>
            )}

            {selectedPlayers.length < 4 && selectedPlayers.length > 0 && (
              <p className={`text-center ${theme.textSecondary} mt-4`}>
                {selectedPlayers.length === 1 
                  ? "That's going to be a very short tournament..." 
                  : selectedPlayers.length === 2 
                  ? "They'll get tired playing each other over and over..."
                  : selectedPlayers.length === 3 
                  ? "So close! Just need one more brave soul..."
                  : `Select at least ${4 - selectedPlayers.length} more player${4 - selectedPlayers.length > 1 ? 's' : ''} to start`}
              </p>
            )}
            
            {selectedPlayers.length === 0 && (
              <p className={`text-center ${theme.textSecondary} mt-4 italic`}>
                *crickets* ...someone's gotta play
              </p>
            )}
            
            {selectedPlayers.length > 12 && (
              <p className={`text-center ${theme.textSecondary} mt-2 text-sm`}>
                {selectedPlayers.length > 20 
                  ? "This is becoming a convention, not a tournament" 
                  : selectedPlayers.length > 16 
                  ? "Hope you cleared your calendar..." 
                  : "That's a lot of pickleball enthusiasm!"}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Courts */}
            {allCourtsComplete ? (
              <div className={`${theme.card} backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center border transition-all duration-500`}>
                <Trophy className="mx-auto text-yellow-500 mb-4 animate-bounce" size={64} />
                <h2 className={`text-3xl font-bold ${theme.text} mb-4`}>
                  {sortedPlayerStats[0] && sortedPlayerStats[0][1].wins === sortedPlayerStats[0][1].matches 
                    ? "Tournament Complete! 👑" 
                    : completedMatches.length > 20 
                    ? "Finally Done! 😅" 
                    : "Tournament Complete! 🎉"}
                </h2>
                <p className={`${theme.textSecondary} mb-6`}>
                  {completedMatches.length} matches played
                  {completedMatches.length > 30 && " (that's a lot of pickleball)"}
                  {completedMatches.length === 69 && " (nice)"}
                </p>
                
                {/* Final Rankings */}
                <div className="mb-8 max-w-md mx-auto">
                  <h3 className={`font-bold text-xl mb-4 ${theme.text}`}>Final Rankings</h3>
                  <div className="space-y-2">
                    {sortedPlayerStats.slice(0, 5).map(([player, stats], index) => (
                      <div key={player} className={`flex items-center justify-between ${theme.cardAlt} rounded-xl px-4 py-3 transition-all duration-300 hover:scale-[1.02]`}>
                        <div className="flex items-center gap-3">
                          {index === 0 && <span className="text-2xl" title="Undisputed champion of the parking lot">🐐</span>}
                          {index === 1 && <span className="text-2xl" title="First loser, technically">🥈</span>}
                          {index === 2 && <span className="text-2xl" title="At least you're on the podium">🥉</span>}
                          {index === 3 && <span className="text-2xl" title="Just missed the medals">🏅</span>}
                          {index === 4 && <span className="text-2xl" title="Top 5! That's something!">🖐️</span>}
                          {index > 4 && <span className={`font-bold w-6 ${theme.textSecondary}`}>{index + 1}.</span>}
                          <span className={`font-medium ${theme.text}`}>{player}</span>
                        </div>
                        <span className={`text-sm font-bold ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
                          {stats.wins}-{stats.losses}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={resetTournament}
                  className={`bg-gradient-to-r ${theme.accent} text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl inline-flex items-center gap-2`}
                >
                  <RotateCw size={20} />
                  New Tournament
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courts.map(court => (
                  court.currentMatch && (
                    <div key={court.id} className={`${theme.card} backdrop-blur-xl rounded-2xl shadow-2xl p-6 border transition-all duration-500 hover:scale-[1.02]`}>
                      <h2 className={`text-xl font-bold ${theme.text} mb-6 text-center`}>
                        <span className="inline-flex items-center gap-2">
                          <span className="text-2xl">🏓</span>
                          {court.id === 1 && numberOfCourts > 1 ? "Center Court" : 
                           court.id === 2 ? "Court of Public Opinion" : 
                           court.id === 3 ? "The Thunder Dome" : 
                           `Court ${court.id}`}
                        </span>
                      </h2>
                      
                      <div className="space-y-4">
                        <button
                          onClick={() => completeMatch(court.id, 1)}
                          className={`w-full bg-gradient-to-br ${theme.teamBg1} ${darkMode ? 'text-cyan-100' : 'text-white'} rounded-xl p-5 shadow-lg transform hover:scale-105 transition-all duration-300 border ${darkMode ? 'hover:shadow-cyan-500/20' : ''}`}
                        >
                          <p className="text-sm opacity-80 mb-2 uppercase tracking-wide">Team 1</p>
                          <p className="text-xl font-bold">{court.currentMatch.team1[0]}</p>
                          <p className="text-sm my-2 opacity-60">🤝</p>
                          <p className="text-xl font-bold">{court.currentMatch.team1[1]}</p>
                          <p className="mt-3 text-sm font-medium opacity-80">
                            {Math.random() > 0.95 ? "↑ Smash that W ↑" : 
                             Math.random() > 0.9 ? "↑ They crushed it ↑" :
                             Math.random() > 0.85 ? "↑ Victory dance time ↑" :
                             "↑ Tap if Winners ↑"}
                          </p>
                        </button>
                        
                        <div className="text-center py-2">
                          <div className={`text-3xl font-black ${theme.textSecondary} opacity-30`}>VS</div>
                        </div>
                        
                        <button
                          onClick={() => completeMatch(court.id, 2)}
                          className={`w-full bg-gradient-to-br ${theme.teamBg2} ${darkMode ? 'text-purple-100' : 'text-white'} rounded-xl p-5 shadow-lg transform hover:scale-105 transition-all duration-300 border ${darkMode ? 'hover:shadow-purple-500/20' : ''}`}
                        >
                          <p className="text-sm opacity-80 mb-2 uppercase tracking-wide">Team 2</p>
                          <p className="text-xl font-bold">{court.currentMatch.team2[0]}</p>
                          <p className="text-sm my-2 opacity-60">🤝</p>
                          <p className="text-xl font-bold">{court.currentMatch.team2[1]}</p>
                          <p className="mt-3 text-sm font-medium opacity-80">↑ Tap if Winners ↑</p>
                        </button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}

            {/* Upcoming Matches */}
            {upcomingMatches.length > 0 && (
              <div className={`${theme.card} backdrop-blur-xl rounded-2xl shadow-xl p-6 border transition-all duration-500`}>
                <h3 className={`text-lg font-bold ${theme.text} mb-4 flex items-center gap-2`}>
                  <ChevronRight className={darkMode ? 'text-cyan-400' : 'text-blue-500'} />
                  Upcoming Matches
                  {matches.filter(m => !m.completed && !m.court).length > 10 && 
                    <span className={`text-sm font-normal ${theme.textSecondary}`}>
                      (showing 6 of {matches.filter(m => !m.completed && !m.court).length}... pace yourselves)
                    </span>
                  }
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {upcomingMatches.map((match) => (
                    <div key={match.id} className={`${theme.cardAlt} rounded-xl p-4 flex items-center justify-between transition-all duration-300 hover:scale-[1.02]`}>
                      <div className={`text-sm font-medium ${theme.text}`}>
                        {match.team1.join(' & ')}
                      </div>
                      <div className={`text-xs ${theme.textSecondary} mx-3`}>vs</div>
                      <div className={`text-sm font-medium ${theme.text} text-right`}>
                        {match.team2.join(' & ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Stats */}
            <div className={`${theme.card} backdrop-blur-xl rounded-2xl shadow-lg p-6 border transition-all duration-500`}>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className={`text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent`}>
                    {completedMatches.length}
                  </p>
                  <p className={`text-sm ${theme.textSecondary} mt-1`}>Completed</p>
                </div>
                <div className="text-center">
                  <p className={`text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent`}>
                    {matches.length - completedMatches.length}
                  </p>
                  <p className={`text-sm ${theme.textSecondary} mt-1`}>Remaining</p>
                </div>
                <div className="text-center">
                  <p className={`text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent`}>
                    {courts.filter(c => c.currentMatch).length}
                  </p>
                  <p className={`text-sm ${theme.textSecondary} mt-1`}>Active</p>
                </div>
              </div>
            </div>

            {/* Quick Stats Button */}
            <button
              onClick={() => setShowStats(!showStats)}
              className={`w-full bg-gradient-to-r ${theme.accentAlt} text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-2`}
            >
              <Award size={20} />
              {showStats ? 'Hide' : 'Show'} Current Standings
              {showStats && sortedPlayerStats.length > 0 && 
                sortedPlayerStats[sortedPlayerStats.length - 1][1].losses > 5 && 
                sortedPlayerStats[sortedPlayerStats.length - 1][1].wins === 0 &&
                <span className="text-xs opacity-60 ml-2">(viewer discretion advised)</span>
              }
            </button>

            {/* Current Standings */}
            {showStats && sortedPlayerStats.length > 0 && (
              <div className={`${theme.card} backdrop-blur-xl rounded-2xl shadow-xl p-6 border transition-all duration-500 animate-in slide-in-from-bottom duration-300`}>
                <h3 className={`text-lg font-bold ${theme.text} mb-4`}>Current Standings</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {sortedPlayerStats.map(([player, stats], index) => (
                    <div key={player} className={`flex items-center justify-between ${theme.cardAlt} rounded-lg px-4 py-3 transition-all duration-300 hover:scale-[1.02]`}>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-sm w-6 ${theme.textSecondary}`}>{index + 1}.</span>
                        <span className={`font-medium text-sm ${theme.text}`}>{player}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-green-500 font-bold">{stats.wins}W</span>
                        <span className={`${theme.textSecondary} mx-1`}>-</span>
                        <span className="text-red-500 font-bold">{stats.losses}L</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ElectricPickle;