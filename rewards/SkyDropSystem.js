/**
 * SkyDrop Reward System
 * JamZia AR InterActive Entertainment™ - RiverShyre™
 * Ad9x Holdings, LLC
 * 
 * Money falls from the sky when wins/rewards are generated
 * Real crypto rewards: SkyIvyCoin, SkyLockrCoin, Bitcoin
 */

const crypto = require('crypto');

class SkyDropSystem {
    constructor() {
        this.name = 'SkyDrop Rewards';
        this.version = '1.0.0';
        
        // Reward types that trigger SkyDrops
        this.rewardTriggers = {
            BATTLE_WIN: { name: 'Battle Victory', baseMultiplier: 1 },
            BATTLE_PERFECT: { name: 'Perfect Battle', baseMultiplier: 2 },
            CAPTURE_RARE: { name: 'Rare Capture', baseMultiplier: 1.5 },
            CAPTURE_LEGENDARY: { name: 'Legendary Capture', baseMultiplier: 5 },
            LEVEL_UP: { name: 'Level Up', baseMultiplier: 0.5 },
            EVOLUTION: { name: 'Evolution', baseMultiplier: 2 },
            BREED_SUCCESS: { name: 'Successful Breed', baseMultiplier: 1.5 },
            DAILY_STREAK: { name: 'Daily Streak', baseMultiplier: 1 + (streak * 0.1) },
            ACHIEVEMENT: { name: 'Achievement Unlocked', baseMultiplier: 3 },
            BOSS_DEFEAT: { name: 'Boss Defeated', baseMultiplier: 10 },
            RAID_COMPLETE: { name: 'Raid Completed', baseMultiplier: 8 },
            TRIVIA_CORRECT: { name: 'Trivia Correct', baseMultiplier: 0.3 },
            CRAFT_MASTERPIECE: { name: 'Masterpiece Crafted', baseMultiplier: 4 },
            EXPLORATION_MILESTONE: { name: 'Exploration Milestone', baseMultiplier: 2 }
        };
        
        // Token reward pools
        this.tokenPools = {
            SKYIVY: {
                symbol: 'SKYIVY',
                name: 'SkyIvy Coin',
                decimals: 6,
                minDrop: 1,
                maxDrop: 1000,
                dailyPool: 100000, // Daily distribution limit
                distributed: 0
            },
            SKYLOCKR: {
                symbol: 'SKYLOCKR',
                name: 'SkyLockr Coin',
                decimals: 6,
                minDrop: 5,
                maxDrop: 5000,
                dailyPool: 500000,
                distributed: 0
            },
            BTC: {
                symbol: 'BTC',
                name: 'Bitcoin',
                decimals: 8,
                minDrop: 0.000001, // 100 sats
                maxDrop: 0.001,
                dailyPool: 0.1,
                distributed: 0
            },
            XRP: {
                symbol: 'XRP',
                name: 'XRP',
                decimals: 6,
                minDrop: 0.1,
                maxDrop: 100,
                dailyPool: 10000,
                distributed: 0
            }
        };
        
        // Drop animations
        this.dropAnimations = {
            COIN_SHOWER: { name: 'Coin Shower', particles: 50, duration: 3000 },
            GOLDEN_RAIN: { name: 'Golden Rain', particles: 100, duration: 5000 },
            TREASURE_CHEST: { name: 'Treasure Chest', particles: 1, duration: 2000 },
            JACKPOT: { name: 'Jackpot!', particles: 200, duration: 8000 },
            LEGENDARY_DROP: { name: 'Legendary Drop', particles: 500, duration: 10000 }
        };
        
        // Player reward history
        this.playerRewards = new Map();
        this.pendingDrops = new Map();
        this.claimedDrops = new Map();
        
        // Jackpot system
        this.jackpot = {
            amount: 0,
            lastWinner: null,
            contributions: new Map()
        };
    }
    
    // Trigger a SkyDrop
    async triggerSkyDrop(playerId, triggerType, context = {}) {
        const trigger = this.rewardTriggers[triggerType];
        if (!trigger) throw new Error('Invalid reward trigger');
        
        const dropId = crypto.randomUUID();
        
        // Calculate reward amounts
        const rewards = this.calculateRewards(trigger, context);
        
        // Determine animation based on reward value
        const animation = this.selectAnimation(rewards);
        
        // Create drop
        const drop = {
            id: dropId,
            playerId,
            triggerType,
            triggerName: trigger.name,
            rewards,
            animation,
            location: context.location || null,
            arPosition: this.generateARPosition(),
            expiresAt: new Date(Date.now() + 300000).toISOString(), // 5 min to claim
            claimed: false,
            createdAt: new Date().toISOString()
        };
        
        this.pendingDrops.set(dropId, drop);
        
        // Add to player's reward history
        this.addToPlayerHistory(playerId, drop);
        
        // Update token pools
        for (const [token, amount] of Object.entries(rewards)) {
            if (this.tokenPools[token]) {
                this.tokenPools[token].distributed += amount;
            }
        }
        
        // Check for jackpot trigger
        if (this.shouldTriggerJackpot(triggerType, rewards)) {
            await this.triggerJackpot(playerId);
        }
        
        return {
            dropId,
            trigger: trigger.name,
            rewards,
            animation: animation.name,
            arPosition: drop.arPosition,
            message: this.generateDropMessage(trigger, rewards),
            expiresIn: 300 // seconds
        };
    }
    
