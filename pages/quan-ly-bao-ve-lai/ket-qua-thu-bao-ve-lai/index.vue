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
                        Danh sách tổng hợp
                        <span class="primary--text mr-3">({{ totalRecord }})</span>
                        Tổng tiền :
                        <span class="primary--text">
                            {{ totalMoney ? `${$money(totalMoney)}đ` : "0đ" }}
                        </span>
                    </v-col>
                </v-row>

                <v-row class="mb-3" dense justify="end">
                        <v-col cols="12" md="2">
                            <v-text-field
                                v-model="search.search"
                                dense
                                outlined
                                hide-details
                                label="Sinh viên"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="2">
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
                        <v-col cols="12" sm="6" md="2">
                            <v-menu
                                v-model="feePaidFromMenu"
                                :close-on-content-click="false"
                                transition="scale-transition"
                                offset-y
                                min-width="auto"
                            >
                                <template #activator="{ on, attrs }">
                                    <v-text-field
                                        :value="formatFilterDate(search.dateFeePaidFrom)"
                                        label="Từ ngày"
                                        outlined
                                        dense
                                        hide-details
                                        readonly
                                        clearable
                                        v-bind="attrs"
                                        v-on="on"
                                        @click:clear.stop="search.dateFeePaidFrom = ''"
                                    ></v-text-field>
                                </template>
                                <v-date-picker
                                    v-model="search.dateFeePaidFrom"
                                    color="primary"
                                    locale="vi"
                                    :max="search.dateFeePaidTo || undefined"
                                    @input="feePaidFromMenu = false"
                                ></v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col cols="12" sm="6" md="2">
                            <v-menu
                                v-model="feePaidToMenu"
                                :close-on-content-click="false"
                                transition="scale-transition"
                                offset-y
                                min-width="auto"
                            >
                                <template #activator="{ on, attrs }">
                                    <v-text-field
                                        :value="formatFilterDate(search.dateFeePaidTo)"
                                        label="Đến ngày"
                                        outlined
                                        dense
                                        hide-details
                                        readonly
                                        clearable
                                        v-bind="attrs"
                                        v-on="on"
                                        @click:clear.stop="search.dateFeePaidTo = ''"
                                    ></v-text-field>
                                </template>
                                <v-date-picker
                                    v-model="search.dateFeePaidTo"
                                    color="primary"
                                    locale="vi"
                                    :min="search.dateFeePaidFrom || undefined"
                                    @input="feePaidToMenu = false"
                                ></v-date-picker>
                            </v-menu>
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
            </template>

            <template #[`item.stt`]="{ index }">
                <span>{{ (pageInfo.pageIndex - 1) * pageInfo.pageSize + index + 1 }}</span>
            </template>

            <template #[`item.info`]="{ item }">
                <div class="d-flex flex-column gap-2 py-1">
                    <div class="primary--text font-weight-bold">{{ item?.fullName }}</div>
                    <div v-if="item.code">
                        Mã sinh viên:
                        <span class="primary--text font-weight-bold">{{ item?.code }}</span>
                    </div>
                    <div v-if="item.phone">
                        Số điện thoại:
                        <span class="primary--text font-weight-bold">{{ item?.phone }}</span>
                    </div>
                    <div v-if="item.birthday">
                        Ngày sinh:
                        <span class="primary--text font-weight-bold">{{ $formatDate(item.birthday) }}</span>
                    </div>
                    <div>
                        Email:
                        <span class="primary--text font-weight-bold"> {{ item?.email }}</span>
                    </div>
                </div>
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

            <template #[`item.totalFee`]="{ item }">
                <span> {{ $money(item.totalFee) }}đ </span>
            </template>

            <template #[`item.type`]="{ item }">
                <BaseStatusItem :status-list="sendTypeList" :status="item.type" />
            </template>
        </v-data-table>

        <!-- Phần phân trang & Xuất file báo cáo -->
        <div class="d-flex justify-space-between align-center mt-4">
            <div>
                <base-btn-exel text="Xuất file báo cáo" :disabled="!list.length" @click="handleExport" />
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
                    v-for="page in totalPages"
                    :key="page"
                    :color="pageInfo.pageIndex === page ? 'primary' : 'white'"
                    class="mr-1"
                    min-width="36"
                    height="36"
                    @click="changePage(page)"
                >
                    {{ page }}
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
    dateFeePaidFrom: "",
    dateFeePaidTo: "",
    examIds: [],
};

