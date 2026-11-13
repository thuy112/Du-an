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
            item-key="id"
            loading-text="Đang tải dữ liệu..."
            max-height="calc(100vh - 300px)"
            no-data-text="Không có dữ liệu"
        >
            <template #top>
                <v-row class="align-center mb-3">
                    <v-col class="fs-17 fw-500" cols="12" md="3">
                        Danh sách tổng hợp
                        <span class="primary--text mr-3">( {{ totalRecord }} )</span>

                        Tổng tiền :
                        <span class="primary--text">
                            {{ totalMoney ? `${$money(totalMoney)}đ` : "0đ" }}
                        </span>
                    </v-col>

                    <v-col cols="12" md="9">
                        <v-row dense justify="end" align="center">
                            <v-col cols="12" md="2.5">
                                <v-text-field
                                    v-model="search.search"
                                    dense
                                    outlined
                                    hide-details
                                    label="Sinh viên"
                                    @keyup.enter="handleSearch"
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="2.5">
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
                            <v-col cols="12" md="2">
                                <v-menu
                                    v-model="fromDateMenu"
                                    :close-on-content-click="false"
                                    transition="scale-transition"
                                    offset-y
                                    min-width="auto"
                                >
                                    <template #activator="{ on, attrs }">
                                        <v-text-field
                                            :value="formatFilterDate(search.fromTime)"
                                            label="Từ ngày"
                                            outlined
                                            dense
                                            hide-details
                                            readonly
                                            clearable
                                            v-bind="attrs"
                                            v-on="on"
                                            @click:clear.stop="search.fromTime = ''"
                                        ></v-text-field>
                                    </template>
                                    <v-date-picker
                                        v-model="search.fromTime"
                                        color="primary"
                                        locale="vi"
                                        :max="search.toTime || undefined"
                                        @input="fromDateMenu = false"
                                    ></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="12" md="2">
                                <v-menu
                                    v-model="toDateMenu"
                                    :close-on-content-click="false"
                                    transition="scale-transition"
                                    offset-y
                                    min-width="auto"
                                >
                                    <template #activator="{ on, attrs }">
                                        <v-text-field
                                            :value="formatFilterDate(search.toTime)"
                                            label="Đến ngày"
                                            outlined
                                            dense
                                            hide-details
                                            readonly
                                            clearable
                                            v-bind="attrs"
                                            v-on="on"
                                            @click:clear.stop="search.toTime = ''"
                                        ></v-text-field>
                                    </template>
                                    <v-date-picker
                                        v-model="search.toTime"
                                        color="primary"
                                        locale="vi"
                                        :min="search.fromTime || undefined"
                                        @input="toDateMenu = false"
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
                    </v-col>
                </v-row>
            </template>
            <template #[`item.stt`]="{ index }">
                <span>{{ $getStt(index, pageInfo) }}</span>
            </template>
            <template #[`item.registerStudentTerms`]="{ item }">
                <ol style="list-style-type: none; padding-left: 0">
                    <li
                        v-for="data in item.registerStudentTerms"
                        :key="data.term.id"
                        class="text-left"
                    >
                        <span>{{ data?.term?.code }}</span>
                        <span>{{ data?.term?.name }}</span> -
                        <span> {{ $money(data.fee) }}đ </span>
                    </li>
                </ol>
            </template>
            <template #[`item.registerSemesterTerms`]="{ item }">
                <ol style="list-style-type: none; padding-left: 0">
                    <li
                        v-for="data in item.registerStudentTerms"
                        :key="data.term.id"
                        class="text-left"
                    >
                        <span>{{ data?.semester?.name }}</span>
                    </li>
                </ol>
            </template>
            <template #[`item.totalFee`]="{ item }">
                <span> {{ $money(item.totalFee) }}đ </span>
            </template>
            <template #[`item.type`]="{ item }">
                <BaseStatusItem :status-list="sendTypeList" :status="item.type" />
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
    name: "SyntheticReportIndex",
    components: { BaseBtnExel },
    data: () => ({
        headers: [
            { value: "stt", text: "STT", sortable: false },
            { value: "code", text: "Mã số SV", class: "text-center", sortable: false },
            { value: "fullName", text: "Họ tên SV", width: 150, sortable: false },
            { value: "exam.name", text: "Đợt bảo vệ", width: 250, sortable: false },
            {
                value: "registerStudentTerms",
                text: "Học phần đăng ký",
                sortable: false,
                width: 350,
            },
            {
                value: "registerSemesterTerms",
                text: "Học kỳ",
                sortable: false,
                width: 150,
            },
            { value: "totalFee", text: "Số tiền cần thu", sortable: false },
            { value: "phone", text: "Số điện thoại", sortable: false },
            { value: "clazz.name", text: "Lớp", align: "center", sortable: false },
            { value: "type", text: "Nội dung thu", align: "center", sortable: false },
            { value: "createTime", text: "Thời gian đăng ký", align: "center", sortable: false },
        ],
        list: [],
        pageInfo: {
            ...INIT_PAGE_INFO,
        },
        totalPage: 0,
        totalRecord: 0,
        isLoading: false,
        search: { ...INIT_SEARCH },
        sendTypeList,
        examList: [],
        totalMoney: 0,
        fromDateMenu: false,
        toDateMenu: false,
    }),
    created() {
        this.getList();
        this.getExam();
    },
    methods: {
        formatFilterDate(value) {
            if (!value || typeof value !== "string") return "";
            const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
        },

        formatApiDateTime(value, endOfDay = false) {
            if (!value || typeof value !== "string") return undefined;
            const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (!match) return undefined;
            return `${match[3]}/${match[2]}/${match[1]} ${endOfDay ? "23:59:59" : "00:00:00"}`;
        },

        async handleExport() {
            const examIds = this.search.examIds.length
                ? this.search.examIds.join(",")
                : this.examList.map((item) => item.id).join(",");

            const res = await reportServices.exportRegisterReport({
                search: this.search.search || undefined,
                fromTime: this.formatApiDateTime(this.search.fromTime),
                toTime: this.formatApiDateTime(this.search.toTime, true),
                examIds,
            });
            if (res && res.success) {
                this.$download(res?.data?.url);
            }
        },

        async getExam() {
            const res = await examServices.getAll({ channel: "CMS" });
            if (res && res.success) {
                this.examList = res?.data?.map((item) => ({ id: item?.id, name: item?.name }));
            }
        },

        async getList() {
            try {
                this.isLoading = true;
                const examIds = Array.isArray(this.search.examIds) 
                    ? this.search.examIds.join(",") 
                    : this.search.examIds;

                const res = await reportServices.registerReport({
                    ...this.pageInfo,
                    ...this.search,
                    examIds,
                    fromTime: this.formatApiDateTime(this.search.fromTime),
                    toTime: this.formatApiDateTime(this.search.toTime, true),
                });
                if (res && res.success) {
                    this.list = res.data.data;
                    this.totalPage = res.data.totalPages;
                    this.totalRecord = res.data.totalRecords;
                    this.totalMoney = res.data.total;
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
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