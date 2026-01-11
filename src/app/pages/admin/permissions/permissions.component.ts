import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, untracked } from '@angular/core';
import { FormDirective, FormControlDirective, FormLabelDirective, ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent, ModalTitleDirective, ModalToggleDirective, FormCheckComponent, FormCheckInputDirective, FormSelectDirective } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Badge } from 'primeng/badge';
import { SharedModule } from 'src/app/others/shared.module';
import { LoaderComponent } from 'src/app/global-components/loader/loader.component';
import { PermissionAPIService } from 'src/app/apis/permission.service';
import { HelperService } from 'src/app/services/helper.service';
import { ToastService } from 'src/app/services/toast.service';
import { ForceLoadState } from 'src/app/signals/force-load.state';

@Component({
  selector: 'app-permissions',
  imports: [
    SharedModule, LoaderComponent, CommonModule,
    TableModule, InputTextModule, MultiSelectModule, ButtonModule, SelectModule, Badge,
    ModalToggleDirective, ModalToggleDirective, ModalComponent, ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ModalFooterComponent,
    FormCheckComponent, FormCheckInputDirective, FormControlDirective, FormDirective, FormLabelDirective, FormSelectDirective
  ],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PermissionsComponent {

  // injectable dependencies
  helperService = inject(HelperService);
  toastService = inject(ToastService);
  permission = inject(PermissionAPIService);
  forceLoadState = inject(ForceLoadState);

  // common things
  config: any = this.helperService.config;
  userInfo: any = this.helperService.getDataFromSession('userInfo');
  loading = false;
  allowedPermissions = this.userInfo.permissions;
  canDo: any = {
    create: this.allowedPermissions.includes('ADMIN_PERMISSIONS_CREATE'),
    update: this.allowedPermissions.includes('ADMIN_PERMISSIONS_UPDATE'),
    delete: this.allowedPermissions.includes('ADMIN_PERMISSIONS_DELETE'),
    export: this.allowedPermissions.includes('ADMIN_PERMISSIONS_EXPORT')
  }

  // table & list
  permissions: any[] = [];
  moderators: any[] = [];
  statuses = this.helperService.getStatusItems();

  // new / update permission
  showModal = false;
  submitting = false;
  isModalForUpdate = false;
  modules: any[] = [];
  permissionForm = {
    label: '',
    description: '',
    isSystemPermission: false,
    module: ''
  }

  ngOnInit() {
    this.getPermissions();
    this.helperService.closeModalIfOpened(() => {
      this.closeModal(true);
    });
  }

  getPermissions() {
    this.loading = true;
    this.permission.getPermissions().subscribe((res: any) => {
      this.loading = false;
      if (res.status === 200)
        this.permissions = res.data;
      else
        this.toastService.error(res.message);
      console.log('permissions : ', this.permissions);
    }, err => {
      this.loading = false;
      this.toastService.error(err.error.message);
    })
  }

  //#region Table action functions

  statusChange(event: any, permission: any) {
    if (!this.canDo.update) {
      event.preventDefault(); return;
    }
    if (permission.isActive)
      this.getPermissionChangedStatus(event, permission);
    else
      this.updateStatus(permission);
  }

  getPermissionChangedStatus(event: any, permission: any) {
    event.preventDefault();
    const alertPayload = {
      header: 'Permission Status Update',
      message: 'This action will log out the assigned user. Do you want to continue?',
      acceptBtnLabel: 'Deactivate',
      rejectBtnLabel: 'Cancel'
    }
    this.helperService.actionConfirmation(alertPayload, (action: boolean) => {
      if (!action) return;
      this.updateStatus(permission);
    })
  }

  updateStatus(permission: any) {
    this.permission.updatePermissionStatus(permission._id, { isActive: !permission.isActive }).subscribe((res: any) => {
      if (res.status === 200) {
        permission.isActive = !permission.isActive;
        this.toastService.success(res.message, 'Permission Status');
      }
      else
        this.toastService.info(res.message, 'Permission Status');
    }, err => {
      this.toastService.error(err.error.message, 'Permission Status');
      permission.isActive = !permission.isActive;
    })
  }

  confirmDelete(permissionId: any) {
    if (!this.canDo.delete) return;
    const alertPayload = {
      header: 'Permission Deletion',
      message: 'This action will log out the assigned user. Do you want to continue?',
      acceptBtnLabel: 'Delete',
      rejectBtnLabel: 'Cancel'
    }
    this.helperService.actionConfirmation(alertPayload, (action: boolean) => {
      if (!action) return;
      this.deletePermission(permissionId)
    })
  }

  deletePermission(permissionId: any) {
    this.permission.deletePermission(permissionId).subscribe((res: any) => {
      if (res.status === 200) {
        this.toastService.success(res.message, 'Permission Deletion');
        this.getPermissions();
      }
      else
        this.toastService.error(res.message, 'Permission Deletion');
    }, err => {
      this.toastService.error(err.error.message, 'Permission Deletion');
    })
  }

  //#endregion

  //#region new / update permission

  process() {
    this.isModalForUpdate ? this.updatePermission() : this.createPermission();
  }

  createPermission() {
    if (!this.permissionForm.label)
      return this.toastService.error('Please enter permission name');
    else if (this.permissionForm.label.length < this.config.nameMinLength)
      return this.toastService.error('Permission name should be minimum 3 characters');
    this.submitting = true;
    this.permission.createPermission(this.permissionForm).subscribe((res: any) => {
      this.submitting = false;
      if (res.status === 201) {
        this.toastService.success(res.message);
        this.closeModal(true);
        this.pushNewModuleToList(res.data);
      }
      else
        this.toastService.error(res.message);
    }, err => {
      this.submitting = false;
      this.toastService.error(err.error.message);
    })
  }

  // will push the recently created permission to the list without call the API
  pushNewModuleToList(permission: any) {
    this.permissions.splice(0, 0, permission); // this will add the new permission to the list;
  }

  updatePermission() {

  }

  clearForm() {
    this.permissionForm = {
      label: '',
      description: '',
      isSystemPermission: false,
      module: ''
    };
  }

  closeModal(clearForm?: boolean) {
    clearForm ? this.clearForm() : '';
    this.showModal = false;
  }

  //#endregion
}