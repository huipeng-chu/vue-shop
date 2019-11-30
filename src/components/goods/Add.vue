<template>
  <div>
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        title="添加商品信息"
        type="info"
        show-icon
        center
        :closable="false">
      </el-alert>
      <el-steps :active="activeIndex - 0" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-position="top">
        <el-tabs tab-position="left"
          v-model="activeIndex"
          :before-leave="beforeTabsLeaves"
          @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_number">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cascaderProps"
                @change="handleCateChanged"
              >
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="val" v-for="(val, index) in item.attr_vals" :key="index" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :headers="headerObj"
              :on-success="uploadSuccess"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
<!--              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>-->
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor
              v-model="addForm.goods_introduce">
            </quill-editor>
            <el-button type="primary" class="add-btn" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog
      title="图片预览"
      :visible.sync="dialogVisible"
      width="40%">
      <img :src="previewPath" alt="上传预览">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'Add',
  data () {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [1, 3, 6],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      cateList: [],
      selectKeys: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      manyTableData: [],
      onlyTableData: [],
      headerObj: {
        'authorization': window.sessionStorage.getItem('token')
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品数量', trigger: 'blur' }
        ]
      },
      previewPath: '',
      dialogVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.cateList = res.data
    },
    handleCateChanged () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTabsLeaves (activeName, oldActiveName) {
      if (activeName !== '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.info('请选择商品分类后进去其他标签页')
        return false
      }
      return true
    },
    async getParamsData () {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: 'many' }
      })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取动态参数列表失败')
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals.length !== 0 ? item.attr_vals.split(' ') : []
      })
      this.manyTableData = res.data
    },
    async getAttrsData () {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: 'only' }
      })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取静态属性失败')
      this.onlyTableData = res.data
    },
    tabClicked () {
      console.log(this.activeIndex)
      if (this.activeIndex === '1') {
        this.getParamsData()
      } else if (this.activeIndex === '2') {
        this.getAttrsData()
      }
    },
    uploadSuccess (response, file, fileList) {
      // 1.先拼接得到一个图片信息对象
      // 2.将图片信息对象 push 到 pics数组中
      const info = { pic: response.data.temp_path }
      this.addForm.pics.push(info)
    },
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.dialogVisible = true
    },
    handleRemove (file) {
      console.log('进入')
      // 获取图片将要删除的临时路径
      const filePath = file.response.data.temp_path
      // 在pics找到该图片的索引值
      const index = this.addForm.pics.push(item => {
        item.pic === filePath //eslint-disable-line
      })
      console.log(index)
      // 使用splice删除
      this.addForm.pics.splice(index, 1)
    },
    add () {
      console.log(this.addForm)
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.info('请填写必要的表单项')
        }
        const form = _.cloneDeep(this.addForm)
        console.log(form)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数 / 静态属性
        console.log(this.manyTableData)
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        const { data: res } = await this.$http.post('goods', form)
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败')
        this.$message.error('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style scoped>
  .el-tabs {
    margin: 50px 0;
  }
  .el-checkbox {
    margin: 0 5px 0 0 !important;
  }
  .add-btn {
    margin-top: 15px;
  }
</style>
