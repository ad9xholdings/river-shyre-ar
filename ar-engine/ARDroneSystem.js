/**
 * AR Drone Collection System
 * JamZia AR InterActive Entertainment™ - RiverShyre™
 * Ad9x Holdings, LLC
 * 
 * Drone-based AR creature collection
 * Inspired by Jurassic World Alive - dart DNA from creatures
 */

const crypto = require('crypto');

class ARDroneSystem {
    constructor() {
        this.name = 'RiverShyre Drone';
        this.version = '1.0.0';
        
        // Drone specifications
        this.droneTypes = {
            STARTER: {
                name: 'Sky Scout',
                range: 50, // meters
                battery: 300, // seconds
                dartCapacity: 10,
                accuracy: 0.7,
                reloadTime: 5,
                cost: 0
            },
            STANDARD: {
                name: 'Cloud Hunter',
                range: 100,
                battery: 600,
                dartCapacity: 20,
                accuracy: 0.8,
                reloadTime: 3,
                cost: 1000 // SKYIVY
            },
            ADVANCED: {
                name: 'Storm Chaser',
                range: 200,
                battery: 900,
                dartCapacity: 30,
                accuracy: 0.9,
                reloadTime: 2,
                cost: 5000
            },
            PREMIUM: {
                name: 'Legendary Seeker',
                range: 500,
                battery: 1800,
                dartCapacity: 50,
                accuracy: 0.95,
                reloadTime: 1,
                cost: 25000
            }
        };
        
        // Dart types
        this.dartTypes = {
            BASIC: {
                name: 'Basic Dart',
                dnaAmount: { min: 10, max: 25 },
                effectiveness: 1.0,
                cost: 0
            },
            ENHANCED: {
                name: 'Enhanced Dart',
                dnaAmount: { min: 25, max: 50 },
                effectiveness: 1.5,
                cost: 10 // SKYLOCKR
            },
            PREMIUM: {
                name: 'Premium Dart',
                dnaAmount: { min: 50, max: 100 },
                effectiveness: 2.0,
                cost: 50
            },
            LEGENDARY: {
                name: 'Legendary Dart',
                dnaAmount: { min: 100, max: 250 },
                effectiveness: 3.0,
                cost: 200
            }
        };
        
        // Creature spawn data
        this.creatureTypes = this.generateCreatureTypes();
        
        // Active spawns
        this.activeSpawns = new Map();
        this.playerDrones = new Map();
        this.collectionAttempts = new Map();
        this.dnaInventory = new Map();
    }
    
    generateCreatureTypes() {
        const elements = ['fire', 'water', 'earth', 'air', 'light', 'dark', 'nature', 'electric'];
        const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
        const types = {};
        
        for (const element of elements) {
            for (const rarity of rarities) {
                const typeId = `${element}_${rarity}`;
                types[typeId] = {
                    id: typeId,
                    element,
                    rarity,
                    baseHealth: this.getBaseHealth(rarity),
                    fleeChance: this.getFleeChance(rarity),
                    spawnRate: this.getSpawnRate(rarity),
                    dnaReward: this.getDnaReward(rarity),
                    emoji: this.getElementEmoji(element),
                    behaviors: this.getBehaviors(rarity)
                };
            }
        }
        
        return types;
    }
    
    getBaseHealth(rarity) {
        const healths = { common: 100, uncommon: 150, rare: 250, epic: 400, legendary: 700, mythic: 1200 };
        return healths[rarity] || 100;
    }
    
    getFleeChance(rarity) {
        const chances = { common: 0.1, uncommon: 0.15, rare: 0.25, epic: 0.35, legendary: 0.5, mythic: 0.7 };
        return chances[rarity] || 0.1;
    }
    
    getSpawnRate(rarity) {
        const rates = { common: 0.4, uncommon: 0.25, rare: 0.15, epic: 0.08, legendary: 0.03, mythic: 0.01 };
        return rates[rarity] || 0.1;
    }
    
    getDnaReward(rarity) {
        const rewards = { common: 20, uncommon: 35, rare: 60, epic: 100, legendary: 200, mythic: 500 };
        return rewards[rarity] || 20;
    }
    
    getElementEmoji(element) {
        const emojis = {
            fire: '🔥', water: '💧', earth: '🌍', air: '💨',
            light: '✨', dark: '🌑', nature: '🌿', electric: '⚡'
        };
        return emojis[element] || '❓';
    }
    
