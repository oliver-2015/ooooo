class LevelGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        // 设置容器初始样式
        this.container.style.margin = '0 auto';  // 居中显示
        this.container.style.position = 'relative';
        this.container.style.width = '800px';
        this.container.style.height = '400px';
        this.container.style.overflow = 'hidden';

        this.level = 1;
        this.maxLevel = 5;
        this.chapter = 1;
        this.maxChapter = 3;
        this.playerStats = {
            level: 1,
            exp: 0,
            expToNext: 100,
            stars: 0,
            keys: 0,
            lives: 3,
            reviveTokens: 0,
            healingPotions: 0
        };
        this.player = {
            x: 50,
            y: 200,
            width: 30,
            height: 30,
            speed: 5,
            jumping: false,
            jumpPower: 15,
            gravity: 0.8,
            velocityY: 0,
            isInvincible: false
        };
        this.goal = {
            x: 750,
            y: 50,
            width: 30,
            height: 30,
            locked: false
        };
        this.collectibles = {
            stars: [],
            keys: [],
            tnt: []
        };
        this.monsters = [];
        this.obstacles = [];
        this.platforms = [];
        this.keys = {
            left: false,
            right: false,
            up: false
        };
        this.gameLoop = null;
        this.canvas = null;
        this.ctx = null;
        this.isGameOver = false;
        this.hasWon = false;
        this.showingMainMenu = true;
        this.showingShop = false;
        this.showingProfile = false;
        this.showingAchievements = false;
        this.showingPaymentQR = false;

        this.shopItems = {
            reviveToken: {
                name: '复活币',
                price: 5,
                description: '在生命值耗尽时可以复活一次'
            },
            healingPotion: {
                name: '复活药水',
                price: 3,
                description: '恢复一点生命值'
            }
        };

        this.invincible = false;
        this.invincibleTimer = 0;

        this.achievements = {
            firstLevel: {
                id: 'firstLevel',
                title: '初出茅庐',
                desc: '完成第一章',
                icon: '🏆',
                completed: false,
                rewards: {
                    stars: 50,
                    reviveTokens: 1,
                    healingPotions: 2
                }
            },
            starCollector: {
                id: 'starCollector',
                title: '星星收集者',
                desc: '收集100颗星星',
                icon: '⭐',
                completed: false,
                rewards: {
                    stars: 100,
                    reviveTokens: 2,
                    healingPotions: 3,
                    exp: 200
                }
            },
            keyMaster: {
                id: 'keyMaster',
                title: '钥匙大师',
                desc: '收集50把钥匙',
                icon: '🔑',
                completed: false,
                rewards: {
                    stars: 150,
                    reviveTokens: 3,
                    healingPotions: 4,
                    exp: 300
                }
            },
            immortal: {
                id: 'immortal',
                title: '不死之身',
                desc: '拥有10个复活币',
                icon: '💪',
                completed: false,
                rewards: {
                    stars: 200,
                    healingPotions: 5,
                    exp: 400
                }
            },
            speedRunner: {
                id: 'speedRunner',
                title: '速通达人',
                desc: '10分钟内通关一个章节',
                icon: '⚡',
                completed: false,
                rewards: {
                    stars: 300,
                    reviveTokens: 4,
                    healingPotions: 6,
                    exp: 500
                }
            }
        };
        this.gameStartTime = null;

        this.premiumFeatures = {
            extraLives: false,
            doubleStar: false,
            unlockAllLevels: false
        };

        this.init();
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 400;
        this.ctx = this.canvas.getContext('2d');
        this.container.innerHTML = '';
        this.container.appendChild(this.canvas);

        // 添加全屏变化事件监听器
        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                // 进入全屏时的样式
                this.container.style.width = '100vw';
                this.container.style.height = '100vh';
                this.container.style.position = 'fixed';
                this.container.style.top = '0';
                this.container.style.left = '0';
                this.canvas.width = window.screen.width;
                this.canvas.height = window.screen.height;
            } else {
                // 退出全屏时恢复原始样式
                this.container.style.width = '800px';
                this.container.style.height = '400px';
                this.container.style.position = 'relative';
                this.container.style.margin = '0 auto';
                this.canvas.width = 800;
                this.canvas.height = 400;
            }
            // 重新渲染当前界面
            if (this.showingMainMenu) {
                this.showMainMenu();
            } else if (this.showingProfile) {
                this.showProfile();
            } else if (this.showingAchievements) {
                this.showAchievements();
            } else if (this.showingShop) {
                this.showShop();
            } else if (this.showingPaymentQR) {
                this.showPaymentQR();
            }
        });

        // 添加事件监听器
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));

        this.showMainMenu();
    }

    showMainMenu() {
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 计算中心位置
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const buttonWidth = 120;
        const buttonHeight = 40;
        const buttonGap = 50;

        // 绘制标题
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏中心', centerX, 80);

        // 绘制游戏列表
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(centerX - 150, centerY - 200, 300, 40);
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText('猛男大战怪兽', centerX, centerY - 170);

        // 绘制玩家状态
        this.ctx.fillStyle = '#000';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`当前章节: ${this.chapter}/${this.maxChapter}`, centerX, centerY - 100);
        this.ctx.fillText(`玩家等级: ${this.playerStats.level}`, centerX, centerY - 70);
        this.ctx.fillText(`经验值: ${this.playerStats.exp}/${this.playerStats.expToNext}`, centerX, centerY - 40);
        this.ctx.fillText(`收集星星: ${this.playerStats.stars}`, centerX, centerY - 10);
        this.ctx.fillText(`钥匙数量: ${this.playerStats.keys}`, centerX, centerY + 20);

        // 绘制玩家主页按钮
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(centerX - buttonWidth/2, centerY + 50 + buttonGap, buttonWidth, buttonHeight);
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillText('玩家主页', centerX, centerY + 77 + buttonGap);

        // 绘制成就系统按钮
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.fillRect(centerX - buttonWidth/2, centerY + 50 + buttonGap * 2, buttonWidth, buttonHeight);
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillText('成就系统', centerX, centerY + 77 + buttonGap * 2);

        // 绘制商城按钮
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(centerX - buttonWidth/2, centerY + 50 + buttonGap * 3, buttonWidth, buttonHeight);
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillText('商城', centerX, centerY + 77 + buttonGap * 3);

        // 绘制一个大的、醒目的收款码按钮
        const donateButtonWidth = 200;  // 更宽的按钮
        const donateButtonHeight = 60;  // 更高的按钮
        const donateButtonX = centerX - donateButtonWidth/2;
        const donateButtonY = 20;  // 放在顶部

        // 绘制发光效果
        this.ctx.shadowColor = '#07c160';
        this.ctx.shadowBlur = 20;
        this.ctx.fillStyle = '#07c160';  // 微信支付的标准绿色
        this.ctx.fillRect(donateButtonX, donateButtonY, donateButtonWidth, donateButtonHeight);
        this.ctx.shadowBlur = 0;  // 重置阴影效果

        // 绘制按钮文字
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 24px Arial';  // 更大的字体
        this.ctx.textAlign = 'center';
        this.ctx.fillText('打赏作者', centerX, donateButtonY + 38);

        // 添加微信图标
        this.ctx.font = '24px Arial';
        this.ctx.fillText('💰', centerX - 60, donateButtonY + 38);

        // 显示已完成成就数量
        const completedAchievements = Object.values(this.achievements).filter(a => a.completed).length;
        const totalAchievements = Object.keys(this.achievements).length;
        this.ctx.fillStyle = '#666';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`已完成成就: ${completedAchievements}/${totalAchievements}`, centerX, centerY + 77 + buttonGap * 5);

        // 添加全屏提示
        this.ctx.fillStyle = '#666';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('按F键切换全屏模式', centerX, this.canvas.height - 20);
    }

    startGame() {
        this.showingMainMenu = false;
        this.isGameOver = false;
        this.hasWon = false;
        
        // 清空画布并设置背景
        this.ctx.fillStyle = '#87CEEB';  // 天蓝色背景
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制游戏标题
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('猛男大战怪兽', this.canvas.width / 2, 80);

        // 绘制游戏说明
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#333';
        this.ctx.fillText('使用方向键移动，空格键跳跃', this.canvas.width / 2, 150);
        this.ctx.fillText('收集星星和钥匙，躲避怪物', this.canvas.width / 2, 190);
        this.ctx.fillText('到达绿色终点完成关卡', this.canvas.width / 2, 230);

        // 绘制控制说明
        this.ctx.fillStyle = '#666';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('← → : 左右移动', this.canvas.width / 2, 290);
        this.ctx.fillText('空格键 : 跳跃', this.canvas.width / 2, 320);
        this.ctx.fillText('P键 : 打开商城', this.canvas.width / 2, 350);

        // 绘制开始按钮
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = this.canvas.width / 2 - buttonWidth / 2;
        const buttonY = this.canvas.height - 100;

        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('开始游戏', this.canvas.width / 2, buttonY + 33);

        // 添加点击事件监听器
        const startGameHandler = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (x >= buttonX && x <= buttonX + buttonWidth &&
                y >= buttonY && y <= buttonY + buttonHeight) {
                // 移除事件监听器
                this.canvas.removeEventListener('click', startGameHandler);
                // 初始化关卡并开始游戏循环
                this.initLevel();
                this.gameLoop = setInterval(() => this.update(), 1000 / 60);
                this.gameStartTime = Date.now();
            }
        };

        this.canvas.addEventListener('click', startGameHandler);
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.showingMainMenu) {
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const buttonWidth = 120;
            const buttonHeight = 40;
            const buttonGap = 50;
            const donateButtonWidth = 200;
            const donateButtonHeight = 60;
            const donateButtonX = centerX - donateButtonWidth/2;
            const donateButtonY = 20;

            // 检查是否点击了游戏列表中的"猛男大战怪兽"
            const gameListY = centerY - 200;  // 游戏列表的Y坐标
            const gameItemHeight = 40;  // 每个游戏项的高度
            
            if (x >= centerX - 150 && x <= centerX + 150 &&
                y >= gameListY && y <= gameListY + gameItemHeight) {
                this.showingMainMenu = false;
                this.startGame();
                return;
            }

            // 检查是否点击了收款码按钮（现在放在最上面）
            if (x >= donateButtonX && x <= donateButtonX + donateButtonWidth &&
                y >= donateButtonY && y <= donateButtonY + donateButtonHeight) {
                this.showingMainMenu = false;
                this.showingProfile = false;
                this.showingAchievements = false;
                this.showingShop = false;
                this.showingPaymentQR = true;
                this.showPaymentQR();
                return;
            }

            // 检查是否点击了开始游戏按钮
            if (x >= centerX - buttonWidth/2 && x <= centerX + buttonWidth/2 &&
                y >= centerY + 50 && y <= centerY + 50 + buttonHeight) {
                this.startGame();
            }
            // 检查是否点击了玩家主页按钮
            else if (x >= centerX - buttonWidth/2 && x <= centerX + buttonWidth/2 &&
                     y >= centerY + 50 + buttonGap && y <= centerY + 50 + buttonGap + buttonHeight) {
                this.showingMainMenu = false;
                this.showingProfile = true;
                this.showingAchievements = false;
                this.showingShop = false;
                this.showingPaymentQR = false;
                this.showProfile();
            }
            // 检查是否点击了成就系统按钮
            else if (x >= centerX - buttonWidth/2 && x <= centerX + buttonWidth/2 &&
                     y >= centerY + 50 + buttonGap * 2 && y <= centerY + 50 + buttonGap * 2 + buttonHeight) {
                this.showingMainMenu = false;
                this.showingProfile = false;
                this.showingAchievements = true;
                this.showingShop = false;
                this.showingPaymentQR = false;
                this.showAchievements();
            }
            // 检查是否点击了商城按钮
            else if (x >= centerX - buttonWidth/2 && x <= centerX + buttonWidth/2 &&
                     y >= centerY + 50 + buttonGap * 3 && y <= centerY + 50 + buttonGap * 3 + buttonHeight) {
                this.showingMainMenu = false;
                this.showingProfile = false;
                this.showingAchievements = false;
                this.showingShop = true;
                this.showingPaymentQR = false;
                this.showShop();
            }
        } else if (this.showingPaymentQR || this.showingProfile || this.showingAchievements || this.showingShop) {
            // 检查是否点击了返回按钮
            const returnBtnX = this.canvas.width - 140;
            const returnBtnY = this.canvas.height - 60;
            const returnBtnWidth = 120;
            const returnBtnHeight = 40;

            if (x >= returnBtnX && x <= returnBtnX + returnBtnWidth &&
                y >= returnBtnY && y <= returnBtnY + returnBtnHeight) {
                // 重置所有显示状态
                this.showingMainMenu = true;
                this.showingProfile = false;
                this.showingAchievements = false;
                this.showingShop = false;
                this.showingPaymentQR = false;
                // 返回主菜单
                this.showMainMenu();
            }
        }

        // 如果在商城界面，处理商品点击
        if (this.showingShop) {
            const centerX = this.canvas.width / 2;
            const rules = [
                { name: "初级特权", price: "￥6.00", benefits: "永久获得2点额外生命值", color: '#3498db' },
                { name: "中级特权", price: "￥12.00", benefits: "永久获得双倍星星奖励", color: '#f1c40f' },
                { name: "高级特权", price: "￥18.00", benefits: "立即解锁所有关卡", color: '#e74c3c' }
            ];

            // 检查特权卡片点击
            rules.forEach((rule, index) => {
                const cardY = 180 + index * 100;
                if (x >= centerX - 300 && x <= centerX + 300 &&
                    y >= cardY && y <= cardY + 80) {
                    this.showingShop = false;
                    this.showingPaymentQR = true;
                    this.showPaymentQR();
                    return;
                }
            });

            // 检查返回按钮点击
            const returnBtnX = this.canvas.width - 140;
            const returnBtnY = this.canvas.height - 60;
            const returnBtnWidth = 120;
            const returnBtnHeight = 40;
            
            if (x >= returnBtnX && x <= returnBtnX + returnBtnWidth &&
                y >= returnBtnY && y <= returnBtnY + returnBtnHeight) {
                this.showingMainMenu = true;
                this.showingShop = false;
                this.showMainMenu();
            }
        }
    }

    initLevel() {
        this.player.x = 50;
        this.player.y = 200;
        this.player.velocityY = 0;
        this.player.jumping = false;
        
        this.obstacles = [];
        this.platforms = [];
        this.monsters = [];
        this.collectibles.stars = [];
        this.collectibles.keys = [];
        this.collectibles.tnt = [];

        // 设置终点位置
        this.goal.x = 750;
        this.goal.y = 300;  // 将终点统一设置在y=300的位置

        switch(this.level) {
            case 1:
                // 第一关：简单的平台和收集品
                this.platforms.push(
                    {x: 0, y: 350, width: 800, height: 20},
                    {x: 200, y: 250, width: 100, height: 20},
                    {x: 400, y: 150, width: 100, height: 20},
                    {x: 600, y: 250, width: 150, height: 20}  // 添加一个通向终点的平台
                );
                this.collectibles.stars.push(
                    {x: 250, y: 200, width: 20, height: 20},
                    {x: 450, y: 100, width: 20, height: 20}
                );
                this.goal.locked = false;
                break;

            case 2:
                // 第二关：需要钥匙和怪物
                this.platforms.push(
                    {x: 0, y: 350, width: 800, height: 20},
                    {x: 150, y: 250, width: 100, height: 20},
                    {x: 350, y: 200, width: 100, height: 20},
                    {x: 550, y: 250, width: 200, height: 20}  // 加宽通向终点的平台
                );
                this.monsters.push(
                    {x: 300, y: 330, width: 30, height: 30, speed: 2, moveRange: 100, direction: 1},
                    {x: 500, y: 180, width: 30, height: 30, speed: 2, moveRange: 100, direction: 1}
                );
                this.collectibles.keys.push(
                    {x: 400, y: 150, width: 20, height: 20}
                );
                this.collectibles.tnt.push(
                    {x: 200, y: 200, width: 20, height: 20}
                );
                this.goal.locked = true;
                break;

            case 3:
                // 第三关：多层平台和更多收集品
                this.platforms.push(
                    {x: 0, y: 350, width: 800, height: 20},
                    {x: 100, y: 280, width: 100, height: 20},
                    {x: 300, y: 220, width: 100, height: 20},
                    {x: 500, y: 250, width: 250, height: 20}  // 加宽通向终点的平台
                );
                this.monsters.push(
                    {x: 200, y: 330, width: 30, height: 30, speed: 3, moveRange: 150, direction: 1},
                    {x: 400, y: 200, width: 30, height: 30, speed: 3, moveRange: 100, direction: 1}
                );
                this.collectibles.stars.push(
                    {x: 150, y: 240, width: 20, height: 20},
                    {x: 350, y: 180, width: 20, height: 20},
                    {x: 550, y: 210, width: 20, height: 20}
                );
                this.collectibles.keys.push(
                    {x: 400, y: 180, width: 20, height: 20}
                );
                this.collectibles.tnt.push(
                    {x: 250, y: 180, width: 20, height: 20},
                    {x: 450, y: 210, width: 20, height: 20}
                );
                this.goal.locked = true;
                break;

            case 4:
                // 第四关：复杂的平台布局
                this.platforms.push(
                    {x: 0, y: 350, width: 200, height: 20},
                    {x: 250, y: 350, width: 200, height: 20},
                    {x: 500, y: 350, width: 300, height: 20},  // 加宽最后一段平台
                    {x: 150, y: 250, width: 100, height: 20},
                    {x: 350, y: 250, width: 100, height: 20},
                    {x: 550, y: 250, width: 200, height: 20}  // 添加通向终点的平台
                );
                this.monsters.push(
                    {x: 100, y: 330, width: 30, height: 30, speed: 3, moveRange: 80, direction: 1},
                    {x: 350, y: 330, width: 30, height: 30, speed: 3, moveRange: 100, direction: 1},
                    {x: 600, y: 330, width: 30, height: 30, speed: 3, moveRange: 120, direction: 1}
                );
                this.collectibles.stars.push(
                    {x: 180, y: 210, width: 20, height: 20},
                    {x: 380, y: 210, width: 20, height: 20},
                    {x: 580, y: 210, width: 20, height: 20}
                );
                this.collectibles.keys.push(
                    {x: 250, y: 310, width: 20, height: 20},
                    {x: 580, y: 210, width: 20, height: 20}
                );
                this.collectibles.tnt.push(
                    {x: 300, y: 310, width: 20, height: 20},
                    {x: 500, y: 210, width: 20, height: 20}
                );
                this.goal.locked = true;
                break;

            case 5:
                // 第五关：终极挑战
                this.platforms.push(
                    {x: 0, y: 350, width: 150, height: 20},
                    {x: 200, y: 350, width: 150, height: 20},
                    {x: 400, y: 350, width: 150, height: 20},
                    {x: 600, y: 350, width: 200, height: 20},  // 加宽最后一段平台
                    {x: 100, y: 280, width: 100, height: 20},
                    {x: 300, y: 280, width: 100, height: 20},
                    {x: 500, y: 280, width: 100, height: 20},
                    {x: 650, y: 250, width: 150, height: 20}  // 添加通向终点的平台
                );
                this.monsters.push(
                    {x: 150, y: 330, width: 30, height: 30, speed: 4, moveRange: 100, direction: 1},
                    {x: 450, y: 330, width: 30, height: 30, speed: 4, moveRange: 120, direction: 1},
                    {x: 250, y: 260, width: 30, height: 30, speed: 3, moveRange: 100, direction: 1},
                    {x: 550, y: 260, width: 30, height: 30, speed: 3, moveRange: 80, direction: 1}
                );
                this.collectibles.stars.push(
                    {x: 120, y: 240, width: 20, height: 20},
                    {x: 320, y: 240, width: 20, height: 20},
                    {x: 520, y: 240, width: 20, height: 20},
                    {x: 670, y: 210, width: 20, height: 20}
                );
                this.collectibles.keys.push(
                    {x: 700, y: 210, width: 20, height: 20},
                    {x: 420, y: 310, width: 20, height: 20}
                );
                this.collectibles.tnt.push(
                    {x: 350, y: 240, width: 20, height: 20},
                    {x: 550, y: 240, width: 20, height: 20},
                    {x: 650, y: 210, width: 20, height: 20}
                );
                this.goal.locked = true;
                break;
        }
    }

    handleKeyDown(e) {
        if (this.isGameOver) {
            if (e.key.toLowerCase() === 'r') {
                this.restart();
            }
            return;
        }

        switch(e.key.toLowerCase()) {
            case 'arrowleft':
                this.keys.left = true;
                break;
            case 'arrowright':
                this.keys.right = true;
                break;
            case 'arrowup':
            case ' ':
                this.keys.up = true;
                if (!this.player.jumping) {
                    this.player.velocityY = -this.player.jumpPower;
                    this.player.jumping = true;
                }
                break;
            case 'p':
                if (!this.showingMainMenu) {
                    this.showingShop = !this.showingShop;
                    if (this.showingShop) {
                        this.showShop();
                    }
                }
                break;
            case 'h':
                if (!this.showingMainMenu && !this.showingShop) {
                    this.useHealingPotion();
                }
                break;
        }
    }

    handleKeyUp(e) {
        switch(e.key) {
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'ArrowRight':
                this.keys.right = false;
                break;
            case 'ArrowUp':
            case ' ':
                this.keys.up = false;
                break;
        }
    }

    update() {
        if (this.isGameOver || this.showingMainMenu || this.showingShop) return;

        // 更新无敌时间
        if (this.invincible) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }

        // 更新玩家位置
        if (this.keys.left) this.player.x -= this.player.speed;
        if (this.keys.right) this.player.x += this.player.speed;

        // 重力
        this.player.velocityY += this.player.gravity;
        this.player.y += this.player.velocityY;

        // 检查平台碰撞
        this.platforms.forEach(platform => {
            if (this.checkCollision(this.player, platform)) {
                if (this.player.velocityY > 0) {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.jumping = false;
                }
            }
        });

        // 检查TNT碰撞
        this.collectibles.tnt.forEach((tnt, index) => {
            if (this.checkCollision(this.player, tnt)) {
                this.collectibles.tnt.splice(index, 1);
                this.playerHit();
                this.playerHit(); // 扣除2点生命值
            }
        });

        // 检查星星碰撞
        this.collectibles.stars.forEach((star, index) => {
            if (this.checkCollision(this.player, star)) {
                this.collectibles.stars.splice(index, 1);
                this.collectStar();
            }
        });

        // 检查钥匙碰撞
        this.collectibles.keys.forEach((key, index) => {
            if (this.checkCollision(this.player, key)) {
                this.collectibles.keys.splice(index, 1);
                this.playerStats.keys++;
                this.addExperience(30);
                // 解锁终点
                this.goal.locked = false;
            }
        });

        // 检查怪物碰撞
        this.monsters.forEach(monster => {
            if (this.checkCollision(this.player, monster) && !this.invincible) {
                this.playerHit();
            }
        });

        // 更新怪物位置
        this.monsters.forEach(monster => {
            monster.x += monster.speed * monster.direction;
            if (Math.abs(monster.x - monster.initialX) > monster.moveRange) {
                monster.direction *= -1;
            }
        });

        // 检查是否到达终点
        if (this.checkGoalCollision()) {
            if (!this.goal.locked) {
                if (this.level === this.maxLevel) {
                    if (this.chapter === this.maxChapter) {
                        this.gameOver(true);
                    } else {
                        // 完成一个章节
                        this.completeChapter();
                        this.chapter++;
                        this.level = 1;
                        this.initLevel();
                    }
                } else {
                    this.level++;
                    this.addExperience(50);
                    this.initLevel();
                }
            }
        }

        // 检查游戏结束条件
        if (this.player.y > this.canvas.height || this.playerStats.lives <= 0) {
            this.gameOver(false);
        }

        // 在更新循环中检查成就
        this.checkAchievements();

        this.render();
    }

    addExperience(amount) {
        this.playerStats.exp += amount;
        while (this.playerStats.exp >= this.playerStats.expToNext) {
            this.playerStats.exp -= this.playerStats.expToNext;
            this.playerStats.level++;
            this.playerStats.expToNext = Math.floor(this.playerStats.expToNext * 1.5);
            this.player.speed += 0.5;
            this.player.jumpPower += 0.5;
        }
    }

    playerHit() {
        if (!this.player.isInvincible) {
            this.playerStats.lives--;
            if (this.playerStats.lives <= 0) {
                if (this.playerStats.reviveTokens > 0) {
                    this.playerStats.reviveTokens--;
                    this.playerStats.lives = 3;
                    this.player.isInvincible = true;
                    setTimeout(() => {
                        this.player.isInvincible = false;
                    }, 2000);
                } else {
                    this.gameOver(false);
                    return;
                }
            }
            this.player.isInvincible = true;
            setTimeout(() => {
                this.player.isInvincible = false;
            }, 2000);
        }
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    checkGoalCollision() {
        return this.player.x + this.player.width > this.goal.x &&
               this.player.x < this.goal.x + this.goal.width &&
               this.player.y + this.player.height > this.goal.y &&
               this.player.y < this.goal.y + this.goal.height;
    }

    render() {
        if (this.showingProfile) {
            this.showProfile();
            return;
        }
        if (this.showingShop) {
            this.showShop();
            return;
        }
        if (this.showingAchievements) {
            this.showAchievements();
            return;
        }
        if (this.showingPaymentQR) {
            this.showPaymentQR();
            return;
        }

        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制背景
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制平台
        this.ctx.fillStyle = '#8B4513';
        this.platforms.forEach(platform => {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });

        // 绘制TNT
        this.ctx.fillStyle = '#FF0000';
        this.collectibles.tnt.forEach(tnt => {
            this.ctx.fillRect(tnt.x, tnt.y, tnt.width, tnt.height);
            // 绘制TNT文字
            this.ctx.fillStyle = '#000';
            this.ctx.font = '12px Arial';
            this.ctx.fillText('TNT', tnt.x + 2, tnt.y + 15);
        });

        // 绘制星星
        this.ctx.fillStyle = '#FFD700';
        this.collectibles.stars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.moveTo(star.x + star.width/2, star.y);
            this.ctx.lineTo(star.x + star.width, star.y + star.height);
            this.ctx.lineTo(star.x, star.y + star.height);
            this.ctx.closePath();
            this.ctx.fill();
        });

        // 绘制钥匙
        this.ctx.fillStyle = '#FFA500';
        this.collectibles.keys.forEach(key => {
            this.ctx.fillRect(key.x, key.y, key.width, key.height);
        });

        // 绘制怪物
        this.ctx.fillStyle = '#FF0000';
        this.monsters.forEach(monster => {
            this.ctx.fillRect(monster.x, monster.y, monster.width, monster.height);
        });

        // 绘制终点
        this.ctx.fillStyle = this.goal.locked ? '#FF0000' : '#00FF00';
        this.ctx.fillRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);

        // 绘制玩家
        this.ctx.fillStyle = this.invincible ? '#00FF00' : '#0000FF';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // 绘制状态信息
        this.ctx.fillStyle = '#000';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`章节: ${this.chapter}/${this.maxChapter}`, 10, 20);
        this.ctx.fillText(`关卡: ${this.level}/${this.maxLevel}`, 10, 40);
        this.ctx.fillText(`等级: ${this.playerStats.level}`, 10, 60);
        this.ctx.fillText(`经验: ${this.playerStats.exp}/${this.playerStats.expToNext}`, 10, 80);
        this.ctx.fillText(`星星: ${this.playerStats.stars}`, 10, 100);
        this.ctx.fillText(`钥匙: ${this.playerStats.keys}`, 10, 120);
        this.ctx.fillText(`生命: ${this.playerStats.lives}`, 10, 140);
        this.ctx.fillText(`复活币: ${this.playerStats.reviveTokens}`, 10, 160);
        this.ctx.fillText(`复活药水: ${this.playerStats.healingPotions}`, 10, 180);
        this.ctx.fillText('按P打开商城', 10, 200);
    }

    gameOver(won) {
        this.isGameOver = true;
        this.hasWon = won;
        clearInterval(this.gameLoop);
        
        const message = won ? 
            `恭喜通关！\n最终等级: ${this.playerStats.level}\n收集星星: ${this.playerStats.stars}` : 
            '游戏结束！按R键重新开始';
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        
        const lines = message.split('\n');
        lines.forEach((line, i) => {
            this.ctx.fillText(line, this.canvas.width / 2, this.canvas.height / 2 - 30 + i * 40);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.restart();
            }
        });

        // 在游戏结束时更新玩家数据
        this.updatePlayerData();
    }

    restart() {
        this.isGameOver = false;
        this.hasWon = false;
        this.level = 1;
        this.chapter = 1;
        this.playerStats = {
            level: 1,
            exp: 0,
            expToNext: 100,
            stars: 0,
            keys: 0,
            lives: 3,
            reviveTokens: 0,
            healingPotions: 0
        };
        this.player.speed = 5;
        this.player.jumpPower = 15;
        this.showingShop = false;
        this.showMainMenu();
    }

    showShop() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制商城标题
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('商城', this.canvas.width / 2, 50);

        // 显示玩家当前星星数量
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`当前星星: ${this.playerStats.stars}`, this.canvas.width / 2, 90);

        // 付费规则说明
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('付费规则', this.canvas.width / 2, 130);

        const rules = [
            { name: "初级特权", price: "￥6.00", benefits: "永久获得2点额外生命值", color: '#3498db' },  // 蓝色
            { name: "中级特权", price: "￥12.00", benefits: "永久获得双倍星星奖励", color: '#f1c40f' },  // 黄色
            { name: "高级特权", price: "￥18.00", benefits: "立即解锁所有关卡", color: '#e74c3c' }   // 红色
        ];

        // 绘制规则卡片
        rules.forEach((rule, index) => {
            const y = 180 + index * 100;
            
            // 卡片背景
            this.ctx.fillStyle = rule.color;
            this.ctx.fillRect(this.canvas.width / 2 - 300, y, 600, 80);

            // 规则内容
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillText(rule.name, this.canvas.width / 2, y + 30);
            this.ctx.font = '18px Arial';
            this.ctx.fillText(`${rule.price} - ${rule.benefits}`, this.canvas.width / 2, y + 60);
        });

        // 支付说明
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('点击任意特权进行购买', this.canvas.width / 2, 480);
        this.ctx.fillText('扫描微信二维码完成支付', this.canvas.width / 2, 510);

        // 绘制返回按钮
        const returnBtnX = this.canvas.width - 140;
        const returnBtnY = this.canvas.height - 60;
        const returnBtnWidth = 120;
        const returnBtnHeight = 40;
        
        this.ctx.fillStyle = '#07c160';
        this.ctx.fillRect(returnBtnX, returnBtnY, returnBtnWidth, returnBtnHeight);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('返回', returnBtnX + returnBtnWidth/2, returnBtnY + 25);
    }

    buyItem(itemType) {
        const item = this.shopItems[itemType];
        if (this.playerStats.stars >= item.price) {
            this.playerStats.stars -= item.price;
            if (itemType === 'reviveToken') {
                this.playerStats.reviveTokens++;
            } else if (itemType === 'healingPotion') {
                this.playerStats.healingPotions++;
            }
            // 重新渲染商城
            this.showShop();
        }
    }

    useHealingPotion() {
        if (this.playerStats.healingPotions > 0 && this.playerStats.lives < 3) {
            this.playerStats.healingPotions--;
            this.playerStats.lives++;
        }
    }

    completeChapter() {
        // 显示章节完成信息
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`恭喜完成第 ${this.chapter} 章！`, this.canvas.width / 2, this.canvas.height / 2 - 60);
        
        // 给予奖励
        this.playerStats.reviveTokens += 3;
        this.playerStats.healingPotions += 5;
        
        this.ctx.font = '20px Arial';
        this.ctx.fillText('获得奖励：', this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.fillText('3个复活币', this.canvas.width / 2, this.canvas.height / 2 + 10);
        this.ctx.fillText('5个复活药水', this.canvas.width / 2, this.canvas.height / 2 + 40);
        this.ctx.fillText('按任意键继续...', this.canvas.width / 2, this.canvas.height / 2 + 80);

        // 暂停游戏循环
        clearInterval(this.gameLoop);
        
        // 等待玩家按键继续
        const continueHandler = (e) => {
            document.removeEventListener('keydown', continueHandler);
            this.gameLoop = setInterval(() => this.update(), 1000 / 60);
        };
        document.addEventListener('keydown', continueHandler);

        // 在关卡完成时调用
        this.updatePlayerData();
    }

    // 在游戏结束时更新玩家数据
    updatePlayerData() {
        // 更新统计数据
        playerData.updateData({
            stats: {
                completedChapters: this.level,
                stars: this.playerStats.stars,
                reviveTokens: this.playerStats.reviveTokens,
                healingPotions: this.playerStats.healingPotions
            }
        });

        // 添加经验值
        const experienceGained = this.level * 50 + this.playerStats.stars * 10;
        playerData.addExperience(experienceGained);

        // 更新成就
        if (this.level >= 5) {
            playerData.updateAchievement('masterGamer');
        }
        if (this.playerStats.stars >= 50) {
            playerData.updateAchievement('starCollector');
        }
        if (this.playerStats.lives === 3) {
            playerData.updateAchievement('perfectRun');
        }

        // 添加游戏历史记录
        playerData.addGameHistory('闯关大冒险', this.playerStats.stars, this.level);
    }

    showProfile() {
        // 设置背景色为深蓝色
        this.ctx.fillStyle = '#3b5998';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制白色内容区域
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(20, 20, this.canvas.width - 40, this.canvas.height - 40);

        // 绘制玩家头像和基本信息区域
        // 头像背景
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(100, 100, 50, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 头像图标
        this.ctx.fillStyle = '#8b9dc3';
        this.ctx.font = '50px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('👤', 100, 120);

        // 玩家名称和等级
        this.ctx.fillStyle = '#3b5998';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('玩家', 180, 90);
        
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText(`等级 ${this.playerStats.level}`, 180, 130);

        // 经验条背景
        this.ctx.fillStyle = '#f7f7f7';
        this.ctx.fillRect(180, 150, this.canvas.width - 220, 30);

        // 经验条进度
        const expProgress = (this.playerStats.exp / this.playerStats.expToNext) * (this.canvas.width - 220);
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(180, 150, expProgress, 30);

        // 经验值文本
        this.ctx.fillStyle = '#666';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`距离下一等级还需 ${this.playerStats.expToNext - this.playerStats.exp} 经验值`, 180, 200);

        // 统计数据卡片
        const stats = [
            { value: this.chapter, label: '已完成章节' },
            { value: this.playerStats.stars, label: '收集星星' },
            { value: this.playerStats.reviveTokens, label: '复活币' },
            { value: this.playerStats.healingPotions, label: '复活药水' }
        ];

        const cardWidth = 160;
        const cardHeight = 100;
        const startX = 50;
        const startY = 250;
        const gap = 30;

        stats.forEach((stat, index) => {
            const x = startX + (cardWidth + gap) * index;
            
            // 卡片背景
            this.ctx.fillStyle = '#fff';
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(x, startY, cardWidth, cardHeight);
            this.ctx.shadowBlur = 0;

            // 数值
            this.ctx.fillStyle = '#3b5998';
            this.ctx.font = 'bold 36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(stat.value, x + cardWidth/2, startY + 45);

            // 标签
            this.ctx.fillStyle = '#666';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(stat.label, x + cardWidth/2, startY + 75);
        });

        // 成就系统标题
        this.ctx.fillStyle = '#3b5998';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('成就系统', 50, 400);

        // 成就卡片
        const achieveWidth = 180;
        const achieveHeight = 120;
        const achieveStartY = 430;

        Object.values(this.achievements).forEach((achieve, index) => {
            const x = 50 + (achieveWidth + 20) * index;
            
            // 成就卡片背景
            this.ctx.fillStyle = achieve.completed ? '#e3f2fd' : '#f7f7f7';
            this.ctx.fillRect(x, achieveStartY, achieveWidth, achieveHeight);

            // 成就图标
            this.ctx.font = '30px Arial';
            this.ctx.fillStyle = achieve.completed ? '#4CAF50' : '#3b5998';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(achieve.icon, x + achieveWidth/2, achieveStartY + 40);

            // 成就标题
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText(achieve.title, x + achieveWidth/2, achieveStartY + 70);

            // 成就描述
            this.ctx.fillStyle = '#666';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(achieve.desc, x + achieveWidth/2, achieveStartY + 90);

            // 如果成就已完成，添加完成标记
            if (achieve.completed) {
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.font = 'bold 16px Arial';
                this.ctx.fillText('✓ 已完成', x + achieveWidth/2, achieveStartY + 110);
            }
        });

        // 返回按钮
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(this.canvas.width - 140, this.canvas.height - 60, 120, 40);
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('返回主菜单', this.canvas.width - 80, this.canvas.height - 35);
    }

    // 检查成就完成情况
    checkAchievements() {
        const achievements = this.achievements;
        let hasNewAchievement = false;

        // 检查各项成就
        if (!achievements.firstLevel.completed && this.chapter >= 1) {
            this.unlockAchievement('firstLevel');
            hasNewAchievement = true;
        }

        if (!achievements.starCollector.completed && this.playerStats.stars >= 100) {
            this.unlockAchievement('starCollector');
            hasNewAchievement = true;
        }

        if (!achievements.keyMaster.completed && this.playerStats.keys >= 50) {
            this.unlockAchievement('keyMaster');
            hasNewAchievement = true;
        }

        if (!achievements.immortal.completed && this.playerStats.reviveTokens >= 10) {
            this.unlockAchievement('immortal');
            hasNewAchievement = true;
        }

        if (!achievements.speedRunner.completed && this.gameStartTime) {
            const currentTime = Date.now();
            const timePassed = (currentTime - this.gameStartTime) / 1000 / 60; // 转换为分钟
            if (timePassed <= 10) {
                this.unlockAchievement('speedRunner');
                hasNewAchievement = true;
            }
        }

        return hasNewAchievement;
    }

    // 解锁成就并发放奖励
    unlockAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.completed) return;

        achievement.completed = true;

        // 显示成就解锁提示
        this.showAchievementUnlock(achievement);

        // 发放奖励
        const rewards = achievement.rewards;
        if (rewards.stars) this.playerStats.stars += rewards.stars;
        if (rewards.reviveTokens) this.playerStats.reviveTokens += rewards.reviveTokens;
        if (rewards.healingPotions) this.playerStats.healingPotions += rewards.healingPotions;
        if (rewards.exp) this.addExperience(rewards.exp);
    }

    // 显示成就解锁提示
    showAchievementUnlock(achievement) {
        // 保存当前游戏状态
        const currentGameState = this.gameLoop ? true : false;
        if (currentGameState) clearInterval(this.gameLoop);

        // 绘制成就解锁界面
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 成就标题
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🏆 成就解锁！', this.canvas.width / 2, 150);

        // 成就图标和名称
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '30px Arial';
        this.ctx.fillText(`${achievement.icon} ${achievement.title}`, this.canvas.width / 2, 200);
        this.ctx.font = '20px Arial';
        this.ctx.fillText(achievement.desc, this.canvas.width / 2, 240);

        // 奖励信息
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('获得奖励：', this.canvas.width / 2, 300);
        
        let yPos = 340;
        const rewards = achievement.rewards;
        this.ctx.font = '20px Arial';
        if (rewards.stars) {
            this.ctx.fillText(`⭐ ${rewards.stars} 星星`, this.canvas.width / 2, yPos);
            yPos += 30;
        }
        if (rewards.reviveTokens) {
            this.ctx.fillText(`🔄 ${rewards.reviveTokens} 复活币`, this.canvas.width / 2, yPos);
            yPos += 30;
        }
        if (rewards.healingPotions) {
            this.ctx.fillText(`💊 ${rewards.healingPotions} 复活药水`, this.canvas.width / 2, yPos);
            yPos += 30;
        }
        if (rewards.exp) {
            this.ctx.fillText(`✨ ${rewards.exp} 经验值`, this.canvas.width / 2, yPos);
        }

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('按任意键继续...', this.canvas.width / 2, this.canvas.height - 50);

        // 等待玩家按键继续
        const continueHandler = (e) => {
            document.removeEventListener('keydown', continueHandler);
            if (currentGameState) {
                this.gameLoop = setInterval(() => this.update(), 1000 / 60);
            }
        };
        document.addEventListener('keydown', continueHandler);
    }

    // 显示成就系统界面
    showAchievements() {
        // 清空画布并设置白色背景
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制标题
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('成就系统', 40, 60);

        // 绘制成就网格
        const achieveWidth = 240;
        const achieveHeight = 160;
        const gap = 20;
        const startX = 40;
        const startY = 100;
        const itemsPerRow = 3;

        Object.values(this.achievements).forEach((achieve, index) => {
            const row = Math.floor(index / itemsPerRow);
            const col = index % itemsPerRow;
            const x = startX + (achieveWidth + gap) * col;
            const y = startY + (achieveHeight + gap) * row;
            
            // 成就卡片背景
            this.ctx.fillStyle = '#f8f9fa';
            this.ctx.fillRect(x, y, achieveWidth, achieveHeight);

            // 绘制圆形图标背景
            this.ctx.fillStyle = '#f0f2f5';
            this.ctx.beginPath();
            this.ctx.arc(x + achieveWidth/2, y + 50, 35, 0, Math.PI * 2);
            this.ctx.fill();

            // 绘制成就图标
            this.ctx.font = '40px Arial';
            this.ctx.fillStyle = achieve.completed ? '#FFD700' : '#3b5998';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(achieve.icon, x + achieveWidth/2, y + 65);

            // 成就标题
            this.ctx.fillStyle = '#333';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillText(achieve.title, x + achieveWidth/2, y + 110);

            // 成就描述
            this.ctx.fillStyle = '#666';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(achieve.desc, x + achieveWidth/2, y + 140);

            // 如果成就已完成，添加完成标记
            if (achieve.completed) {
                // 绘制浅蓝色背景
                this.ctx.fillStyle = '#e3f2fd';
                this.ctx.fillRect(x, y, achieveWidth, achieveHeight);
                
                // 重新绘制圆形背景
                this.ctx.fillStyle = '#f0f2f5';
                this.ctx.beginPath();
                this.ctx.arc(x + achieveWidth/2, y + 50, 35, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 重新绘制图标（金色）
                this.ctx.font = '40px Arial';
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillText(achieve.icon, x + achieveWidth/2, y + 65);
                
                // 重新绘制标题和描述
                this.ctx.fillStyle = '#333';
                this.ctx.font = 'bold 20px Arial';
                this.ctx.fillText(achieve.title, x + achieveWidth/2, y + 110);
                
                this.ctx.fillStyle = '#666';
                this.ctx.font = '16px Arial';
                this.ctx.fillText(achieve.desc, x + achieveWidth/2, y + 140);
            }
        });

        // 返回按钮
        const returnBtnX = this.canvas.width - 140;
        const returnBtnY = this.canvas.height - 60;
        const returnBtnWidth = 120;
        const returnBtnHeight = 40;

        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(returnBtnX, returnBtnY, returnBtnWidth, returnBtnHeight);
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('返回主菜单', returnBtnX + returnBtnWidth/2, returnBtnY + 25);
    }

    // 处理付费购买
    handlePremiumPurchase(itemType) {
        // 显示打赏作者页面
        this.showingMainMenu = false;
        this.showingProfile = false;
        this.showingAchievements = false;
        this.showingShop = false;
        this.showingPaymentQR = true;
        this.showPaymentQR();
    }

    // 更新收集星星的逻辑
    collectStar() {
        const starValue = this.premiumFeatures.doubleStar ? 2 : 1;
        this.playerStats.stars += starValue;
        this.addExperience(20 * starValue);
    }

    // 添加显示收款码的方法
    showPaymentQR() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制标题
        this.ctx.fillStyle = '#07c160';  // 微信绿色
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('打赏作者', this.canvas.width / 2, 50);

        // 绘制收款码图片
        const qrCode = new Image();
        qrCode.src = 'images/payment-qr.png';
        qrCode.onload = () => {
            // 保持原始比例计算尺寸
            const maxHeight = this.canvas.height - 150; // 留出空间给标题和底部
            const maxWidth = this.canvas.width - 100;  // 左右留出一些边距
            
            // 计算缩放比例
            const scale = Math.min(
                maxWidth / qrCode.width,
                maxHeight / qrCode.height
            );
            
            // 计算实际显示尺寸
            const displayWidth = qrCode.width * scale;
            const displayHeight = qrCode.height * scale;
            
            // 在画布中央显示收款码
            this.ctx.drawImage(qrCode, 
                this.canvas.width / 2 - displayWidth / 2, 
                this.canvas.height / 2 - displayHeight / 2, 
                displayWidth, displayHeight);

            // 添加微信名称
            this.ctx.fillStyle = '#333333';
            this.ctx.font = '20px Arial';
            this.ctx.fillText('Nami(*波)', this.canvas.width / 2, this.canvas.height / 2 + displayHeight / 2 + 40);
            
            // 绘制返回按钮
            const returnBtnX = this.canvas.width - 140;
            const returnBtnY = this.canvas.height - 60;
            const returnBtnWidth = 120;
            const returnBtnHeight = 40;
            
            this.ctx.fillStyle = '#07c160';
            this.ctx.fillRect(returnBtnX, returnBtnY, returnBtnWidth, returnBtnHeight);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px Arial';
            this.ctx.fillText('返回', returnBtnX + returnBtnWidth/2, returnBtnY + 25);
        };
    }
}