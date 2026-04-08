/**
 * DNA-Based Combat System
 * JamZia AR InterActive Entertainment™ - RiverShyre™
 * Ad9x Holdings, LLC
 * 
 * Real-time combat with strategic team building
 * Inspired by Monster Hunter Stories - action-oriented battles
 */

const crypto = require('crypto');

class DNACombatSystem {
    constructor() {
        this.name = 'RiverShyre Combat';
        this.version = '1.0.0';
        
        // Element effectiveness chart
        this.elementChart = {
            fire: { strong: ['nature', 'ice'], weak: ['water', 'earth'] },
            water: { strong: ['fire', 'earth'], weak: ['electric', 'nature'] },
            earth: { strong: ['electric', 'fire'], weak: ['water', 'nature'] },
            air: { strong: ['earth', 'poison'], weak: ['electric', 'ice'] },
            electric: { strong: ['water', 'air'], weak: ['earth', 'nature'] },
            nature: { strong: ['water', 'earth'], weak: ['fire', 'ice'] },
            ice: { strong: ['nature', 'air'], weak: ['fire', 'earth'] },
            light: { strong: ['dark', 'shadow'], weak: ['void', 'chaos'] },
            dark: { strong: ['light', 'psychic'], weak: ['light', 'holy'] },
            neutral: { strong: [], weak: [] }
        };
        
        // Combat moves
        this.moveTypes = {
            // Basic attacks
            SCRATCH: { name: 'Scratch', power: 40, accuracy: 100, type: 'physical', element: 'neutral' },
            BITE: { name: 'Bite', power: 60, accuracy: 95, type: 'physical', element: 'neutral' },
            TACKLE: { name: 'Tackle', power: 50, accuracy: 100, type: 'physical', element: 'neutral' },
            
            // Elemental attacks
            EMBER: { name: 'Ember', power: 40, accuracy: 100, type: 'special', element: 'fire' },
            FLAMETHROWER: { name: 'Flamethrower', power: 90, accuracy: 95, type: 'special', element: 'fire' },
            WATER_GUN: { name: 'Water Gun', power: 40, accuracy: 100, type: 'special', element: 'water' },
            HYDRO_PUMP: { name: 'Hydro Pump', power: 110, accuracy: 80, type: 'special', element: 'water' },
            VINE_WHIP: { name: 'Vine Whip', power: 45, accuracy: 100, type: 'physical', element: 'nature' },
            SOLAR_BEAM: { name: 'Solar Beam', power: 120, accuracy: 85, type: 'special', element: 'nature' },
            THUNDER_SHOCK: { name: 'Thunder Shock', power: 40, accuracy: 100, type: 'special', element: 'electric' },
            THUNDERBOLT: { name: 'Thunderbolt', power: 90, accuracy: 95, type: 'special', element: 'electric' },
            ROCK_THROW: { name: 'Rock Throw', power: 50, accuracy: 90, type: 'physical', element: 'earth' },
            EARTHQUAKE: { name: 'Earthquake', power: 100, accuracy: 100, type: 'physical', element: 'earth' },
            GUST: { name: 'Gust', power: 40, accuracy: 100, type: 'special', element: 'air' },
            HURRICANE: { name: 'Hurricane', power: 110, accuracy: 70, type: 'special', element: 'air' },
            ICE_SHARD: { name: 'Ice Shard', power: 40, accuracy: 100, type: 'physical', element: 'ice' },
            BLIZZARD: { name: 'Blizzard', power: 110, accuracy: 70, type: 'special', element: 'ice' },
            
            // Status moves
            GROWL: { name: 'Growl', power: 0, accuracy: 100, type: 'status', effect: 'lower_attack' },
            DEFENSE_CURL: { name: 'Defense Curl', power: 0, accuracy: 100, type: 'status', effect: 'raise_defense' },
            HEAL: { name: 'Heal', power: 0, accuracy: 100, type: 'status', effect: 'heal', healAmount: 50 },
            PROTECT: { name: 'Protect', power: 0, accuracy: 100, type: 'status', effect: 'protect' },
            
            // Ultimate moves
            INFERNO: { name: 'Inferno', power: 150, accuracy: 85, type: 'special', element: 'fire', cooldown: 3 },
            TSUNAMI: { name: 'Tsunami', power: 150, accuracy: 85, type: 'special', element: 'water', cooldown: 3 },
            METEOR: { name: 'Meteor', power: 150, accuracy: 85, type: 'physical', element: 'earth', cooldown: 3 },
            DIVINE_LIGHT: { name: 'Divine Light', power: 150, accuracy: 90, type: 'special', element: 'light', cooldown: 3 }
        };
        
        // Battle types
        this.battleTypes = {
            WILD: { name: 'Wild Encounter', xpMultiplier: 1, rewardMultiplier: 1 },
            TRAINER: { name: 'Trainer Battle', xpMultiplier: 1.5, rewardMultiplier: 1.5 },
            GYM: { name: 'Gym Battle', xpMultiplier: 2, rewardMultiplier: 2 },
            RAID: { name: 'Raid Battle', xpMultiplier: 3, rewardMultiplier: 3 },
            BOSS: { name: 'Boss Battle', xpMultiplier: 5, rewardMultiplier: 5 },
            PVP: { name: 'PvP Battle', xpMultiplier: 1, rewardMultiplier: 1 }
        };
        
        // Active battles
        this.battles = new Map();
        this.battleHistory = new Map();
    }
    
