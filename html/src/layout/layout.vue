<template>
  <div class="layout">
    <el-container>
      <el-header>
        <router-link :to="{ path: '/' }">Index</router-link>&nbsp;
        <router-link :to="{ path: '/404' }">404</router-link>
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
  name: "Layout"
};
</script>

<style>
</style>