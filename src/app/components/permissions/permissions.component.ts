import { SharedModule } from './../../others/shared.module';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, ViewChild } from '@angular/core';
import { TableModule, PaginationModule, PageItemDirective, PageLinkDirective, PaginationComponent, ButtonDirective, ModalToggleDirective, ModalTitleDirective, ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent, FormCheckLabelDirective, FormLabelDirective, FormDirective, FormControlDirective, FormSelectDirective, FormCheckComponent, FormCheckInputDirective, BadgeComponent } from '@coreui/angular';
import { HelperService } from '../../services/helper.service';
import { ToastService } from '../../services/toast.service';
import { PermissionAPIService } from '../../apis/permission.service';
import { ModuleAPIService } from '../../apis/module.service';
import { ModuleState } from '../../../signals/module-state';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-permissions',
  imports: [SharedModule, TableModule, PaginationModule, PageItemDirective, PageLinkDirective, PaginationComponent, ButtonDirective, ModalToggleDirective, ModalToggleDirective, ModalComponent,BadgeComponent,
    ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ModalFooterComponent, FormControlDirective, FormCheckComponent, FormCheckInputDirective, FormDirective, FormSelectDirective, FormLabelDirective, DatePipe],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PermissionsComponent {

  // injectable dependencies
  helperService = inject(HelperService);
  toastService = inject(ToastService);
  permission = inject(PermissionAPIService);
  module = inject(ModuleAPIService);
  moduleState = inject(ModuleState)

  // common things
  config: any = this.helperService.config;
  userInfo: any = this.helperService.getDataFromSession('userInfo');
  loading = false;
  loaderMessage = '';

  // table & list
  permissions: any[] = [];
  paginatedData: any[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  // new / update permission
  showModal = false;
  submitting = false;
  isModalForUpdate = false;
  modules = this.moduleState.module; // will get modules from modules component through signal
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

  getModules() {
    this.module.getAllModules().subscribe((res: any) => {
      if (res.status === 200) {
        this.modules = res.data;
      }
    })
  }

  getPermissions() {
    this.permissions = [];
    this.loading = true;
    this.loaderMessage = 'Loading permissions...';
    this.permission.getAllPermissions().subscribe((res: any) => {
      this.loading = false;
      if (res.status === 200) {
        this.permissions = res.data;
        this.preparePermissions();
      }
      else
        this.toastService.error(res.message);
    }, err => {
      this.loading = false;
      this.toastService.error(err.error.message);
    })
  }

  preparePermissions() {
    this.totalPages = Math.ceil(this.permissions.length / this.pageSize);
    this.updatePagination();
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.permissions.slice(start, end);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  get pagesArray() {
    return Array.from({ length: this.totalPages });
  }

  //#region Table action functions

  onCheckboxChange(permission: any) {
    permission.isActive = !permission.isActive;
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
    this.loaderMessage = 'Creating permission...';
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
      console.log('err : ', err);
      this.submitting = false;
      this.toastService.error(err.error.message);
    })
  }

  // will push the recently created permission to the list without call the API
  pushNewModuleToList(permission: any) {
    this.permissions.push(permission);
    this.preparePermissions();
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