    // Create a battle
    async createBattle(config) {
        const battleId = crypto.randomUUID();
        
        const battle = {
            id: battleId,
            type: config.type || 'WILD',
            player1: {
                id: config.player1Id,
                team: config.player1Team || [],
                activeCreature: null,
                creaturesDefeated: 0
            },
            player2: {
                id: config.player2Id,
                team: config.player2Team || [],
                activeCreature: null,
                creaturesDefeated: 0
            },
            turn: 1,
            status: 'waiting',
            weather: config.weather || 'clear',
            terrain: config.terrain || 'normal',
            rewards: {
                xp: 0,
                skyivy: 0,
                skylockr: 0,
                items: []
            },
            log: [],
            createdAt: new Date().toISOString(),
            startedAt: null,
            endedAt: null
        };
        
        // Set active creatures
        if (battle.player1.team.length > 0) {
            battle.player1.activeCreature = battle.player1.team[0];
        }
        if (battle.player2.team.length > 0) {
            battle.player2.activeCreature = battle.player2.team[0];
        }
        
        this.battles.set(battleId, battle);
        
        return {
            battleId,
            type: battle.type,
            status: battle.status,
            message: 'Battle created! Waiting for opponent...'
        };
    }
    
    // Start battle
    async startBattle(battleId) {
        const battle = this.battles.get(battleId);
        if (!battle) throw new Error('Battle not found');
        
        battle.status = 'active';
        battle.startedAt = new Date().toISOString();
        
        // Add initial log entry
        this.addToLog(battle, `Battle started! ${battle.player1.id} vs ${battle.player2.id}`);
        
        return {
            battleId,
            status: 'active',
            turn: battle.turn,
            player1Creature: this.getCreatureBattleStats(battle.player1.activeCreature),
            player2Creature: this.getCreatureBattleStats(battle.player2.activeCreature)
        };
    }
    
