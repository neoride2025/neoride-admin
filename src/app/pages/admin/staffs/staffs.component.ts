import { StaffAPIService } from 'src/app/apis/staff.service';
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
import { SharedModule } from 'src/app/others/shared.module';
import { LoaderComponent } from 'src/app/global-components/loader/loader.component';
import { HelperService } from 'src/app/services/helper.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-staffs',
  imports: [
    SharedModule, LoaderComponent, CommonModule,
    TableModule, InputTextModule, MultiSelectModule, ButtonModule, SelectModule, Badge,
    ModalToggleDirective, ModalToggleDirective, ModalComponent, ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ModalFooterComponent,
    FormCheckComponent, FormCheckInputDirective, FormControlDirective, FormDirective, FormLabelDirective, FormSelectDirective
  ],
  templateUrl: './staffs.component.html',
  styleUrl: './staffs.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class StaffsComponent {

  // injectable dependencies
  helperService = inject(HelperService);
  toastService = inject(ToastService);
  staff = inject(StaffAPIService)

  // common things
  config: any = this.helperService.config;
  userInfo: any = this.helperService.getDataFromSession('userInfo');
  loading = false;
  allowedPermissions = this.userInfo.permissions;
  canDo: any = {
    create: this.allowedPermissions.includes(PERMISSIONS.ADMIN_STAFFS_CREATE),
    update: this.allowedPermissions.includes(PERMISSIONS.ADMIN_STAFFS_UPDATE),
    delete: this.allowedPermissions.includes(PERMISSIONS.ADMIN_STAFFS_DELETE),
    export: this.allowedPermissions.includes(PERMISSIONS.ADMIN_STAFFS_EXPORT)
  }

  // table & list
  @ViewChild('dt') table!: Table;
  staffs: any[] = [];
  statuses = this.helperService.getStatusItems();

  // new / update staff
  showModal = false;
  submitting = false;
  isModalForUpdate = false;
  staffForm: any = {};

  ngOnInit() {
    this.getStaffs();
    this.helperService.closeModalIfOpened(() => {
      this.closeModal(true);
    });
  }

  getStaffs() {
    this.loading = true;
    this.staff.getStaffs().subscribe((res: any) => {
      this.loading = false;
      if (res.status === 200)
        this.staffs = res.data;
      else
        this.toastService.error(res.message);
    }, err => {
      this.loading = false;
      this.toastService.error(err.error.message);
    })
  }

  //#region Table action functions

  statusChange(event: any, staff: any) {
    if (!this.canDo.update || staff.isSystemUser) {
      event.preventDefault();
      return;
    }
    if (staff.isActive)
      this.getStaffChangedStatus(event, staff);
    else
      this.updateStatus(event, staff);
  }

  getStaffChangedStatus(event: any, staff: any) {
    event.preventDefault();
    const alertPayload = {
      header: 'Staff Status Update',
      message: 'Are you sure you want to deactivate this staff?',
      acceptBtnLabel: 'Deactivate',
      rejectBtnLabel: 'Cancel'
    }
    this.helperService.actionConfirmation(alertPayload, (action: boolean) => {
      if (!action) return;
      this.updateStatus(event, staff);
    })
  }

  updateStatus(event: any, staff: any) {
    this.staff.updateStaffStatus(staff._id, { isActive: !staff.isActive }).subscribe((res: any) => {
      if (res.status === 200) {
        this.toastService.success(res.message, 'Staff Status');
        staff.isActive = !staff.isActive;
      }
      else {
        this.toastService.info(res.message, 'Staff Status');
        event.target.checked = false;
      }
    }, err => {
      this.toastService.error(err.error.message, 'Staff Status');
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
        this.staffs.splice(index, 1); // remove the deleted staff from the list
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
    if (!this.staffForm.name)
      return this.toastService.error('Please enter staff name');
    else if (this.staffForm.label.length < this.config.nameMinLength)
      return this.toastService.error('Staff name should be minimum 3 characters');
    this.submitting = true;
    this.staff.createStaff(this.staffForm).subscribe((res: any) => {
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
    this.staffs.splice(0, 0, staff); // this will add the new staff to the list;
  }

  updateStaff() {

  }

  clearForm() {
    this.staffForm = {};
  }

  closeModal(clearForm?: boolean) {
    clearForm ? this.clearForm() : '';
    this.showModal = false;
  }

  //#endregion
}

