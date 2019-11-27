<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/logo.png" alt="icon">
        <span>电商后台管理系统</span>
      </div>
      <el-button @click="outLogin">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse? '64px': '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          router
          :unique-opened="false"
          :collapse="isCollapse"
          :default-active="activePath"
          collapse-transition
          background-color="#333744"
          text-color="#fff"
          active-text-color="#408eff">
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNameState('/' + subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
      </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
      menuList: [],
      isCollapse: false,
      activePath: ''
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('homePath')
  },
  methods: {
    outLogin () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    saveNameState (pathName) {
      this.activePath = window.sessionStorage.setItem('homePath', pathName)
    }
  }
}
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }
  .el-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #373d41;
    color: #fff;
    padding-left: 0;
    div {
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        width: 50px;
        margin-left: 10px;
        margin-right: 20px;
      }
    }
  }
  .el-aside {
    background-color: #333744;
  }
  .el-menu {
    border-right: none;
  }
  .el-main {
    background-color: #ddd;
  }
  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    letter-spacing: .2rem;
    text-align: center;
    cursor: pointer;
    width: 100%;
  }
</style>
