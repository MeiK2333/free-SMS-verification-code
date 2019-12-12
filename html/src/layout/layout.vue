<template>
  <div class="layout">
    <el-container>
      <el-header>
        <el-menu
          :default-active="activeIndex"
          class="el-menu-demo"
          mode="horizontal"
          :router="true"
        >
          <el-menu-item index="/">Index</el-menu-item>
          <el-menu-item index="/404">404</el-menu-item>
        </el-menu>
      </el-header>
      <el-main>
        <slot></slot>
      </el-main>
      <el-footer>
        © 2019 Power by
        <a
          href="https://github.com/MeiK2333/free-SMS-verification-code"
        >free-SMS-verification-code</a>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "Layout",
  methods: {
  }
};
</script>

<style>
</style>