<script>
import userServices from "~/services/userServices"
import { isRequired } from "~/utils/rules"

export default {
  name: "ChangePassword",
  props: {
    open: {
      type: Boolean,
      required: true
    }
  },
  data: () => ({
    oldPassword: null,
    isShowOldPassword: false,
    newPassword: null,
    isShowNewPassword: false,
    confirmPassword: null,
    isShowConfirmPassword: false,

    isLoading: false
  }),
  watch: {
    open(val) {
      if (!val) {
        this.$refs.form.reset()
      }
    }
  },
  methods: {
    isRequired,
    async handleSubmit() {
      const valid = this.$refs.form.validate()
      if (!valid) return
      try {
        this.isLoading = true
        const data = {
          newPassword: this.newPassword,
          oldPassword: this.oldPassword
        }
        const res = await userServices.changePassword(data)
        if (res.success) {
          this.$emit("toggle")
          this.$emit("success")
          this.$showSuccess("Thay đổi mật khẩu thành công")
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
  <BaseModal
    title="Đổi mật khẩu tài khoản"
    :open="open"
    :loading="isLoading"
    max-width="500"
    @toggle="$emit('toggle')"
    @OK="handleSubmit"
  >
    <v-form ref="form" lazy-validation @submit.prevent>
      <v-row class="ma-0 mt-3" no-gutters>
        <v-col cols="12">
          <v-text-field
            v-model="oldPassword"
            outlined
            color="primary"
            clear-icon="mdi-close-circle"
            clearable
            :append-icon="isShowOldPassword ? 'mdi-eye-off' : 'mdi-eye'"
            :type="isShowOldPassword ? 'text' : 'password'"
            :rules="[isRequired()]"
            @click:append="isShowOldPassword = !isShowOldPassword"
          >
            <template #label> Mật khẩu cũ <span class="red--text">(*)</span></template>
          </v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="newPassword"
            color="primary"
            outlined
            clear-icon="mdi-close-circle"
            clearable
            :append-icon="isShowNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
            :type="isShowNewPassword ? 'text' : 'password'"
            :rules="[(v) => !!v || 'Không được để trống']"
            @click:append="isShowNewPassword = !isShowNewPassword"
          >
            <template #label> Mật khẩu mới <span class="red--text">(*)</span></template>
          </v-text-field>
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="confirmPassword"
            color="primary"
            outlined
            clear-icon="mdi-close-circle"
            clearable
            :append-icon="isShowConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
            :type="isShowConfirmPassword ? 'text' : 'password'"
            :rules="[
                            (v) => !!v || 'Không được để trống',
                            (v) => v === newPassword || 'Mật khẩu không khớp',
                        ]"
            @click:append="isShowConfirmPassword = !isShowConfirmPassword"
          >
            <template #label>
              Nhập lại mật khẩu mới <span class="red--text">(*)</span></template
            >
          </v-text-field>
        </v-col>
      </v-row>
    </v-form>
  </BaseModal>
</template>

<style scoped></style>
