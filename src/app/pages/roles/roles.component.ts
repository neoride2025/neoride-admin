import { SharedModule } from './../../others/shared.module';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, ViewChild } from '@angular/core';
import { FormDirective, FormControlDirective, FormLabelDirective, ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent, ModalTitleDirective, ModalToggleDirective, FormCheckComponent, FormCheckInputDirective } from '@coreui/angular';
import { RoleAPIService } from '../../apis/role.service';
import { HelperService } from '../../services/helper.service';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../global-components/loader/loader.component';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { ToggleButton } from 'primeng/togglebutton';
import { Table, TableModule } from 'primeng/table';
import { ModeratorAPIService } from '../../apis/moderator.service';
import { ButtonModule } from 'primeng/button';
import { Badge } from 'primeng/badge';
import { GlobalAPIService } from '../../apis/global.service';
import { ForceLoadState } from '../../signals/force-load.state';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    SharedModule, LoaderComponent, CommonModule,
    TableModule, InputTextModule, MultiSelectModule, ButtonModule, SelectModule, ToggleButton, Badge,
    ModalToggleDirective, ModalToggleDirective, ModalComponent, ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ModalFooterComponent,
    FormCheckComponent, FormCheckInputDirective, FormControlDirective, FormDirective, FormLabelDirective
  ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RolesComponent {

  // injectable dependencies
  helperService = inject(HelperService);
  toastService = inject(ToastService);
  role = inject(RoleAPIService);
  moderator = inject(ModeratorAPIService);
  global = inject(GlobalAPIService);
  forceLoadState = inject(ForceLoadState);

  // common things
  config: any = this.helperService.config;
  userInfo: any = this.helperService.getDataFromSession('userInfo');
  loading = false;
  submitting = false;
  loaderMessage = '';
  forceLoadRoles = this.forceLoadState.forceLoadRoles;

  // table & list
  @ViewChild('dt') table!: Table;
  roles: any[] = [];
  moderators: any[] = [];
  statuses = this.helperService.getStatusItems();

  // new / update role
  showModal = false;
  isModalForUpdate = false;
  selectedItems: string[] = [];
  modules: any[] = [];
  roleForm: any = {};

  ngOnInit() {
    this.getRolesComponentData();
    this.helperService.closeModalIfOpened(() => {
      this.closeModal(true);
    });
  }

  getRolesComponentData() {
    this.moderators = this.modules = this.roles = [];
    this.loading = true;
    this.loaderMessage = 'Loading Roles...';
    this.global.getRolesComponentData(this.forceLoadRoles()).subscribe((res: any) => {
      this.loading = false;
      if (res.status === 200) {
        this.roles = res.data.roles;
        this.moderators = res.data.moderators;
        this.modules = res.data.modules;
        this.forceLoadRoles() ? this.forceLoadState.clearRolesForceLoad() : '';
      }
      else
        this.toastService.error(res.message);
    }, err => {
      this.loading = false;
      this.toastService.error(err.error.message);
    })
  }

  // #region Table action functions

  getRoleChangedStatus(role: any) {
    this.role.updateRole(role._id, { isActive: role.isActive }).subscribe((res: any) => {
      if (res.status === 200) {
        this.toastService.success(res.message, 'Role Status');
        this.forceLoadState.setForceLoadModerators(true);
      }
      else {
        this.toastService.info(res.message, 'Role Status');
        role.isActive = !role.isActive;
      }
    }, err => {
      this.toastService.error(err.error.message, 'Role Status');
      role.isActive = !role.isActive;
    })
  }

  roleDeleteConfirmation(roleData: any, index: number) {
    const alertPayload = {
      header: 'Delete Role',
      message: 'Are you sure you want to delete this role?',
      acceptBtnLabel: 'Delete',
      rejectBtnLabel: 'Cancel'
    }
    this.helperService.actionConfirmation(alertPayload, (accepted: any) => {
      if (accepted)
        this.deleteRole(roleData._id, index);
    })
  }

  deleteRole(id: string, index: number) {
    this.role.deleteRole(id).subscribe((res: any) => {
      if (res.status === 200) {
        this.toastService.success(res.message);
        this.roles.splice(index, 1);
        this.table.reset();
        this.forceLoadState.setForceLoadModerators(true);
      }
      else
        this.toastService.error(res.message);
    }, err => {
      this.toastService.error(err.error.message);
    })
  }

  //#endregion

  //#region new / update permission

  getSortedPermissions(modulePermissions: string[]): any[] {
    return sortBySelection(modulePermissions, this.selectedItems);
  }

  getSelectedCount(modulePermissions: string[]): number {
    return countSelectedInModule(modulePermissions, this.selectedItems);
  }

  toggleChip(permission: any): void {
    this.roleForm.permissions = this.roleForm.permissions || [];
    const index = this.selectedItems.indexOf(permission);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
      this.roleForm.permissions.splice(index, 1);
    } else {
      this.selectedItems.push(permission);
      this.roleForm.permissions.push(permission.key);
    }
  }

  isSelected(permission: string): boolean {
    return this.selectedItems.includes(permission);
  }

  process() {
    if (!this.roleForm.name)
      return this.toastService.error('Please enter name');
    else if (!this.roleForm.permissions?.length)
      return this.toastService.error('Please select at least one permission');
    this.isModalForUpdate ? this.updateRole() : this.createRole();
  }

  createRole() {
    this.submitting = true;
    this.loaderMessage = 'Creating role...';
    this.role.createRole(this.roleForm).subscribe((res: any) => {
      this.submitting = false;
      if (res.status === 201) {
        this.toastService.success(res.message);
        this.closeModal(true);
        this.pushNewRoleToList(res.data);
      }
      else
        this.toastService.info(res.message);
    }, err => {
      this.submitting = false;
      this.toastService.error(err.error.message);
    })
  }

  // will push the recently created permission to the list without call the API
  pushNewRoleToList(role: any) {
    this.roles = [...this.roles, role];
    this.forceLoadState.setForceLoadModerators(true);
  }

  updateRole() {
    // this.role.updateRole(this.roleForm).subscribe((res: any) => {
    //   console.log('res : ', res);
    //   if (res.status === 201) {
    //     this.toastService.success(res.message);
    //     this.closeModal(true);
    //   }
    //   else {
    //     this.toastService.info(res.message);
    //   }
    // }, err => {
    //   console.log('err : ', err);
    //   this.toastService.error(err.error.message);
    // })
  }

  clearForm() {
    this.roleForm = {
      name: '',
      description: '',
      permissions: []
    };
    this.selectedItems = [];
  }

  closeModal(clearForm?: boolean) {
    clearForm ? this.clearForm() : '';
    this.showModal = false;
  }

  //#endregion

}

function sortBySelection(
  items: string[],
  selectedItems: string[]
): string[] {
  const selectedSet = new Set(selectedItems);

  return [...items].sort((a, b) => {
    const aSelected = selectedSet.has(a);
    const bSelected = selectedSet.has(b);

    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });
}

function countSelectedInModule(
  moduleItems: string[],
  selectedItems: string[]
): number {
  const selectedSet = new Set(selectedItems);
  return moduleItems.filter(item => selectedSet.has(item)).length;
}