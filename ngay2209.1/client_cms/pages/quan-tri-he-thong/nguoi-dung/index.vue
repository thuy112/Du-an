<template>
  <div class="user-page pa-3">
    <!-- Thanh công cụ (Filter) -->
    <div class="d-flex align-center justify-space-between pb-3 mb-3 border-bottom-only flex-wrap gap-2">
      <div class="text-h6 font-weight-bold">
        Danh sách người dùng ({{ filteredUsers.length }})
      </div>

      <div class="d-flex align-center gap-2">
        <!-- Thêm clearable để hiện nút X xoá nhanh, xoá @keyup.enter -->
        <v-text-field
          v-model="filters.fullName"
          placeholder="Họ tên"
          outlined
          dense
          hide-details
          clearable
          style="max-width: 220px"
          class="bg-white rounded custom-input"
        ></v-text-field>

        <!-- Thêm clearable để hiện nút X xoá nhanh, xoá @keyup.enter -->
        <v-text-field
          v-model="filters.email"
          placeholder="Email"
          outlined
          dense
          hide-details
          clearable
          style="max-width: 220px"
          class="bg-white rounded custom-input"
        ></v-text-field>

        <!-- Xoá @change -->
        <v-select
          v-model="filters.status"
          :items="statusOptions"
          item-text="text"
          item-value="value"
          placeholder="Trạng thái"
          outlined
          dense
          hide-details
          clearable
          style="max-width: 170px"
          class="bg-white rounded custom-input"
        ></v-select>

        <v-btn icon color="#a2212b" class="border-btn rounded-sm" @click="resetFilters">
          <v-icon color="#a2212b">mdi-refresh</v-icon>
        </v-btn>

        <!-- Nút tìm kiếm (Kính lúp) -->
        <v-btn color="#a2212b" dark elevation="0" class="min-w-0 px-3 rounded-sm" @click="searchUsers">
          <v-icon small>mdi-magnify</v-icon>
        </v-btn>

        <v-btn color="#a2212b" dark elevation="0" class="min-w-0 px-3 rounded-sm" @click="openAddModal">
          <v-icon small>mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Bảng dữ liệu: Đã thay thế v-data-table bằng BaseTable -->
    <div class="w-100">
      <div class="table-scroll-panel">
        <BaseTable
          :headers="headers"
          :items="paginatedUsers"
          :loading="loading"
          disable-pagination
          hide-default-footer
          class="custom-table full-table"
        >
          <template #[`item.stt`]="{ index }">
            <span class="font-weight-medium text-body-2">{{ (page - 1) * itemsPerPage + index + 1 }}</span>
          </template>

          <template #[`item.fullName`]="{ item }">
            <div class="d-flex align-center py-2">
              <v-avatar size="40" class="mr-3">
                <v-img v-if="item.avatar" :src="item.avatar"></v-img>
                <v-icon v-else color="#a2212b" x-large>mdi-account-circle</v-icon>
              </v-avatar>
              <span
                class="font-weight-bold red--text text--darken-4 text-body-1 cursor-pointer"
                @click="openDetailModal(item)"
              >
                {{ item.fullName }}
              </span>
            </div>
          </template>

          <!-- Render list groups thay vì roleName -->
          <template #[`item.groups`]="{ item }">
            <span class="text-body-2">{{ formatGroups(item.groups) }}</span>
          </template>

          <!-- Xử lý select trạng thái ACTIVE / INACTIVE -->
          <template #[`item.status`]="{ item }">
            <v-select
              :value="item.status"
              :items="statusOptions"
              item-text="text"
              item-value="value"
              dense
              flat
              solo
              hide-details
              class="status-select"
              :class="item.status === 'ACTIVE' ? 'active-status' : 'inactive-status'"
              @change="handleStatusChange(item, $event)"
            ></v-select>
          </template>

          <!-- Menu 3 chấm -->
          <template #[`item.actions`]="{ item }">
            <v-menu offset-y left transition="scale-transition">
              <template #activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>

              <v-list dense class="py-1">
                <v-list-item @click="openDetailModal(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="info">mdi-eye-outline</v-icon></v-list-item-icon>
                  <v-list-item-title class="text-body-2">Chi tiết</v-list-item-title>
                </v-list-item>

                <v-list-item @click="openGanLopModal(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="teal">mdi-account-multiple-plus-outline</v-icon></v-list-item-icon>
                  <v-list-item-title class="text-body-2">Gán lớp sinh viên</v-list-item-title>
                </v-list-item>

                <v-list-item @click="openPhanQuyenModal(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="indigo">mdi-account-check-outline</v-icon></v-list-item-icon>
                  <v-list-item-title class="text-body-2">Phân quyền duyệt đơn</v-list-item-title>
                </v-list-item>

                <v-list-item @click="openLopQuanLyModal(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="success">mdi-format-list-bulleted-square</v-icon></v-list-item-icon>
                  <v-list-item-title class="text-body-2">Lớp quản lý</v-list-item-title>
                </v-list-item>

                <v-list-item @click="openEditModal(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="warning">mdi-pencil-outline</v-icon></v-list-item-icon>
                  <v-list-item-title class="text-body-2">Cập nhật</v-list-item-title>
                </v-list-item>

                <v-list-item @click="openResetPasswordModal(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="cyan">mdi-lock-reset</v-icon></v-list-item-icon>
                  <v-list-item-title class="text-body-2">Reset mật khẩu</v-list-item-title>
                </v-list-item>

                <v-list-item @click="deleteUser(item)">
                  <v-list-item-icon class="mr-2"><v-icon small color="error">mdi-delete-outline</v-icon></v-list-item-icon>
                  <v-list-item-title class="text-body-2 red--text">Xóa</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </BaseTable>
      </div>

      <!-- Phân trang -->
      <div class="d-flex align-center justify-end py-3 border-top-only gap-2 bg-white">
        <span class="body-2 grey--text text--darken-1">Bản ghi</span>
        <v-select
          v-model="itemsPerPage"
          :items="[10, 20, 50, 100]"
          dense
          outlined
          hide-details
          style="max-width: 80px"
          class="custom-input"
          @change="onItemsPerPageChange"
        ></v-select>

        <span class="body-2 grey--text text--darken-1 ml-2">Trang</span>
        <v-text-field
          v-model.number="pageInput"
          dense
          outlined
          hide-details
          style="max-width: 60px"
          class="text-center custom-input"
          @keyup.enter="goToPage"
        ></v-text-field>

        <!-- Nút Đi -->
        <v-btn color="#a2212b" dark small class="text-capitalize px-3 rounded-sm elevation-0" @click="goToPage">Đi</v-btn>
        
        <v-btn icon :disabled="page <= 1" @click="page--"><v-icon>mdi-chevron-left</v-icon></v-btn>
        <v-btn
          v-for="p in totalPages"
          :key="p"
          small
          :color="page === p ? '#a2212b' : ''"
          :dark="page === p"
          :outlined="page !== p"
          class="min-w-0 pa-0 rounded-sm elevation-0"
          style="width: 32px; height: 32px"
          @click="page = p"
        >
          {{ p }}
        </v-btn>
        <v-btn icon :disabled="page >= totalPages" @click="page++"><v-icon>mdi-chevron-right</v-icon></v-btn>
      </div>
    </div>

    <!-- CÁC MODAL DIALOGS -->

    <!-- 1. MODAL: CHI TIẾT NGƯỜI DÙNG -->
    <v-dialog v-model="dialogs.detail" max-width="600" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="bg-red-custom white--text py-3 px-4 d-flex justify-space-between">
          <span class="text-h6 font-weight-bold">Chi tiết người dùng</span>
          <v-btn icon dark small @click="dialogs.detail = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pt-6 pb-6 px-6 text-center">
          <v-avatar size="130" class="mb-6">
            <v-img v-if="selectedUser.avatar" :src="selectedUser.avatar"></v-img>
            <v-icon v-else color="#a2212b" style="font-size: 130px">mdi-account-circle</v-icon>
          </v-avatar>

          <v-row dense class="text-left body-1">
            <v-col cols="6" class="py-2">
              <span class="grey--text text--darken-1">Họ tên: </span>
              <strong class="black--text">{{ selectedUser.fullName }}</strong>
            </v-col>
            <v-col cols="6" class="py-2">
              <span class="grey--text text--darken-1">Số điện thoại: </span>
              <strong class="red--text text--darken-3">{{ selectedUser.phone }}</strong>
            </v-col>
            <v-col cols="6" class="py-2">
              <span class="grey--text text--darken-1">Email: </span>
              <strong class="red--text text--darken-3">{{ selectedUser.email }}</strong>
            </v-col>
            <v-col cols="6" class="py-2">
              <span class="grey--text text--darken-1">Chức vụ: </span>
              <strong class="red--text text--darken-3">{{ selectedUser.position }}</strong>
            </v-col>
            <v-col cols="12" class="py-2 d-flex align-center">
              <span class="grey--text text--darken-1 mr-2">Trạng thái: </span>
              <v-chip small color="#a2212b" dark font-weight-bold>
                {{ selectedUser.status === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt' }}
              </v-chip>
            </v-col>
            <v-col cols="12" class="py-2">
              <span class="grey--text text--darken-1">Nhóm người dùng: </span>
              <strong class="red--text text--darken-3">{{ formatGroups(selectedUser.groups) || 'Chưa phân nhóm' }}</strong>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-4 pt-0 justify-end">
          <v-btn outlined class="text-capitalize px-4" @click="dialogs.detail = false">Đóng X</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 2. MODAL: GÁN LỚP SINH VIÊN CHO CÁN BỘ QUẢN LÝ -->
    <v-dialog v-model="dialogs.ganLop" max-width="850" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="bg-red-custom white--text py-3 px-4 d-flex justify-space-between">
          <span class="text-h6 font-weight-bold">Gán lớp sinh viên cho Cán Bộ Quản Lý</span>
          <v-btn icon dark small @click="dialogs.ganLop = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pt-4 pb-2 px-6">
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="body-1 font-weight-bold red--text text--darken-3">Danh sách lớp sinh viên (15/187)</span>
            <div class="d-flex gap-2">
              <v-text-field placeholder="Tên/Mã lớp sinh viên" outlined dense hide-details clearable style="width: 200px"></v-text-field>
              <v-btn icon color="#a2212b" class="border-btn rounded-sm"><v-icon>mdi-refresh</v-icon></v-btn>
              <v-btn color="#a2212b" dark elevation="0" class="min-w-0 px-3 rounded-sm"><v-icon small>mdi-magnify</v-icon></v-btn>
            </div>
          </div>
          <v-simple-table dense class="border rounded">
            <template #default>
              <thead>
                <tr class="grey lighten-4">
                  <th class="text-center" style="width: 40px"><v-checkbox dense hide-details class="ma-0 pa-0"></v-checkbox></th>
                  <th>STT</th>
                  <th>Mã lớp</th>
                  <th>Tên Lớp</th>
                  <th>Hình thức đào tạo</th>
                  <th>Địa điểm đào tạo</th>
                  <th>Ngành</th>
                  <th>Khoá</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in classListSample" :key="i">
                  <td class="text-center"><v-checkbox v-model="item.selected" dense hide-details class="ma-0 pa-0" color="#a2212b"></v-checkbox></td>
                  <td>{{ i + 1 }}</td>
                  <td>{{ item.code }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.type }}</td>
                  <td>{{ item.location }}</td>
                  <td>{{ item.major }}</td>
                  <td>{{ item.course }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
        <v-card-actions class="px-6 pb-4 pt-2 justify-end gap-2">
          <v-btn outlined class="text-capitalize px-4" @click="dialogs.ganLop = false">Đóng X</v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="text-capitalize px-4" @click="dialogs.ganLop = false">Lưu <v-icon right small>mdi-content-save</v-icon></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 3. MODAL: PHÂN QUYỀN DUYỆT ĐƠN -->
    <v-dialog v-model="dialogs.phanQuyen" max-width="550" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="bg-red-custom white--text py-3 px-4 d-flex justify-space-between">
          <span class="text-h6 font-weight-bold">Phân quyền duyệt đơn</span>
          <v-btn icon dark small @click="dialogs.phanQuyen = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-checkbox v-model="permissions.tinChi" label="Duyệt tín chỉ" color="#a2212b" hide-details class="mb-3 font-weight-medium"></v-checkbox>
          <v-checkbox v-model="permissions.hocPhi" label="Duyệt học phí" color="#a2212b" hide-details class="mb-3 font-weight-medium"></v-checkbox>
          <v-checkbox v-model="permissions.sinhVien" label="Duyệt sinh viên" color="#a2212b" hide-details class="font-weight-medium"></v-checkbox>
        </v-card-text>
        <v-card-actions class="px-6 pb-4 pt-0 justify-end gap-2">
          <v-btn outlined class="text-capitalize px-4" @click="dialogs.phanQuyen = false">Đóng X</v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="text-capitalize px-4" @click="dialogs.phanQuyen = false">Lưu <v-icon right small>mdi-content-save</v-icon></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 4. MODAL: DANH SÁCH LỚP SINH VIÊN QUẢN LÝ -->
    <v-dialog v-model="dialogs.lopQuanLy" max-width="850" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="bg-red-custom white--text py-3 px-4 d-flex justify-space-between">
          <span class="text-h6 font-weight-bold">Danh sách lớp sinh viên quản lý</span>
          <v-btn icon dark small @click="dialogs.lopQuanLy = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pt-4 pb-2 px-6">
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="body-1 font-weight-bold red--text text--darken-3">Danh sách lớp sinh viên (15)</span>
            <div class="d-flex gap-2">
              <v-text-field placeholder="Tên/Mã lớp sinh viên" outlined dense hide-details clearable style="width: 200px"></v-text-field>
              <v-btn icon color="#a2212b" class="border-btn rounded-sm"><v-icon>mdi-refresh</v-icon></v-btn>
              <v-btn color="#a2212b" dark elevation="0" class="min-w-0 px-3 rounded-sm"><v-icon small>mdi-magnify</v-icon></v-btn>
            </div>
          </div>
          <v-simple-table dense class="border rounded">
            <template #default>
              <thead>
                <tr class="grey lighten-4">
                  <th>STT</th>
                  <th>Mã lớp</th>
                  <th>Tên Lớp</th>
                  <th>Chương trình đào tạo</th>
                  <th>Địa điểm đào tạo</th>
                  <th>Ngành</th>
                  <th>Khoá</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in managedClassListSample" :key="i">
                  <td>{{ i + 1 }}</td>
                  <td>{{ item.code }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.program }}</td>
                  <td>{{ item.location }}</td>
                  <td>{{ item.major }}</td>
                  <td>{{ item.course }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
        <v-card-actions class="px-6 pb-4 pt-2 justify-end">
          <v-btn outlined class="text-capitalize px-4" @click="dialogs.lopQuanLy = false">Đóng X</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 5. MODAL: THÊM / CẬP NHẬT NGƯỜI DÙNG -->
    <v-dialog v-model="dialogs.editUser" max-width="800" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="bg-red-custom white--text d-flex justify-space-between py-3 px-4">
          <span class="text-h6 font-weight-bold">{{ isEdit ? 'Cập nhật người dùng' : 'Thêm người dùng' }}</span>
          <v-btn icon dark small @click="dialogs.editUser = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pt-6 pb-2 px-6">
          <v-form ref="userForm" v-model="validForm">
            <v-row>
              <v-col cols="12" md="4" class="d-flex flex-column align-center justify-center rounded-lg" style="background-color: #fce8e8; min-height: 250px;">
                <input ref="fileInput" type="file" accept="image/*" class="d-none" @change="handleFileUpload" />
                <v-hover v-slot="{ hover }">
                  <v-avatar size="100" color="white" class="cursor-pointer mb-2 elevation-1" @click="triggerSelectFile">
                    <v-img v-if="form.avatar" :src="form.avatar"></v-img>
                    <v-icon v-else large color="#a2212b">mdi-camera</v-icon>
                    <v-overlay v-if="hover" absolute color="#000" opacity="0.4"><v-icon dark>mdi-camera-plus</v-icon></v-overlay>
                  </v-avatar>
                </v-hover>
                <span class="body-2 red--text text--darken-3 font-weight-bold cursor-pointer" @click="triggerSelectFile">Tải ảnh lên</span>
              </v-col>

              <v-col cols="12" md="8">
                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="form.fullName" label="Họ & tên (*)" outlined dense :rules="[rules.required]"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                      label="Mật khẩu (*)"
                      outlined
                      dense
                      :rules="isEdit ? [] : [rules.required]"
                      @click:append="showPassword = !showPassword"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="form.email" label="Email (*)" outlined dense :rules="[rules.required, rules.email]"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="form.phone" label="Số điện thoại (*)" outlined dense :rules="[rules.required, rules.phone]"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="form.position" label="Chức vụ (*)" outlined dense :rules="[rules.required]"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-select v-model="form.status" :items="statusOptions" item-text="text" item-value="value" label="Trạng thái (*)" outlined dense :rules="[rules.required]"></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-select v-model="form.roles" :items="roleOptions" label="Nhóm người dùng" outlined dense multiple chips small-chips></v-select>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-6 pb-4 pt-0 d-flex justify-end gap-2">
          <v-btn outlined class="text-capitalize rounded px-4" @click="dialogs.editUser = false">Đóng X</v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="text-capitalize rounded px-4" @click="saveUser">
            Lưu <v-icon right small>mdi-content-save</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 6. MODAL: XÁC NHẬN RESET MẬT KHẨU VỀ MẬT KHẨU MẶC ĐỊNH -->
    <v-dialog v-model="dialogs.resetPass" max-width="450" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="bg-red-custom white--text py-3 px-4 d-flex justify-space-between">
          <span class="text-h6 font-weight-bold">Xác nhận</span>
          <v-btn icon dark small @click="dialogs.resetPass = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-6 text-body-1 black--text">
          <p class="mb-0">
            Bạn có chắc chắn muốn reset mật khẩu về
            <strong class="red--text text--darken-3">{{ resetPassword }}</strong>
            của người dùng <strong>{{ selectedUser.fullName }}</strong> không?
          </p>
        </v-card-text>
        <v-card-actions class="px-6 pb-4 pt-0 justify-end gap-2">
          <v-btn outlined class="text-capitalize px-4" @click="dialogs.resetPass = false">Đóng X</v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="text-capitalize px-4" @click="confirmResetPassword">Xác Nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL XÁC NHẬN ĐỔI TRẠNG THÁI -->
    <v-dialog v-model="dialogs.confirmStatus" max-width="450" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="bg-red-custom white--text py-3 px-4 d-flex justify-space-between">
          <span class="text-h6 font-weight-bold">Xác nhận</span>
          <v-btn icon dark small @click="cancelStatusChange"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-6 text-body-1 black--text">
          Bạn có chắc chắn muốn đổi trạng thái từ
          <strong class="red--text text--darken-3">{{ oldStatus }}</strong>
          sang
          <strong>{{ pendingStatus }}</strong>
          không?
        </v-card-text>
        <v-card-actions class="px-6 pb-4 pt-0 justify-end gap-2">
          <v-btn outlined class="text-capitalize px-4 rounded" @click="cancelStatusChange">Đóng X</v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="text-capitalize px-4 rounded" @click="confirmStatusChange">
            Xác Nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL XÁC NHẬN XÓA NGƯỜI DÙNG -->
    <v-dialog v-model="dialogs.confirmDelete" max-width="450" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="bg-red-custom white--text py-3 px-4 d-flex justify-space-between">
          <span class="text-h6 font-weight-bold">Xác nhận</span>
          <v-btn icon dark small @click="cancelDelete"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-6 text-body-1 black--text">
          Bạn có chắc chắn muốn xóa người dùng
          <strong class="red--text text--darken-3">{{ deleteTargetUser && deleteTargetUser.fullName }}</strong>
          không?
        </v-card-text>
        <v-card-actions class="px-6 pb-4 pt-0 justify-end gap-2">
          <v-btn outlined class="text-capitalize px-4 rounded" @click="cancelDelete">Đóng X</v-btn>
          <v-btn color="#a2212b" dark elevation="0" class="text-capitalize px-4 rounded" @click="confirmDelete">
            Xác Nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
// Chú ý: Hãy chắc chắn bạn đã tạo file `~/components/Base/BaseTable.vue` 
// và `~/mock/mockNguoiDung.js` như hướng dẫn trước đó nhé.
import BaseTable from '~/components/Base/BaseTable.vue'
import { MOCK_DATA_NGUOI_DUNG } from '~/consts/mockNguoiDung.js'

export default {
  name: 'UserPage',
  components: {
    BaseTable
  },
  data() {
    return {
      loading: false,
      isEdit: false,
      validForm: false,
      page: 1,
      pageInput: 1,
      itemsPerPage: 50,
      showPassword: false, 
      showRegisteredPassword: false, 
      resetPassword: '123@123a',
      
      dialogs: {
        detail: false,
        ganLop: false,
        phanQuyen: false,
        lopQuanLy: false,
        editUser: false,
        resetPass: false,
        confirmStatus: false,
        confirmDelete: false,
      },

      selectedUser: {},
      deleteTargetUser: null,
      targetUser: null,
      
      oldStatus: '',
      pendingStatus: '',
      pendingStatusValue: '',

      permissions: {
        tinChi: true,
        hocPhi: true,
        sinhVien: true,
      },

      filters: { fullName: '', email: '', status: null },
      activeFilters: { fullName: '', email: '', status: null },

      headers: [
        { text: 'STT', value: 'stt', sortable: false, width: '50px' },
        { text: 'Họ tên', value: 'fullName', sortable: false, width: '150px' },
        { text: 'Email', value: 'email', sortable: false, width: '150px' },
        { text: 'Số điện thoại', value: 'phone', sortable: false, width: '120px' },
        { text: 'Chức vụ', value: 'position', sortable: false, width: '100px' },
        { text: 'Nhóm người dùng ↑', value: 'groups', sortable: false, width: '180px' },
        { text: 'Trạng thái', value: 'status', sortable: false, width: '135px' },
        { text: 'Chức năng', value: 'actions', sortable: false, align: 'center', width: '90px' },
      ],

      statusOptions: [
        { text: 'Kích hoạt', value: 'ACTIVE' }, 
        { text: 'Chưa kích hoạt', value: 'INACTIVE' }
      ],
      roleOptions: ['Quản trị hệ thống', 'admin', 'Học lại', 'Giảng viên'],

      users: [...MOCK_DATA_NGUOI_DUNG],

      classListSample: [
        { selected: true, code: 'B2ĐTTX-GDTXHY-CNTT02-K71', name: 'B2ĐTTX-GDTXHY-CNTT02-K71', type: 'Đào tạo thường xuyên', location: 'Đại học Bách khoa Hà Nội', major: 'Công nghệ thông tin', course: 'Khóa 71' },
        { selected: true, code: 'B2ĐTTX-GDTXHY-CNTT01-K71', name: 'B2ĐTTX-GDTXHY-CNTT01-K71', type: 'Đào tạo thường xuyên', location: 'Đại học Bách khoa Hà Nội', major: 'Công nghệ thông tin', course: 'Khóa 71' },
        { selected: true, code: 'B2CQ-KTĐK&TDH01-K71', name: 'B2CQ-KTĐK&TDH01-K71', type: 'Chính quy', location: 'Đại học Bách khoa Hà Nội', major: 'Kỹ thuật Điều khiển và Tự động hóa', course: 'Khóa 71' },
      ],

      managedClassListSample: [
        { code: 'TEST_999', name: 'Test 999', program: '', location: '', major: '', course: 'Khóa 62' },
        { code: 'LHC_003', name: 'Lớp hành chính 03', program: '', location: '', major: '', course: 'Khóa 69' },
        { code: 'B2ĐTTX-GDTXHY-CNTT02-K71', name: 'B2ĐTTX-GDTXHY-CNTT02-K71', program: '', location: '', major: '', course: 'Khóa 71' },
      ],

      form: { id: null, fullName: '', password: '', email: '', phone: '', position: '', status: 'ACTIVE', roles: [], avatar: null },
      rules: {
        required: (v) => !!v || 'Thông tin bắt buộc',
        email: (v) => /.+@.+\..+/.test(v) || 'Email không hợp lệ',
        phone: (v) => /^0\d{9}$/.test(String(v || '').replace(/\s+/g, '')) || 'Số điện thoại không hợp lệ',
      },
    }
  },
  computed: {
    filteredUsers() {
      return this.users.filter((user) => {
        const matchName = !this.activeFilters.fullName || user.fullName.toLowerCase().includes(this.activeFilters.fullName.toLowerCase().trim())
        const matchEmail = !this.activeFilters.email || user.email.toLowerCase().includes(this.activeFilters.email.toLowerCase().trim())
        const matchStatus = !this.activeFilters.status || user.status === this.activeFilters.status
        return matchName && matchEmail && matchStatus
      })
    },
    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.itemsPerPage) || 1
    },
    paginatedUsers() {
      const start = (this.page - 1) * this.itemsPerPage
      return this.filteredUsers.slice(start, start + this.itemsPerPage)
    },
  },
  watch: {
    page(val) { this.pageInput = val },
  },
  methods: {
    formatGroups(groups) {
      if (!groups || !Array.isArray(groups)) return '';
      return groups.map(g => g.groupName.trim()).join(', ');
    },

    searchUsers() { 
      this.activeFilters = { ...this.filters }; 
      this.page = 1 
    },
    
    resetFilters() { 
      this.filters = { fullName: '', email: '', status: null }; 
      this.activeFilters = { fullName: '', email: '', status: null }; 
      this.page = 1 
    },

    goToPage() { 
      // 1. Cập nhật bộ lọc khi ấn Đi
      this.activeFilters = { ...this.filters }; 

      // 2. Chuyển trang
      const p = parseInt(this.pageInput, 10); 
      const currentTotalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage) || 1;
      
      if (p >= 1 && p <= currentTotalPages) {
        this.page = p; 
      } else {
        this.pageInput = this.page; 
      }
    },

    onItemsPerPageChange() { 
      this.page = 1; 
      this.pageInput = 1 
    },

    handleStatusChange(item, newStatusValue) {
      if (item.status === newStatusValue) return

      this.targetUser = item
      this.oldStatus = item.status === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt'
      this.pendingStatus = newStatusValue === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt'
      this.pendingStatusValue = newStatusValue
      this.dialogs.confirmStatus = true
    },

    confirmStatusChange() {
      if (this.targetUser) {
        const idx = this.users.findIndex((user) => user.id === this.targetUser.id)
        if (idx !== -1) {
          this.$set(this.users[idx], 'status', this.pendingStatusValue)
          console.log(`Đã cập nhật ${this.targetUser.fullName} thành: ${this.pendingStatus}`)
        }
      }
      this.resetStatusState()
    },

    cancelStatusChange() {
      this.resetStatusState()
    },

    resetStatusState() {
      this.dialogs.confirmStatus = false
      this.targetUser = null
      this.oldStatus = ''
      this.pendingStatus = ''
      this.pendingStatusValue = ''
    },

    openDetailModal(item) { this.selectedUser = item; this.dialogs.detail = true },
    openGanLopModal(item) { this.selectedUser = item; this.dialogs.ganLop = true },
    openPhanQuyenModal(item) { this.selectedUser = item; this.dialogs.phanQuyen = true },
    openLopQuanLyModal(item) { this.selectedUser = item; this.dialogs.lopQuanLy = true },
    
    openResetPasswordModal(item) { 
      this.selectedUser = item
      this.showRegisteredPassword = false
      this.dialogs.resetPass = true 
    },

    confirmResetPassword() {
      const idx = this.users.findIndex(u => u.id === this.selectedUser.id)
      if (idx !== -1) {
        this.$set(this.users[idx], 'currentPassword', this.resetPassword)
        console.log(`Đã reset mật khẩu cho ${this.selectedUser.email} về:`, this.resetPassword)
      }
      this.dialogs.resetPass = false
    },

    openAddModal() {
      this.isEdit = false
      this.showPassword = false
      this.form = {
        id: null, fullName: '', password: '', email: '', phone: '', position: '', status: 'ACTIVE', roles: [], avatar: null
      }
      this.dialogs.editUser = true
    },

    openEditModal(item) {
      this.isEdit = true
      this.showPassword = false
      const mappedRoles = item.groups ? item.groups.map(g => g.groupName.trim()) : []
      
      this.form = {
        ...item,
        password: '',
        roles: mappedRoles
      }
      this.dialogs.editUser = true
    },

    saveUser() {
      if (!this.$refs.userForm.validate()) return

      const mappedGroups = this.form.roles.map((r, i) => ({ id: i + 100, groupName: r }))

      if (this.isEdit) {
        const idx = this.users.findIndex((u) => u.id === this.form.id)
        if (idx !== -1) {
          const updatedUser = { ...this.form, groups: mappedGroups }
          delete updatedUser.roles
          this.$set(this.users, idx, updatedUser)
        }
      } else {
        const maxId = this.users.reduce((m, u) => (u.id > m ? u.id : m), 0)
        const newUser = {
          ...this.form,
          id: maxId + 1,
          groups: mappedGroups,
          createTime: new Date().toLocaleString()
        }
        delete newUser.roles
        this.users.unshift(newUser)
      }
      this.dialogs.editUser = false
    },

    deleteUser(item) {
      this.deleteTargetUser = item
      this.dialogs.confirmDelete = true
    },
    confirmDelete() {
      if (this.deleteTargetUser) {
        this.users = this.users.filter((user) => user.id !== this.deleteTargetUser.id)
      }
      this.cancelDelete()
    },
    cancelDelete() {
      this.dialogs.confirmDelete = false
      this.deleteTargetUser = null
    },
    triggerSelectFile() { this.$refs.fileInput.click() },
    handleFileUpload(e) {
      const file = e.target.files[0]
      if (file) this.form.avatar = URL.createObjectURL(file)
    },
  },
}
</script>

