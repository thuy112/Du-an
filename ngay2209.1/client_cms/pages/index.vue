<template>
  <div class="text-center py-12">
    <!-- Hình ảnh Banner WELCOME (Ảnh 7)[cite: 7] -->
    <div class="welcome-banner mb-6">
      <img src="img/banner.jpg" height="200">
    </div>

    <!-- Dòng tiêu đề giới thiệu hệ thống[cite: 7] -->
    <h2 class="text-h5 font-weight-bold system-title">
      Hệ thống quản trị học lại, thi lại, bảo vệ lại
    </h2>
  </div>
</template>

<script>
export default {
  name: 'IndexPage'
}
</script>

<style scoped>
.welcome-banner {
  position: relative;
  display: inline-block;

}

.welcome-banner img {
  display: block;
  mix-blend-mode: multiply;
}

.system-title {
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 28px !important;
  font-weight: 700;
  color: #a2212b !important;
}
</style>