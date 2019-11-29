<template>
  <div>
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCategory">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table
        stripe
        border
        :expand-type="false"
        :selection-type="false"
        :data="categoryList"
        :columns="columns"
        :show-index="true"
        index-text="#">
        <template slot="isOk" slot-scope="scope">
          <i v-if="scope.row.cat_deleted === false"
             class="el-icon-success" style="color:lightgreen">
          </i>
          <i v-else class="el-icon-error"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag type="success" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="error" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <template slot="setting">
          <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
          <el-button type="warning" size="mini" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <el-dialog
      modal-append-to-body
      @close="clearAddForm"
      title="添加分类"
      :visible.sync="dialogVisible"
      width="40%">
      <el-form ref="addFormRef" :rules="addFormRules" :model="addForm" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
            <el-cascader
              v-model="selectKeys"
              :options="parentCategoryList"
              :props="cascaderProps"
              @change="parentCateChanged"
              >
            </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCategoryData">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'category',
  data () {
    return {
      addForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      dialogVisible: false,
      queryInfo: {
        type: '',
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      categoryList: [],
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          type: 'template',
          template: 'isOk'
        },
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'setting'
        }
      ],
      addFormRules: {
        cat_name: [
          { required: true, message: '请输入该层级的分类名称', trigger: 'blur' }
        ]
      },
      parentCategoryList: [],
      selectKeys: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      }
    }
  },
  created () {
    this.getCategoryList()
  },
  methods: {
    async getCategoryList () {
      const { data: res } = await this.$http.get('categories', { 'params': this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败')
      this.categoryList = res.data.result
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCategoryList()
    },
    handleCurrentChange (newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getCategoryList()
    },
    addCategory () {
      this.dialogVisible = true
      this.getParentCateList()
    },
    addCategoryData () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.dialogVisible = false
        this.getParentCateList()
      })
    },
    clearAddForm () {
      this.$refs.addFormRef.resetFields()
      this.selectKeys = []
      this.addForm.cat_level = 0
      this.addForm.cat_pid = 0
    },
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { 'params': { type: 2 } })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取父级分类层级失败')
      // this.modifyTreeData(res.data)
      this.parentCategoryList = res.data
    },
    parentCateChanged () {
      console.log(this.selectKeys)
      if (this.selectKeys.length > 0) {
        this.addForm.cat_pid = this.selectKeys[this.selectKeys.length - 1]
        this.addForm.cat_level = this.selectKeys.length
      } else {
        this.addForm.cat_pid = 0
        this.addForm.cat_level = 0
      }
    }
    // 递归判断列表，把最后的children设为undefined
    // modifyTreeData (data) {
    //   for (var i = 0; i < data.length; i++) {
    //     if (!data[i].hasOwnProperty('children') || data[i].children.length < 1) {
    //       // children若为空数组，则将children设为undefined
    //       data[i].children = undefined
    //     } else {
    //       // children若不为空数组，则继续 递归调用 本方法
    //       this.modifyTreeData(data[i].children)
    //     }
    //   }
    //   this.parentCategoryList = data
    // }
  }
}
</script>

<style scoped>
  .zk-table {
    margin-top: 20px;
  }
  .el-cascader {
    width: 100%;
  }
</style>
