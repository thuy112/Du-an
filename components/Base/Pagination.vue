<template>
    <div class="mt-3">
        <!--        <v-divider />-->
        <v-col :class="(depressed && 'depressed-pagination') + ' pt-0 pb-0'" cols="12">
            <v-row align="center" class="justify-sm-end justify-center fz-13" no-gutters>
                <!-- Page Size Selector -->
                <v-col class="d-flex align-center justify-end col-auto">
                    <div style="width: 100px">
                        <v-select
                            :items="pageSizeList"
                            :value="pageSize"
                            class="me-2"
                            dense
                            hide-details
                            label="Bản ghi"
                            outlined
                            @change="changePageSize"
                        ></v-select>
                    </div>
                    <!-- Custom Page Input -->
                    <v-text-field
                        v-model="customPage"
                        dense
                        style="flex: 0 1 4rem"
                        hide-details
                        label="Trang"
                        outlined
                        placeholder=" "
                        type="number"
                        @keyup.enter="checkPage($event)"
                    />
                    <v-btn
                        v-if="!offForward"
                        v-ripple
                        class="ms-2"
                        color="primary"
                        elevation="0"
                        height="33"
                        @click="changePage"
                    >
                        Đi
                    </v-btn>
                </v-col>
                <!-- Pagination -->
                <v-col :key="pageCount" cols="auto">
                    <v-pagination
                        v-model="pageIndex"
                        :length="pageCount"
                        :total-visible="10"
                        class="y--2"
                        color="primary"
                    />
                </v-col>
            </v-row>
        </v-col>
    </div>
</template>

<script>
import { pageSizeList } from "~/consts/list";

export default {
    name: "BasePagination",
    props: {
        offForward: {
            type: Boolean,
            default: false,
        },
        pageCount: {
            type: Number,
            required: true,
        },
        page: {
            type: Number,
            required: true,
        },
        pageSize: {
            type: Number,
            required: true,
        },
        depressed: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    data() {
        return {
            customPage: 1,
            rerender: Math.random(),
            pageIndex: this.page,
            pageSizeList,
        };
    },
    watch: {
        page(value) {
            this.rerender = Math.random();
            this.pageIndex = value;
        },
        pageIndex(_new) {
            this.customPage = _new;
            this.changePage();
        },
    },
    methods: {
        changePageSize(value) {
            this.customPage = 1;
            this.$emit("changePageSize", value);
        },
        checkPage(e) {
            const value = e.target.value;
            if (isNaN(value) || parseInt(value) <= 0) {
                this.customPage = 1;
            } else {
                this.customPage = parseInt(value);
            }
            this.changePage(parseInt(value));
        },
        changePage() {
            if (isNaN(this.customPage) || this.customPage < 1 || this.customPage > this.pageCount) {
                this.customPage = 1;
            }
            this.$emit("changePage", parseInt(this.customPage));
        },
        reset() {
            this.customPage = 1;
        },
    },
};
</script>

<style lang="scss" scoped>
::v-deep {
    .v-input__slot,
    .v-input__control {
        min-height: 0 !important;
        height: 32px;
    }

    .v-select__slot input {
        display: none;
    }
}
</style>
