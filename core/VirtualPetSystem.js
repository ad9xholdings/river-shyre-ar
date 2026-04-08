/**
 * Virtual Pet Breeding System
 * JamZia AR InterActive Entertainment™ - RiverShyre™
 * Ad9x Holdings, LLC
 * 
 * AI-driven creature breeding with DNA genetics
 * Inspired by Peridot - unique appearances, tricks, bonding
 */

const crypto = require('crypto');

class VirtualPetSystem {
    constructor() {
        this.name = 'RiverShyre Pets';
        this.version = '1.0.0';
        
        // DNA trait categories
        this.dnaTraits = {
            // Physical appearance
            appearance: {
                bodyType: ['slim', 'athletic', 'chubby', 'muscular', 'tiny', 'giant'],
                skinTexture: ['smooth', 'scaly', 'furry', 'feathery', 'crystalline', 'metallic'],
                colorPrimary: ['red', 'blue', 'green', 'gold', 'purple', 'cyan', 'rainbow', 'void'],
                colorSecondary: ['white', 'black', 'silver', 'copper', 'emerald', 'sapphire'],
                pattern: ['solid', 'striped', 'spotted', 'gradient', 'geometric', 'cosmic'],
                glowIntensity: [0, 1, 2, 3, 4, 5] // 0 = none, 5 = blinding
            },
            
            // Facial features
            face: {
                eyeShape: ['round', 'almond', 'slitted', 'compound', 'glowing', 'hypnotic'],
                eyeColor: ['amber', 'emerald', 'sapphire', 'ruby', 'obsidian', 'stardust'],
                mouthType: ['smile', 'frown', 'neutral', 'beak', 'snout', 'fanged'],
                hornCount: [0, 1, 2, 3, 4, 6],
                hornShape: ['none', 'straight', 'curved', 'spiral', 'branching', 'crystal'],
                earType: ['none', 'pointed', 'floppy', 'feathery', 'antennae', 'frills']
            },
            
            // Special features
            special: {
                wings: ['none', 'feathered', 'bat', 'insect', 'energy', 'mechanical'],
                tail: ['none', 'long', 'bushy', 'spiked', 'fin', 'prehensile', 'multiple'],
                aura: ['none', 'fire', 'water', 'earth', 'air', 'lightning', 'cosmic'],
                element: ['neutral', 'fire', 'water', 'earth', 'air', 'light', 'dark', 'chaos'],
                rarity: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'divine']
            },
            
            // Personality (affects behavior)
            personality: {
                temperament: ['calm', 'energetic', 'shy', 'bold', 'mischievous', 'loyal'],
                intelligence: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                sociability: ['solitary', 'pair', 'pack', 'swarm', 'any'],
                activityLevel: ['lazy', 'moderate', 'active', 'hyper'],
                curiosity: ['low', 'medium', 'high', 'extreme']
            }
        };
        
        // Pet database
        this.pets = new Map();
        this.eggs = new Map();
        this.breedingPairs = new Map();
        this.tricks = new Map();
        
        // Bonding mechanics
        this.bondingActivities = [
            'feeding', 'petting', 'playing', 'training', 
            'exploring', 'battling', 'crafting', 'resting'
        ];
        
