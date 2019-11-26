<template>
    <div class="login-container">
      <div class="login-box">
        <div class="avatar_box">
          <img src="../assets/logo.png" alt="vue logo">
        </div>
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" class="login-form">
          <el-form-item prop="username">
            <el-input type="text" v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" v-model="loginForm.password" prefix-icon="el-icon-lock"></el-input>
          </el-form-item>
          <el-form-item>
            <div class="btn-list">
              <el-button type="primary" @click="login">登录</el-button>
              <el-button type="info" @click="resetLoginForm">重置</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
</template>

<script>
export default {
  name: 'login',
  data () {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '用户名长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 12, message: '用户名长度在 6 到 12 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')
        // 登录成功之后的token 保存在客户端的sessionStorage
        // 项目中除了登录之外的其他api接口，必须在登录之后才能访问
        // token 只应在当前网站打开生效，所以将token保存在sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        // 通过编程式导航跳转到后台主页 路由地址是 /home
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .login-container {
    background-color: #2b6b4b;
    height: 100%;
    .login-box {
      width: 450px;
      height: 300px;
      background: #fff;
      border: 3px;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      .avatar_box {
        width: 130px;
        height: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px #ddd;
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        img {
          width: 100%;
          border-radius: 50%;
          background: #eee;
        }
      }
    }
    .login-form {
      width: 100%;
      position: absolute;
      bottom: 0;
      padding: 0 20px;
      box-sizing: border-box;
    }
    .btn-list {
      display: flex;
      justify-content: flex-end;
    }
  }
</style>
