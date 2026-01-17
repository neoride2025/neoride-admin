import { RoleAPIService } from './../../../apis/role.service';
import { PERMISSIONS } from './../../../core/constants/permissions.constants';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { FormDirective, FormControlDirective, FormLabelDirective, ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent, ModalTitleDirective, ModalToggleDirective, FormCheckComponent, FormCheckInputDirective, FormSelectDirective } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Badge } from 'primeng/badge';
import { SharedModule } from '../../../others/shared.module';
import { LoaderComponent } from '../../../global-components/loader/loader.component';
import { HelperService } from '../../../services/helper.service';
import { ToastService } from '../../../services/toast.service';
import { SortEvent } from 'primeng/api';

@Component({
  selector: 'app-roles',
  imports: [
    SharedModule, LoaderComponent, CommonModule,
    TableModule, InputTextModule, MultiSelectModule, ButtonModule, SelectModule, Badge,
    ModalToggleDirective, ModalToggleDirective, ModalComponent, ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ModalFooterComponent,
    FormCheckComponent, FormCheckInputDirective, FormControlDirective, FormDirective, FormLabelDirective, FormSelectDirective
  ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
})
export class RolesComponent {

  // injectable dependencies
  helper = inject(HelperService);
  toastService = inject(ToastService);
  role = inject(RoleAPIService);

  // common things
  config: any = this.helper.config;
  userInfo: any = this.helper.getDataFromSession('userInfo');
  loading = false;
  allowedPermissions = this.userInfo.permissions;
  canDo: any = {
    create: this.allowedPermissions.includes(PERMISSIONS.ADMIN_ROLES_CREATE),
    update: this.allowedPermissions.includes(PERMISSIONS.ADMIN_ROLES_UPDATE),
    delete: this.allowedPermissions.includes(PERMISSIONS.ADMIN_ROLES_DELETE),
    export: this.allowedPermissions.includes(PERMISSIONS.ADMIN_ROLES_EXPORT)
  }

  // table & list
  @ViewChild('dt') table!: Table;
  roles: any[] = [];
  statuses = this.helper.getStatusItems();
  isSorted: any = null;
  initialValue: any[] = [];

  // new / update role
  showModal = false;
  submitting = false;
  isModalForUpdate = false;
  roleForm: any = {};

  ngOnInit() {
    this.getRoles();
    this.helper.closeModalIfOpened(() => {
      this.closeModal(true);
    });
  }

  getRoles() {
    this.loading = true;
    this.role.getRoles().subscribe((res: any) => {
      this.loading = false;
      if (res.status === 200) {
        this.roles = res.data;
        this.initialValue = [...this.roles];
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
      this.roles = [...this.initialValue];
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

  statusChange(event: any, role: any) {
    if (!this.canDo.update) {
      event.preventDefault();
      return;
    }
    if (role.isActive)
      this.getRoleChangedStatus(event, role);
    else
      this.updateStatus(event, role);
  }

  getRoleChangedStatus(event: any, role: any) {
    event.preventDefault();
    const alertPayload = {
      header: 'Role Status Update',
      message: 'This action will log out the assigned user. Do you want to continue?',
      acceptBtnLabel: 'Deactivate',
      rejectBtnLabel: 'Cancel'
    }
    this.helper.actionConfirmation(alertPayload, (action: boolean) => {
      if (!action) return;
      this.updateStatus(event, role);
    })
  }

  updateStatus(event: any, role: any) {
    this.role.updateRoleStatus(role._id, { isActive: !role.isActive }).subscribe((res: any) => {
      if (res.status === 200) {
        this.toastService.success(res.message, 'Role Status');
        role.isActive = !role.isActive;
      }
      else {
        this.toastService.info(res.message, 'Role Status');
        event.target.checked = false;
      }
    }, err => {
      this.toastService.error(err.error.message, 'Role Status');
      event.target.checked = false;
    })
  }

  confirmDelete(roleId: any, index: number) {
    if (!this.canDo.delete) return;
    const alertPayload = {
      header: 'Role Deletion',
      message: 'This action will log out the assigned user. Do you want to continue?',
      acceptBtnLabel: 'Delete',
      rejectBtnLabel: 'Cancel'
    }
    this.helper.actionConfirmation(alertPayload, (action: boolean) => {
      if (!action) return;
      this.deleteRole(roleId, index)
    })
  }

  deleteRole(roleId: any, index: number) {
    this.role.deleteRole(roleId).subscribe((res: any) => {
      if (res.status === 200) {
        this.toastService.success(res.message, 'Role Deletion');
        this.roles.splice(index, 1); // remove the deleted navigation from the list
        this.table.reset(); // reset the table to reflect changes (pagination)
      }
      else
        this.toastService.error(res.message, 'Role Deletion');
    }, err => {
      this.toastService.error(err.error.message, 'Role Deletion');
    })
  }

  //#endregion

  //#region new / update role

  process() {
    this.isModalForUpdate ? this.updateRole() : this.createRole();
  }

  createRole() {
    if (!this.roleForm.name)
      return this.toastService.error('Please enter role name');
    else if (this.roleForm.label.length < this.config.nameMinLength)
      return this.toastService.error('Role name should be minimum 3 characters');
    this.submitting = true;
    this.role.createRole(this.roleForm).subscribe((res: any) => {
      this.submitting = false;
      if (res.status === 201) {
        this.toastService.success(res.message);
        this.closeModal(true);
        this.pushNewRoleToList(res.data);
      }
      else
        this.toastService.error(res.message);
    }, err => {
      this.submitting = false;
      this.toastService.error(err.error.message);
    })
  }

  // will push the recently created role to the list without call the API
  pushNewRoleToList(role: any) {
    this.roles.splice(0, 0, role); // this will add the new role to the list;
  }

  updateRole() {

  }

  clearForm() {
    this.roleForm = {};
  }

  closeModal(clearForm?: boolean) {
    clearForm ? this.clearForm() : '';
    this.showModal = false;
  }

  //#endregion

}
