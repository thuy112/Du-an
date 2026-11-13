<template>
    <div>
        <v-data-table
            :headers="headers"
            :items="list"
            :items-per-page="pageInfo.pageSize"
            :loading="isLoading"
            checkbox-color="primary"
            disable-pagination
            fixed-header
            hide-default-footer
            item-key="id"
            loading-text="Đang tải dữ liệu..."
            max-height="calc(100vh - 300px)"
            no-data-text="Không có dữ liệu"
        >
            <template #top>
                <v-row class="mb-3 align-center">
                    <v-col class="fs-17 fw-500" cols="12" md="auto">
                        Danh sách sinh viên chưa nộp tiền
                        <span class="primary--text mr-3">({{ totalRecord }})</span>
                        Tổng tiền chưa thu :
                        <span class="primary--text">
                            {{ totalMoney ? `${$money(totalMoney)}đ` : "0đ" }}
                        </span>
                    </v-col>
                </v-row>

                <v-row class="mb-3" dense>
                    <v-col cols="12" md="3" sm="6">
                        <v-text-field
                            v-model="search.search"
                            dense
                            outlined
                            hide-details
                            label="Sinh viên"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3" sm="6">
                        <v-select
                            v-model="search.examIds"
                            :items="examList"
                            item-text="name"
                            item-value="id"
                            style="min-width: 100%"
                            multiple
                            clearable
                            dense
                            hide-details
                            label="Đợt bảo vệ lại"
                            no-data-text="Không có dữ liệu"
                            outlined
                        >
                        </v-select>
                    </v-col>
                    <v-col cols="12" md="2" sm="6">
                        <base-date-picker
                            v-model="search.fromTime"
                            hide-details
                            label="Từ ngày"
                            :max="search.toTime"
                        ></base-date-picker>
                    </v-col>
                    <v-col cols="12" md="2" sm="6">
                        <base-date-picker
                            v-model="search.toTime"
                            hide-details
                            to-time
                            label="Đến ngày"
                            :min="search.fromTime"
                        ></base-date-picker>
                    </v-col>
                    <v-col class="d-flex align-center gap-8" cols="12" md="auto">
                        <v-tooltip bottom>
                            <template #activator="{ on, attrs }">
                                <v-icon
                                    color="primary"
                                    v-bind="attrs"
                                    @click="handleReset"
                                    v-on="on"
                                    class="cursor-pointer"
                                >mdi-refresh</v-icon>
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
            </template>

            <template #[`item.stt`]="{ index }">
                <span>{{ (pageInfo.pageIndex - 1) * pageInfo.pageSize + index + 1 }}</span>
            </template>

            <template #[`item.code`]="{ item }">
                <span class="primary--text font-weight-bold">{{ item?.code || '---' }}</span>
            </template>

            <template #[`item.fullName`]="{ item }">
                <span class="font-weight-bold">{{ item?.fullName || '---' }}</span>
            </template>

            <template #[`item.registerStudentTerms`]="{ item }">
                <div v-limit="5" class="content">
                    <ol style="list-style-type: none; padding-left: 0">
                        <li
                            v-for="data in item.registerStudentTerms"
                            :key="data.term?.id || data.id"
                            class="text-left"
                        >
                            <span>{{ data?.term?.code }}</span> -
                            <span>{{ data?.term?.name }}</span> -
                            <span> {{ $money(data.fee) }}đ </span>
                        </li>
                    </ol>
                </div>
            </template>

            <template #[`item.type`]="{ item }">
                <BaseStatusItem :status-list="sendTypeList" :status="item.type" />
            </template>
        </v-data-table>

        <!-- Phần phân trang & Xuất file báo cáo -->
        <div class="d-flex justify-space-between align-center mt-4">
            <div>
                <base-btn-exel text="Xuất file báo cáo" :disabled="!allRecords.length" @click="handleExport" />
            </div>
            <div class="d-flex align-center">
                <span class="text-caption mr-2">Bản ghi</span>
                <v-select
                    v-model="pageInfo.pageSize"
                    :items="[10, 20, 50, 100]"
                    dense
                    outlined
                    hide-details
                    class="mr-4"
                    style="width: 80px;"
                    @change="changePageSize"
                ></v-select>
                <span class="text-caption mr-2">Trang</span>
                <v-text-field
                    v-model="pageInput"
                    dense
                    outlined
                    hide-details
                    class="mr-2 text-center"
                    style="width: 60px;"
                    @keyup.enter="goToPage"
                ></v-text-field>
                <v-btn color="primary" class="mr-4" height="40" @click="goToPage">Đi</v-btn>
                <v-btn
                    icon
                    outlined
                    class="mr-1"
                    :disabled="pageInfo.pageIndex <= 1"
                    @click="changePage(pageInfo.pageIndex - 1)"
                >
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <v-btn
                    v-for="item in paginationItems"
                    :key="item.key"
                    :color="item.page && pageInfo.pageIndex === item.page ? 'primary' : 'white'"
                    :disabled="!item.page"
                    class="mr-1"
                    min-width="36"
                    height="36"
                    @click="item.page && changePage(item.page)"
                >
                    {{ item.label }}
                </v-btn>
                <v-btn
                    icon
                    outlined
                    :disabled="pageInfo.pageIndex >= totalPages"
                    @click="changePage(pageInfo.pageIndex + 1)"
                >
                    <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
            </div>
        </div>
    </div>
