import { PermissionAPIService } from './../../apis/permission.service';
import { SharedModule } from './../../others/shared.module';
import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, untracked } from '@angular/core';
import { FormDirective, FormControlDirective, FormLabelDirective, ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent, ModalTitleDirective, ModalToggleDirective, FormCheckComponent, FormCheckInputDirective, FormSelectDirective } from '@coreui/angular';
import { HelperService } from '../../services/helper.service';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../global-components/loader/loader.component';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { ToggleButton } from 'primeng/togglebutton';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Badge } from 'primeng/badge';
import { GlobalAPIService } from '../../apis/global.service';
import { ForceLoadState } from '../../signals/force-load.state';

@Component({
  selector: 'app-permissions',
  imports: [
    SharedModule, LoaderComponent, CommonModule,
    TableModule, InputTextModule, MultiSelectModule, ButtonModule, SelectModule, ToggleButton, Badge,
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
  global = inject(GlobalAPIService);
  forceLoadState = inject(ForceLoadState);

  // common things
  config: any = this.helperService.config;
  userInfo: any = this.helperService.getDataFromSession('userInfo');
  loading = false;
  loaderMessage = '';
  forceLoadPermissions = this.forceLoadState.forceLoadPermissions;

  // table & list
  permissions: any[] = [];
  moderators: any[] = [];
  statuses = this.helperService.getStatusItems();
  private initialized = false;

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

  constructor() {
    effect(() => {
      if (!this.initialized && this.forceLoadPermissions()) {
        this.getPermissionsComponentData();
      }
    });
  }


  ngOnInit() {
    this.initialized = true;
    this.getPermissionsComponentData();
    this.helperService.closeModalIfOpened(() => {
      this.closeModal(true);
    });
  }

  getPermissionsComponentData() {
    // this.moderators = this.permissions = [];
    this.loading = true;
    this.loaderMessage = 'Loading Permissions...';
    this.global.getPermissionsComponentData(this.forceLoadPermissions()).subscribe((res: any) => {
      this.loading = this.initialized = false;
      if (res.status === 200) {
        this.moderators = res.data.moderators;
        this.permissions = res.data.permissions;
        this.modules = res.data.modules;
        this.forceLoadPermissions() ? this.forceLoadState.clearPermissionsForceLoad() : '';
      }
      else
        this.toastService.error(res.message);
    }, err => {
      this.loading = this.initialized = false;
      this.toastService.error(err.error.message);
    })
  }

  //#region Table action functions

  getPermissionChangedStatus(permission: any) {
    this.permission.updatePermission(permission._id, { isActive: permission.isActive }).subscribe((res: any) => {
      if (res.status === 200)
        this.toastService.success(res.message, 'Permission Status');
      else {
        this.toastService.info(res.message, 'Permission Status');
        permission.isActive = !permission.isActive;
      }
    }, err => {
      this.toastService.error(err.error.message, 'Permission Status');
      permission.isActive = !permission.isActive;
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