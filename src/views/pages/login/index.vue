<template>
    <div class="login-container">
        <div class="login-background">
            <div class="background-shapes">
                <div class="shape shape-1"></div>
                <div class="shape shape-2"></div>
                <div class="shape shape-3"></div>
            </div>
        </div>

        <div class="login-wrapper">
            <div class="login-card">
                <!-- 头部区域 -->
                <div class="login-header">
                    <div class="logo">
                        <i class="el-icon-user-solid"></i>
                        <span class="app-name">Vue Admin System</span>
                    </div>
                    <h1 class="title">账号登录</h1>
                    <p class="subtitle">欢迎回来，请登录您的账号</p>
                </div>

                <!-- 登录表单 -->
                <el-form
                    ref="loginFormRef"
                    :model="loginForm"
                    :rules="loginRules"
                    class="login-form"
                    @submit.prevent="handleLogin"
                >
                    <!-- 账号输入 -->
                    <el-form-item prop="username">
                        <el-input
                            v-model="loginForm.username"
                            placeholder="请输入用户名/邮箱/手机号"
                            size="large"
                            :prefix-icon="User"
                        >
                            <template #prepend>
                                <span class="input-label">账号</span>
                            </template>
                        </el-input>
                    </el-form-item>

                    <!-- 密码输入 -->
                    <el-form-item prop="password">
                        <el-input
                            v-model="loginForm.password"
                            type="password"
                            placeholder="请输入密码"
                            size="large"
                            :prefix-icon="Lock"
                            show-password
                        >
                            <template #prepend>
                                <span class="input-label">密码</span>
                            </template>
                        </el-input>
                    </el-form-item>

                    <!-- 记住我和忘记密码 -->
                    <div class="login-options">
                        <el-checkbox v-model="rememberMe" label="记住我" size="large" />
                        <a
                            href="javascript:void(0)"
                            class="forgot-password"
                            @click="showForgotDialog"
                        >
                            忘记密码?
                        </a>
                    </div>

                    <!-- 登录按钮 -->
                    <el-form-item>
                        <el-button
                            type="primary"
                            size="large"
                            class="login-button"
                            :loading="loading"
                            @click="handleLogin"
                        >
                            {{ loading ? '登录中...' : '立即登录' }}
                        </el-button>
                    </el-form-item>

                    <!-- 第三方登录选项 -->
                    <div class="divider">
                        <span class="divider-text">其他登录方式</span>
                    </div>

                    <div class="social-login">
                        <el-button
                            circle
                            size="large"
                            class="social-button wechat"
                            @click="socialLogin('wechat')"
                        >
                            <i class="el-icon-chat-dot-round"></i>
                        </el-button>
                        <el-button
                            circle
                            size="large"
                            class="social-button github"
                            @click="socialLogin('github')"
                        >
                            <i class="el-icon-s-platform"></i>
                        </el-button>
                        <el-button
                            circle
                            size="large"
                            class="social-button qq"
                            @click="socialLogin('qq')"
                        >
                            <i class="el-icon-chat-line-round"></i>
                        </el-button>
                    </div>

                    <!-- 注册链接 -->
                    <div class="register-link">
                        还没有账号？
                        <a href="javascript:void(0)" @click="showRegisterDialog">立即注册</a>
                    </div>
                </el-form>
            </div>

            <!-- 底部信息 -->
            <div class="footer">
                <p>该页面由deepseek完成绘制</p>
            </div>
        </div>

        <!-- 忘记密码对话框 -->
        <el-dialog v-model="forgotDialogVisible" title="找回密码" width="400px" center>
            <el-form ref="forgotFormRef" :model="forgotForm" :rules="forgotRules">
                <el-form-item prop="email">
                    <el-input
                        v-model="forgotForm.email"
                        placeholder="请输入注册邮箱"
                        :prefix-icon="Message"
                    />
                </el-form-item>
                <el-form-item prop="captcha">
                    <div class="captcha-input">
                        <el-input
                            v-model="forgotForm.captcha"
                            placeholder="请输入验证码"
                            :prefix-icon="Key"
                        />
                        <el-button
                            type="primary"
                            class="captcha-btn"
                            :disabled="captchaCooldown > 0"
                            @click="sendCaptcha"
                        >
                            {{ captchaCooldown > 0 ? `${captchaCooldown}秒后重试` : '获取验证码' }}
                        </el-button>
                    </div>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="forgotDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleForgotPassword">提交</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 注册对话框 -->
        <el-dialog v-model="registerDialogVisible" title="注册新账号" width="500px" center>
            <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules">
                <el-form-item prop="username">
                    <el-input
                        v-model="registerForm.username"
                        placeholder="请输入用户名"
                        :prefix-icon="User"
                    />
                </el-form-item>
                <el-form-item prop="email">
                    <el-input
                        v-model="registerForm.email"
                        placeholder="请输入邮箱"
                        :prefix-icon="Message"
                    />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        v-model="registerForm.password"
                        type="password"
                        placeholder="请输入密码"
                        :prefix-icon="Lock"
                        show-password
                    />
                </el-form-item>
                <el-form-item prop="confirmPassword">
                    <el-input
                        v-model="registerForm.confirmPassword"
                        type="password"
                        placeholder="请确认密码"
                        :prefix-icon="Lock"
                        show-password
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="registerDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleRegister">注册</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { User, Lock, Message, Key } from '@element-plus/icons-vue';
import { useMenuStore } from '@/stores/useMenuStore';
import { routeConfig } from '@/router/route';
import { useRouter } from 'vue-router';