    // Execute a move
    async executeMove(battleId, playerId, moveName, target = null) {
        const battle = this.battles.get(battleId);
        if (!battle) throw new Error('Battle not found');
        if (battle.status !== 'active') throw new Error('Battle not active');
        
        const player = battle.player1.id === playerId ? battle.player1 : battle.player2;
        const opponent = battle.player1.id === playerId ? battle.player2 : battle.player1;
        
        if (!player.activeCreature) {
            throw new Error('No active creature');
        }
        
        const move = this.moveTypes[moveName];
        if (!move) throw new Error('Invalid move');
        
        // Check if creature knows this move
        if (!player.activeCreature.moves.includes(moveName)) {
            throw new Error('Creature does not know this move');
        }
        
        const attacker = player.activeCreature;
        const defender = target || opponent.activeCreature;
        
        const result = {
            turn: battle.turn,
            attacker: attacker.name,
            move: move.name,
            damage: 0,
            effectiveness: 'normal',
            critical: false,
            missed: false,
            defenderFainted: false,
            log: []
        };
        
        // Check accuracy
        if (Math.random() * 100 > move.accuracy) {
            result.missed = true;
            result.log.push(`${attacker.name} used ${move.name} but missed!`);
            this.addToLog(battle, result.log[0]);
            battle.turn++;
            return result;
        }
        
        // Handle status moves
        if (move.type === 'status') {
            await this.applyStatusEffect(attacker, move, result);
            battle.turn++;
            return result;
        }
        
        // Calculate damage
        const damage = this.calculateDamage(attacker, defender, move, battle);
        result.damage = damage;
        
        // Check critical hit
        const critChance = 0.0625; // 6.25% base
        result.critical = Math.random() < critChance;
        if (result.critical) {
            result.damage = Math.floor(result.damage * 1.5);
        }
        
        // Apply damage
        defender.currentHealth = Math.max(0, defender.currentHealth - result.damage);
        
        // Check effectiveness
        const effectiveness = this.getEffectiveness(move.element, defender.dna?.special?.element || 'neutral');
        result.effectiveness = effectiveness;
        
        // Build result log
        let logMessage = `${attacker.name} used ${move.name}!`;
        if (result.critical) logMessage += ' Critical hit!';
        if (effectiveness === 'super') logMessage += " It's super effective!";
        if (effectiveness === 'not-very') logMessage += " It's not very effective...";
        logMessage += ` Dealt ${result.damage} damage!`;
        
        result.log.push(logMessage);
        this.addToLog(battle, logMessage);
        
        // Check if defender fainted
        if (defender.currentHealth <= 0) {
            result.defenderFainted = true;
            result.log.push(`${defender.name} fainted!`);
            this.addToLog(battle, `${defender.name} fainted!`);
            
            opponent.creaturesDefeated++;
            
            // Award XP and rewards
            await this.awardBattleRewards(battle, player, attacker, defender);
            
            // Check win condition
            const winResult = await this.checkWinCondition(battle);
            if (winResult) {
                return { ...result, ...winResult };
            }
            
            // Switch to next creature
            await this.switchToNextCreature(opponent);
        }
        
        battle.turn++;
        
        return result;
    }
    
    calculateDamage(attacker, defender, move, battle) {
        // Base damage formula
        const level = attacker.stats?.level || 10;
        const power = move.power;
        
        const attackStat = move.type === 'physical' 
            ? (attacker.stats?.attack || 50)
            : (attacker.stats?.specialAttack || 50);
        
        const defenseStat = move.type === 'physical'
            ? (defender.stats?.defense || 50)
            : (defender.stats?.specialDefense || 50);
        
        // Base damage calculation
        let damage = Math.floor(
            ((2 * level / 5 + 2) * power * (attackStat / defenseStat)) / 50 + 2
        );
        
        // Apply STAB (Same Type Attack Bonus)
        if (move.element === attacker.dna?.special?.element) {
            damage = Math.floor(damage * 1.5);
        }
        
        // Apply effectiveness
        const effectiveness = this.getEffectivenessMultiplier(move.element, defender.dna?.special?.element || 'neutral');
        damage = Math.floor(damage * effectiveness);
        
        // Apply weather effects
        if (battle.weather === 'rain' && move.element === 'water') damage = Math.floor(damage * 1.5);
        if (battle.weather === 'rain' && move.element === 'fire') damage = Math.floor(damage * 0.5);
        if (battle.weather === 'sun' && move.element === 'fire') damage = Math.floor(damage * 1.5);
        if (battle.weather === 'sun' && move.element === 'water') damage = Math.floor(damage * 0.5);
        
        // Random factor (85-100%)
        const randomFactor = 0.85 + Math.random() * 0.15;
        damage = Math.floor(damage * randomFactor);
        
        return Math.max(1, damage);
    }
    
