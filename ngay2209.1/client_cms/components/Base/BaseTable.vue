<template>
  <div class="base-table-container bg-white">
    <v-data-table
      v-bind="$attrs"
      v-on="$listeners"
      :headers="headers"
      :items="items"
      mobile-breakpoint="600"
      class="custom-table"
    >
      <template v-for="(_, name) in $scopedSlots" #[name]="slotData">
        <slot :name="name" v-bind="slotData"></slot>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  name: 'BaseTable',
  props: {
    headers: { type: Array, required: true, default: () => [] },
    items: { type: Array, required: true, default: () => [] }
  }
}
</script>

<style scoped>
.base-table-container {
  position: relative;
  width: 100%;
}
.custom-table { background-color: transparent !important; }
.custom-table >>> th {
  background-color: #f8f9fa !important;
  font-weight: bold !important;
  color: #333 !important;
  box-shadow: 0 1px 0 #e0e0e0 !important;
  white-space: nowrap; /* Giữ tiêu đề không bị rớt dòng khi ép nhỏ */
}

/* DÀNH CHO ĐIỆN THOẠI (< 600px) */
@media (max-width: 599px) {
  .base-table-container { overflow: visible !important; }
  .custom-table { min-width: 100% !important; }
  .custom-table >>> .v-data-table__wrapper { overflow: visible !important; }
  .custom-table >>> .v-data-table__mobile-row {
    align-items: flex-start !important;
    padding: 12px 16px !important;
    min-height: auto !important;
  }
  .custom-table >>> .v-data-table__mobile-row__header {
    font-weight: 600 !important;
    color: #222 !important;
    min-width: 130px;
    margin-right: 16px;
  }
  .custom-table >>> .v-data-table__mobile-row__cell {
    text-align: right !important;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-start;
  }
  .custom-table >>> .v-data-table__wrapper > table > tbody > tr {
    border-bottom: 8px solid #f0f2f5 !important;
  }
}

/* DÀNH CHO TABLET & MÁY TÍNH (>= 600px) - CHO PHÉP KÉO NGANG */
@media (min-width: 600px) {
  .base-table-container {
    flex: 1 1 auto;
    min-height: 0;
    overflow-x: auto; /* Hiển thị thanh cuộn ngang khi bảng quá dài */
  }
  .custom-table {
    min-width: 1000px !important; /* Đảm bảo chiều rộng tối thiểu để không bóp nghẹt data */
    height: 100%;
  }
  .custom-table >>> .v-data-table__wrapper {
    height: 100% !important;
    max-height: 100% !important;
    overflow-y: auto !important; /* Cuộn dọc */
  }
  .custom-table >>> th {
    position: sticky !important;
    top: 0 !important;
    z-index: 1 !important;
  }
}

/* Style cho Scrollbar */
.custom-table >>> .v-data-table__wrapper::-webkit-scrollbar,
.base-table-container::-webkit-scrollbar { height: 8px; width: 6px; }
.custom-table >>> .v-data-table__wrapper::-webkit-scrollbar-track,
.base-table-container::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
.custom-table >>> .v-data-table__wrapper::-webkit-scrollbar-thumb,
.base-table-container::-webkit-scrollbar-thumb { background: #a2212b; border-radius: 4px; }
.custom-table >>> .v-data-table__wrapper::-webkit-scrollbar-thumb:hover,
.base-table-container::-webkit-scrollbar-thumb:hover { background: #83161f; }
</style>