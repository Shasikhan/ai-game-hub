class ElementGame {
    constructor() {
        this.setupStartMenu();
    }

    setupStartMenu() {
        this.startMenu = document.getElementById('start-menu');
        this.gameContainer = document.getElementById('game-container');
        this.selectedElement = 'fire';
        this.difficulty = 'normal';

        // Setup element selection
        const elementOptions = document.querySelectorAll('.element-option');
        elementOptions.forEach(option => {
            option.addEventListener('click', () => {
                elementOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedElement = option.dataset.element;
            });
        });

        // Setup difficulty selection
        const difficultyOptions = document.querySelectorAll('.difficulty-option');
        difficultyOptions.forEach(option => {
            option.addEventListener('click', () => {
                difficultyOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.difficulty = option.dataset.difficulty;
            });
        });

        // Setup start button
        const startButton = document.querySelector('.start-button');
        startButton.addEventListener('click', () => {
            this.startMenu.classList.add('hidden');
            this.gameContainer.classList.remove('hidden');
            this.initializeGame();
        });

        // Select default element
        elementOptions[0].classList.add('selected');
    }

    initializeGame() {
        this.player = document.getElementById('player');
        this.currentElement = this.selectedElement;
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.score = 0;
        this.level = 1;
        this.health = 100;
        this.enemies = [];
        this.powerUps = [];
        this.specialPowerActive = false;
        this.powerCooldown = false;
        this.combo = 0;
        this.maxCombo = 0;
        this.comboTimer = null;
        this.comboMultiplier = 1;
        this.lastEnemySpawn = 0;
        this.gameActive = true;

        // Initialize combo system
        this.combo = 0;
        this.maxCombo = 0;
        this.comboTimer = null;
        this.comboMultiplier = 1;
        
        // Initialize element strengths/weaknesses
        this.elementRelations = {
            fire: { strong: 'air', weak: 'water' },
            water: { strong: 'fire', weak: 'earth' },
            earth: { strong: 'water', weak: 'air' },
            air: { strong: 'earth', weak: 'fire' }
        };

        // Initialize achievements
        this.achievements = {
            comboMaster: { achieved: false, requirement: 10, description: 'Reach 10x combo!' },
            elementMaster: { achieved: false, requirement: 20, description: 'Defeat 20 enemies with type advantage!' },
            survivalist: { achieved: false, requirement: 300, description: 'Survive for 5 minutes!' },
            powerCollector: { achieved: false, requirement: 15, description: 'Collect 15 power-ups!' }
        };
        
        this.gameStats = {
            typeAdvantageKills: 0,
            powerUpsCollected: 0,
            startTime: Date.now(),
            totalKills: 0
        };

        // Set difficulty-based parameters
        switch(this.difficulty) {
            case 'easy':
                this.enemySpawnInterval = 3000;
                this.enemySpeedMultiplier = 0.8;
                this.healthMultiplier = 1.2;
                this.powerUpFrequency = 0.008;
                break;
            case 'normal':
                this.enemySpawnInterval = 2000;
                this.enemySpeedMultiplier = 1;
                this.healthMultiplier = 1;
                this.powerUpFrequency = 0.005;
                break;
            case 'hard':
                this.enemySpawnInterval = 1000;
                this.enemySpeedMultiplier = 1.2;
                this.healthMultiplier = 0.8;
                this.powerUpFrequency = 0.003;
                break;
        }

        // Set initial element
        this.changeElement(this.currentElement);

        // Start background music
        this.startBackgroundMusic();
        
        // Start the game
        this.setupControls();
        this.setupEventListeners();
        this.startLevel();
        this.updateStats();
        this.gameLoop();
    }

    startBackgroundMusic() {
        const audio = new Audio();
        audio.src = '/static/background-music.mp3';
        audio.loop = true;
        audio.volume = 0.3;
        this.backgroundMusic = audio;
        this.backgroundMusic.play().catch(() => console.log('Audio autoplay blocked'));
    }

    setupControls() {
        this.elementButtons = {
            fire: document.getElementById('fire-btn'),
            water: document.getElementById('water-btn'),
            earth: document.getElementById('earth-btn'),
            air: document.getElementById('air-btn')
        };

        document.addEventListener('keydown', (e) => {
            if (!this.gameActive) return;

            switch(e.key) {
                case 'w':
                case 'W':
                    this.moveUp = true;
                    break;
                case 's':
                case 'S':
                    this.moveDown = true;
                    break;
                case 'a':
                case 'A':
                    this.moveLeft = true;
                    break;
                case 'd':
                case 'D':
                    this.moveRight = true;
                    break;
                case ' ':
                    this.activateSpecialPower();
                    break;
                case '1':
                    this.changeElement('fire');
                    this.elementButtons.fire.click();
                    break;
                case '2':
                    this.changeElement('water');
                    this.elementButtons.water.click();
                    break;
                case '3':
                    this.changeElement('earth');
                    this.elementButtons.earth.click();
                    break;
                case '4':
                    this.changeElement('air');
                    this.elementButtons.air.click();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (!this.gameActive) return;

            switch(e.key) {
                case 'w':
                case 'W':
                    this.moveUp = false;
                    break;
                case 's':
                case 'S':
                    this.moveDown = false;
                    break;
                case 'a':
                case 'A':
                    this.moveLeft = false;
                    break;
                case 'd':
                case 'D':
                    this.moveRight = false;
                    break;
            }
        });

        // Add element change indicators
        const elementChangeIndicator = document.createElement('div');
        elementChangeIndicator.className = 'element-change-indicator';
        this.gameContainer.appendChild(elementChangeIndicator);
        this.elementChangeIndicator = elementChangeIndicator;

        Object.entries(this.elementButtons).forEach(([element, button]) => {
            button.addEventListener('click', () => {
                if (this.gameActive) {
                    this.changeElement(element);
                    this.showElementChangeEffect(element);
                }
            });
        });
    }

    showElementChangeEffect(element) {
        // Show element change indicator
        this.elementChangeIndicator.className = `element-change-indicator ${element}-effect`;
        this.elementChangeIndicator.style.left = `${this.position.x - 30}px`;
        this.elementChangeIndicator.style.top = `${this.position.y - 30}px`;
        
        // Create particle effect
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = `element-particle ${element}-particle`;
            particle.style.left = `${this.position.x}px`;
            particle.style.top = `${this.position.y}px`;
            
            const angle = (i / 8) * Math.PI * 2;
            const velocity = {
                x: Math.cos(angle) * 5,
                y: Math.sin(angle) * 5
            };
            
            this.gameContainer.appendChild(particle);
            
            let frame = 0;
            const animate = () => {
                frame++;
                const currentX = parseFloat(particle.style.left);
                const currentY = parseFloat(particle.style.top);
                
                particle.style.left = `${currentX + velocity.x}px`;
                particle.style.top = `${currentY + velocity.y}px`;
                particle.style.opacity = 1 - frame / 20;
                
                if (frame < 20) {
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };
            
            requestAnimationFrame(animate);
        }
    }

    setupEventListeners() {
        this.keyDownHandler = (e) => this.handleKeyDown(e);
        this.keyUpHandler = (e) => this.handleKeyUp(e);
        
        window.addEventListener('keydown', this.keyDownHandler);
        window.addEventListener('keyup', this.keyUpHandler);
        
        this.position = {
            x: window.innerWidth / 2 - 25,
            y: window.innerHeight / 2 - 25
        };
        this.updatePlayerPosition();
    }

    handleKeyDown(e) {
        if (!this.gameActive) return;
        
        const speed = this.currentElement === 'air' ? 2 : 1;
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
                this.velocity.y = -5 * speed;
                break;
            case 'ArrowDown':
            case 's':
                this.velocity.y = 5 * speed;
                break;
            case 'ArrowLeft':
            case 'a':
                this.velocity.x = -5 * speed;
                break;
            case 'ArrowRight':
            case 'd':
                this.velocity.x = 5 * speed;
                break;
        }
    }

    handleKeyUp(e) {
        switch(e.key) {
            case 'ArrowUp':
            case 'ArrowDown':
            case 'w':
            case 's':
                this.velocity.y = 0;
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'a':
            case 'd':
                this.velocity.x = 0;
                break;
        }
    }

    changeElement(element) {
        this.currentElement = element;
        this.player.className = `element-${element}`;
        if (this.specialPowerActive) {
            this.player.classList.add('power-active');
        }
    }

    updatePlayerPosition() {
        switch(this.currentElement) {
            case 'fire':
                this.position.x += this.velocity.x + (Math.random() - 0.5) * 2;
                this.position.y += this.velocity.y + (Math.random() - 0.5) * 2;
                break;
            case 'water':
                this.position.x += this.velocity.x;
                this.position.y += this.velocity.y;
                break;
            case 'earth':
                this.position.x += this.velocity.x * 0.8;
                this.position.y += this.velocity.y * 0.8;
                break;
            case 'air':
                this.position.x += this.velocity.x * 1.5;
                this.position.y += this.velocity.y * 1.5;
                break;
        }

        // Keep player within bounds
        this.position.x = Math.max(0, Math.min(window.innerWidth - 50, this.position.x));
        this.position.y = Math.max(0, Math.min(window.innerHeight - 50, this.position.y));

        this.player.style.left = `${this.position.x}px`;
        this.player.style.top = `${this.position.y}px`;

        // Check power-up collisions
        this.checkPowerUpCollisions();
    }

    checkPowerUpCollisions() {
        this.powerUps.forEach((powerUp, index) => {
            const dx = this.position.x - powerUp.x;
            const dy = this.position.y - powerUp.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 40) {
                this.gameStats.powerUpsCollected++;
                
                // Apply power-up effect with particle effect
                this.createPowerUpEffect(powerUp.type, powerUp.x, powerUp.y);
                
                switch(powerUp.type) {
                    case 'health':
                        this.health = Math.min(100, this.health + 30);
                        break;
                    case 'speed':
                        this.player.classList.add('speed-boost');
                        setTimeout(() => this.player.classList.remove('speed-boost'), 5000);
                        break;
                    case 'shield':
                        this.player.classList.add('shielded');
                        setTimeout(() => this.player.classList.remove('shielded'), 5000);
                        break;
                    case 'damage':
                        this.player.classList.add('damage-boost');
                        setTimeout(() => this.player.classList.remove('damage-boost'), 5000);
                        break;
                }

                // Remove power-up
                powerUp.element.remove();
                this.powerUps.splice(index, 1);
                
                this.addScore(20);
                this.updateStats();

                // Play power-up sound
                const powerUpSound = new Audio('/static/powerup.mp3');
                powerUpSound.volume = 0.3;
                powerUpSound.play().catch(() => {});

                // Check achievement
                if (this.gameStats.powerUpsCollected >= this.achievements.powerCollector.requirement) {
                    this.unlockAchievement('powerCollector');
                }
            }
        });
    }

    createPowerUpEffect(type, x, y) {
        const particles = 12;
        const colors = {
            health: '#ff69b4',
            speed: '#ffff00',
            shield: '#00ffff',
            damage: '#ff8c00'
        };

        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'power-up-particle';
            particle.style.backgroundColor = colors[type];
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            const angle = (i / particles) * Math.PI * 2;
            const velocity = {
                x: Math.cos(angle) * 5,
                y: Math.sin(angle) * 5
            };
            
            this.gameContainer.appendChild(particle);
            
            let frame = 0;
            const animate = () => {
                frame++;
                const currentX = parseFloat(particle.style.left);
                const currentY = parseFloat(particle.style.top);
                
                particle.style.left = `${currentX + velocity.x}px`;
                particle.style.top = `${currentY + velocity.y + frame * 0.2}px`;
                particle.style.opacity = 1 - frame / 30;
                
                if (frame < 30) {
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };
            
            requestAnimationFrame(animate);
        }
    }

    startLevel() {
        // Initial enemies
        for (let i = 0; i < 3; i++) {
            this.spawnEnemies();
        }
        this.spawnPowerUps();
        this.updateStats();
        
        // Increase difficulty with level
        this.enemySpawnInterval = Math.max(500, 2000 - (this.level * 100));
    }

    spawnEnemies() {
        const enemy = document.createElement('div');
        enemy.className = 'enemy';
        const type = ['fire', 'water', 'earth', 'air'][Math.floor(Math.random() * 4)];
        enemy.classList.add(`enemy-${type}`);
        
        // Spawn from edges
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        switch(edge) {
            case 0: x = -30; y = Math.random() * window.innerHeight; break;
            case 1: x = window.innerWidth; y = Math.random() * window.innerHeight; break;
            case 2: x = Math.random() * window.innerWidth; y = -30; break;
            case 3: x = Math.random() * window.innerWidth; y = window.innerHeight; break;
        }
        
        enemy.style.left = `${x}px`;
        enemy.style.top = `${y}px`;
        
        this.gameContainer.appendChild(enemy);
        this.enemies.push({
            element: enemy,
            type: type,
            x: x,
            y: y,
            speed: (2 + (this.level * 0.2)) * this.enemySpeedMultiplier
        });
    }

    spawnPowerUps() {
        const powerUp = document.createElement('div');
        powerUp.className = 'power-up';
        const type = ['health', 'speed', 'shield', 'damage'][Math.floor(Math.random() * 4)];
        powerUp.classList.add(`power-up-${type}`);
        
        const x = Math.random() * (window.innerWidth - 30);
        const y = Math.random() * (window.innerHeight - 30);
        
        powerUp.style.left = `${x}px`;
        powerUp.style.top = `${y}px`;
        
        this.gameContainer.appendChild(powerUp);
        this.powerUps.push({
            element: powerUp,
            type: type,
            x: x,
            y: y
        });
    }

    activateSpecialPower() {
        if (this.powerCooldown) return;

        const cooldownTime = 5000; // 5 seconds cooldown
        this.powerCooldown = true;
        
        // Update cooldown UI
        const cooldownBar = document.getElementById('power-cooldown');
        const powerIcon = document.getElementById('power-icon');
        
        cooldownBar.style.width = '0%';
        powerIcon.classList.add('power-active');
        
        // Play power activation sound
        this.playSound('power-activate');
        
        // Animate cooldown
        let startTime = performance.now();
        const updateCooldown = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = (elapsed / cooldownTime) * 100;
            
            if (progress < 100) {
                cooldownBar.style.width = `${progress}%`;
                requestAnimationFrame(updateCooldown);
            } else {
                cooldownBar.style.width = '100%';
                this.powerCooldown = false;
                powerIcon.classList.remove('power-active');
                this.playSound('power-ready');
            }
        };
        requestAnimationFrame(updateCooldown);

        // Element-specific power effects
        switch(this.currentElement) {
            case 'fire':
                this.fireNova();
                break;
            case 'water':
                this.waterWave();
                break;
            case 'earth':
                this.earthShield();
                break;
            case 'air':
                this.airDash();
                break;
        }

        // Add power usage to stats
        this.stats.powersUsed++;
        this.checkAchievements();
    }

    fireNova() {
        // Create expanding ring of fire
        const nova = document.createElement('div');
        nova.className = 'fire-nova special-effect';
        nova.style.left = `${this.position.x - 150}px`;
        nova.style.top = `${this.position.y - 150}px`;
        this.gameContainer.appendChild(nova);

        // Create inner flames
        for (let i = 0; i < 12; i++) {
            const flame = document.createElement('div');
            flame.className = 'fire-flame';
            const angle = (i / 12) * Math.PI * 2;
            const distance = Math.random() * 100 + 50;
            flame.style.left = `${this.position.x + Math.cos(angle) * distance}px`;
            flame.style.top = `${this.position.y + Math.sin(angle) * distance}px`;
            this.gameContainer.appendChild(flame);
            setTimeout(() => flame.remove(), 1000);
        }

        // Screen shake effect
        this.gameContainer.classList.add('screen-shake');
        setTimeout(() => this.gameContainer.classList.remove('screen-shake'), 500);

        // Damage enemies within range with falloff
        const maxRange = 150;
        this.enemies.forEach(enemy => {
            const distance = Math.sqrt(
                Math.pow(enemy.x - this.position.x, 2) + 
                Math.pow(enemy.y - this.position.y, 2)
            );
            if (distance <= maxRange) {
                const falloff = 1 - (distance / maxRange);
                const damage = this.calculateDamage(30 * falloff, this.currentElement, enemy.type);
                enemy.health -= damage;
                this.showDamageNumber(enemy.x, enemy.y, damage);
                
                // Apply burning effect
                if (!enemy.burning) {
                    enemy.burning = true;
                    enemy.burnTicks = 3;
                    enemy.burnInterval = setInterval(() => {
                        if (enemy.burnTicks > 0) {
                            const burnDamage = this.calculateDamage(5, 'fire', enemy.type);
                            enemy.health -= burnDamage;
                            this.showDamageNumber(enemy.x, enemy.y, burnDamage, 'burn');
                            enemy.burnTicks--;
                        } else {
                            clearInterval(enemy.burnInterval);
                            enemy.burning = false;
                        }
                    }, 1000);
                }
            }
        });

        setTimeout(() => nova.remove(), 1000);
    }

    waterWave() {
        const waves = 8;
        const projectilesPerWave = 3;
        let waveCount = 0;
        
        const spawnWave = () => {
            for (let i = 0; i < projectilesPerWave; i++) {
                const wave = document.createElement('div');
                wave.className = 'water-wave special-effect';
                wave.style.left = `${this.position.x}px`;
                wave.style.top = `${this.position.y}px`;
                
                const angle = ((i / projectilesPerWave) * Math.PI * 2) + (waveCount * Math.PI / 8);
                const velocity = {
                    x: Math.cos(angle) * 8,
                    y: Math.sin(angle) * 8
                };
                
                this.gameContainer.appendChild(wave);
                
                let distance = 0;
                const maxDistance = 250;
                
                const moveWave = () => {
                    const currentX = parseFloat(wave.style.left);
                    const currentY = parseFloat(wave.style.top);
                    
                    wave.style.left = `${currentX + velocity.x}px`;
                    wave.style.top = `${currentY + velocity.y}px`;
                    
                    this.enemies.forEach(enemy => {
                        if (enemy.slowed) return;
                        
                        const hitDistance = Math.sqrt(
                            Math.pow(enemy.x - currentX, 2) + 
                            Math.pow(enemy.y - currentY, 2)
                        );
                        if (hitDistance < 30) {
                            const damage = this.calculateDamage(20, this.currentElement, enemy.type);
                            enemy.health -= damage;
                            this.showDamageNumber(enemy.x, enemy.y, damage);
                            
                            // Apply slow effect
                            enemy.slowed = true;
                            enemy.speed *= 0.5;
                            setTimeout(() => {
                                enemy.speed *= 2;
                                enemy.slowed = false;
                            }, 2000);
                        }
                    });
                    
                    distance += Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
                    if (distance < maxDistance) {
                        requestAnimationFrame(moveWave);
                    } else {
                        wave.remove();
                    }
                };
                
                requestAnimationFrame(moveWave);
            }
            
            waveCount++;
            if (waveCount < waves) {
                setTimeout(spawnWave, 100);
            }
        };
        
        spawnWave();
    }

    earthShield() {
        const shield = document.createElement('div');
        shield.className = 'earth-shield special-effect';
        this.gameContainer.appendChild(shield);
        
        const shieldDuration = 3000;
        let shieldHealth = 100;
        this.hasShield = true;
        
        // Create orbiting rocks
        const rocks = [];
        for (let i = 0; i < 4; i++) {
            const rock = document.createElement('div');
            rock.className = 'earth-rock';
            this.gameContainer.appendChild(rock);
            rocks.push(rock);
        }
        
        let angle = 0;
        const updateShield = () => {
            if (!this.hasShield) return;
            
            shield.style.left = `${this.position.x - 40}px`;
            shield.style.top = `${this.position.y - 40}px`;
            
            // Update orbiting rocks
            angle += 0.05;
            rocks.forEach((rock, index) => {
                const rockAngle = angle + (index * Math.PI / 2);
                rock.style.left = `${this.position.x + Math.cos(rockAngle) * 60 - 10}px`;
                rock.style.top = `${this.position.y + Math.sin(rockAngle) * 60 - 10}px`;
            });
            
            requestAnimationFrame(updateShield);
        };
        requestAnimationFrame(updateShield);
        
        const originalDamageHandler = this.takeDamage;
        this.takeDamage = (damage) => {
            if (this.hasShield) {
                this.playSound('shield-hit');
                shieldHealth -= damage;
                shield.style.opacity = shieldHealth / 100;
                
                // Create shield hit effect
                const hit = document.createElement('div');
                hit.className = 'shield-hit';
                hit.style.left = `${this.position.x - 45}px`;
                hit.style.top = `${this.position.y - 45}px`;
                this.gameContainer.appendChild(hit);
                setTimeout(() => hit.remove(), 200);
                
                if (shieldHealth <= 0) {
                    this.hasShield = false;
                    shield.remove();
                    rocks.forEach(rock => rock.remove());
                    this.takeDamage = originalDamageHandler;
                }
                return;
            }
            originalDamageHandler.call(this, damage);
        };
        
        setTimeout(() => {
            if (this.hasShield) {
                this.hasShield = false;
                shield.remove();
                rocks.forEach(rock => rock.remove());
                this.takeDamage = originalDamageHandler;
            }
        }, shieldDuration);
    }

    airDash() {
        const originalSpeed = this.speed;
        this.speed *= 3;
        this.invulnerable = true;
        
        const dash = document.createElement('div');
        dash.className = 'air-dash special-effect';
        this.gameContainer.appendChild(dash);
        
        const dashDuration = 500;
        let startTime = performance.now();
        let lastAfterimageTime = 0;
        
        const createAfterimage = () => {
            const afterimage = document.createElement('div');
            afterimage.className = 'air-afterimage';
            afterimage.style.left = `${this.position.x - 20}px`;
            afterimage.style.top = `${this.position.y - 20}px`;
            this.gameContainer.appendChild(afterimage);
            
            // Create wind particles
            for (let i = 0; i < 3; i++) {
                const particle = document.createElement('div');
                particle.className = 'wind-particle';
                particle.style.left = `${this.position.x + (Math.random() * 40 - 20)}px`;
                particle.style.top = `${this.position.y + (Math.random() * 40 - 20)}px`;
                this.gameContainer.appendChild(particle);
                setTimeout(() => particle.remove(), 300);
            }
            
            setTimeout(() => afterimage.remove(), 200);
        };
        
        const updateDash = (currentTime) => {
            const elapsed = currentTime - startTime;
            
            if (elapsed < dashDuration) {
                dash.style.left = `${this.position.x - 30}px`;
                dash.style.top = `${this.position.y - 30}px`;
                
                if (currentTime - lastAfterimageTime > 50) {
                    createAfterimage();
                    lastAfterimageTime = currentTime;
                }
                
                this.enemies.forEach(enemy => {
                    const distance = Math.sqrt(
                        Math.pow(enemy.x - this.position.x, 2) + 
                        Math.pow(enemy.y - this.position.y, 2)
                    );
                    if (distance < 50) {
                        const damage = this.calculateDamage(15, this.currentElement, enemy.type);
                        enemy.health -= damage;
                        this.showDamageNumber(enemy.x, enemy.y, damage);
                        
                        // Knock back enemy
                        const angle = Math.atan2(enemy.y - this.position.y, enemy.x - this.position.x);
                        enemy.x += Math.cos(angle) * 50;
                        enemy.y += Math.sin(angle) * 50;
                    }
                });
                
                requestAnimationFrame(updateDash);
            } else {
                this.speed = originalSpeed;
                this.invulnerable = false;
                dash.remove();
            }
        };
        
        requestAnimationFrame(updateDash);
    }

    showDamageNumber(x, y, damage, type = 'normal') {
        const damageText = document.createElement('div');
        damageText.className = `damage-number ${type}-damage`;
        damageText.textContent = Math.round(damage);
        damageText.style.left = `${x}px`;
        damageText.style.top = `${y}px`;
        this.gameContainer.appendChild(damageText);
        
        // Add random slight offset to prevent stacking
        const offset = Math.random() * 20 - 10;
        damageText.style.transform = `translateX(${offset}px)`;
        
        setTimeout(() => damageText.remove(), 1000);
    }

    playSound(soundType) {
        // Placeholder for sound system
        // TODO: Implement sound effects
    }

    updateEnemies() {
        this.enemies = this.enemies.filter(enemy => {
            const dx = this.position.x - enemy.x;
            const dy = this.position.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Move enemy toward player
            const angle = Math.atan2(dy, dx);
            enemy.x += Math.cos(angle) * enemy.speed;
            enemy.y += Math.sin(angle) * enemy.speed;
            enemy.element.style.left = `${enemy.x}px`;
            enemy.element.style.top = `${enemy.y}px`;

            // Check collision
            if (distance < 40) {
                const advantage = this.checkElementalAdvantage(this.currentElement, enemy.type);
                
                if (advantage === 'strong' || this.currentElement === enemy.type) {
                    enemy.element.remove();
                    this.gameStats.totalKills++;
                    
                    if (advantage === 'strong') {
                        this.gameStats.typeAdvantageKills++;
                        this.createElementalEffect('critical', enemy.x, enemy.y);
                        this.addScore(50 * this.comboMultiplier);
                    } else {
                        this.createElementalEffect('normal', enemy.x, enemy.y);
                        this.addScore(30 * this.comboMultiplier);
                    }
                    
                    this.updateCombo();
                    return false;
                } else {
                    const damage = advantage === 'weak' ? 15 : 10;
                    this.takeDamage(damage);
                    this.createElementalEffect('damage', this.position.x, this.position.y);
                }
            }
            
            return true;
        });

        // Check achievements
        if (this.gameStats.typeAdvantageKills >= this.achievements.elementMaster.requirement) {
            this.unlockAchievement('elementMaster');
        }
    }

    checkElementalAdvantage(playerElement, enemyElement) {
        if (this.elementRelations[playerElement].strong === enemyElement) {
            return 'strong';
        } else if (this.elementRelations[playerElement].weak === enemyElement) {
            return 'weak';
        }
        return 'neutral';
    }

    createElementalEffect(type, x, y) {
        const effect = document.createElement('div');
        effect.className = `elemental-effect ${type}-effect`;
        effect.style.left = `${x}px`;
        effect.style.top = `${y}px`;
        this.gameContainer.appendChild(effect);
        
        setTimeout(() => effect.remove(), 1000);
    }

    updateCombo() {
        clearTimeout(this.comboTimer);
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.comboMultiplier = 1 + (this.combo * 0.1);
        
        // Show combo effect
        this.showComboEffect();
        
        // Reset combo after 3 seconds
        this.comboTimer = setTimeout(() => {
            this.combo = 0;
            this.comboMultiplier = 1;
            this.updateStats();
        }, 3000);

        // Check combo achievement
        if (this.combo >= this.achievements.comboMaster.requirement && !this.achievements.comboMaster.achieved) {
            this.unlockAchievement('comboMaster');
        }
    }

    showComboEffect() {
        const comboEffect = document.createElement('div');
        comboEffect.className = 'combo-effect';
        comboEffect.textContent = `${this.combo}x COMBO!`;
        comboEffect.style.left = `${this.position.x}px`;
        comboEffect.style.top = `${this.position.y - 50}px`;
        this.gameContainer.appendChild(comboEffect);
        
        setTimeout(() => comboEffect.remove(), 1000);
    }

    unlockAchievement(achievementId) {
        this.achievements[achievementId].achieved = true;
        
        // Create achievement notification
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <h3>Achievement Unlocked!</h3>
            <p>${this.achievements[achievementId].description}</p>
        `;
        document.body.appendChild(notification);
        
        // Remove notification after animation
        setTimeout(() => notification.remove(), 3000);

        // Play achievement sound
        const achievementSound = new Audio('/static/achievement.mp3');
        achievementSound.volume = 0.5;
        achievementSound.play().catch(() => {});
    }

    takeDamage(amount) {
        amount = amount / this.healthMultiplier;
        this.health = Math.max(0, this.health - amount);
        this.player.classList.add('damaged');
        setTimeout(() => this.player.classList.remove('damaged'), 200);
        
        if (this.health <= 0) {
            this.gameOver();
        }
        
        this.updateStats();
    }

    addScore(points) {
        this.score += points;
        if (this.score >= this.level * 1000) {
            this.levelUp();
        }
        this.updateStats();
    }

    levelUp() {
        this.level++;
        this.health = Math.min(100, this.health + 20);
        
        // Increase difficulty
        this.enemySpawnInterval = Math.max(500, 2000 - (this.level * 100));
        
        const levelUp = document.createElement('div');
        levelUp.className = 'level-up';
        levelUp.textContent = `Level ${this.level}!`;
        document.body.appendChild(levelUp);
        setTimeout(() => levelUp.remove(), 2000);
        
        this.updateStats();
    }

    updateStats() {
        document.getElementById('health').style.width = `${this.health}%`;
        document.getElementById('score').textContent = `Score: ${Math.floor(this.score)}`;
        document.getElementById('level').textContent = `Level ${this.level}`;
        
        // Update combo display
        const comboDisplay = document.getElementById('combo');
        if (this.combo > 1) {
            comboDisplay.textContent = `${this.combo}x Combo!`;
            comboDisplay.style.display = 'block';
        } else {
            comboDisplay.style.display = 'none';
        }

        // Check survivalist achievement
        const survivalTime = (Date.now() - this.gameStats.startTime) / 1000;
        if (survivalTime >= 300 && !this.achievements.survivalist.achieved) {
            this.unlockAchievement('survivalist');
        }
    }

    gameOver() {
        this.gameActive = false;
        
        // Stop all movement
        this.velocity = { x: 0, y: 0 };
        
        // Remove all game objects
        this.enemies.forEach(enemy => enemy.element.remove());
        this.powerUps.forEach(powerUp => powerUp.element.remove());
        this.enemies = [];
        this.powerUps = [];
        
        // Disable element buttons
        Object.values(this.elementButtons).forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        });
        
        // Remove event listeners
        window.removeEventListener('keydown', this.keyDownHandler);
        window.removeEventListener('keyup', this.keyUpHandler);
        
        // Show game over screen
        const gameOver = document.createElement('div');
        gameOver.className = 'game-over';
        gameOver.innerHTML = `
            <h1>Game Over!</h1>
            <p>Final Score: ${Math.floor(this.score)}</p>
            <p>Level Reached: ${this.level}</p>
            <button onclick="location.reload()">Play Again</button>
        `;
        document.body.appendChild(gameOver);
        
        // Add fade effect to game container
        this.gameContainer.classList.add('game-over-fade');
    }

    gameLoop() {
        if (!this.gameActive) return;
        
        const currentTime = Date.now();
        
        if (currentTime - this.lastEnemySpawn > this.enemySpawnInterval) {
            this.spawnEnemies();
            this.lastEnemySpawn = currentTime;
        }

        this.updatePlayerPosition();
        this.updateEnemies();

        if (Math.random() < this.powerUpFrequency) {
            this.spawnPowerUps();
        }

        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    new ElementGame();
});
