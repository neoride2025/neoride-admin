import { StaffAPIService } from './../../../apis/staff.service';
import { Component, inject, ViewChild } from '@angular/core';
import { PERMISSIONS } from './../../../core/constants/permissions.constants';
import { HelperService } from '../../../services/helper.service';
import { ToastService } from '../../../services/toast.service';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ModalToggleDirective, ModalComponent, ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ModalFooterComponent, FormCheckComponent, FormCheckInputDirective, FormControlDirective, FormDirective, FormLabelDirective, FormSelectDirective } from '@coreui/angular';
import { Badge } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { LoaderComponent } from '../../../global-components/loader/loader.component';
import { SharedModule } from '../../../others/shared.module';

@Component({
  selector: 'app-org-users',
  imports: [
    SharedModule, LoaderComponent, CommonModule,
    TableModule, InputTextModule, MultiSelectModule, ButtonModule, SelectModule, Badge,
    ModalToggleDirective, ModalToggleDirective, ModalComponent, ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ModalFooterComponent,
    FormCheckComponent, FormCheckInputDirective, FormControlDirective, FormDirective, FormLabelDirective, FormSelectDirective
  ],
  templateUrl: './org-users.component.html',
  styleUrl: './org-users.component.scss',
})
export class OrgUsersComponent {

  // injectable dependencies
  helperService = inject(HelperService);
  toastService = inject(ToastService);
  staff = inject(StaffAPIService);

  // common things
  config: any = this.helperService.config;
  userInfo: any = this.helperService.getDataFromSession('userInfo');
  loading = false;
  allowedPermissions = this.userInfo.permissions;
  canDo: any = {
    create: this.allowedPermissions.includes(PERMISSIONS.ADMIN_ORG_USERS_CREATE),
    update: this.allowedPermissions.includes(PERMISSIONS.ADMIN_ORG_USERS_UPDATE),
    delete: this.allowedPermissions.includes(PERMISSIONS.ADMIN_ORG_USERS_DELETE),
    export: this.allowedPermissions.includes(PERMISSIONS.ADMIN_ORG_USERS_EXPORT)
  }

  // table & list
  @ViewChild('dt') table!: Table;
  orgUsers: any[] = [];
  statuses = this.helperService.getStatusItems();

  // modal things
  showModal = false;
  submitting = false;
  isModalForUpdate = false;
  orgUserForm: any = {};

  ngOnInit() {
    this.getOrgUsers();
    this.helperService.closeModalIfOpened(() => {
      this.closeModal(true);
    });
  }

  getOrgUsers() {
    this.loading = true;
    this.staff.getOrgUsers().subscribe((res: any) => {
      this.loading = false;
      if (res.status === 200)
        this.orgUsers = res.data;
      else
        this.toastService.error(res.message);
    }, err => {
      this.loading = false;
      this.toastService.error(err.error.message);
    })
  }

  //#region Table action functions

  statusChange(event: any, orgUser: any) {
    if (!this.canDo.update || orgUser.isSystemUser) {
      event.preventDefault();
      return;
    }
    if (orgUser.isActive)
      this.getOrgUserChangedStatus(event, orgUser);
    else
      this.updateStatus(event, orgUser);
  }

  getOrgUserChangedStatus(event: any, orgUser: any) {
    event.preventDefault();
    const alertPayload = {
      header: 'Organization User Status Update',
      message: 'Are you sure you want to deactivate this User?',
      acceptBtnLabel: 'Deactivate',
      rejectBtnLabel: 'Cancel'
    }
    this.helperService.actionConfirmation(alertPayload, (action: boolean) => {
      if (!action) return;
      this.updateStatus(event, orgUser);
    })
  }

  updateStatus(event: any, orgUser: any) {
    this.staff.updateStaffStatus(orgUser._id, { isActive: !orgUser.isActive }).subscribe((res: any) => {
      if (res.status === 200) {
        this.toastService.success(res.message, 'Organization Status');
        orgUser.isActive = !orgUser.isActive;
      }
      else {
        this.toastService.info(res.message, 'Organization Status');
        event.target.checked = false;
      }
    }, err => {
      this.toastService.error(err.error.message, 'Organization Status');
      event.target.checked = false;
    })
  }

  confirmDelete(staffId: any, index: number) {
    if (!this.canDo.delete) return;
    const alertPayload = {
      header: 'Staff Deletion',
      message: 'This action will log out the assigned user. Do you want to continue?',
      acceptBtnLabel: 'Delete',
      rejectBtnLabel: 'Cancel'
    }
    this.helperService.actionConfirmation(alertPayload, (action: boolean) => {
      if (!action) return;
      this.deleteStaff(staffId, index)
    })
  }

  deleteStaff(staffId: any, index: number) {
    this.staff.deleteStaff(staffId).subscribe((res: any) => {
      if (res.status === 200) {
        this.toastService.success(res.message, 'Staff Deletion');
        this.orgUsers.splice(index, 1); // remove the deleted staff from the list
        this.table.reset(); // reset the table to reflect changes (pagination)
      }
      else
        this.toastService.error(res.message, 'Staff Deletion');
    }, err => {
      this.toastService.error(err.error.message, 'Staff Deletion');
    })
  }

  //#endregion

  //#region new / update staff

  process() {
    this.isModalForUpdate ? this.updateStaff() : this.createStaff();
  }

  createStaff() {
    if (!this.orgUserForm.name)
      return this.toastService.error('Please enter staff name');
    else if (this.orgUserForm.label.length < this.config.nameMinLength)
      return this.toastService.error('Staff name should be minimum 3 characters');
    this.submitting = true;
    this.staff.createStaff(this.orgUserForm).subscribe((res: any) => {
      this.submitting = false;
      if (res.status === 201) {
        this.toastService.success(res.message);
        this.closeModal(true);
        this.pushNewStaffToList(res.data);
      }
      else
        this.toastService.error(res.message);
    }, err => {
      this.submitting = false;
      this.toastService.error(err.error.message);
    })
  }

  // will push the recently created staff to the list without call the API
  pushNewStaffToList(staff: any) {
    this.orgUsers.splice(0, 0, staff); // this will add the new staff to the list;
  }

  updateStaff() {

  }

  clearForm() {
    this.orgUserForm = {};
  }

  closeModal(clearForm?: boolean) {
    clearForm ? this.clearForm() : '';
    this.showModal = false;
  }

  //#endregion
}
