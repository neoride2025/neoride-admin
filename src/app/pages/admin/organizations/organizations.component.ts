import { Component, inject, ViewChild } from '@angular/core';
import { PERMISSIONS } from './../../../core/constants/permissions.constants';
import { HelperService } from '../../../services/helper.service';
import { ToastService } from '../../../services/toast.service';
import { OrganizationAPIService } from '../../../apis/organization.service';
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
import { SortEvent } from 'primeng/api';

@Component({
  selector: 'app-organizations',
  imports: [
    SharedModule, LoaderComponent, CommonModule,
    TableModule, InputTextModule, MultiSelectModule, ButtonModule, SelectModule, Badge,
    ModalToggleDirective, ModalToggleDirective, ModalComponent, ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ModalFooterComponent,
    FormCheckComponent, FormCheckInputDirective, FormControlDirective, FormDirective, FormLabelDirective, FormSelectDirective
  ],
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.scss',
})
export class OrganizationsComponent {

  // injectable dependencies
  helper = inject(HelperService);
  toastService = inject(ToastService);
  organization = inject(OrganizationAPIService);

  // common things
  config: any = this.helper.config;
  userInfo: any = this.helper.getDataFromSession('userInfo');
  loading = false;
  allowedPermissions = this.userInfo.permissions;
  canDo: any = {
    create: this.allowedPermissions.includes(PERMISSIONS.ADMIN_ORGANIZATIONS_CREATE),
    update: this.allowedPermissions.includes(PERMISSIONS.ADMIN_ORGANIZATIONS_UPDATE),
    delete: this.allowedPermissions.includes(PERMISSIONS.ADMIN_ORGANIZATIONS_DELETE),
    export: this.allowedPermissions.includes(PERMISSIONS.ADMIN_ORGANIZATIONS_EXPORT)
  }

  // table & list
  @ViewChild('dt') table!: Table;
  organizations: any[] = [];
  statuses = this.helper.getStatusItems();
  isSorted: any = null;
  initialValue: any[] = [];

  // new / update organization
  showModal = false;
  submitting = false;
  isModalForUpdate = false;
  organizationForm: any = {};

  ngOnInit() {
    this.getOrganizations();
    this.helper.closeModalIfOpened(() => {
      this.closeModal(true);
    });
  }

  getOrganizations() {
    this.loading = true;
    this.organization.getOrganizations().subscribe((res: any) => {
      this.loading = false;
      if (res.status === 200) {
        this.organizations = res.data;
        this.initialValue = [...this.organizations];
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
      this.organizations = [...this.initialValue];
      this.table.reset();
    }
  }

  sortTableData(event: any) {
    const field = event.field;
    event.data.sort((data1: { [x: string]: any; }, data2: { [x: string]: any; }) => {
      const value1 = this.helper.resolveFieldData(data1, field);
      const value2 = this.helper.resolveFieldData(data2, field);
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

  statusChange(event: any, organization: any) {
    if (!this.canDo.update || organization.isSystemUser) {
      event.preventDefault();
      return;
    }
    if (organization.isActive)
      this.getOrganizationChangedStatus(event, organization);
    else
      this.updateStatus(event, organization);
  }

  getOrganizationChangedStatus(event: any, organization: any) {
    event.preventDefault();
    const alertPayload = {
      header: 'Organization Status Update',
      message: 'Are you sure you want to deactivate this organization?',
      acceptBtnLabel: 'Deactivate',
      rejectBtnLabel: 'Cancel'
    }
    this.helper.actionConfirmation(alertPayload, (action: boolean) => {
      if (!action) return;
      this.updateStatus(event, organization);
    })
  }

  updateStatus(event: any, organization: any) {
    this.organization.updateOrganizationStatus(organization._id, { isActive: !organization.isActive }).subscribe((res: any) => {
      if (res.status === 200) {
        this.toastService.success(res.message, 'Organization Status');
        organization.isActive = !organization.isActive;
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

  confirmDelete(organizationId: any, index: number) {
    if (!this.canDo.delete) return;
    const alertPayload = {
      header: 'Organization Deletion',
      message: 'This action will delete all staffs under this organization. Are you sure you want to proceed?',
      acceptBtnLabel: 'Delete',
      rejectBtnLabel: 'Cancel'
    }
    this.helper.actionConfirmation(alertPayload, (action: boolean) => {
      if (!action) return;
      this.deleteOrganization(organizationId, index)
    })
  }

  deleteOrganization(organizationId: any, index: number) {
    this.organization.deleteOrganization(organizationId).subscribe((res: any) => {
      if (res.status === 200) {
        this.toastService.success(res.message, 'Organization Deletion');
        this.organizations.splice(index, 1); // remove the deleted organization from the list
        this.table.reset(); // reset the table to reflect changes (pagination)
      }
      else
        this.toastService.error(res.message, 'Organization Deletion');
    }, err => {
      this.toastService.error(err.error.message, 'Organization Deletion');
    })
  }

  //#endregion


  //#region new / update organization

  process() {
    this.isModalForUpdate ? this.updateOrganization() : this.createOrganization();
  }

  createOrganization() {
    if (!this.organizationForm.name)
      return this.toastService.error('Please enter organization name');
    else if (this.organizationForm.label.length < this.config.nameMinLength)
      return this.toastService.error('Organization name should be minimum 3 characters');
    this.submitting = true;
    this.organization.createOrganization(this.organizationForm).subscribe((res: any) => {
      this.submitting = false;
      if (res.status === 201) {
        this.toastService.success(res.message);
        this.closeModal(true);
        this.pushNewOrganizationToList(res.data);
      }
      else
        this.toastService.error(res.message);
    }, err => {
      this.submitting = false;
      this.toastService.error(err.error.message);
    })
  }

  // will push the recently created organization to the list without call the API
  pushNewOrganizationToList(organization: any) {
    this.organizations.splice(0, 0, organization); // this will add the new organization to the list;
  }

  updateOrganization() {

  }

  clearForm() {
    this.organizationForm = {};
  }

  closeModal(clearForm?: boolean) {
    clearForm ? this.clearForm() : '';
    this.showModal = false;
  }

  //#endregion
}
