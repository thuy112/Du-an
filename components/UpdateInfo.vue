<script>
import RequiredLabel from "~/components/Base/RequiredLabel.vue"
import { genderList, statusList } from "~/consts/list"
import { isEmail, isPhone, isRequired } from "~/utils/rules"
import authServices from "~/services/authServices"

export default {
  name: "UpdateInfo",
  components: { RequiredLabel },
  props: {
    open: {
      type: Boolean,
      required: true
    },
    dataDetail: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    isLoading: false,
    showPassword: false,
    genderList,
    statusList,
    avatar: null,
    email: null,
    fullName: null,
    phone: null,
    position: null,
    status: "ACTIVE",
    groupIds: []
  }),
  watch: {
    open(val) {
      if (val) {
        this.status = this.dataDetail.status
        this.avatar = this.dataDetail.avatar
        this.email = this.dataDetail.email
        this.fullName = this.dataDetail.fullName
        this.phone = this.dataDetail.phone
        this.position = this.dataDetail.position
        this.groupIds = this.dataDetail.groups.map((i) => i.id)
      }
    }
  },
  methods: {
    isPhone,
    isEmail,
    async handleSubmit() {
      const valid = this.$refs.form.validate()
      if (!valid) return
      try {
        this.isLoading = true
        const data = {
          id: this.dataDetail.id,
          avatar: this.avatar,
          email: this.email,
          fullName: this.fullName,
          phone: this.phone,
          position: this.position,
          status: this.status
        }
        const res = await authServices.updateInfo(data)
        if (res.success) {
          this.$emit("toggle")
          this.$mitt.emit("getInfo")
          this.$showSuccess("Cập nhật thông tin thành công")
        }
      } catch (e) {
        console.error(e)
      }
      this.isLoading = false
    },
    isRequired
  }
}
</script>

<template>
  <BaseModal
    title="Cập nhật thông tin"
    :open="open"
    :loading="isLoading"
    max-width="900"
    @toggle="$emit('toggle')"
    @OK="handleSubmit"
  >
    <v-form ref="form" lazy-validation @submit.prevent>
      <v-row class="ma-0 mt-3">
        <v-col cols="12" md="4" class="d-flex align-center justify-center">
          <BaseUploadAvatar
            :avatar-url="avatar"
            @setAvatar="avatar = $event"
            @clear="avatar = null"
          />
        </v-col>
        <v-col cols="12" md="8">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.trim="fullName"
                outlined
                dense
                color="primary"
                clear-icon="mdi-close-circle"
                clearable
                chips
                :rules="[isRequired('Vui lòng nhập Họ & tên')]"
              >
                <template #label>
                  <RequiredLabel name="Họ & tên" />
                </template>
              </v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.trim="email"
                outlined
                dense
                name="username"
                autocomplete="nope"
                color="primary"
                clear-icon="mdi-close-circle"
                disabled
                :rules="[isRequired('Vui lòng nhập Email'), isEmail()]"
              >
                <template #label>
                  <RequiredLabel name="Email" />
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.trim="phone"
                outlined
                dense
                color="primary"
                type="number"
                clear-icon="mdi-close-circle"
                disabled
                :rules="[isRequired('Vui lòng nhập Số điện thoại'), isPhone()]"
              >
                <template #label>
                  <RequiredLabel name="Số điện thoại" />
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.trim="position"
                outlined
                dense
                color="primary"
                clear-icon="mdi-close-circle"
                clearable
                :rules="[isRequired('Vui lòng nhập Chức vụ')]"
              >
                <template #label>
                  <RequiredLabel name="Chức vụ" />
                </template>
              </v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model.trim="status"
                outlined
                dense
                no-data-text="Không có dữ liệu"
                color="primary"
                :items="statusList"
                clear-icon="mdi-close-circle"
                disabled
                :rules="[isRequired('Vui lòng chọn Trạng thái')]"
              >
                <template #label>
                  <RequiredLabel name="Trạng thái" />
                </template>
              </v-select>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-form>
  </BaseModal>
</template>

<style scoped></style>