<style scoped>
.bg-red-custom { background-color: #a2212b !important; }
.border-btn { border: 1px solid #a2212b !important; }
.border-bottom-only { border-bottom: 1px solid #e5e7eb !important; }
.border-top-only { border-top: 1px solid #e5e5e5 !important; }
.gap-2 { gap: 10px; }
.w-100 { width: 100% !important; }

.table-scroll-panel {
  max-height: calc(100vh - 220px);
  overflow-y: auto !important;
  overflow-x: auto;
  border: 1px solid #f0f0f0;
}

.full-table >>> th {
  position: sticky !important;
  top: 0;
  z-index: 2;
  background-color: #f8f9fa !important;
  color: #222 !important;
  font-weight: 700 !important;
  font-size: 14px !important;
  border-bottom: 2px solid #e0e0e0 !important;
  height: 48px !important;
}

.full-table { background: transparent !important; box-shadow: none !important; }
.full-table >>> table { border-collapse: collapse !important; width: 100% !important; }
.full-table >>> td { font-size: 14px !important; color: #333 !important; border-bottom: 1px solid #f0f0f0 !important; height: 52px !important; }

.status-select >>> .v-input__slot { min-height: 30px !important; padding: 0 12px !important; border-radius: 14px !important; box-shadow: none !important; }
.status-select >>> .v-select__selection { color: white !important; font-size: 12px !important; font-weight: 600 !important; }
.status-select >>> .v-icon { color: white !important; font-size: 18px !important; }
.active-status >>> .v-input__slot { background-color: #a2212b !important; }
.inactive-status >>> .v-input__slot { background-color: #8d9499 !important; }
</style>