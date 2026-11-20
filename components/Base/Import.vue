<!-- eslint-disable vue/no-v-html -->
<template>
    <v-dialog :max-width="list.length !== 0 ? width : 650" :value="open" persistent scrollable>
        <v-card rounded="lg">
            <v-card-title class="d-flex align-center justify-space-between">
                <div class="text-h6">
                    <slot name="title">
                        {{ title }}
                    </slot>
                </div>
                <v-icon v-ripple @click="$emit('close')">mdi-close</v-icon>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="my-5">
                <v-row dense style="font-size: 0.875rem">
                    <v-col
                        v-if="templateUrl && !templateErrorUrl && list.length === 0"
                        cols="12"
                        style="text-overflow: ellipsis"
                    >
                        <p>
                            Tải file mẫu ở đây:
                            <span
                                class="blue--text pointer text-decoration-underline"
                                @click="$download(templateUrl)"
                                >{{ $fileName(templateUrl) }}</span
                            >
                        </p>
                    </v-col>
                    <v-col
                        v-if="templateErrorUrl"
                        cols="12"
                        class="d-flex flex-column align-center"
                        style="text-overflow: ellipsis"
                    >
                        <p class="error--text">{{ errMsg }}</p>
                        <p>
                            Link file lỗi chi tiết:
                            <span
                                class="blue--text pointer text-decoration-underline"
                                @click="$download(templateErrorUrl)"
                                >{{ $fileName(templateErrorUrl) }}</span
                            >
                        </p>
                    </v-col>
                    <v-col v-if="list.length !== 0 && !templateErrorUrl.length" class="text-center">
                        <p class="green--text">
                            File hợp lệ
                            <v-icon class="ml-1" color="green"> mdi-check-circle</v-icon>
                        </p>
                    </v-col>
                    <v-col cols="12">
                        <v-fade-transition leave-absolute>
                            <v-sheet
                                v-if="!file"
                                v-ripple
                                class="mx-1 rounded d-flex flex-column align-center py-3"
                                style="border: 1.4px dashed var(--primary); min-height: 5.1rem"
                                @click="handleUpload"
                            >
                                <v-icon v-if="!file" class="pointer" color="#E53935" large>
                                    mdi-plus-circle
                                </v-icon>
                                <span v-if="!file">Chọn tệp đính kèm</span>
                            </v-sheet>
                        </v-fade-transition>
                        <v-scale-transition>
                            <v-file-input
                                ref="file"
                                v-model="file"
                                :style="showFile ? '' : 'display:none'"
                                accept=".xlsx,.xls"
                                append-icon="mdi-microsoft-excel"
                                background-color="green lighten-5"
                                class="align-self-baseline mx-1"
                                clearable
                                color="green"
                                dense
                                filled
                                flat
                                hide-details
                                placeholder="Chọn file"
                                prepend-icon=""
                                solo
                                style="z-index: 100"
                                truncate-length="30"
                            />
                        </v-scale-transition>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col v-if="$slots.additionalContent" cols="12">
                        <slot name="additionalContent"></slot>
                    </v-col>
                    <v-col class="d-flex justify-space-between align-end">
                        <slot v-if="$slots.additionalInput" name="additionalInput"></slot>
                        <v-text-field
                            v-if="list.length !== 0"
                            v-model="search"
                            style="margin-left: auto; max-width: 300px"
                            append-icon="mdi-magnify"
                            label="Tìm kiếm"
                            single-line
                            hide-details
                        ></v-text-field>
                    </v-col>

                    <v-col
                        v-if="list.length !== 0"
                        cols="12"
                        class="d-flex flex-column justify-end align-content-end"
                    >
                        <v-data-table
                            :headers="headers"
                            :items="list"
                            :search="search"
                            :page.sync="pageInfo.pageIndex"
                            :items-per-page="pageInfo.pageSize"
                            checkbox-color="primary"
                            fixed-header
                            hide-default-footer
                            @page-count="totalPage = $event"
                        >
                            <template #[`item.stt`]="{ index }">
                                <span>{{
                                    pageInfo.pageSize * (pageInfo.pageIndex - 1) + index + 1
                                }}</span>
                            </template>
                            <template #[`item.messageError`]="{ item }">
                                <div v-html="item?.messageError"></div>
                            </template>
                            <template #[`item.gender`]="{ item }">
                                {{ $getText(item?.gender, genderList()) }}
                            </template>
                            <template #[`item.birthday`]="{ item }">
                                {{ $formatDate(item?.birthday) }}
                            </template>
                            <template #[`item.status`]="{ item }">
                                <v-chip
                                    v-if="item.status"
                                    small
                                    :color="statusObject(item?.status)?.color || `blue`"
                                    >{{ statusObject(item?.status)?.text }}
                                </v-chip>
                            </template>
                        </v-data-table>

                        <BasePagination
                            off-forward
                            :page="pageInfo.pageIndex"
                            :page-count="totalPage"
                            :page-size="pageInfo.pageSize"
                            @changePage="changePage"
                            @changePageSize="changePageSize"
                        />
                    </v-col>
                </v-row>
            </v-card-text>

            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer />
                <v-btn
                    class="white--text"
                    :loading="loading"
                    color="#C62828"
                    elevation="0"
                    @click="handleImport"
                >
                    {{ Action }}
                </v-btn>
                <v-btn text @click="$emit('close')"> Đóng</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<!-- eslint-disable vue/require-default-prop -->