        // Evolution stages
        this.evolutionStages = {
            EGG: { name: 'Egg', duration: 300, xpNeeded: 0 },           // 5 minutes
            HATCHLING: { name: 'Hatchling', duration: 3600, xpNeeded: 100 },    // 1 hour
            JUVENILE: { name: 'Juvenile', duration: 86400, xpNeeded: 1000 },    // 1 day
            ADULT: { name: 'Adult', duration: 604800, xpNeeded: 10000 },        // 1 week
            ELDER: { name: 'Elder', duration: 2592000, xpNeeded: 50000 },       // 1 month
            ANCIENT: { name: 'Ancient', duration: null, xpNeeded: 100000 }      // Final
        };
    }
    
    // Generate DNA from parent genes or random
    generateDNA(parent1DNA = null, parent2DNA = null) {
        const dna = {};
        
        for (const [category, traits] of Object.entries(this.dnaTraits)) {
            dna[category] = {};
            
            for (const [trait, values] of Object.entries(traits)) {
                if (parent1DNA && parent2DNA) {
                    // Breeding - inherit from parents with mutation chance
                    dna[category][trait] = this.inheritTrait(
                        parent1DNA[category][trait],
                        parent2DNA[category][trait],
                        values
                    );
                } else {
                    // Random generation for wild creatures
                    dna[category][trait] = values[Math.floor(Math.random() * values.length)];
                }
            }
        }
        
        // Generate unique genetic signature
        dna.signature = crypto.randomBytes(16).toString('hex');
        dna.generation = parent1DNA ? Math.max(parent1DNA.generation, parent2DNA.generation) + 1 : 0;
        
        return dna;
    }
    
    inheritTrait(parent1Val, parent2Val, possibleValues) {
        const mutationChance = 0.05; // 5% mutation rate
        
        // Check for mutation
        if (Math.random() < mutationChance) {
            // Random mutation - could be anything
            return possibleValues[Math.floor(Math.random() * possibleValues.length)];
        }
        
        // 50% chance from either parent
        if (Math.random() < 0.5) {
            return parent1Val;
        }
        return parent2Val;
    }
    
    // Create a new pet from an egg
    async hatchEgg(eggId, ownerId) {
        const egg = this.eggs.get(eggId);
        if (!egg) throw new Error('Egg not found');
        if (egg.ownerId !== ownerId) throw new Error('Not your egg');
        
        const petId = crypto.randomUUID();
        const dna = egg.dna;
        
        // Calculate rarity based on DNA
        const rarity = this.calculateRarity(dna);
        
        const pet = {
            id: petId,
            ownerId,
            name: egg.name || 'Unnamed',
            dna,
            rarity,
            stage: 'HATCHLING',
            stats: {
                health: 50 + (rarity.score * 5),
                energy: 100,
                happiness: 50,
                hunger: 50,
                xp: 0,
                level: 1,
                bondLevel: 0
            },
            tricks: [],
            learnedTricks: [],
            battles: { wins: 0, losses: 0 },
            breeding: {
                canBreed: false,
                breedCount: 0,
                lastBred: null,
                cooldown: 86400 // 24 hours
            },
            appearance: this.generateAppearance(dna),
            createdAt: new Date().toISOString(),
            hatchedAt: new Date().toISOString(),
            lastInteracted: new Date().toISOString()
        };
        
        this.pets.set(petId, pet);
        this.eggs.delete(eggId);
        
        return {
            petId,
            name: pet.name,
            rarity: pet.rarity,
            appearance: pet.appearance,
            message: `A ${pet.rarity.tier} ${pet.dna.special.element} creature has hatched!`
        };
    }
    
    // Create an egg (from breeding or found in wild)
    async createEgg(config) {
        const eggId = crypto.randomUUID();
        
        const dna = config.parent1 && config.parent2 
            ? this.generateDNA(config.parent1.dna, config.parent2.dna)
            : this.generateDNA();
        
        const egg = {
            id: eggId,
            ownerId: config.ownerId,
            name: config.name,
            dna,
            parent1: config.parent1?.id || null,
            parent2: config.parent2?.id || null,
            incubationStart: new Date().toISOString(),
            incubationTime: this.calculateIncubationTime(dna),
            readyToHatch: false,
            createdAt: new Date().toISOString()
        };
        
        this.eggs.set(eggId, egg);
        
        return {
            eggId,
            incubationTime: egg.incubationTime,
            element: dna.special.element,
            message: 'Egg is incubating...'
        };
    }
    
    calculateIncubationTime(dna) {
        // Base 5 minutes, modified by rarity
        const baseTime = 300;
        const rarityMultiplier = {
            common: 1,
            uncommon: 1.2,
            rare: 1.5,
            epic: 2,
            legendary: 3,
            mythic: 5,
            divine: 10
        };
        
        return baseTime * (rarityMultiplier[dna.special.rarity] || 1);
    }
    
    calculateRarity(dna) {
        let score = 0;
        const rareTraits = [];
        
        // Check for rare trait combinations
        if (dna.special.rarity === 'divine') { score += 100; rareTraits.push('Divine Origin'); }
        if (dna.special.rarity === 'mythic') { score += 80; rareTraits.push('Mythical Being'); }
        if (dna.special.rarity === 'legendary') { score += 60; rareTraits.push('Legendary'); }
        if (dna.special.aura !== 'none') { score += 15; rareTraits.push(`Aura: ${dna.special.aura}`); }
        if (dna.special.wings !== 'none') { score += 10; rareTraits.push('Winged'); }
        if (dna.appearance.glowIntensity >= 4) { score += 10; rareTraits.push('Radiant Glow'); }
        if (dna.face.hornCount >= 3) { score += 5; rareTraits.push('Multi-Horned'); }
        
        // Determine tier
        let tier = 'common';
        if (score >= 100) tier = 'divine';
        else if (score >= 80) tier = 'mythic';
        else if (score >= 60) tier = 'legendary';
        else if (score >= 40) tier = 'epic';
        else if (score >= 25) tier = 'rare';
        else if (score >= 15) tier = 'uncommon';
        
        return { score, tier, rareTraits };
    }
    
    generateAppearance(dna) {
        // Generate visual description based on DNA
        const parts = [];
        
        // Body description
        parts.push(`${dna.appearance.colorPrimary} ${dna.appearance.skinTexture} body`);
        
        // Face
        if (dna.face.hornCount > 0) {
            parts.push(`${dna.face.hornCount} ${dna.face.hornShape} horns`);
        }
        parts.push(`${dna.face.eyeColor} ${dna.face.eyeShape} eyes`);
        
        // Special features
        if (dna.special.wings !== 'none') {
            parts.push(`${dna.special.wings} wings`);
        }
        if (dna.special.tail !== 'none') {
            parts.push(`${dna.special.tail} tail`);
        }
        if (dna.special.aura !== 'none') {
            parts.push(`${dna.special.aura} aura`);
        }
        
        return {
            description: parts.join(', '),
            emoji: this.getCreatureEmoji(dna),
            colorHex: this.getColorHex(dna.appearance.colorPrimary)
        };
    }
    
    getCreatureEmoji(dna) {
        const elementEmojis = {
            fire: '🔥', water: '💧', earth: '🌍', air: '💨',
            light: '✨', dark: '🌑', chaos: '⚡', neutral: '⚪'
        };
        
        const bodyEmojis = {
            slim: '🦎', athletic: '🐆', chubby: '🐼', muscular: '🦍',
            tiny: '🐭', giant: '🐋'
        };
        
        return elementEmojis[dna.special.element] + bodyEmojis[dna.appearance.bodyType];
    }
    
    getColorHex(color) {
        const colors = {
            red: '#FF4444', blue: '#4444FF', green: '#44FF44',
            gold: '#FFD700', purple: '#9B59B6', cyan: '#00FFFF',
            rainbow: 'linear-gradient(90deg, red, orange, yellow, green, blue, purple)',
            void: '#000000'
        };
        return colors[color] || '#888888';
    }
    
    // Interact with pet (bonding)
    async interact(petId, ownerId, activity, duration = 60) {
        const pet = this.pets.get(petId);
        if (!pet) throw new Error('Pet not found');
        if (pet.ownerId !== ownerId) throw new Error('Not your pet');
        
        const results = {
            activity,
            bondIncrease: 0,
            xpGained: 0,
            happinessChange: 0,
            energyChange: 0,
            hungerChange: 0,
            trickLearned: null,
            messages: []
        };
        
        switch (activity) {
            case 'feeding':
                results.hungerChange = -30;
                results.happinessChange = 5;
                results.bondIncrease = 2;
                results.messages.push(`${pet.name} enjoyed their meal!`);
                break;
                
            case 'petting':
                results.happinessChange = 10;
                results.bondIncrease = 5;
                results.energyChange = 5;
                results.messages.push(`${pet.name} purrs contentedly!`);
                break;
                
            case 'playing':
                results.happinessChange = 15;
                results.energyChange = -20;
                results.hungerChange = 10;
                results.bondIncrease = 8;
                results.xpGained = 10;
                results.messages.push(`${pet.name} had so much fun playing!`);
                break;
                
            case 'training':
                results.energyChange = -30;
                results.hungerChange = 15;
                results.bondIncrease = 10;
                results.xpGained = 25;
                
                // Chance to learn new trick
                if (Math.random() < 0.3) {
                    results.trickLearned = this.teachRandomTrick(pet);
                    results.messages.push(`${pet.name} learned ${results.trickLearned}!`);
                } else {
                    results.messages.push(`${pet.name} is practicing hard!`);
                }
                break;
                
            case 'exploring':
                results.energyChange = -25;
                results.hungerChange = 20;
                results.bondIncrease = 7;
                results.xpGained = 30;
                results.messages.push(`${pet.name} discovered something interesting!`);
                break;
                
            case 'battling':
                results.energyChange = -40;
                results.hungerChange = 25;
                results.bondIncrease = 5;
                results.xpGained = 50;
                results.messages.push(`${pet.name} gained battle experience!`);
                break;
                
            case 'resting':
                results.energyChange = 50;
                results.happinessChange = -5;
                results.messages.push(`${pet.name} is well-rested!`);
                break;
        }
        
        // Apply changes
        pet.stats.energy = Math.max(0, Math.min(100, pet.stats.energy + results.energyChange));
        pet.stats.happiness = Math.max(0, Math.min(100, pet.stats.happiness + results.happinessChange));
        pet.stats.hunger = Math.max(0, Math.min(100, pet.stats.hunger + results.hungerChange));
        pet.stats.bondLevel += results.bondIncrease;
        pet.stats.xp += results.xpGained;
        
        // Check for level up
        if (pet.stats.xp >= this.getXpForLevel(pet.stats.level + 1)) {
            await this.levelUp(pet);
        }
        
        pet.lastInteracted = new Date().toISOString();
        
        return results;
    }
    
    teachRandomTrick(pet) {
        const tricks = [
            'sit', 'stay', 'roll', 'jump', 'spin', 'dance',
            'sing', 'fetch', 'hide', 'speak', 'wave', 'bow',
            'backflip', 'glitter_burst', 'elemental_blast'
        ];
        
        const availableTricks = tricks.filter(t => !pet.learnedTricks.includes(t));
        if (availableTricks.length === 0) return null;
        
        const trick = availableTricks[Math.floor(Math.random() * availableTricks.length)];
        pet.learnedTricks.push(trick);
        
        return trick;
    }
    
    getXpForLevel(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }
    
    async levelUp(pet) {
        pet.stats.level += 1;
        pet.stats.health += 10;
        
        // Check for evolution
        const nextStage = this.getNextEvolutionStage(pet.stage);
        if (nextStage && pet.stats.xp >= this.evolutionStages[nextStage].xpNeeded) {
            await this.evolve(pet, nextStage);
        }
        
        return {
            newLevel: pet.stats.level,
            newStage: pet.stage,
            statsIncreased: { health: 10 }
        };
    }
    
    getNextEvolutionStage(currentStage) {
        const stages = Object.keys(this.evolutionStages);
        const currentIndex = stages.indexOf(currentStage);
        return stages[currentIndex + 1] || null;
    }
    
    async evolve(pet, newStage) {
        const oldStage = pet.stage;
        pet.stage = newStage;
        
        // Boost stats on evolution
        pet.stats.health *= 1.5;
        pet.stats.energy = 100;
        
        // Enable breeding at adult stage
        if (newStage === 'ADULT') {
            pet.breeding.canBreed = true;
        }
        
        return {
            petId: pet.id,
            oldStage,
            newStage,
            message: `${pet.name} has evolved from ${oldStage} to ${newStage}!`
        };
    }
    
    // Breeding system
    async breedPets(ownerId, pet1Id, pet2Id) {
        const pet1 = this.pets.get(pet1Id);
        const pet2 = this.pets.get(pet2Id);
        
        if (!pet1 || !pet2) throw new Error('One or both pets not found');
        if (pet1.ownerId !== ownerId || pet2.ownerId !== ownerId) {
            throw new Error('Both pets must be yours to breed');
        }
        if (!pet1.breeding.canBreed || !pet2.breeding.canBreed) {
            throw new Error('Both pets must be adults to breed');
        }
        if (pet1.breeding.cooldown > 0 || pet2.breeding.cooldown > 0) {
            throw new Error('One or both pets are on breeding cooldown');
        }
        
        // Create egg
        const egg = await this.createEgg({
            ownerId,
            name: `${pet1.name} × ${pet2.name} Offspring`,
            parent1: pet1,
            parent2: pet2
        });
        
        // Apply cooldowns
        pet1.breeding.breedCount += 1;
        pet1.breeding.lastBred = new Date().toISOString();
        pet1.breeding.cooldown = 86400;
        
        pet2.breeding.breedCount += 1;
        pet2.breeding.lastBred = new Date().toISOString();
        pet2.breeding.cooldown = 86400;
        
        return {
            success: true,
            eggId: egg.eggId,
            parents: [pet1.id, pet2.id],
            message: `${pet1.name} and ${pet2.name} have produced an egg!`
        };
    }
    
    // Get pet info
    getPet(petId) {
        const pet = this.pets.get(petId);
        if (!pet) return null;
        
        return {
            id: pet.id,
            name: pet.name,
            rarity: pet.rarity,
            stage: pet.stage,
            element: pet.dna.special.element,
            appearance: pet.appearance,
            stats: pet.stats,
            tricks: pet.learnedTricks,
            breeding: pet.breeding,
            battles: pet.battles,
            createdAt: pet.createdAt
        };
    }
    
    // Get owner's pets
    getOwnerPets(ownerId) {
        return Array.from(this.pets.values())
            .filter(p => p.ownerId === ownerId)
            .map(p => this.getPet(p.id));
    }
    
    // Get all pets for marketplace
    getMarketplacePets(filters = {}) {
        let pets = Array.from(this.pets.values());
        
        if (filters.rarity) {
            pets = pets.filter(p => p.rarity.tier === filters.rarity);
        }
        if (filters.element) {
            pets = pets.filter(p => p.dna.special.element === filters.element);
        }
        if (filters.stage) {
            pets = pets.filter(p => p.stage === filters.stage);
        }
        if (filters.minLevel) {
            pets = pets.filter(p => p.stats.level >= filters.minLevel);
        }
        
        return pets.map(p => this.getPet(p.id));
    }
}

module.exports = VirtualPetSystem;
