import { GlobalAPIService } from './../../apis/global.service';
import { Component, inject, ViewChild } from '@angular/core';
import { HelperService } from '../../services/helper.service';
import { ToastService } from '../../services/toast.service';
import { SharedModule } from '../../others/shared.module';
import { ModeratorAPIService } from '../../apis/moderator.service';
import { CommonModule, DatePipe } from '@angular/common';
import { RoleAPIService } from '../../apis/role.service';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';

import {
  FormCheckComponent,
  FormCheckInputDirective,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
  FormSelectDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  ModalToggleDirective
} from '@coreui/angular';
import { LoaderComponent } from '../../global-components/loader/loader.component';
import { Badge } from 'primeng/badge';
import { ForceLoadState } from '../../signals/force-load.state';

@Component({
  selector: 'app-moderators',
  imports: [
    SharedModule, DatePipe, LoaderComponent, CommonModule,
    TableModule, InputTextModule, MultiSelectModule, ButtonModule, SelectModule, Badge,
    FormCheckComponent, FormCheckInputDirective, FormControlDirective, FormDirective, FormLabelDirective, FormSelectDirective,
    ModalToggleDirective, ModalToggleDirective, ModalComponent, ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ModalFooterComponent,
  ],
  templateUrl: './moderators.component.html',
  styleUrl: './moderators.component.scss',
})
export class ModeratorsComponent {

  // injectable dependencies
  helperService = inject(HelperService);
  toastService = inject(ToastService);
  moderator = inject(ModeratorAPIService);
  role = inject(RoleAPIService);
  global = inject(GlobalAPIService);
  forceLoadState = inject(ForceLoadState);

  // common things
  config: any = this.helperService.config;
  userInfo: any = this.helperService.getDataFromSession('userInfo');
  loading = false;
  loaderMessage = '';
  forceLoadModerators = this.forceLoadState.forceLoadModerators;

  // table & list
  @ViewChild('dt') table!: Table;
  moderators: any[] = [];
  statuses = [{ name: 'Active', value: 1 }, { name: 'Inactive', value: 0 }];

  // new / update permission
  isModalForUpdate = false;
  roles: any[] = [];
  showModal = false;
  submitting = false;
  moderatorForm: any = {};

  ngOnInit() {
    this.getModeratorsComponentData();
    this.helperService.closeModalIfOpened(() => {
      this.closeModal(true);
    });
  }

  getModeratorsComponentData() {
    this.roles = this.moderators = [];
    this.loading = true;
    this.loaderMessage = 'Loading Moderators...';
    this.global.getModeratorsComponentData(this.forceLoadModerators()).subscribe((res: any) => {
      this.loading = false;
      if (res.status === 200) {
        this.roles = res.data.roles;
        this.moderators = res.data.moderators;
        this.forceLoadModerators() ? this.forceLoadState.clearModeratorsForceLoad() : '';
      }
      else
        this.toastService.error(res.message, 'Roles & Moderators');
    }, err => {
      this.loading = false;
      this.toastService.error(err.error.message);
    })
  }

  // #region Table action functions

  getModeratorChangedStatus(moderator: any) {
    this.moderator.updateModerator(moderator._id, { isActive: moderator.isActive }).subscribe((res: any) => {
      if (res.status === 200) {
        this.toastService.success(res.message, 'Moderator Status');
        this.forceLoadState.setForceLoadRoles(true);
        this.forceLoadState.setForceLoadModules(true);
        this.forceLoadState.setForceLoadPermissions(true);
      }
      else {
        this.toastService.info(res.message, 'Moderator Status');
        moderator.isActive = !moderator.isActive;
      }
    }, err => {
      this.toastService.error(err.error.message, 'Moderator Status');
      moderator.isActive = !moderator.isActive;
    })
  }

  moderatorDeleteConfirmation(moderatorData: any, index: number) {
    const alertPayload = {
      header: 'Delete Moderator',
      message: 'Are you sure you want to delete this role?',
      acceptBtnLabel: 'Delete',
      rejectBtnLabel: 'Cancel'
    }
    this.helperService.actionConfirmation(alertPayload, (accepted: any) => {
      if (accepted)
        this.deleteModerator(moderatorData._id, index);
    })
  }

  deleteModerator(id: string, index: number) {
    this.moderator.deleteModerator(id).subscribe((res: any) => {
      if (res.status === 200) {
        this.toastService.success(res.message);
        this.moderators.splice(index, 1);
        this.table.reset();
        this.forceLoadState.setForceLoadRoles(true);
        this.forceLoadState.setForceLoadModules(true);
        this.forceLoadState.setForceLoadPermissions(true);
      }
      else
        this.toastService.error(res.message);
    }, err => {
      this.toastService.error(err.error.message);
    })
  }

  // #endregion

  // #region new / update permission

  // function to copy the password to clipboard
  copyPassword() {
    const el = document.createElement('input');
    el.value = this.moderatorForm.password;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.toastService.info('Password copied to clipboard', 'Copy Password');
  }

  generateNewPassword() {
    this.moderatorForm.password = this.helperService.generatePassword();
  }

  process() {
    this.isModalForUpdate ? this.updateModerator() : this.createModerator();
  }

  validateForm() {
    if (!this.moderatorForm.name)
      return this.toastService.error('Please enter moderator name', 'Create Moderator');
    else if (!this.moderatorForm.email)
      return this.toastService.error('Please enter email', 'Create Moderator');
    else if (!this.helperService.validateEmail(this.moderatorForm.email))
      return this.toastService.error('Please enter valid email', 'Create Moderator');
    else if (!this.moderatorForm.password)
      return this.toastService.error('Please enter password', 'Create Moderator');
    else if (this.moderatorForm.password.length < 6)
      return this.toastService.error('Password should be minimum 6 characters', 'Create Moderator');
    else if (!this.moderatorForm.role)
      return this.toastService.error('Please select role', 'Create Moderator');
    return true;
  }

  createModerator() {
    const isFormValid = this.validateForm();
    if (!isFormValid) return;
    if (this.moderatorForm.mobile)
      this.moderatorForm.mobile = this.moderatorForm.mobile.toString(); // convert mobile number to string
    this.submitting = true;
    this.loaderMessage = 'Creating moderator...';
    this.moderator.createModerator(this.moderatorForm).subscribe((res: any) => {
      this.submitting = false;
      if (res.status === 201) {
        this.toastService.success(res.message);
        this.closeModal(true);
        this.pushNewModuleToList(res.data);
      }
      else
        this.toastService.info(res.message);
    }, err => {
      this.submitting = false;
      this.toastService.error(err.error.message);
    })
  }

  // will push the recently created permission to the list without call the API
  pushNewModuleToList(permission: any) {
    this.moderators.push(permission);
  }

  updateModerator() {
    this.forceLoadState.setForceLoadRoles(true);
    this.forceLoadState.setForceLoadModules(true);
    this.forceLoadState.setForceLoadPermissions(true);
  }

  clearForm() {
    this.moderatorForm = {};
  }

  closeModal(clearForm?: boolean) {
    clearForm ? this.clearForm() : '';
    this.showModal = false;
  }


  // #endregion

}