    calculateRewards(trigger, context) {
        const rewards = {};
        const multiplier = context.multiplier || trigger.baseMultiplier;
        
        // Calculate based on trigger type and context
        for (const [token, pool] of Object.entries(this.tokenPools)) {
            // Check if pool has remaining daily allocation
            if (pool.distributed >= pool.dailyPool) continue;
            
            let amount = 0;
            
            // Base amount with randomness
            const baseAmount = pool.minDrop + Math.random() * (pool.maxDrop - pool.minDrop);
            
            // Apply multiplier
            amount = baseAmount * multiplier;
            
            // Apply rarity bonus from context
            if (context.rarity) {
                const rarityBonus = {
                    common: 1, uncommon: 1.5, rare: 2.5,
                    epic: 5, legendary: 10, mythic: 25, divine: 50
                };
                amount *= (rarityBonus[context.rarity] || 1);
            }
            
            // Apply level bonus
            if (context.level) {
                amount *= (1 + (context.level * 0.05));
            }
            
            // Don't exceed pool limits
            const remaining = pool.dailyPool - pool.distributed;
            amount = Math.min(amount, remaining);
            
            // Round to appropriate decimals
            amount = Math.floor(amount * Math.pow(10, pool.decimals)) / Math.pow(10, pool.decimals);
            
            if (amount > 0) {
                rewards[token] = amount;
            }
        }
        
        return rewards;
    }
    
    selectAnimation(rewards) {
        const totalValue = Object.values(rewards).reduce((sum, val) => sum + val, 0);
        
        // Value thresholds for animations
        if (totalValue >= 1000) return this.dropAnimations.LEGENDARY_DROP;
        if (totalValue >= 500) return this.dropAnimations.JACKPOT;
        if (totalValue >= 100) return this.dropAnimations.TREASURE_CHEST;
        if (totalValue >= 50) return this.dropAnimations.GOLDEN_RAIN;
        return this.dropAnimations.COIN_SHOWER;
    }
    
    generateARPosition() {
        // Generate random position in AR space above player
        return {
            x: (Math.random() - 0.5) * 10, // -5 to 5 meters
            y: 2 + Math.random() * 3,      // 2-5 meters height
            z: -2 - Math.random() * 5,     // 2-7 meters in front
            rotation: Math.random() * 360
        };
    }
    
    generateDropMessage(trigger, rewards) {
        const messages = {
            BATTLE_WIN: 'Victory! Coins rain from the sky!',
            BATTLE_PERFECT: 'Perfect victory! A shower of treasure!',
            CAPTURE_RARE: 'Rare find! The sky rewards you!',
            CAPTURE_LEGENDARY: 'LEGENDARY! The heavens open!',
            LEVEL_UP: 'Level up! Rewards descend!',
            EVOLUTION: 'Evolution complete! Golden rain!',
            BREED_SUCCESS: 'New life! The sky celebrates!',
            BOSS_DEFEAT: 'BOSS DEFEATED! JACKPOT!',
            RAID_COMPLETE: 'Raid victory! Massive rewards!'
        };
        
        return messages[trigger.name] || 'Rewards from the sky!';
    }
    
    // Claim a SkyDrop
    async claimSkyDrop(playerId, dropId, walletAddress) {
        const drop = this.pendingDrops.get(dropId);
        if (!drop) throw new Error('Drop not found or expired');
        if (drop.playerId !== playerId) throw new Error('Not your drop');
        if (drop.claimed) throw new Error('Drop already claimed');
        if (new Date() > new Date(drop.expiresAt)) {
            this.pendingDrops.delete(dropId);
            throw new Error('Drop expired');
        }
        
        drop.claimed = true;
        drop.claimedAt = new Date().toISOString();
        drop.walletAddress = walletAddress;
        
        // Move to claimed
        this.claimedDrops.set(dropId, drop);
        this.pendingDrops.delete(dropId);
        
        // In production: Transfer tokens to wallet
        // await this.transferTokens(walletAddress, drop.rewards);
        
        return {
            dropId,
            claimed: true,
            rewards: drop.rewards,
            walletAddress,
            message: `Claimed ${Object.entries(drop.rewards).map(([t, a]) => `${a} ${t}`).join(', ')}!`
        };
    }
    
    // Get nearby drops for AR display
    getNearbyDrops(location, radius = 100) {
        const nearby = [];
        
        for (const [id, drop] of this.pendingDrops.entries()) {
            if (drop.claimed) continue;
            if (new Date() > new Date(drop.expiresAt)) continue;
            
            // If drop has location, check distance
            if (drop.location && location) {
                const distance = this.calculateDistance(location, drop.location);
                if (distance > radius) continue;
            }
            
            nearby.push({
                id: drop.id,
                rewards: drop.rewards,
                animation: drop.animation.name,
                arPosition: drop.arPosition,
                expiresIn: Math.floor((new Date(drop.expiresAt) - new Date()) / 1000)
            });
        }
        
        return nearby;
    }
    
