<script>
export default {
    name: "ChangeableStatus",
    components: {},
    props: {
        status: {
            type: [Number, String],
            required: true,
        },
        statusList: {
            type: Array,
            required: true,
        },
        content: {
            type: String,
            default: "",
        },
        noNeedConfirm: {
            type: Boolean,
            default: false,
        },
    },
    data: () => ({
        isOpenConfirm: false,
        selectedItem: {},
        menuOpen: false,
    }),
    computed: {
        restStatusList() {
            return this.statusList.filter((i) => i.value !== this.status);
        },
    },
    mounted() {
        window.addEventListener("wheel", this.handleScroll);
    },
    beforeDestroy() {
        // Remove scroll event listener from window
        window.removeEventListener("wheel", this.handleScroll);
    },
    methods: {
        handleScroll() {
            setTimeout(() => {
                this.menuOpen = false;
            }, 90);
        },
        getStatusColor(status) {
            const statusObj = this.statusList.find((s) => s.value === status);
            return statusObj ? statusObj.color : "info";
        },
        getStatusText(status) {
            const statusObj = this.statusList.find((s) => s.value === status);
            return statusObj ? statusObj.text : "";
        },

        openConfirm(item) {
            this.selectedItem = item;
            if (this.noNeedConfirm) {
                this.$emit("changeStatus", item);
                return;
            }

            this.isOpenConfirm = true;
        },
        toggleConfirm() {
            this.isOpenConfirm = false;
        },
        //   $emit('changeStatus', item)
    },
};
</script>

<template>
    <div>
        <v-menu v-model="menuOpen" offset-y>
            <template #activator="{ on, attrs }">
                <v-chip
                    class="ma-2 white--text"
                    :color="getStatusColor(status)"
                    v-bind="attrs"
                    small
                    v-on="on"
                >
                    {{ getStatusText(status) }}
                    <v-icon right> mdi-menu-down</v-icon>
                </v-chip>
            </template>
            <v-list>
                <v-list-item v-for="(item, index) in restStatusList" :key="index" dense class="cp">
                    <v-list-item-title class="pointer" @click="openConfirm(item)">
                        {{ item.text }}
                    </v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
        <BaseConfirmModal
            :open="isOpenConfirm"
            color="primary"
            @toggle="toggleConfirm"
            @OK="
                $emit('changeStatus', selectedItem);
                isOpenConfirm = false;
            "
        >
            <template #content>
                <slot name="content" :data="selectedItem">
                    Bạn có chắc chắn muốn đổi trạng thái từ
                    <span class="fw-600 primary--text">{{ getStatusText(status) }}</span> sang
                    <span class="fw-600 primary--text">{{ selectedItem.text }}</span> không?
                </slot>
            </template>
        </BaseConfirmModal>
    </div>
</template>

<style scoped lang="scss"></style>