export default {
    name: "RedefenseRevenueReportView",
    components: { BaseBtnExel },
    middleware: 'authenticated',
    data: () => ({
        headers: [
            { value: "stt", text: "STT", sortable: false, width: "60px" },
            { value: "info", text: "Thông tin chung", class: "text-center", sortable: false, width: "250px" },
            { value: "exam.name", text: "Đợt bảo vệ", class: "text-center", sortable: false, width: 200 },
            { value: "registerStudentTerms", text: "Học phần đăng ký", sortable: false, width: 250 },
            { value: "exam.semester.name", text: "Học kỳ", sortable: false, width: 150 },
            { value: "totalFee", text: "Số tiền cần thu", sortable: false, width: 130 },
            { value: "dateImport", text: "Ngày import dữ liệu", sortable: false, width: 160 },
            { value: "dateFeePaid", text: "Ngày nộp tiền", sortable: false, width: 160 },
            { value: "clazz.name", text: "Lớp", sortable: false, width: 150 },
            { value: "clazz.courseName", text: "Khóa", sortable: false, width: 100 },
            { value: "major.name", text: "Ngành", sortable: false, width: 200 },
            { value: "clazz.trainingMethodName", text: "Hình thức đào tạo", sortable: false, width: 200 },
            { value: "clazz.trainingUnitName", text: "Địa điểm đào tạo", sortable: false, width: 200 },
            { value: "type", text: "Nội dung thu", sortable: false, width: 150 },
            { value: "createTime", text: "Thời gian đăng ký", sortable: false, width: 160 },
        ],
        list: [],
        pageInfo: {
            ...INIT_PAGE_INFO,
        },
        search: { ...INIT_SEARCH },
        totalPage: 0,
        totalRecord: 0,
        pageInput: 1,
        totalMoney: 0,
        isLoading: false,
        sendTypeList,
        examList: [],
        feePaidFromMenu: false,
        feePaidToMenu: false,
    }),
    computed: {
        totalPages() {
            const total = Math.ceil(this.totalRecord / this.pageInfo.pageSize);
            return total > 0 ? total : 1;
        }
    },
    created() {
        this.getList();
        this.getExamList();
    },
    methods: {
        formatFilterDate(value) {
            if (!value || typeof value !== "string") return "";
            const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
        },

        getDateKey(value) {
            if (!value) return "";
            if (typeof value === "number" && Number.isFinite(value)) {
                const date = new Date(value);
                if (!Number.isNaN(date.getTime())) {
                    return this.getDateKey(date);
                }
            }
            if (value instanceof Date && !Number.isNaN(value.getTime())) {
                const year = value.getFullYear();
                const month = String(value.getMonth() + 1).padStart(2, "0");
                const day = String(value.getDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
            }

            if (typeof value !== "string") return "";
            const input = value.trim();
            const isoDate = input.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
            if (isoDate) {
                return `${isoDate[1]}-${isoDate[2].padStart(2, "0")}-${isoDate[3].padStart(2, "0")}`;
            }

            const localDate = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            if (localDate) {
                return `${localDate[3]}-${localDate[2].padStart(2, "0")}-${localDate[1].padStart(2, "0")}`;
            }
            return "";
        },

        async getExamList() {
            try {
                const res = await examServices.getAll({ channel: 'CMS', transid: 'faaebdf0-fcad-4e63-8a7a-456f783070d3' });
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
                    pageIndex: this.search.dateFeePaidFrom || this.search.dateFeePaidTo
                        ? 1
                        : this.pageInfo.pageIndex,
                    pageSize: this.pageInfo.pageSize,
                    search: this.search.search || undefined,
                    examIds: examIdsStr || undefined,
                    channel: 'CMS',
                    transid: '07f1f0c4-899d-4dea-91f0-fe4be6cf012c'
                };

                const res = await reportServices.revenueReport(params);
                const responseWrapper = res?.data !== undefined ? res.data : res;
                const pageData = responseWrapper?.data !== undefined ? responseWrapper.data : responseWrapper;
                if (!res?.success) {
                    throw new Error(res?.message || "Không thể tải danh sách kết quả thu.");
                }

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
                const rows = getRows(pageData);
                const totalSources = [pageData, responseWrapper, res];
                const getTotal = (sources) => sources
                    .flatMap(source => [
                        source?.totalRecords,
                        source?.totalElements,
                        source?.totalCount,
                        source?.totalItems,
                    ])
                    .find(value => value !== undefined && value !== null && Number.isFinite(Number(value)));
                const total = getTotal(totalSources);

                if (this.search.dateFeePaidFrom || this.search.dateFeePaidTo) {
                    let allRows = [...rows];
                    let fetchedPage = 1;
                    let lastPageRows = rows;
                    const pageSignatures = new Set();
                    if (rows.length) {
                        pageSignatures.add(rows.map(row => row?.id ?? JSON.stringify(row)).join("|"));
                    }

                    while (lastPageRows.length === this.pageInfo.pageSize) {
                        fetchedPage += 1;
                        const nextRes = await reportServices.revenueReport({
                            ...params,
                            pageIndex: fetchedPage,
                        });
                        if (!nextRes?.success) {
                            throw new Error(nextRes?.message || "Không thể tải các trang kết quả còn lại.");
                        }

                        const nextWrapper = nextRes?.data !== undefined ? nextRes.data : nextRes;
                        const nextData = nextWrapper?.data !== undefined ? nextWrapper.data : nextWrapper;
                        const nextRows = getRows(nextData);
                        const nextSignature = nextRows.map(row => row?.id ?? JSON.stringify(row)).join("|");
                        if (!nextRows.length || pageSignatures.has(nextSignature)) break;

                        allRows = allRows.concat(nextRows);
                        pageSignatures.add(nextSignature);
                        lastPageRows = nextRows;
                    }

                    const filteredRows = allRows.filter(row => {
                        const paidDate = this.getDateKey(row?.dateFeePaid);
                        return paidDate &&
                            (!this.search.dateFeePaidFrom || paidDate >= this.search.dateFeePaidFrom) &&
                            (!this.search.dateFeePaidTo || paidDate <= this.search.dateFeePaidTo);
                    });
                    this.totalRecord = filteredRows.length;
                    this.totalPage = Math.ceil(filteredRows.length / this.pageInfo.pageSize) || 1;
                    const firstRowIndex = (this.pageInfo.pageIndex - 1) * this.pageInfo.pageSize;
                    this.list = filteredRows.slice(firstRowIndex, firstRowIndex + this.pageInfo.pageSize);
                    this.totalMoney = filteredRows.reduce((sum, row) => sum + (Number(row?.totalFee) || 0), 0);
                    return;
                }

                let totalRecords = total !== undefined
                    ? Number(total)
                    : (this.pageInfo.pageIndex - 1) * this.pageInfo.pageSize + rows.length;

                if (total === undefined && rows.length === this.pageInfo.pageSize) {
                    let nextPage = this.pageInfo.pageIndex + 1;
                    let previousPageSignature = rows.map(row => row?.id ?? JSON.stringify(row)).join("|");
                    while (true) {
                        const nextRes = await reportServices.revenueReport({
                            ...params,
                            pageIndex: nextPage,
                        });
                        if (!nextRes?.success) {
                            throw new Error(nextRes?.message || "Không thể tải các trang kết quả còn lại.");
                        }

                        const nextWrapper = nextRes?.data !== undefined ? nextRes.data : nextRes;
                        const nextData = nextWrapper?.data !== undefined ? nextWrapper.data : nextWrapper;
                        const nextRows = getRows(nextData);
                        const nextSignature = nextRows.map(row => row?.id ?? JSON.stringify(row)).join("|");
                        if (!nextRows.length || nextSignature === previousPageSignature) break;

                        totalRecords += nextRows.length;
                        const nextTotal = [nextData, nextWrapper, nextRes]
                            .flatMap(source => [
                                source?.totalRecords,
                                source?.totalElements,
                                source?.totalCount,
                                source?.totalItems,
                            ])
                            .find(value => value !== undefined && value !== null && Number.isFinite(Number(value)));
                        if (nextTotal !== undefined) {
                            totalRecords = Number(nextTotal);
                            break;
                        }
                        if (nextRows.length < this.pageInfo.pageSize) break;

                        previousPageSignature = nextSignature;
                        nextPage += 1;
                    }
                }

                this.totalRecord = totalRecords;
                this.totalPage = Math.ceil(totalRecords / this.pageInfo.pageSize) || 1;
                const firstRowIndex = (this.pageInfo.pageIndex - 1) * this.pageInfo.pageSize;
                this.list = rows.length > this.pageInfo.pageSize
                    ? rows.slice(firstRowIndex, firstRowIndex + this.pageInfo.pageSize)
                    : rows;
                this.totalMoney = pageData?.totalMoney ?? responseWrapper?.totalMoney ??
                    pageData?.total ?? responseWrapper?.total ?? 0;
            } catch (e) {
                console.error(e);
                this.list = [];
                this.totalRecord = 0;
                this.totalPage = 1;
                this.totalMoney = 0;
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

                const res = await reportServices.exportRevenueReport({
                    search: this.search.search || undefined,
                    dateFeePaidFrom: this.search.dateFeePaidFrom || undefined,
                    dateFeePaidTo: this.search.dateFeePaidTo || undefined,
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
            this.getList();
        },

        changePage(val) {
            if (val >= 1 && val <= this.totalPages) {
                this.pageInfo.pageIndex = val;
                this.pageInput = val;
                this.getList();
            }
        },

        goToPage() {
            let target = parseInt(this.pageInput, 10);
            if (isNaN(target) || target < 1) target = 1;
            if (target > this.totalPages) target = this.totalPages;
            this.pageInfo.pageIndex = target;
            this.pageInput = target;
            this.getList();
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