    getBehaviors(rarity) {
        const behaviors = {
            common: ['idle', 'walk'],
            uncommon: ['idle', 'walk', 'run'],
            rare: ['idle', 'walk', 'run', 'hide'],
            epic: ['idle', 'walk', 'run', 'hide', 'attack'],
            legendary: ['idle', 'walk', 'run', 'hide', 'attack', 'fly'],
            mythic: ['idle', 'walk', 'run', 'hide', 'attack', 'fly', 'teleport']
        };
        return behaviors[rarity] || ['idle'];
    }
    
    // Initialize player drone
    async initializeDrone(playerId, droneType = 'STARTER') {
        const droneConfig = this.droneTypes[droneType];
        if (!droneConfig) throw new Error('Invalid drone type');
        
        const drone = {
            id: crypto.randomUUID(),
            playerId,
            type: droneType,
            ...droneConfig,
            currentBattery: droneConfig.battery,
            dartsRemaining: droneConfig.dartCapacity,
            status: 'ready',
            upgrades: [],
            totalCollections: 0,
            acquiredAt: new Date().toISOString()
        };
        
        this.playerDrones.set(playerId, drone);
        
        return {
            droneId: drone.id,
            name: drone.name,
            range: drone.range,
            battery: drone.battery,
            darts: drone.dartCapacity,
            message: `${drone.name} drone ready for deployment!`
        };
    }
    
    // Spawn creatures in AR
    async spawnCreatures(location, radius = 100, playerId) {
        const spawnId = crypto.randomUUID();
        const creatures = [];
        
        // Determine number of spawns based on location type
        const spawnCount = Math.floor(Math.random() * 5) + 3; // 3-8 creatures
        
        for (let i = 0; i < spawnCount; i++) {
            const creature = this.generateCreature(location, radius);
            if (creature) {
                creatures.push(creature);
                this.activeSpawns.set(creature.id, creature);
            }
        }
        
        return {
            spawnId,
            location,
            radius,
            creaturesFound: creatures.length,
            creatures: creatures.map(c => ({
                id: c.id,
                type: c.typeId,
                element: c.element,
                rarity: c.rarity,
                emoji: c.emoji,
                distance: c.distance,
                behavior: c.currentBehavior,
                health: c.currentHealth,
                maxHealth: c.maxHealth
            }))
        };
    }
    
    generateCreature(centerLocation, radius) {
        // Select creature type based on spawn rates
        const roll = Math.random();
        let cumulativeRate = 0;
        let selectedType = null;
        
        for (const [typeId, typeData] of Object.entries(this.creatureTypes)) {
            cumulativeRate += typeData.spawnRate;
            if (roll <= cumulativeRate) {
                selectedType = typeData;
                break;
            }
        }
        
        if (!selectedType) return null;
        
        // Generate random position within radius
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        
        const location = {
            lat: centerLocation.lat + (distance * Math.cos(angle) / 111320),
            lng: centerLocation.lng + (distance * Math.sin(angle) / (111320 * Math.cos(centerLocation.lat * Math.PI / 180)))
        };
        
        const creature = {
            id: crypto.randomUUID(),
            typeId: selectedType.id,
            element: selectedType.element,
            rarity: selectedType.rarity,
            emoji: selectedType.emoji,
            maxHealth: selectedType.baseHealth + Math.floor(Math.random() * 50),
            currentHealth: selectedType.baseHealth,
            location,
            distance: Math.floor(distance),
            behavior: selectedType.behaviors[Math.floor(Math.random() * selectedType.behaviors.length)],
            fleeChance: selectedType.fleeChance,
            dnaReward: selectedType.dnaReward,
            spawnedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 300000).toISOString(), // 5 min expiry
            capturedBy: null
        };
        
        creature.currentHealth = creature.maxHealth;
        
