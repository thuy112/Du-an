<template>
  <div class="unit-training-page pa-3 pa-md-4 bg-white d-flex flex-column" :class="{ 'is-mobile-device': isMobileDevice }" style="height: calc(100vh - 70px); overflow: hidden;">
    
    <!-- THANH CHUYỂN TAB PHÍA TRÊN -->
    <div class="d-flex align-center tab-header-container mb-3 flex-shrink-0" style="gap: 20px; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px;">
      <div 
        class="tab-item font-weight-bold pb-2 cursor-pointer"
        :class="{ 'active-tab': activeTab === 1 }"
        @click="activeTab = 1"
      >
        Đơn Vị Công Tác Khoa/ Trường
      </div>
      <div 
        class="tab-item font-weight-bold pb-2 cursor-pointer"
        :class="{ 'active-tab': activeTab === 2 }"
        @click="activeTab = 2"
      >
        Địa Điểm Đào Tạo
      </div>
    </div>

    <!-- KHUNG CHỨA NỘI DUNG: Dùng v-if để khi bấm tab nào thì hiển thị độc lập tab đó -->
    <div class="flex-grow-1 d-flex flex-column" style="overflow: hidden; min-height: 0;">
      <!-- TAB 1: Đơn vị công tác -->
      <WorkUnitTab
        v-if="activeTab === 1"
        :status-list="statusList"
        @success="showSuccessToast"
        @add="handleAddWorkUnit"
        @edit="handleEditWorkUnit"
        @delete="handleDeleteWorkUnit"
      />

      <!-- TAB 2: Địa điểm đào tạo -->
      <TrainingUnitTab
        v-if="activeTab === 2"
        :status-list="statusList"
        @success="showSuccessToast"
        @add="handleAddTrainingUnit"
        @edit="handleEditTrainingUnit"
        @delete="handleDeleteTrainingUnit"
      />
    </div>

    <!-- THÔNG BÁO TOAST GÓC TRÊN BÊN PHẢI -->
    <v-snackbar
      v-model="snackbar.show"
      top
      right
      timeout="3000"
      color="#4caf50"
      elevation="4"
      class="custom-top-right-snackbar"
    >
      <div class="d-flex align-center justify-space-between" style="width: 100%;">
        <div class="d-flex align-center">
          <v-icon left dark class="mr-2">mdi-check-circle</v-icon>
          <span class="white--text font-weight-medium">{{ snackbar.text }}</span>
        </div>
      </div>
      <template #action="{ attrs }">
        <v-btn text dark v-bind="attrs" @click="snackbar.show = false"><v-icon small>mdi-close</v-icon></v-btn>
      </template>
      <v-progress-linear v-model="snackbar.progress" color="white" height="3" absolute bottom></v-progress-linear>
    </v-snackbar>
  </div>
</template>

<script>
import WorkUnitTab from '~/components/WorkUnitTab.vue'
import TrainingUnitTab from '~/components/TrainingUnitTab.vue'

export default {
  name: 'WorkAndTrainingUnitPage',
  components: { WorkUnitTab, TrainingUnitTab },
  data() {
    return {
      isMobileDevice: false,
      activeTab: 1, // Mặc định hiển thị Tab 1 (Đơn vị công tác)
      statusList: [
        { value: 'ACTIVE', text: 'Kích hoạt', color: '#a2212b' },
        { value: 'INACTIVE', text: 'Chưa kích hoạt', color: '#9e9e9e' }
      ],
      snackbar: { show: false, text: '', progress: 100, timer: null }
    }
  },
  mounted() {
    if (typeof navigator !== 'undefined') {
      this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
  },
  methods: {
    showSuccessToast(message) {
      this.snackbar.text = message
      this.snackbar.show = true
      this.snackbar.progress = 100
      clearInterval(this.snackbar.timer)
      const step = 100 / (3000 / 50)
      this.snackbar.timer = setInterval(() => {
        this.snackbar.progress -= step
        if (this.snackbar.progress <= 0) clearInterval(this.snackbar.timer)
      }, 50)
    },
    handleAddWorkUnit() {},
    handleEditWorkUnit(item) {},
    handleDeleteWorkUnit(item) {},

    handleAddTrainingUnit() {},
    handleEditTrainingUnit(item) {},
    handleDeleteTrainingUnit(item) {}
  }
}
</script>

<style scoped>
.bg-white { background-color: #ffffff !important; }
.tab-item {
  font-size: 16px;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  cursor: pointer;
}
.tab-item.active-tab {
  color: #A62229;
  border-bottom-color: #A62229;
}
.custom-top-right-snackbar {
  position: fixed !important;
  top: 20px !important;
  right: 20px !important;
  left: auto !important;
  bottom: auto !important;
  z-index: 9999 !important;
}
</style>