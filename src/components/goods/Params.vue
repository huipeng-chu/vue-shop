<template>
  <div>
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        title="注意: 只允许为第三级分类设置相关参数！"
        type="warning"
        show-icon>
      </el-alert>
      <el-row>
        <el-col>
          <span>选择商品分类: </span>
          <el-cascader
            v-model="selectKeys"
            :options="categoryList"
            :props="cascaderProps"
            @change="handleChange"
          >
          </el-cascader>
          </el-col>
      </el-row>
      <el-tabs v-model="currentTabName" @tab-click="toggleTabs">
          <el-tab-pane label="动态参数" name="many">
            <el-button type="primary" :disabled=isBtnDisable @click="showAddAttr">添加参数</el-button>
            <el-table
              border
              stripe
              :data="manyTableDate">
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag v-for="(item, index)  in scope.row.attr_vals" :key="index"
                    closable
                    type="primary"
                    @close="closeTag(scope.row, index)">
                    {{item}}
                  </el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    size="small"
                    ref="saveTagInput"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button v-else
                     class="button-new-tag"
                     size="small"
                     @click="showInput(scope.row)">
                    + New Tag
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column prop="attr_name" label="参数名称"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" size="mini" icon="el-icon-edit"
                             @click="showEditModal(scope.row.attr_id)">
                    编辑
                  </el-button>
                  <el-button type="warning" size="mini" icon="el-icon-delete"
                    @click="removeParams(scope.row.attr_id)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" :disabled=isBtnDisable
                       @click="showAddAttr">
              添加属性
            </el-button>
            <el-table
              border
              stripe
              :data="onlyTableDate">
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag v-for="(item, index)  in scope.row.attr_vals" :key="index"
                          closable
                          type="primary"
                          @close="closeTag(scope.row, index)">
                    {{item}}
                  </el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    size="small"
                    ref="saveTagInput"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button v-else
                             class="button-new-tag"
                             size="small"
                             @click="showInput(scope.row)">
                    + New Tag
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column prop="attr_name" label="参数名称"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" size="mini" icon="el-icon-edit"
                             @click="showEditModal(scope.row.attr_id)">
                    编辑
                  </el-button>
                  <el-button type="warning" size="mini" icon="el-icon-delete"
                       @click="removeParams(scope.row.attr_id)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
    </el-card>
    <el-dialog
      @close="clearAddForm"
      :title="'添加' + titleText"
      :visible.sync="dialogVisible"
      width="40%">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addAttrData">确 定</el-button>
        </span>
    </el-dialog>
    <el-dialog
      @close="clearEditForm"
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="40%">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editAttrData">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data () {
    return {
      selectKeys: [1, 3, 6],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      currentTabName: 'many',
      categoryList: [],
      manyTableDate: [],
      onlyTableDate: [],
      addForm: {
        attr_name: ''
      },
      editForm: {
        attr_id: '',
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请填写所添加的内容', trigger: 'blur' }
        ]
      },
      editFormRules: {
        attr_name: [
          { required: true, message: '请填写所添加的内容', trigger: 'blur' }
        ]
      },
      dialogVisible: false,
      editDialogVisible: false
    }
  },
  created () {
    this.getCategoryList()
  },
  methods: {
    async getCategoryList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败')
      this.categoryList = res.data
      // 多余
      this.getParamsData()
    },
    handleChange () {
      this.getParamsData()
    },
    toggleTabs () {
      this.getParamsData()
    },
    async getParamsData () {
      if (this.selectKeys.length !== 3) {
        this.selectKeys = []
        this.manyTableDate = []
        this.onlyTableDate = []
        return
      }
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.currentTabName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputValue = ''
        item.inputVisible = false
      })
      if (this.currentTabName === 'many') {
        this.manyTableDate = res.data
      } else {
        this.onlyTableDate = res.data
      }
    },
    showAddAttr () {
      this.dialogVisible = true
    },
    async showEditModal (attrId) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, {
        params: { attr_sel: this.currentTabName }
      })
      if (res.meta.status !== 200) return this.$message.error('获取属性名称失败')
      this.editForm.attr_name = res.data.attr_name
      this.editForm.attr_id = attrId
      this.editDialogVisible = true
    },
    addAttrData () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`,
          { attr_name: this.addForm.attr_name, attr_sel: this.currentTabName }
        )
        if (res.meta.status !== 201) return this.$message.error('添加参数失败')
        this.$message.success('添加参数成功')
        this.dialogVisible = false
        this.getParamsData()
      })
    },
    editAttrData () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.currentTabName })
        if (res.meta.status !== 200) return this.$message.error('添加参数失败')
        this.$message.success('添加参数成功')
        this.editDialogVisible = false
        this.getParamsData()
      })
    },
    clearAddForm () {
      this.$refs.addFormRef.resetFields()
    },
    clearEditForm () {
      this.$refs.editFormRef.resetFields()
    },
    async removeParams (attrId) {
      const confirmResult = await this.$confirm('确定删除该属性吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        this.$message.info('已取消删除')
      } else {
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
        if (res.meta.status !== 200) return this.$message.error('删除用户失败') //eslint-disable-line
        this.$message.success(res.meta.msg)
        this.getParamsData()
      }
    },
    async closeTag (row, index) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    },
    showInput (row) {
      row.inputVisible = true
      row.inputValue = ''
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm: async function (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    async saveAttrVals (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) return this.$message.error('添加参数失败')
      this.$message.success(res.meta.msg)
    }
  },
  computed: {
    isBtnDisable () {
      if (this.selectKeys.length === 3) {
        return false
      }
      return true
    },
    cateId () {
      if (this.selectKeys.length === 3) {
        return this.selectKeys[2]
      }
      return null
    },
    titleText () {
      if (this.currentTabName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
  .el-cascader-panel {
    height: 200px;
    overflow: hidden;
  }
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
