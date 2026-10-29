<script>
import BasePagination from "~/components/Base/Pagination.vue";
import BaseSelect from "~/components/Base/Select.vue";
import BaseBtnExel from "~/components/Base/BtnExcel.vue";
import BaseTable from "~/components/Base/BaseTable.vue";
import reportSyntheticService from "~/services/reportSyntheticService.js";

const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 50,
};

const INIT_SEARCH = {
    search: "",
    fromTime: "",
    toTime: "",
    examIds: null,
};

export default {
    name: "ReportSyntheticManagement",
    components: {
        BaseBtnExel,
        BasePagination,
        BaseSelect,
        BaseTable,
    },
    data() {
        return {
            headers: [
                { value: "stt", text: "STT", sortable: false },
                { value: "studentCode", text: "Mã số SV", sortable: false },
                { value: "studentName", text: "Họ tên SV", sortable: false },
                { value: "courses", text: "Học phần đăng ký", sortable: false },
                { value: "examName", text: "Đợt học lại", sortable: false },
                { value: "semester", text: "Học kỳ", sortable: false },
                { value: "totalAmount", text: "Số tiền cần thu", sortable: false },
                { value: "phone", text: "Số điện thoại", sortable: false },
                { value: "className", text: "Lớp", sortable: false },
                { value: "contentType", text: "Nội dung thu", sortable: false },
                { value: "createdAt", text: "Thời gian đăng ký", sortable: false },
            ],
            tableData: [],
            pagination: { ...INIT_PAGE_INFO },
            totalPages: 0,
            totalRecords: 0,
            totalMoney: 0,
            loading: false,
            filter: { ...INIT_SEARCH },
            examList: [],
        };
    },
    created() {
        this.fetchUserInfo();
        this.fetchPageRole();
        this.fetchExams();
        this.fetchTableData();
    },
    methods: {
        async fetchUserInfo() {
            try {
                await reportSyntheticService.getUserInfo({ channel: "CMS" });
            } catch (e) {
                console.error("Lỗi lấy thông tin user:", e);
            }
        },

        async fetchPageRole() {
            try {
                await reportSyntheticService.getPageRole({ channel: "CMS" });
            } catch (e) {
                console.error("Lỗi phân quyền:", e);
            }
        },

        async fetchExams() {
            try {
                const res = await reportSyntheticService.getExamList({ status: "ACTIVE", channel: "CMS" });
                const list = res?.data || (Array.isArray(res) ? res : []);
                this.examList = list.map((item) => ({
                    id: item.id,
                    code: item.code || item.name || item.examClass
                }));
            } catch (e) {
                console.error("Lỗi tải danh sách đợt học lại:", e);
                this.examList = [];
            }
        },

        async fetchTableData() {
            this.loading = true;
            try {
                const queryParams = {
                    pageIndex: this.pagination.pageIndex,
                    pageSize: this.pagination.pageSize,
                    search: this.filter.search || "",
                    fromTime: this.filter.fromTime || "",
                    toTime: this.filter.toTime || "",
                    examIds: this.filter.examIds || "",
                    channel: "CMS",
                };

                const response = await reportSyntheticService.getSyntheticReport(queryParams);
                const responseData = response?.data !== undefined ? response.data : response;
                const rawItems = responseData?.data || responseData?.content || responseData?.items || (Array.isArray(responseData) ? responseData : []);

                this.tableData = Array.isArray(rawItems) ? rawItems : [];
                this.totalRecords = responseData?.totalRecords || responseData?.totalElements || responseData?.total || this.tableData.length;
                this.totalPages = responseData?.totalPages || Math.ceil(this.totalRecords / this.pagination.pageSize) || 1;
                this.totalMoney = responseData?.totalMoney || responseData?.sumAmount || 0;
            } catch (error) {
                console.error("Lỗi khi tải bảng dữ liệu tổng hợp:", error);
                this.tableData = [];
            } finally {
                this.loading = false;
            }
        },

        onPageChange(page) {
            this.pagination.pageIndex = page;
            this.fetchTableData();
        },

        onPageSizeChange(size) {
            this.pagination.pageIndex = 1;
            this.pagination.pageSize = size;
            this.fetchTableData();
        },

        onSearch() {
            this.pagination.pageIndex = 1;
            this.fetchTableData();
        },

        onResetFilter() {
            this.filter = { ...INIT_SEARCH };
            this.pagination.pageIndex = 1;
            this.fetchTableData();
        }
    }
};
</script>

<template>
    <div>
        <BaseTable
            :headers="headers"
            :items="tableData"
            :items-per-page="pagination.pageSize"
            :loading="loading"
            fixed-header
            hide-default-footer
            item-key="id"
            loading-text="Đang tải dữ liệu..."
            no-data-text="Không có dữ liệu"
        >
            <template #top>
                <v-row class="mb-3 align-center">
                    <v-col class="fs-17 fw-500" cols="12" md="auto">
                        Danh sách tổng hợp <span class="primary--text">({{ totalRecords }})</span>
                        <span class="ml-4 font-weight-bold text-danger" v-if="totalMoney">
                            Tổng tiền: {{ $formatNumber(totalMoney) }}đ
                        </span>
                    </v-col>

                    <v-row dense justify="end">
                        <v-col cols="12" sm="6" md="3">
                            <v-text-field
                                v-model="filter.search"
                                hide-details
                                label="Sinh viên"
                                placeholder="Tìm kiếm sinh viên..."
                                outlined
                                dense
                                clearable
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="3">
                            <base-select
                                v-model="filter.examIds"
                                hide-details
                                item-text="code"
                                item-value="id"
                                :items="examList"
                                label="Đợt học lại"
                                placeholder="Đợt học lại"
                            ></base-select>
                        </v-col>
                        <v-col cols="12" sm="6" md="2">
                            <v-text-field
                                v-model="filter.fromTime"
                                hide-details
                                label="Từ ngày"
                                type="date"
                                outlined
                                dense
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="2">
                            <v-text-field
                                v-model="filter.toTime"
                                hide-details
                                label="Đến ngày"
                                type="date"
                                outlined
                                dense
                            ></v-text-field>
                        </v-col>

                        <v-col class="d-flex align-center gap-8" cols="auto">
                            <v-tooltip bottom>
                                <template #activator="{ on, attrs }">
                                    <v-icon
                                        color="primary"
                                        v-bind="attrs"
                                        @click="onResetFilter"
                                        v-on="on"
                                    >
                                        mdi-refresh
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
                                        @click="onSearch"
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
                <span>{{ $getStt(index, pagination) }}</span>
            </template>

            <template #[`item.totalAmount`]="{ item }"> 
                {{ $formatNumber(item.totalAmount) }}đ 
            </template>

            <template #[`item.courses`]="{ item }">
                <div v-for="(course, idx) in item.courses" :key="idx">
                    {{ course.name }} ({{ $formatNumber(course.fee) }}đ)
                </div>
            </template>
        </BaseTable>

        <div class="d-flex flex-column flex-sm-row justify-space-between align-center mt-3 gap-3">
            <div class="d-flex gap-8">
                <base-btn-exel
                    icon="mdi-export"
                    text="Xuất file báo cáo"
                />
            </div>

            <BasePagination
                :page="pagination.pageIndex"
                :page-count="totalPages"
                :page-size="pagination.pageSize"
                @changePage="onPageChange"
                @changePageSize="onPageSizeChange"
            />
        </div>
    </div>
</template>

<style scoped>
:deep(.v-data-table__wrapper) {
    max-height: calc(100vh - 250px);
}
</style>