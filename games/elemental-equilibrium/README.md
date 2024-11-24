# 🌟 Elemental Equilibrium

A dynamic web-based game where players master the four elements to maintain balance in a challenging arena. Control Fire, Water, Earth, and Air elements while battling enemies and collecting power-ups in this fast-paced action game.

![Game Preview](screenshots/game-preview.png)

## 🎮 Features

### Elements & Powers
- **🔥 Fire**: Nova explosion, strong against Air
- **💧 Water**: Tidal wave, strong against Fire
- **🌍 Earth**: Earthquake, strong against Water
- **💨 Air**: Tornado pull, strong against Earth

### Game Mechanics
- Dynamic element switching
- Elemental advantages system
- Combo-based scoring
- Progressive difficulty
- Power-up collection
- Achievement system

### Power-ups
- ❤️ Health Boost
- ⚡ Speed Boost
- 🛡️ Shield
- ⚔️ Damage Boost

### Achievements
- 🏆 Combo Master: Reach 10x combo
- ⚔️ Element Master: 20 type-advantage kills
- ⏱️ Survivalist: Survive for 5 minutes
- ✨ Power Collector: Collect 15 power-ups

### Special Powers
Each element has a unique special power activated by pressing the Spacebar:

- **Fire Nova**: Creates an expanding ring of fire that deals high damage to nearby enemies
  - Damage falls off with distance
  - Applies a burning effect that deals additional damage over time
  - Creates visual flame particles and screen shake

- **Water Wave**: Releases multiple waves of water projectiles
  - Sends out 8 waves with 3 projectiles each
  - Damages and slows enemies hit by the waves
  - Longer range than Fire Nova
  - Creates rippling water effects

- **Earth Shield**: Generates a protective barrier that absorbs incoming damage
  - Shield health decreases as it takes damage
  - Visual feedback on shield strength
  - Orbiting rocks provide additional visual flair
  - Shield hit effects on damage

- **Air Dash**: Grants a burst of speed and invulnerability
  - Damages and knocks back enemies in your path
  - Creates afterimages and wind particles
  - Perfect for repositioning or escape
  - 0.5 second duration

All special powers have a 5-second cooldown, shown by the cooldown bar at the bottom of the screen.

## 🚀 Getting Started

### Prerequisites
- Python 3.7+
- Flask
- Modern web browser with JavaScript enabled

### Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/elemental-equilibrium.git
cd elemental-equilibrium
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the game:
```bash
python app.py
```

4. Open your browser and navigate to:
```
http://localhost:5000
```

## 🎯 How to Play

### Basic Controls
- **W**: Move Up
- **S**: Move Down
- **A**: Move Left
- **D**: Move Right
- **Space**: Activate Special Power
- **1**: Switch to Fire Element
- **2**: Switch to Water Element
- **3**: Switch to Earth Element
- **4**: Switch to Air Element

### Strategy Tips
1. Use elemental advantages to deal more damage
2. Chain kills to build combos and increase score
3. Collect power-ups strategically
4. Switch elements based on enemy types
5. Time your special powers carefully

## 🛠️ Technical Details

### Built With
- **Backend**: Python/Flask
- **Frontend**: HTML5, CSS3, JavaScript
- **Game Engine**: Custom JavaScript game loop
- **Audio**: Web Audio API

### Architecture
- Modular game components
- Event-driven architecture
- Responsive design
- Optimized game loop
- Collision detection system

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by classic elemental-based games
- Sound effects from [source]
- Background music by [artist]
- Special thanks to all contributors

## 📞 Contact

Your Name - [@yourusername](https://twitter.com/yourusername)

Project Link: [https://github.com/yourusername/elemental-equilibrium](https://github.com/yourusername/elemental-equilibrium)

---
Made with ❤️ and ☕
