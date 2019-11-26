<template>
    <div>
      <el-container>
        <el-header>
          <el-button @click="outLogin">退出</el-button>
        </el-header>
        <el-container>
          <el-aside width="200px">Aside</el-aside>
          <el-main>Main</el-main>
        </el-container>
      </el-container>
    </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    outLogin () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
