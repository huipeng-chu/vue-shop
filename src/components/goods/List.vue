<template>
  <div>
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8">
          <div>
            <el-input placeholder="请输入内容" v-model="queryInfo.query"
                      clearable @clear="getGoodsList">
              <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <el-button class="add-btn" type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table
        border
        stripe
        :data="goodsList">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="105px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="105px"></el-table-column>
        <el-table-column label="创建时间" width="200px">
          <template slot-scope="scope">
            {{scope.row.add_time | dataFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showModifyDialog(scope.row.id)"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteGoodsById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'List',
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 20
      },
      goodsList: [],
      total: 0
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      this.goodsList = res.data.goods
      this.total = res.data.total
      this.$message.success('获取商品列表成功')
    },
    goAddPage () {
      this.$router.push('/goods/add')
    },
    async deleteGoodsById (id) {
      const result = await this.$confirm('永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result !== 'confirm') {
        this.$message.info('已取消删除')
        return
      }
      const { data: res } = await this.$http.delete(`goods/${id}`)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除商品失败')
      this.$message.success('删除商品成功')
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    }
  }
}
</script>

<style lang="less" scoped>
.add-btn {
  margin-left: 15px;
}
</style>
