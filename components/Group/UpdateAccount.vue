<script>
import groupServices from "~/services/groupServices"
import StatusItem from "~/components/Base/StatusItem.vue"
import { statusList } from "~/consts/list"

const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 50,
}
export default {
    name: "UpdateAccount",
    components: { StatusItem },
    props: {
        open: {
            type: Boolean,
            required: true,
        },
        selectedItem: {
            type: [Object, null],
            required: true,
        },
    },
    data: () => ({
        isLoading: false,
        pageInfo: {
            ...INIT_PAGE_INFO,
        },
        totalPage: 0,
        totalRecord: 0,
        statusList,
        list: [],
        selectedList: [],
        headers: [
            { value: "stt", text: "STT", sortable: false },
            { value: "fullName", text: "Họ tên" },
            { value: "email", text: "Email" },
            { value: "phone", text: "Số điện thoại" },
            { value: "position", text: "Chức vụ" },
            { value: "status", text: "Trạng thái", align: "center" },
        ],
        search: null,
        timeoutId: null,
    }),
    computed: {
        dataDetail() {
            return this.selectedItem.group
        },
    },
    watch: {
        open(val) {
            if (val) {
                this.search = null
                this.pageInfo = { ...INIT_PAGE_INFO }

                this.handleData(this.selectedItem)
            }
        },
        selectedItem(val) {
            if (val) {
                this.handleData(val)
            }
        },

        search(val) {
            if (!val) this.getList()
        },
    },

    mounted() {
        this.getList()
    },
    methods: {
        async getList() {
            try {
                const res = await groupServices.getListUser({
                    ...this.pageInfo,
                    key_word: this.search?.trim(),
                })
                if (res.success) {
                    this.list = res.data.data
                    this.totalPage = res.data.totalPages
                    this.totalRecord = res.data.totalRecords
                }
            } catch (e) {
                console.error(e)
            }
        },
        changePageSize(val) {
            this.pageInfo.pageIndex = 1
            this.pageInfo.pageSize = val
            this.getList()
        },
        changePage(val) {
            this.pageInfo.pageIndex = val
            this.getList()
        },
        handleDebounce() {
            if (this.timeoutId) clearTimeout(this.timeoutId)
            this.timeoutId = setTimeout(() => {
                this.getList()
            }, 500)
        },
        markSelected(selectedList, userList) {
            return userList.map((user) => {
                const isSelected = selectedList.some((item) => item.id === user.id)
                return {
                    ...user,
                    isSelected,
                }
            })
        },
        handleData(selectedItem) {
            this.list = this.markSelected(selectedItem.users, this.list)
            this.selectedList = this.list.filter((i) => i.isSelected)
        },
        async handleSubmit() {
            this.isLoading = true
            try {
                const data = {
                    userIds: this.selectedList.map((i) => i.id).join(),
                    id: this.dataDetail.id,
                }
                const res = await groupServices.addUserToGroup(data)
                if (res.success) {
                    this.$showSuccess("Cập nhật danh sách tài khoản thành công")
                    this.$emit("success")
                    this.$emit("toggle")
                }
            } catch (e) {
                console.error(e)
            }
            this.isLoading = false
        },
    },
}
</script>

<template>
    <BaseModal
        title="Cập nhật tài khoản nhóm"
        :open="open"
        :loading="isLoading"
        max-width="1200"
        @OK="handleSubmit"
        @toggle="$emit('toggle')"
    >
        <v-data-table
            v-model="selectedList"
            :headers="headers"
            :items="list"
            fixed-header
            max-height="calc(100vh - 350px)"
            no-data-text="Không có dữ liệu"
            show-select
            class="mb-3"
            hide-default-footer
            :items-per-page="pageInfo.pageSize"
            checkbox-color="primary"
        >
            <!--            :items-per-page="pageInfo.pageSize"-->
            <template #top>
                <v-toolbar flat>
                    <v-toolbar-title class="fs-17 fw-500">
                        Danh sách người dùng <span class="primary--text">({{ totalRecord }})</span>
                    </v-toolbar-title>
                    <v-divider class="mx-4" inset vertical></v-divider>
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Tìm kiếm"
                        single-line
                        clearable
                        outlined
                        dense
                        hide-details
                        @input="handleDebounce"
                    >
                    </v-text-field>
                </v-toolbar>
            </template>
            <template #[`item.stt`]="{ index }">
                <span>{{ $getStt(index, pageInfo) }}</span>
            </template>
            <template #[`item.status`]="{ item }">
                <StatusItem :status-list="statusList" :status="item.status" />
            </template>
        </v-data-table>
        <BasePagination
            :page-size="pageInfo.pageSize"
            :page="pageInfo.pageIndex"
            :page-count="totalPage"
            @changePageSize="changePageSize"
            @changePage="changePage"
        />
    </BaseModal>
</template>

<style scoped></style>
