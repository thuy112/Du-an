<script>
import { statusList } from "~/consts/list";
import ChangeableStatus from "~/components/Base/ChangeableStatus.vue";
import BaseConfirmModal from "~/components/Base/ConfirmModal.vue";
import retakeCourseServices from '~/services/retakeCourseServices'
import BaseDatePicker from "~/components/Base/DatePicker.vue";
import RetakeSessionAdd from "~/components/RetakeSession/Add.vue";
import RetakeSessionSetDeadline from "~/components/RetakeSession/SetDeadline.vue";

const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 50,
};

const INIT_SEARCH = {
    search: "",
    status: "",
    fromTime: "",
    toTime: "",
};
export default {
    components: {
        RetakeSessionAdd,
        RetakeSessionSetDeadline,
        BaseDatePicker,
        BaseConfirmModal,
        ChangeableStatus,
    },
    data: () => ({
        headers: [
            { value: "stt", text: "STT", sortable: false },
            // { value: "name", text: "Tên đợt đăng ký học lại ", sortable: false },
            { value: "code", text: "Mã đợt đăng ký học lại ", sortable: false },
            { value: "semester.name", text: "Học kỳ ", sortable: false },
            // { value: "terms", text: "Học phần ", sortable: false },
            { value: "time", text: "Thời gian đăng ký ", sortable: false, align: "center" },
            // {
            //     value: "paymentTime",
            //     text: "Thời gian thanh toán ",
            //     sortable: false,
            //     align: "center",
            // },
            { value: "status", text: "Trạng thái", align: "center" },
            { value: "actions", text: "Chức năng", align: "center", sortable: false },
        ],
        selectedItem: {},
        list: [],
        pageInfo: {
            ...INIT_PAGE_INFO,
        },
        totalPage: 0,
        totalRecord: 0,
        isLoading: false,
        statusList,
        openDelete: false,
        search: { ...INIT_SEARCH },
        isOpenAdd: false,
        itemToDelete: null,
        itemToSetDeadline: null,
    }),
    computed: {},
    created() {
        this.getList();
    },
    methods: {
        async handleDetail(item) {
            const res = await retakeCourseServices.getDetail(item.id);
            if (res.success) {
                this.$refs.RetakeSessionDetail.item = { ...res.data };
                this.$refs.RetakeSessionDetail.open = true;
            }
        },
        handleClick(item) {
            this.itemToDelete = item;
            this.openDelete = true;
        },
        async handleDelete() {
            try {
                const res = await retakeCourseServices.delete(this.itemToDelete.id);
                if (res.success) {
                    this.$showSuccess("Xóa thông tin thành công");
                    this.getList();
                }
            } catch (er) {
                console.log(er);
            }
            this.openDelete = false;
        },

        handleUpdate(item) {
            this.selectedItem = { ...item };
            this.$refs.RetakeSessionUpdate.open = true;
        },
        async getList() {
            try {
                this.isLoading = true;
                const res = await retakeCourseServices.getList({
                    ...this.pageInfo,
                    ...this.search,
                    // key_word: this.search?.trim(),
                });
                if (res.success) {
                    this.list = res.data.data;
                    this.totalPage = res.data?.totalPages;
                    this.totalRecord = res.data?.totalRecords;
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
        },
        async handleChangeStatus(status, item) {
            try {
                const res = await retakeCourseServices.changeStatus({
                    id: item.id,
                    status: status.value,
                });
                if (res.success) {
                    this.$showSuccess("Cập nhật trạng thái thành công");
                    await this.getList();
                }
            } catch (e) {
                console.error(e);
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

        openAdd() {
            this.$refs.RetakeSessionAdd.open = true;
        },
        handleSetDeadline(item) {
            this.itemToSetDeadline = { ...item };
            this.$refs.RetakeSessionSetDeadline.open = true;
        },
    },
};
</script>

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
                <v-row class="mb-3">
                    <v-col class="fs-17 fw-500" cols="12" md="auto">
                        Danh sách đợt học lại
                        <span class="primary--text">( {{ totalRecord }} )</span>
                    </v-col>

                    <v-row dense justify="end">
                        <v-col cols="12" md="2">
                            <base-text-field
                                v-model="search.search"
                                hide-details
                                label="Tìm kiếm theo mã đợt"
                            ></base-text-field>
                        </v-col>

                        <v-col cols="12" md="2">
                            <base-date-picker
                                v-model="search.fromTime"
                                hide-details
                                label="Từ ngày"
                            ></base-date-picker>
                        </v-col>
                        <v-col cols="12" md="2">
                            <base-date-picker
                                v-model="search.toTime"
                                hide-details
                                label="Đến ngày"
                            ></base-date-picker>
                        </v-col>
                        <v-col cols="12" md="2">
                            <base-select
                                v-model="search.status"
                                :items="statusList"
                                hide-details
                                item-text="text"
                                item-value="value"
                                label="Trạng thái"
                            ></base-select>
                        </v-col>
                        <v-col class="d-flex align-center search-actions" cols="auto">
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

                            <v-tooltip bottom>
                                <template #activator="{ on, attrs }">
                                    <v-btn
                                        color="primary"
                                        elevation="0"
                                        v-bind="attrs"
                                        @click="openAdd"
                                        v-on="on"
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
            <template #[`item.time`]="{ item }">
                <span v-if="item.fromTime">{{ $formatDate(item.fromTime) }} -</span>
                <span v-if="item.toTime"> {{ $formatDate(item.toTime) }}</span>
            </template>
            <template #[`item.status`]="{ item }">
                <ChangeableStatus
                    :status="item.status"
                    :status-list="statusList"
                    @changeStatus="handleChangeStatus($event, item)"
                />
            </template>
            <template #[`item.terms`]="{ item }">
                <ul style="list-style-type: none">
                    <li v-for="(data, i) in item.terms" :key="i" class="text-left">
                        <span> {{ data?.term?.code }} </span> -
                        <span>{{ data?.term?.name }}</span>
                    </li>
                </ul>
            </template>
            <template #[`item.actions`]="{ item }">
                <div>
                    <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                            <v-icon
                                color="blue"
                                dark
                                icon
                                v-bind="attrs"
                                @click="handleDetail(item)"
                                v-on="on"
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
                                icon
                                v-bind="attrs"
                                @click="handleUpdate(item)"
                                v-on="on"
                            >
                                mdi-pencil
                            </v-icon>
                        </template>
                        <span>Sửa</span>
                    </v-tooltip>
                    <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                            <v-icon
                                color="green"
                                dark
                                v-bind="attrs"
                                @click="handleSetDeadline(item)"
                                v-on="on"
                            >
                                mdi-clock-outline
                            </v-icon>
                        </template>
                        <span>Cài đặt thời hạn đóng</span>
                    </v-tooltip>
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
        <BasePagination
            :page="pageInfo.pageIndex"
            :page-count="totalPage"
            :page-size="pageInfo.pageSize"
            @changePage="changePage"
            @changePageSize="changePageSize"
        />
        <retake-session-update ref="RetakeSessionUpdate" :data-item="selectedItem" />
        <retake-session-add ref="RetakeSessionAdd" />
        <retake-session-detail ref="RetakeSessionDetail" />
        <retake-session-set-deadline
            ref="RetakeSessionSetDeadline"
            :data-item="itemToSetDeadline"
        />
        <base-confirm-modal
            :open="openDelete"
            @OK="handleDelete"
            @toggle="openDelete = !openDelete"
        >
            <template #content>
                <div>
                    Xác nhận xóa
                    <span class="primary--text font-weight-bold">{{ itemToDelete?.name }}</span>
                </div>
            </template>
        </base-confirm-modal>
    </div>
</template>

<style scoped>
:deep .v-data-table__wrapper {
    max-height: calc(100vh - 250px);
}
.row--dense {
    margin: 14px;
}
.search-actions {
    gap: 8px;
}
</style>