const store = useMenuStore();
const router = useRouter();

// 响应式数据
const loginFormRef = ref();
const forgotFormRef = ref();
const registerFormRef = ref();

const loginForm = reactive({
    username: '1111111',
    password: '1111111'
});

const forgotForm = reactive({
    email: '',
    captcha: ''
});

const registerForm = reactive({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
});

const rememberMe = ref(false);
const loading = ref(false);
const forgotDialogVisible = ref(false);
const registerDialogVisible = ref(false);
const captchaCooldown = ref(0);

// 表单验证规则
const validateUsername = (rule, value, callback) => {
    if (!value) {
        callback(new Error('请输入账号'));
    } else if (value.length < 3) {
        callback(new Error('账号长度不能小于3位'));
    } else {
        callback();
    }
};

const validatePassword = (rule, value, callback) => {
    if (!value) {
        callback(new Error('请输入密码'));
    } else if (value.length < 6) {
        callback(new Error('密码长度不能小于6位'));
    } else {
        callback();
    }
};

const validateEmail = (rule, value, callback) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
        callback(new Error('请输入邮箱'));
    } else if (!emailRegex.test(value)) {
        callback(new Error('邮箱格式不正确'));
    } else {
        callback();
    }
};

const validateConfirmPassword = (rule, value, callback) => {
    if (!value) {
        callback(new Error('请确认密码'));
    } else if (value !== registerForm.password) {
        callback(new Error('两次输入密码不一致'));
    } else {
        callback();
    }
};

const loginRules = reactive({
    username: [{ validator: validateUsername, trigger: 'blur' }],
    password: [{ validator: validatePassword, trigger: 'blur' }]
});

const forgotRules = reactive({
    email: [{ validator: validateEmail, trigger: 'blur' }],
    captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
});

const registerRules = reactive({
    username: [{ validator: validateUsername, trigger: 'blur' }],
    email: [{ validator: validateEmail, trigger: 'blur' }],
    password: [{ validator: validatePassword, trigger: 'blur' }],
    confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
});

// 页面加载时检查本地存储的登录信息
onMounted(() => {
    const savedUsername = localStorage.getItem('savedUsername');
    if (savedUsername) {
        loginForm.username = savedUsername;
        rememberMe.value = true;
    }
});

// 登录处理
const handleLogin = async () => {
    if (!loginFormRef.value) return;

    try {
        await loginFormRef.value.validate();
        loading.value = true;

        // 模拟API请求延迟
        setTimeout(() => {
            // 在实际项目中，这里应该调用登录API
            console.log('登录信息:', loginForm);

            // 如果勾选了"记住我"，保存用户名到本地存储
            if (rememberMe.value) {
                localStorage.setItem('savedUsername', loginForm.username);
            } else {
                localStorage.removeItem('savedUsername');
            }

            sessionStorage.setItem('token', '1123');
            store.$patch((state) => {
                state.menu = routeConfig;
                state.isNeedUpdate = true;
                state.refreshMenu = true;
            });

            ElMessage.success('登录成功！');
            loading.value = false;

            // 实际项目中这里会跳转到首页
            router.push('/');
        }, 500);
    } catch (error) {
        console.log('表单验证失败', error);
        loading.value = false;
    }
};

// 显示忘记密码对话框
const showForgotDialog = () => {
    forgotDialogVisible.value = true;
    // 重置表单
    if (forgotFormRef.value) {
        forgotFormRef.value.resetFields();
    }
};

// 显示注册对话框
const showRegisterDialog = () => {
    registerDialogVisible.value = true;
    // 重置表单
    if (registerFormRef.value) {
        registerFormRef.value.resetFields();
    }
};

// 发送验证码
const sendCaptcha = () => {
    if (!forgotForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotForm.email)) {
        ElMessage.warning('请输入正确的邮箱地址');
        return;
    }

    // 模拟发送验证码
    captchaCooldown.value = 60;
    const timer = setInterval(() => {
        captchaCooldown.value -= 1;
        if (captchaCooldown.value <= 0) {
            clearInterval(timer);
        }
    }, 1000);

    ElMessage.success(`验证码已发送到 ${forgotForm.email}`);
};