    // Jackpot system
    shouldTriggerJackpot(triggerType, rewards) {
        // Small chance based on reward value
        const totalValue = Object.values(rewards).reduce((sum, val) => sum + val, 0);
        const chance = Math.min(0.01, totalValue / 10000); // Max 1% chance
        return Math.random() < chance;
    }
    
    async triggerJackpot(winnerId) {
        const jackpotAmount = this.jackpot.amount;
        
        if (jackpotAmount <= 0) return null;
        
        const jackpotDrop = {
            id: crypto.randomUUID(),
            playerId: winnerId,
            triggerType: 'JACKPOT',
            triggerName: 'JACKPOT!',
            rewards: {
                SKYIVY: jackpotAmount * 0.4,
                SKYLOCKR: jackpotAmount * 0.5,
                BTC: jackpotAmount * 0.000001
            },
            animation: this.dropAnimations.LEGENDARY_DROP,
            isJackpot: true,
            expiresAt: new Date(Date.now() + 600000).toISOString(), // 10 min
            createdAt: new Date().toISOString()
        };
        
        this.pendingDrops.set(jackpotDrop.id, jackpotDrop);
        
        // Reset jackpot
        this.jackpot.amount = 0;
        this.jackpot.lastWinner = winnerId;
        this.jackpot.contributions.clear();
        
        return {
            jackpotId: jackpotDrop.id,
            amount: jackpotAmount,
            winner: winnerId,
            message: '🎰 JACKPOT! Massive rewards falling from the sky!'
        };
    }
    
    // Contribute to jackpot
    async contributeToJackpot(playerId, amount, token) {
        if (!this.jackpot.contributions.has(playerId)) {
            this.jackpot.contributions.set(playerId, 0);
        }
        
        const current = this.jackpot.contributions.get(playerId);
        this.jackpot.contributions.set(playerId, current + amount);
        
        // Convert to SKYIVY equivalent for jackpot pool
        const conversionRates = { SKYIVY: 1, SKYLOCKR: 0.2, BTC: 50000, XRP: 0.5 };
        this.jackpot.amount += amount * (conversionRates[token] || 1);
        
        return {
            contributed: amount,
            token,
            jackpotTotal: this.jackpot.amount,
            message: `Contributed ${amount} ${token} to the jackpot!`
        };
    }
    
    // Get jackpot info
    getJackpotInfo() {
        return {
            currentAmount: this.jackpot.amount,
            lastWinner: this.jackpot.lastWinner,
            totalContributors: this.jackpot.contributions.size,
            estimatedDrop: {
                SKYIVY: this.jackpot.amount * 0.4,
                SKYLOCKR: this.jackpot.amount * 0.5,
                BTC: this.jackpot.amount * 0.000001
            }
        };
    }
    
    // Add to player history
    addToPlayerHistory(playerId, drop) {
        if (!this.playerRewards.has(playerId)) {
            this.playerRewards.set(playerId, []);
        }
        
        const history = this.playerRewards.get(playerId);
        history.push({
            dropId: drop.id,
            trigger: drop.triggerName,
            rewards: drop.rewards,
            claimed: drop.claimed,
            createdAt: drop.createdAt
        });
        
        // Keep only last 100 entries
        if (history.length > 100) {
            history.shift();
        }
    }
    
    // Get player reward stats
    getPlayerRewardStats(playerId) {
        const history = this.playerRewards.get(playerId) || [];
        
        const totals = {};
        for (const entry of history) {
            for (const [token, amount] of Object.entries(entry.rewards)) {
                totals[token] = (totals[token] || 0) + amount;
            }
        }
        
        return {
            totalDrops: history.length,
            totalClaimed: history.filter(h => h.claimed).length,
            totalByToken: totals,
            recentDrops: history.slice(-10).reverse()
        };
    }
    
    // Get daily pool status
    getPoolStatus() {
        const status = {};
        
        for (const [token, pool] of Object.entries(this.tokenPools)) {
            status[token] = {
                symbol: pool.symbol,
                dailyPool: pool.dailyPool,
                distributed: pool.distributed,
                remaining: pool.dailyPool - pool.distributed,
                percentage: ((pool.distributed / pool.dailyPool) * 100).toFixed(2) + '%'
            };
        }
        
        return status;
    }
    
    // Reset daily pools (call at midnight UTC)
    resetDailyPools() {
        for (const pool of Object.values(this.tokenPools)) {
            pool.distributed = 0;
        }
        console.log('🌅 Daily reward pools reset!');
    }
    
    calculateDistance(loc1, loc2) {
        const R = 6371e3;
        const φ1 = loc1.lat * Math.PI / 180;
        const φ2 = loc2.lat * Math.PI / 180;
        const Δφ = (loc2.lat - loc1.lat) * Math.PI / 180;
        const Δλ = (loc2.lng - loc2.lng) * Math.PI / 180;
        
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c;
    }
}

module.exports = SkyDropSystem;
