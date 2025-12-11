<template>
    <div class="fullbody">
        <div class="container">
            <div class="error-page">
                <div class="error-content">
                    <div class="error-header">
                        <div class="error-code">404</div>
                        <h1 class="error-title">页面未找到</h1>
                        <p class="error-subtitle">哎呀，您访问的页面好像迷路了</p>
                    </div>

                    <div class="error-illustration">
                        <svg viewBox="0 0 500 300">
                            <circle
                                cx="250"
                                cy="150"
                                r="100"
                                fill="#F8F9FA"
                                stroke="#6a11cb"
                                stroke-width="2"
                            />
                            <circle cx="210" cy="130" r="10" fill="#2575fc" />
                            <circle cx="290" cy="130" r="10" fill="#2575fc" />
                            <path
                                d="M210 180 Q250 210 290 180"
                                stroke="#2575fc"
                                stroke-width="4"
                                fill="none"
                            />
                            <path
                                d="M150 80 L180 50 M350 80 L320 50"
                                stroke="#6a11cb"
                                stroke-width="3"
                            />
                            <path d="M250 20 L250 50" stroke="#6a11cb" stroke-width="3" />
                        </svg>
                    </div>

                    <div class="error-description">
                        <p>您要查找的页面可能已被移除、重命名或暂时不可用。</p>
                        <p>请检查URL是否正确，或尝试以下操作：</p>
                    </div>

                    <div class="action-buttons">
                        <button
                            v-for="button in buttons"
                            :key="button.id"
                            class="action-btn"
                            @click="button.action === 'goHome' ? $router.back() : undefined"
                            @mouseover="isHovering = true"
                            @mouseleave="isHovering = false"
                        >
                            <i :class="['fas', button.icon]"></i>
                            {{ button.text }}
                        </button>
                    </div>

                    <div class="search-box">
                        <div class="search-container">
                            <input type="text" placeholder="搜索网站内容..." />
                            <button class="search-btn">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer">
                <p>© 2023 我的网站 | 隐私政策 | 使用条款</p>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
const isHovering = ref(false);
const buttons = ref([
    { id: 1, text: '返回上级', icon: 'fa-home', action: 'goHome' },
    { id: 2, text: '联系支持', icon: 'fa-headset', action: 'contactSupport' },
    { id: 3, text: '报告问题', icon: 'fa-bug', action: 'reportIssue' }
]);
</script>

<style lang="scss" scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.fullbody {
    min-height: 100%;
    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    color: #333;
    overflow: hidden;
}

.container {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
}

.error-page {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 24px;
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
    padding: 30px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
    overflow: hidden;
    transition: transform 0.3s ease;
    animation: fadeIn 0.8s ease;
}

.error-page:hover {
    transform: translateY(-5px);
}

.error-page::before {
    content: '';
    position: absolute;
    top: -50px;
    left: -50px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(106, 17, 203, 0.1) 0%, rgba(37, 117, 252, 0.1) 100%);
    z-index: 0;
}

.error-page::after {
    content: '';
    position: absolute;
    bottom: -80px;
    right: -80px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(106, 17, 203, 0.1) 0%, rgba(37, 117, 252, 0.1) 100%);
    z-index: 0;
}

.error-content {
    position: relative;
    z-index: 2;
    max-width: 800px;
}

.error-header {
    margin-bottom: 30px;
}

.error-code {
    font-size: 180px;
    font-weight: 800;
    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1;
    margin-bottom: 20px;
    text-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    animation: pulse 2s infinite;
}

.error-title {
    font-size: 36px;
    color: #2c3e50;
    margin-bottom: 10px;
    font-weight: 700;
}

.error-subtitle {
    font-size: 20px;
    color: #7f8c8d;
    margin-bottom: 30px;
}

.error-illustration {
    margin: 30px 0;
}

.error-illustration svg {
    width: 250px;
    height: 180px;
    opacity: 0.9;
    animation: float 4s ease-in-out infinite;
}

.error-description {
    margin-bottom: 30px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.error-description p {
    font-size: 18px;
    color: #555;
    line-height: 1.6;
    margin-bottom: 10px;
}

.action-buttons {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 30px;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: 50px;
    border: none;
    background: linear-gradient(to right, #6a11cb, #2575fc);
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(106, 17, 203, 0.3);
}

.action-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(106, 17, 203, 0.4);
}

.action-btn:nth-child(2) {
    background: linear-gradient(to right, #2575fc, #2c9faf);
}

.action-btn:nth-child(3) {
    background: linear-gradient(to right, #ff6b6b, #ff8e53);
}

.search-box {
    margin-top: 20px;
}

.search-container {
    display: flex;
    max-width: 500px;
    margin: 0 auto;
    border-radius: 50px;
    overflow: hidden;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.search-container input {
    flex: 1;
    padding: 15px 25px;
    border: none;
    font-size: 16px;
    outline: none;
}

.search-container input::placeholder {
    color: #aaa;
}

.search-btn {
    padding: 0 25px;
    background: #2c3e50;
    color: white;
    border: none;
    cursor: pointer;
    transition: background 0.3s;
}

.search-btn:hover {
    background: #1a2530;
}

.footer {
    text-align: center;
    margin-top: 30px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
}

@keyframes float {
    0% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-15px);
    }
    100% {
        transform: translateY(0px);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .error-code {
        font-size: 140px;
    }

    .error-title {
        font-size: 28px;
    }

    .action-buttons {
        flex-direction: column;
        align-items: center;
    }

    .action-btn {
        width: 100%;
        max-width: 300px;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .error-page {
        padding: 40px 20px;
    }

    .error-code {
        font-size: 100px;
    }

    .error-title {
        font-size: 24px;
    }

    .error-subtitle {
        font-size: 18px;
    }
}
</style>
