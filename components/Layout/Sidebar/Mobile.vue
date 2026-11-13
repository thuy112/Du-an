<script>
export default {
    name: "Mobile",
    props: {
        sidebarList: {
            type: Array,
            required: true,
        },
    },
};
</script>

<template>
    <v-list>
        <template v-for="sidebar in sidebarList">
            <v-list-group v-if="sidebar.children?.length" :key="sidebar.id" color="white">
                <template #activator>
                    <v-list-item-title color="white" class="white--text fs-15">
                        <v-list-item-icon>
                            <v-icon color="white">
                                {{ sidebar.pageIcon }}
                            </v-icon>
                        </v-list-item-icon>
                        {{ sidebar.pageName }}
                    </v-list-item-title>
                </template>
                <v-list-item
                    v-for="child in sidebar.children"
                    :key="child.id"
                    link
                    :to="child.pageUrl"
                    class="pl-14 ml-5"
                >
                    <v-list-item-title class="white--text fs-15">
                        {{ child.pageName }}
                    </v-list-item-title>
                </v-list-item>
            </v-list-group>
            <v-list-item v-else :key="sidebar.id" link :to="sidebar.pageUrl">
                <v-list-item-title class="white--text fs-15">
                    <v-list-item-icon>
                        <v-icon color="white">
                            {{ sidebar.pageIcon }}
                        </v-icon>
                    </v-list-item-icon>
                    {{ sidebar.pageName }}
                </v-list-item-title>
            </v-list-item>
        </template>
    </v-list>
</template>

<style scoped></style>