        return creature;
    }
    
    // Launch drone and attempt collection
    async launchDrone(playerId, creatureId, dartType = 'BASIC') {
        const drone = this.playerDrones.get(playerId);
        if (!drone) throw new Error('No drone initialized');
        if (drone.status !== 'ready') throw new Error('Drone not ready');
        if (drone.currentBattery <= 0) throw new Error('Drone battery depleted');
        if (drone.dartsRemaining <= 0) throw new Error('No darts remaining');
        
        const creature = this.activeSpawns.get(creatureId);
        if (!creature) throw new Error('Creature no longer available');
        if (creature.capturedBy) throw new Error('Creature already captured');
        
        const dart = this.dartTypes[dartType];
        if (!dart) throw new Error('Invalid dart type');
        
        // Consume resources
        drone.dartsRemaining -= 1;
        drone.currentBattery -= 10;
        
        // Calculate hit chance
        const distancePenalty = creature.distance > drone.range ? 0 : 1 - (creature.distance / drone.range * 0.3);
        const hitChance = drone.accuracy * dart.effectiveness * distancePenalty;
        
        const attemptId = crypto.randomUUID();
        const attempt = {
            id: attemptId,
            playerId,
            creatureId,
            droneId: drone.id,
            dartType,
            hitChance,
            timestamp: new Date().toISOString()
        };
        
        this.collectionAttempts.set(attemptId, attempt);
        
        // Check if hit
        const hit = Math.random() < hitChance;
        
        if (hit) {
            return await this.processHit(playerId, creature, dart, attempt);
        } else {
            return await this.processMiss(playerId, creature, attempt);
        }
    }
    
    async processHit(playerId, creature, dart, attempt) {
        // Calculate DNA collected
        const baseDna = Math.floor(Math.random() * (dart.dnaAmount.max - dart.dnaAmount.min + 1)) + dart.dnaAmount.min;
        const rarityMultiplier = { common: 1, uncommon: 1.2, rare: 1.5, epic: 2, legendary: 3, mythic: 5 };
        const dnaCollected = Math.floor(baseDna * (rarityMultiplier[creature.rarity] || 1));
        
        // Damage creature
        const damage = Math.floor(dnaCollected * 2);
        creature.currentHealth -= damage;
        
        // Check if creature flees
        if (Math.random() < creature.fleeChance) {
            this.activeSpawns.delete(creature.id);
            
            return {
                attemptId: attempt.id,
                result: 'fled',
                dnaCollected: Math.floor(dnaCollected * 0.5),
                message: `The ${creature.rarity} ${creature.element} creature fled! You collected ${Math.floor(dnaCollected * 0.5)} DNA.`,
                creature: {
                    id: creature.id,
                    rarity: creature.rarity,
                    element: creature.element,
                    emoji: creature.emoji
                }
            };
        }
        
        // Check if captured
        if (creature.currentHealth <= 0) {
            creature.capturedBy = playerId;
            
            // Add bonus DNA for capture
            const captureBonus = creature.dnaReward;
            const totalDna = dnaCollected + captureBonus;
            
            // Add to player's DNA inventory
            await this.addDnaToInventory(playerId, creature.typeId, totalDna);
            
            // Update drone stats
            const drone = this.playerDrones.get(playerId);
            drone.totalCollections += 1;
            
            return {
                attemptId: attempt.id,
                result: 'captured',
                dnaCollected: totalDna,
                bonusDna: captureBonus,
                message: `CAPTURED! You collected ${totalDna} DNA from the ${creature.rarity} ${creature.element} creature!`,
                creature: {
                    id: creature.id,
                    typeId: creature.typeId,
                    rarity: creature.rarity,
                    element: creature.element,
                    emoji: creature.emoji
                }
            };
        }
        
        // Partial collection
        await this.addDnaToInventory(playerId, creature.typeId, dnaCollected);
        
        return {
            attemptId: attempt.id,
            result: 'hit',
            dnaCollected,
            creatureHealth: creature.currentHealth,
            creatureMaxHealth: creature.maxHealth,
            message: `Direct hit! Collected ${dnaCollected} DNA. Creature health: ${creature.currentHealth}/${creature.maxHealth}`,
            creature: {
                id: creature.id,
                rarity: creature.rarity,
                element: creature.element,
                emoji: creature.emoji
            }
        };
    }
    
    async processMiss(playerId, creature, attempt) {
        // Creature might become alert
        creature.fleeChance += 0.1;
        
        return {
            attemptId: attempt.id,
            result: 'miss',
            dnaCollected: 0,
            message: 'Missed! The creature is getting wary...',
            creature: {
                id: creature.id,
                rarity: creature.rarity,
                element: creature.element,
                emoji: creature.emoji
            }
        };
    }
    
    async addDnaToInventory(playerId, creatureTypeId, amount) {
        if (!this.dnaInventory.has(playerId)) {
            this.dnaInventory.set(playerId, new Map());
        }
        
        const inventory = this.dnaInventory.get(playerId);
        const current = inventory.get(creatureTypeId) || 0;
        inventory.set(creatureTypeId, current + amount);
    }
    
    // Reload drone darts
    async reloadDrone(playerId, dartType = 'BASIC') {
        const drone = this.playerDrones.get(playerId);
        if (!drone) throw new Error('No drone found');
        
        const dart = this.dartTypes[dartType];
        if (!dart) throw new Error('Invalid dart type');
        
        // Simulate reload time
        await new Promise(resolve => setTimeout(resolve, drone.reloadTime * 1000));
        
        drone.dartsRemaining = drone.dartCapacity;
        
        return {
            droneId: drone.id,
            dartsLoaded: drone.dartCapacity,
            dartType,
            message: `${drone.name} reloaded with ${drone.dartCapacity} ${dart.name}s!`
        };
    }
    
    // Recharge drone battery
    async rechargeDrone(playerId) {
        const drone = this.playerDrones.get(playerId);
        if (!drone) throw new Error('No drone found');
        
        drone.currentBattery = drone.battery;
        drone.status = 'ready';
        
        return {
            droneId: drone.id,
            battery: drone.currentBattery,
            message: `${drone.name} fully recharged!`
        };
    }
    
    // Upgrade drone
    async upgradeDrone(playerId, upgradeType) {
        const drone = this.playerDrones.get(playerId);
        if (!drone) throw new Error('No drone found');
        
        const upgrades = {
            battery: { cost: 500, effect: 'battery', value: 1.2 },
            capacity: { cost: 750, effect: 'dartCapacity', value: 1.3 },
            accuracy: { cost: 1000, effect: 'accuracy', value: 1.1 },
            range: { cost: 1500, effect: 'range', value: 1.25 }
        };
        
        const upgrade = upgrades[upgradeType];
        if (!upgrade) throw new Error('Invalid upgrade type');
        
        // Apply upgrade
        drone[upgrade.effect] = Math.floor(drone[upgrade.effect] * upgrade.value);
        drone.upgrades.push(upgradeType);
        
        return {
            droneId: drone.id,
            upgrade: upgradeType,
            newValue: drone[upgrade.effect],
            message: `${drone.name} upgraded! ${upgrade.effect} increased to ${drone[upgrade.effect]}.`
        };
    }
    
    // Get player's DNA inventory
    getDnaInventory(playerId) {
        const inventory = this.dnaInventory.get(playerId);
        if (!inventory) return {};
        
        const result = {};
        for (const [typeId, amount] of inventory.entries()) {
            const creatureType = this.creatureTypes[typeId];
            result[typeId] = {
                amount,
                element: creatureType?.element,
                rarity: creatureType?.rarity,
                emoji: creatureType?.emoji
            };
        }
        
        return result;
    }
    
    // Check if can unlock creature
    canUnlockCreature(playerId, creatureTypeId) {
        const inventory = this.dnaInventory.get(playerId);
        if (!inventory) return { canUnlock: false, needed: 100 };
        
        const current = inventory.get(creatureTypeId) || 0;
        const creatureType = this.creatureTypes[creatureTypeId];
        const needed = creatureType?.dnaReward * 5 || 100; // Need 5x spawn DNA to unlock
        
        return {
            canUnlock: current >= needed,
            current,
            needed,
            remaining: Math.max(0, needed - current)
        };
    }
    
    // Get drone status
    getDroneStatus(playerId) {
        const drone = this.playerDrones.get(playerId);
        if (!drone) return null;
        
        return {
            id: drone.id,
            name: drone.name,
            type: drone.type,
            battery: {
                current: drone.currentBattery,
                max: drone.battery,
                percentage: Math.floor((drone.currentBattery / drone.battery) * 100)
            },
            darts: {
                remaining: drone.dartsRemaining,
                capacity: drone.dartCapacity
            },
            status: drone.status,
            totalCollections: drone.totalCollections,
            upgrades: drone.upgrades
        };
    }
    
    // Get nearby active spawns
    getNearbySpawns(location, radius = 100) {
        const nearby = [];
        
        for (const [id, creature] of this.activeSpawns.entries()) {
            if (creature.capturedBy) continue;
            if (new Date() > new Date(creature.expiresAt)) continue;
            
            const distance = this.calculateDistance(location, creature.location);
            if (distance <= radius) {
                nearby.push({
                    id: creature.id,
                    typeId: creature.typeId,
                    element: creature.element,
                    rarity: creature.rarity,
                    emoji: creature.emoji,
                    distance: Math.floor(distance),
                    health: creature.currentHealth,
                    maxHealth: creature.maxHealth,
                    behavior: creature.behavior
                });
            }
        }
        
        return nearby.sort((a, b) => a.distance - b.distance);
    }
    
    calculateDistance(loc1, loc2) {
        const R = 6371e3;
        const φ1 = loc1.lat * Math.PI / 180;
        const φ2 = loc2.lat * Math.PI / 180;
        const Δφ = (loc2.lat - loc1.lat) * Math.PI / 180;
        const Δλ = (loc2.lng - loc1.lng) * Math.PI / 180;
        
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c;
    }
}

module.exports = ARDroneSystem;
