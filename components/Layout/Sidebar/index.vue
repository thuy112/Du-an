<script>
import Logo from "~/components/Layout/Sidebar/Logo.vue";

export default {
    name: "Sidebar",
    components: { Logo },

    props: {
        sidebarList: {
            type: Array,
            required: true,
        },
        drawer: {
            type: Boolean,
        },
    },
    data: () => ({ sidebarChildList: [], currentPage: null, first: true }),
    methods: {
        handleOpen(item, currentPage) {
            // lan dau mo tab
            if (this.first) {
                this.currentPage = currentPage;
                this.$emit("open", item);
                this.first = false;
                return;
            }
            if (this.currentPage === currentPage) {
                this.drawer ? this.$emit("close") : this.$emit("open", item);
            } else {
                this.currentPage = currentPage;
                this.$emit("open", item);
            }
        },
        isItemActive(item) {
            // Check if the current route matches the item's pageUrl
            return this.$route.path.includes(item.pageUrl);
        },
    },
};
</script>

<template>
    <div class="z-index: 1000 !important">
        <v-list class="px-1" dense expand nav>
            <div
                class="align-center d-flex pl-4 pr-6 justify-center"
                style="position: fixed; z-index: 9999; background-color: #a2212b"
            >
                <Logo />
            </div>
            <v-divider class="mb-2" />
            <div v-if="$vuetify.breakpoint.lgAndUp" style="margin-top: 64px"></div>
            <template v-for="item in sidebarList">
                <v-list-item
                    v-if="item.children"
                    :key="item.id"
                    :class="{ 'v-list-item--active': isItemActive(item) }"
                    class="py-1 text--white"
                    color="white"
                    @click.stop="handleOpen(item.children, item.id)"
                >
                    <v-list-item-content :class="{ active: isItemActive(item) }">
                        <div class="d-flex flex-column align-center justify-center">
                            <v-icon color="white">{{ item.pageIcon }}</v-icon>
                            <div class="text-center fs-13 white--text">{{ item.pageName }}</div>
                        </div>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item
                    v-else
                    :key="item.id"
                    :to="item.pageUrl"
                    class="py-1"
                    color="white"
                    @click="$emit('close')"
                >
                    <v-list-item-content>
                        <div class="d-flex flex-column align-center justify-center">
                            <v-icon :color="'white'">{{ item.pageIcon }}</v-icon>
                            <div class="text-center fs-13 white--text">
                                {{ item.pageName }}
                            </div>
                        </div>
                    </v-list-item-content>
                </v-list-item>
            </template>
        </v-list>
    </div>
</template>

<style scoped></style>
