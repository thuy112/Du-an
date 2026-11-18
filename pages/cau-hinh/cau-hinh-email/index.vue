<script>
import {
    sendTypeList,
    statusList,
    subjectSendMailList,
    actionSendTypeList,
    sendTypeSearch,
} from "~/consts/list";
import ChangeableStatus from "~/components/Base/ChangeableStatus.vue";
import mailConfigService from "~/services/mailConfigService";

const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 50,
};

const INIT_SEARCH = {
    search: null,
    status: null,
    examType: null,
};
export default {
    name: "Index",
    components: { ChangeableStatus },
    data: () => ({
        headers: [
            { value: "stt", text: "STT", sortable: false },
            { value: "name", text: "Tên", sortable: false },
            { value: "sendType", text: "Đối tượng gửi mail", align: "center", sortable: false },
            { value: "type", text: "Loại cấu hình gửi mail", align: "center", sortable: false },
            { value: "actionSendType", text: "Loại hành động", align: "center", sortable: false },
            { value: "content", text: "Nội dung", sortable: false },
            { value: "status", text: "Trạng thái", align: "center", sortable: false },
            { value: "actions", text: "Chức năng", align: "center", sortable: false },
        ],
        list: [],
        pageInfo: {
            ...INIT_PAGE_INFO,
        },
        totalPage: 0,
        totalRecord: 0,
        isLoading: false,
        statusList,
        search: { ...INIT_SEARCH },
        isOpenAction: false,
        isOpenDetail: false,
        isUpdate: false,
        isOpenDelete: false,
        isOpenReset: false,
        isLoadingReset: false,
        isLoadingDelete: false,
        selectedItem: {},
        subjectSendMailList,
        sendTypeList,
        sendTypeSearch,
        actionSendTypeList,
    }),
    computed: {},
    created() {
        this.getList();
    },
    methods: {
        async getList() {
            try {
                this.isLoading = true;
                const res = await mailConfigService.getList({
                    ...this.pageInfo,
                    ...this.search,
                    // key_word: this.search?.trim(),
                });
                if (res.success) {
                    this.list = res.data.data;
                    console.log(this.list, "list");
                    this.totalPage = res.data.totalPages;
                    this.totalRecord = res.data.totalRecords;
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
        },
        async handleChangeStatus(status, item) {
            try {
                const res = await mailConfigService.changeStatus({
                    status: status.value,
                    id: item.id,
                });
                if (res.success) {
                    this.$showSuccess("Cập nhật trạng thái thành công");
                    this.getList();
                }
            } catch (e) {
                console.error(e);
            }
        },
        async handleDelete() {
            try {
                this.isLoadingDelete = true;
                const res = await mailConfigService.delete({ id: this.selectedItem.id });
                if (res.success) {
                    this.$showSuccess("Xóa chương trình thành công");
                    this.isOpenDelete = false;
                    this.getList();
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoadingDelete = false;
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
            this.getList();
        },
        handleSearch() {
            this.pageInfo.pageIndex = 1;
            this.getList();
        },
        openAdd() {
            this.isOpenAction = true;
            this.isUpdate = false;
        },
        openUpdate(item) {
            this.isOpenAction = true;
            this.isUpdate = true;
            this.selectedItem = { ...item };
        },
        openDelete(item) {
            this.isOpenDelete = true;
            this.selectedItem = item;
        },
        openDetail(item) {
            this.isOpenDetail = true;
            this.selectedItem = item;
        },
        openReset(item) {
            this.isOpenReset = true;
            this.selectedItem = item;
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
                        Danh sách cấu hình email
                        <span class="primary--text">({{ totalRecord }})</span>
                    </v-col>

                    <v-row justify="end" dense>
                        <v-col cols="12" md="3" lg="2">
                            <v-text-field
                                v-model="search.search"
                                label="Tìm kiếm"
                                clearable
                                outlined
                                dense
                                hide-details
                            >
                            </v-text-field>
                        </v-col>

                        <v-col cols="12" md="3" lg="2">
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
                        <v-col cols="12" md="3" lg="2">
                            <v-select
                                v-model="search.examType"
                                label="Loại cấu hình gửi email"
                                clearable
                                outlined
                                :items="sendTypeSearch"
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

                            <v-tooltip bottom>
                                <template #activator="{ on, attrs }">
                                    <v-btn
                                        color="primary"
                                        elevation="0"
                                        v-bind="attrs"
                                        v-on="on"
                                        @click="openAdd"
                                    >
                                        <v-icon>mdi-plus</v-icon>
                                    </v-btn>
                                </template>
                                <span>Thêm mới</span>
                            </v-tooltip>
                        </v-col>
                    </v-row>
                </v-row>
            </template>
            <template #[`item.stt`]="{ index }">
                <span>{{ $getStt(index, pageInfo) }}</span>
            </template>
            <template #[`item.status`]="{ item }">
                <ChangeableStatus
                    :status-list="statusList"
                    :status="item.status"
                    @changeStatus="handleChangeStatus($event, item)"
                />
            </template>

            <template #[`item.type`]="{ item }">
                <BaseStatusItem :status-list="sendTypeList" :status="item.type" />
            </template>
            <template #[`item.sendType`]="{ item }">
                <BaseStatusItem :status-list="subjectSendMailList" :status="item.sendType" />
            </template>
            <template #[`item.content`]="{ item }">
                <div v-limit="2" class="content" v-html="item.content"></div>
            </template>
            <template #[`item.actionSendType`]="{ item }">
                <BaseStatusItem :status-list="actionSendTypeList" :status="item.actionSendType" />
            </template>

            <template #[`item.actions`]="{ item }">
                <div class="d-flex align-center justify-center gap-8">
                    <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                            <v-icon
                                color="blue"
                                dark
                                v-bind="attrs"
                                icon
                                v-on="on"
                                @click="openDetail(item)"
                            >
                                mdi-eye
                            </v-icon>
                        </template>
                        <span>Chi tiết</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                            <v-icon
                                color="warning"
                                dark
                                v-bind="attrs"
                                icon
                                v-on="on"
                                @click="openUpdate(item)"
                            >
                                mdi-pencil
                            </v-icon>
                        </template>
                        <span>Sửa</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                            <v-icon
                                v-bind="attrs"
                                color="red"
                                dark
                                v-on="on"
                                @click="openDelete(item)"
                            >
                                mdi-trash-can
                            </v-icon>
                        </template>
                        <span>Xóa</span>
                    </v-tooltip>
                </div>
            </template>
        </v-data-table>
        <BasePagination
            :page-size="pageInfo.pageSize"
            :page="pageInfo.pageIndex"
            :page-count="totalPage"
            @changePageSize="changePageSize"
            @changePage="changePage"
        />

        <MailConfigAction
            :open="isOpenAction"
            :is-update="isUpdate"
            :data-item="selectedItem"
            @toggle="isOpenAction = !isOpenAction"
            @success="getList"
        />

        <MailConfigDetail
            :data-detail="selectedItem"
            :open="isOpenDetail"
            @toggle="isOpenDetail = !isOpenDetail"
        />

        <BaseConfirmModal
            :open="isOpenDelete"
            :loading="isLoadingDelete"
            @toggle="isOpenDelete = !isOpenDelete"
            @OK="handleDelete"
        >
            <template #content>
                Bạn có chắc chắn muốn xóa cấu hình gửi mail
                <span class="fw-600 primary--text">{{ selectedItem.name }}</span> không?
            </template>
        </BaseConfirmModal>
    </div>
</template>

<style scoped lang="scss">
:deep .v-data-table__wrapper {
    max-height: calc(100vh - 250px);
}

::v-deep .content p {
    margin-bottom: 2px !important;
}

.content.limit-text-2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
}
.row--dense {
    margin: 15px;
}
.toolbar-actions {
    gap: 8px;
}
</style>
