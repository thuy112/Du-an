<script>
import { ActionList } from "~/consts/list";
import userServices from "~/services/userServices";

const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 50,
};

const INIT_SEARCH = {
    email: null,
    status: null,
    action: null,
};
export default {
    name: "Index",
    components: {},
    data: () => ({
        statusList: [
            { value: "SUCCESS", text: "Thành công", color: "green" },
            { value: "FAILED", text: "Thất bại", color: "warning" },
        ],

        headers: [
            { value: "stt", text: "STT", sortable: false },
            { value: "accountEmail", text: "Email" },
            { value: "createTime", text: "Thời gian tạo" },
            { value: "type", text: "Loại người dùng" },
            { value: "description", text: "Mô tả" },
            { value: "requestBody", text: "Yêu cầu" },
            { value: "errorMessage", text: "Thông báo lỗi", align: "center", sortable: false },
            { value: "status", text: "Trạng thái", align: "center" },
            { value: "action", text: "Chức năng", align: "center", sortable: false },
        ],
        list: [],
        pageInfo: {
            ...INIT_PAGE_INFO,
        },
        totalPage: 0,
        totalRecord: 0,
        isLoading: false,
        ActionList,
        search: { ...INIT_SEARCH },
    }),
    computed: {},
    created() {
        this.getList();
    },
    methods: {
        async getList() {
            try {
                this.isLoading = true;
                const res = await userServices.UserOperations({
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

<template>
    <div>
        <v-data-table
            :headers="headers"
            :items="list"
            fixed-header
            :loading="isLoading"
            max-height="calc(100vh - 300px)"
            no-data-text="Không có dữ liệu"
            loading-text="Đang tải dữ liệu..."
            hide-default-footer
            class="mb-3"
            :items-per-page="pageInfo.pageSize"
            item-key="user_id"
            checkbox-color="primary"
        >
            <template #top>
                <v-row class="pb-3">
                    <v-col cols="12" md="auto" class="fs-17 fw-500">
                        Danh sách người dùng
                        <span class="primary--text">({{ totalRecord }})</span>
                    </v-col>

                    <v-row justify="end" dense>
                        <v-col cols="12" md="3">
                            <v-text-field
                                v-model="search.email"
                                label="Email"
                                clearable
                                outlined
                                dense
                                hide-details
                            >
                            </v-text-field>
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-select
                                v-model="search.action"
                                label="Chức năng"
                                :items="ActionList"
                                clearable
                                outlined
                                dense
                                hide-details
                            >
                            </v-select>
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-select
                                v-model="search.status"
                                label="Trạng thái"
                                clearable
                                outlined
                                :items="statusList"
                                dense
                                no-data-text="Không có dữ liệu"
                                hide-details
                            >
                            </v-select>
                        </v-col>
                        <v-col cols="auto" class="d-flex align-center gap-8 toolbar-actions">
                            <v-tooltip bottom>
                                <template #activator="{ on, attrs }">
                                    <v-icon
                                        v-bind="attrs"
                                        color="primary"
                                        v-on="on"
                                        @click="handleReset"
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
                                        v-on="on"
                                        @click="handleSearch"
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
            <template #[`item.type`]="{ item }">
                <span v-if="item.type == 'RETAKE_EXAM'">Thi lại</span>
                <span v-else-if="item.type == 'RETAKE_COURSES'">Học lại</span>
                <span v-else-if="item.type == 'REASSESSMENT'">Bảo vệ lại</span>
                <span v-else>Hệ thống</span>
            </template>

            <template #[`item.accountEmail`]="{ item }">
                <div class="primary--text font-weight-bold">{{ item?.accountEmail }}</div>
            </template>
            <template #[`item.createTime`]="{ item }">
                <span>{{ item.createTime }}</span>
            </template>
            <template #[`item.requestBody`]="{ item }">
                <div v-limit="2" class="content" v-html="item.requestBody"></div>
            </template>
            <template #[`item.status`]="{ item }">
                <BaseStatusItem :status="item.status" :status-list="statusList" />
            </template>
            <template #[`item.action`]="{ item }">
                <BaseStatusItem :status="item.action" :status-list="ActionList" />
            </template>
        </v-data-table>
        <div class="d-flex justify-end">
            <BasePagination
                :page-size="pageInfo.pageSize"
                :page="pageInfo.pageIndex"
                :page-count="totalPage"
                @changePageSize="changePageSize"
                @changePage="changePage"
            />
        </div>
    </div>
</template>

<style scoped>
:deep .v-data-table__wrapper {
    max-height: calc(100vh - 250px);
}
::v-deep .content p {
    margin-bottom: 2px !important;
}
::v-deep .content {
    width: 400px;
    white-space: normal;
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    overflow: hidden;
}
.row--dense {
    margin: 15px;
}
.toolbar-actions {
    gap: 8px;
}
</style>
