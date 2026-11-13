<script>
import { statusList } from "~/consts/list"
import StatusItem from "~/components/Base/StatusItem.vue"
import UpdateAccount from "~/components/Group/UpdateAccount.vue"

const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 20,
}
export default {
    name: "Account",
    components: { UpdateAccount, StatusItem },
    props: {
        selectedItem: {
            type: [Object, null],
            required: true,
        },
    },
    data: () => ({
        headers: [
            { value: "stt", text: "STT", sortable: false },
            { value: "fullName", text: "Họ tên" },
            { value: "email", text: "Email" },
            { value: "phone", text: "Số điện thoại" },
            { value: "position", text: "Chức vụ" },
            { value: "status", text: "Trạng thái", align: "center" },
        ],
        statusList,

        pageInfo: {
            ...INIT_PAGE_INFO,
        },
        isOpenUpdate: false,
    }),
    methods: {
        updatePageCount(pageCount) {
            this.totalItems = pageCount * this.itemsPerPage
        },
        changePageSize(val) {
            this.pageInfo.pageIndex = 1
            this.pageInfo.pageSize = val
        },
        changePage(val) {
            this.pageInfo.pageIndex = val
        },
    },
}
</script>

<template>
    <div>
        <v-data-table
            :headers="headers"
            :items="selectedItem?.users"
            fixed-header
            height="calc(100vh - 240px)"
            no-data-text="Không có dữ liệu"
            hide-default-footer
            disable-pagination
        >
            <!--            :items-per-page="pageInfo.pageSize"-->
            <template #top>
                <v-toolbar flat>
                    <v-toolbar-title class="fs-17 fw-500"
                        >Danh sách người dùng
                        <span class="primary--text">({{ selectedItem?.users?.length }})</span>
                    </v-toolbar-title>
                    <v-divider class="mx-4" inset vertical></v-divider>
                    <!--                    <v-text-field-->
                    <!--                        v-model="search"-->
                    <!--                        append-icon="mdi-magnify"-->
                    <!--                        label="Tìm kiếm"-->
                    <!--                        single-line-->
                    <!--                        clearable-->
                    <!--                        outlined-->
                    <!--                        dense-->
                    <!--                        hide-details-->
                    <!--                    >-->
                    <!--                    </v-text-field>-->
                    <v-spacer />
                    <v-btn color="primary" elevation="0" class="ml-2" @click="isOpenUpdate = true"
                        >Cập nhật danh sách tài khoản
                    </v-btn>
                </v-toolbar>
            </template>
            <template #[`item.stt`]="{ index }">
                <span>{{ index + 1 }}</span>
            </template>
            <template #[`item.status`]="{ item }">
                <StatusItem :status-list="statusList" :status="item.status" />
            </template>
        </v-data-table>
        <!--        <BasePagination-->
        <!--            :page-size="pageInfo.pageSize"-->
        <!--            :page="pageInfo.pageIndex"-->
        <!--            page-count=""-->
        <!--            @changePageSize="changePageSize"-->
        <!--            @changePage="changePage"-->
        <!--        />-->

        <UpdateAccount
            :open="isOpenUpdate"
            :selected-item="selectedItem"
            @toggle="isOpenUpdate = !isOpenUpdate"
            @success="$emit('success')"
        />
    </div>
</template>

<style scoped></style>
