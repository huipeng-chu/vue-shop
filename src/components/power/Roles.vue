<template>
  <div>
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary">添加角色</el-button>
      <el-table
        border
        stripe
        :data="rolesList">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['vCenter', 'border-bottom', i1 === 0? 'border-top': '' ]" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row :class="['vCenter', i2 === 0? '' :'border-top' ]" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" closable v-for="(item3) in item2.children" :key="item3.id" @close="removeRightById(scope.row, item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column prop="level" label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showModifyDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteUser(scope.row.id)">删除</el-button>
            <el-button type="warning" size="mini" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog
      title="配置权限"
      :visible.sync="dialogVisible"
      width="40%"
      @close="clearTreeData">
      <el-tree
        :data="rightsListData"
        show-checkbox
        node-key="id"
        :default-checked-keys="defKeys"
        default-expand-all
        :props="treeProps"
        ref="treeRef">
      </el-tree>
      <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="setRights">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data () {
    return {
      rolesList: [],
      dialogVisible: false,
      rightsListData: [],
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      defKeys: [],
      currentModelRoleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取用户权限列表失败')
      this.rolesList = res.data
    },
    async removeRightById (role, id) {
      const result = await this.$confirm('确定删除该用户下的该权限吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      console.log('result' + result)
      if (result === 'confirm') {
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除该权限失败')
        this.$message.success('删除该权限成功')
        role.children = res.data
      } else {
        this.$message.info('您取消了该删除操作')
      }
    },
    showSetRightDialog (role) {
      this.getRights()
      this.getLeafKeys(role, this.defKeys)
      this.currentModelRoleId = role.id
      this.dialogVisible = true
    },
    async getRights () {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('请求权限列表失败')
      this.rightsListData = res.data
    },
    // 通过递归获取所有三级列表的所有id
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    clearTreeData () {
      this.defKeys = []
    },
    async setRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const strKeys = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.currentModelRoleId}/rights`, { 'rids': strKeys })
      if (res.meta.status !== 200) this.$message.error('定义用户权限失败')
      this.$message.success('定义权限列表成功')
      this.dialogVisible = false
      this.getRolesList()
    }
  }
}
</script>

<style lang="less" scoped>
.border-top {
  border-top: 1px solid #eee;
}
.border-bottom {
  border-bottom: 1px solid #eee;
}
.el-tag {
  margin: 7px;
}
.vCenter {
  display: flex;
  align-items: center;
}
</style>
