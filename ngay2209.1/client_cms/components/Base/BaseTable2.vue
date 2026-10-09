<template>
  <div class="base-table-container">
    <v-data-table
      v-bind="$attrs"
      v-on="$listeners"
      :headers="headers"
      :items="items"
      :options.sync="tableOptions"
      mobile-breakpoint="600"
      class="custom-base-table"
    >
      <!-- Truyền toàn bộ scoped slots từ trang cha sang bảng chính an toàn tuyệt đối -->
      <template v-for="slotName in Object.keys($scopedSlots)" #[slotName]="slotData">
        <slot :name="slotName" v-bind="slotData || {}"></slot>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  name: 'BaseTable',
  props: {
    headers: { type: Array, required: true, default: () => [] },
    items: { type: Array, required: true, default: () => [] },
    options: { type: Object, default: () => ({}) }
  },
  computed: {
    tableOptions: {
      get() {
        return this.options
      },
      set(val) {
        this.$emit('update:options', val)
      }
    }
  }
}
</script>

<style scoped>
.base-table-container {
  width: 100%;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

/* Đảm bảo bảng có chiều rộng tối thiểu khi xem trên desktop để không bị co cụt nội dung */
.custom-base-table >>> table {
  min-width: 1450px !important;
}

/* Cố định Header dính ở trên khi cuộn dọc */
.custom-base-table >>> th {
  background-color: #f8f9fa !important;
  font-weight: bold !important;
  color: #333 !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 2 !important;
  box-shadow: 0 1px 0 #e0e0e0 !important;
  white-space: nowrap;
}

/* Kích hoạt thanh cuộn ngang/dọc cho màn hình lớn */
@media (min-width: 600px) {
  .custom-base-table >>> .v-data-table__wrapper {
    max-height: 55vh !important;
    overflow-y: auto !important;
    overflow-x: auto !important;
    pointer-events: auto !important;
  }
}

/* Tùy chỉnh hiển thị đẹp trên Mobile theo chuẩn Vuetify */
@media (max-width: 599px) {
  .base-table-container {
    border: none !important;
    background: transparent !important;
  }
  .custom-base-table >>> table {
    min-width: 100% !important;
  }
  .custom-base-table >>> .v-data-table__mobile-row {
    display: flex !important;
    justify-content: space-between !important;
    align-items: flex-start !important;
    padding: 10px 16px !important;
    background-color: #fff;
    border-bottom: 1px solid #eee;
    margin-bottom: 8px;
    border-radius: 4px;
  }
  .custom-base-table >>> .v-data-table__mobile-row__header {
    font-weight: 600 !important;
    color: #333 !important;
  }
}

/* Tùy chỉnh thanh cuộn đẹp mắt */
.custom-base-table >>> .v-data-table__wrapper::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
.custom-base-table >>> .v-data-table__wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-base-table >>> .v-data-table__wrapper::-webkit-scrollbar-thumb {
  background: #a2212b;
  border-radius: 4px;
}
</style>