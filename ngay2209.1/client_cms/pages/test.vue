<template>
  <v-container fluid class="pa-6">
    <v-card class="pa-6 rounded-lg elevation-1">
      <h1 class="text-h5 font-weight-bold grey--text text--darken-3 mb-4">
        Trang kiểm thử UI (FE Only)
      </h1>
      <p class="body-2 grey--text text--darken-1 mb-6">
        Dùng để test giao diện Vuetify, hiệu ứng Loading từ Store và các nút bấm chức năng.
      </p>

      <v-divider class="mb-6" />

      <!-- Test Buttons & Loading -->
      <div class="mb-6">
        <h2 class="text-subtitle-1 font-weight-bold mb-3">1. Test Loading Store & Toast</h2>
        <v-btn color="#a2212b" dark class="mr-2 text-capitalize" @click="testLoading">
          Thử hiệu ứng Loading (2s)
        </v-btn>
        <v-btn color="success" class="text-capitalize" @click="testToast">
          Thử Toast thành công
        </v-btn>
      </div>

      <!-- Test Table UI -->
      <div>
        <h2 class="text-subtitle-1 font-weight-bold mb-3">2. Test Table Mock Data</h2>
        <v-data-table
          :headers="headers"
          :items="mockData"
          class="elevation-1 rounded-lg"
          hide-default-footer
        >
          <template #[`item.status`]="{ item }">
            <v-chip
              small
              :color="item.status === 'Hoạt động' ? 'success' : 'error'"
              text-color="white"
            >
              {{ item.status }}
            </v-chip>
          </template>
        </v-data-table>
      </div>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'TestPage',
  data() {
    return {
      headers: [
        { text: 'STT', value: 'stt', width: '80px' },
        { text: 'Tên chức năng', value: 'name' },
        { text: 'Trạng thái', value: 'status', width: '150px' }
      ],
      mockData: [
        { stt: 1, name: 'Quản lý người dùng', status: 'Hoạt động' },
        { stt: 2, name: 'Quản lý nhóm quyền', status: 'Hoạt động' },
        { stt: 3, name: 'Cấu hình email', status: 'Khóa' }
      ]
    }
  },
  mounted() {
    // Set tiêu đề trang lên Store
    this.$store.commit('SET_PAGE_TITLE', 'Trang kiểm thử')
  },
  methods: {
    testLoading() {
      this.$store.commit('SET_LOADING', true)
      setTimeout(() => {
        this.$store.commit('SET_LOADING', false)
      }, 2000)
    },
    testToast() {
      if (typeof this.$showSuccess === 'function') {
        this.$showSuccess('Toast hoạt động bình thường!')
      } else {
        alert('Toast thành công!')
      }
    }
  }
}
</script>