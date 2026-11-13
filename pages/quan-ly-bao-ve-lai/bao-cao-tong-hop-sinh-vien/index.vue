<template>
    <div>
        <v-data-table
            :headers="headers"
            :items="list"
            :items-per-page="pageInfo.pageSize"
            :loading="isLoading"
            checkbox-color="primary"
            fixed-header
            hide-default-footer
            item-key="teacher_id"
            loading-text="Đang tải dữ liệu..."
            max-height="calc(100vh - 300px)"
            no-data-text="Không có dữ liệu"
        >
            <template #top>
                <v-row>
                    <v-col class="fs-17 fw-500" cols="12">
                        Danh sách tổng hợp
                        <span class="primary--text mr-3">( {{ totalRecord }} )</span>
                    </v-col>

                    <v-row class="mb-3" dense justify="end">
                        <v-col cols="12" md="2">
                            <base-text-field
                                v-model="search.search"
                                hide-details
                                label="Sinh viên"
                            ></base-text-field>
                        </v-col>
                        <v-col cols="12" md="2">
                            <base-select
                                v-model="search.defenseStatus"
                                hide-details
                                item-text="text"
                                item-value="value"
                                :items="defenseStatusList"
                                label="Trạng thái bảo vệ"
                            ></base-select>
                        </v-col>
                        <v-col cols="12" md="2">
                            <base-select
                                v-model="search.feeStatus"
                                hide-details
                                item-text="text"
                                item-value="value"
                                :items="feeStatusList"
                                label="Trạng thái đóng phí"
                            ></base-select>
                        </v-col>
                        <v-col class="d-flex align-center gap-8" cols="auto">
                            <v-tooltip bottom>
                                <template #activator="{ on, attrs }">
                                    <v-icon
                                        color="primary"
                                        v-bind="attrs"
                                        @click="handleReset"
                                        v-on="on"
                                        >mdi-refresh
                                    </v-icon>
                                </template>
                                <span>Reset bộ lọc</span>
                            </v-tooltip>

                            <v-tooltip bottom>
                                <template #activator="{ on, attrs }">
                                    <v-btn
                                        color="primary"
                                        elevation="0"
                                        v-bind="attrs"
                                        @click="handleSearch"
                                        v-on="on"
                                    >
                                        <v-icon>mdi-magnify</v-icon>
                                    </v-btn>
                                </template>
                                <span>Tìm kiếm</span>
                            </v-tooltip>
                        </v-col>
                    </v-row>
                </v-row>
            </template>
            <template #[`item.stt`]="{ index }">
                <span>{{ $getStt(index, pageInfo) }}</span>
            </template>
            <template #[`item.defenseStatus`]="{ item }">
                <StatusItem :status-list="defenseStatusList" :status="item?.defenseStatus" />
            </template>
            <template #[`item.feeStatus`]="{ item }">
                <StatusItem :status-list="feeStatusList" :status="item?.feeStatus" />
            </template>
        </v-data-table>
        <div class="d-flex justify-space-between">
            <div>
                <base-btn-exel text="Xuất file báo cáo" :disabled="!list" @click="handleExport" />
            </div>
            <BasePagination
                :page="pageInfo.pageIndex"
                :page-count="totalPage"
                :page-size="pageInfo.pageSize"
                @changePage="changePage"
                @changePageSize="changePageSize"
            />
        </div>
    </div>
</template>

<script>
import reportServices from "~/services/reportServices";
import BaseBtnExel from "~/components/Base/BtnExcel.vue";
import { defenseStatusList, feeStatusList } from "~/consts/list";
import StatusItem from "~/components/Base/StatusItem.vue";

const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 50,
};

const INIT_SEARCH = {
    search: "",
    defenseStatus: "",
    feeStatus: "",
};
export default {
    name: "Index",
    components: { BaseBtnExel, StatusItem },
    data: () => ({
        headers: [
            { value: "stt", text: "STT", sortable: false },
            { value: "studentName", text: "Sinh viên", sortable: false },
            { value: "examClass", text: "Hội đồng", sortable: false },
            { value: "defenseStatus", text: "Trạng thái bảo vệ", sortable: false },
            { value: "feeStatus", text: "Trạng thái đóng phí", sortable: false },
            { value: "feeDate", text: "Ngày đóng phí", sortable: false },
        ],
        list: [],
        pageInfo: {
            ...INIT_PAGE_INFO,
        },
        totalPage: 0,
        totalRecord: 0,
        isLoading: false,
        search: { ...INIT_SEARCH },
        defenseStatusList,
        feeStatusList,
    }),
    computed: {},
    created() {
        this.getList();
    },
    methods: {
        async getList() {
            try {
                this.isLoading = true;
                const res = await reportServices.reportSummary({
                    ...this.pageInfo,
                    ...this.search,
                });
                if (res.success) {
                    this.list = res.data.data;
                    this.totalPage = res.data.totalPages;
                    this.totalRecord = res.data.totalRecords;
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
        },

        async handleExport() {
            const res = await reportServices.exportReportSummary({
                defenseStatus: this.search.defenseStatus,
                feeStatus: this.search.feeStatus,
            });
            if (res.success) {
                this.$download(res?.data?.url);
            }
        },

        changePageSize(val) {
            this.pageInfo.pageIndex = 1;
            this.pageInfo.pageSize = val;
            this.getList();
        },
        changePage(val) {
            this.pageInfo.pageIndex = val;
            this.getList();
        },
        handleReset() {
            this.search = { ...INIT_SEARCH };
            this.pageInfo = { ...INIT_PAGE_INFO };
            this.getList();
        },

        handleSearch() {
            this.pageInfo.pageIndex = 1;
            this.getList();
        },
    },
};
</script>

<style scoped>
:deep .v-data-table__wrapper {
    max-height: calc(100vh - 250px);
}

:deep .v-select__selections {
    display: flex;
    flex-wrap: nowrap;
    overflow: hidden;
    max-width: 100%;
    white-space: nowrap;
    align-items: center;
}

:deep .v-select__selections > * {
    flex: 0 0 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
