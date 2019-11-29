<template>
    <div>
      <el-breadcrumb separator=">">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input placeholder="请输入内容" class="input-with-select" v-model="queryInfo.query" @clear="clearTable" clearable>
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="addUser">添加用户</el-button>
          </el-col>
        </el-row>
        <el-table
          border
          stripe
          :data="userList">
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="username" label="姓名"></el-table-column>
          <el-table-column prop="email" label="邮箱"></el-table-column>
          <el-table-column prop="mobile" label="电话"></el-table-column>
          <el-table-column prop="role_name" label="角色"></el-table-column>
          <el-table-column label="状态">
            <template slot-scope="scope">
              <el-switch
                @change="userStateChange(scope.row)"
                v-model="scope.row.mg_state"
                active-color="#13ce66"
                inactive-color="#ff4949">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180px">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" icon="el-icon-edit" @click="showModifyDialog(scope.row.id)"></el-button>
              <el-button type="primary" size="mini" icon="el-icon-delete" @click="deleteUser(scope.row.id)"></el-button>
              <el-tooltip class="item" effect="dark" content="角色权限配置" placement="top" :enterable="false">
                <el-button type="primary" size="mini" icon="el-icon-setting" @click="showRightsDialog(scope.row)">
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[2, 5, 10, 15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-card>
      <el-dialog
        @close="clearAddForm"
        title="添加用户"
        :visible.sync="dialogVisible"
        width="40%">
        <el-form ref="addFormRef" :rules="addFormRules" :model="addForm" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUserData">确 定</el-button>
        </span>
      </el-dialog>
      <el-dialog
        title="修改用户信息"
        :visible.sync="modifyDialogVisible"
        width="40%">
        <el-form ref="modifyFormRef" :rules="modifyFormRules" :model="modifyForm" label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="modifyForm.username" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="modifyForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="modifyForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="modifyDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="modifyUserData">确 定</el-button>
        </span>
      </el-dialog>
      <el-dialog
        @close="clearSelectRole"
        title="角色权限分配"
        :visible.sync="rightsDialogVisible"
        width="40%">
        <p>当前用户： {{userInfo.username}}</p>
        <p>当前角色： {{userInfo.role_name}}</p>
        <p>
          分配新的角色
          <el-select v-model="selectRoleId" placeholder="分配角色">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
        <span slot="footer" class="dialog-footer">
          <el-button @click="rightsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'User',
  data () {
    var checkEmial = (rules, value, callback) => {
      const regEmail = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (regEmail.test(value) || value == '') return callback() //eslint-disable-line
      callback(new Error('请输入合法的邮箱'))
    }
    var checkMobile = (rules, value, callback) => {
      const regMobile = /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/
      if (regMobile.test(value) || value == '') return callback() //eslint-disable-line
      callback(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表的参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      modifyForm: {
        username: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名的长度在3-10之前', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 10, message: '用户名的长度在6-10位', trigger: 'blur' }
        ],
        email: [
          { validator: checkEmial, trigger: 'blur' }
        ],
        mobile: [
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      modifyFormRules: {
        email: [
          { validator: checkEmial, trigger: 'blur' }
        ],
        mobile: [
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      dialogVisible: false,
      modifyDialogVisible: false,
      rightsDialogVisible: false,
      userInfo: {
        id: '',
        username: '',
        role_name: ''
      },
      selectRoleId: '',
      rolesList: []
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', { 'params': this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.userList = res.data.users
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    async userStateChange (userInfo) {
      const { id, mg_state: state } = userInfo
      const { data: res } = await this.$http.put(`users/${id}/state/${state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        this.$message.error('修改用户状态失败')
      }
      this.$message.success(res.meta.msg)
    },
    clearTable () {
      this.getUserList()
    },
    clearAddForm () {
      this.$refs.addFormRef.resetFields()
    },
    addUser () {
      this.dialogVisible = true
    },
    addUserData () {
      this.$refs.addFormRef.validate(async (validate) => {
        if (!validate) return
        const { data: res } = await this.$http.post('users', this.addForm)
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('创建用户失败')
        } else {
          this.dialogVisible = false
          this.$message.success(res.meta.msg)
          this.getUserList()
        }
      })
    },
    async showModifyDialog (id) {
      console.log(id)
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.modifyForm = res.data
      this.modifyDialogVisible = true
    },
    async modifyUserData () {
      this.$refs.modifyFormRef.validate(async (validate) => {
        if (!validate) return
        const { id, email, mobile } = this.modifyForm
        const { data: res } = await this.$http.put(`users/${this.modifyForm.id}`, { 'id': id, 'email': email, 'mobile': mobile
        })
        if (res.meta.status !== 200) return this.$message.error('修改信息失败')
        this.$message.success(res.meta.msg)
        this.modifyDialogVisible = false
        this.getUserList()
      })
    },
    async deleteUser (id) {
      const confirmResult = await this.$confirm('确定删除该用户吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        this.$message.info('已取消删除')
      } else {
        const { data: res } = await this.$http.delete(`users/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除用户失败') //eslint-disable-line
        this.$message.success(res.meta.msg)
        this.getUserList()
      }
    },
    async showRightsDialog (rights) {
      this.rightsDialogVisible = true
      this.userInfo.username = rights.username
      this.userInfo.role_name = rights.role_name
      this.userInfo.id = rights.id
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      this.modifyForm = res.data
    },
    async saveRoleInfo () {
      if (!this.selectRoleId) {
        return this.$message.info('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { 'rid': this.selectRoleId })
      if (res.meta.status !== 200) return this.$message.error('更新角色失败') //eslint-disable-line
      this.$message.success(res.meta.msg)
      this.getUserList()
      this.rightsDialogVisible = false
    },
    clearSelectRole () {
      this.selectRoleId = ''
    }
  }
}
</script>

<style lang="less" scoped>
</style>
