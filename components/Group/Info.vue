<script>
import BaseConfirmModal from "~/components/Base/ConfirmModal.vue"
import groupServices from "~/services/groupServices"
import { isEmptyObject } from "~/utils/heppers"

export default {
  name: "Info",
  components: { BaseConfirmModal },
  props: {
    selectedItem: {
      type: [Object, null],
      required: true
    }
  },
  data: () => ({
    description: null,
    groupName: null,
    isOpenDelete: false,
    isLoadingDelete: false,
    roleList: [],
    allRoleList: [],
    selectedRoleList: [],
    computedRoleList: [],
    selectedPage: {},
    pageList: [],
    allPageList: [],
    selectedPageList: [],
    pageHeader: [{ value: "pageName", text: "TRANG", sortable: false }],
    isLoading: false
  }),
  computed: {
    dataDetail() {
      return this.selectedItem.group
    },
    roleHeader() {
      return isEmptyObject(this.selectedPage)
        ? [
          {
            value: "roleName",
            text: "CHỨC NĂNG",
            sortable: false
          }
        ]
        : [
          {
            value: "roleName",
            text: "CHỨC NĂNG" + " trang " + this.selectedPage.pageName?.toUpperCase(),
            sortable: false
          }
        ]
    }
  },
  watch: {
    dataDetail(val) {
      if (val) {
        this.description = val.description
        this.groupName = val.groupName
      }
    },
    selectedItem(val) {
      if (val) {
        this.handleData(val)
        this.watchRole()
        this.watchPage()
        this.computedRoleList = []
        this.selectedRoleList = []
      }
      this.selectedPage = null
    },
    selectedRoleList(val) {
      if (this.selectedPage) {
        this.selectedPage.isSelected = !!val.length
        this.watchPage()
      }
    }
  },
  created() {
    this.getListPage()
  },
  methods: {
    async handleDelete() {
      try {
        this.isLoadingDelete = true
        const res = await groupServices.delete({ id: this.dataDetail.id })
        if (res.success) {
          this.$showSuccess("Xóa nhóm người dùng thành công")
          this.$emit("update:delete")
          this.isOpenDelete = false
        }
      } catch (e) {
        console.error(e)
      }
      this.isLoadingDelete = false
    },

    async getListPage() {
      try {
        const res = await groupServices.getListPage()
        if (res.success) {
          this.allRoleList = res.data.roles
          this.allPageList = res.data.pages
          //   this.markSelectedRoles(
          //     this.selectedItem.group_page_infos,
          //     res.data.page_roles
          // )
          // this.pageList = this.combineData(res.data.pages, res.data.page_roles)
        }
      } catch (e) {
        console.error(e)
      }
    },
    handleClickPage(item) {
      this.selectedPage = item
      this.computedRoleList = item.roles
      this.watchRole(item)
    },
    watchPage() {
      this.selectedPageList = this.pageList.filter((i) => i.isSelected)
    },
    watchRole() {
      this.selectedRoleList = this.computedRoleList.filter((i) => i.isSelected)
    },

    handleSelectPage(item) {
      this.handleClickPage(item.item)
      item.item.roles.forEach((role) => (role.isSelected = item.value))
      this.watchRole()
    },
    handleSelectRole(item) {
      item.item.isSelected = item.value
    },
    combineData(pageList, rolesList) {
      pageList = this.markSelectedPages(this.selectedItem.pageRoles, pageList)
      // Create a map to store roles by pageId
      const rolesMap = {}
      rolesList.forEach((role) => {
        if (!rolesMap[role.pageId]) {
          rolesMap[role.pageId] = []
        }
        rolesMap[role.pageId].push(role)
      })

      // Combine pageList with roles
      const combinedData = pageList.map((page) => {
        const roles = rolesMap[page.id] || []
        return {
          ...page,
          roles
        }
      })

      return combinedData
    },
    markSelectedRoles(selectedList, rolesList) {
      return rolesList.map((role) => {
        const isSelected = selectedList.some((item) => item.roleId === role.id)
        return {
          ...role,
          isSelected
        }
      })
    },
    markSelectedPages(selectedList, pagesList) {
      return pagesList.map((page) => {
        const isSelected = selectedList.some((item) => item.id === page.id)
        return {
          ...page,
          isSelected
        }
      })
    },
    handleData(selectedItem) {
      this.roleList = this.markSelectedRoles(selectedItem.pageRoles, this.allRoleList)

      this.pageList = this.combineData(this.allPageList, this.roleList)
    },
    handleSelectAllPage(item) {
      this.pageList.forEach((i) => {
        i.isSelected = item.value
        i.roles.forEach((j) => {
          j.isSelected = item.value
        })
      })
      this.watchRole()
    },
    handleSelectAllRole(item) {
      this.computedRoleList.forEach((i) => (i.isSelected = item.value))
    },
    async handleSave() {
      const valid = this.$refs.form.validate()
      if (!valid) return
      this.isLoading = true
      try {
        const data = {
          groupId: this.dataDetail.id,
          groupName: this.groupName,
          description: this.description,
          status: 1,
          groupPage: this.pageList
            .filter((i) => i.isSelected)
            .map((i) =>
              i.roles
                .filter((ich) => ich.isSelected)
                .map((ich) => `${i.id}-${ich.id}`)
            )
            .join(",")
        }

        if (!data.groupPage) {
          this.$showWarning("Vui lòng chọn ít nhất 1 trang")
          this.isLoading = false
          return
        }
        const res = await groupServices.update(data)
        if (res.success) {
          this.$showSuccess("Cập nhật nhóm người dùng thành công")
          this.$mitt.emit("getRoles")
          this.$emit("update:success")
        }
      } catch (e) {
        console.error(e)
      }
      this.isLoading = false
    }
  }
}
</script>