<script>
import { genderList, statusList } from "~/consts/list";
import BasePagination from "~/components/Base/Pagination.vue";

export default {
    name: "BaseImport",
    components: { BasePagination },
    props: {
        width: {
            type: [Number, String],
            default: 750,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        templateUrl: {
            type: String,
        },
        templateErrorUrl: {
            type: String,
        },
        title: {
            type: String,
            default: () => "Nhập file excel",
        },
        open: {
            type: Boolean,
            default: () => false,
            required: true,
        },
        statusList: {
            type: Array,
            default: () => statusList,
        },
    },

    emits: ["import", "close", "save"],
    data: () => ({
        pageInfo: {
            pageIndex: 1,
            pageSize: 50,
        },
        search: "",
        totalPage: 0,
        file: null,
        errMsg: "",
        headers: [],
        list: [],
        showFile: false,
    }),
    computed: {
        Action() {
            return this.list.length !== 0 && !this.templateErrorUrl ? "Lưu" : "Import";
        },
        fileName() {
            return this.templateUrl.match(/[^/]+$/)[0];
        },
    },
    watch: {
        open(newVal) {
            if (!newVal) {
                Object.assign(this.$data, this.$options.data());
            }
        },

        file(newVal) {
            if (!newVal) {
                this.showFile = false;
                return;
            }
            this.showFile = true;
        },
        headers(newVal) {
            if (!this.templateErrorUrl) {
                this.showFile = false;
            }
        },
    },
    methods: {
        changePageSize(val) {
            this.pageInfo.pageIndex = 1;
            this.pageInfo.pageSize = val;
        },
        changePage(val) {
            this.pageInfo.pageIndex = val;
        },
        genderList() {
            return genderList;
        },
        statusObject(status) {
            const item = this.statusList.find((item) => item.value === status);
            if (!item) return;
            return item;
        },

        handleImport() {
            if (this.list.length !== 0 && !this.templateErrorUrl)
                return this.$emit("save", this.list);

            if (!this.file) {
                this.$showWarning("Vui lòng upload file trước");
                return;
            }
            this.$emit("import", this.file);
        },
        handleUpload() {
            this.$refs.file.$refs.input.click();
        },
    },
};
</script>
<style scoped>
:deep .v-data-table__wrapper {
    max-height: calc(100vh - 500px);
}
</style>