</template>

<script>
import reportServices from "~/services/reportServices";
import examServices from "~/services/redefend/examServices";
import BaseBtnExel from "~/components/Base/BtnExcel.vue";
import { sendTypeList } from "~/consts/list";

const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 50,
};

const INIT_SEARCH = {
    search: "",
    fromTime: "",
    toTime: "",
    examIds: [],
};

export default {
    name: "RedefenseReportNotPaidView",
    components: { BaseBtnExel },
    middleware: 'authenticated',
    data: () => ({
        headers: [
            { value: "stt", text: "STT", sortable: false, width: "60px" },
            { value: "code", text: "Mã số SV", sortable: false, width: 130 },
            { value: "fullName", text: "Họ tên SV", sortable: false, width: 180 },
            { value: "exam.name", text: "Đợt bảo vệ", class: "text-center", sortable: false, width: 180 },
            { value: "registerStudentTerms", text: "Học phần đăng ký", sortable: false, width: 250 },
            { value: "exam.semester.name", text: "Học kỳ", sortable: false, width: 120 },
            { value: "phone", text: "Số điện thoại", sortable: false, width: 130 },
            { value: "clazz.name", text: "Lớp", sortable: false, width: 160 },
            { value: "clazz.courseName", text: "Khóa", sortable: false, width: 100 },
            { value: "major.name", text: "Ngành", sortable: false, width: 180 },
            { value: "clazz.trainingMethodName", text: "Hình thức đào tạo", sortable: false, width: 180 },
            { value: "clazz.trainingUnitName", text: "Địa điểm đào tạo", sortable: false, width: 180 },
            { value: "type", text: "Nội dung thu", sortable: false, width: 150 },
            { value: "createTime", text: "Thời gian đăng ký", sortable: false, width: 160 },
        ],
        list: [],          // Dữ liệu cắt ra hiển thị trên trang hiện tại
        allRecords: [],    // Toàn bộ danh sách nhận được từ API
        pageInfo: {
            ...INIT_PAGE_INFO,
        },
        search: { ...INIT_SEARCH },
        totalRecord: 0,
        pageInput: 1,
        totalMoney: 0,
        isLoading: false,
        sendTypeList,
        examList: [],
    }),
    computed: {
        totalPages() {
            const total = Math.ceil(this.totalRecord / this.pageInfo.pageSize);
            return total > 0 ? total : 1;
        },
        visiblePages() {
            if (this.totalPages <= 2) {
                return Array.from({ length: this.totalPages }, (_, index) => index + 1);
            }
            const currentPage = Math.min(this.pageInfo.pageIndex, this.totalPages);
            return [...new Set([1, 2, currentPage, this.totalPages])].sort((a, b) => a - b);
        },
        paginationItems() {
            const items = [];
            this.visiblePages.forEach((page, index) => {
                if (index > 0 && page - this.visiblePages[index - 1] > 1) {
                    items.push({ key: `ellipsis-${page}`, label: "...", page: null });
                }
                items.push({ key: `page-${page}`, label: String(page), page });
            });
            return items;
        }
    },
    created() {
        this.getList();
        this.getExamList();
    },
    methods: {
        async getExamList() {
            try {
                const res = await examServices.getAll({ channel: 'CMS', transid: '4b0cd8ec-80d9-42a8-af17-15816a0cf99e' });
                const raw = res?.data !== undefined ? res.data : res;
                const items = raw?.data || raw?.items || (Array.isArray(raw) ? raw : []);
                this.examList = items.map((item) => ({ id: item?.id, name: item?.name }));
            } catch (er) {
                console.error(er);
            }
        },

        async getList() {
            try {
                this.isLoading = true;
                const examIdsStr = Array.isArray(this.search.examIds) ? this.search.examIds.join(",") : (this.search.examIds || "");
                const params = {
                    pageIndex: 1,
                    pageSize: this.pageInfo.pageSize,
                    search: this.search.search || undefined,
                    fromTime: this.search.fromTime || undefined,
                    toTime: this.search.toTime || undefined,
                    examIds: examIdsStr || undefined,
                    channel: 'CMS',
                    transid: '7c1e2ebe-c59a-420e-87e0-c4711dadf165'
                };

                const getPageData = (response) => {
                    const wrapper = response?.data !== undefined ? response.data : response;
                    return wrapper?.data !== undefined ? wrapper.data : wrapper;
                };
                const getRows = (data) => {
                    if (Array.isArray(data)) return data;
                    return [
                        data?.data,
                        data?.items,
                        data?.content,
                        data?.records,
                        data?.list,
                    ].find(Array.isArray) || [];
                };
                const getTotalRecords = (data, wrapper, response) => [
                    data?.totalRecords,
                    data?.totalElements,
                    data?.totalCount,
                    data?.totalItems,
                    wrapper?.totalRecords,
                    wrapper?.totalElements,
                    response?.totalRecords,
                    response?.totalElements,
                ].find(value => value !== undefined && value !== null && Number.isFinite(Number(value)));

                const firstResponse = await reportServices.reportResultNotPaid(params);
                if (!firstResponse?.success) {
                    throw new Error(firstResponse?.message || "Không thể tải danh sách sinh viên chưa nộp tiền.");
                }
                const firstWrapper = firstResponse?.data !== undefined ? firstResponse.data : firstResponse;
                const firstPageData = getPageData(firstResponse);
                const firstRows = getRows(firstPageData);
                const totalRecords = getTotalRecords(firstPageData, firstWrapper, firstResponse);
                const allRecords = [...firstRows];
                let lastPageRows = firstRows;
                let pageIndex = 1;
                const pageSignatures = new Set();
                if (firstRows.length) {
                    pageSignatures.add(firstRows.map(row => row?.id ?? JSON.stringify(row)).join("|"));
                }

                while (true) {
                    if (
                        totalRecords !== undefined &&
                        allRecords.length >= Number(totalRecords)
                    ) break;
                    if (
                        totalRecords === undefined &&
                        lastPageRows.length < this.pageInfo.pageSize
                    ) break;

                    pageIndex += 1;
                    const response = await reportServices.reportResultNotPaid({
                        ...params,
                        pageIndex,
                    });
                    if (!response?.success) {
                        throw new Error(response?.message || `Không thể tải trang ${pageIndex} của danh sách.`);
                    }

                    const pageData = getPageData(response);
                    const rows = getRows(pageData);
                    if (!rows.length) {
                        if (
                            totalRecords !== undefined &&
                            allRecords.length < Number(totalRecords)
                        ) {
                            throw new Error(
                                `API chỉ trả về ${allRecords.length}/${Number(totalRecords)} bản ghi.`
                            );
                        }
                        break;
                    }

                    const signature = rows.map(row => row?.id ?? JSON.stringify(row)).join("|");
                    if (pageSignatures.has(signature)) {
                        throw new Error(`API trả về dữ liệu trùng lặp ở trang ${pageIndex}; danh sách có thể chưa được tải đầy đủ.`);
                    }
                    pageSignatures.add(signature);
                    allRecords.push(...rows);
                    lastPageRows = rows;
                }

                this.allRecords = allRecords;
                this.totalRecord = allRecords.length;
                const start = (this.pageInfo.pageIndex - 1) * this.pageInfo.pageSize;
                this.list = allRecords.slice(start, start + this.pageInfo.pageSize);
                this.totalMoney = firstPageData?.totalMoney ??
                    firstPageData?.total ??
                    firstWrapper?.totalMoney ??
                    firstWrapper?.total ??
                    0;
            } catch (e) {
                console.error("Lỗi tải danh sách chưa nộp tiền:", e);
                this.allRecords = [];
                this.list = [];
                this.totalRecord = 0;
                this.totalMoney = 0;
                this.$toast?.error?.(e?.message || "Không thể tải đầy đủ danh sách sinh viên chưa nộp tiền.");
            } finally {
                this.isLoading = false;
            }
        },

        async handleExport() {
            try {
                let examIds = "";
                if (!this.search.examIds || !this.search.examIds.length) {
                    examIds = this.examList.map((item) => item.id).join(",");
                } else {
                    examIds = this.search.examIds.join(",");
                }

                const res = await reportServices.exportReportResultNotPaid({
                    ...this.search,
                    examIds,
                    channel: 'CMS'
                });
                if (res.success && res?.data?.url) {
                    if (typeof this.$download === 'function') {
                        this.$download(res.data.url);
                    } else {
                        window.open(res.data.url, '_blank');
                    }
                }
            } catch (e) {
                console.error("Lỗi xuất file:", e);
            }
        },

        changePageSize(val) {
            this.pageInfo.pageSize = Number(val) || 50;
            this.pageInfo.pageIndex = 1;
            this.pageInput = 1;
            // Cắt lại mảng theo pageSize mới ngay lập tức
            const start = 0;
            const end = this.pageInfo.pageSize;
            this.list = this.allRecords.slice(start, end);
        },

        changePage(val) {
            if (val >= 1 && val <= this.totalPages) {
                this.pageInfo.pageIndex = val;
                this.pageInput = val;
                const start = (val - 1) * this.pageInfo.pageSize;
                const end = start + this.pageInfo.pageSize;
                this.list = this.allRecords.slice(start, end);
            }
        },

        goToPage() {
            let target = parseInt(this.pageInput, 10);
            if (isNaN(target) || target < 1) target = 1;
            if (target > this.totalPages) target = this.totalPages;
            this.changePage(target);
        },

        handleReset() {
            this.search = { ...INIT_SEARCH };
            this.pageInfo = { ...INIT_PAGE_INFO };
            this.pageInput = 1;
            this.getList();
        },

        handleSearch() {
            this.pageInfo.pageIndex = 1;
            this.pageInput = 1;
            this.getList();
        },
    },
};
</script>

<style scoped>
:deep(.v-data-table__wrapper) {
    max-height: calc(100vh - 250px);
}

:deep(.v-select__selections) {
    display: flex;
    flex-wrap: nowrap;
    overflow: hidden;
    max-width: 100%;
    white-space: nowrap;
    align-items: center;
}

:deep(.v-select__selections > *) {
    flex: 0 0 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

::v-deep(.content p) {
    margin-bottom: 2px !important;
}

.gap-8 {
    gap: 8px;
}
</style>