<template>
  <v-sheet>
    <v-form ref="form" lazy-validation @submit.prevent>
      <v-row class="ma-0">
        <v-col cols="12" class="d-flex gap-8">
          <v-spacer />
          <v-btn color="error" elevation="0" @click="isOpenDelete = true">
            Xóa
            <v-icon right>mdi-delete-outline</v-icon>
          </v-btn>
          <v-btn
            color="primary"
            elevation="0"
            :loading="isLoading"
            type="submit"
            @click="handleSave"
          >
            Lưu
            <v-icon right>mdi-content-save-outline</v-icon>
          </v-btn>
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="groupName"
            color="primary"
            label=""
            outlined
            clearable
            dense
            clear-icon="mdi-close-circle"
            :rules="[(v) => !!v || 'Vui lòng nhập tên nhóm']"
          >
            <template #label> Tên nhóm <span class="red--text">(*)</span></template>
          </v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="description"
            color="primary"
            label=""
            outlined
            clearable
            dense
            clear-icon="mdi-close-circle"
            :rules="[(v) => !!v || 'Vui lòng nhập mô tả']"
          >
            <template #label> Mô tả <span class="red--text">(*)</span></template>
          </v-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <v-data-table
            v-model="selectedPageList"
            :headers="pageHeader"
            :items="pageList"
            disable-pagination
            hide-default-footer
            fixed-header
            height="500"
            show-select
            checkbox-color="primary"
            no-data-text="Không có dữ liệu"
            @click:row="handleClickPage"
            @item-selected="handleSelectPage"
            @toggle-select-all="handleSelectAllPage"
          ></v-data-table>
        </v-col>
        <v-col cols="12" md="6">
          <v-data-table
            v-model="selectedRoleList"
            :headers="roleHeader"
            :items="computedRoleList"
            item-key="id"
            disable-pagination
            hide-default-footer
            fixed-header
            height="500"
            show-select
            :no-data-text="selectedPage ? 'Không có dữ liệu' : 'Vui lòng chọn Trang'"
            checkbox-color="primary"
            @item-selected="handleSelectRole"
            @toggle-select-all="handleSelectAllRole"
          >
            <template #group="{ header }"> {{ header }} +'as'</template>
          </v-data-table>
        </v-col>
      </v-row>
      <BaseConfirmModal
        :open="isOpenDelete"
        :loading="isLoadingDelete"
        @toggle="isOpenDelete = !isOpenDelete"
        @OK="handleDelete"
      >
        <template #content>
          Bạn có chắc chắn muốn xóa nhóm người dùng
          <pan class="red--text fw-500">{{ dataDetail?.groupName }}</pan>
          không?
        </template>
      </BaseConfirmModal>
    </v-form>
  </v-sheet>
</template>

<style scoped></style>
