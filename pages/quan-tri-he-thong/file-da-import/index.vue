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
                        Danh sách file
                        <span class="primary--text">({{ totalRecord }})</span>
                    </v-col>

                    <v-row justify="end" dense>
                        <v-col cols="12" md="auto">
                            <base-select
                                v-model="search.examType"
                                :items="sendTypeList"
                                width="180px"
                                hide-details
                                item-text="text"
                                item-value="value"
                                label="Quy trình học tập"
                            ></base-select>
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
            <template #[`item.path`]="{ item }">
                <v-btn
                    :disabled="!item.path"
                    color="primary"
                    icon
                    large
                    @click="$download(item.path)"
                >
                    <v-icon>mdi-file-download-outline</v-icon>
                </v-btn>
            </template>
            <template #[`item.examType`]="{ item }">
                <StatusItem :status-list="sendTypeList" :status="item?.examType" />
            </template>
            <template #[`item.createTime`]="{ item }">
                <span>{{ item.createTime }}</span>
            </template>
            <template #[`item.entityType`]="{ item }">
                <StatusItem :status-list="entityTypeList" :status="item?.entityType" />
            </template>
            <template #[`item.actions`]="{ item }">
                <div class="d-flex gap-3">
                    <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                            <v-icon
                                color="red"
                                dark
                                v-bind="attrs"
                                @click="handleClick(item)"
                                v-on="on"
                            >
                                mdi-trash-can
                            </v-icon>
                        </template>
                        <span>Xóa</span>
                    </v-tooltip>
                </div>
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
        <base-confirm-modal
            :open="openDelete"
            @OK="handleDelete"
            @toggle="openDelete = !openDelete"
        >
            <template #content>
                <div>Xác nhận xóa file import</div>
            </template>
        </base-confirm-modal>
    </div>
</template>
<script>
import { sendTypeList } from "~/consts/list";
import StatusItem from "~/components/Base/StatusItem.vue";
import fileStorageServices from "~/services/fileStorageServices";

const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 50,
};

const INIT_SEARCH = {
    examType: "",
};
export default {
    name: "Index",
    components: { StatusItem },
    data: () => ({
        entityTypeList: [
            { value: "AUTHORIZED_REGISTRATION", text: "DSSV được phép đăng ký", color: "green" },
            { value: "TEACHER", text: "Quản lý giảng viên", color: "green" },
            { value: "STUDENT", text: "Quản lý sinh viên", color: "green" },
            { value: "MAJOR", text: "Quản lý ngành", color: "green" },
            { value: "COURSE", text: "Quản lý khóa", color: "green" },
            { value: "CLASS", text: "Quản lý lớp", color: "green" },
            { value: "EDUCATION_PROGRAM", text: "Chương trình đào tạo", color: "green" },
            { value: "TERM", text: "Quản lý học phần", color: "green" },
        ],

        headers: [
            { value: "stt", text: "STT", sortable: false },
            { value: "path", text: "File đã import" },
            { value: "examType", text: "Quy trình học tập" },
            { value: "createTime", text: "Thời gian tạo" },
            { value: "entityType", text: "Thao tác" },
            { value: "actions", text: "Chức năng", sortable: false },
        ],
        list: [],
        pageInfo: {
            ...INIT_PAGE_INFO,
        },
        totalPage: 0,
        totalRecord: 0,
        sendTypeList,
        isLoading: false,
        openDelete: false,
        search: { ...INIT_SEARCH },
        itemToDelete: null,
    }),
    computed: {},
    created() {
        this.getList();
    },
    methods: {
        async getList() {
            try {
                this.isLoading = true;
                const res = await fileStorageServices.getList({
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

        handleClick(item) {
            this.itemToDelete = item;
            this.openDelete = true;
        },

        async handleDelete() {
            try {
                const res = await fileStorageServices.delete(this.itemToDelete.id);
                if (res.success) {
                    this.$showSuccess("Xóa file đã import thành công");
                    this.getList();
                }
            } catch (er) {
                console.log(er);
            }
            this.openDelete = false;
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
