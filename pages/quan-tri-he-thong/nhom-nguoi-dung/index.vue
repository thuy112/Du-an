<script>
import groupServices from "~/services/groupServices";
import { toSlug } from "~/utils/heppers";
import NoData from "~/components/NoData.vue";
import Info from "~/components/Group/Info.vue";
import Account from "~/components/Group/Account.vue";

export default {
    name: "Index",
    components: { Account, Info, NoData },
    data: () => ({
        selectedItemId: null,
        selectedItem: {},
        search: null,
        isLoading: false,
        isOpenAdd: false,
        isLoadingDetail: false,
        groupList: [],
        tab: null,
    }),
    computed: {
        computedGroupList() {
            return this.groupList.filter((group) =>
                toSlug(group.groupName).includes(toSlug(this.search?.trim() || ""))
            );
        },
    },
    created() {
        this.getGroupList();
    },
    methods: {
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
        async getGroupDetail(groupId) {
            if (!groupId) return;
            try {
                this.isLoadingDetail = true;
                const res = await groupServices.getDetail({ id: groupId });
                if (res.success) {
                    this.selectedItem = res.data;
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoadingDetail = false;
        },
        handleChange(groupId) {
            this.getGroupDetail(groupId);
        },
    },
};
</script>

<template>
    <v-row align="stretch" class="h-100" dense>
        <v-col cols="12" md="4">
            <v-card elevation="0" rounded="lg" class="h-100 Card-border" :loading="isLoading">
                <v-card-title class="d-flex justify-space-between">
                    <div>Nhóm người dùng</div>
                    <v-btn color="primary" class="rounded-lg" @click="isOpenAdd = true"
                        >Thêm mới
                        <v-icon right>mdi-plus</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <v-list dense flat>
                        <v-text-field
                            v-model="search"
                            placeholder="Tìm kiếm"
                            clearable
                            outlined
                            dense
                            clear-icon="mdi-close-circle"
                        />
                        <v-list-item-group
                            v-model="selectedItemId"
                            mandatory
                            color="primary"
                            @change="handleChange"
                        >
                            <template v-if="computedGroupList.length">
                                <v-list-item
                                    v-for="group in computedGroupList"
                                    :key="group.id"
                                    :value="group.id"
                                >
                                    <v-list-item-content>
                                        <v-list-item-title>
                                            {{ group.groupName }}
                                        </v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                            </template>
                            <NoData v-else />
                        </v-list-item-group>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-col>
        <v-col cols="12" md="8">
            <v-card elevation="0" class="h-100 Card-border" rounded="lg" :loading="isLoadingDetail">
                <v-card-text>
                    <v-tabs v-model="tab" grow>
                        <v-tab> Thông tin nhóm</v-tab>
                        <v-tab> Tài khoản nhóm</v-tab>
                    </v-tabs>
                    <v-tabs-items v-model="tab">
                        <v-tab-item>
                            <Info
                                :selected-item="selectedItem"
                                @update:success="getGroupList"
                                @update:delete="getGroupList"
                            />
                        </v-tab-item>
                        <v-tab-item>
                            <Account
                                :selected-item="selectedItem"
                                @success="handleChange(selectedItemId)"
                            />
                        </v-tab-item>
                    </v-tabs-items>
                </v-card-text>
            </v-card>
        </v-col>
        <GroupAdd :open="isOpenAdd" @toggle="isOpenAdd = !isOpenAdd" @success="getGroupList" />
    </v-row>
</template>

<style scoped>
.v-list-item--active {
    background: var(--primary);
    color: white;
    border-radius: 4px;
}

:deep .v-data-table__wrapper {
    max-height: calc(100vh - 250px);
}
</style>