    getEffectivenessMultiplier(attackerElement, defenderElement) {
        const chart = this.elementChart[attackerElement];
        if (!chart) return 1;
        
        if (chart.strong.includes(defenderElement)) return 2;
        if (chart.weak.includes(defenderElement)) return 0.5;
        return 1;
    }
    
    getEffectiveness(attackerElement, defenderElement) {
        const multiplier = this.getEffectivenessMultiplier(attackerElement, defenderElement);
        if (multiplier >= 2) return 'super';
        if (multiplier <= 0.5) return 'not-very';
        return 'normal';
    }
    
    async applyStatusEffect(creature, move, result) {
        switch (move.effect) {
            case 'lower_attack':
                creature.stats.attack = Math.floor(creature.stats.attack * 0.9);
                result.log.push(`${creature.name}'s attack fell!`);
                break;
            case 'raise_defense':
                creature.stats.defense = Math.floor(creature.stats.defense * 1.1);
                result.log.push(`${creature.name}'s defense rose!`);
                break;
            case 'heal':
                const healAmount = Math.min(move.healAmount, creature.maxHealth - creature.currentHealth);
                creature.currentHealth += healAmount;
                result.log.push(`${creature.name} recovered ${healAmount} HP!`);
                break;
            case 'protect':
                creature.protected = true;
                result.log.push(`${creature.name} is protecting itself!`);
                break;
        }
    }
    
    async awardBattleRewards(battle, winner, winningCreature, defeatedCreature) {
        const battleType = this.battleTypes[battle.type];
        
        // Calculate XP
        const baseXp = defeatedCreature.stats?.level * 10 || 50;
        const xpGained = Math.floor(baseXp * battleType.xpMultiplier);
        
        winningCreature.stats.xp = (winningCreature.stats.xp || 0) + xpGained;
        
        // Calculate token rewards
        const rarityMultiplier = {
            common: 1, uncommon: 1.5, rare: 2.5, epic: 4, legendary: 8, mythic: 15
        };
        const multiplier = rarityMultiplier[defeatedCreature.rarity?.tier || 'common'];
        
        battle.rewards.xp += xpGained;
        battle.rewards.skyivy += Math.floor(10 * multiplier * battleType.rewardMultiplier);
        battle.rewards.skylockr += Math.floor(25 * multiplier * battleType.rewardMultiplier);
    }
    
    async checkWinCondition(battle) {
        const player1Defeated = battle.player1.team.every(c => c.currentHealth <= 0);
        const player2Defeated = battle.player2.team.every(c => c.currentHealth <= 0);
        
        if (player1Defeated || player2Defeated) {
            const winner = player1Defeated ? battle.player2 : battle.player1;
            const loser = player1Defeated ? battle.player1 : battle.player2;
            
            battle.status = 'finished';
            battle.endedAt = new Date().toISOString();
            battle.winner = winner.id;
            
            // Bonus rewards for winner
            battle.rewards.skyivy += 100;
            battle.rewards.skylockr += 250;
            
            this.addToLog(battle, `${winner.id} wins the battle!`);
            
            return {
                battleEnded: true,
                winner: winner.id,
                rewards: battle.rewards,
                log: battle.log
            };
        }
        
        return null;
    }
    
    async switchToNextCreature(player) {
        const nextCreature = player.team.find(c => c.currentHealth > 0);
        if (nextCreature) {
            player.activeCreature = nextCreature;
        }
    }
    
    // Switch active creature
    async switchCreature(battleId, playerId, creatureIndex) {
        const battle = this.battles.get(battleId);
        if (!battle) throw new Error('Battle not found');
        
        const player = battle.player1.id === playerId ? battle.player1 : battle.player2;
        const newCreature = player.team[creatureIndex];
        
        if (!newCreature) throw new Error('Invalid creature index');
        if (newCreature.currentHealth <= 0) throw new Error('Cannot switch to fainted creature');
        
        const oldCreature = player.activeCreature;
        player.activeCreature = newCreature;
        
        const message = `${player.id} switched from ${oldCreature.name} to ${newCreature.name}!`;
        this.addToLog(battle, message);
        
        battle.turn++;
        
        return {
            switched: true,
            from: oldCreature.name,
            to: newCreature.name,
            message
        };
    }
    
