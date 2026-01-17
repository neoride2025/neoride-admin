import { NavigationAPIService } from './../../../apis/navigation.service';
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
import { SharedModule } from '../../../others/shared.module';
import { LoaderComponent } from '../../../global-components/loader/loader.component';
import { HelperService } from '../../../services/helper.service';
import { ToastService } from '../../../services/toast.service';
import { SortEvent } from 'primeng/api';

@Component({
  selector: 'app-navigation',
  imports: [
    SharedModule, LoaderComponent, CommonModule,
    TableModule, InputTextModule, MultiSelectModule, ButtonModule, SelectModule, Badge,
    ModalToggleDirective, ModalToggleDirective, ModalComponent, ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ModalFooterComponent,
    FormCheckComponent, FormCheckInputDirective, FormControlDirective, FormDirective, FormLabelDirective, FormSelectDirective
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NavigationComponent {

  // injectable dependencies
  private helperService = inject(HelperService);
  private toastService = inject(ToastService);
  private navigation = inject(NavigationAPIService);

  // common things
  config: any = this.helperService.config;
  userInfo: any = this.helperService.getDataFromSession('userInfo');
  loading = false;
  allowedPermissions = this.userInfo.permissions;
  canDo: any = {
    create: this.allowedPermissions.includes(PERMISSIONS.ADMIN_NAVIGATION_CREATE),
    update: this.allowedPermissions.includes(PERMISSIONS.ADMIN_NAVIGATION_UPDATE),
    delete: this.allowedPermissions.includes(PERMISSIONS.ADMIN_NAVIGATION_DELETE),
    export: this.allowedPermissions.includes(PERMISSIONS.ADMIN_NAVIGATION_EXPORT)
  }

  // table & list
  @ViewChild('dt') table!: Table;
  navigationItems: any[] = [];
  statuses = this.helperService.getStatusItems();
  isSorted: any = null;
  initialValue: any[] = [];

  // new / update navigation
  showModal = false;
  submitting = false;
  isModalForUpdate = false;
  navigationForm: any = {};

  ngOnInit() {
    this.getNavigationItems();
    this.helperService.closeModalIfOpened(() => {
      this.closeModal(true);
    });
  }

  getNavigationItems() {
    this.loading = true;
    this.navigation.getNavigationItems().subscribe((res: any) => {
      this.loading = false;
      if (res.status === 200) {
        this.navigationItems = res.data;
        this.initialValue = [...this.navigationItems];
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
      this.navigationItems = [...this.initialValue];
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

  updateStatus(event: any, navigation: any) {
    if (!this.canDo.update) {
      event.preventDefault();
      return;
    }
    this.navigation.updateNavigationStatus(navigation._id, { isActive: !navigation.isActive }).subscribe((res: any) => {
      if (res.status === 200)
        this.toastService.success(res.message, 'Navigation Status');
      else {
        this.toastService.info(res.message, 'Navigation Status');
        navigation.isActive = !navigation.isActive;
      }
    }, err => {
      this.toastService.error(err.error.message, 'Navigation Status');
      navigation.isActive = !navigation.isActive;
    })
  }

  confirmDelete(navigationId: any, index: number) {
    if (!this.canDo.delete) return;
    const alertPayload = {
      header: 'Navigation Deletion',
      message: 'Are you sure you want to delete this navigation item?',
      acceptBtnLabel: 'Delete',
      rejectBtnLabel: 'Cancel'
    }
    this.helperService.actionConfirmation(alertPayload, (action: boolean) => {
      if (!action) return;
      this.deleteNavigation(navigationId, index);
    })
  }

  deleteNavigation(navigationId: any, index: number) {
    this.navigation.deleteNavigation(navigationId).subscribe((res: any) => {
      if (res.status === 200) {
        this.toastService.success(res.message, 'Navigation Deletion');
        this.navigationItems.splice(index, 1); // remove the deleted navigation from the list
        this.table.reset(); // reset the table to reflect changes (pagination)
      }
      else
        this.toastService.error(res.message, 'Navigation Deletion');
    }, err => {
      this.toastService.error(err.error.message, 'Navigation Deletion');
    })
  }

  //#endregion

  //#region new / update navigation

  process() {
    this.isModalForUpdate ? this.updateNavigation() : this.createNavigation();
  }

  createNavigation() {
    if (!this.navigationForm.label)
      return this.toastService.error('Please enter navigation title');
    else if (this.navigationForm.label.length < this.config.nameMinLength)
      return this.toastService.error('Navigation title should be minimum 3 characters');
    this.submitting = true;
    this.navigation.createNavigation(this.navigationForm).subscribe((res: any) => {
      this.submitting = false;
      if (res.status === 201) {
        this.toastService.success(res.message);
        this.closeModal(true);
        this.pushNewNavigationToList(res.data);
      }
      else
        this.toastService.error(res.message);
    }, err => {
      this.submitting = false;
      this.toastService.error(err.error.message);
    })
  }

  // will push the recently created navigation to the list without call the API
  pushNewNavigationToList(navigation: any) {
    this.navigationItems.splice(0, 0, navigation); // this will add the new navigation to the list;
  }


  updateNavigation() {

  }

  clearForm() {
    this.navigationForm = {};
  }

  closeModal(clearForm?: boolean) {
    clearForm ? this.clearForm() : '';
    this.showModal = false;
  }

  //#endregion

}
