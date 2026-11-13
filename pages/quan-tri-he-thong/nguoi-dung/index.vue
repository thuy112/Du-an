<script>
import { statusList } from "~/consts/list";
import userServices from "~/services/userServices";
import ChangeableStatus from "~/components/Base/ChangeableStatus.vue";
import UserAdd from "~/components/User/Add.vue";
import UserUpdate from "~/components/User/Update.vue";
import BaseConfirmModal from "~/components/Base/ConfirmModal.vue";
import groupServices from "~/services/groupServices";
import classServices from "~/services/classServices";

const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 50,
};

const INIT_SEARCH = {
    fullName: null,
    email: null,
    status: null,
};
export default {
    name: "Index",
    components: { BaseConfirmModal, UserUpdate, UserAdd, ChangeableStatus },
    data: () => ({
        headers: [
            { value: "stt", text: "STT", sortable: false },
            // { value: "userName", text: "Tên đăng nhập" },
            { value: "fullName", text: "Họ tên" },
            { value: "email", text: "Email" },
            { value: "phone", text: "Số điện thoại" },
            { value: "position", text: "Chức vụ" },
            { value: "groups", text: "Nhóm người dùng" },
            { value: "status", text: "Trạng thái", align: "center" },
            { value: "actions", text: "Chức năng", align: "center", sortable: false },
        ],
        list: [],
        groupList: [],
        pageInfo: {
            ...INIT_PAGE_INFO,
        },
        openTransfer: false,
        transferTitle: "",
        classExist: [],
        classList: [],
        totalPage: 0,
        totalRecord: 0,
        isLoading: false,
        statusList,
        search: { ...INIT_SEARCH },
        isOpenAdd: false,
        isOpenUpdate: false,
        isOpenAssign: false,
        isOpenApproval: false,
        isOpenClassList: false,
        isOpenDetail: false,
        isOpenDelete: false,
        isOpenReset: false,
        isLoadingReset: false,
        isLoadingDelete: false,
        selectedItem: {},
    }),
    computed: {},
    created() {
        this.getList();
        this.getGroupList();
        this.getClass();
    },
    methods: {
        async getClass() {
            try {
                const res = await classServices.getList({
                    pageSize: 100,
                    pageIndex: 1,
                    status: "ACTIVE",
                });
                if (res.success) {
                    this.classList = res.data.data.filter((i) => i.course);
                }
            } catch (er) {
                console.log(er);
            }
        },
        handleSave() {},
        async openAssignClass(item) {
            this.transferTitle = `Gán lớp sinh viên cho Cán Bộ Quản Lý - ${item.fullName}`;
            this.openTransfer = true;
            const res = await userServices.getListClassByUser(item.id);
            if (res.success) {
                console.log(res.data);
            }
        },
        async getList() {
            try {
                this.isLoading = true;
                const res = await userServices.getList({
                    ...this.pageInfo,
                    ...this.search,
                    // key_word: this.search?.trim(),
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
        async handleChangeStatus(status, item) {
            try {
                const res = await userServices.changeStatus({
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
                const res = await userServices.delete({ id: this.selectedItem.id });
                if (res.success) {
                    this.$showSuccess("Xóa người dùng thành công");
                    this.isOpenDelete = false;
                    this.getList();
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoadingDelete = false;
        },

        async handleResetPassword() {
            try {
                this.isLoadingReset = true;
                const res = await userServices.resetPassword({ id: this.selectedItem.id });
                if (res.success) {
                    this.$showSuccess("Reset mật khẩu người dùng thành công");
                    this.isOpenReset = false;
                    this.getList();
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoadingReset = false;
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
            this.isOpenAdd = true;
        },
        openUpdate(item) {
            this.isOpenUpdate = true;
            this.selectedItem = item;
        },
        openAssign(item) {
            this.isOpenAssign = true;
            this.selectedItem = item;
        },
        // @@@ duyệt đơn phân quyền
        openApproval(item) {
            this.isOpenApproval = true;
            this.selectedItem = item;
        },
        openClassList(item) {
            this.isOpenClassList = true;
            this.selectedItem = item;
        },
        openDetail(item) {
            this.isOpenDetail = true;
            this.selectedItem = item;
        },
        openDelete(item) {
            this.isOpenDelete = true;
            this.selectedItem = item;
        },
        openReset(item) {
            this.isOpenReset = true;
            this.selectedItem = item;
        },
        async getGroupList() {
            try {
                this.isLoading = true;
                const res = await groupServices.getList();
                if (res.success) {
                    this.groupList = res.data;
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
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
                                v-model="search.fullName"
                                label="Họ tên"
                                clearable
                                outlined
                                dense
                                hide-details
                            >
                            </v-text-field>
                        </v-col>
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
                        <v-col cols="auto" class="d-flex align-center gap-8">
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

            <template #[`item.fullName`]="{ item }">
                <div class="d-flex align-center gap-6 py-1">
                    <img
                        :src="item.avatar || '/images/avatar_default.png'"
                        class="rounded-circle cover"
                        height="50"
                        width="50"
                        :alt="item.fullName"
                        onerror="this.src='/images/avatar_default.png'"
                    />
                    <div class="primary--text font-weight-bold">{{ item?.fullName }}</div>

                    <!--                    <div class="">-->
                    <!--                        Số điện thoại:-->
                    <!--                        <span class="primary&#45;&#45;text font-weight-bold">{{ item?.phone }}</span>-->
                    <!--                    </div>-->
                    <!--                    <div v-if="item.birthday">-->
                    <!--                        Ngày sinh:-->
                    <!--                        <span class="primary&#45;&#45;text font-weight-bold">{{-->
                    <!--                            $formatDate(item.birthday)-->
                    <!--                        }}</span>-->
                    <!--                    </div>-->
                    <!--                    <div class="">-->
                    <!--                        Email:-->
                    <!--                        <span class="primary&#45;&#45;text font-weight-bold"> {{ item?.email }}</span>-->
                    <!--                    </div>-->
                    <!--                    <div class="">-->
                    <!--                        Chức vụ:-->
                    <!--                        <span class="primary&#45;&#45;text font-weight-bold"> {{ item?.position }}</span>-->
                    <!--                    </div>-->
                </div>
            </template>
            <template #[`item.groups`]="{ item }">
                {{ item.groups?.map((i) => i.groupName)?.join() }}
            </template>
            <template #[`item.status`]="{ item }">
                <ChangeableStatus
                    :status-list="statusList"
                    :status="item.status"
                    @changeStatus="handleChangeStatus($event, item)"
                />
            </template>
            <template #[`item.actions`]="{ item }">
                <v-menu bottom nudge-bottom="20">
                    <template #activator="{ on, attrs }">
                        <v-btn icon v-bind="attrs" v-on="on">
                            <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                    </template>

                    <v-list dense>
                        <v-list-item @click="openDetail(item)">
                            <v-list-item-icon class="mr-2">
                                <v-icon color="cyan" size="20">mdi-eye</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Chi tiết</v-list-item-title>
                        </v-list-item>

                        <v-list-item @click="openAssign(item)">
                            <v-list-item-icon class="mr-2">
                                <v-icon color="teal" size="20">mdi-table-account</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Gán lớp sinh viên</v-list-item-title>
                        </v-list-item>

                        <v-list-item @click="openApproval(item)">
                            <v-list-item-icon class="mr-2">
                                <v-icon color="teal" size="20">mdi-account-cog</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Phân quyền duyệt đơn</v-list-item-title>
                        </v-list-item>

                        <v-list-item @click="openClassList(item)">
                            <v-list-item-icon class="mr-2">
                                <v-icon color="green" size="20">mdi-list-box</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Lớp quản lý</v-list-item-title>
                        </v-list-item>
                        <!--                        <v-list-item :to="$route.path + `/${item.id}/giang-vien`">-->
                        <!--                            <v-list-item-icon class="mr-2">-->
                        <!--                                <v-icon color="blue" size="20">mdi-account-tie-hat-outline</v-icon>-->
                        <!--                            </v-list-item-icon>-->
                        <!--                            <v-list-item-title>Gán giảng viên</v-list-item-title>-->
                        <!--                        </v-list-item>-->

                        <v-list-item @click="openUpdate(item)">
                            <v-list-item-icon class="mr-2">
                                <v-icon color="warning" size="20">mdi-pencil</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Cập nhật</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="openReset(item)">
                            <v-list-item-icon class="mr-2">
                                <v-icon color="success" size="20"
                                    >mdi-account-convert-outline
                                </v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Reset mật khẩu</v-list-item-title>
                        </v-list-item>
                        <v-list-item color="teal" @click="openDelete(item)">
                            <v-list-item-icon class="mr-2">
                                <v-icon color="red" size="20">mdi-trash-can</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Xóa</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
        </v-data-table>
        <v-row dense>
            <!--            <BaseBtnExport />-->
            <v-spacer />
            <BasePagination
                :page-size="pageInfo.pageSize"
                :page="pageInfo.pageIndex"
                :page-count="totalPage"
                @changePageSize="changePageSize"
                @changePage="changePage"
            />
        </v-row>

        <UserAdd
            :open="isOpenAdd"
            :group-list="groupList"
            @toggle="isOpenAdd = !isOpenAdd"
            @success="getList"
        />
        <UserUpdate
            :open="isOpenUpdate"
            :data-detail="selectedItem"
            :group-list="groupList"
            @toggle="isOpenUpdate = !isOpenUpdate"
            @success="getList"
        />

        <UserAssign
            :open="isOpenAssign"
            :data-detail="selectedItem"
            @toggle="isOpenAssign = !isOpenAssign"
            @success="getList"
        />

        <UserApproval
            :open="isOpenApproval"
            :data-detail="selectedItem"
            @toggle="isOpenApproval = !isOpenApproval"
            @success="getList"
        />

        <UserClassList
            :open="isOpenClassList"
            :data-detail="selectedItem"
            @toggle="isOpenClassList = !isOpenClassList"
            @success="getList"
        />

        <UserDetail
            :open="isOpenDetail"
            :data-detail="selectedItem"
            @toggle="isOpenDetail = !isOpenDetail"
        />

        <BaseConfirmModal
            :open="isOpenDelete"
            :loading="isLoadingDelete"
            @toggle="isOpenDelete = !isOpenDelete"
            @OK="handleDelete"
        >
            <template #content>
                Bạn có chắc chắn muốn xóa người dùng
                <span class="fw-600 primary--text">{{ selectedItem.fullName }}</span> không?
            </template>
        </BaseConfirmModal>

        <BaseConfirmModal
            :open="isOpenReset"
            color="primary"
            :loading="isLoadingReset"
            @toggle="isOpenReset = !isOpenReset"
            @OK="handleResetPassword"
        >
            <template #content>
                Bạn có chắc chắn muốn reset mật khẩu về
                <span class="fw-600 primary--text">123@123a</span> của người dùng
                <span class="fw-600 primary--text">{{ selectedItem.fullName }}</span> không?
            </template>
        </BaseConfirmModal>
    </div>
</template>

<style scoped>
:deep .v-data-table__wrapper {
    max-height: calc(100vh - 250px);
}
</style>
