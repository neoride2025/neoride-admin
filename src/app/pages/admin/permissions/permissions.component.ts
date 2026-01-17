import { PERMISSIONS } from './../../../core/constants/permissions.constants';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, ViewChild } from '@angular/core';
import { FormDirective, FormControlDirective, FormLabelDirective, ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent, ModalTitleDirective, ModalToggleDirective, FormCheckComponent, FormCheckInputDirective, FormSelectDirective } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Badge } from 'primeng/badge';
import { LoaderComponent } from '../../../global-components/loader/loader.component';
import { HelperService } from '../../../services/helper.service';
import { ToastService } from '../../../services/toast.service';
import { PermissionAPIService } from './../../../apis/permission.service';
import { SharedModule } from '../../../others/shared.module';
import { SortEvent } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';


@Component({
  selector: 'app-permissions',
  imports: [
    SharedModule, LoaderComponent, CommonModule, TooltipModule,
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
  helper = inject(HelperService);
  toastService = inject(ToastService);
  permission = inject(PermissionAPIService);

  // common things
  config: any = this.helper.config;
  userInfo: any = this.helper.getDataFromSession('userInfo');
  loading = false;
  allowedPermissions = this.userInfo.permissions;
  canDo: any = {
    create: this.allowedPermissions.includes(PERMISSIONS.ADMIN_PERMISSIONS_CREATE),
    update: this.allowedPermissions.includes(PERMISSIONS.ADMIN_PERMISSIONS_UPDATE),
    delete: this.allowedPermissions.includes(PERMISSIONS.ADMIN_PERMISSIONS_DELETE),
    export: this.allowedPermissions.includes(PERMISSIONS.ADMIN_PERMISSIONS_EXPORT)
  }

  // table & list
  @ViewChild('dt') table!: Table;
  permissions: any[] = [];
  statuses = this.helper.getStatusItems();
  isSorted: any = null;
  initialValue: any[] = [];

  // new / update permission
  showModal = false;
  submitting = false;
  isModalForUpdate = false;
  permissionForm: any = {};

  ngOnInit() {
    this.getPermissions();
    this.helper.closeModalIfOpened(() => {
      this.closeModal(true);
    });
  }

  getPermissions() {
    this.loading = true;
    this.permission.getPermissions().subscribe((res: any) => {
      this.loading = false;
      if (res.status === 200) {
        this.permissions = res.data;
        this.initialValue = [...this.permissions];
      }
      else
        this.toastService.error(res.message);
    }, err => {
      this.loading = false;
      this.toastService.error(err.error.message);
    })
  }

  //#region Table Sorting

  customSort(event: SortEvent) {
    if (this.isSorted == null || this.isSorted === undefined) {
      this.isSorted = true;
      this.sortTableData(event);
    } else if (this.isSorted == true) {
      this.isSorted = false;
      this.sortTableData(event);
    } else if (this.isSorted == false) {
      this.isSorted = null;
      this.permissions = [...this.initialValue];
      this.table.reset();
    }
  }

  sortTableData(event: any) {
    event.data.sort((data1: { [x: string]: any; }, data2: { [x: string]: any; }) => {
      let value1 = data1[event.field];
      let value2 = data2[event.field];
      let result = null;
      if (value1 == null && value2 != null) result = -1;
      else if (value1 != null && value2 == null) result = 1;
      else if (value1 == null && value2 == null) result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
      else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

      return event.order * result;
    });
  }

  //#endregion

  //#region Table action functions

  statusChange(event: any, permission: any) {
    if (!this.canDo.update) {
      event.preventDefault();
      return;
    }
    if (permission.isActive)
      this.getPermissionChangedStatus(event, permission);
    else
      this.updateStatus(event, permission);
  }

  getPermissionChangedStatus(event: any, permission: any) {
    event.preventDefault();
    const alertPayload = {
      header: 'Permission Status Update',
      message: 'This action will log out the assigned user. Do you want to continue?',
      acceptBtnLabel: 'Deactivate',
      rejectBtnLabel: 'Cancel'
    }
    this.helper.actionConfirmation(alertPayload, (action: boolean) => {
      if (!action) return;
      this.updateStatus(event, permission);
    })
  }

  updateStatus(event: any, permission: any) {
    this.permission.updatePermissionStatus(permission._id, { isActive: !permission.isActive }).subscribe((res: any) => {
      if (res.status === 200) {
        this.toastService.success(res.message, 'Permission Status');
        permission.isActive = !permission.isActive;
      }
      else {
        this.toastService.info(res.message, 'Permission Status');
        event.target.checked = false;
      }
    }, err => {
      this.toastService.error(err.error.message, 'Permission Status');
      event.target.checked = false;
    })
  }

  confirmDelete(permissionId: any, index: number) {
    if (!this.canDo.delete) return;
    const alertPayload = {
      header: 'Permission Deletion',
      message: 'This action will log out the assigned user. Do you want to continue?',
      acceptBtnLabel: 'Delete',
      rejectBtnLabel: 'Cancel'
    }
    this.helper.actionConfirmation(alertPayload, (action: boolean) => {
      if (!action) return;
      this.deletePermission(permissionId, index)
    })
  }

  deletePermission(permissionId: any, index: number) {
    this.permission.deletePermission(permissionId).subscribe((res: any) => {
      if (res.status === 200) {
        this.toastService.success(res.message, 'Permission Deletion');
        this.permissions.splice(index, 1); // remove the deleted permission from the list
        this.table.reset(); // reset the table to reflect changes (pagination)
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
        this.pushNewPermissionToList(res.data);
      }
      else
        this.toastService.error(res.message);
    }, err => {
      this.submitting = false;
      this.toastService.error(err.error.message);
    })
  }

  // will push the recently created permission to the list without call the API
  pushNewPermissionToList(permission: any) {
    this.permissions.splice(0, 0, permission); // this will add the new permission to the list;
  }

  updatePermission() {

  }

  clearForm() {
    this.permissionForm = {};
  }

  closeModal(clearForm?: boolean) {
    clearForm ? this.clearForm() : '';
    this.showModal = false;
  }

  //#endregion

}