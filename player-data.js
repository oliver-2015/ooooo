// 玩家数据管理
const playerData = {
    // 从localStorage加载玩家数据
    loadData() {
        const savedData = localStorage.getItem('playerData');
        if (savedData) {
            return JSON.parse(savedData);
        }
        return this.getDefaultData();
    },

    // 获取默认玩家数据
    getDefaultData() {
        return {
            name: '玩家',
            level: 1,
            experience: 0,
            experienceToNextLevel: 100,
            stats: {
                completedChapters: 0,
                stars: 0,
                reviveTokens: 0,
                healingPotions: 0
            },
            achievements: {
                firstLevel: false,
                starCollector: false,
                speedRunner: false,
                perfectRun: false,
                masterGamer: false
            },
            gameHistory: []
        };
    },

    // 保存玩家数据
    saveData(data) {
        localStorage.setItem('playerData', JSON.stringify(data));
    },

    // 更新玩家数据
    updateData(updates) {
        const currentData = this.loadData();
        const newData = { ...currentData, ...updates };
        this.saveData(newData);
        this.updateUI(newData);
    },

    // 添加经验值
    addExperience(amount) {
        const data = this.loadData();
        data.experience += amount;
        
        // 检查是否升级
        while (data.experience >= data.experienceToNextLevel) {
            data.experience -= data.experienceToNextLevel;
            data.level += 1;
            data.experienceToNextLevel = Math.floor(data.experienceToNextLevel * 1.5);
        }
        
        this.updateData(data);
    },

    // 更新成就
    updateAchievement(achievementId) {
        const data = this.loadData();
        data.achievements[achievementId] = true;
        this.updateData(data);
    },

    // 添加游戏历史记录
    addGameHistory(gameName, score, completedLevels) {
        const data = this.loadData();
        const historyEntry = {
            gameName,
            score,
            completedLevels,
            date: new Date().toISOString()
        };
        data.gameHistory.unshift(historyEntry);
        // 只保留最近的10条记录
        data.gameHistory = data.gameHistory.slice(0, 10);
        this.updateData(data);
    },

    // 更新UI显示
    updateUI(data) {
        // 更新玩家信息
        document.querySelector('.profile-name').textContent = data.name;
        document.querySelector('.profile-level').textContent = `等级 ${data.level}`;
        
        // 更新经验条
        const progressPercent = (data.experience / data.experienceToNextLevel) * 100;
        document.querySelector('.progress-fill').style.width = `${progressPercent}%`;
        
        // 更新统计数据
        document.querySelector('.stat-value:nth-child(1)').textContent = data.stats.completedChapters;
        document.querySelector('.stat-value:nth-child(2)').textContent = data.stats.stars;
        document.querySelector('.stat-value:nth-child(3)').textContent = data.stats.reviveTokens;
        document.querySelector('.stat-value:nth-child(4)').textContent = data.stats.healingPotions;
        
        // 更新成就
        Object.entries(data.achievements).forEach(([id, completed]) => {
            const achievementCard = document.querySelector(`[data-achievement="${id}"]`);
            if (achievementCard) {
                achievementCard.classList.toggle('completed', completed);
            }
        });
        
        // 更新游戏历史
        const historyTable = document.querySelector('.history-table tbody');
        if (historyTable) {
            historyTable.innerHTML = data.gameHistory.map(entry => `
                <tr>
                    <td>${entry.gameName}</td>
                    <td>${entry.score}</td>
                    <td>${entry.completedLevels}</td>
                    <td>${new Date(entry.date).toLocaleDateString()}</td>
                </tr>
            `).join('');
        }
    },

    // 初始化
    init() {
        const data = this.loadData();
        this.updateUI(data);
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    playerData.init();
}); 