    // Use item in battle
    async useItem(battleId, playerId, itemType) {
        const battle = this.battles.get(battleId);
        if (!battle) throw new Error('Battle not found');
        
        const player = battle.player1.id === playerId ? battle.player1 : battle.player2;
        
        const items = {
            POTION: { heal: 50, message: 'used a Potion' },
            SUPER_POTION: { heal: 100, message: 'used a Super Potion' },
            REVIVE: { revive: true, heal: 0.5, message: 'used a Revive' },
            ELIXIR: { heal: 999, message: 'used an Elixir' }
        };
        
        const item = items[itemType];
        if (!item) throw new Error('Invalid item');
        
        if (item.revive) {
            const faintedCreature = player.team.find(c => c.currentHealth <= 0);
            if (faintedCreature) {
                faintedCreature.currentHealth = Math.floor(faintedCreature.maxHealth * item.heal);
                this.addToLog(battle, `${player.id} ${item.message} on ${faintedCreature.name}!`);
            }
        } else {
            const creature = player.activeCreature;
            const healAmount = Math.min(item.heal, creature.maxHealth - creature.currentHealth);
            creature.currentHealth += healAmount;
            this.addToLog(battle, `${player.id} ${item.message}! ${creature.name} recovered ${healAmount} HP!`);
        }
        
        battle.turn++;
        
        return { itemUsed: true, itemType };
    }
    
    // Forfeit battle
    async forfeit(battleId, playerId) {
        const battle = this.battles.get(battleId);
        if (!battle) throw new Error('Battle not found');
        
        battle.status = 'forfeited';
        battle.endedAt = new Date().toISOString();
        battle.winner = battle.player1.id === playerId ? battle.player2.id : battle.player1.id;
        
        this.addToLog(battle, `${playerId} forfeited the battle!`);
        
        return {
            forfeited: true,
            winner: battle.winner
        };
    }
    
    // Get battle state
    getBattleState(battleId) {
        const battle = this.battles.get(battleId);
        if (!battle) return null;
        
        return {
            id: battle.id,
            type: battle.type,
            status: battle.status,
            turn: battle.turn,
            weather: battle.weather,
            terrain: battle.terrain,
            player1: {
                id: battle.player1.id,
                activeCreature: this.getCreatureBattleStats(battle.player1.activeCreature),
                teamSize: battle.player1.team.length,
                creaturesDefeated: battle.player1.creaturesDefeated
            },
            player2: {
                id: battle.player2.id,
                activeCreature: this.getCreatureBattleStats(battle.player2.activeCreature),
                teamSize: battle.player2.team.length,
                creaturesDefeated: battle.player2.creaturesDefeated
            },
            log: battle.log.slice(-10),
            rewards: battle.status === 'finished' ? battle.rewards : null
        };
    }
    
    getCreatureBattleStats(creature) {
        if (!creature) return null;
        
        return {
            id: creature.id,
            name: creature.name,
            element: creature.dna?.special?.element || 'neutral',
            rarity: creature.rarity?.tier || 'common',
            emoji: creature.appearance?.emoji || '❓',
            level: creature.stats?.level || 1,
            health: creature.currentHealth || creature.stats?.health || 100,
            maxHealth: creature.maxHealth || creature.stats?.health || 100,
            moves: creature.moves || ['SCRATCH', 'TACKLE']
        };
    }
    
    addToLog(battle, message) {
        battle.log.push({
            turn: battle.turn,
            message,
            timestamp: new Date().toISOString()
        });
    }
    
    // Get battle history for player
    getBattleHistory(playerId) {
        const history = this.battleHistory.get(playerId) || [];
        return history.slice(-20).reverse();
    }
}

module.exports = DNACombatSystem;