// 处理忘记密码
const handleForgotPassword = async () => {
    if (!forgotFormRef.value) return;

    try {
        await forgotFormRef.value.validate();

        // 模拟API请求
        setTimeout(() => {
            ElMessage.success('重置密码链接已发送到您的邮箱，请查收');
            forgotDialogVisible.value = false;
        }, 1000);
    } catch (error) {
        console.log('表单验证失败', error);
    }
};

// 处理注册
const handleRegister = async () => {
    if (!registerFormRef.value) return;

    try {
        await registerFormRef.value.validate();

        // 模拟API请求
        setTimeout(() => {
            ElMessage.success('注册成功！请登录');
            registerDialogVisible.value = false;
        }, 1000);
    } catch (error) {
        console.log('表单验证失败', error);
    }
};

// 第三方登录
const socialLogin = (type) => {
    const socialNames = {
        wechat: '微信',
        github: 'GitHub',
        qq: 'QQ'
    };

    ElMessageBox.confirm(
        `即将跳转到${socialNames[type]}授权页面，是否继续？`,
        `${socialNames[type]}登录`,
        {
            confirmButtonText: '继续',
            cancelButtonText: '取消',
            type: 'info'
        }
    )
        .then(() => {
            ElMessage.info(`正在跳转${socialNames[type]}登录...`);
            // 实际项目中这里会跳转到第三方授权页面
        })
        .catch(() => {
            // 用户取消
        });
};
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    position: relative;
    overflow: hidden;
    padding: 20px;
}

.login-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
}

.background-shapes {
    position: relative;
    width: 100%;
    height: 100%;
}

.shape {
    position: absolute;
    border-radius: 50%;
    background: rgba(64, 158, 255, 0.1);
}

.shape-1 {
    width: 300px;
    height: 300px;
    top: -150px;
    right: -100px;
}

.shape-2 {
    width: 200px;
    height: 200px;
    bottom: 100px;
    left: -50px;
    background: rgba(103, 194, 58, 0.1);
}

.shape-3 {
    width: 150px;
    height: 150px;
    bottom: -50px;
    right: 20%;
    background: rgba(245, 108, 108, 0.1);
}

.login-wrapper {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 420px;
}

.login-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    padding: 40px 35px;
    transition:
        transform 0.3s,
        box-shadow 0.3s;
}

.login-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.12);
}

.login-header {
    text-align: center;
    margin-bottom: 30px;
}

.logo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    color: #409eff;
}

.logo i {
    font-size: 28px;
    margin-right: 10px;
}

.app-name {
    font-size: 18px;
    font-weight: 600;
}

.title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #333;
}

.subtitle {
    color: #909399;
    font-size: 14px;
    margin-top: 0;
}

.login-form {
    margin-top: 20px;
}

.input-label {
    width: 50px;
    font-size: 14px;
    color: #606266;
}

.login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.forgot-password {
    color: #409eff;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.2s;
}

.forgot-password:hover {
    color: #66b1ff;
    text-decoration: underline;
}

.login-button {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 8px;
    background: linear-gradient(90deg, #409eff, #66b1ff);
    border: none;
    transition: all 0.3s;
}

.login-button:hover {
    background: linear-gradient(90deg, #66b1ff, #409eff);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(64, 158, 255, 0.3);
}

.divider {
    display: flex;
    align-items: center;
    margin: 25px 0;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e4e7ed;
}

.divider-text {
    padding: 0 15px;
    color: #909399;
    font-size: 14px;
}

.social-login {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 25px;
}

.social-button {
    width: 48px;
    height: 48px;
    font-size: 20px;
    border: 1px solid #e4e7ed;
    background: white;
    transition: all 0.3s;
}

.social-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.social-button.wechat:hover {
    color: #07c160;
    border-color: #07c160;
}

.social-button.github:hover {
    color: #333;
    border-color: #333;
}

.social-button.qq:hover {
    color: #12b7f5;
    border-color: #12b7f5;
}

.register-link {
    text-align: center;
    color: #606266;
    font-size: 14px;
}

.register-link a {
    color: #409eff;
    text-decoration: none;
    font-weight: 500;
    margin-left: 5px;
    transition: color 0.2s;
}

.register-link a:hover {
    color: #66b1ff;
    text-decoration: underline;
}

.footer {
    margin-top: 30px;
    text-align: center;
    color: #909399;
    font-size: 12px;
}

.footer p {
    margin: 0;
}

.captcha-input {
    display: flex;
    gap: 10px;
}

.captcha-btn {
    white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .login-card {
        padding: 30px 25px;
    }

    .login-wrapper {
        max-width: 90%;
    }
}
</style>
